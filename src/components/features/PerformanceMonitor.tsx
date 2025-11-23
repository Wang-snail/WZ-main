import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, Zap, Eye, BarChart3, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useAnalytics } from '@/services/analyticsService';

interface PerformanceMetrics {
  pageLoadTime: number;
  timeToFirstByte: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  domInteractive: number;
  domContentLoaded: number;
  memoryUsage?: number;
  connectionType?: string;
  userAgent: string;
}

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  averageSessionTime: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
  topSources: Array<{ source: string; visitors: number }>;
  userGrowth: number;
}

interface PerformanceMonitorProps {
  isDevelopment?: boolean;
  showRealTimeStats?: boolean;
}

export default function PerformanceMonitor({
  isDevelopment = false,
  showRealTimeStats = true
}: PerformanceMonitorProps) {
  const { getUserProfile, trackUserAction } = useAnalytics();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(0);

  // 收集性能指标
  useEffect(() => {
    const collectMetrics = () => {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        const lcp = paint.find(entry => entry.name === 'largest-contentful-paint');

        const newMetrics: PerformanceMetrics = {
          pageLoadTime: Math.round(navigation.loadEventEnd - navigation.navigationStart),
          timeToFirstByte: Math.round(navigation.responseStart - navigation.requestStart),
          largestContentfulPaint: lcp ? Math.round(lcp.startTime) : 0,
          cumulativeLayoutShift: 0,
          firstInputDelay: 0,
          domInteractive: Math.round(navigation.domInteractive - navigation.navigationStart),
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
          userAgent: navigator.userAgent,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown'
        };

        // 获取内存使用情况（如果支持）
        if ((performance as any).memory) {
          newMetrics.memoryUsage = Math.round((performance as any).memory.usedJSHeapSize / 1048576); // MB
        }

        setMetrics(newMetrics);
        calculatePerformanceScore(newMetrics);

        // 发送性能数据到分析服务
        trackUserAction('performance_metrics', {
          metrics: newMetrics,
          timestamp: Date.now(),
          page: window.location.pathname
        });

      } catch (error) {
        console.warn('Performance metrics collection failed:', error);
      }
    };

    // Web Vitals 观察器
    const observeWebVitals = () => {
      try {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => prev ? {
            ...prev,
            largestContentfulPaint: Math.round(lastEntry.startTime)
          } : null);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // CLS Observer
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          setMetrics(prev => prev ? {
            ...prev,
            cumulativeLayoutShift: Math.round(clsValue * 1000) / 1000
          } : null);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        // FID Observer
        const fidObserver = new PerformanceObserver((list) => {
          const firstEntry = list.getEntries()[0];
          setMetrics(prev => prev ? {
            ...prev,
            firstInputDelay: Math.round(firstEntry.processingStart - firstEntry.startTime)
          } : null);
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

      } catch (error) {
        console.warn('Web Vitals observation failed:', error);
      }
    };

    // 延迟收集以确保页面完全加载
    setTimeout(() => {
      collectMetrics();
      observeWebVitals();
    }, 1000);

    // 在开发模式或显示实时统计时显示组件
    if (isDevelopment || showRealTimeStats) {
      setIsVisible(true);
    }
  }, []);

  // 生成模拟分析数据（实际应用中应从真实数据源获取）
  useEffect(() => {
    const generateAnalyticsData = () => {
      const userProfile = getUserProfile();

      // 从localStorage获取历史数据
      const visitCount = parseInt(localStorage.getItem('visit_count') || '1');
      const sessionTime = userProfile?.sessionDuration || 0;

      const mockData: AnalyticsData = {
        pageViews: Math.floor(Math.random() * 1000) + visitCount,
        uniqueVisitors: Math.floor(Math.random() * 500) + Math.floor(visitCount * 0.7),
        averageSessionTime: Math.round(sessionTime / 1000) || Math.floor(Math.random() * 300) + 120,
        bounceRate: Math.floor(Math.random() * 30) + 25, // 25-55%
        topPages: [
          { page: '/', views: Math.floor(Math.random() * 300) + 100 },
          { page: '/ai-tools', views: Math.floor(Math.random() * 200) + 80 },
          { page: '/games', views: Math.floor(Math.random() * 150) + 60 },
          { page: '/divination', views: Math.floor(Math.random() * 120) + 50 }
        ],
        topSources: [
          { source: 'Direct', visitors: Math.floor(Math.random() * 200) + 100 },
          { source: 'Google', visitors: Math.floor(Math.random() * 150) + 80 },
          { source: 'Social', visitors: Math.floor(Math.random() * 100) + 50 }
        ],
        userGrowth: Math.floor(Math.random() * 20) + 5 // 5-25%
      };

      setAnalyticsData(mockData);
    };

    generateAnalyticsData();

    // 每30秒更新一次数据
    const interval = setInterval(generateAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const calculatePerformanceScore = (metrics: PerformanceMetrics) => {
    let score = 100;

    // LCP: 理想 < 2.5s, 需要改进 > 4s
    if (metrics.largestContentfulPaint > 4000) score -= 30;
    else if (metrics.largestContentfulPaint > 2500) score -= 15;

    // FID: 理想 < 100ms, 需要改进 > 300ms
    if (metrics.firstInputDelay > 300) score -= 25;
    else if (metrics.firstInputDelay > 100) score -= 10;

    // CLS: 理想 < 0.1, 需要改进 > 0.25
    if (metrics.cumulativeLayoutShift > 0.25) score -= 20;
    else if (metrics.cumulativeLayoutShift > 0.1) score -= 10;

    // 页面加载时间
    if (metrics.pageLoadTime > 3000) score -= 15;
    else if (metrics.pageLoadTime > 2000) score -= 5;

    setPerformanceScore(Math.max(0, score));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    return `${bytes}MB`;
  };

  if (!isVisible || (!metrics && !analyticsData)) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 z-50 max-w-sm"
      >
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                性能监控
              </div>
              {performanceScore > 0 && (
                <Badge className={`text-xs ${getScoreColor(performanceScore)}`}>
                  {performanceScore}分
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 性能指标 */}
            {metrics && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  Core Web Vitals
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">LCP:</span>
                      <span className={metrics.largestContentfulPaint <= 2500 ? 'text-green-600' : 'text-yellow-600'}>
                        {formatTime(metrics.largestContentfulPaint)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">FID:</span>
                      <span className={metrics.firstInputDelay <= 100 ? 'text-green-600' : 'text-yellow-600'}>
                        {formatTime(metrics.firstInputDelay)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CLS:</span>
                      <span className={metrics.cumulativeLayoutShift <= 0.1 ? 'text-green-600' : 'text-yellow-600'}>
                        {metrics.cumulativeLayoutShift.toFixed(3)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">加载:</span>
                      <span>{formatTime(metrics.pageLoadTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">TTFB:</span>
                      <span>{formatTime(metrics.timeToFirstByte)}</span>
                    </div>
                    {metrics.memoryUsage && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">内存:</span>
                        <span>{formatBytes(metrics.memoryUsage)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 实时分析数据 */}
            {analyticsData && showRealTimeStats && (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  实时数据
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">页面浏览:</span>
                      <span className="text-blue-600">{analyticsData.pageViews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">独立访客:</span>
                      <span className="text-green-600">{analyticsData.uniqueVisitors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">跳出率:</span>
                      <span className={analyticsData.bounceRate <= 40 ? 'text-green-600' : 'text-yellow-600'}>
                        {analyticsData.bounceRate}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">会话时长:</span>
                      <span>{Math.floor(analyticsData.averageSessionTime / 60)}m{analyticsData.averageSessionTime % 60}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">用户增长:</span>
                      <span className="text-green-600">+{analyticsData.userGrowth}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">连接类型:</span>
                      <span className="text-xs">{metrics?.connectionType || 'unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* 热门页面 */}
                <div className="pt-2 border-t border-gray-100">
                  <h5 className="text-xs font-semibold text-gray-600 mb-2">热门页面</h5>
                  <div className="space-y-1">
                    {analyticsData.topPages.slice(0, 3).map((page, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-gray-600 truncate">{page.page}</span>
                        <span className="text-blue-600">{page.views}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 优化建议 */}
            {performanceScore < 90 && (
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 flex items-center mb-2">
                  <AlertTriangle className="w-3 h-3 mr-1 text-yellow-600" />
                  优化建议
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  {metrics?.largestContentfulPaint > 2500 && (
                    <p>• 优化图片和字体加载</p>
                  )}
                  {metrics?.firstInputDelay > 100 && (
                    <p>• 减少JavaScript执行时间</p>
                  )}
                  {metrics?.cumulativeLayoutShift > 0.1 && (
                    <p>• 避免布局偏移</p>
                  )}
                  {analyticsData && analyticsData.bounceRate > 50 && (
                    <p>• 提高内容吸引力</p>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-400 text-center pt-2 border-t">
              实时监控 • 每30秒更新
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}