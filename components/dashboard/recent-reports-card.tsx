import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export async function RecentReportsCard({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: reports } = await supabase
    .from("generated_reports")
    .select("id, title, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Reports
            </CardTitle>
            <CardDescription>Your recently generated MD&A reports</CardDescription>
          </div>
          <Link href="/dashboard/generate">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Generate New
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {reports && reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <Link key={report.id} href={`/dashboard/reports/${report.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{report.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No reports generated yet</p>
            <Link href="/dashboard/generate">
              <Button size="sm" variant="outline" className="mt-4 gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                Generate Your First Report
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
