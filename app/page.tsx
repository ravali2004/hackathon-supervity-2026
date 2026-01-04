import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, TrendingUp, Sparkles, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">AutoMD&A</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container py-24 md:py-32">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
            <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI-Powered Financial Analysis</span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Generate Professional MD&A Reports in Minutes
            </h1>
            <p className="max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
              Upload your financial data and let AI create comprehensive Management Discussion & Analysis reports with
              automated KPI calculations and insights.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/auth/sign-up">
                <Button size="lg" className="gap-2">
                  Start Generating Reports
                  <FileText className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Automated KPI Calculation</h3>
                <p className="text-sm text-muted-foreground">
                  Instantly compute revenue growth, margins, and segment performance from your data
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">AI-Generated Narratives</h3>
                <p className="text-sm text-muted-foreground">
                  Transform raw numbers into compelling executive-ready financial narratives
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Smart Context Retrieval</h3>
                <p className="text-sm text-muted-foreground">
                  RAG-powered system finds relevant historical data and context for accurate reports
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your financial data is encrypted and isolated with row-level security
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>AutoMD&A - AI-Powered Financial Report Generator</p>
        </div>
      </footer>
    </div>
  )
}
