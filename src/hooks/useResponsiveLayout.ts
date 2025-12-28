import { useState, useEffect, useCallback } from 'react';
import { BreakpointConfig } from '@/components/layout/ResponsiveGrid';

export interface ViewportInfo {
  width: number;
  height: number;
  breakpoint: string;
  columns: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
}

export interface LayoutAdaptationOptions {
  breakpoints?: BreakpointConfig[];
  debounceMs?: number;
  enableContentOverflowHandling?: boolean;
  enablePerformanceOptimization?: boolean;
}

const DEFAULT_BREAKPOINTS: BreakpointConfig[] = [
  {
    name: 'mobile',
    minWidth: 0,
    columns: 1,
    gaps: { row: '1rem', column: '1rem' }
  },
  {
    name: 'tablet',
    minWidth: 768,
    columns: 2,
    gaps: { row: '1.5rem', column: '1.5rem' }
  },
  {
    name: 'desktop',
    minWidth: 1024,
    columns: 3,
    gaps: { row: '2rem', column: '2rem' }
  },
  {
    name: 'wide',
    minWidth: 1280,
    columns: 4,
    gaps: { row: '2rem', column: '2rem' }
  }
];

/**
 * 响应式布局Hook
 * 监听视口变化并提供布局自适应逻辑
 */
export const useResponsiveLayout = (options: LayoutAdaptationOptions = {}) => {
  const {
    breakpoints = DEFAULT_BREAKPOINTS,
    debounceMs = 150,
    enableContentOverflowHandling = true,
    enablePerformanceOptimization = true
  } = options;

  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        breakpoint: 'desktop',
        columns: 3,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isWide: false
      };
    }

    return calculateViewportInfo(window.innerWidth, window.innerHeight, breakpoints);
  });

  const [isLayoutStable, setIsLayoutStable] = useState(true);
  const [contentOverflow, setContentOverflow] = useState(false);

  // 计算视口信息
  function calculateViewportInfo(width: number, height: number, bps: BreakpointConfig[]): ViewportInfo {
    // 找到匹配的断点
    const matchedBreakpoint = bps
      .slice()
      .reverse()
      .find(bp => width >= bp.minWidth) || bps[0];

    return {
      width,
      height,
      breakpoint: matchedBreakpoint.name,
      columns: matchedBreakpoint.columns,
      isMobile: matchedBreakpoint.name === 'mobile',
      isTablet: matchedBreakpoint.name === 'tablet',
      isDesktop: matchedBreakpoint.name === 'desktop',
      isWide: matchedBreakpoint.name === 'wide'
    };
  }

  // 防抖处理视口变化
  const handleResize = useCallback(() => {
    let timeoutId: NodeJS.Timeout;

    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newViewportInfo = calculateViewportInfo(
          window.innerWidth,
          window.innerHeight,
          breakpoints
        );

        setViewportInfo(prevInfo => {
          // 只有在断点实际改变时才更新
          if (prevInfo.breakpoint !== newViewportInfo.breakpoint) {
            setIsLayoutStable(false);
            
            // 延迟恢复稳定状态
            setTimeout(() => setIsLayoutStable(true), 300);
          }

          return newViewportInfo;
        });
      }, debounceMs);
    };

    debouncedResize();

    return () => clearTimeout(timeoutId);
  }, [breakpoints, debounceMs]);

  // 监听视口变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cleanup = handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      cleanup();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // 内容溢出检测
  const checkContentOverflow = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    if (!enableContentOverflowHandling || !containerRef.current) return;

    const container = containerRef.current;
    const hasOverflow = container.scrollWidth > container.clientWidth ||
                      container.scrollHeight > container.clientHeight;

    setContentOverflow(hasOverflow);
  }, [enableContentOverflowHandling]);

  // 获取优化的列数（基于内容数量和视口）
  const getOptimalColumns = useCallback((itemCount: number, maxColumns?: number) => {
    const baseColumns = viewportInfo.columns;
    const effectiveMaxColumns = maxColumns || baseColumns;

    if (itemCount === 0) return 1;
    if (itemCount === 1) return 1;
    if (itemCount === 2 && baseColumns > 2) return 2;

    // 根据内容数量调整列数
    const optimalColumns = Math.min(
      Math.ceil(Math.sqrt(itemCount)),
      effectiveMaxColumns,
      itemCount
    );

    return Math.max(1, optimalColumns);
  }, [viewportInfo.columns]);

  // 获取自适应间距
  const getAdaptiveSpacing = useCallback(() => {
    const currentBreakpoint = breakpoints.find(bp => bp.name === viewportInfo.breakpoint);
    return currentBreakpoint?.gaps || { row: '1rem', column: '1rem' };
  }, [viewportInfo.breakpoint, breakpoints]);

  // 性能优化：减少不必要的重渲染
  const shouldRenderOptimized = useCallback((itemCount: number) => {
    if (!enablePerformanceOptimization) return true;

    // 在移动设备上，如果项目很多，考虑虚拟化
    if (viewportInfo.isMobile && itemCount > 20) {
      return false; // 建议使用虚拟化
    }

    return true;
  }, [viewportInfo.isMobile, enablePerformanceOptimization]);

  // 获取布局建议
  const getLayoutRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (contentOverflow) {
      recommendations.push('考虑减少内容或使用滚动容器');
    }

    if (viewportInfo.isMobile && viewportInfo.columns > 2) {
      recommendations.push('移动端建议使用1-2列布局');
    }

    if (viewportInfo.isWide && viewportInfo.columns < 4) {
      recommendations.push('宽屏设备可以使用更多列数');
    }

    return recommendations;
  }, [contentOverflow, viewportInfo]);

  return {
    viewportInfo,
    isLayoutStable,
    contentOverflow,
    checkContentOverflow,
    getOptimalColumns,
    getAdaptiveSpacing,
    shouldRenderOptimized,
    getLayoutRecommendations,
    
    // 便捷的断点检查
    breakpoints: {
      isMobile: viewportInfo.isMobile,
      isTablet: viewportInfo.isTablet,
      isDesktop: viewportInfo.isDesktop,
      isWide: viewportInfo.isWide,
      current: viewportInfo.breakpoint
    }
  };
};

export default useResponsiveLayout;