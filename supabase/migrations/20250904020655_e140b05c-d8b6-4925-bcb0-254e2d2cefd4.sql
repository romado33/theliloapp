-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to experiences table for semantic search
ALTER TABLE public.experiences 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create an index for fast vector similarity search
CREATE INDEX IF NOT EXISTS experiences_embedding_idx ON public.experiences 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Add search terms column for better text indexing
ALTER TABLE public.experiences 
ADD COLUMN IF NOT EXISTS search_terms text;

-- Create full text search index
CREATE INDEX IF NOT EXISTS experiences_search_idx ON public.experiences 
USING gin(to_tsvector('english', search_terms));

-- Update search terms for existing experiences
UPDATE public.experiences 
SET search_terms = CONCAT_WS(' ', title, description, location, 
  CASE WHEN what_included IS NOT NULL THEN array_to_string(what_included, ' ') ELSE '' END,
  CASE WHEN what_to_bring IS NOT NULL THEN array_to_string(what_to_bring, ' ') ELSE '' END
);

-- Create function to automatically update search terms
CREATE OR REPLACE FUNCTION update_experience_search_terms()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_terms = CONCAT_WS(' ', NEW.title, NEW.description, NEW.location,
    CASE WHEN NEW.what_included IS NOT NULL THEN array_to_string(NEW.what_included, ' ') ELSE '' END,
    CASE WHEN NEW.what_to_bring IS NOT NULL THEN array_to_string(NEW.what_to_bring, ' ') ELSE '' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search terms
DROP TRIGGER IF EXISTS update_experience_search_terms_trigger ON public.experiences;
CREATE TRIGGER update_experience_search_terms_trigger
  BEFORE INSERT OR UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION update_experience_search_terms();