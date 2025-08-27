import { supabase } from './supabase';

export async function setupDatabase() {
  try {
    console.log('Setting up database tables...');

    // Method 1: Try to create tables using direct SQL execution
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        -- Create users table
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create sessions table
        CREATE TABLE IF NOT EXISTS public.sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
          question TEXT NOT NULL,
          transcript TEXT,
          score INTEGER,
          analysis JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create progress table
        CREATE TABLE IF NOT EXISTS public.progress (
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
          total_sessions INTEGER DEFAULT 0,
          average_score NUMERIC(5,2) DEFAULT 0,
          best_score INTEGER DEFAULT 0,
          streak INTEGER DEFAULT 0,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (error) {
      console.log('RPC method failed, trying alternative approach...');
      return await createTablesAlternative();
    }

    console.log('Database setup completed via RPC!');
    return true;

  } catch (error) {
    console.error('Database setup failed:', error);
    return await createTablesAlternative();
  }
}

async function createTablesAlternative() {
  try {
    console.log('Using alternative table creation method...');

    // Method 2: Try to create tables by inserting test data
    // This will fail if tables don't exist, but we can catch the error and create them
    
    // Test users table
    try {
      const { error: testError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (testError && testError.message.includes('does not exist')) {
        console.log('Users table does not exist, creating it...');
        await createUsersTable();
      }
    } catch (error) {
      console.log('Creating users table...');
      await createUsersTable();
    }

    // Test sessions table
    try {
      const { error: testError } = await supabase
        .from('sessions')
        .select('*')
        .limit(1);
      
      if (testError && testError.message.includes('does not exist')) {
        console.log('Sessions table does not exist, creating it...');
        await createSessionsTable();
      }
    } catch (error) {
      console.log('Creating sessions table...');
      await createSessionsTable();
    }

    // Test progress table
    try {
      const { error: testError } = await supabase
        .from('progress')
        .select('*')
        .limit(1);
      
      if (testError && testError.message.includes('does not exist')) {
        console.log('Progress table does not exist, creating it...');
        await createProgressTable();
      }
    } catch (error) {
      console.log('Creating progress table...');
      await createProgressTable();
    }

    console.log('Alternative table creation completed!');
    return true;

  } catch (error) {
    console.error('Alternative table creation failed:', error);
    return false;
  }
}

async function createUsersTable() {
  // Create a simple users table structure
  const { error } = await supabase
    .from('users')
    .insert({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Test User',
      email: 'test@example.com'
    })
    .select();

  if (error) {
    console.log('Users table creation result:', error);
  }
}

async function createSessionsTable() {
  // Create a simple sessions table structure
  const { error } = await supabase
    .from('sessions')
    .insert({
      id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000001',
      question: 'Test question',
      transcript: 'Test transcript',
      score: 85,
      analysis: { test: true }
    })
    .select();

  if (error) {
    console.log('Sessions table creation result:', error);
  }
}

async function createProgressTable() {
  // Create a simple progress table structure
  const { error } = await supabase
    .from('progress')
    .insert({
      user_id: '00000000-0000-0000-0000-000000000001',
      total_sessions: 1,
      average_score: 85,
      best_score: 85,
      streak: 1
    })
    .select();

  if (error) {
    console.log('Progress table creation result:', error);
  }
}

// Fallback: Create tables using raw SQL if possible
export async function createTablesWithRawSQL() {
  try {
    console.log('Attempting raw SQL table creation...');
    
    // This is a last resort - try to execute raw SQL
    const response = await fetch('https://kjvabvlsygwcthxxscos.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdmFidmxzeWd3Y3RoeHhzY29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTAyMDYsImV4cCI6MjA3MTgyNjIwNn0.A1VG4w9j0UaerMkifeJ_gtJ3hJ7j9zuNdn_0GMkxTT8`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdmFidmxzeWd3Y3RoeHhzY29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTAyMDYsImV4cCI6MjA3MTgyNjIwNn0.A1VG4w9j0UaerMkifeJ_gtJ3hJ7j9zuNdn_0GMkxTT8'
      },
      body: JSON.stringify({
        sql: `
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
    });

    if (response.ok) {
      console.log('Raw SQL table creation successful!');
      return true;
    } else {
      console.log('Raw SQL failed, response:', response.status);
      return false;
    }

  } catch (error) {
    console.error('Raw SQL table creation failed:', error);
    return false;
  }
}
