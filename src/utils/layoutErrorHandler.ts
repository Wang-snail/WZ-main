/**
 * 布局错误处理系统
 * 处理响应式布局回退方案、内容溢出和性能约束下的简化布局
 */

import { errorHandler, ErrorCategory, ErrorSeverity } from '@/lib/lab/ErrorHandler';
import { BreakpointConfig } from '@/components/layout/ResponsiveGrid';

export interface LayoutError {
  type: 'overflow' | 'performance' | 'css_grid_failure' | 'viewport_constraint' | 'content_mismatch';
  component: string;
  viewport: {
    width: number;
    height: number;
    breakpoint: string;
  };
  details: {
    expectedColumns?: number;
    actualColumns?: number;
    contentCount?: number;
    performanceMetric?: number;
    errorMessage?: string;
  };
  timestamp: Date;
}

export interface LayoutFallback {
  condition: (error: LayoutError) => boolean;
  action: (error: LayoutError) => LayoutConfiguration;
  description: string;
  priority: number;
}

export interface LayoutConfiguration {
  columns: number;
  gaps: { row: string; column: string };
  useSimplified: boolean;
  enableVirtualization: boolean;
  maxItems?: number;
  fallbackMessage?: string;
}

/**
 * 布局错误处理器类
 */
export class LayoutErrorHandler {
  private static instance: LayoutErrorHandler;
  private fallbackStrategies: LayoutFallback[] = [];
  private layoutErrors: LayoutError[] = [];
  private performanceThresholds = {
    maxRenderTime: 100, // ms
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    maxItemsForMobile: 20,
    maxItemsForTablet: 50,
    maxItemsForDesktop: 100
  };

  private constructor() {
    this.initializeDefaultFallbacks();
    this.setupPerformanceMonitoring();
  }

  static getInstance(): LayoutErrorHandler {
    if (!LayoutErrorHandler.instance) {
      LayoutErrorHandler.instance = new LayoutErrorHandler();
    }
    return LayoutErrorHandler.instance;
  }

  /**
   * 初始化默认回退策略
   */
  private initializeDefaultFallbacks(): void {
    this.fallbackStrategies = [
      // CSS Grid 失败回退到 Flexbox
      {
        condition: (error) => error.type === 'css_grid_failure',
        action: (error) => ({
          columns: 1,
          gaps: { row: '1rem', column: '1rem' },
          useSimplified: true,
          enableVirtualization: false,
          fallbackMessage: 'CSS Grid 不支持，使用简化布局'
        }),
        description: 'CSS Grid 失败时使用 Flexbox 布局',
        priority: 1
      },

      // 移动端性能优化
      {
        condition: (error) => 
          error.type === 'performance' && 
          error.viewport.breakpoint === 'mobile' &&
          (error.details.contentCount || 0) > this.performanceThresholds.maxItemsForMobile,
        action: (error) => ({
          columns: 1,
          gaps: { row: '0.75rem', column: '0.75rem' },
          useSimplified: true,
          enableVirtualization: true,
          maxItems: this.performanceThresholds.maxItemsForMobile,
          fallbackMessage: '内容较多，已启用性能优化模式'
        }),
        description: '移动端大量内容时启用虚拟化',
        priority: 2
      },

      // 平板端性能优化
      {
        condition: (error) => 
          error.type === 'performance' && 
          error.viewport.breakpoint === 'tablet' &&
          (error.details.contentCount || 0) > this.performanceThresholds.maxItemsForTablet,
        action: (error) => ({
          columns: 2,
          gaps: { row: '1rem', column: '1rem' },
          useSimplified: true,
          enableVirtualization: true,
          maxItems: this.performanceThresholds.maxItemsForTablet,
          fallbackMessage: '内容较多，已启用性能优化模式'
        }),
        description: '平板端大量内容时启用虚拟化',
        priority: 2
      },

      // 桌面端性能优化
      {
        condition: (error) => 
          error.type === 'performance' && 
          error.viewport.breakpoint === 'desktop' &&
          (error.details.contentCount || 0) > this.performanceThresholds.maxItemsForDesktop,
        action: (error) => ({
          columns: 3,
          gaps: { row: '1.5rem', column: '1.5rem' },
          useSimplified: false,
          enableVirtualization: true,
          maxItems: this.performanceThresholds.maxItemsForDesktop,
          fallbackMessage: '内容较多，已启用虚拟化渲染'
        }),
        description: '桌面端大量内容时启用虚拟化',
        priority: 2
      },

      // 内容溢出处理
      {
        condition: (error) => error.type === 'overflow',
        action: (error) => {
          const currentColumns = error.details.actualColumns || 1;
          const reducedColumns = Math.max(1, Math.floor(currentColumns / 2));
          
          return {
            columns: reducedColumns,
            gaps: { row: '0.75rem', column: '0.75rem' },
            useSimplified: true,
            enableVirtualization: false,
            fallbackMessage: '内容溢出，已调整为更紧凑的布局'
          };
        },
        description: '内容溢出时减少列数',
        priority: 3
      },

      // 视口约束处理
      {
        condition: (error) => error.type === 'viewport_constraint',
        action: (error) => {
          if (error.viewport.width < 480) {
            return {
              columns: 1,
              gaps: { row: '0.5rem', column: '0.5rem' },
              useSimplified: true,
              enableVirtualization: false,
              fallbackMessage: '屏幕较小，使用单列布局'
            };
          }
          
          return {
            columns: 2,
            gaps: { row: '0.75rem', column: '0.75rem' },
            useSimplified: true,
            enableVirtualization: false,
            fallbackMessage: '屏幕空间有限，使用紧凑布局'
          };
        },
        description: '视口约束时使用紧凑布局',
        priority: 4
      },

      // 内容不匹配处理
      {
        condition: (error) => error.type === 'content_mismatch',
        action: (error) => ({
          columns: 1,
          gaps: { row: '1rem', column: '1rem' },
          useSimplified: true,
          enableVirtualization: false,
          fallbackMessage: '内容格式不匹配，使用安全布局'
        }),
        description: '内容不匹配时使用安全布局',
        priority: 5
      },

      // 通用回退策略
      {
        condition: () => true, // 匹配所有错误
        action: (error) => ({
          columns: 1,
          gaps: { row: '1rem', column: '1rem' },
          useSimplified: true,
          enableVirtualization: false,
          fallbackMessage: '布局出现问题，使用默认安全布局'
        }),
        description: '通用安全回退',
        priority: 10
      }
    ];

    // 按优先级排序
    this.fallbackStrategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // 监控内存使用
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > this.performanceThresholds.maxMemoryUsage) {
          this.handleLayoutError({
            type: 'performance',
            component: 'global',
            viewport: this.getCurrentViewport(),
            details: {
              performanceMetric: memory.usedJSHeapSize,
              errorMessage: 'Memory usage exceeded threshold'
            },
            timestamp: new Date()
          });
        }
      }, 5000); // 每5秒检查一次
    }

    // 监控渲染性能
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > this.performanceThresholds.maxRenderTime) {
              this.handleLayoutError({
                type: 'performance',
                component: entry.name || 'unknown',
                viewport: this.getCurrentViewport(),
                details: {
                  performanceMetric: entry.duration,
                  errorMessage: 'Render time exceeded threshold'
                },
                timestamp: new Date()
              });
            }
          });
        });

        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        // PerformanceObserver 不支持时忽略
      }
    }
  }

  /**
   * 处理布局错误
   */
  handleLayoutError(error: LayoutError): LayoutConfiguration {
    // 记录错误
    this.layoutErrors.push(error);
    
    // 限制错误历史大小
    if (this.layoutErrors.length > 100) {
      this.layoutErrors = this.layoutErrors.slice(-50);
    }

    // 报告错误到统一错误处理系统
    errorHandler.handleError(new Error(`Layout error: ${error.type} in ${error.component}`), {
      additionalData: {
        layoutErrorType: error.type,
        component: error.component,
        viewport: error.viewport,
        details: error.details
      }
    });

    // 查找并执行回退策略
    return this.executeFallbackStrategy(error);
  }

  /**
   * 检测CSS Grid支持
   */
  detectCSSGridSupport(): boolean {
    if (typeof window === 'undefined') return true;
    
    try {
      const testElement = document.createElement('div');
      testElement.style.display = 'grid';
      return testElement.style.display === 'grid';
    } catch (error) {
      return false;
    }
  }

  /**
   * 检测内容溢出
   */
  detectContentOverflow(element: HTMLElement): boolean {
    if (!element) return false;
    
    return element.scrollWidth > element.clientWidth || 
           element.scrollHeight > element.clientHeight;
  }

  /**
   * 评估性能约束
   */
  assessPerformanceConstraints(itemCount: number, viewport: { width: number; breakpoint: string }): boolean {
    const thresholds = {
      mobile: this.performanceThresholds.maxItemsForMobile,
      tablet: this.performanceThresholds.maxItemsForTablet,
      desktop: this.performanceThresholds.maxItemsForDesktop,
      wide: this.performanceThresholds.maxItemsForDesktop
    };

    const threshold = thresholds[viewport.breakpoint as keyof typeof thresholds] || thresholds.desktop;
    return itemCount > threshold;
  }

  /**
   * 获取安全的布局配置
   */
  getSafeLayoutConfiguration(
    itemCount: number,
    viewport: { width: number; height: number; breakpoint: string },
    component: string = 'unknown'
  ): LayoutConfiguration {
    // 检查各种潜在问题
    const hasPerformanceConstraint = this.assessPerformanceConstraints(itemCount, viewport);
    const hasCSSGridSupport = this.detectCSSGridSupport();
    const hasViewportConstraint = viewport.width < 480;

    // 如果没有问题，返回标准配置
    if (!hasPerformanceConstraint && hasCSSGridSupport && !hasViewportConstraint) {
      return this.getStandardLayoutConfiguration(viewport.breakpoint);
    }

    // 创建相应的错误并处理
    let errorType: LayoutError['type'] = 'performance';
    if (!hasCSSGridSupport) errorType = 'css_grid_failure';
    if (hasViewportConstraint) errorType = 'viewport_constraint';

    const error: LayoutError = {
      type: errorType,
      component,
      viewport,
      details: {
        contentCount: itemCount,
        performanceMetric: hasPerformanceConstraint ? itemCount : undefined
      },
      timestamp: new Date()
    };

    return this.handleLayoutError(error);
  }

  /**
   * 获取标准布局配置
   */
  private getStandardLayoutConfiguration(breakpoint: string): LayoutConfiguration {
    const configs = {
      mobile: { columns: 1, gaps: { row: '1rem', column: '1rem' } },
      tablet: { columns: 2, gaps: { row: '1.5rem', column: '1.5rem' } },
      desktop: { columns: 3, gaps: { row: '2rem', column: '2rem' } },
      wide: { columns: 4, gaps: { row: '2rem', column: '2rem' } }
    };

    const config = configs[breakpoint as keyof typeof configs] || configs.desktop;
    
    return {
      ...config,
      useSimplified: false,
      enableVirtualization: false
    };
  }

  /**
   * 执行回退策略
   */
  private executeFallbackStrategy(error: LayoutError): LayoutConfiguration {
    // 查找匹配的回退策略
    const strategy = this.fallbackStrategies.find(s => s.condition(error));
    
    if (strategy) {
      try {
        const config = strategy.action(error);
        
        // 记录回退策略的使用
        console.warn(`Layout fallback applied: ${strategy.description}`, {
          error,
          config
        });
        
        return config;
      } catch (fallbackError) {
        console.error('Fallback strategy failed:', fallbackError);
      }
    }

    // 最后的安全回退
    return {
      columns: 1,
      gaps: { row: '1rem', column: '1rem' },
      useSimplified: true,
      enableVirtualization: false,
      fallbackMessage: '使用最安全的单列布局'
    };
  }

  /**
   * 获取当前视口信息
   */
  private getCurrentViewport(): { width: number; height: number; breakpoint: string } {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768, breakpoint: 'desktop' };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    let breakpoint = 'desktop';
    if (width < 768) breakpoint = 'mobile';
    else if (width < 1024) breakpoint = 'tablet';
    else if (width >= 1280) breakpoint = 'wide';

    return { width, height, breakpoint };
  }

  /**
   * 添加自定义回退策略
   */
  addFallbackStrategy(strategy: LayoutFallback): void {
    this.fallbackStrategies.push(strategy);
    this.fallbackStrategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 更新性能阈值
   */
  updatePerformanceThresholds(thresholds: Partial<typeof this.performanceThresholds>): void {
    this.performanceThresholds = { ...this.performanceThresholds, ...thresholds };
  }

  /**
   * 获取布局错误统计
   */
  getLayoutErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByComponent: Record<string, number>;
    recentErrors: LayoutError[];
  } {
    const errorsByType: Record<string, number> = {};
    const errorsByComponent: Record<string, number> = {};

    this.layoutErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsByComponent[error.component] = (errorsByComponent[error.component] || 0) + 1;
    });

    return {
      totalErrors: this.layoutErrors.length,
      errorsByType,
      errorsByComponent,
      recentErrors: this.layoutErrors.slice(-10)
    };
  }

  /**
   * 清除错误历史
   */
  clearErrorHistory(): void {
    this.layoutErrors = [];
  }
}

/**
 * 全局布局错误处理器实例
 */
export const layoutErrorHandler = LayoutErrorHandler.getInstance();

/**
 * React Hook for layout error handling
 */
export function useLayoutErrorHandler() {
  const handleLayoutError = (error: LayoutError) => {
    return layoutErrorHandler.handleLayoutError(error);
  };

  const getSafeLayout = (itemCount: number, viewport: any, component?: string) => {
    return layoutErrorHandler.getSafeLayoutConfiguration(itemCount, viewport, component);
  };

  const detectOverflow = (element: HTMLElement) => {
    return layoutErrorHandler.detectContentOverflow(element);
  };

  return {
    handleLayoutError,
    getSafeLayout,
    detectOverflow,
    stats: layoutErrorHandler.getLayoutErrorStats(),
    clearErrors: () => layoutErrorHandler.clearErrorHistory()
  };
}

export default LayoutErrorHandler;