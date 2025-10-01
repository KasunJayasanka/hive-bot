// app/api/rag/ingest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { embedTexts } from "@/lib/embeddings";
import { crawlSite } from "@/lib/crawl";
import { chunkText, cleanText } from "@/lib/chunk";

export async function POST(req: NextRequest) {
  try {
    const { url, action = "crawl" } = await req.json();

    if (!url && action !== "regenerate") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Option 1: Re-generate embeddings for existing documents
    if (action === "regenerate") {
      console.log("🔄 Regenerating embeddings for existing documents...");
      
      const { data: existingDocs, error: fetchError } = await supabaseAdmin
        .from("documents")
        .select("id, content")
        .is("embedding", null);

      if (fetchError) throw fetchError;

      if (!existingDocs || existingDocs.length === 0) {
        return NextResponse.json({
          message: "No documents need embedding regeneration",
          processed: 0,
        });
      }

      console.log(`📋 Found ${existingDocs.length} documents without embeddings`);

      let processed = 0;
      for (const doc of existingDocs) {
        const [embedding] = await embedTexts([doc.content]);
        
        const { error: updateError } = await supabaseAdmin
          .from("documents")
          .update({ embedding })
          .eq("id", doc.id);

        if (updateError) {
          console.error(`❌ Failed to update doc ${doc.id}:`, updateError);
        } else {
          processed++;
          console.log(`✅ Updated embedding for doc ${doc.id} (${processed}/${existingDocs.length})`);
        }
      }

      return NextResponse.json({
        message: "Embeddings regenerated successfully",
        processed,
        total: existingDocs.length,
      });
    }

    // Option 2: Crawl and ingest new content
    console.log("🕷️ Starting crawl for:", url);
    const pages = await crawlSite({
      root: url,
      maxPages: 100,
      sameHostOnly: true,
    });

    console.log(`📄 Crawled ${pages.length} pages`);

    if (pages.length === 0) {
      return NextResponse.json({
        error: "No pages found. Check if the URL is correct and accessible.",
      }, { status: 400 });
    }

    let totalChunks = 0;
    type DebugEntry =
      | { url: string; status: "skipped"; reason: string; contentLength: number }
      | { url: string; status: "no chunks"; contentLength: number }
      | { url: string; status: "error"; error: string }
      | { url: string; status: "success"; chunks: number; contentLength: number };

    const debugInfo: DebugEntry[] = [];

    for (const page of pages) {
      console.log(`\n📝 Processing: ${page.url}`);
      console.log(`   Raw content length: ${page.content.length} chars`);
      
      const cleaned = cleanText(page.content);
      console.log(`   Cleaned content length: ${cleaned.length} chars`);
      console.log(`   First 200 chars: ${cleaned.slice(0, 200)}`);

      // Skip if content is too short
      if (cleaned.length < 50) {
        console.log(`   ⚠️ Skipping - content too short`);
        debugInfo.push({
          url: page.url,
          status: "skipped",
          reason: "content too short",
          contentLength: cleaned.length,
        });
        continue;
      }

      const chunks = chunkText(cleaned, 1000, 150);
      console.log(`   Chunks created: ${chunks.length}`);

      if (chunks.length === 0) {
        debugInfo.push({
          url: page.url,
          status: "no chunks",
          contentLength: cleaned.length,
        });
        continue;
      }

      // Generate embeddings for all chunks
      console.log(`   🧮 Generating embeddings...`);
      const embeddings = await embedTexts(chunks);
      console.log(`   ✅ Generated ${embeddings.length} embeddings`);

      // Delete existing documents for this URL before inserting new ones
      console.log(`   🗑️ Removing old entries for ${page.url}...`);
      const { error: deleteError } = await supabaseAdmin
        .from("documents")
        .delete()
        .eq("url", page.url);

      if (deleteError) {
        console.error(`❌ Delete error for ${page.url}:`, deleteError);
      }

      // Insert new records
      const records = chunks.map((chunk, i) => ({
        url: page.url,
        title: page.title,
        content: chunk,
        embedding: embeddings[i],
      }));

      const { error: insertError } = await supabaseAdmin
        .from("documents")
        .insert(records);

      if (insertError) {
        console.error(`❌ Insert error for ${page.url}:`, insertError);
        debugInfo.push({
          url: page.url,
          status: "error",
          error: insertError.message,
        });
        continue;
      }

      totalChunks += chunks.length;
      console.log(`✅ Inserted ${chunks.length} chunks for ${page.url}`);
      
      debugInfo.push({
        url: page.url,
        status: "success",
        chunks: chunks.length,
        contentLength: cleaned.length,
      });
    }

    return NextResponse.json({
      message: totalChunks > 0 ? "Ingestion complete" : "No content extracted",
      pages: pages.length,
      chunks: totalChunks,
      debug: debugInfo,
    });

  } catch (error) {
    console.error("❌ Ingest error:", error);
    const message = error instanceof Error ? error.message : "Ingestion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}