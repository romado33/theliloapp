/**
 * Apply Performance Indexes to Database
 * This script applies the performance optimization indexes to your Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://baigglncdwirfwlxagcl.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaWdnbG5jZHdpcmZ3bHhhZ2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzA0MjEsImV4cCI6MjA3MjUwNjQyMX0.xC31gmu9kL5mGGiKXwEHC0TfGYOOcq2bGYjhWNdXLKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Read the migration file
const migrationPath = path.join(__dirname, 'migrations', '20260303_performance_indexes.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

// Split into individual statements (simple split by semicolon)
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

console.log('🚀 Applying Performance Indexes...\n');
console.log(`📁 Migration file: ${migrationPath}`);
console.log(`📊 Total statements: ${statements.length}\n`);
console.log('='.repeat(60));

async function applyIndexes() {
  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const indexName = statement.match(/CREATE INDEX.*?(\w+)\s+ON/)?.[1] || `statement_${i + 1}`;
    
    console.log(`\n${i + 1}/${statements.length} Creating: ${indexName}...`);
    
    try {
      // Note: Supabase anon key might not have permissions to create indexes
      // This will likely need to be run via SQL Editor or service role key
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errorCount++;
        errors.push({ statement: indexName, error: error.message });
      } else {
        console.log(`   ✅ Created successfully`);
        successCount++;
      }
    } catch (err: any) {
      console.log(`   ❌ Exception: ${err.message}`);
      errorCount++;
      errors.push({ statement: indexName, error: err.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESULTS\n');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS:\n');
    errors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err.statement}`);
      console.log(`   ${err.error}\n`);
    });
  }

  console.log('\n' + '='.repeat(60));
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some indexes failed to create.');
    console.log('\nThis is likely because:');
    console.log('1. The anon key does not have DDL permissions');
    console.log('2. Some indexes may already exist');
    console.log('\n📝 ALTERNATIVE: Apply via Supabase Dashboard');
    console.log('   1. Go to: https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to SQL Editor');
    console.log('   4. Copy contents of: supabase/migrations/20260303_performance_indexes.sql');
    console.log('   5. Run the SQL');
    console.log('\nOR use the service_role key (keep it secret!):\n');
    console.log('   SUPABASE_SERVICE_KEY=your-service-key npx tsx supabase/apply-indexes.ts\n');
  } else {
    console.log('\n✅ All indexes created successfully!\n');
  }
}

applyIndexes().catch(console.error);
