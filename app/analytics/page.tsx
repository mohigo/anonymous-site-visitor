'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface VisitorData {
  visitorId: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  browser: string;
  country: string;
  preferences: {
    theme: string;
    language: string;
  };
}

interface AnalyticsStats {
  totalVisitors: number;
  activeToday: number;
  averageVisits: number;
  topBrowsers: { [key: string]: number };
  topCountries: { [key: string]: number };
}

export default function AnalyticsPage() {
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalVisitors: 0,
    activeToday: 0,
    averageVisits: 0,
    topBrowsers: {},
    topCountries: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add formatVisitorId function
  const formatVisitorId = (id: string): string => {
    if (!id) return 'Unknown';
    
    // If it's a hash-like string, truncate it
    if (id.length > 8 && /^[0-9a-f]+$/.test(id)) {
      return `${id.slice(0, 8)}...`;
    }
    
    // If it's a numeric string with decimals
    if (id.includes('.')) {
      return 'Visitor-' + id.split('.')[0].slice(-4);
    }
    
    // If it contains 'NaN', replace with a more friendly identifier
    if (id.includes('NaN')) {
      return 'Visitor-New';
    }
    
    // For any other case, truncate if too long
    return id.length > 12 ? `${id.slice(0, 12)}...` : id;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/visitors', {
          // Add cache control headers to prevent caching
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        setVisitors(data.recentVisitors);

        // Update stats with the data from the API
        setStats({
          totalVisitors: data.totalVisitors,
          activeToday: data.activeVisitors,
          averageVisits: data.uniqueVisitors > 0 ? data.totalVisitors / data.uniqueVisitors : 0,
          topBrowsers: data.topBrowsers.reduce((acc: { [key: string]: number }, item: any) => {
            acc[item.browser] = item.count;
            return acc;
          }, {}),
          topCountries: data.topCountries.reduce((acc: { [key: string]: number }, item: any) => {
            acc[item.country] = item.count;
            return acc;
          }, {})
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up auto-refresh every 10 seconds
    const intervalId = setInterval(fetchData, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array since we want this to run once on mount

  if (loading) {
    return <div className="text-gray-500">Loading analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Visitor Analytics</h1>
          <Link 
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Visitors</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalVisitors}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Today</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeToday}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Avg. Visits per User</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.averageVisits.toFixed(1)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Most Common Browser</h3>
            <p className="text-3xl font-bold text-orange-600">
              {Object.entries(stats.topBrowsers).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
            </p>
          </div>
        </div>

        {/* Browser Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Browser Distribution</h3>
            <div className="space-y-4">
              {Object.entries(stats.topBrowsers)
                .sort((a, b) => b[1] - a[1])
                .map(([browser, count]) => (
                  <div key={browser} className="flex justify-between items-center">
                    <span className="text-gray-600">{browser}</span>
                    <span className="font-semibold">{count} visitors</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Country Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Country Distribution</h3>
            <div className="space-y-4">
              {Object.entries(stats.topCountries)
                .sort((a, b) => b[1] - a[1])
                .map(([country, count]) => (
                  <div key={country} className="flex justify-between items-center">
                    <span className="text-gray-600">{country || 'Unknown'}</span>
                    <span className="font-semibold">{count} visitors</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Recent Visitors */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h3 className="text-xl font-semibold text-gray-700 p-6 border-b">Recent Visitors</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Visit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visitors.map((visitor) => {
                  const firstVisitDate = new Date(visitor.firstVisit);
                  const lastVisitDate = new Date(visitor.lastVisit);
                  const formattedId = formatVisitorId(visitor.visitorId);
                  
                  return (
                    <tr key={`visitor-${visitor.visitorId}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        <span title={visitor.visitorId}>{formattedId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{firstVisitDate.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lastVisitDate.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visitor.visitCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visitor.browser}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visitor.country || 'Unknown'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 