"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar, TrendingUp, Filter } from "lucide-react"

export interface AnalysisConfig {
  comparisonType: "yoy" | "qoq" | "mom" | "custom" | "none"
  groupBy: string[]
  focusMetrics: string[]
  includeForecasting: boolean
}

interface AnalysisConfigSectionProps {
  config: AnalysisConfig
  onChange: (config: AnalysisConfig) => void
  availableColumns: string[]
  disabled?: boolean
}

export function AnalysisConfigSection({ config, onChange, availableColumns, disabled }: AnalysisConfigSectionProps) {
  const updateConfig = (updates: Partial<AnalysisConfig>) => {
    onChange({ ...config, ...updates })
  }

  const toggleGroupBy = (column: string) => {
    const newGroupBy = config.groupBy.includes(column)
      ? config.groupBy.filter((c) => c !== column)
      : [...config.groupBy, column]
    updateConfig({ groupBy: newGroupBy })
  }

  const toggleMetric = (metric: string) => {
    const newMetrics = config.focusMetrics.includes(metric)
      ? config.focusMetrics.filter((m) => m !== metric)
      : [...config.focusMetrics, metric]
    updateConfig({ focusMetrics: newMetrics })
  }

  // Identify potential grouping dimensions
  const dimensionColumns = availableColumns.filter(
    (col) =>
      col.toLowerCase().includes("segment") ||
      col.toLowerCase().includes("product") ||
      col.toLowerCase().includes("country") ||
      col.toLowerCase().includes("region") ||
      col.toLowerCase().includes("category") ||
      col.toLowerCase().includes("discount"),
  )

  // Identify metric columns
  const metricColumns = availableColumns.filter(
    (col) =>
      col.toLowerCase().includes("sales") ||
      col.toLowerCase().includes("profit") ||
      col.toLowerCase().includes("revenue") ||
      col.toLowerCase().includes("units") ||
      col.toLowerCase().includes("cogs") ||
      col.toLowerCase().includes("discount"),
  )

  return (
    <div className="space-y-6">
      {/* Time Comparison Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Time Period Comparison
          </CardTitle>
          <CardDescription>Choose how to compare financial performance across time periods</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={config.comparisonType}
            onValueChange={(value) => updateConfig({ comparisonType: value as AnalysisConfig["comparisonType"] })}
            disabled={disabled}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yoy" id="yoy" />
                <Label htmlFor="yoy" className="cursor-pointer">
                  <div className="font-medium">Year-over-Year (YoY)</div>
                  <div className="text-xs text-muted-foreground">
                    Compare current year performance vs. same period last year
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="qoq" id="qoq" />
                <Label htmlFor="qoq" className="cursor-pointer">
                  <div className="font-medium">Quarter-over-Quarter (QoQ)</div>
                  <div className="text-xs text-muted-foreground">Compare performance vs. previous quarter</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mom" id="mom" />
                <Label htmlFor="mom" className="cursor-pointer">
                  <div className="font-medium">Month-over-Month (MoM)</div>
                  <div className="text-xs text-muted-foreground">Track monthly performance changes</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">
                  <div className="font-medium">Custom Period Analysis</div>
                  <div className="text-xs text-muted-foreground">Analyze all available data without comparison</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="cursor-pointer">
                  <div className="font-medium">No Time Comparison</div>
                  <div className="text-xs text-muted-foreground">Focus on overall metrics only</div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Group By Dimensions */}
      {dimensionColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Group Analysis By
            </CardTitle>
            <CardDescription>Select dimensions to break down your financial data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dimensionColumns.map((column) => (
                <div key={column} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${column}`}
                    checked={config.groupBy.includes(column)}
                    onCheckedChange={() => toggleGroupBy(column)}
                    disabled={disabled}
                  />
                  <Label htmlFor={`group-${column}`} className="text-sm cursor-pointer">
                    {column}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Focus Metrics */}
      {metricColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Focus Metrics
            </CardTitle>
            <CardDescription>Select key metrics to emphasize in your report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metricColumns.map((metric) => (
                <div key={metric} className="flex items-center space-x-2">
                  <Checkbox
                    id={`metric-${metric}`}
                    checked={config.focusMetrics.includes(metric)}
                    onCheckedChange={() => toggleMetric(metric)}
                    disabled={disabled}
                  />
                  <Label htmlFor={`metric-${metric}`} className="text-sm cursor-pointer">
                    {metric}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
