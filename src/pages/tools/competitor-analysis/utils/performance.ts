/**
 * 性能优化工具集
 * 提供图表渲染优化、内存管理和响应时间优化功能
 */

import React from 'react';
import type { RadarScores, BaseProduct, CompetitorData } from '../types';

/**
 * 简单的防抖函数实现
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 简单的节流函数实现
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 性能监控配置
 */
interface PerformanceConfig {
  /** 图表渲染防抖延迟 (ms) */
  chartRenderDelay: number;
  /** 数据更新节流间隔 (ms) */
  dataUpdateThrottle: number;
  /** 内存清理间隔 (ms) */
  memoryCleanupInterval: number;
  /** 最大缓存项数 */
  maxCacheItems: number;
}

/**
 * 默认性能配置
 */
const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  chartRenderDelay: 300,
  dataUpdateThrottle: 100,
  memoryCleanupInterval: 60000, // 1分钟
  maxCacheItems: 50
};

/**
 * 性能监控指标
 */
interface PerformanceMetrics {
  /** 图表渲染时间 (ms) */
  chartRenderTime: number;
  /** 数据计算时间 (ms) */
  calculationTime: number;
  /** 内存使用量 (MB) */
  memoryUsage: number;
  /** 组件渲染次数 */
  renderCount: number;
  /** 最后更新时间 */
  lastUpdate: Date;
}

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  key: string;
  value: T;
  timestamp: number;
  accessCount: number;
}

/**
 * 性能优化管理器
 */
export class PerformanceOptimizer {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics;
  private cache: Map<string, CacheItem<any>>;
  private memoryCleanupTimer: NodeJS.Timeout | null = null;
  private renderObserver: PerformanceObserver | null = null;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_PERFORMANCE_CONFIG, ...config };
    this.metrics = {
      chartRenderTime: 0,
      calculationTime: 0,
      memoryUsage: 0,
      renderCount: 0,
      lastUpdate: new Date()
    };
    this.cache = new Map();
    
    // Initialize debounced methods after config is set
    this.optimizedChartRender = debounce((
      renderFunction: () => void,
      onComplete?: () => void
    ) => {
      const startTime = performance.now();
      performance.mark('chart-render-start');

      try {
        renderFunction();
        
        const endTime = performance.now();
        performance.mark('chart-render-end');
        performance.measure('chart-render', 'chart-render-start', 'chart-render-end');
        
        this.metrics.chartRenderTime = endTime - startTime;
        this.metrics.renderCount++;
        
        onComplete?.();
      } catch (error) {
        console.error('Chart render error:', error);
      }
    }, this.config.chartRenderDelay);

    this.optimizedDataUpdate = throttle((
      updateFunction: () => void,
      data: any
    ) => {
      const startTime = performance.now();
      performance.mark('calculation-start');

      try {
        updateFunction();
        
        const endTime = performance.now();
        performance.mark('calculation-end');
        performance.measure('calculation', 'calculation-start', 'calculation-end');
        
        this.metrics.calculationTime = endTime - startTime;
      } catch (error) {
        console.error('Data update error:', error);
      }
    }, this.config.dataUpdateThrottle);
    
    this.initializePerformanceMonitoring();
    this.startMemoryCleanup();
  }

  /**
   * 初始化性能监控
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        this.renderObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name.includes('chart-render')) {
              this.metrics.chartRenderTime = entry.duration;
            } else if (entry.name.includes('calculation')) {
              this.metrics.calculationTime = entry.duration;
            }
            this.metrics.lastUpdate = new Date();
          });
        });

        this.renderObserver.observe({ entryTypes: ['measure'] });
      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }
  }

  /**
   * 启动内存清理
   */
  private startMemoryCleanup(): void {
    this.memoryCleanupTimer = setInterval(() => {
      this.cleanupCache();
      this.updateMemoryMetrics();
    }, this.config.memoryCleanupInterval);
  }

  /**
   * 清理缓存
   */
  private cleanupCache(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5分钟

    // 删除过期项
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }

    // 如果缓存仍然过大，删除最少使用的项
    if (this.cache.size > this.config.maxCacheItems) {
      const sortedItems = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.accessCount - b.accessCount);
      
      const itemsToDelete = sortedItems.slice(0, this.cache.size - this.config.maxCacheItems);
      itemsToDelete.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * 更新内存使用指标
   */
  private updateMemoryMetrics(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      const memory = (window.performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // 转换为MB
    }
  }

  /**
   * 优化的图表渲染函数
   */
  public optimizedChartRender: (renderFunction: () => void, onComplete?: () => void) => void;

  /**
   * 优化的数据更新函数
   */
  public optimizedDataUpdate: (updateFunction: () => void, data: any) => void;

  /**
   * 缓存计算结果
   */
  public cacheResult<T>(key: string, computeFunction: () => T): T {
    const cached = this.cache.get(key);
    
    if (cached) {
      cached.accessCount++;
      cached.timestamp = Date.now();
      return cached.value;
    }

    const result = computeFunction();
    this.cache.set(key, {
      key,
      value: result,
      timestamp: Date.now(),
      accessCount: 1
    });

    return result;
  }

  /**
   * 生成缓存键
   */
  public generateCacheKey(baseProduct: BaseProduct, competitorData: CompetitorData, roleView: string): string {
    return `${baseProduct.id}-${competitorData.price}-${competitorData.weight}-${roleView}`;
  }

  /**
   * 优化的雷达图数据计算
   */
  public optimizedRadarCalculation(
    baseProduct: BaseProduct,
    competitorData: CompetitorData,
    roleView: string,
    calculateFunction: () => RadarScores
  ): RadarScores {
    const cacheKey = this.generateCacheKey(baseProduct, competitorData, roleView);
    
    return this.cacheResult(cacheKey, () => {
      const startTime = performance.now();
      const result = calculateFunction();
      const endTime = performance.now();
      
      console.debug(`Radar calculation took ${endTime - startTime}ms`);
      return result;
    });
  }

  /**
   * 预加载关键资源
   */
  public preloadResources(): void {
    // 预加载ECharts主题
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = '/echarts-theme.js';
      document.head.appendChild(link);
    }
  }

  /**
   * 获取性能指标
   */
  public getMetrics(): PerformanceMetrics {
    this.updateMemoryMetrics();
    return { ...this.metrics };
  }

  /**
   * 重置性能指标
   */
  public resetMetrics(): void {
    this.metrics = {
      chartRenderTime: 0,
      calculationTime: 0,
      memoryUsage: 0,
      renderCount: 0,
      lastUpdate: new Date()
    };
  }

  /**
   * 检查性能健康状态
   */
  public checkPerformanceHealth(): {
    status: 'good' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 检查图表渲染时间
    if (this.metrics.chartRenderTime > 1000) {
      issues.push('图表渲染时间过长');
      recommendations.push('考虑减少图表复杂度或使用虚拟化');
    }

    // 检查内存使用
    if (this.metrics.memoryUsage > 100) {
      issues.push('内存使用过高');
      recommendations.push('清理缓存或减少数据保留');
    }

    // 检查渲染频率
    if (this.metrics.renderCount > 100) {
      issues.push('组件渲染过于频繁');
      recommendations.push('使用React.memo或useMemo优化');
    }

    let status: 'good' | 'warning' | 'critical' = 'good';
    if (issues.length > 0) {
      status = issues.length > 2 ? 'critical' : 'warning';
    }

    return { status, issues, recommendations };
  }

  /**
   * 销毁优化器
   */
  public destroy(): void {
    if (this.memoryCleanupTimer) {
      clearInterval(this.memoryCleanupTimer);
      this.memoryCleanupTimer = null;
    }

    if (this.renderObserver) {
      this.renderObserver.disconnect();
      this.renderObserver = null;
    }

    this.cache.clear();
  }
}

/**
 * 全局性能优化器实例
 */
export const performanceOptimizer = new PerformanceOptimizer();

/**
 * React组件性能优化Hook
 */
export const usePerformanceOptimization = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>(performanceOptimizer.getMetrics());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceOptimizer.getMetrics());
    }, 5000); // 每5秒更新一次指标

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    optimizedChartRender: performanceOptimizer.optimizedChartRender,
    optimizedDataUpdate: performanceOptimizer.optimizedDataUpdate,
    cacheResult: performanceOptimizer.cacheResult.bind(performanceOptimizer),
    checkHealth: performanceOptimizer.checkPerformanceHealth.bind(performanceOptimizer)
  };
};

/**
 * 图表性能优化配置
 */
export const CHART_PERFORMANCE_CONFIG = {
  // ECharts优化配置
  animation: {
    duration: 300,
    easing: 'cubicOut'
  },
  
  // 渲染优化
  renderer: 'canvas' as const, // 使用Canvas渲染器以获得更好的性能
  
  // 数据采样
  sampling: {
    threshold: 1000 // 当数据点超过1000时启用采样
  },
  
  // 懒加载配置
  lazyUpdate: true,
  
  // 内存优化
  dispose: true // 组件卸载时自动销毁图表实例
};

/**
 * 内存使用监控
 */
export const monitorMemoryUsage = (): void => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'memory') {
          console.debug('Memory usage:', {
            used: (entry as any).usedJSHeapSize / (1024 * 1024),
            total: (entry as any).totalJSHeapSize / (1024 * 1024),
            limit: (entry as any).jsHeapSizeLimit / (1024 * 1024)
          });
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['memory'] });
    } catch (error) {
      console.warn('Memory monitoring not supported:', error);
    }
  }
};

export default performanceOptimizer;