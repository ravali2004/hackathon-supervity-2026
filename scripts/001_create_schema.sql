-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create users profile table for additional user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simplified financial_records table to store any CSV data dynamically
CREATE TABLE IF NOT EXISTS public.financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  columns JSONB NOT NULL, -- Store column names from CSV
  data JSONB NOT NULL, -- Store all row data as JSON
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_reports table for AI-generated MD&A reports
CREATE TABLE IF NOT EXISTS public.generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  report_content TEXT NOT NULL,
  report_data JSONB,
  kpis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create embeddings table for RAG vector store
CREATE TABLE IF NOT EXISTS public.embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  source_type TEXT,
  source_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_records_user_id ON public.financial_records(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_file_name ON public.financial_records(file_name);
CREATE INDEX IF NOT EXISTS idx_generated_reports_user_id ON public.generated_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_user_id ON public.embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON public.embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for financial_records
CREATE POLICY "Users can view their own financial records" ON public.financial_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial records" ON public.financial_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial records" ON public.financial_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial records" ON public.financial_records
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for generated_reports
CREATE POLICY "Users can view their own reports" ON public.generated_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" ON public.generated_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON public.generated_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON public.generated_reports
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for embeddings
CREATE POLICY "Users can view their own embeddings" ON public.embeddings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own embeddings" ON public.embeddings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own embeddings" ON public.embeddings
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (
    new.id,
    new.email
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create a function for similarity search using cosine distance
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id_filter uuid
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  content text,
  embedding vector(1536),
  metadata jsonb,
  source_type text,
  source_id uuid,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    user_id,
    content,
    embedding,
    metadata,
    source_type,
    source_id,
    1 - (embedding <=> query_embedding) AS similarity
  FROM embeddings
  WHERE user_id = user_id_filter
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
