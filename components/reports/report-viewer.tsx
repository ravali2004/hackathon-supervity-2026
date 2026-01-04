"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import ReactMarkdown from "react-markdown"

interface Report {
  id: string
  title: string
  report_content: string
  report_data: {
    sections: Array<{ title: string; content: string }>
    kpiSummary: string
  }
  kpis: any
  created_at: string
}

export function ReportViewer({ report }: { report: Report }) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadMarkdown = () => {
    setIsDownloading(true)
    const blob = new Blob([report.report_content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${report.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setTimeout(() => setIsDownloading(false), 1000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{report.title}</h1>
          <p className="text-sm text-muted-foreground">
            Generated {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2 bg-transparent">
            <FileText className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownloadMarkdown} disabled={isDownloading} className="gap-2">
            <Download className="h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download MD"}
          </Button>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="report" className="space-y-6">
        <TabsList>
          <TabsTrigger value="report">Full Report</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="kpis">KPI Summary</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardContent className="prose prose-slate max-w-none p-8 print:p-0">
              <ReactMarkdown>{report.report_content}</ReactMarkdown>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          {report.report_data.sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                KPI Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">{report.report_data.kpiSummary}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Revenue Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${((report.kpis.totalRevenue || 0) / 1000000).toFixed(2)}M</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">YoY Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {report.kpis.yoyRevenueGrowth !== null
                    ? `${report.kpis.yoyRevenueGrowth >= 0 ? "+" : ""}${report.kpis.yoyRevenueGrowth.toFixed(2)}%`
                    : "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">QoQ Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {report.kpis.qoqRevenueGrowth !== null
                    ? `${report.kpis.qoqRevenueGrowth >= 0 ? "+" : ""}${report.kpis.qoqRevenueGrowth.toFixed(2)}%`
                    : "N/A"}
                </p>
              </CardContent>
            </Card>

            {/* Profitability Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gross Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {report.kpis.grossMargin !== null ? `${report.kpis.grossMargin.toFixed(2)}%` : "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Operating Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {report.kpis.operatingMargin !== null ? `${report.kpis.operatingMargin.toFixed(2)}%` : "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Net Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {report.kpis.netMargin !== null ? `${report.kpis.netMargin.toFixed(2)}%` : "N/A"}
                </p>
              </CardContent>
            </Card>

            {/* Balance Sheet Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ROE</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {report.kpis.returnOnEquity !== null ? `${report.kpis.returnOnEquity.toFixed(2)}%` : "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">ROA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {report.kpis.returnOnAssets !== null ? `${report.kpis.returnOnAssets.toFixed(2)}%` : "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Debt-to-Equity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {report.kpis.debtToEquityRatio !== null ? report.kpis.debtToEquityRatio.toFixed(2) : "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Segment Breakdown */}
          {report.kpis.segmentBreakdown && report.kpis.segmentBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Segment Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.kpis.segmentBreakdown.map((segment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{segment.segment}</p>
                        <p className="text-sm text-muted-foreground">{segment.percentage.toFixed(2)}% of total</p>
                      </div>
                      <p className="text-lg font-bold">${(segment.revenue / 1000000).toFixed(2)}M</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
