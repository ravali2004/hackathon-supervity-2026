import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export async function DataRecordsCard({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: records, count } = await supabase
    .from("financial_records")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("fiscal_year", { ascending: false })
    .limit(10)

  // Group by file for display
  const groupedByFile = records?.reduce(
    (acc, record) => {
      const fileName = record.file_name || "Unknown"
      if (!acc[fileName]) {
        acc[fileName] = []
      }
      acc[fileName].push(record)
      return acc
    },
    {} as Record<string, typeof records>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Financial Data Records
        </CardTitle>
        <CardDescription>{count ? `${count} records uploaded` : "No data uploaded yet"}</CardDescription>
      </CardHeader>
      <CardContent>
        {groupedByFile && Object.keys(groupedByFile).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedByFile).map(([fileName, fileRecords]) => (
              <div key={fileName} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <p className="font-medium">{fileName}</p>
                  </div>
                  <Badge variant="secondary">{fileRecords.length} records</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Companies: {Array.from(new Set(fileRecords.map((r) => r.company_name))).join(", ")}
                </div>
                <div className="text-xs text-muted-foreground">
                  Years:{" "}
                  {Array.from(new Set(fileRecords.map((r) => r.fiscal_year)))
                    .sort()
                    .join(", ")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No financial data uploaded yet</p>
            <p className="text-xs mt-1">Upload a CSV file to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
