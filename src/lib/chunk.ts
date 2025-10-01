export function cleanText(htmlOrText: string): string {
  if (!htmlOrText) return "";
  
  return htmlOrText
    // Replace multiple whitespace with single space
    .replace(/\s+/g, " ")
    // Replace non-breaking spaces
    .replace(/\u00A0/g, " ")
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Trim
    .trim();
}

export function chunkText(text: string, chunkSize = 1000, chunkOverlap = 150): string[] {
  if (!text || text.length === 0) {
    console.log("   ⚠️ chunkText received empty text");
    return [];
  }

  const chunks: string[] = [];
  let i = 0;
  
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    const slice = text.slice(i, end).trim();
    
    if (slice.length > 0) {
      chunks.push(slice);
    }
    
    // Move forward, but overlap
    i += chunkSize - chunkOverlap;
    
    // Prevent infinite loop
    if (i >= text.length - chunkOverlap) {
      break;
    }
  }
  
  console.log(`   📦 Created ${chunks.length} chunks from ${text.length} chars`);
  return chunks;
}