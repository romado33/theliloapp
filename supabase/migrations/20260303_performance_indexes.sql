-- Performance Optimization Indexes
-- Generated from performance audit on 2026-03-03
-- This migration adds indexes to improve query performance

-- 1. Core Experience Queries
CREATE INDEX IF NOT EXISTS idx_experiences_is_active_created_at 
  ON experiences (is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_experiences_host_id 
  ON experiences (host_id);

CREATE INDEX IF NOT EXISTS idx_experiences_category_id 
  ON experiences (category_id);

-- 2. Partial index for active experiences only (reduces index size)
CREATE INDEX IF NOT EXISTS idx_experiences_active 
  ON experiences (created_at DESC) 
  WHERE is_active = true;

-- 3. Availability Queries
CREATE INDEX IF NOT EXISTS idx_availability_experience_id_start_time 
  ON availability (experience_id, start_time);

CREATE INDEX IF NOT EXISTS idx_availability_is_available 
  ON availability (is_available);

-- 4. Booking Queries
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id_status 
  ON bookings (guest_id, status);

CREATE INDEX IF NOT EXISTS idx_bookings_experience_id 
  ON bookings (experience_id);

-- Composite index for host dashboard
CREATE INDEX IF NOT EXISTS idx_bookings_host_status 
  ON bookings (experience_id, status, created_at DESC);

-- 5. Review Queries
CREATE INDEX IF NOT EXISTS idx_reviews_experience_id 
  ON reviews (experience_id);

-- 6. Saved Experiences
CREATE INDEX IF NOT EXISTS idx_saved_experiences_user_id 
  ON saved_experiences (user_id);

-- 7. Message Queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_created_at 
  ON messages (conversation_id, created_at);

-- 8. Notification Queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read 
  ON notifications (user_id, read);

-- 9. Full Text Search for Experiences
CREATE INDEX IF NOT EXISTS idx_experiences_fts 
  ON experiences USING gin (
    to_tsvector('english', 
      coalesce(title, '') || ' ' || 
      coalesce(description, '') || ' ' || 
      coalesce(location, '')
    )
  );

-- 10. GIN index for array searches (if needed)
CREATE INDEX IF NOT EXISTS idx_experiences_image_urls_gin 
  ON experiences USING gin (image_urls);

-- 11. Vector index for semantic search (if pgvector extension is enabled)
-- Uncomment if using semantic search with embeddings:
-- CREATE INDEX IF NOT EXISTS idx_experiences_embedding_hnsw 
--   ON experiences USING hnsw (embedding vector_cosine_ops);

-- Add comment for documentation
COMMENT ON INDEX idx_experiences_active IS 'Partial index for active experiences only - reduces index size and improves performance';
COMMENT ON INDEX idx_experiences_fts IS 'Full-text search index for title, description, and location';
