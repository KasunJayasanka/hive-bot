import axios from "axios";

const MODEL = process.env.GEMINI_EMBED_MODEL ?? "text-embedding-004";
const API_KEY = process.env.GOOGLE_API_KEY!;
const API_BASE = process.env.GEMINI_API_BASE ?? "https://generativelanguage.googleapis.com/v1beta";

/**
 * Generate embeddings for multiple texts with batching support
 * @param texts - Array of texts to embed
 * @param batchSize - Number of texts to process in parallel (default: 5)
 * @returns Array of embedding vectors
 */
export async function embedTexts(texts: string[], batchSize: number = 5): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const url = `${API_BASE}/models/${MODEL}:embedContent`;
  const key = API_KEY;

  // For small batches, process all at once
  if (texts.length <= batchSize) {
    return await embedBatch(texts, url, key);
  }

  // For larger batches, process in chunks
  const allVectors: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(`   📊 Processing embeddings batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)} (${batch.length} texts)`);
    const batchVectors = await embedBatch(batch, url, key);
    allVectors.push(...batchVectors);
  }

  return allVectors;
}

/**
 * Process a batch of texts in parallel
 */
async function embedBatch(texts: string[], url: string, key: string): Promise<number[][]> {
  const promises = texts.map(async (text) => {
    const { data } = await axios.post(
      url,
      { content: { parts: [{ text }] } },
      { params: { key }, headers: { "Content-Type": "application/json" } }
    );
    const vec = data?.embedding?.values;
    if (!vec) throw new Error("No embedding returned");
    return vec;
  });

  return await Promise.all(promises);
}
