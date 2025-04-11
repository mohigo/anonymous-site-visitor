'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  UsersIcon,
  ChartPieIcon,
  ShieldExclamationIcon,
  CheckCircleIcon
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

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive design for mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resizing
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Handle viewing all visitors
  const handleViewAllVisitors = () => {
    // This is a placeholder - in a real app, you might:
    // 1. Open a modal with more visitors
    // 2. Navigate to a dedicated visitors page
    // 3. Load more visitors in-place
    console.log('View all visitors clicked');
    // For demonstration purposes only
    alert('This would show all visitors in a full page or modal view');
  };

  // Handle anchor link scrolling
  useEffect(() => {
    // Check if there's a hash in the URL (e.g., #anomaly-detection)
    if (typeof window !== 'undefined') {
      const scrollToHash = () => {
        const hash = window.location.hash;
        if (hash) {
          const id = hash.substring(1); // Remove the # character
          const element = document.getElementById(id);
          
          if (element) {
            // Ensure the element exists before scrolling
            setTimeout(() => {
              const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 100;
              window.scrollTo({
                top: topOffset,
                behavior: 'smooth'
              });
            }, 300);
          }
        }
      };
      
      // Initial scroll when component mounts
      scrollToHash();
      
      // Also add event listener for hash changes
      window.addEventListener('hashchange', scrollToHash);
      
      return () => {
        window.removeEventListener('hashchange', scrollToHash);
      };
    }
  }, []);

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
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="bg-red-50 rounded-full p-3 mx-auto w-fit mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <motion.div 
          className="container mx-auto px-4 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <ChartPieIcon className="h-16 w-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Learn how we balance powerful analytics with user privacy through advanced machine learning and ethical data practices
            </p>
          </div>
        </motion.div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <motion.div 
          className="max-w-7xl mx-auto space-y-12"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {/* Key Metrics */}
          <motion.section variants={fadeIn} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
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
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
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
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
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
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
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
          </motion.section>

          {/* Charts Section */}
          <motion.section variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
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
              <div className="h-96 md:h-96 sm:h-80">
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
                      innerRadius={isMobile ? 40 : 60}
                      outerRadius={isMobile ? 60 : 80}
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
                        // Adjust radius based on device size
                        const radius = isMobile ? 
                          30 + innerRadius + (outerRadius - innerRadius) : 
                          25 + innerRadius + (outerRadius - innerRadius);
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        
                        const browser = data.topBrowsers[index].browser;
                        
                        // For mobile devices, use abbreviated labels if needed
                        if (isMobile) {
                          // Keep browser names shorter on mobile
                          let shortLabel = browser;
                          // Handle specific browser names for better display
                          if (browser === "Chrome Mobile") shortLabel = "Chrome";
                          else if (browser === "Mobile Safari") shortLabel = "Safari";
                          else if (browser === "Samsung Internet") shortLabel = "Samsung";
                          else if (browser === "Firefox Mobile") shortLabel = "Firefox";
                          else if (browser.includes(" ")) shortLabel = browser.split(" ")[0];
                          
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="#374151"
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                              className="text-xs"
                              style={{ fontWeight: 500 }}
                            >
                              {`${shortLabel} (${value})`}
                            </text>
                          );
                        }
                        
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#374151"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            className="text-xs"
                            style={{ fontWeight: 500 }}
                          >
                            {`${browser} (${value})`}
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
          </motion.section>

          {/* Country Distribution */}
          <motion.section variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Country Distribution</h2>
              <div className="h-96 md:h-96 sm:h-80">
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
                      innerRadius={isMobile ? 40 : 60}
                      outerRadius={isMobile ? 60 : 80}
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
                        
                        // Adjust radius based on device size
                        const radius = isMobile ? 
                          30 + innerRadius + (outerRadius - innerRadius) : 
                          45 + innerRadius + (outerRadius - innerRadius);
                          
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        
                        const country = data.topCountries[index].country;
                        
                        // For mobile devices, use abbreviated labels
                        if (isMobile) {
                          // Special handling for countries with "United" prefix
                          if (country === "United Arab" || country === "United Arab Emirates") {
                            return (
                              <g>
                                <text
                                  x={x}
                                  y={y}
                                  fill="#374151"
                                  textAnchor={x > cx ? "start" : "end"}
                                  dominantBaseline="central"
                                  className="text-xs"
                                  style={{ fontWeight: 500 }}
                                >
                                  UAE ({value})
                                </text>
                              </g>
                            );
                          } else if (country === "United States") {
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#374151"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                className="text-xs"
                                style={{ fontWeight: 500 }}
                              >
                                USA ({value})
                              </text>
                            );
                          } else if (country === "United Kingdom") {
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#374151"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                className="text-xs"
                                style={{ fontWeight: 500 }}
                              >
                                UK ({value})
                              </text>
                            );
                          } else if (country === "United") {
                            // Default for any other "United" that might appear
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#374151"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                className="text-xs"
                                style={{ fontWeight: 500 }}
                              >
                                United ({value})
                              </text>
                            );
                          }
                          
                          // Abbreviate other country names for mobile
                          let shortLabel = country;
                          if (country.length > 8) {
                            // Use common abbreviations or first word
                            if (country.includes(" ")) shortLabel = country.split(" ")[0];
                            else shortLabel = country.substring(0, 8);
                          }
                          
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="#374151"
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                              className="text-xs"
                              style={{ fontWeight: 500 }}
                            >
                              {`${shortLabel} (${value})`}
                            </text>
                          );
                        }
                        
                        // Desktop view handling
                        if ((country.includes(' ') && country.length > 10) || 
                            country === "United Arab" || 
                            country === "United" || 
                            country === "United Arab Emirates") {
                          if (country === "United Arab" || country === "United" || country === "United Arab Emirates") {
                            return (
                              <g>
                                <text
                                  x={x}
                                  y={y - 8}
                                  fill="#374151"
                                  textAnchor={x > cx ? "start" : "end"}
                                  dominantBaseline="central"
                                  className="text-xs"
                                  style={{ fontWeight: 500 }}
                                >
                                  United Arab
                                </text>
                                <text
                                  x={x}
                                  y={y + 8}
                                  fill="#374151"
                                  textAnchor={x > cx ? "start" : "end"}
                                  dominantBaseline="central"
                                  className="text-xs"
                                  style={{ fontWeight: 500 }}
                                >
                                  Emirates ({value})
                                </text>
                              </g>
                            );
                          }
                          
                          const words = country.split(' ');
                          const midpoint = Math.ceil(words.length / 2);
                          const firstLine = words.slice(0, midpoint).join(' ');
                          const secondLine = words.slice(midpoint).join(' ') + ` (${value})`;
                          
                          return (
                            <g>
                              <text
                                x={x}
                                y={y - 8}
                                fill="#374151"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                className="text-xs"
                                style={{ fontWeight: 500 }}
                              >
                                {firstLine}
                              </text>
                              <text
                                x={x}
                                y={y + 8}
                                fill="#374151"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                className="text-xs"
                                style={{ fontWeight: 500 }}
                              >
                                {secondLine}
                              </text>
                            </g>
                          );
                        }
                        
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#374151"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            className="text-xs"
                            style={{ fontWeight: 500 }}
                          >
                            {`${country} (${value})`}
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
          </motion.section>

          {/* Recent Visitors Table */}
          <motion.section variants={fadeIn} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden mb-12">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Recent Visitors (Top 10)</h2>
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
              <div className="text-center p-4 text-sm text-gray-500 border-t border-gray-100">
                Showing the 10 most recent visitors. 
                <span className="ml-1 text-blue-600 hover:text-blue-800 cursor-pointer" onClick={handleViewAllVisitors}>
                  View all
                </span>
              </div>
            </div>
          </motion.section>

          {/* Anomaly Detection */}
          <motion.section id="anomaly-detection" variants={fadeIn} className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ShieldExclamationIcon className="h-6 w-6 mr-2 text-indigo-600" />
                  Anomaly Detection
                </h2>
                <p className="text-sm text-gray-500 mt-1">Monitoring unusual patterns and suspicious activities</p>
              </div>
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-full ${
                patterns.anomalies.some(a => a.isAnomaly) 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                <div className={`h-3 w-3 rounded-full ${
                  patterns.anomalies.some(a => a.isAnomaly) 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-green-500'
                }`}></div>
                <span className="text-sm font-medium">
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
                    className="group relative overflow-hidden bg-gradient-to-br from-red-50 via-red-50/70 to-amber-50/70 rounded-2xl border border-red-200 transition-all duration-500 hover:shadow-xl"
                  >
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
                    <div className="relative p-6">
                      <div className="flex flex-col sm:flex-row items-start">
                        <div className="flex-shrink-0 mb-4 sm:mb-0">
                          <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl shadow-sm">
                            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                          </div>
                        </div>
                        <div className="sm:ml-6 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h3 className="text-xl font-semibold text-red-900">Suspicious Activity Detected</h3>
                            <div className="inline-flex items-center">
                              <div className="text-sm font-medium bg-gradient-to-r from-red-500 to-amber-500 text-white px-4 py-1.5 rounded-full shadow-sm">
                                Score: {(anomaly.score * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          <ul className="mt-6 space-y-3">
                            {anomaly.reasons.map((reason, i) => (
                              <li 
                                key={`reason-${index}-${i}`}
                                className="flex items-center bg-white/50 px-5 py-3 rounded-xl border border-red-100 shadow-sm"
                              >
                                <div className="flex-shrink-0 mr-3">
                                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                </div>
                                <span className="text-red-900 font-medium">{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {patterns.anomalies.filter(anomaly => anomaly.isAnomaly).length === 0 && (
                <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50/70 rounded-2xl p-8 border border-green-200 shadow-sm">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
                  <div className="relative flex flex-col sm:flex-row items-center">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-4 mb-4 sm:mb-0 sm:mr-6 shadow-sm">
                      <CheckCircleIcon className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-semibold text-green-900">All Systems Normal</h3>
                      <p className="text-green-700 mt-2 max-w-lg">No suspicious activity detected in recent visitor patterns. Your application is functioning normally.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
} 