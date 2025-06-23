import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModuleMarketplaceService } from '../../services/ModuleMarketplaceService';
import { 
  BarChart, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Calendar, 
  Download, 
  Users,
  Activity,
  Zap,
  Clock,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Cpu
} from 'lucide-react';

export const ModuleAnalytics: React.FC = () => {
  const [marketplaceService] = useState(() => ModuleMarketplaceService.getInstance());
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  
  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();

      switch (timeRange) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Fetch analytics data from the service
      const data = await marketplaceService.getModuleAnalytics(undefined, { start: startDate, end: now });
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setAnalyticsData([]); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  // Mock data for charts (will be replaced by actual analyticsData processing)
  const generateMockData = () => {
    const data = [];
    const now = new Date();
    
    let points = 7;
    let dateStep = 1;
    
    switch (timeRange) {
      case 'day':
        points = 24;
        dateStep = 1/24;
        break;
      case 'week':
        points = 7;
        dateStep = 1;
        break;
      case 'month':
        points = 30;
        dateStep = 1;
        break;
      case 'year':
        points = 12;
        dateStep = 30;
        break;
    }
    
    for (let i = 0; i < points; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (points - i - 1) * dateStep);
      
      data.push({
        date: date.toISOString(),
        downloads: Math.floor(Math.random() * 50) + 10,
        usage: Math.floor(Math.random() * 100) + 50,
        errors: Math.floor(Math.random() * 5),
        performance: 90 + Math.floor(Math.random() * 10)
      });
    }
    
    return data;
  };
  
  const mockData = generateMockData(); // This will be replaced by processing analyticsData
  
  // Calculate trends
  const calculateTrend = (metric: string) => {
    if (mockData.length < 2) return { value: 0, isPositive: true };
    
    const current = mockData[mockData.length - 1][metric as keyof typeof mockData] as number;
    const previous = mockData[mockData.length - 2][metric as keyof typeof mockData] as number;
    
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change >= 0
    };
  };
  
  const downloadsTrend = calculateTrend('downloads');
  const usageTrend = calculateTrend('usage');
  const errorsTrend = calculateTrend('errors');
  const performanceTrend = calculateTrend('performance');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Module Analytics</h2>
            <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
              Developer Tools
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-slate-800 text-white rounded-lg border border-gray-700 focus:border-purple-400 focus:outline-none px-3 py-2"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
          </div>
        </div>
        
        <p className="text-gray-300 mb-6">
          Track your module's performance, usage patterns, and user engagement metrics.
          Use these insights to improve your module and understand user behavior.
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">Downloads</div>
              <div className="p-2 bg-blue-900/20 rounded-lg">
                <Download className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-white">1,248</div>
              <div className={`text-xs ${downloadsTrend.isPositive ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                {downloadsTrend.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {downloadsTrend.value}%
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">vs previous period</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">Active Users</div>
              <div className="p-2 bg-green-900/20 rounded-lg">
                <Users className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-white">843</div>
              <div className={`text-xs ${usageTrend.isPositive ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                {usageTrend.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {usageTrend.value}%
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">vs previous period</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">Error Rate</div>
              <div className="p-2 bg-red-900/20 rounded-lg">
                <Activity className="w-4 h-4 text-red-400" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-white">0.8%</div>
              <div className={`text-xs ${!errorsTrend.isPositive ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                {!errorsTrend.isPositive ? (
                  <ArrowDownRight className="w-3 h-3" />
                ) : (
                  <ArrowUpRight className="w-3 h-3" />
                )}
                {errorsTrend.value}%
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">vs previous period</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">Performance</div>
              <div className="p-2 bg-purple-900/20 rounded-lg">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-white">96%</div>
              <div className={`text-xs ${performanceTrend.isPositive ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                {performanceTrend.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {performanceTrend.value}%
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">vs previous period</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Downloads & Usage
            </h3>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-xs text-gray-400">Downloads</span>
              <div className="w-3 h-3 bg-green-400 rounded-full ml-2"></div>
              <span className="text-xs text-gray-400">Usage</span>
            </div>
          </div>
          
          <div className="h-64 relative">
            {/* Mock chart - in a real app, use a charting library */}
            <div className="absolute inset-0 flex items-end">
              {mockData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div 
                    className="w-4 bg-green-400 rounded-t"
                    style={{ height: `${(item.usage / 150) * 100}%` }}
                  ></div>
                  <div 
                    className="w-4 bg-blue-400 rounded-t mt-1"
                    style={{ height: `${(item.downloads / 60) * 100}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                    {new Date(item.date).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-purple-400" />
              Performance Metrics
            </h3>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span className="text-xs text-gray-400">Performance</span>
              <div className="w-3 h-3 bg-red-400 rounded-full ml-2"></div>
              <span className="text-xs text-gray-400">Errors</span>
            </div>
          </div>
          
          <div className="h-64 relative">
            {/* Mock chart - in a real app, use a charting library */}
            <div className="absolute inset-0">
              {/* Performance line */}
              <svg className="w-full h-full" preserveAspectRatio="none">
                <polyline
                  points={mockData.map((item, i) => `${(i / (mockData.length - 1)) * 100},${100 - (item.performance / 100) * 100}`).join(' ')}
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              
              {/* Error bars */}
              <div className="absolute inset-0 flex items-end">
                {mockData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div 
                      className="w-2 bg-red-400 rounded-t"
                      style={{ height: `${(item.errors / 5) * 20}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Insights */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          User Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <h4 className="text-white font-medium mb-4">User Retention</h4>
            <div className="flex items-center justify-center h-40">
              <div className="w-32 h-32 rounded-full border-8 border-purple-500 flex items-center justify-center relative">
                <div className="text-2xl font-bold text-white">78%</div>
                <div className="absolute inset-0 rounded-full border-8 border-gray-700" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 22%, 0% 22%)' }}></div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-400 mt-2">
              7-day retention rate
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <h4 className="text-white font-medium mb-4">Usage by Time</h4>
            <div className="h-40 relative">
              {/* Mock time chart */}
              <div className="absolute inset-0 flex items-end">
                {Array.from({ length: 24 }).map((_, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div 
                      className="w-2 bg-blue-400 rounded-t"
                      style={{ height: `${Math.sin(index / 3) * 30 + 40}%` }}
                    ></div>
                    {index % 4 === 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        {index}:00
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center text-sm text-gray-400 mt-2">
              Usage distribution by hour
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <h4 className="text-white font-medium mb-4">Feature Usage</h4>
            <div className="h-40 flex items-center justify-center">
              {/* Mock pie chart */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-8 border-purple-500" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' }}></div>
                <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)' }}></div>
                <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 0, 50% 0)' }}></div>
                <div className="absolute inset-0 rounded-full border-8 border-amber-500" style={{ clipPath: 'polygon(50% 50%, 0 100%, 0 50%, 50% 50%)' }}></div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-400">Feature A (40%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-400">Feature B (25%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-400">Feature C (20%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-gray-400">Feature D (15%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Impact */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          System Impact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <h4 className="text-white font-medium mb-4">Resource Usage</h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Memory Footprint</span>
                  <span className="text-sm text-white">24 MB</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">CPU Usage</span>
                  <span className="text-sm text-white">12%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Network Requests</span>
                  <span className="text-sm text-white">45/min</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Storage</span>
                  <span className="text-sm text-white">2.4 MB</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <h4 className="text-white font-medium mb-4">Module Interactions</h4>
            
            <div className="space-y-3">
              <div className="p-3 bg-slate-700/50 rounded-lg border border-gray-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Events Published</span>
                </div>
                <span className="text-white font-medium">1,248</span>
              </div>
              
              <div className="p-3 bg-slate-700/50 rounded-lg border border-gray-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Events Subscribed</span>
                </div>
                <span className="text-white font-medium">843</span>
              </div>
              
              <div className="p-3 bg-slate-700/50 rounded-lg border border-gray-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Avg. Response Time</span>
                </div>
                <span className="text-white font-medium">24ms</span>
              </div>
              
              <div className="p-3 bg-slate-700/50 rounded-lg border border-gray-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Module Dependencies</span>
                </div>
                <span className="text-white font-medium">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
