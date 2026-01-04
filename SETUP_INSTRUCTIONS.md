# AutoMD&A Setup Instructions

## 1. Database Setup

Run the SQL migration script in your Supabase SQL Editor:

```bash
# Execute the following file in Supabase SQL Editor
scripts/001_create_schema.sql
```

This creates:
- `profiles` table for user profiles
- `financial_records` table with flexible JSONB schema
- `generated_reports` table for AI-generated reports
- `embeddings` table for vector search (optional)
- Row Level Security (RLS) policies
- Automatic profile creation trigger

## 2. Groq API Setup (Free)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account (no credit card required)
3. Create an API key from the dashboard
4. Add to your environment variables:

```bash
GROQ_API_KEY=gsk_your_groq_api_key_here
```

The free tier includes:
- 30 requests per minute
- 7,000 tokens per minute
- Access to LLaMA 3.3 70B and other models
- Perfect for development and testing

## 3. How It Works

### Data Upload Flow
1. User uploads CSV file with any structure
2. System automatically detects columns
3. Data stored in flexible JSONB format
4. No predefined schema required

### Report Generation Flow
1. User selects uploaded financial records
2. **Flexible KPI Engine** analyzes data:
   - Detects available columns (Sales, Profit, COGS, etc.)
   - Calculates metrics based on what's present
   - Groups by dimensions (Segment, Product, Country, Time)
   - Computes trends and breakdowns
3. **Groq AI** (free LLaMA 3.3 70B model) generates:
   - Executive Summary
   - Sales Performance Analysis
   - Product & Segment Analysis
   - Profitability Analysis
   - Discount & Pricing Strategy
   - Key Insights & Recommendations
4. Report saved as markdown with visualizations

### Example CSV Structure

The system works with any CSV that has financial/sales data:

```csv
Segment,Country,Product,Discount Band,Units Sold,Sale Price,Sales,COGS,Profit,Date,Year
Government,Canada,Carretera,None,1618,20,32370,16185,16185,1/1/2014,2014
Midmarket,France,Montana,Medium,2470,120,296400,177840,118560,6/1/2014,2014
...
```

Key features:
- **Flexible columns**: Works with any column names
- **Auto-detection**: System identifies sales, profit, date, and grouping columns
- **Dynamic KPIs**: Calculates relevant metrics based on available data
- **Smart grouping**: Groups by segments, products, countries, time periods

## 4. Testing the System

1. **Upload Test Data**:
   - Go to `/dashboard`
   - Upload the included `Financials.csv` sample
   - Verify 700 records are uploaded

2. **Generate Report**:
   - Go to `/dashboard/generate`
   - Select uploaded records
   - Enter report title
   - Click "Generate Report"
   - Wait ~30-60 seconds for AI generation

3. **View Report**:
   - Report displays in markdown format
   - Includes 6 comprehensive sections
   - All data-driven with specific numbers
   - Can export to PDF or download markdown

## 5. Customization

### Add New KPI Calculations

Edit `lib/flexible-kpi-engine.ts`:

```typescript
private calculateYourMetric(): number | null {
  const column = this.columns.find(c => c === "Your Column")
  if (!column) return null
  
  return this.allRows.reduce((sum, row) => {
    const value = parseFloat(row[column]) || 0
    return sum + value
  }, 0)
}
```

### Customize Report Sections

Edit `lib/flexible-report-generator.ts` to add/modify sections:

```typescript
const newSection = await this.generateSection(
  "Your Section Title",
  kpiSummary,
  `Your instructions for the AI...`
)
sections.push({ title: "Your Section Title", content: newSection })
```

## 6. Troubleshooting

**Error: "GROQ_API_KEY is required"**
- Solution: Add GROQ_API_KEY to environment variables

**Error: "No financial records found"**
- Solution: Upload CSV data first from dashboard

**Error: "Failed to fetch"**
- Solution: Check Supabase connection and RLS policies

**Slow report generation**
- Normal: AI generation takes 30-60 seconds
- Using free Groq tier (7K tokens/min limit)
</parameter>
