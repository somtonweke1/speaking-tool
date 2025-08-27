import React, { useEffect, useState } from 'react';
import { setupDatabase, createTablesWithMigrations } from '../config/setupDatabase';

export const DatabaseSetup: React.FC = () => {
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Checking database setup...');
        
        // First try to check if tables exist
        const tablesExist = await setupDatabase();
        
        if (tablesExist) {
          console.log('Database is ready!');
          setIsSetup(true);
        } else {
          console.log('Tables do not exist. Attempting to create...');
          
          // Try to create tables using migrations
          const migrationSuccess = await createTablesWithMigrations();
          
          if (migrationSuccess) {
            console.log('Database setup completed via migrations!');
            setIsSetup(true);
          } else {
            console.log('Migration failed. Manual setup required.');
            setIsSetup(false);
          }
        }
      } catch (error) {
        console.error('Database initialization failed:', error);
        setIsSetup(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Setting up database...</p>
        </div>
      </div>
    );
  }

  if (isSetup === false) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Database Setup Required</h3>
          <p className="text-gray-700 mb-4">
            The database tables need to be created. Please run the SQL schema in your Supabase project.
          </p>
          <div className="bg-gray-100 p-3 rounded text-sm">
            <p className="font-medium">Steps:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Go to <a href="https://supabase.com/dashboard/project/kjvabvlsygwcthxxscos/sql" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase SQL Editor</a></li>
              <li>Copy the contents of supabase-schema.sql</li>
              <li>Paste and run the SQL</li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return null; // Database is ready, no need to show anything
};
