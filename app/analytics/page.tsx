'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ChartBarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ClockIcon } from '@heroicons/react/24/solid';

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

interface AnalyticsData {
  recentVisitors: VisitorData[];
  totalVisitors: number;
  uniqueVisitors: number;
  activeVisitors: number;
  hourlyVisitors: number[];
  topBrowsers: Array<{ browser: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  patterns: {
    peakHours: number[];
    returningVisitorRate: number;
    averageVisitDuration: number;
    anomalies: Array<{
      score: number;
      isAnomaly: boolean;
      reasons: string[];
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format visitor IDs for better readability
  const formatVisitorId = (id: string): string => {
    if (!id) return 'Unknown';
    if (id.length > 8 && /^[0-9a-f]+$/.test(id)) {
      return `${id.slice(0, 8)}...`;
    }
    if (id.includes('.')) {
      return 'Visitor-' + id.split('.')[0].slice(-4);
    }
    if (id.includes('NaN')) {
      return 'Visitor-New';
    }
    return id.length > 12 ? `${id.slice(0, 12)}...` : id;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/visitors', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading analytics...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  if (!data) return null;

  const hourlyData = data.hourlyVisitors.map((count, hour) => ({
    hour: `${hour}:00`,
    visitors: count,
    isPeak: data.patterns?.peakHours?.includes(hour) || false
  }));

  // Default values for patterns if not available
  const patterns = {
    returningVisitorRate: data.patterns?.returningVisitorRate || 0,
    averageVisitDuration: data.patterns?.averageVisitDuration || 0,
    anomalies: data.patterns?.anomalies || []
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Analytics Dashboard</h1>
            <p className="text-xl opacity-90 font-light">
              Comprehensive insights into your visitor patterns and behaviors
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 -mt-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-xl">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Visitors</h3>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{data.totalVisitors}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-xl">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Today</h3>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{data.activeVisitors}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-xl">
                <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg Visits/User</h3>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {(data.totalVisitors / data.uniqueVisitors || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-50 rounded-xl">
                <ArrowPathIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Return Rate</h3>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {(patterns.returningVisitorRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Peak Hours Analysis */}
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Peak Hours Analysis</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="hour" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="visitors" 
                    fill="#6366F1" 
                    name="Visitors"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="isPeak" 
                    fill="#34D399" 
                    name="Peak Hours"
                    radius={[4, 4, 0, 0]}
                    opacity={0.3}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
              Peak hours are highlighted in green. These are times when visitor traffic is significantly above average.
            </div>
          </div>

          {/* Browser Distribution */}
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Browser Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.topBrowsers}
                    dataKey="count"
                    nameKey="browser"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {data.topBrowsers.map((entry, index) => (
                      <Cell 
                        key={`browser-${entry.browser}-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Country Distribution */}
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Country Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.topCountries}
                    dataKey="count"
                    nameKey="country"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {data.topCountries.map((entry, index) => (
                      <Cell 
                        key={`country-${entry.country}-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Engagement Metrics</h2>
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                <ClockIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Visit Duration</h3>
                  <p className="text-xl font-semibold text-gray-900 mt-1">
                    {Math.round(patterns.averageVisitDuration / 1000 / 60)} minutes
                  </p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-green-50 rounded-xl">
                <GlobeAltIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Geographic Distribution</h3>
                  <p className="text-xl font-semibold text-gray-900 mt-1">
                    {data.topCountries.length} countries
                  </p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                <ComputerDesktopIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Browser Diversity</h3>
                  <p className="text-xl font-semibold text-gray-900 mt-1">
                    {data.topBrowsers.length} different browsers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Visitors Table */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden mb-12">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Recent Visitors</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor ID</th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Visit</th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visits</th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser</th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.recentVisitors.map((visitor) => (
                  <tr 
                    key={`${visitor.visitorId}-${new Date(visitor.lastVisit).getTime()}`}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-8 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                      <span title={visitor.visitorId}>{formatVisitorId(visitor.visitorId)}</span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(visitor.firstVisit).toLocaleString()}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(visitor.lastVisit).toLocaleString()}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600">
                      {visitor.visitCount}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600">
                      {visitor.browser}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600">
                      {visitor.country || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Anomaly Detection</h2>
          <div className="space-y-4">
            {patterns.anomalies
              .filter(anomaly => anomaly.isAnomaly)
              .slice(0, 5)
              .map((anomaly, index) => (
                <div 
                  key={`anomaly-${index}-${anomaly.score}`} 
                  className="flex items-start p-6 bg-red-50 rounded-xl border border-red-100"
                >
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-4 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-red-900">Suspicious Activity Detected</h3>
                    <p className="text-red-700 mt-2">Anomaly Score: {(anomaly.score * 100).toFixed(2)}%</p>
                    <ul className="mt-3 space-y-2">
                      {anomaly.reasons.map((reason, i) => (
                        <li 
                          key={`reason-${index}-${i}`}
                          className="flex items-center text-red-600"
                        >
                          <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            {patterns.anomalies.filter(anomaly => anomaly.isAnomaly).length === 0 && (
              <div className="text-center text-gray-600 py-8 bg-gray-50 rounded-xl">
                No suspicious activity detected in recent visits.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 