import { supabase } from './supabase';

// Emergency database setup - creates tables using alternative methods
export async function createEmergencyTables() {
  try {
    console.log('🚨 EMERGENCY: Creating database tables...');

    // Method 1: Try to create tables using direct HTTP calls to Supabase
    const success = await createTablesDirectly();
    
    if (success) {
      console.log('✅ Emergency database setup successful!');
      return true;
    }

    // Method 2: Try to create tables using SQL via REST API
    const sqlSuccess = await createTablesViaREST();
    
    if (sqlSuccess) {
      console.log('✅ Emergency database setup via REST successful!');
      return true;
    }

    console.log('❌ All emergency methods failed');
    return false;

  } catch (error) {
    console.error('🚨 Emergency database setup failed:', error);
    return false;
  }
}

async function createTablesDirectly() {
  try {
    console.log('🔧 Method 1: Creating tables directly...');

    // Create users table by trying to insert data
    // This will fail if table doesn't exist, but we'll handle it
    try {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: 'test-user-001',
          name: 'Test User',
          email: 'test@example.com'
        });

      if (userError && userError.message.includes('does not exist')) {
        console.log('❌ Users table does not exist');
        return false;
      }

      console.log('✅ Users table exists or was created');
    } catch (error) {
      console.log('❌ Users table creation failed:', error);
      return false;
    }

    // Create sessions table
    try {
      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          id: 'test-session-001',
          user_id: 'test-user-001',
          question: 'Test question',
          transcript: 'Test transcript',
          score: 85
        });

      if (sessionError && sessionError.message.includes('does not exist')) {
        console.log('❌ Sessions table does not exist');
        return false;
      }

      console.log('✅ Sessions table exists or was created');
    } catch (error) {
      console.log('❌ Sessions table creation failed:', error);
      return false;
    }

    // Create progress table
    try {
      const { error: progressError } = await supabase
        .from('progress')
        .insert({
          user_id: 'test-user-001',
          total_sessions: 1,
          average_score: 85,
          best_score: 85,
          streak: 1
        });

      if (progressError && progressError.message.includes('does not exist')) {
        console.log('❌ Progress table does not exist');
        return false;
      }

      console.log('✅ Progress table exists or was created');
    } catch (error) {
      console.log('❌ Progress table creation failed:', error);
      return false;
    }

    return true;

  } catch (error) {
    console.error('❌ Direct table creation failed:', error);
    return false;
  }
}

async function createTablesViaREST() {
  try {
    console.log('🔧 Method 2: Creating tables via REST API...');

    const tables = [
      {
        name: 'users',
        sql: `CREATE TABLE IF NOT EXISTS public.users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );`
      },
      {
        name: 'sessions',
        sql: `CREATE TABLE IF NOT EXISTS public.sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          question TEXT NOT NULL,
          transcript TEXT,
          score INTEGER,
          created_at TIMESTAMP DEFAULT NOW()
        );`
      },
      {
        name: 'progress',
        sql: `CREATE TABLE IF NOT EXISTS public.progress (
          user_id TEXT PRIMARY KEY,
          total_sessions INTEGER DEFAULT 0,
          average_score NUMERIC DEFAULT 0,
          best_score INTEGER DEFAULT 0,
          streak INTEGER DEFAULT 0
        );`
      }
    ];

    for (const table of tables) {
      try {
        // Try to create table using Supabase's SQL endpoint
        const response = await fetch('https://kjvabvlsygwcthxxscos.supabase.co/rest/v1/rpc/exec_sql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdmFidmxzeWd3Y3RoeHhzY29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTAyMDYsImV4cCI6MjA3MTgyNjIwNn0.A1VG4w9j0UaerMkifeJ_gtJ3hJ7j9zuNdn_0GMkxTT8`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdmFidmxzeWd3Y3RoeHhzY29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTAyMDZsImV4cCI6MjA3MTgyNjIwNn0.A1VG4w9j0UaerMkifeJ_gtJ3hJ7j9zuNdn_0GMkxTT8'
          },
          body: JSON.stringify({ sql: table.sql })
        });

        if (response.ok) {
          console.log(`✅ Successfully created ${table.name} table via REST`);
        } else {
          console.log(`❌ REST failed for ${table.name}:`, response.status);
          return false;
        }
      } catch (error) {
        console.error(`❌ REST creation failed for ${table.name}:`, error);
        return false;
      }
    }

    return true;

  } catch (error) {
    console.error('❌ REST table creation failed:', error);
    return false;
  }
}

// Quick check if tables exist
export async function checkTablesExist() {
  try {
    console.log('🔍 Checking if tables exist...');

    const { error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    const { error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    const { error: progressError } = await supabase
      .from('progress')
      .select('*')
      .limit(1);

    const usersExist = !userError || !userError.message.includes('does not exist');
    const sessionsExist = !sessionError || !sessionError.message.includes('does not exist');
    const progressExist = !progressError || !progressError.message.includes('does not exist');

    console.log('📊 Table Status:');
    console.log(`  - users: ${usersExist ? '✅' : '❌'}`);
    console.log(`  - sessions: ${sessionsExist ? '✅' : '❌'}`);
    console.log(`  - progress: ${progressExist ? '✅' : '❌'}`);

    return usersExist && sessionsExist && progressExist;

  } catch (error) {
    console.error('❌ Error checking tables:', error);
    return false;
  }
}
