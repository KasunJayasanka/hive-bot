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

/**
 * Split text into sentences using common sentence boundaries
 */
function splitIntoSentences(text: string): string[] {
  // Split on sentence endings: . ! ? followed by space or end of text
  // This regex handles common cases while preserving abbreviations
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
  return sentences.filter(s => s.trim().length > 0);
}

/**
 * Split text into paragraphs
 */
function splitIntoParagraphs(text: string): string[] {
  // Split on double newlines or multiple spaces that indicate paragraph breaks
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.filter(p => p.trim().length > 0);
}

/**
 * Semantic chunking: respects paragraph and sentence boundaries
 * Falls back to character splitting only when necessary
 */
export function chunkText(text: string, chunkSize = 1000, chunkOverlap = 150): string[] {
  if (!text || text.length === 0) {
    console.log("   ⚠️ chunkText received empty text");
    return [];
  }

  const chunks: string[] = [];
  const paragraphs = splitIntoParagraphs(text);

  let currentChunk = "";
  let previousSentences: string[] = []; // For smart overlap

  for (const paragraph of paragraphs) {
    const sentences = splitIntoSentences(paragraph);

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();

      // If single sentence exceeds chunk size, split it by characters
      if (trimmedSentence.length > chunkSize) {
        // Save current chunk if it exists
        if (currentChunk.trim().length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
        }

        // Split large sentence by characters with overlap
        const sentenceChunks = splitByCharacters(trimmedSentence, chunkSize, chunkOverlap);
        chunks.push(...sentenceChunks);
        previousSentences = [];
        continue;
      }

      // Check if adding this sentence would exceed chunk size
      const potentialChunk = currentChunk
        ? `${currentChunk} ${trimmedSentence}`
        : trimmedSentence;

      if (potentialChunk.length > chunkSize && currentChunk.length > 0) {
        // Current chunk is full, save it
        chunks.push(currentChunk.trim());

        // Start new chunk with overlap from previous sentences
        const overlapText = previousSentences.slice(-2).join(" "); // Last 2 sentences for context
        currentChunk = overlapText
          ? `${overlapText} ${trimmedSentence}`
          : trimmedSentence;
        previousSentences = [trimmedSentence];
      } else {
        // Add sentence to current chunk
        currentChunk = potentialChunk;
        previousSentences.push(trimmedSentence);

        // Keep only recent sentences for overlap (max 3)
        if (previousSentences.length > 3) {
          previousSentences.shift();
        }
      }
    }

    // After each paragraph, consider starting a new chunk if current is substantial
    if (currentChunk.length > chunkSize * 0.5) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
      previousSentences = [];
    }
  }

  // Add any remaining content
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  console.log(`   📦 Created ${chunks.length} semantic chunks from ${text.length} chars`);
  return chunks;
}

/**
 * Fallback: character-based chunking with overlap (original algorithm)
 * Used only for very long sentences that can't be split semantically
 */
function splitByCharacters(text: string, chunkSize: number, chunkOverlap: number): string[] {
  const chunks: string[] = [];
  let i = 0;

  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    const slice = text.slice(i, end).trim();

    if (slice.length > 0) {
      chunks.push(slice);
    }

    i += chunkSize - chunkOverlap;

    if (i >= text.length - chunkOverlap) {
      break;
    }
  }

  return chunks;
}