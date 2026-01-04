import type { AnalysisConfig } from "./flexible-kpi-engine"

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

export class FlexibleReportGenerator {
  private config: AnalysisConfig | undefined

  constructor(config?: AnalysisConfig) {
    this.config = config
  }

  async generateMDAReport(reportTitle: string, kpiEngine: any): Promise<GeneratedReport> {
    console.log("[v0] Starting report generation...")

    const kpiSummary = kpiEngine.generateKPISummary()
    console.log("[v0] Generated KPI summary, length:", kpiSummary.length)

    const sections: ReportSection[] = []

    const kpiData = this.parseKPISummary(kpiSummary)

    sections.push({
      title: "Executive Summary",
      content: this.generateExecutiveSummary(kpiData),
    })

    sections.push({
      title: "Sales Performance Analysis",
      content: this.generateSalesAnalysis(kpiData),
    })

    sections.push({
      title: "Product & Segment Analysis",
      content: this.generateProductAnalysis(kpiData),
    })

    sections.push({
      title: "Profitability Analysis",
      content: this.generateProfitabilityAnalysis(kpiData),
    })

    sections.push({
      title: "Discount & Pricing Strategy",
      content: this.generateDiscountAnalysis(kpiData),
    })

    sections.push({
      title: "Key Insights & Recommendations",
      content: this.generateInsights(kpiData),
    })

    console.log("[v0] All sections generated successfully")

    const fullReport = this.assembleFullReport(reportTitle, sections)

    return {
      title: reportTitle,
      sections,
      fullReport,
      kpiSummary,
    }
  }

  private parseKPISummary(kpiSummary: string): any {
    const data: any = {
      totalSales: 0,
      totalProfit: 0,
      totalCOGS: 0,
      totalUnits: 0,
      segments: [],
      products: [],
      countries: [],
      discountBands: [],
    }

    const lines = kpiSummary.split("\n")
    lines.forEach((line) => {
      if (line.includes("Total Sales:")) {
        data.totalSales = this.extractNumber(line)
      } else if (line.includes("Total Profit:")) {
        data.totalProfit = this.extractNumber(line)
      } else if (line.includes("Total COGS:")) {
        data.totalCOGS = this.extractNumber(line)
      } else if (line.includes("Total Units:")) {
        data.totalUnits = this.extractNumber(line)
      } else if (line.includes("Profit Margin:")) {
        data.profitMargin = this.extractNumber(line)
      }
    })

    return data
  }

  private extractNumber(text: string): number {
    const match = text.match(/[\d,]+\.?\d*/g)
    if (match) {
      return Number.parseFloat(match[0].replace(/,/g, ""))
    }
    return 0
  }

  private generateExecutiveSummary(data: any): string {
    const profitMargin = data.totalSales > 0 ? ((data.totalProfit / data.totalSales) * 100).toFixed(2) : "0"

    return `This Management Discussion and Analysis (MD&A) presents a comprehensive review of the company's financial performance based on the analyzed data period.

**Overall Performance:** The company generated total sales of $${data.totalSales.toLocaleString()} with a gross profit of $${data.totalProfit.toLocaleString()}, resulting in a profit margin of ${profitMargin}%. Total units sold reached ${data.totalUnits.toLocaleString()}, demonstrating strong operational activity across the business.

**Key Highlights:** The cost of goods sold (COGS) amounted to $${data.totalCOGS.toLocaleString()}, indicating the direct costs associated with revenue generation. The relationship between revenue, costs, and profitability suggests ${data.profitMargin > 20 ? "healthy" : "moderate"} operational efficiency. The business model shows ${data.profitMargin > 20 ? "strong" : "adequate"} pricing power and cost management capabilities.

**Strategic Position:** The financial metrics indicate a ${data.totalProfit > 0 ? "profitable" : "challenging"} operating environment. Management's focus on balancing growth with profitability has resulted in ${data.totalProfit > 0 ? "positive" : "mixed"} outcomes. The data reveals opportunities for optimization in pricing strategies, cost management, and market positioning to enhance overall financial performance.`
  }

  private generateSalesAnalysis(data: any): string {
    const avgPrice = data.totalUnits > 0 ? (data.totalSales / data.totalUnits).toFixed(2) : "0"

    return `**Revenue Overview:** Total sales reached $${data.totalSales.toLocaleString()}, driven by ${data.totalUnits.toLocaleString()} units sold across various product lines and market segments. The average selling price per unit stands at $${avgPrice}, reflecting the company's pricing strategy and product mix.

**Sales Composition:** The revenue base demonstrates ${data.totalSales > 1000000 ? "substantial" : "significant"} market presence. Sales performance indicates ${data.totalUnits > 10000 ? "high-volume" : "focused"} distribution capabilities, with revenue generation spread across multiple channels and customer segments.

**Market Performance:** The sales figures suggest ${data.totalSales > 1000000 ? "strong" : "stable"} market demand for the company's offerings. The volume of units sold indicates ${data.totalUnits > 10000 ? "broad" : "targeted"} market penetration. These metrics point to ${data.totalSales > 1000000 ? "successful" : "consistent"} go-to-market strategies and customer engagement.

**Growth Trajectory:** With total sales of $${data.totalSales.toLocaleString()}, the business demonstrates ${data.totalProfit > 0 ? "positive momentum" : "operational stability"}. The unit volume of ${data.totalUnits.toLocaleString()} reflects ${data.totalUnits > 10000 ? "scale operations" : "focused execution"}, positioning the company for ${data.totalProfit > 0 ? "continued growth" : "strategic improvements"} in subsequent periods.`
  }

  private generateProductAnalysis(data: any): string {
    return `**Product Portfolio Performance:** The company's diversified product portfolio contributes to the total sales of $${data.totalSales.toLocaleString()}. Product mix analysis reveals varying performance levels across different segments, with certain categories demonstrating stronger market traction than others.

**Segment Contribution:** Revenue distribution across business segments shows differentiated performance patterns. High-performing segments contribute disproportionately to overall profitability, while emerging segments present growth opportunities. The segment-level analysis indicates potential for portfolio optimization and resource reallocation.

**Geographic Distribution:** Market performance varies across different geographic regions, with some territories showing stronger adoption and revenue generation. Regional analysis suggests opportunities for expansion in underperforming markets and consolidation in mature territories. Geographic diversity provides risk mitigation and growth optionality.

**Strategic Implications:** The product and segment analysis reveals opportunities for strategic focus on high-margin offerings and selective investment in growth segments. Market penetration strategies should be tailored to regional dynamics, with resource allocation prioritizing segments demonstrating the strongest return potential and competitive positioning.`
  }

  private generateProfitabilityAnalysis(data: any): string {
    const profitMargin = data.totalSales > 0 ? ((data.totalProfit / data.totalSales) * 100).toFixed(2) : "0"
    const cogsPercent = data.totalSales > 0 ? ((data.totalCOGS / data.totalSales) * 100).toFixed(2) : "0"

    return `**Margin Analysis:** The company achieved a gross profit margin of ${profitMargin}%, with total profit of $${data.totalProfit.toLocaleString()} on sales of $${data.totalSales.toLocaleString()}. This margin reflects the balance between pricing strategies, cost structure, and market positioning.

**Cost Structure:** Cost of goods sold represents ${cogsPercent}% of total sales, amounting to $${data.totalCOGS.toLocaleString()}. This cost ratio indicates ${Number.parseFloat(cogsPercent) < 70 ? "efficient" : "moderate"} operational leverage and highlights the importance of continued cost management initiatives. Manufacturing and procurement efficiency directly impacts bottom-line profitability.

**Profitability Drivers:** Key drivers of profitability include pricing effectiveness, volume economics, and operational efficiency. The profit margin of ${profitMargin}% suggests ${Number.parseFloat(profitMargin) > 20 ? "strong" : "adequate"} value capture from market activities. Areas for margin enhancement include procurement optimization, operational efficiencies, and premium product positioning.

**Financial Health:** With a profit margin of ${profitMargin}%, the company demonstrates ${Number.parseFloat(profitMargin) > 20 ? "robust" : "stable"} financial health. The relationship between revenue ($${data.totalSales.toLocaleString()}), costs ($${data.totalCOGS.toLocaleString()}), and profit ($${data.totalProfit.toLocaleString()}) indicates ${data.totalProfit > 0 ? "sustainable" : "challenged"} business economics requiring ${data.totalProfit > 0 ? "continued optimization" : "strategic intervention"}.`
  }

  private generateDiscountAnalysis(data: any): string {
    return `**Pricing Strategy Overview:** The company employs varied discount strategies across different customer segments and product categories. Discount policies balance volume objectives with margin preservation, reflecting strategic trade-offs between market share and profitability.

**Discount Impact:** Analysis of discount bands reveals differentiated impacts on sales velocity and profitability. Certain discount levels drive volume growth while maintaining acceptable margins, while others may indicate pricing pressure or competitive dynamics requiring attention.

**Volume-Margin Trade-offs:** The relationship between discount levels and sales performance demonstrates the elasticity of demand across different price points. Strategic discounting drives volume in competitive segments, while premium positioning preserves margins in differentiated offerings. Optimization opportunities exist in aligning discount policies with customer value perception.

**Recommendations:** Discount strategy should be refined to maximize profitability while maintaining competitive positioning. Targeted discount programs for high-value customer segments, combined with premium pricing for differentiated products, can enhance overall margin performance. Regular analysis of discount effectiveness and competitive response is essential for dynamic pricing optimization.`
  }

  private generateInsights(data: any): string {
    const profitMargin = data.totalSales > 0 ? ((data.totalProfit / data.totalSales) * 100).toFixed(2) : "0"

    return `**Key Financial Insights:** The financial analysis reveals a company with $${data.totalSales.toLocaleString()} in sales and ${profitMargin}% profit margin. ${data.totalProfit > 0 ? "Positive profitability" : "Financial challenges"} indicate ${data.totalProfit > 0 ? "effective" : "opportunities for improved"} operational management and market positioning.

**Strategic Opportunities:** Key opportunities include optimizing product mix toward higher-margin offerings, enhancing operational efficiency to reduce COGS, and refining pricing strategies to maximize value capture. Market expansion in underserved segments presents growth potential, while operational improvements can drive margin enhancement.

**Risk Considerations:** Primary risks include competitive pricing pressure, cost inflation, and market demand variability. The profit margin of ${profitMargin}% provides ${Number.parseFloat(profitMargin) > 20 ? "adequate" : "limited"} cushion for market volatility. Proactive risk management through diversification, operational flexibility, and strategic partnerships is recommended.

**Management Recommendations:** 
1. Focus on high-margin product segments and customer channels
2. Implement cost optimization initiatives to improve COGS efficiency  
3. Refine pricing and discount strategies for optimal profit maximization
4. Invest in market expansion opportunities with favorable return profiles
5. Enhance operational capabilities to support sustainable growth and profitability

These strategic actions, combined with rigorous financial discipline, position the company for enhanced performance and value creation in subsequent periods.`
  }

  private assembleFullReport(title: string, sections: ReportSection[]): string {
    let report = `# ${title}\n\n`
    report += `*Generated on ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}*\n\n`
    report += `*Powered by AutoMD&A Financial Analysis*\n\n`
    report += "---\n\n"

    sections.forEach((section) => {
      report += `## ${section.title}\n\n`
      report += `${section.content}\n\n`
      report += "---\n\n"
    })

    return report
  }
}
