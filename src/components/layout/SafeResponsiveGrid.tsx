/**
 * 安全响应式网格组件
 * 集成布局错误处理和自动回退机制
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { layoutErrorHandler, LayoutConfiguration } from '@/utils/layoutErrorHandler';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { AlertTriangle, Info, RefreshCw } from 'lucide-react';

export interface SafeResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  itemCount?: number;
  component?: string;
  enableErrorRecovery?: boolean;
  enablePerformanceOptimization?: boolean;
  onLayoutError?: (error: any) => void;
  onLayoutRecovery?: (config: LayoutConfiguration) => void;
  maxRetries?: number;
}

/**
 * 安全响应式网格组件
 * 自动检测和处理布局错误，提供回退方案
 */
const SafeResponsiveGrid: React.FC<SafeResponsiveGridProps> = ({
  children,
  className = '',
  itemCount = 0,
  component = 'SafeResponsiveGrid',
  enableErrorRecovery = true,
  enablePerformanceOptimization = true,
  onLayoutError,
  onLayoutRecovery,
  maxRetries = 3
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfiguration | null>(null);
  const [hasLayoutError, setHasLayoutError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  const { viewportInfo, checkContentOverflow } = useResponsiveLayout({
    enableContentOverflowHandling: true,
    enablePerformanceOptimization
  });

  /**
   * 检测和处理布局问题
   */
  const detectAndHandleLayoutIssues = useCallback(() => {
    if (!containerRef.current || !enableErrorRecovery) return;

    try {
      const container = containerRef.current;
      
      // 检测CSS Grid支持
      const hasCSSGridSupport = layoutErrorHandler.detectCSSGridSupport();
      
      // 检测内容溢出
      const hasOverflow = layoutErrorHandler.detectContentOverflow(container);
      
      // 检测性能约束
      const hasPerformanceConstraint = layoutErrorHandler.assessPerformanceConstraints(
        itemCount,
        viewportInfo
      );

      // 如果检测到问题，获取安全配置
      if (!hasCSSGridSupport || hasOverflow || hasPerformanceConstraint) {
        const safeConfig = layoutErrorHandler.getSafeLayoutConfiguration(
          itemCount,
          viewportInfo,
          component
        );

        setLayoutConfig(safeConfig);
        setHasLayoutError(true);

        // 通知父组件
        if (onLayoutError) {
          onLayoutError({
            hasCSSGridSupport,
            hasOverflow,
            hasPerformanceConstraint,
            safeConfig
          });
        }

        if (onLayoutRecovery) {
          onLayoutRecovery(safeConfig);
        }
      } else {
        // 没有问题时清除错误状态
        if (hasLayoutError) {
          setHasLayoutError(false);
          setLayoutConfig(null);
        }
      }
    } catch (error) {
      console.error('Layout detection failed:', error);
      
      // 发生检测错误时使用最安全的配置
      const fallbackConfig: LayoutConfiguration = {
        columns: 1,
        gaps: { row: '1rem', column: '1rem' },
        useSimplified: true,
        enableVirtualization: false,
        fallbackMessage: '布局检测失败，使用安全模式'
      };

      setLayoutConfig(fallbackConfig);
      setHasLayoutError(true);
    }
  }, [
    itemCount,
    viewportInfo,
    component,
    enableErrorRecovery,
    hasLayoutError,
    onLayoutError,
    onLayoutRecovery
  ]);

  /**
   * 重试布局
   */
  const retryLayout = useCallback(() => {
    if (retryCount >= maxRetries) return;

    setIsRecovering(true);
    setRetryCount(prev => prev + 1);

    // 延迟重试，给DOM时间更新
    setTimeout(() => {
      detectAndHandleLayoutIssues();
      setIsRecovering(false);
    }, 100);
  }, [retryCount, maxRetries, detectAndHandleLayoutIssues]);

  /**
   * 强制重置布局
   */
  const resetLayout = useCallback(() => {
    setLayoutConfig(null);
    setHasLayoutError(false);
    setRetryCount(0);
    setIsRecovering(false);
  }, []);

  // 监听视口变化和内容变化
  useEffect(() => {
    detectAndHandleLayoutIssues();
  }, [detectAndHandleLayoutIssues]);

  // 监听内容溢出
  useEffect(() => {
    if (containerRef.current) {
      checkContentOverflow(containerRef);
    }
  }, [children, checkContentOverflow]);

  /**
   * 生成CSS类名
   */
  const generateGridClasses = (): string => {
    const classes: string[] = ['grid', 'w-full'];

    if (layoutConfig) {
      // 使用安全配置
      if (layoutConfig.useSimplified) {
        classes.push('grid-flow-row'); // 简化布局
      }
      
      // 根据配置设置列数
      if (layoutConfig.columns === 1) {
        classes.push('grid-cols-1');
      } else if (layoutConfig.columns === 2) {
        classes.push('grid-cols-1 md:grid-cols-2');
      } else if (layoutConfig.columns === 3) {
        classes.push('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
      } else if (layoutConfig.columns === 4) {
        classes.push('grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4');
      }

      // 设置间距
      if (layoutConfig.gaps.row === '0.5rem') {
        classes.push('gap-2');
      } else if (layoutConfig.gaps.row === '0.75rem') {
        classes.push('gap-3');
      } else if (layoutConfig.gaps.row === '1rem') {
        classes.push('gap-4');
      } else if (layoutConfig.gaps.row === '1.5rem') {
        classes.push('gap-6');
      } else {
        classes.push('gap-8');
      }
    } else {
      // 使用标准响应式配置
      classes.push('grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4');
      classes.push('gap-4 md:gap-6 lg:gap-8');
    }

    return classes.join(' ');
  };

  /**
   * 渲染虚拟化内容
   */
  const renderVirtualizedContent = () => {
    if (!layoutConfig?.enableVirtualization || !layoutConfig.maxItems) {
      return children;
    }

    const childrenArray = React.Children.toArray(children);
    const visibleItems = childrenArray.slice(0, layoutConfig.maxItems);
    const hiddenCount = childrenArray.length - visibleItems.length;

    return (
      <>
        {visibleItems}
        {hiddenCount > 0 && (
          <div className="col-span-full flex items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center text-gray-600">
              <Info className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">
                还有 {hiddenCount} 个项目未显示
              </p>
              <button
                onClick={() => setLayoutConfig(prev => prev ? { ...prev, maxItems: undefined, enableVirtualization: false } : null)}
                className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                显示全部
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="safe-responsive-grid-container">
      {/* 错误提示 */}
      {hasLayoutError && layoutConfig?.fallbackMessage && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800">
                {layoutConfig.fallbackMessage}
              </p>
              {retryCount < maxRetries && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={retryLayout}
                    disabled={isRecovering}
                    className="text-xs px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 flex items-center space-x-1"
                  >
                    {isRecovering ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    <span>重试 ({retryCount}/{maxRetries})</span>
                  </button>
                  <button
                    onClick={resetLayout}
                    className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    重置
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 主网格容器 */}
      <div
        ref={containerRef}
        className={cn(
          generateGridClasses(),
          {
            'opacity-75 transition-opacity': isRecovering,
            'border-2 border-yellow-200 bg-yellow-50': hasLayoutError && layoutConfig?.useSimplified
          },
          className
        )}
        style={{
          // 如果CSS Grid不支持，回退到flexbox
          display: layoutConfig?.useSimplified ? 'flex' : undefined,
          flexDirection: layoutConfig?.useSimplified ? 'column' : undefined,
          gap: layoutConfig?.useSimplified ? layoutConfig.gaps.row : undefined
        }}
      >
        {renderVirtualizedContent()}
      </div>

      {/* 调试信息（仅开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <div>组件: {component} | 项目数: {itemCount}</div>
          <div>视口: {viewportInfo.width}x{viewportInfo.height} ({viewportInfo.breakpoint})</div>
          {layoutConfig && (
            <div className="text-orange-600">
              安全模式: 列数={layoutConfig.columns}, 简化={layoutConfig.useSimplified ? '是' : '否'}, 虚拟化={layoutConfig.enableVirtualization ? '是' : '否'}
            </div>
          )}
          {hasLayoutError && <div className="text-red-600">⚠️ 检测到布局问题</div>}
        </div>
      )}
    </div>
  );
};

export default SafeResponsiveGrid;