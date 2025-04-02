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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/visitor');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        setVisitors(data.visitors);

        // Calculate statistics
        const today = new Date().toDateString();
        const activeToday = data.visitors.filter(
          (v: VisitorData) => new Date(v.lastVisit).toDateString() === today
        ).length;

        const totalVisits = data.visitors.reduce((acc: number, v: VisitorData) => acc + v.visitCount, 0);
        const averageVisits = totalVisits / data.visitors.length || 0;

        const browsers: { [key: string]: number } = {};
        const countries: { [key: string]: number } = {};

        data.visitors.forEach((v: VisitorData) => {
          browsers[v.browser] = (browsers[v.browser] || 0) + 1;
          if (v.country) {
            countries[v.country] = (countries[v.country] || 0) + 1;
          }
        });

        setStats({
          totalVisitors: data.visitors.length,
          activeToday,
          averageVisits,
          topBrowsers: browsers,
          topCountries: countries
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
                {visitors.map((visitor) => (
                  <tr key={visitor.visitorId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{visitor.visitorId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(visitor.firstVisit).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(visitor.lastVisit).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visitor.visitCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visitor.browser}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visitor.country || 'Unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 