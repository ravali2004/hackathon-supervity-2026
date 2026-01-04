import { embed } from "ai"

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: "openai/text-embedding-3-small",
    value: text,
  })

  return embedding
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings = await Promise.all(texts.map((text) => generateEmbedding(text)))
  return embeddings
}

// Chunk text into smaller pieces for better embedding
export function chunkText(text: string, maxChunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + maxChunkSize, text.length)
    chunks.push(text.slice(start, end))
    start = end - overlap
  }

  return chunks
}
