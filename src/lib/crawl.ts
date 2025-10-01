// lib/crawl.ts - IMPROVED VERSION FOR DYNAMIC SITES
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
  concurrency = 5, // Reduced for stability with dynamic content
  timeout = 45000  // Increased timeout
}: CrawlOptions) {
  const visited = new Set<string>();
  const queue: string[] = [root];
  const out: { url: string; title: string; content: string }[] = [];
  const rootHost = new URL(root).host;

  console.log('🚀 Launching browser for dynamic site...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled', // Hide automation
    ]
  });

  const pagePool: Page[] = [];
  for (let i = 0; i < concurrency; i++) {
    const page = await browser.newPage();
    
    // Better headers for dynamic sites
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
    
    pagePool.push(page);
  }

  const limit = pLimit(concurrency);

  const crawlUrl = async (url: string, page: Page) => {
    try {
      console.log(`🔍 Fetching: ${url}`);
      
      // Navigate with longer timeout
      await page.goto(url, { 
        waitUntil: 'networkidle0', // Wait for ALL network activity
        timeout 
      });

      // CRITICAL: Wait for dynamic content to load
      await page.waitForSelector('body', { timeout: 10000 });
      
      // Extra wait for React hydration
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try to wait for main content container (adjust selector for your site)
      try {
        await page.waitForSelector('main, #__next, [role="main"], article', { 
          timeout: 5000 
        });
      } catch {
        console.log('   ⚠️ Main content selector not found, continuing anyway');
      }

      const title = await page.title();
      
      // Extract text from the fully rendered page
      const html = await page.content();
      const text = extractMainContent(html);

      console.log(`   📄 Title: ${title}`);
      console.log(`   📝 Content: ${text.length} chars`);

      // More lenient content check for dynamic sites
      if (text.length > 50) {  // Lowered threshold
        out.push({ url, title, content: text });
        console.log(`   ✅ Added to results (${out.length}/${maxPages})`);
      } else {
        console.log(`   ⚠️ Content too short (${text.length} chars), skipping`);
      }

      // Extract links from rendered page
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => (a as HTMLAnchorElement).href)
          .filter(href => href && !href.startsWith('mailto:') && !href.startsWith('tel:'));
      });

      console.log(`   🔗 Found ${links.length} potential links`);

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

  while (queue.length > 0 && out.length < maxPages) {
    const batch = queue.splice(0, concurrency).filter(url => !visited.has(url));
    
    if (batch.length === 0) continue;

    batch.forEach(url => visited.add(url));

    const tasks = batch.map((url, i) => 
      limit(() => crawlUrl(url, pagePool[i % pagePool.length]))
    );

    await Promise.all(tasks);
    
    console.log(`\n📊 Progress: ${out.length}/${maxPages} pages | Queue: ${queue.length} | Visited: ${visited.size}\n`);
  }

  for (const page of pagePool) {
    await page.close();
  }
  await browser.close();
  
  console.log(`\n✅ Crawl complete: ${out.length} pages`);
  return out;
}