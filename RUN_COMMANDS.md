# Commands to Run This Project

This is a Next.js project using **pnpm** as the package manager.

## Prerequisites

1. **Node.js** (v18 or higher recommended)
2. **pnpm** installed globally
   ```bash
   npm install -g pnpm
   ```

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Service Role Key (Required for vector store features)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Groq API Key (Required for AI report generation)
GROQ_API_KEY=gsk_your_groq_api_key_here
```

**How to get these values:**
- **Supabase**: Get from your Supabase project dashboard → Settings → API
- **Groq API**: Sign up at [console.groq.com](https://console.groq.com) (free tier available)

## Step 3: Set Up Database

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run the migration script: `scripts/001_create_schema.sql`
4. (Optional) Run: `scripts/002_add_flexible_columns.sql`

## Step 4: Run the Development Server

```bash
pnpm dev
```

The application will start at: **http://localhost:3000**

## Other Available Commands

### Build for Production
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

### Run Linter
```bash
pnpm lint
```

## Quick Start Summary

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env.local with your API keys (see Step 2 above)

# 3. Set up database in Supabase SQL Editor

# 4. Run development server
pnpm dev
```

Then open http://localhost:3000 in your browser!

