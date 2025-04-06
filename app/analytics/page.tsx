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
  ExclamationTriangleIcon,
  UsersIcon
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
  totalVisits: number;
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

const COLORS = [
  '#6366F1', // Indigo
  '#34D399', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#F97316', // Orange
  '#06B6D4'  // Cyan
];

const CHART_STYLES = {
  tooltip: {
    contentStyle: {
      backgroundColor: 'white',
      border: 'none',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '1rem'
    }
  },
  gradientBar: {
    fill: 'url(#colorGradient)'
  }
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format visitor IDs for better readability
  const formatVisitorId = (id: string): string => {
    // Handle null, undefined, or non-string values
    if (!id || typeof id !== 'string') return 'Unknown';
    
    // Handle hexadecimal IDs (e.g. fingerprint hashes)
    if (id.length > 8 && /^[0-9a-f]+$/i.test(id)) {
      return `${id.slice(0, 8)}...`;
    }
    
    try {
      // Handle IDs with periods
      if (id.indexOf('.') !== -1) {
        const parts = id.split('.');
        if (parts[0] && parts[0].length >= 4) {
          return 'Visitor-' + parts[0].slice(-4);
        }
        return 'Visitor-' + id.slice(0, 4);
      }
      
      // Handle NaN cases
      if (id.indexOf('NaN') !== -1) {
        return 'Visitor-New';
      }
    } catch (e) {
      console.error('Error formatting visitor ID:', e);
      return 'Unknown';
    }
    
    // Default case: truncate long IDs
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

  const hourlyData = data.hourlyVisitors.map((count, hour) => {
    // Convert UTC hour to local hour
    const localHour = (hour - new Date().getTimezoneOffset() / 60 + 24) % 24;
    return {
      hour: `${localHour}:00`,
      visitors: count,
      isPeak: data.patterns?.peakHours?.includes(hour) || false
    };
  }).sort((a, b) => parseInt(a.hour) - parseInt(b.hour)); // Sort by hour to maintain order

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
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Visitors</h3>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{data.uniqueVisitors}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-xl">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Visitors Today</h3>
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
                  {data.totalVisits && data.uniqueVisitors ? 
                    Number(data.totalVisits / data.uniqueVisitors).toFixed(1) : 
                    '0.0'
                  }
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
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.4} />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#6B7280" 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip 
                    {...CHART_STYLES.tooltip}
                    cursor={{ fill: '#F3F4F6' }}
                    formatter={(value: any, name: string) => [
                      value,
                      name === 'isPeak' ? 'Peak Hour' : 'Visitors'
                    ]}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '1rem' }}
                    formatter={(value) => value === 'isPeak' ? 'Peak Hours' : value}
                  />
                  <Bar 
                    dataKey="visitors" 
                    {...CHART_STYLES.gradientBar}
                    name="Visitors"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                  <Bar 
                    dataKey="isPeak" 
                    fill="#34D399" 
                    name="Peak Hours"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                    opacity={0.3}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 text-sm text-gray-600 bg-gradient-to-r from-indigo-50 to-emerald-50 p-4 rounded-xl border border-indigo-100/50">
              Peak hours are highlighted in green. These are times when visitor traffic is significantly above average.
            </div>
          </div>

          {/* Browser Distribution */}
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Browser Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.3}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={data.topBrowsers}
                    dataKey="count"
                    nameKey="browser"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      value,
                      index
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = 25 + innerRadius + (outerRadius - innerRadius);
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#374151"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          className="text-xs"
                        >
                          {data.topBrowsers[index].browser} ({value})
                        </text>
                      );
                    }}
                  >
                    {data.topBrowsers.map((entry, index) => (
                      <Cell 
                        key={`browser-${entry.browser}-${index}`} 
                        fill={`url(#gradient-${index})`}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip {...CHART_STYLES.tooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Country Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Country Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`gradient-${index}`} id={`country-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.3}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={data.topCountries}
                    dataKey="count"
                    nameKey="country"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      value,
                      index
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = 25 + innerRadius + (outerRadius - innerRadius);
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#374151"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          className="text-xs"
                        >
                          {data.topCountries[index].country} ({value})
                        </text>
                      );
                    }}
                  >
                    {data.topCountries.map((entry, index) => (
                      <Cell 
                        key={`country-${entry.country}-${index}`} 
                        fill={`url(#country-gradient-${index})`}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip {...CHART_STYLES.tooltip} />
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Anomaly Detection</h2>
              <p className="text-sm text-gray-500 mt-1">Monitoring unusual patterns and suspicious activities</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`h-2.5 w-2.5 rounded-full ${patterns.anomalies.some(a => a.isAnomaly) ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium text-gray-600">
                {patterns.anomalies.some(a => a.isAnomaly) ? 'Anomalies Detected' : 'All Systems Normal'}
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            {patterns.anomalies
              .filter(anomaly => anomaly.isAnomaly)
              .slice(0, 5)
              .map((anomaly, index) => (
                <div 
                  key={`anomaly-${index}-${anomaly.score}`} 
                  className="group relative overflow-hidden bg-gradient-to-r from-red-50 via-red-50 to-orange-50 rounded-2xl border border-red-100 transition-all duration-300 hover:shadow-md"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-red-900">Suspicious Activity Detected</h3>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
                              Score: {(anomaly.score * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                        <ul className="mt-4 space-y-3">
                          {anomaly.reasons.map((reason, i) => (
                            <li 
                              key={`reason-${index}-${i}`}
                              className="flex items-center text-red-700 bg-red-100/50 px-4 py-2 rounded-lg"
                            >
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></span>
                              <span className="text-sm">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {patterns.anomalies.filter(anomaly => anomaly.isAnomaly).length === 0 && (
              <div className="relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
                <div className="relative flex items-center justify-center">
                  <div className="bg-green-100 rounded-full p-3 mr-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-green-900">All Systems Normal</h3>
                    <p className="text-green-700 mt-1">No suspicious activity detected in recent visits.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 