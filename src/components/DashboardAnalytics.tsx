import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Share2,
  Target,
  Clock,
  Zap,
  Calendar,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface AnalyticsData {
  totalVisitors: number;
  totalPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    path: string;
    views: number;
    duration: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  socialShares: Array<{
    platform: string;
    shares: number;
    percentage: number;
  }>;
  userConversion: Array<{
    type: string;
    conversions: number;
    rate: number;
  }>;
  dailyTrends: Array<{
    date: string;
    visitors: number;
    pageViews: number;
  }>;
}

const DashboardAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    // 模拟API调用获取分析数据
    const mockData: AnalyticsData = {
      totalVisitors: 15420,
      totalPageViews: 45630,
      averageSessionDuration: 3.2,
      bounceRate: 42,
      topPages: [
        { path: '/', views: 12540, duration: 4.1 },
        { path: '/ai-tools', views: 8230, duration: 5.2 },
        { path: '/analyzer', views: 5670, duration: 3.8 },
        { path: '/divination', views: 3420, duration: 2.9 },
        { path: '/games', views: 2780, duration: 6.5 }
      ],
      trafficSources: [
        { source: '直接访问', visitors: 6840, percentage: 44.4 },
        { source: '搜索引擎', visitors: 5181, percentage: 33.6 },
        { source: '社交媒体', visitors: 3084, percentage: 20.0 },
        { source: '推荐链接', visitors: 315, percentage: 2.0 }
      ],
      socialShares: [
        { platform: '微信', shares: 1250, percentage: 45.2 },
        { platform: '微博', shares: 680, percentage: 24.6 },
        { platform: '知乎', shares: 420, percentage: 15.2 },
        { platform: '掘金', shares: 280, percentage: 10.1 },
        { platform: 'Twitter', shares: 150, percentage: 5.4 },
        { platform: 'Facebook', shares: 70, percentage: 2.5 }
      ],
      userConversion: [
        { type: '注册用户', conversions: 1250, rate: 8.1 },
        { type: '试用工具', conversions: 890, rate: 5.8 },
        { type: '分享内容', conversions: 650, rate: 4.2 },
        { type: '邀请好友', conversions: 320, rate: 2.1 }
      ],
      dailyTrends: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          visitors: Math.floor(Math.random() * 800) + 200,
          pageViews: Math.floor(Math.random() * 2000) + 500
        };
      })
    };
    setData(mockData);
    setLoading(false);
  }, [timeRange]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }> = ({ title, value, change, icon, trend = 'neutral' }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                {trend === 'down' && <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />}
                <span className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 标题和时间筛选 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">数据仪表板</h1>
          <p className="text-gray-600">实时监控网站性能和用户行为</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' && '近7天'}
              {range === '30d' && '近30天'}
              {range === '90d' && '近90天'}
            </button>
          ))}
        </div>
      </div>

      {/* 核心指标 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <StatCard
          title="总访客数"
          value={data.totalVisitors.toLocaleString()}
          change={12.5}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          trend="up"
        />
        <StatCard
          title="页面浏览量"
          value={data.totalPageViews.toLocaleString()}
          change={8.3}
          icon={<Eye className="w-6 h-6 text-green-600" />}
          trend="up"
        />
        <StatCard
          title="平均停留时间"
          value={`${data.averageSessionDuration}分钟`}
          change={-2.1}
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          trend="down"
        />
        <StatCard
          title="跳出率"
          value={`${data.bounceRate}%`}
          change={-5.2}
          icon={<Target className="w-6 h-6 text-red-600" />}
          trend="up"
        />
      </motion.div>

      {/* 详细数据网格 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* 热门页面 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              热门页面
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPages.map((page, index) => (
                <motion.div
                  key={page.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{page.path}</p>
                      <p className="text-xs text-gray-600">{page.views.toLocaleString()} 次浏览</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{page.duration}分钟</p>
                    <p className="text-xs text-gray-600">平均停留</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 流量来源 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              流量来源
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.trafficSources.map((source, index) => (
                <motion.div
                  key={source.source}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{source.source}</span>
                    <span className="text-sm text-gray-600">{source.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${source.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">{source.visitors.toLocaleString()} 访客</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 社交分享 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-green-600" />
              社交分享
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.socialShares.map((social, index) => (
                <motion.div
                  key={social.platform}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-800">{social.platform.charAt(0)}</span>
                    </div>
                    <span className="font-medium">{social.platform}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{social.shares}</p>
                    <p className="text-xs text-gray-600">{social.percentage}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 转化数据 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              用户转化
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.userConversion.map((conversion, index) => (
                <motion.div
                  key={conversion.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-medium">{conversion.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{conversion.conversions}</p>
                    <p className="text-xs text-gray-600">{conversion.rate}% 转化率</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardAnalytics;