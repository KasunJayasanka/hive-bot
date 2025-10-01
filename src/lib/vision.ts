import axios from "axios";

const MODEL = process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash";

type ImageFile = { data: string; mime_type: string };

export async function analyzeImage(file: ImageFile): Promise<{
  ocr: string;
  caption: string;
  entities: string[];
}> {
  const url = `${process.env.GOOGLE_API_BASE}/models/${MODEL}:generateContent`;
  const key = process.env.GOOGLE_API_KEY!;
  // Ask Gemini to do lightweight OCR + caption in JSON
  const prompt = `
You are an assistant that extracts structured info from an image.

Return strict JSON with keys:
- ocr: ALL legible text in the image
- caption: a 1-2 sentence concise description
- entities: array of salient named things (brands, products, people, signs, labels), lowercase strings.

If unclear, use empty string/array. No extra text.
`.trim();

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inline_data: { data: file.data, mime_type: file.mime_type } },
        ],
      },
    ],
    // Hint to respond in JSON
    generationConfig: { response_mime_type: "application/json" },
  };

  const { data } = await axios.post(url, body, {
    params: { key },
    headers: { "Content-Type": "application/json" },
    timeout: 60_000,
  });

  const raw =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data;

  try {
    const parsed = JSON.parse(raw);
    return {
      ocr: String(parsed?.ocr ?? ""),
      caption: String(parsed?.caption ?? ""),
      entities: Array.isArray(parsed?.entities) ? parsed.entities.map(String) : [],
    };
  } catch {
    // Fallback if model didn't return clean JSON
    return { ocr: "", caption: "", entities: [] };
  }
}
