import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split("\n")
  if (lines.length < 2) return { headers: [], rows: [] }

  // Parse headers
  const headers = parseCSVLine(lines[0])

  const rows: Record<string, string>[] = []

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === headers.length) {
      const record: Record<string, string> = {}
      headers.forEach((header, index) => {
        record[header] = values[index]
      })
      rows.push(record)
    }
  }

  return { headers, rows }
}

// Helper to parse a CSV line properly handling quotes and commas
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Read file content
    const text = await file.text()
    const { headers, rows } = parseCSV(text)

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid records found in CSV" }, { status: 400 })
    }

    console.log("[v0] CSV parsed successfully:", {
      fileName: file.name,
      columns: headers,
      rowCount: rows.length,
    })

    const financialRecords = rows.map((row) => ({
      user_id: user.id,
      file_name: file.name,
      columns: headers, // Array of column names
      data: row, // JSONB object with all row data
    }))

    // Insert records into database with explicit column selection
    const { error: insertError } = await supabase.from("financial_records").insert(financialRecords).select("id")

    if (insertError) {
      console.error("[v0] Database insert error:", insertError)
      return NextResponse.json(
        { error: "Failed to save records to database", details: insertError.message },
        { status: 500 },
      )
    }

    console.log("[v0] Successfully inserted records:", financialRecords.length)

    return NextResponse.json({
      success: true,
      recordCount: financialRecords.length,
      columns: headers,
      message: `Successfully uploaded ${financialRecords.length} financial records with ${headers.length} columns`,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 })
  }
}
