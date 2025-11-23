import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

export default function PerformanceTracker() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 等待页面加载完成
      window.addEventListener('load', () => {
        setTimeout(() => {
          setIsVisible(true);
          collectMetrics();
        }, 3000); // 延迟3秒显示，避免影响用户体验
      });
    }

    return () => {
      window.removeEventListener('load', collectMetrics);
    };
  }, []);

  const collectMetrics = () => {
    if (!('PerformanceObserver' in window)) return;

    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintTiming = performance.getEntriesByType('paint');

    const paintMetrics: Record<string, number> = {};
    paintTiming.forEach((timing) => {
      paintMetrics[timing.name] = timing.startTime;
    });

    const fcp = paintMetrics['first-contentful-paint'] || 0;
    const lcp = getLCP();
    const fid = getFID();
    const cls = getCLS();

    const loadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;

    setMetrics({
      loadTime,
      firstContentfulPaint: fcp,
      largestContentfulPaint: lcp,
      firstInputDelay: fid,
      cumulativeLayoutShift: cls,
    });

    // 发送到分析服务
    sendToAnalytics({
      loadTime,
      fcp,
      lcp,
      fid,
      cls,
      timestamp: Date.now(),
      url: window.location.href,
    });
  };

  const getLCP = () => {
    if (!('PerformanceObserver' in window)) return 0;

    let lcpValue = 0;
    const po = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      lcpValue = lastEntry.startTime;
      po.disconnect();
    });

    try {
      po.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP not supported');
    }

    return lcpValue;
  };

  const getFID = () => {
    if (!('PerformanceObserver' in window)) return 0;

    let fidValue = 0;
    const po = new PerformanceObserver((entryList) => {
      const firstInput = entryList.getEntries()[0];
      fidValue = firstInput.processingStart - firstInput.startTime;
      po.disconnect();
    });

    try {
      po.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID not supported');
    }

    return fidValue;
  };

  const getCLS = () => {
    if (!('PerformanceObserver' in window)) return 0;

    let clsValue = 0;
    const po = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      po.disconnect();
    });

    try {
      po.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS not supported');
    }

    return clsValue;
  };

  const sendToAnalytics = (data: any) => {
    // 发送到Vercel Analytics或其他分析服务
    console.log('Performance data:', data);

    // 可以发送到自定义端点
    fetch('/api/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(err => console.warn('Failed to send performance data:', err));
  };

  const getScore = (value: number, type: keyof PerformanceMetrics) => {
    switch (type) {
      case 'loadTime':
        return value < 2000 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
      case 'firstContentfulPaint':
        return value < 1000 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
      case 'largestContentfulPaint':
        return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
      case 'firstInputDelay':
        return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
      case 'cumulativeLayoutShift':
        return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
      default:
        return 'good';
    }
  };

  if (!isVisible || !metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">性能指标</h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">加载时间:</span>
          <span className={`font-medium ${getScore(metrics.loadTime, 'loadTime') === 'good' ? 'text-green-600' : getScore(metrics.loadTime, 'loadTime') === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'}`}>
            {metrics.loadTime}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">首屏渲染:</span>
          <span className={`font-medium ${getScore(metrics.firstContentfulPaint, 'firstContentfulPaint') === 'good' ? 'text-green-600' : getScore(metrics.firstContentfulPaint, 'firstContentfulPaint') === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'}`}>
            {metrics.firstContentfulPaint}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">最大内容渲染:</span>
          <span className={`font-medium ${getScore(metrics.largestContentfulPaint, 'largestContentfulPaint') === 'good' ? 'text-green-600' : getScore(metrics.largestContentfulPaint, 'largestContentfulPaint') === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'}`}>
            {metrics.largestContentfulPaint}ms
          </span>
        </div>
      </div>
    </div>
  );
}