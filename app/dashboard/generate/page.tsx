import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GenerateReportForm } from "@/components/generate/generate-report-form"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function GenerateReportPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch available financial records
  const { data: records } = await supabase
    .from("financial_records")
    .select("id, company_name, fiscal_year, fiscal_period, file_name")
    .eq("user_id", user.id)
    .order("fiscal_year", { ascending: false })

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generate MD&A Report</h1>
            <p className="text-muted-foreground">Select your financial data and generate an AI-powered report</p>
          </div>

          <GenerateReportForm userId={user.id} availableRecords={records || []} />
        </div>
      </main>
    </div>
  )
}
