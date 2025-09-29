// src/lib/geminiClient.ts
import axios from "axios";

const API_KEY = process.env.GOOGLE_API_KEY!;
const API_BASE = process.env.GEMINI_API_BASE ?? "https://generativelanguage.googleapis.com/v1beta";
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export const gemini = axios.create({
  baseURL: `${API_BASE}`,
  headers: { "Content-Type": "application/json" },
  params: { key: API_KEY },
});

export async function generateContent(parts: Array<{ text?: string; inline_data?: { data: string; mime_type: string } }>) {
  const url = `/models/${MODEL}:generateContent`;
  const body = { contents: [{ parts }] };
  const { data } = await gemini.post(url, body);
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() ??
    "Sorry, I didn’t get that.";
  return text;
}
