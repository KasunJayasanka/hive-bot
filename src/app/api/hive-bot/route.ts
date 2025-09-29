import { NextRequest } from "next/server";
import { generateContent } from "@/lib/geminiClient";

type Inbound = {
  message: string;
  file?: { data: string; mime_type: string } | null;
};

export async function POST(req: NextRequest) {
  try {
    const { message, file }: Inbound = await req.json();

    if (!process.env.GOOGLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing GOOGLE_API_KEY" }), { status: 500 });
    }
    if (!message && !file?.data) {
      return new Response(JSON.stringify({ error: "Empty request" }), { status: 400 });
    }

    const parts: ({ text: string } | { inline_data: { data: string; mime_type: string } })[] = [];
    if (message) parts.push({ text: message });
    if (file?.data) parts.push({ inline_data: { data: file.data, mime_type: file.mime_type } });

    const text = await generateContent(parts);
    return Response.json({ text });
  } catch (err: unknown) {
    console.error(err);
    const msg = err instanceof Error ? err.message : "Unexpected error talking to the model.";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
