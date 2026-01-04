# Environment Variables Setup Guide

## Quick Fix for "Invalid supabaseUrl" Error

The error occurs because `.env.local` contains placeholder values. You need to replace them with your actual Supabase credentials.

## Step-by-Step Instructions

### 1. Get Your Supabase Credentials

1. Go to: **https://supabase.com/dashboard**
2. Sign in or create an account (free tier available)
3. Create a new project (or select an existing one)
4. Wait for the project to finish setting up (takes 1-2 minutes)
5. Go to **Settings** → **API** in the left sidebar

### 2. Copy Your API Keys

You'll see three important values:

- **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
  - Copy this to `NEXT_PUBLIC_SUPABASE_URL`
  
- **anon public key**: A long string starting with `eyJ...`
  - Copy this to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  
- **service_role key**: Another long string (click "Reveal" to see it)
  - Copy this to `SUPABASE_SERVICE_ROLE_KEY`
  - ⚠️ **Keep this secret!** Never share or commit this key.

### 3. Update .env.local File

Open `.env.local` in your project root and replace the placeholder values:

```env
# Replace "your_supabase_project_url_here" with your actual URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Replace "your_supabase_anon_key_here" with your anon key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Replace "your_supabase_service_role_key_here" with your service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Groq API key (for AI report generation)
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Example of Valid Format

Your `.env.local` should look something like this:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example_key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.example_service_key
GROQ_API_KEY=gsk_example_groq_key_here
```

### 5. Restart the Development Server

**IMPORTANT:** After updating `.env.local`, you MUST restart the server:

1. Stop the current server (Press `Ctrl+C` in the terminal)
2. Start it again:
   ```bash
   pnpm dev
   ```

Environment variables are only loaded when the server starts!

## Don't Have a Supabase Project?

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Create a new organization
5. Create a new project:
   - Choose a name
   - Set a database password (save it!)
   - Select a region close to you
   - Click "Create new project"
6. Wait 1-2 minutes for setup to complete
7. Follow steps 1-5 above to get your API keys

## Troubleshooting

**Error: "Invalid supabaseUrl"**
- ✅ Make sure the URL starts with `https://`
- ✅ Make sure it ends with `.supabase.co`
- ✅ No extra spaces or quotes around the values
- ✅ Use the exact URL from Supabase dashboard (Project URL)

**Error: "Your project's URL and Key are required"**
- ✅ Make sure you saved the `.env.local` file
- ✅ Make sure the variable names are exactly correct (case-sensitive)
- ✅ Restart the dev server after making changes

**Still having issues?**
- Double-check that you copied the entire key (they're very long)
- Make sure there are no line breaks in the values
- Verify the keys in the Supabase dashboard match what you pasted

