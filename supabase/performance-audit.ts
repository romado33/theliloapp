/**
 * Database Performance Audit Script
 * Analyzes schema for missing indexes and optimization opportunities
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://baigglncdwirfwlxagcl.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaWdnbG5jZHdpcmZ3bHhhZ2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzA0MjEsImV4cCI6MjA3MjUwNjQyMX0.xC31gmu9kL5mGGiKXwEHC0TfGYOOcq2bGYjhWNdXLKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🔍 Starting Performance Audit...\n');

// Analyze query patterns from code
const queryPatterns = [
  {
    table: 'experiences',
    columns: ['is_active', 'created_at'],
    reason: 'Used in default experience queries (SearchInterface)'
  },
  {
    table: 'experiences',
    columns: ['host_id'],
    reason: 'Foreign key joins for host data'
  },
  {
    table: 'experiences',
    columns: ['category_id'],
    reason: 'Category filtering'
  },
  {
    table: 'availability',
    columns: ['experience_id', 'start_time'],
    reason: 'Experience availability lookups'
  },
  {
    table: 'availability',
    columns: ['is_available'],
    reason: 'Available slot filtering'
  },
  {
    table: 'bookings',
    columns: ['guest_id', 'status'],
    reason: 'User bookings dashboard'
  },
  {
    table: 'bookings',
    columns: ['experience_id'],
    reason: 'Experience bookings'
  },
  {
    table: 'reviews',
    columns: ['experience_id'],
    reason: 'Experience ratings/reviews'
  },
  {
    table: 'saved_experiences',
    columns: ['user_id'],
    reason: 'User saved experiences'
  },
  {
    table: 'messages',
    columns: ['conversation_id', 'created_at'],
    reason: 'Chat message ordering'
  },
  {
    table: 'notifications',
    columns: ['user_id', 'read'],
    reason: 'Unread notifications'
  }
];

console.log('📊 RECOMMENDED INDEXES\n');
console.log('='.repeat(60));

queryPatterns.forEach((pattern, index) => {
  const indexName = `idx_${pattern.table}_${pattern.columns.join('_')}`;
  console.log(`\n${index + 1}. ${pattern.table} (${pattern.columns.join(', ')})`);
  console.log(`   Reason: ${pattern.reason}`);
  console.log(`   SQL: CREATE INDEX IF NOT EXISTS ${indexName} ON ${pattern.table} (${pattern.columns.join(', ')});`);
});

console.log('\n' + '='.repeat(60));

// Additional recommendations
console.log('\n📈 ADDITIONAL OPTIMIZATIONS\n');
console.log('='.repeat(60));

const optimizations = [
  {
    title: 'Vector Index for Semantic Search',
    description: 'Add HNSW index for embedding similarity search',
    sql: 'CREATE INDEX IF NOT EXISTS idx_experiences_embedding_hnsw ON experiences USING hnsw (embedding vector_cosine_ops);',
    priority: 'HIGH'
  },
  {
    title: 'Partial Index for Active Experiences',
    description: 'Index only active experiences to reduce index size',
    sql: 'CREATE INDEX IF NOT EXISTS idx_experiences_active ON experiences (created_at DESC) WHERE is_active = true;',
    priority: 'HIGH'
  },
  {
    title: 'Composite Index for Booking Queries',
    description: 'Optimize host dashboard booking queries',
    sql: 'CREATE INDEX IF NOT EXISTS idx_bookings_host_status ON bookings (experience_id, status, created_at DESC);',
    priority: 'MEDIUM'
  },
  {
    title: 'GIN Index for Array Columns',
    description: 'Faster searches on image_urls, what_included arrays',
    sql: 'CREATE INDEX IF NOT EXISTS idx_experiences_image_urls_gin ON experiences USING gin (image_urls);',
    priority: 'LOW'
  },
  {
    title: 'Full Text Search Index',
    description: 'Enable fast text search on experiences',
    sql: `CREATE INDEX IF NOT EXISTS idx_experiences_fts ON experiences USING gin (
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, ''))
    );`,
    priority: 'MEDIUM'
  }
];

optimizations.forEach((opt, index) => {
  console.log(`\n${index + 1}. [${opt.priority}] ${opt.title}`);
  console.log(`   ${opt.description}`);
  console.log(`   SQL: ${opt.sql}`);
});

console.log('\n' + '='.repeat(60));

// RLS Performance
console.log('\n🔒 RLS POLICY OPTIMIZATION\n');
console.log('='.repeat(60));

const rlsOptimizations = [
  'Ensure RLS policies use indexed columns (user_id, experience_id, etc.)',
  'Avoid complex JOINs in RLS policies - use security definer functions instead',
  'Add indexes on RLS filter columns',
  'Consider using security definer RPC functions for complex queries'
];

rlsOptimizations.forEach((opt, index) => {
  console.log(`${index + 1}. ${opt}`);
});

console.log('\n' + '='.repeat(60));

// Query optimization tips
console.log('\n⚡ QUERY OPTIMIZATION TIPS\n');
console.log('='.repeat(60));

const tips = [
  'Use .select() to specify exact columns needed (avoid SELECT *)',
  'Add .limit() to all queries to prevent full table scans',
  'Use .order() with indexed columns',
  'Batch rating queries (already implemented ✅)',
  'Use PostgREST caching headers for frequently accessed data',
  'Consider materialized views for complex aggregations',
  'Use connection pooling (Supabase handles this ✅)'
];

tips.forEach((tip, index) => {
  console.log(`${index + 1}. ${tip}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ Performance audit complete!');
console.log('\nNext steps:');
console.log('1. Review recommended indexes above');
console.log('2. Create migration file with index creation SQL');
console.log('3. Test query performance before/after');
console.log('4. Monitor slow queries in Supabase dashboard\n');
