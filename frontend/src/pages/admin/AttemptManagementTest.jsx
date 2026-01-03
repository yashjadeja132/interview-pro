import React, { useState, useEffect } from 'react';
import { adminAttemptService } from '../../services/adminAttemptService';

const AttemptManagementTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing API connection...');
      const response = await adminAttemptService.getAllAttempts({ page: 1, limit: 5 });
      console.log('API Response:', response);
      setData(response);
    } catch (error) {
      console.error('API Error:', error);
      setError(error.message || 'API call failed');
    } finally {
      setLoading(false);
    }
  };

  const testAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing Analytics API...');
      const response = await adminAttemptService.getAttemptAnalytics('30d');
      console.log('Analytics Response:', response);
      setData(response);
    } catch (error) {
      console.error('Analytics Error:', error);
      setError(error.message || 'Analytics API call failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Attempt Management API Test</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={testAPI}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Get Attempts API'}
          </button>
          
          <button
            onClick={testAnalytics}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Analytics API'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {data && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <h3 className="font-bold">Success:</h3>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Debug Information:</h3>
          <div className="text-sm space-y-1">
            <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
            <p><strong>User:</strong> {localStorage.getItem('user') || 'Not found'}</p>
            <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:5000/api'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptManagementTest;
