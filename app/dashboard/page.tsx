'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  ClockIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ClockIcon as ClockIconSolid2 } from '@heroicons/react/24/solid';

interface VisitorData {
  visitorId: string;
  timestamp: number;
  userAgent: string;
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  language: string;
  browser?: string;
  country?: string;
}

interface AnomalyScore {
  score: number;
  threshold: number;
  isAnomaly: boolean;
  reasons: string[];
}

interface AnalyticsData {
  visitors: VisitorData[];
  stats: {
    totalVisitors: number;
    uniqueVisitors: number;
    activeToday: number;
    averageVisitsPerUser: number;
  };
  hourlyVisitors: number[];
  browserDistribution: { [key: string]: number };
  countryDistribution: { [key: string]: number };
  patterns: {
    peakHours: number[];
    browserPatterns: { [key: string]: number };
    returningVisitorRate: number;
    averageVisitDuration: number;
    anomalies: AnomalyScore[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/visitor');
        if (!response.ok) throw new Error('Failed to fetch data');
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  if (!data) return null;

  const hourlyData = data.hourlyVisitors.map((count, hour) => ({
    hour: `${hour}:00`,
    visitors: count,
    isPeak: data.patterns.peakHours.includes(hour)
  }));

  const browserData = Object.entries(data.browserDistribution).map(([name, value]) => ({
    name,
    value
  }));

  const countryData = Object.entries(data.countryDistribution).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Total Visitors</h3>
                  <p className="text-2xl font-semibold text-gray-700">{data.stats.totalVisitors}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Active Today</h3>
                  <p className="text-2xl font-semibold text-gray-700">{data.stats.activeToday}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Avg Visits/User</h3>
                  <p className="text-2xl font-semibold text-gray-700">
                    {data.stats.averageVisitsPerUser.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ArrowPathIcon className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Return Rate</h3>
                  <p className="text-2xl font-semibold text-gray-700">
                    {(data.patterns.returningVisitorRate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ML-Based Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Peak Hours Analysis</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="visitors" 
                      fill="#8884d8" 
                      name="Visitors"
                    />
                    <Bar 
                      dataKey="isPeak" 
                      fill="#82ca9d" 
                      name="Peak Hours"
                      opacity={0.3}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Peak hours are highlighted in green. These are times when visitor traffic is significantly above average.
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Browser Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={browserData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {browserData.map((entry) => (
                        <Cell key={`browser-${entry.name}`} fill={COLORS[browserData.indexOf(entry) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Country Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={countryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {countryData.map((entry) => (
                        <Cell key={`country-${entry.name}`} fill={COLORS[countryData.indexOf(entry) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Engagement Metrics</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <ClockIconSolid2 className="h-6 w-6 text-blue-500 mr-2" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Average Visit Duration</h3>
                    <p className="text-gray-600">
                      {Math.round(data.patterns.averageVisitDuration / 1000 / 60)} minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <GlobeAltIcon className="h-6 w-6 text-green-500 mr-2" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Geographic Distribution</h3>
                    <p className="text-gray-600">
                      {Object.keys(data.countryDistribution).length} countries
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <ComputerDesktopIcon className="h-6 w-6 text-purple-500 mr-2" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Browser Diversity</h3>
                    <p className="text-gray-600">
                      {Object.keys(data.browserDistribution).length} different browsers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Anomaly Detection */}
          <div className="mt-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Anomaly Detection</h2>
              <div className="space-y-4">
                {data.patterns.anomalies
                  .filter(anomaly => anomaly.isAnomaly)
                  .slice(0, 5)
                  .map((anomaly, index) => (
                    <div key={`anomaly-${anomaly.score}-${index}`} className="flex items-start p-4 bg-red-50 rounded-lg">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3 mt-1" />
                      <div>
                        <h3 className="text-lg font-medium text-red-900">Suspicious Activity Detected</h3>
                        <p className="text-red-700 mt-1">Anomaly Score: {(anomaly.score * 100).toFixed(2)}%</p>
                        <ul className="mt-2 list-disc list-inside text-red-600">
                          {anomaly.reasons.map((reason) => (
                            <li key={`reason-${reason}`}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                {data.patterns.anomalies.filter(anomaly => anomaly.isAnomaly).length === 0 && (
                  <div className="text-center text-gray-600 py-4">
                    No suspicious activity detected in recent visits.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 