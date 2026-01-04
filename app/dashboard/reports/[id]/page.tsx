import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ReportViewer } from "@/components/reports/report-viewer"
import { notFound } from "next/navigation"

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch the report
  const { data: report, error: reportError } = await supabase
    .from("generated_reports")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (reportError || !report) {
    notFound()
  }

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 p-6 md:p-10">
        <ReportViewer report={report} />
      </main>
    </div>
  )
}
