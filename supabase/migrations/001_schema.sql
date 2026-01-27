-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (inherits from auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'premium', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Roles reference table
CREATE TABLE IF NOT EXISTS public.roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default roles
INSERT INTO public.roles (id, name, description) VALUES
  ('user', 'User', 'Standard user with basic permissions'),
  ('premium', 'Premium', 'Premium user with enhanced permissions'),
  ('admin', 'Admin', 'Administrator with full permissions')
ON CONFLICT (id) DO NOTHING;

-- Todos table with vector support
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
  due_at TIMESTAMPTZ,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT todos_user_id_idx UNIQUE (user_id, id)
);

-- Create index on todo status for quick filtering
CREATE INDEX IF NOT EXISTS todos_user_id_status_idx ON public.todos(user_id, status);
CREATE INDEX IF NOT EXISTS todos_due_at_idx ON public.todos(due_at);

-- Create vector index for similarity search
CREATE INDEX IF NOT EXISTS todos_embedding_idx ON public.todos USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Documents table (knowledge base for AI)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on documents
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);

-- Create vector index for document similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON public.documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Files table (metadata for storage)
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('image', 'video', 'document', 'other')),
  size BIGINT,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on files
CREATE INDEX IF NOT EXISTS files_user_id_idx ON public.files(user_id);

-- AI Logs table (audit trail)
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  action TEXT,
  result JSONB,
  is_dry_run BOOLEAN DEFAULT true,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on ai_logs
CREATE INDEX IF NOT EXISTS ai_logs_user_id_created_at_idx ON public.ai_logs(user_id, created_at DESC);

-- Vector search RPC functions
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT null
) RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
    SELECT
      d.id,
      d.title,
      d.content,
      1 - (d.embedding <=> query_embedding) AS similarity
    FROM public.documents d
    WHERE (p_user_id IS NULL OR d.user_id = p_user_id)
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.match_todos(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT null
) RETURNS TABLE (
  id uuid,
  title text,
  description text,
  status text,
  similarity float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      1 - (t.embedding <=> query_embedding) AS similarity
    FROM public.todos t
    WHERE (p_user_id IS NULL OR t.user_id = p_user_id)
    ORDER BY t.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- Grant default permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON public.roles TO authenticated, anon;
