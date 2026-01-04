import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export interface EmbeddingRecord {
  id: string
  user_id: string
  content: string
  embedding: number[]
  metadata: Record<string, unknown>
  source_type: string
  source_id: string | null
}

export class VectorStore {
  private supabase

  constructor() {
    this.supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  }

  async storeEmbedding(
    userId: string,
    content: string,
    embedding: number[],
    metadata: Record<string, unknown>,
    sourceType: string,
    sourceId?: string,
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from("embeddings")
      .insert({
        user_id: userId,
        content,
        embedding,
        metadata,
        source_type: sourceType,
        source_id: sourceId || null,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error storing embedding:", error)
      throw new Error("Failed to store embedding")
    }

    return data.id
  }

  async storeMultipleEmbeddings(
    userId: string,
    embeddings: Array<{
      content: string
      embedding: number[]
      metadata: Record<string, unknown>
      sourceType: string
      sourceId?: string
    }>,
  ): Promise<string[]> {
    const records = embeddings.map((emb) => ({
      user_id: userId,
      content: emb.content,
      embedding: emb.embedding,
      metadata: emb.metadata,
      source_type: emb.sourceType,
      source_id: emb.sourceId || null,
    }))

    const { data, error } = await this.supabase.from("embeddings").insert(records).select("id")

    if (error) {
      console.error("Error storing embeddings:", error)
      throw new Error("Failed to store embeddings")
    }

    return data.map((d) => d.id)
  }

  async similaritySearch(
    userId: string,
    queryEmbedding: number[],
    limit = 5,
    threshold = 0.7,
  ): Promise<EmbeddingRecord[]> {
    // Use RPC function for cosine similarity search
    const { data, error } = await this.supabase.rpc("match_embeddings", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      user_id_filter: userId,
    })

    if (error) {
      console.error("Error searching embeddings:", error)
      throw new Error("Failed to search embeddings")
    }

    return data || []
  }

  async deleteEmbeddingsBySource(userId: string, sourceType: string, sourceId: string): Promise<void> {
    const { error } = await this.supabase
      .from("embeddings")
      .delete()
      .eq("user_id", userId)
      .eq("source_type", sourceType)
      .eq("source_id", sourceId)

    if (error) {
      console.error("Error deleting embeddings:", error)
      throw new Error("Failed to delete embeddings")
    }
  }
}
