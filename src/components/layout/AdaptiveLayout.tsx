import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import useResponsiveLayout from '@/hooks/useResponsiveLayout';
import ResponsiveGrid, { BreakpointConfig } from './ResponsiveGrid';

export interface AdaptiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  itemCount?: number;
  maxColumns?: number;
  enableOverflowHandling?: boolean;
  enablePerformanceOptimization?: boolean;
  customBreakpoints?: BreakpointConfig[];
  onLayoutChange?: (viewportInfo: any) => void;
}

/**
 * 自适应布局组件
 * 根据视口变化和内容数量自动调整布局
 */
const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  className = '',
  itemCount = 0,
  maxColumns,
  enableOverflowHandling = true,
  enablePerformanceOptimization = true,
  customBreakpoints,
  onLayoutChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    viewportInfo,
    isLayoutStable,
    contentOverflow,
    checkContentOverflow,
    getOptimalColumns,
    getAdaptiveSpacing,
    shouldRenderOptimized,
    getLayoutRecommendations
  } = useResponsiveLayout({
    breakpoints: customBreakpoints,
    enableContentOverflowHandling: enableOverflowHandling,
    enablePerformanceOptimization: enablePerformanceOptimization
  });

  // 检查内容溢出
  useEffect(() => {
    if (enableOverflowHandling) {
      checkContentOverflow(containerRef);
    }
  }, [children, viewportInfo, checkContentOverflow, enableOverflowHandling]);

  // 通知布局变化
  useEffect(() => {
    if (onLayoutChange) {
      onLayoutChange({
        ...viewportInfo,
        contentOverflow,
        isLayoutStable,
        recommendations: getLayoutRecommendations()
      });
    }
  }, [viewportInfo, contentOverflow, isLayoutStable, onLayoutChange, getLayoutRecommendations]);

  // 计算最优列数
  const optimalColumns = getOptimalColumns(itemCount, maxColumns);
  const adaptiveSpacing = getAdaptiveSpacing();

  // 生成自适应断点配置
  const adaptiveBreakpoints: BreakpointConfig[] = customBreakpoints || [
    {
      name: 'mobile',
      minWidth: 0,
      columns: Math.min(optimalColumns, 1),
      gaps: adaptiveSpacing
    },
    {
      name: 'tablet',
      minWidth: 768,
      columns: Math.min(optimalColumns, 2),
      gaps: adaptiveSpacing
    },
    {
      name: 'desktop',
      minWidth: 1024,
      columns: Math.min(optimalColumns, 3),
      gaps: adaptiveSpacing
    },
    {
      name: 'wide',
      minWidth: 1280,
      columns: optimalColumns,
      gaps: adaptiveSpacing
    }
  ];

  // 性能优化：如果不建议渲染，显示简化版本
  if (!shouldRenderOptimized(itemCount)) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          'adaptive-layout-simplified',
          'overflow-auto',
          className
        )}
      >
        <div className="text-center py-8 text-gray-500">
          <p>内容较多，建议使用简化视图</p>
          <button 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        'adaptive-layout',
        'transition-all duration-300',
        {
          'opacity-75': !isLayoutStable,
          'border-2 border-orange-200 bg-orange-50': contentOverflow && enableOverflowHandling
        },
        className
      )}
    >
      {/* 布局警告提示 */}
      {contentOverflow && enableOverflowHandling && (
        <div className="mb-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-orange-600">⚠️</span>
            <span className="text-sm text-orange-800">
              内容可能超出容器范围，建议调整布局或使用滚动
            </span>
          </div>
        </div>
      )}

      {/* 布局建议 */}
      {process.env.NODE_ENV === 'development' && getLayoutRecommendations().length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>布局建议：</strong>
            <ul className="mt-1 list-disc list-inside">
              {getLayoutRecommendations().map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 主要内容 */}
      <ResponsiveGrid 
        breakpoints={adaptiveBreakpoints}
        className={cn(
          'adaptive-grid',
          {
            'animate-pulse': !isLayoutStable
          }
        )}
      >
        {children}
      </ResponsiveGrid>

      {/* 调试信息（仅开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <div>断点: {viewportInfo.breakpoint} | 列数: {viewportInfo.columns} | 最优列数: {optimalColumns}</div>
          <div>视口: {viewportInfo.width}x{viewportInfo.height} | 稳定: {isLayoutStable ? '是' : '否'}</div>
          {contentOverflow && <div className="text-orange-600">⚠️ 检测到内容溢出</div>}
        </div>
      )}
    </div>
  );
};

export default AdaptiveLayout;