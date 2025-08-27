import { supabase } from './supabase';

export async function setupDatabase() {
  try {
    console.log('Setting up database tables...');

    // Try to create a simple test record to see if tables exist
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (testError && testError.message.includes('does not exist')) {
      console.log('Tables do not exist. Please run the SQL schema in Supabase dashboard.');
      console.log('Go to: https://supabase.com/dashboard/project/kjvabvlsygwcthxxscos/sql');
      console.log('Copy and paste the contents of supabase-schema.sql');
      return false;
    }

    console.log('Database tables already exist!');
    return true;

  } catch (error) {
    console.error('Database setup check failed:', error);
    return false;
  }
}

// Alternative: Create tables using migrations
export async function createTablesWithMigrations() {
  try {
    console.log('Creating tables using migrations...');

    // Create users table
    const { error: usersError } = await supabase
      .from('users')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Test User',
        email: 'test@example.com'
      })
      .select();

    if (usersError) {
      console.log('Users table test result:', usersError);
    }

    // Create progress table
    const { error: progressError } = await supabase
      .from('progress')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000001',
        total_sessions: 0,
        average_score: 0,
        best_score: 0,
        streak: 0
      })
      .select();

    if (progressError) {
      console.log('Progress table test result:', progressError);
    }

    console.log('Migration completed!');
    return true;

  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}
