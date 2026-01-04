import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { generateEmbedding, chunkText } from "@/lib/embeddings"
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
    const { recordIds } = body

    // Fetch financial records
    const { data: records, error } = await supabase
      .from("financial_records")
      .select("*")
      .eq("user_id", user.id)
      .in("id", recordIds || [])

    if (error || !records || records.length === 0) {
      return NextResponse.json({ error: "No records found" }, { status: 404 })
    }

    const vectorStore = new VectorStore()
    const embeddingPromises: Promise<string>[] = []

    for (const record of records) {
      // Create text representation of the financial record
      const recordText = `
Company: ${record.company_name}
Fiscal Year: ${record.fiscal_year}
Fiscal Period: ${record.fiscal_period}
Revenue: $${record.revenue?.toLocaleString() || "N/A"}
Cost of Revenue: $${record.cost_of_revenue?.toLocaleString() || "N/A"}
Gross Profit: $${record.gross_profit?.toLocaleString() || "N/A"}
Operating Expenses: $${record.operating_expenses?.toLocaleString() || "N/A"}
Operating Income: $${record.operating_income?.toLocaleString() || "N/A"}
Net Income: $${record.net_income?.toLocaleString() || "N/A"}
Total Assets: $${record.total_assets?.toLocaleString() || "N/A"}
Total Liabilities: $${record.total_liabilities?.toLocaleString() || "N/A"}
Shareholders Equity: $${record.shareholders_equity?.toLocaleString() || "N/A"}
Segment: ${record.segment || "N/A"}
      `.trim()

      // Chunk the text if it's too long
      const chunks = chunkText(recordText, 800, 100)

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const embedding = await generateEmbedding(chunk)

        const promise = vectorStore.storeEmbedding(
          user.id,
          chunk,
          embedding,
          {
            company_name: record.company_name,
            fiscal_year: record.fiscal_year,
            fiscal_period: record.fiscal_period,
            chunk_index: i,
            total_chunks: chunks.length,
          },
          "financial_record",
          record.id,
        )

        embeddingPromises.push(promise)
      }
    }

    await Promise.all(embeddingPromises)

    return NextResponse.json({
      success: true,
      recordCount: records.length,
      embeddingCount: embeddingPromises.length,
      message: `Successfully created ${embeddingPromises.length} embeddings for ${records.length} records`,
    })
  } catch (error) {
    console.error("Embedding creation error:", error)
    return NextResponse.json({ error: "Failed to create embeddings" }, { status: 500 })
  }
}
