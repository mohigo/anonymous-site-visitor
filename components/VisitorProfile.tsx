'use client';

import { useEffect, useState } from 'react';
import { VisitorData } from '@/lib/types';
import { UserIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function VisitorProfile() {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  const fetchVisitorData = async () => {
    try {
      // Get current visitor ID from localStorage
      const storedData = localStorage.getItem('visitorData');
      const currentVisitor = storedData ? JSON.parse(storedData) : null;
      
      if (!currentVisitor?.visitorId) {
        // If no visitor data, this is a first-time user
        setLoading(false);
        setVisitorData(null);
        setIsFirstTimeUser(true);
        return;
      }

      // Always fetch fresh data from server
      const response = await fetch(`/api/visitor?id=${currentVisitor.visitorId}`);
      
      if (response.status === 404) {
        // Visitor ID exists in localStorage but not in database yet
        setIsFirstTimeUser(true);
        setVisitorData(null);
        setError(null);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch visitor data');
      }
      
      const data = await response.json();
      
      if (!data || data.error) {
        throw new Error(data.error || 'No visitor data available');
      }

      setVisitorData(data);
      setIsFirstTimeUser(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching visitor data:', err);
      // Only set error if not a first-time user scenario
      if (!isFirstTimeUser) {
        setError(err instanceof Error ? err.message : 'Failed to load visitor data');
      }
      setVisitorData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchVisitorData();

    // Set up polling interval
    const interval = setInterval(fetchVisitorData, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Visitor Profile</h2>
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (isFirstTimeUser || (!visitorData && !error)) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Visitor Profile</h2>
        <div className="text-center p-8">
          <div className="bg-blue-50 rounded-full p-3 mx-auto w-fit mb-4">
            <UserIcon className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600">Welcome! Your profile will be available after your first interaction.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Visitor Profile</h2>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <ExclamationCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Visitor Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Visitor ID</h3>
            <p className="mt-1 text-sm font-medium text-gray-700">
              {visitorData?.visitorId || 'Not Available'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">First Visit</h3>
            <p className="mt-1 text-sm font-medium text-gray-700">
              {visitorData?.firstVisit ? new Date(visitorData.firstVisit).toLocaleString() : 'N/A'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Visit</h3>
            <p className="mt-1 text-sm font-medium text-gray-700">
              {visitorData?.lastVisit ? new Date(visitorData.lastVisit).toLocaleString() : 'N/A'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Visits</h3>
            <p className="mt-1 text-sm font-medium text-gray-700">{visitorData?.visitCount || 1}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Browser</h3>
            <p className="mt-1 text-sm font-medium text-gray-700">{visitorData?.browser || 'Unknown'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Country</h3>
            <p className="mt-1 text-sm font-medium text-gray-700">{visitorData?.country || 'Unknown'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Theme</h3>
            <p className="mt-1 text-sm font-medium text-gray-700">{visitorData?.preferences?.theme || 'light'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Language</h3>
            <p className="mt-1 text-sm font-medium text-gray-700">{visitorData?.preferences?.language || 'en'}</p>
          </div>
        </div>
      </div>

      {visitorData?.patterns?.behaviorPatterns && visitorData.patterns.behaviorPatterns.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">ML Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Behavior Patterns</h4>
              <ul className="mt-2 space-y-2">
                {visitorData.patterns.behaviorPatterns.map((pattern: string, index: number) => (
                  <li key={index} className="text-gray-700">
                    • {pattern}
                  </li>
                ))}
              </ul>
            </div>
            
            {visitorData.patterns.anomalyScore && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Anomaly Detection</h4>
                <div className="mt-2">
                  <p className="text-gray-700">
                    Status: {visitorData.patterns.anomalyScore.isAnomaly ? 'Suspicious' : 'Normal'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Confidence: {(visitorData.patterns.anomalyScore.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 