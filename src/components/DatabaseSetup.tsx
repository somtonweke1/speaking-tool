import React, { useEffect, useState } from 'react';
import { setupDatabase, createTablesWithRawSQL } from '../config/setupDatabase';
import { createSimpleTables } from '../config/simpleDatabase';
import { createWorkingTables, createTablesViaHTTP } from '../config/workingDatabase';
import { createEmergencyTables, checkTablesExist } from '../config/emergencyDatabase';

export const DatabaseSetup: React.FC = () => {
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);

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
          
          // Try raw SQL method
          const rawSQLSuccess = await createTablesWithRawSQL();
          
          if (rawSQLSuccess) {
            console.log('Database setup completed via raw SQL!');
            setIsSetup(true);
          } else {
                      // Try simple table creation
          console.log('Trying simple table creation...');
          const simpleSuccess = await createSimpleTables();
          
          if (simpleSuccess) {
            console.log('Database setup completed via simple tables!');
            setIsSetup(true);
          } else {
            // Try working table creation
            console.log('Trying working table creation...');
            const workingSuccess = await createWorkingTables();
            
            if (workingSuccess) {
              console.log('Database setup completed via working tables!');
              setIsSetup(true);
            } else {
              // Try HTTP table creation
              console.log('Trying HTTP table creation...');
              const httpSuccess = await createTablesViaHTTP();
              
              if (httpSuccess) {
                console.log('Database setup completed via HTTP!');
                setIsSetup(true);
              } else {
                // Try emergency method
                console.log('🚨 Trying emergency database setup...');
                const emergencySuccess = await createEmergencyTables();
                
                if (emergencySuccess) {
                  console.log('🚨 Emergency database setup successful!');
                  setIsSetup(true);
                } else {
                  console.log('❌ All methods failed. Manual setup required.');
                  setIsSetup(false);
                }
              }
            }
          }
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

  const retrySetup = async () => {
    setAttempts(prev => prev + 1);
    setIsLoading(true);
    setIsSetup(null);
    
    try {
              const success = await setupDatabase();
        if (success) {
          setIsSetup(true);
        } else {
          const rawSQLSuccess = await createTablesWithRawSQL();
          if (rawSQLSuccess) {
            setIsSetup(true);
          } else {
            const simpleSuccess = await createSimpleTables();
            if (simpleSuccess) {
              setIsSetup(true);
            } else {
              const workingSuccess = await createWorkingTables();
              if (workingSuccess) {
                setIsSetup(true);
              } else {
                const httpSuccess = await createTablesViaHTTP();
                setIsSetup(httpSuccess);
              }
            }
          }
        }
    } catch (error) {
      console.error('Retry failed:', error);
      setIsSetup(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Setting up database... (Attempt {attempts + 1})</p>
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
            The database tables need to be created. I've tried multiple methods but they all failed.
          </p>
          
          <div className="space-y-3 mb-4">
            <button 
              onClick={retrySetup}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              🔄 Retry Automatic Setup
            </button>
            
            <button 
              onClick={() => window.open('https://supabase.com/dashboard/project/kjvabvlsygwcthxxscos/sql', '_blank')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              🗄️ Go to Supabase SQL Editor
            </button>

            <button 
              onClick={async () => {
                const exists = await checkTablesExist();
                if (exists) {
                  setIsSetup(true);
                } else {
                  alert('Tables still do not exist. Please create them in Supabase first.');
                }
              }}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
            >
              🔍 Check Table Status
            </button>
          </div>

          <div className="bg-gray-100 p-3 rounded text-sm">
            <p className="font-medium">Manual Steps:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Click "Go to Supabase SQL Editor" above</li>
              <li>Copy the contents of supabase-schema.sql</li>
              <li>Paste and run the SQL</li>
              <li>Click "Retry Automatic Setup" here</li>
            </ol>
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return null; // Database is ready, no need to show anything
};
