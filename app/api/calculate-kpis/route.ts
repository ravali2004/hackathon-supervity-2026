import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { KPIEngine } from "@/lib/kpi-engine"

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
    let query = supabase.from("financial_records").select("*").eq("user_id", user.id)

    // If specific record IDs provided, filter by those
    if (recordIds && recordIds.length > 0) {
      query = query.in("id", recordIds)
    }

    const { data: records, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
    }

    if (!records || records.length === 0) {
      return NextResponse.json({ error: "No records found" }, { status: 404 })
    }

    // Calculate KPIs
    const engine = new KPIEngine(records)
    const kpis = engine.calculateKPIs()
    const summary = engine.generateKPISummary()

    return NextResponse.json({
      success: true,
      kpis,
      summary,
      recordCount: records.length,
    })
  } catch (error) {
    console.error("KPI calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate KPIs" }, { status: 500 })
  }
}
