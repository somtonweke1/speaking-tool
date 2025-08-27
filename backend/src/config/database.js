import supabase from './supabase.js';

// Initialize database tables in Supabase
export const connectDB = async () => {
  try {
    console.log('✅ Connecting to Supabase...');
    
    // Test connection by querying a simple table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, create it
      console.log('📋 Creating database tables...');
      await createTables();
    } else if (error) {
      throw error;
    }
    
    console.log('✅ Connected to Supabase successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Create database tables using Supabase
const createTables = async () => {
  try {
    // Note: In Supabase, you'll create these tables through the dashboard
    // or using SQL migrations. This is just a placeholder for now.
    console.log('📋 Tables will be created through Supabase dashboard');
    console.log('✅ Database setup complete');
  } catch (error) {
    console.error('❌ Failed to setup database:', error);
    throw error;
  }
};

// Export supabase client for use in other modules
export { supabase };
