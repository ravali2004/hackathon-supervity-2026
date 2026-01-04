import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DataUploadCard } from "@/components/dashboard/data-upload-card"
import { RecentReportsCard } from "@/components/dashboard/recent-reports-card"
import { DataRecordsCard } from "@/components/dashboard/data-records-card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Upload financial data and generate AI-powered MD&A reports</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <DataUploadCard userId={user.id} />
            <RecentReportsCard userId={user.id} />
          </div>

          <DataRecordsCard userId={user.id} />
        </div>
      </main>
    </div>
  )
}
