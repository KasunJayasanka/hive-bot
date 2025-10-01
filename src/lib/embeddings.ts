import axios from "axios";

const MODEL = process.env.GEMINI_EMBED_MODEL ?? "text-embedding-004";
const API_KEY = process.env.GOOGLE_API_KEY!;
const API_BASE = process.env.GEMINI_API_BASE ?? "https://generativelanguage.googleapis.com/v1beta";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const url = `${API_BASE}/models/${MODEL}:embedContent`;
  const key = API_KEY;
  // Gemini embeddings: one item at a time for simplicity
  const vectors: number[][] = [];
  for (const t of texts) {
    const { data } = await axios.post(
      url,
      { content: { parts: [{ text: t }] } },
      { params: { key }, headers: { "Content-Type": "application/json" } }
    );
    const vec = data?.embedding?.values;
    if (!vec) throw new Error("No embedding returned");
    vectors.push(vec);
  }
  return vectors;
}
