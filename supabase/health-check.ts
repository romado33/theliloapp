/**
 * Database Health Check Script
 * 
 * This script tests the database connection and basic operations
 * Run with: npx tsx supabase/health-check.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://baigglncdwirfwlxagcl.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaWdnbG5jZHdpcmZ3bHhhZ2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzA0MjEsImV4cCI6MjA3MjUwNjQyMX0.xC31gmu9kL5mGGiKXwEHC0TfGYOOcq2bGYjhWNdXLKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface HealthCheckResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  data?: any;
  duration?: number;
}

const results: HealthCheckResult[] = [];

async function runHealthCheck() {
  console.log('🔍 Starting Database Health Check...\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);

  // Test 1: Database Connection
  await testConnection();
  
  // Test 2: Check Tables Exist
  await testTablesExist();
  
  // Test 3: Test Data Queries
  await testDataQueries();
  
  // Test 4: Check RLS Policies
  await testRLSPolicies();
  
  // Test 5: Check for Data
  await checkDataPresence();

  // Print Summary
  printSummary();
}

async function testConnection() {
  const start = Date.now();
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    const duration = Date.now() - start;
    
    if (error) throw error;
    
    results.push({
      test: 'Database Connection',
      status: 'pass',
      message: `Connected successfully (${duration}ms)`,
      duration
    });
  } catch (error: any) {
    results.push({
      test: 'Database Connection',
      status: 'fail',
      message: error.message || 'Connection failed'
    });
  }
}

async function testTablesExist() {
  const tables = [
    'profiles',
    'categories', 
    'experiences',
    'availability',
    'bookings',
    'reviews',
    'saved_experiences',
    'conversations',
    'messages',
    'notifications'
  ];

  let passedCount = 0;
  const missingTables: string[] = [];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (!error) {
        passedCount++;
      } else {
        missingTables.push(table);
      }
    } catch {
      missingTables.push(table);
    }
  }

  if (missingTables.length === 0) {
    results.push({
      test: 'Tables Exist',
      status: 'pass',
      message: `All ${tables.length} tables found`,
      data: { tables }
    });
  } else {
    results.push({
      test: 'Tables Exist',
      status: 'fail',
      message: `Missing tables: ${missingTables.join(', ')}`,
      data: { found: passedCount, missing: missingTables }
    });
  }
}

async function testDataQueries() {
  const queries = [
    { name: 'Experiences', query: () => supabase.from('experiences').select('id, title').limit(5) },
    { name: 'Categories', query: () => supabase.from('categories').select('id, name').limit(5) },
    { name: 'Profiles', query: () => supabase.from('profiles').select('id, first_name').limit(5) },
  ];

  for (const { name, query } of queries) {
    const start = Date.now();
    try {
      const { data, error } = await query();
      const duration = Date.now() - start;
      
      if (error) throw error;
      
      results.push({
        test: `Query: ${name}`,
        status: 'pass',
        message: `${data?.length || 0} rows returned (${duration}ms)`,
        duration
      });
    } catch (error: any) {
      results.push({
        test: `Query: ${name}`,
        status: 'fail',
        message: error.message
      });
    }
  }
}

async function testRLSPolicies() {
  try {
    // Test without auth (should be restricted)
    const { data: publicData } = await supabase.from('profiles').select('email').limit(1);
    
    // RLS working if we can't see private data
    const rlsWorking = !publicData || publicData.length === 0 || !publicData[0].email;
    
    results.push({
      test: 'RLS Policies',
      status: rlsWorking ? 'pass' : 'warning',
      message: rlsWorking 
        ? 'RLS policies are active (private data protected)' 
        : 'RLS may not be properly configured (can see private data)'
    });
  } catch (error: any) {
    results.push({
      test: 'RLS Policies',
      status: 'warning',
      message: `Could not verify RLS: ${error.message}`
    });
  }
}

async function checkDataPresence() {
  const checks = [
    { table: 'experiences', column: 'id' },
    { table: 'categories', column: 'id' },
    { table: 'availability', column: 'id' },
  ];

  const results_data: any = {};

  for (const { table, column } of checks) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select(column, { count: 'exact', head: true });
      
      if (!error) {
        results_data[table] = count || 0;
      }
    } catch {
      results_data[table] = 'error';
    }
  }

  const hasData = Object.values(results_data).some(v => typeof v === 'number' && v > 0);

  results.push({
    test: 'Data Presence',
    status: hasData ? 'pass' : 'warning',
    message: hasData 
      ? 'Database contains data' 
      : 'Database appears empty - may need seeding',
    data: results_data
  });
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 HEALTH CHECK RESULTS');
  console.log('='.repeat(60) + '\n');

  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.test}`);
    console.log(`   ${result.message}`);
    if (result.data) {
      console.log(`   Data:`, JSON.stringify(result.data, null, 2).split('\n').join('\n   '));
    }
    console.log('');

    if (result.status === 'pass') passCount++;
    else if (result.status === 'fail') failCount++;
    else warnCount++;
  });

  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passCount} | ❌ Failed: ${failCount} | ⚠️  Warnings: ${warnCount}`);
  console.log('='.repeat(60) + '\n');

  if (failCount === 0) {
    console.log('✅ Database is healthy and ready!\n');
  } else {
    console.log('❌ Database has issues that need attention.\n');
  }
}

// Run the health check
runHealthCheck().catch(console.error);
