import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { FlexibleKPIEngine } from "@/lib/flexible-kpi-engine"
import { FlexibleReportGenerator } from "@/lib/flexible-report-generator"

export const maxDuration = 60

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
    const { reportTitle, recordIds, analysisConfig } = body

    if (!reportTitle || !recordIds || recordIds.length === 0) {
      return NextResponse.json({ error: "Report title and record IDs are required" }, { status: 400 })
    }

    console.log("[v0] Fetching records for", recordIds.length, "IDs")
    console.log("[v0] Analysis config:", analysisConfig)

    const BATCH_SIZE = 100
    let allRecords: any[] = []

    for (let i = 0; i < recordIds.length; i += BATCH_SIZE) {
      const batch = recordIds.slice(i, i + BATCH_SIZE)
      const { data: batchRecords, error: fetchError } = await supabase
        .from("financial_records")
        .select("id, user_id, file_name, columns, data, created_at")
        .eq("user_id", user.id)
        .in("id", batch)

      if (fetchError) {
        console.error("[v0] Batch fetch error:", fetchError)
        return NextResponse.json({ error: "Failed to fetch financial records" }, { status: 404 })
      }

      if (batchRecords) {
        allRecords = allRecords.concat(batchRecords)
      }
    }

    console.log("[v0] Fetched", allRecords.length, "records")

    if (allRecords.length === 0) {
      return NextResponse.json({ error: "No financial records found" }, { status: 404 })
    }

    console.log("[v0] Calculating KPIs with flexible engine")

    const kpiEngine = new FlexibleKPIEngine(allRecords, analysisConfig)
    const kpis = kpiEngine.calculateDynamicKPIs()

    console.log("[v0] Generating report")

    const reportGenerator = new FlexibleReportGenerator(analysisConfig)
    const generatedReport = await reportGenerator.generateMDAReport(reportTitle, kpiEngine)

    console.log("[v0] Saving report to database")

    const { data: savedReport, error: saveError } = await supabase
      .from("generated_reports")
      .insert({
        user_id: user.id,
        title: reportTitle,
        report_content: generatedReport.fullReport,
        report_data: {
          sections: generatedReport.sections,
          kpiSummary: generatedReport.kpiSummary,
          analysisConfig, // Store analysis config in report
        },
        kpis: kpis,
      })
      .select("id")
      .single()

    if (saveError) {
      console.error("[v0] Error saving report:", saveError)
      return NextResponse.json({ error: "Failed to save report" }, { status: 500 })
    }

    console.log("[v0] Report generated successfully:", savedReport.id)

    return NextResponse.json({
      success: true,
      reportId: savedReport.id,
      message: "Report generated successfully",
    })
  } catch (error: any) {
    console.error("[v0] Report generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate report" }, { status: 500 })
  }
}
