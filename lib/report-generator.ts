import { generateText } from "ai"
import type { KPIEngine } from "./kpi-engine"
import { RAGContextRetriever } from "./rag-context"

export interface ReportSection {
  title: string
  content: string
}

export interface GeneratedReport {
  title: string
  sections: ReportSection[]
  fullReport: string
  kpiSummary: string
}

export class ReportGenerator {
  private ragRetriever: RAGContextRetriever

  constructor() {
    this.ragRetriever = new RAGContextRetriever()
  }

  async generateMDAReport(
    userId: string,
    reportTitle: string,
    financialRecords: any[],
    kpiEngine: KPIEngine,
  ): Promise<GeneratedReport> {
    // Get KPI summary
    const kpiSummary = kpiEngine.generateKPISummary()

    // Retrieve relevant historical context using RAG
    const historicalContext = await this.ragRetriever.buildContextPrompt(
      userId,
      `Financial analysis for ${reportTitle} with focus on trends, revenue drivers, and risks`,
    )

    // Generate each section of the MD&A report
    const sections: ReportSection[] = []

    // 1. Executive Summary
    const executiveSummary = await this.generateExecutiveSummary(kpiSummary, historicalContext)
    sections.push({ title: "Executive Summary", content: executiveSummary })

    // 2. Financial Performance Overview
    const performanceOverview = await this.generatePerformanceOverview(kpiSummary, historicalContext)
    sections.push({ title: "Financial Performance Overview", content: performanceOverview })

    // 3. Revenue Analysis
    const revenueAnalysis = await this.generateRevenueAnalysis(kpiSummary, historicalContext)
    sections.push({ title: "Revenue Analysis", content: revenueAnalysis })

    // 4. Profitability Analysis
    const profitabilityAnalysis = await this.generateProfitabilityAnalysis(kpiSummary, historicalContext)
    sections.push({ title: "Profitability Analysis", content: profitabilityAnalysis })

    // 5. Segment Performance
    const segmentPerformance = await this.generateSegmentPerformance(kpiSummary, historicalContext)
    sections.push({ title: "Segment Performance", content: segmentPerformance })

    // 6. Key Trends & Drivers
    const trendsDrivers = await this.generateTrendsDrivers(kpiSummary, historicalContext)
    sections.push({ title: "Key Trends & Drivers", content: trendsDrivers })

    // 7. Risk Factors
    const riskFactors = await this.generateRiskFactors(kpiSummary, historicalContext)
    sections.push({ title: "Risk Factors & Outlook", content: riskFactors })

    // Combine all sections into full report
    const fullReport = this.assembleFullReport(reportTitle, sections)

    return {
      title: reportTitle,
      sections,
      fullReport,
      kpiSummary,
    }
  }

  private async generateExecutiveSummary(kpiSummary: string, historicalContext: string): Promise<string> {
    const prompt = `You are a financial analyst writing an Executive Summary for a Management Discussion & Analysis (MD&A) report.

${kpiSummary}

${historicalContext}

Write a concise executive summary (2-3 paragraphs) that:
1. Highlights the most important financial metrics and overall performance
2. Mentions key year-over-year or quarter-over-quarter changes
3. Provides a high-level view of the company's financial health
4. Uses professional financial language

Be specific with numbers and percentages. Do not use placeholder text.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 1000,
    })

    return text
  }

  private async generatePerformanceOverview(kpiSummary: string, historicalContext: string): Promise<string> {
    const prompt = `You are a financial analyst writing the Financial Performance Overview section of an MD&A report.

${kpiSummary}

${historicalContext}

Write a detailed performance overview (3-4 paragraphs) that:
1. Discusses total revenue and its trends
2. Analyzes growth rates (YoY and QoQ)
3. Examines profitability metrics
4. Compares current performance to historical data
5. Provides insights into what drove the performance

Use specific numbers, percentages, and financial terminology. Be analytical and data-driven.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 1500,
    })

    return text
  }

  private async generateRevenueAnalysis(kpiSummary: string, historicalContext: string): Promise<string> {
    const prompt = `You are a financial analyst writing the Revenue Analysis section of an MD&A report.

${kpiSummary}

${historicalContext}

Write a comprehensive revenue analysis (3-4 paragraphs) that:
1. Breaks down revenue by year and period
2. Identifies growth trends and patterns
3. Analyzes what drove revenue growth or decline
4. Discusses revenue quality and sustainability
5. Compares revenue trends to historical periods

Be specific with actual numbers from the data. Use financial analysis best practices.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 1500,
    })

    return text
  }

  private async generateProfitabilityAnalysis(kpiSummary: string, historicalContext: string): Promise<string> {
    const prompt = `You are a financial analyst writing the Profitability Analysis section of an MD&A report.

${kpiSummary}

${historicalContext}

Write a detailed profitability analysis (3-4 paragraphs) that:
1. Examines gross margin, operating margin, and net margin
2. Identifies trends in profitability metrics
3. Analyzes what impacted margins (cost structure, efficiency, etc.)
4. Discusses ROE and ROA performance
5. Provides insights on profitability sustainability

Reference specific percentages and ratios from the data. Be analytical.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 1500,
    })

    return text
  }

  private async generateSegmentPerformance(kpiSummary: string, historicalContext: string): Promise<string> {
    const prompt = `You are a financial analyst writing the Segment Performance section of an MD&A report.

${kpiSummary}

${historicalContext}

Write a segment performance analysis (2-3 paragraphs) that:
1. Breaks down revenue by business segment
2. Identifies which segments are driving growth
3. Analyzes segment profitability and contribution
4. Discusses segment trends and strategic importance

Use specific numbers and percentages from the segment breakdown. If no segment data is available, note that and focus on overall business performance.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 1200,
    })

    return text
  }

  private async generateTrendsDrivers(kpiSummary: string, historicalContext: string): Promise<string> {
    const prompt = `You are a financial analyst writing the Key Trends & Drivers section of an MD&A report.

${kpiSummary}

${historicalContext}

Write an analysis of key trends and drivers (3-4 paragraphs) that:
1. Identifies major trends in the financial data
2. Discusses key revenue and profitability drivers
3. Analyzes what factors influenced performance
4. Provides forward-looking insights based on trends
5. Connects financial metrics to business drivers

Be insightful and analytical. Use data to support your observations.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 1500,
    })

    return text
  }

  private async generateRiskFactors(kpiSummary: string, historicalContext: string): Promise<string> {
    const prompt = `You are a financial analyst writing the Risk Factors & Outlook section of an MD&A report.

${kpiSummary}

${historicalContext}

Write a risk analysis and outlook (3-4 paragraphs) that:
1. Identifies potential financial risks based on the data (e.g., declining margins, high debt)
2. Discusses vulnerability to market conditions
3. Analyzes balance sheet strength (debt-to-equity ratio)
4. Provides a forward-looking outlook based on trends
5. Mentions areas requiring management attention

Be balanced but realistic. Base risks on actual financial metrics.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 1500,
    })

    return text
  }

  private assembleFullReport(title: string, sections: ReportSection[]): string {
    let report = `# ${title}\n\n`
    report += `*Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}*\n\n`
    report += "---\n\n"

    sections.forEach((section) => {
      report += `## ${section.title}\n\n`
      report += `${section.content}\n\n`
      report += "---\n\n"
    })

    return report
  }
}
