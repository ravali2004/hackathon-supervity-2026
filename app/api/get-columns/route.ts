import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const recordIds = searchParams.get("recordIds")?.split(",") || []

    if (recordIds.length === 0) {
      return NextResponse.json({ columns: [] })
    }

    // Fetch the first record to get columns
    const { data: records } = await supabase.from("financial_records").select("columns").in("id", recordIds).limit(1)

    const columns = records && records.length > 0 ? records[0].columns || [] : []

    return NextResponse.json({ columns })
  } catch (error) {
    console.error("[v0] Error fetching columns:", error)
    return NextResponse.json({ columns: [] }, { status: 500 })
  }
}
