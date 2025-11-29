// src/services/rag.ts
import { http } from "@/lib/http";

// Text-only RAG (your existing one)
export async function askRag(message: string) {
  const { data } = await http.post<{ text: string; sources: string[] }>("/api/rag/ask", {
    message,
    topK: 6,
    minSim: 0.25,
  });
  return data;
}

// Extended: RAG with optional image
export async function askRagWithImage(
  message: string,
  file?: { data: string; mime_type: string; size?: number; name?: string } | null
) {
  const { data } = await http.post<{ text: string; sources: string[] }>("/api/rag/ask", {
    message,
    file: file ?? null,
    topK: 6,
    minSim: 0.25,
  });
  return data;
}
