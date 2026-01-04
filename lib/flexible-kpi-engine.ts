export interface FlexibleFinancialRecord {
  id: string
  user_id: string
  file_name: string
  columns: string[]
  data: any[]
  created_at: string
}

export interface AnalysisConfig {
  comparisonType: "yoy" | "qoq" | "mom" | "custom" | "none"
  groupBy: string[]
  focusMetrics: string[]
  includeForecasting: boolean
}

export interface DynamicKPIMetrics {
  recordCount: number
  dataColumns: string[]
  dateRange: { start: string | null; end: string | null }
  totalSales: number | null
  totalUnits: number | null
  averagePrice: number | null
  totalProfit: number | null
  profitMargin: number | null
  totalCOGS: number | null
  salesByPeriod: Array<{ period: string; sales: number; units?: number }>
  salesBySegment: Array<{ segment: string; sales: number; percentage: number }>
  salesByProduct: Array<{ product: string; sales: number; percentage: number }>
  salesByCountry: Array<{ country: string; sales: number; percentage: number }>
  totalDiscounts: number | null
  discountRate: number | null
  salesByDiscountBand: Array<{ band: string; sales: number; percentage: number }>
  yoyGrowth?: { sales: number; profit: number; units: number } | null
  qoqGrowth?: { sales: number; profit: number; units: number } | null
  momGrowth?: { sales: number; profit: number; units: number } | null
  comparisonType?: string
}

export class FlexibleKPIEngine {
  private records: FlexibleFinancialRecord[]
  private allRows: any[]
  private columns: string[]
  private config: AnalysisConfig | undefined // Store analysis config

  constructor(records: FlexibleFinancialRecord[], config?: AnalysisConfig) {
    this.records = records
    this.allRows = records.flatMap((r) => r.data || [])
    this.columns = records.length > 0 ? records[0].columns : []
    this.config = config
  }

  calculateDynamicKPIs(): DynamicKPIMetrics {
    console.log("[v0] Calculating KPIs for", this.allRows.length, "rows with columns:", this.columns)

    const baseMetrics = {
      recordCount: this.allRows.length,
      dataColumns: this.columns,
      dateRange: this.calculateDateRange(),
      totalSales: this.calculateTotal("Sales", "Gross Sales"),
      totalUnits: this.calculateTotal("Units Sold"),
      averagePrice: this.calculateAveragePrice(),
      totalProfit: this.calculateTotal("Profit"),
      profitMargin: this.calculateProfitMargin(),
      totalCOGS: this.calculateTotal("COGS", "Cost of Goods Sold"),
      salesByPeriod: this.groupByPeriod(),
      salesBySegment: this.groupByDimension("Segment"),
      salesByProduct: this.groupByDimension("Product"),
      salesByCountry: this.groupByDimension("Country"),
      totalDiscounts: this.calculateTotal("Discounts"),
      discountRate: this.calculateDiscountRate(),
      salesByDiscountBand: this.groupByDimension("Discount Band"),
    }

    if (this.config?.comparisonType && this.config.comparisonType !== "none") {
      const comparisonMetrics = this.calculateComparisons(this.config.comparisonType)
      return {
        ...baseMetrics,
        ...comparisonMetrics,
        comparisonType: this.config.comparisonType,
      }
    }

    return baseMetrics
  }

  private calculateComparisons(type: "yoy" | "qoq" | "mom" | "custom"): {
    yoyGrowth?: { sales: number; profit: number; units: number } | null
    qoqGrowth?: { sales: number; profit: number; units: number } | null
    momGrowth?: { sales: number; profit: number; units: number } | null
  } {
    const yearCol = this.columns.find((c) => c === "Year")
    const monthCol = this.columns.find((c) => c === "Month Number" || c === "Month Name")
    const salesCol = this.columns.find((c) => c === "Sales" || c === "Gross Sales")
    const profitCol = this.columns.find((c) => c === "Profit")
    const unitsCol = this.columns.find((c) => c === "Units Sold")

    if (!yearCol || !salesCol) {
      return {}
    }

    const result: any = {}

    if (type === "yoy") {
      // Calculate Year-over-Year growth
      const periodMap = new Map<string, { sales: number; profit: number; units: number }>()

      this.allRows.forEach((row) => {
        const year = row[yearCol]
        const sales = Number.parseFloat(row[salesCol]) || 0
        const profit = profitCol ? Number.parseFloat(row[profitCol]) || 0 : 0
        const units = unitsCol ? Number.parseFloat(row[unitsCol]) || 0 : 0

        const existing = periodMap.get(String(year)) || { sales: 0, profit: 0, units: 0 }
        periodMap.set(String(year), {
          sales: existing.sales + sales,
          profit: existing.profit + profit,
          units: existing.units + units,
        })
      })

      const years = Array.from(periodMap.keys()).sort()
      if (years.length >= 2) {
        const currentYear = periodMap.get(years[years.length - 1])!
        const previousYear = periodMap.get(years[years.length - 2])!

        result.yoyGrowth = {
          sales: previousYear.sales > 0 ? ((currentYear.sales - previousYear.sales) / previousYear.sales) * 100 : 0,
          profit:
            previousYear.profit > 0 ? ((currentYear.profit - previousYear.profit) / previousYear.profit) * 100 : 0,
          units: previousYear.units > 0 ? ((currentYear.units - previousYear.units) / previousYear.units) * 100 : 0,
        }
      }
    }

    // Similar logic for QoQ and MoM can be added here
    if (type === "qoq" || type === "mom") {
      // Placeholder for Quarter-over-Quarter and Month-over-Month
      result[type === "qoq" ? "qoqGrowth" : "momGrowth"] = null
    }

    return result
  }

  private calculateTotal(...possibleColumns: string[]): number | null {
    for (const colName of possibleColumns) {
      if (this.columns.includes(colName)) {
        const total = this.allRows.reduce((sum, row) => {
          const value = Number.parseFloat(row[colName])
          return sum + (isNaN(value) ? 0 : value)
        }, 0)
        return total
      }
    }
    return null
  }

  private calculateAveragePrice(): number | null {
    const priceCol = this.columns.find((c) => c.includes("Price"))
    if (!priceCol) return null

    const prices = this.allRows.map((row) => Number.parseFloat(row[priceCol])).filter((p) => !isNaN(p))

    if (prices.length === 0) return null
    return prices.reduce((sum, p) => sum + p, 0) / prices.length
  }

  private calculateProfitMargin(): number | null {
    const profit = this.calculateTotal("Profit")
    const sales = this.calculateTotal("Sales", "Gross Sales")

    if (profit === null || sales === null || sales === 0) return null
    return (profit / sales) * 100
  }

  private calculateDiscountRate(): number | null {
    const discounts = this.calculateTotal("Discounts")
    const grossSales = this.calculateTotal("Gross Sales")

    if (discounts === null || grossSales === null || grossSales === 0) return null
    return (discounts / grossSales) * 100
  }

  private calculateDateRange(): { start: string | null; end: string | null } {
    const dateCol = this.columns.find((c) => c.toLowerCase().includes("date"))
    if (!dateCol) return { start: null, end: null }

    const dates = this.allRows
      .map((row) => row[dateCol])
      .filter((d) => d)
      .sort()

    return {
      start: dates.length > 0 ? dates[0] : null,
      end: dates.length > 0 ? dates[dates.length - 1] : null,
    }
  }

  private groupByPeriod(): Array<{ period: string; sales: number; units?: number }> {
    const yearCol = this.columns.find((c) => c === "Year")
    const monthCol = this.columns.find((c) => c === "Month Name" || c === "Month")
    const salesCol = this.columns.find((c) => c === "Sales" || c === "Gross Sales")
    const unitsCol = this.columns.find((c) => c === "Units Sold")

    if (!salesCol) return []

    const periodMap = new Map<string, { sales: number; units: number }>()

    this.allRows.forEach((row) => {
      let period = "Unknown"
      if (yearCol && monthCol) {
        period = `${row[yearCol]}-${row[monthCol]}`
      } else if (yearCol) {
        period = String(row[yearCol])
      }

      const sales = Number.parseFloat(row[salesCol]) || 0
      const units = unitsCol ? Number.parseFloat(row[unitsCol]) || 0 : 0

      const existing = periodMap.get(period) || { sales: 0, units: 0 }
      periodMap.set(period, {
        sales: existing.sales + sales,
        units: existing.units + units,
      })
    })

    return Array.from(periodMap.entries())
      .map(([period, data]) => ({
        period,
        sales: data.sales,
        units: unitsCol ? data.units : undefined,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }

  private groupByDimension(dimensionCol: string): Array<{ segment: string; sales: number; percentage: number }> {
    if (!this.columns.includes(dimensionCol)) return []

    const salesCol = this.columns.find((c) => c === "Sales" || c === "Gross Sales")
    if (!salesCol) return []

    const dimensionMap = new Map<string, number>()

    this.allRows.forEach((row) => {
      const dimension = row[dimensionCol] || "Unknown"
      const sales = Number.parseFloat(row[salesCol]) || 0
      dimensionMap.set(dimension, (dimensionMap.get(dimension) || 0) + sales)
    })

    const totalSales = Array.from(dimensionMap.values()).reduce((sum, s) => sum + s, 0)

    return Array.from(dimensionMap.entries())
      .map(([segment, sales]) => ({
        segment,
        sales,
        percentage: totalSales > 0 ? (sales / totalSales) * 100 : 0,
      }))
      .sort((a, b) => b.sales - a.sales)
  }

  generateKPISummary(): string {
    const kpis = this.calculateDynamicKPIs()

    const formatNumber = (num: number | null, decimals = 2): string => {
      if (num === null) return "N/A"
      return num.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    }

    const formatCurrency = (num: number | null): string => {
      if (num === null) return "N/A"
      return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const formatPercentage = (num: number | null): string => {
      if (num === null) return "N/A"
      return `${num.toFixed(2)}%`
    }

    let summary = "# Financial Data Analysis Summary\n\n"

    summary += "## Dataset Overview\n"
    summary += `- Total Records: ${formatNumber(kpis.recordCount, 0)}\n`
    summary += `- Data Columns: ${kpis.dataColumns.join(", ")}\n`
    if (kpis.dateRange.start && kpis.dateRange.end) {
      summary += `- Date Range: ${kpis.dateRange.start} to ${kpis.dateRange.end}\n`
    }
    if (kpis.comparisonType) {
      summary += `- Analysis Type: ${kpis.comparisonType.toUpperCase()}\n`
    }
    summary += "\n"

    summary += "## Sales & Revenue Metrics\n"
    summary += `- Total Sales: ${formatCurrency(kpis.totalSales)}\n`
    summary += `- Total Units Sold: ${formatNumber(kpis.totalUnits, 0)}\n`
    summary += `- Average Price: ${formatCurrency(kpis.averagePrice)}\n`
    summary += `- Total Discounts: ${formatCurrency(kpis.totalDiscounts)}\n`
    summary += `- Discount Rate: ${formatPercentage(kpis.discountRate)}\n`
    summary += "\n"

    if (kpis.yoyGrowth) {
      summary += "## Year-over-Year Growth\n"
      summary += `- Sales Growth: ${formatPercentage(kpis.yoyGrowth.sales)}\n`
      summary += `- Profit Growth: ${formatPercentage(kpis.yoyGrowth.profit)}\n`
      summary += `- Units Growth: ${formatPercentage(kpis.yoyGrowth.units)}\n`
      summary += "\n"
    }

    summary += "## Profitability Metrics\n"
    summary += `- Total Profit: ${formatCurrency(kpis.totalProfit)}\n`
    summary += `- Profit Margin: ${formatPercentage(kpis.profitMargin)}\n`
    summary += `- Total COGS: ${formatCurrency(kpis.totalCOGS)}\n`
    summary += "\n"

    if (kpis.salesByPeriod.length > 0) {
      summary += "## Sales Trends Over Time\n"
      kpis.salesByPeriod.slice(-12).forEach((period) => {
        summary += `- ${period.period}: ${formatCurrency(period.sales)}`
        if (period.units) summary += ` (${formatNumber(period.units, 0)} units)`
        summary += "\n"
      })
      summary += "\n"
    }

    if (kpis.salesBySegment.length > 0) {
      summary += "## Sales by Segment\n"
      kpis.salesBySegment.slice(0, 5).forEach((seg) => {
        summary += `- ${seg.segment}: ${formatCurrency(seg.sales)} (${formatPercentage(seg.percentage)})\n`
      })
      summary += "\n"
    }

    if (kpis.salesByProduct.length > 0) {
      summary += "## Sales by Product\n"
      kpis.salesByProduct.slice(0, 5).forEach((prod) => {
        summary += `- ${prod.segment}: ${formatCurrency(prod.sales)} (${formatPercentage(prod.percentage)})\n`
      })
      summary += "\n"
    }

    if (kpis.salesByCountry.length > 0) {
      summary += "## Sales by Country\n"
      kpis.salesByCountry.slice(0, 5).forEach((country) => {
        summary += `- ${country.segment}: ${formatCurrency(country.sales)} (${formatPercentage(country.percentage)})\n`
      })
      summary += "\n"
    }

    if (kpis.salesByDiscountBand.length > 0) {
      summary += "## Sales by Discount Band\n"
      kpis.salesByDiscountBand.forEach((band) => {
        summary += `- ${band.segment}: ${formatCurrency(band.sales)} (${formatPercentage(band.percentage)})\n`
      })
      summary += "\n"
    }

    return summary
  }
}
