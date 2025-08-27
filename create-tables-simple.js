// Simple script to create Supabase database tables
const SUPABASE_URL = 'https://kjvabvlsygwcthxxscos.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdmFidmxzeWd3Y3RoeHhzY29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTAyMDYsImV4cCI6MjA3MTgyNjIwNn0.A1VG4w9j0UaerMkifeJ_gtJ3hJ7j9zuNdn_0GMkxTT8';

async function createTables() {
    console.log('🚀 Creating database tables...');

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
            console.log(`🔧 Creating ${table.name} table...`);
            
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'apikey': SUPABASE_KEY
                },
                body: JSON.stringify({ sql: table.sql })
            });

            if (response.ok) {
                console.log(`✅ ${table.name} table created successfully!`);
            } else {
                console.log(`❌ Failed to create ${table.name} table: HTTP ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ Error creating ${table.name} table:`, error.message);
        }
    }

    console.log('🎉 Table creation completed!');
}

// Run the script
createTables().catch(console.error);
