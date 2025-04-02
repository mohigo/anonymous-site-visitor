'use client';

import { useEffect, useState } from 'react';
import { VisitorData } from '@/lib/fingerprint';

export default function VisitorProfile() {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisitorData = async () => {
    try {
      // First try to get current visitor data from localStorage
      const storedData = localStorage.getItem('visitorData');
      let currentVisitor = storedData ? JSON.parse(storedData) : null;

      // If no stored data, fetch from API
      if (!currentVisitor) {
        const response = await fetch('/api/visitor');
        if (!response.ok) {
          throw new Error('Failed to fetch visitor data');
        }
        const data = await response.json();
        if (data.visitors && data.visitors.length > 0) {
          currentVisitor = data.visitors[0];
          // Ensure preferences exist
          currentVisitor.preferences = currentVisitor.preferences || {
            theme: 'light',
            language: navigator.language || 'en'
          };
          // Store the data for future use
          localStorage.setItem('visitorData', JSON.stringify(currentVisitor));
        }
      }

      if (!currentVisitor) {
        throw new Error('No visitor data available');
      }

      // Ensure preferences exist before setting state
      if (!currentVisitor.preferences) {
        currentVisitor.preferences = {
          theme: 'light',
          language: navigator.language || 'en'
        };
      }

      setVisitorData(currentVisitor);
    } catch (err) {
      console.error('Error fetching visitor data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load visitor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitorData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchVisitorData, 30000);
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

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Visitor Profile</h2>
        <div className="text-red-500 p-4 text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!visitorData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Visitor Profile</h2>
        <div className="text-gray-500 p-4 text-center">
          No visitor data available
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
            <p className="mt-1 text-sm font-medium text-gray-700">{visitorData?.visitorId}</p>
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

      {visitorData?.patterns?.behaviorPatterns?.length > 0 && (
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