import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { generateEmbedding } from "@/lib/embeddings"
import { VectorStore } from "@/lib/vector-store"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { query, limit = 5, threshold = 0.7 } = body

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Search for similar embeddings
    const vectorStore = new VectorStore()
    const results = await vectorStore.similaritySearch(user.id, queryEmbedding, limit, threshold)

    return NextResponse.json({
      success: true,
      results: results.map((r) => ({
        content: r.content,
        metadata: r.metadata,
        similarity: r.similarity,
      })),
    })
  } catch (error) {
    console.error("Context search error:", error)
    return NextResponse.json({ error: "Failed to search context" }, { status: 500 })
  }
}
