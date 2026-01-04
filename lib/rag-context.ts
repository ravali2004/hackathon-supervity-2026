import { VectorStore } from "./vector-store"
import { generateEmbedding } from "./embeddings"

export interface RetrievedContext {
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

export class RAGContextRetriever {
  private vectorStore: VectorStore

  constructor() {
    this.vectorStore = new VectorStore()
  }

  async retrieveRelevantContext(userId: string, query: string, topK = 5, threshold = 0.7): Promise<RetrievedContext[]> {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Search for similar content
    const results = await this.vectorStore.similaritySearch(userId, queryEmbedding, topK, threshold)

    return results.map((result) => ({
      content: result.content,
      metadata: result.metadata,
      similarity: result.similarity || 0,
    }))
  }

  async buildContextPrompt(userId: string, query: string): Promise<string> {
    const contexts = await this.retrieveRelevantContext(userId, query)

    if (contexts.length === 0) {
      return "No relevant historical context found."
    }

    let prompt = "# Relevant Historical Financial Context\n\n"

    contexts.forEach((context, index) => {
      prompt += `## Context ${index + 1} (Similarity: ${(context.similarity * 100).toFixed(1)}%)\n`
      prompt += `${context.content}\n\n`

      if (context.metadata) {
        prompt += `Metadata: ${JSON.stringify(context.metadata, null, 2)}\n\n`
      }

      prompt += "---\n\n"
    })

    return prompt
  }
}
