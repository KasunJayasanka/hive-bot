// lib/prompt.ts
export function buildRagPrompt(query: string, context: Array<{ url: string; text: string; similarity?: number }>) {
  // More flexible system prompt
  const system = `You are Hive Bot, a helpful AI assistant that answers questions using Hiveion website content.

Your role:
- Answer questions based on the provided context from the Hiveion website
- Automatically understand contextual references (example :- here = Hiveion)
- Be conversational and helpful
- If you find relevant information, provide a clear answer
- If partial information exists, share what you know
- Only say you don't know if the context truly has no relevant information
- Naturally mention which sources you used

Remember: You represent Hiveion which is an IT Company,Your goal is to be helpful while staying grounded in the provided content.`;

  const ctxBlock = context
    .map((c, i) => {
      const simLabel = c.similarity ? ` (relevance: ${(c.similarity * 100).toFixed(0)}%)` : '';
      return `[Source ${i + 1}: ${c.url}${simLabel}]
${c.text.slice(0, 800)}...`; // Limit each chunk
    })
    .join("\n\n---\n\n");

  const user = `Website Context:\n\n${ctxBlock}\n\n---\n\nUser Question: ${query}\n\nProvide a helpful answer using the context above. If you use information from the sources, mention them naturally.`;

  return `${system}\n\n${user}`;
}

// Alternative: Build parts array for Gemini directly
export function buildRagParts(query: string, context: Array<{ url: string; text: string; similarity?: number }>) {
  const system = `You are Hive Bot, a helpful AI assistant.

Your approach:
- Answer using the provided website content
- If the exact answer isn't available, check if related information from the google helps
- For follow-up questions, consider information from the broader context
- If you truly can't answer, say so briefly and suggest what you CAN help with
- Naturally cite your sources`;
  
  const contextText = context
    .map((c, i) => `Source ${i + 1} (${c.url}):\n${c.text.slice(0, 800)}`)
    .join("\n\n");
  
  return [
    { text: system },
    { text: `Context:\n${contextText}` },
    { text: `Question: ${query}` }
  ];
}