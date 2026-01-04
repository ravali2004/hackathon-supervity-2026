"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Sparkles, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { AnalysisConfigSection, type AnalysisConfig } from "./analysis-config-section"

interface FinancialRecord {
  id: string
  company_name: string | null
  fiscal_year: number | null
  fiscal_period: string | null
  file_name: string | null
}

export function GenerateReportForm({
  userId,
  availableRecords,
}: {
  userId: string
  availableRecords: FinancialRecord[]
}) {
  const [reportTitle, setReportTitle] = useState("")
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>({
    comparisonType: "yoy",
    groupBy: [],
    focusMetrics: [],
    includeForecasting: false,
  })
  const router = useRouter()

  useEffect(() => {
    const fetchColumns = async () => {
      if (selectedRecords.length === 0) {
        setAvailableColumns([])
        return
      }

      try {
        const response = await fetch(`/api/get-columns?recordIds=${selectedRecords.join(",")}`)
        const data = await response.json()
        if (data.columns) {
          setAvailableColumns(data.columns)
        }
      } catch (err) {
        console.error("[v0] Failed to fetch columns:", err)
      }
    }

    fetchColumns()
  }, [selectedRecords])

  const toggleRecord = (recordId: string) => {
    setSelectedRecords((prev) => (prev.includes(recordId) ? prev.filter((id) => id !== recordId) : [...prev, recordId]))
  }

  const selectAll = () => {
    setSelectedRecords(availableRecords.map((r) => r.id))
  }

  const clearAll = () => {
    setSelectedRecords([])
  }

  const handleGenerate = async () => {
    if (!reportTitle.trim()) {
      setError("Please enter a report title")
      return
    }

    if (selectedRecords.length === 0) {
      setError("Please select at least one financial record")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          reportTitle,
          recordIds: selectedRecords,
          analysisConfig,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate report")
      }

      router.push(`/dashboard/reports/${result.reportId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report")
      setIsGenerating(false)
    }
  }

  const recordsByFile = availableRecords.reduce(
    (acc, record) => {
      const fileName = record.file_name || "Unknown"
      if (!acc[fileName]) {
        acc[fileName] = []
      }
      acc[fileName].push(record)
      return acc
    },
    {} as Record<string, FinancialRecord[]>,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Set up your report parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Report Title</Label>
            <Input
              id="title"
              placeholder="e.g., Q4 2024 Financial Analysis"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Select Financial Data
              </CardTitle>
              <CardDescription>{selectedRecords.length} records selected</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} disabled={isGenerating}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll} disabled={isGenerating}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(recordsByFile).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No financial data available</p>
              <p className="text-xs mt-1">Please upload data first</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(recordsByFile).map(([fileName, records]) => (
                <div key={fileName} className="rounded-lg border p-4 space-y-3">
                  <p className="font-medium text-sm">{fileName}</p>
                  <div className="space-y-2">
                    {records.map((record) => (
                      <div key={record.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={record.id}
                          checked={selectedRecords.includes(record.id)}
                          onCheckedChange={() => toggleRecord(record.id)}
                          disabled={isGenerating}
                        />
                        <Label htmlFor={record.id} className="text-sm cursor-pointer flex-1">
                          {record.company_name} - FY{record.fiscal_year} {record.fiscal_period}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRecords.length > 0 && availableColumns.length > 0 && (
        <AnalysisConfigSection
          config={analysisConfig}
          onChange={setAnalysisConfig}
          availableColumns={availableColumns}
          disabled={isGenerating}
        />
      )}

      {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}

      <Button onClick={handleGenerate} disabled={isGenerating || selectedRecords.length === 0} className="w-full gap-2">
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating Report...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate MD&A Report
          </>
        )}
      </Button>
    </div>
  )
}
