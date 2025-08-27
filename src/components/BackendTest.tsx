import React, { useState } from 'react';
import { buildApiUrl, apiCall } from '../config/api';

const BackendTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Not tested');
  const [loading, setLoading] = useState<boolean>(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setStatus('Testing...');
    
    try {
      const response = await apiCall('/health');
      setStatus(`✅ Connected! Backend is running. Response: ${JSON.stringify(response)}`);
    } catch (error) {
      setStatus(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuthEndpoint = async () => {
    setLoading(true);
    setStatus('Testing auth endpoint...');
    
    try {
      // This should return an error since we're not authenticated, but it tests the endpoint
      const response = await apiCall('/api/auth/profile');
      setStatus(`✅ Auth endpoint accessible: ${JSON.stringify(response)}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        setStatus('✅ Auth endpoint working (401 Unauthorized expected)');
      } else {
        setStatus(`❌ Auth endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Backend Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Backend URL:</p>
          <code className="block p-2 bg-gray-100 rounded text-sm break-all">
            {buildApiUrl('/health')}
          </code>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            {loading ? 'Testing...' : 'Test Health Endpoint'}
          </button>
          
          <button
            onClick={testAuthEndpoint}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            {loading ? 'Testing...' : 'Test Auth Endpoint'}
          </button>
        </div>
        
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Status:</p>
          <div className="p-3 bg-gray-50 rounded border">
            <p className="text-sm text-gray-800">{status}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendTest;
