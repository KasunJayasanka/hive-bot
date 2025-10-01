import puppeteer, { Page } from "puppeteer";
import pLimit from "p-limit";

type CrawlOptions = {
  root: string;
  maxPages?: number;
  sameHostOnly?: boolean;
  concurrency?: number;
  timeout?: number;
};

function extractMainContent(html: string): string {
  const text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
  
  return text;
}

export async function crawlSite({ 
  root, 
  maxPages = 100, 
  sameHostOnly = true,
  concurrency = 10, // Increased from 2
  timeout = 30000 
}: CrawlOptions) {
  const visited = new Set<string>();
  const queue: string[] = [root];
  const out: { url: string; title: string; content: string }[] = [];
  const rootHost = new URL(root).host;

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Helps with memory
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // Can help with stability
    ]
  });

  // Create a connection pool of pages
  const pagePool: Page[] = [];
  for (let i = 0; i < concurrency; i++) {
    pagePool.push(await browser.newPage());
  }

  const limit = pLimit(concurrency);

  const crawlUrl = async (url: string, page: Page) => {
    try {
      console.log(`🔍 Fetching: ${url}`);
      
      await page.setUserAgent('Mozilla/5.0 (compatible; hive-bot/1.0)');
      
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout 
      });

      const title = await page.title();
      const html = await page.content();
      const text = extractMainContent(html);

      console.log(`   📄 Title: ${title}`);
      console.log(`   📝 Content: ${text.length} chars`);

      if (text.length > 100) {
        out.push({ url, title, content: text });
        console.log(`   ✅ Added to results (${out.length}/${maxPages})`);
      } else {
        console.log(`   ⚠️ Content too short, skipping`);
      }

      // Extract and filter links
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => (a as HTMLAnchorElement).href)
          .filter(href => href && !href.startsWith('mailto:') && !href.startsWith('tel:'));
      });

      console.log(`   🔗 Found ${links.length} potential links`);

      // Filter valid links
      const validLinks = links.filter(link => {
        try {
          const linkUrl = new URL(link);
          
          if (link.match(/\.(pdf|jpg|jpeg|png|gif|zip|exe|dmg)$/i)) {
            return false;
          }
          
          if (sameHostOnly && linkUrl.host !== rootHost) {
            return false;
          }
          
          return !visited.has(link) && !queue.includes(link);
        } catch {
          return false;
        }
      });

      // Add new links to queue
      for (const link of validLinks) {
        if (visited.size + queue.length < maxPages) {
          queue.push(link);
        }
      }

      console.log(`   ✓ ${validLinks.length} new links queued (Queue: ${queue.length})`);

    } catch (err) {
      console.log(`   ❌ Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  // Process queue in batches
  while (queue.length > 0 && out.length < maxPages) {
    // Take batch from queue
    const batch = queue.splice(0, concurrency).filter(url => !visited.has(url));
    
    if (batch.length === 0) continue;

    // Mark as visited
    batch.forEach(url => visited.add(url));

    // Process batch concurrently
    const tasks = batch.map((url, i) => 
      limit(() => crawlUrl(url, pagePool[i % pagePool.length]))
    );

    await Promise.all(tasks);
    
    console.log(`\n📊 Progress: ${out.length}/${maxPages} pages | Queue: ${queue.length} | Visited: ${visited.size}\n`);
  }

  // Cleanup
  for (const page of pagePool) {
    await page.close();
  }
  await browser.close();
  
  console.log(`\n✅ Crawl complete: ${out.length} pages`);
  return out;
}