import { supabase } from './supabase';

// Simple database setup that creates basic tables
export async function createSimpleTables() {
  try {
    console.log('Creating simple database tables...');

    // Create a simple users table by trying to insert data
    // If it fails, the table doesn't exist
    try {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Test User',
          email: 'test@example.com'
        });

      if (userError && userError.message.includes('does not exist')) {
        console.log('Users table does not exist - creating via SQL...');
        await createTableViaSQL('users', `
          CREATE TABLE public.users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
      }
    } catch (error) {
      console.log('Creating users table...');
      await createTableViaSQL('users', `
        CREATE TABLE public.users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
    }

    // Create sessions table
    try {
      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          id: '00000000-0000-0000-0000-000000000001',
          user_id: '00000000-0000-0000-0000-000000000001',
          question: 'Test question',
          transcript: 'Test transcript',
          score: 85
        });

      if (sessionError && sessionError.message.includes('does not exist')) {
        console.log('Sessions table does not exist - creating via SQL...');
        await createTableViaSQL('sessions', `
          CREATE TABLE public.sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            question TEXT NOT NULL,
            transcript TEXT,
            score INTEGER,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
      }
    } catch (error) {
      console.log('Creating sessions table...');
      await createTableViaSQL('sessions', `
        CREATE TABLE public.sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          question TEXT NOT NULL,
          transcript TEXT,
          score INTEGER,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
    }

    // Create progress table
    try {
      const { error: progressError } = await supabase
        .from('progress')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000001',
          total_sessions: 1,
          average_score: 85,
          best_score: 85,
          streak: 1
        });

      if (progressError && progressError.message.includes('does not exist')) {
        console.log('Progress table does not exist - creating via SQL...');
        await createTableViaSQL('progress', `
          CREATE TABLE public.progress (
            user_id TEXT PRIMARY KEY,
            total_sessions INTEGER DEFAULT 0,
            average_score NUMERIC DEFAULT 0,
            best_score INTEGER DEFAULT 0,
            streak INTEGER DEFAULT 0
          );
        `);
      }
    } catch (error) {
      console.log('Creating progress table...');
      await createTableViaSQL('progress', `
        CREATE TABLE public.progress (
          user_id TEXT PRIMARY KEY,
          total_sessions INTEGER DEFAULT 0,
          average_score NUMERIC DEFAULT 0,
          best_score INTEGER DEFAULT 0,
          streak INTEGER DEFAULT 0
        );
      `);
    }

    console.log('Simple table creation completed!');
    return true;

  } catch (error) {
    console.error('Simple table creation failed:', error);
    return false;
  }
}

async function createTableViaSQL(tableName: string, sql: string) {
  try {
    // Try to execute SQL via RPC
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.log(`Failed to create ${tableName} via RPC:`, error);
      // Try alternative method - direct HTTP call
      await createTableViaHTTP(tableName, sql);
    } else {
      console.log(`Successfully created ${tableName} table`);
    }
  } catch (error) {
    console.log(`RPC failed for ${tableName}, trying HTTP:`, error);
    await createTableViaHTTP(tableName, sql);
  }
}

async function createTableViaHTTP(tableName: string, sql: string) {
  try {
    const response = await fetch('https://kjvabvlsygwcthxxscos.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdmFidmxzeWd3Y3RoeHhzY29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTAyMDYsImV4cCI6MjA3MTgyNjIwNn0.A1VG4w9j0UaerMkifeJ_gtJ3hJ7j9zuNdn_0GMkxTT8`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdmFidmxzeWd3Y3RoeHhzY29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTAyMDYsImV4cCI6MjA3MTgyNjIwNn0.A1VG4w9j0UaerMkifeJ_gtJ3hJ7j9zuNdn_0GMkxTT8'
      },
      body: JSON.stringify({ sql })
    });

    if (response.ok) {
      console.log(`Successfully created ${tableName} table via HTTP`);
    } else {
      console.log(`HTTP failed for ${tableName}:`, response.status);
    }
  } catch (error) {
    console.error(`HTTP creation failed for ${tableName}:`, error);
  }
}
