export interface FinancialRecord {
  id: string
  company_name: string | null
  fiscal_year: number | null
  fiscal_period: string | null
  revenue: number | null
  cost_of_revenue: number | null
  gross_profit: number | null
  operating_expenses: number | null
  operating_income: number | null
  net_income: number | null
  total_assets: number | null
  total_liabilities: number | null
  shareholders_equity: number | null
  segment: string | null
}

export interface KPIMetrics {
  // Revenue Metrics
  totalRevenue: number
  yoyRevenueGrowth: number | null
  qoqRevenueGrowth: number | null

  // Profitability Metrics
  grossMargin: number | null
  operatingMargin: number | null
  netMargin: number | null

  // Balance Sheet Metrics
  debtToEquityRatio: number | null
  returnOnEquity: number | null
  returnOnAssets: number | null

  // Segment Performance
  segmentBreakdown: Array<{
    segment: string
    revenue: number
    percentage: number
  }>

  // Trend Analysis
  revenueByYear: Array<{
    year: number
    revenue: number
  }>

  revenueByPeriod: Array<{
    period: string
    revenue: number
  }>
}

export class KPIEngine {
  private records: FinancialRecord[]

  constructor(records: FinancialRecord[]) {
    this.records = records.sort((a, b) => {
      if (a.fiscal_year !== b.fiscal_year) {
        return (a.fiscal_year || 0) - (b.fiscal_year || 0)
      }
      return (a.fiscal_period || "").localeCompare(b.fiscal_period || "")
    })
  }

  calculateKPIs(): KPIMetrics {
    return {
      totalRevenue: this.calculateTotalRevenue(),
      yoyRevenueGrowth: this.calculateYoYGrowth(),
      qoqRevenueGrowth: this.calculateQoQGrowth(),
      grossMargin: this.calculateGrossMargin(),
      operatingMargin: this.calculateOperatingMargin(),
      netMargin: this.calculateNetMargin(),
      debtToEquityRatio: this.calculateDebtToEquity(),
      returnOnEquity: this.calculateROE(),
      returnOnAssets: this.calculateROA(),
      segmentBreakdown: this.calculateSegmentBreakdown(),
      revenueByYear: this.calculateRevenueByYear(),
      revenueByPeriod: this.calculateRevenueByPeriod(),
    }
  }

  private calculateTotalRevenue(): number {
    return this.records.reduce((sum, record) => sum + (record.revenue || 0), 0)
  }

  private calculateYoYGrowth(): number | null {
    const yearlyRevenue = this.calculateRevenueByYear()
    if (yearlyRevenue.length < 2) return null

    const currentYear = yearlyRevenue[yearlyRevenue.length - 1]
    const previousYear = yearlyRevenue[yearlyRevenue.length - 2]

    if (previousYear.revenue === 0) return null

    return ((currentYear.revenue - previousYear.revenue) / previousYear.revenue) * 100
  }

  private calculateQoQGrowth(): number | null {
    const quarterlyRevenue = this.calculateRevenueByPeriod()
    if (quarterlyRevenue.length < 2) return null

    const currentQuarter = quarterlyRevenue[quarterlyRevenue.length - 1]
    const previousQuarter = quarterlyRevenue[quarterlyRevenue.length - 2]

    if (previousQuarter.revenue === 0) return null

    return ((currentQuarter.revenue - previousQuarter.revenue) / previousQuarter.revenue) * 100
  }

  private calculateGrossMargin(): number | null {
    const totalRevenue = this.records.reduce((sum, r) => sum + (r.revenue || 0), 0)
    const totalGrossProfit = this.records.reduce((sum, r) => sum + (r.gross_profit || 0), 0)

    if (totalRevenue === 0) return null
    return (totalGrossProfit / totalRevenue) * 100
  }

  private calculateOperatingMargin(): number | null {
    const totalRevenue = this.records.reduce((sum, r) => sum + (r.revenue || 0), 0)
    const totalOperatingIncome = this.records.reduce((sum, r) => sum + (r.operating_income || 0), 0)

    if (totalRevenue === 0) return null
    return (totalOperatingIncome / totalRevenue) * 100
  }

  private calculateNetMargin(): number | null {
    const totalRevenue = this.records.reduce((sum, r) => sum + (r.revenue || 0), 0)
    const totalNetIncome = this.records.reduce((sum, r) => sum + (r.net_income || 0), 0)

    if (totalRevenue === 0) return null
    return (totalNetIncome / totalRevenue) * 100
  }

  private calculateDebtToEquity(): number | null {
    const totalLiabilities = this.records.reduce((sum, r) => sum + (r.total_liabilities || 0), 0)
    const totalEquity = this.records.reduce((sum, r) => sum + (r.shareholders_equity || 0), 0)

    if (totalEquity === 0) return null
    return totalLiabilities / totalEquity
  }

  private calculateROE(): number | null {
    const totalNetIncome = this.records.reduce((sum, r) => sum + (r.net_income || 0), 0)
    const totalEquity = this.records.reduce((sum, r) => sum + (r.shareholders_equity || 0), 0)

    if (totalEquity === 0) return null
    return (totalNetIncome / totalEquity) * 100
  }

  private calculateROA(): number | null {
    const totalNetIncome = this.records.reduce((sum, r) => sum + (r.net_income || 0), 0)
    const totalAssets = this.records.reduce((sum, r) => sum + (r.total_assets || 0), 0)

    if (totalAssets === 0) return null
    return (totalNetIncome / totalAssets) * 100
  }

  private calculateSegmentBreakdown(): Array<{ segment: string; revenue: number; percentage: number }> {
    const segmentMap = new Map<string, number>()

    this.records.forEach((record) => {
      const segment = record.segment || "Other"
      const revenue = record.revenue || 0
      segmentMap.set(segment, (segmentMap.get(segment) || 0) + revenue)
    })

    const totalRevenue = Array.from(segmentMap.values()).reduce((sum, rev) => sum + rev, 0)

    return Array.from(segmentMap.entries())
      .map(([segment, revenue]) => ({
        segment,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }

  private calculateRevenueByYear(): Array<{ year: number; revenue: number }> {
    const yearMap = new Map<number, number>()

    this.records.forEach((record) => {
      if (record.fiscal_year) {
        const revenue = record.revenue || 0
        yearMap.set(record.fiscal_year, (yearMap.get(record.fiscal_year) || 0) + revenue)
      }
    })

    return Array.from(yearMap.entries())
      .map(([year, revenue]) => ({ year, revenue }))
      .sort((a, b) => a.year - b.year)
  }

  private calculateRevenueByPeriod(): Array<{ period: string; revenue: number }> {
    const periodMap = new Map<string, number>()

    this.records.forEach((record) => {
      if (record.fiscal_period) {
        const key = `${record.fiscal_year}-${record.fiscal_period}`
        const revenue = record.revenue || 0
        periodMap.set(key, (periodMap.get(key) || 0) + revenue)
      }
    })

    return Array.from(periodMap.entries())
      .map(([period, revenue]) => ({ period, revenue }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }

  // Generate a text summary of KPIs for LLM context
  generateKPISummary(): string {
    const kpis = this.calculateKPIs()

    const formatNumber = (num: number | null, decimals = 2): string => {
      if (num === null) return "N/A"
      return num.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    }

    const formatCurrency = (num: number | null): string => {
      if (num === null) return "N/A"
      return `$${(num / 1000000).toFixed(2)}M`
    }

    const formatPercentage = (num: number | null): string => {
      if (num === null) return "N/A"
      return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`
    }

    let summary = "# Financial KPI Summary\n\n"

    summary += "## Revenue Metrics\n"
    summary += `- Total Revenue: ${formatCurrency(kpis.totalRevenue)}\n`
    summary += `- Year-over-Year Growth: ${formatPercentage(kpis.yoyRevenueGrowth)}\n`
    summary += `- Quarter-over-Quarter Growth: ${formatPercentage(kpis.qoqRevenueGrowth)}\n\n`

    summary += "## Profitability Metrics\n"
    summary += `- Gross Margin: ${formatPercentage(kpis.grossMargin)}\n`
    summary += `- Operating Margin: ${formatPercentage(kpis.operatingMargin)}\n`
    summary += `- Net Margin: ${formatPercentage(kpis.netMargin)}\n\n`

    summary += "## Balance Sheet Metrics\n"
    summary += `- Debt-to-Equity Ratio: ${formatNumber(kpis.debtToEquityRatio)}\n`
    summary += `- Return on Equity (ROE): ${formatPercentage(kpis.returnOnEquity)}\n`
    summary += `- Return on Assets (ROA): ${formatPercentage(kpis.returnOnAssets)}\n\n`

    summary += "## Segment Performance\n"
    kpis.segmentBreakdown.forEach((segment) => {
      summary += `- ${segment.segment}: ${formatCurrency(segment.revenue)} (${formatNumber(segment.percentage)}% of total)\n`
    })
    summary += "\n"

    summary += "## Revenue Trends by Year\n"
    kpis.revenueByYear.forEach((yearData) => {
      summary += `- ${yearData.year}: ${formatCurrency(yearData.revenue)}\n`
    })

    return summary
  }
}
