import React from 'react';
import { cn } from '@/lib/utils';

export interface BreakpointConfig {
  name: string;
  minWidth: number;
  columns: number;
  gaps: {
    row: string;
    column: string;
  };
}

export interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  breakpoints?: BreakpointConfig[];
  defaultColumns?: number;
  adaptiveSpacing?: boolean;
}

// 默认断点配置
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
 * 响应式网格布局组件
 * 支持自定义断点和列数配置
 */
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  breakpoints = DEFAULT_BREAKPOINTS,
  defaultColumns = 1,
  adaptiveSpacing = true
}) => {
  // 生成CSS类名
  const generateGridClasses = () => {
    const classes: string[] = ['grid', 'w-full'];
    
    // 添加默认列数
    classes.push(`grid-cols-${defaultColumns}`);
    
    // 为每个断点添加响应式类
    breakpoints.forEach(bp => {
      if (bp.minWidth === 0) {
        // 移动端（默认）
        classes.push(`grid-cols-${bp.columns}`);
        if (adaptiveSpacing) {
          classes.push(`gap-4`); // 默认间距
        }
      } else if (bp.minWidth >= 768 && bp.minWidth < 1024) {
        // 平板
        classes.push(`md:grid-cols-${bp.columns}`);
        if (adaptiveSpacing) {
          classes.push(`md:gap-6`);
        }
      } else if (bp.minWidth >= 1024 && bp.minWidth < 1280) {
        // 桌面
        classes.push(`lg:grid-cols-${bp.columns}`);
        if (adaptiveSpacing) {
          classes.push(`lg:gap-8`);
        }
      } else if (bp.minWidth >= 1280) {
        // 宽屏
        classes.push(`xl:grid-cols-${bp.columns}`);
        if (adaptiveSpacing) {
          classes.push(`xl:gap-8`);
        }
      }
    });
    
    return classes.join(' ');
  };

  // 生成内联样式（用于自定义间距）
  const generateCustomStyles = (): React.CSSProperties => {
    if (adaptiveSpacing) {
      return {}; // 使用Tailwind类
    }
    
    // 使用自定义间距
    const mobileBreakpoint = breakpoints.find(bp => bp.minWidth === 0);
    if (mobileBreakpoint) {
      return {
        gap: `${mobileBreakpoint.gaps.row} ${mobileBreakpoint.gaps.column}`
      };
    }
    
    return {};
  };

  return (
    <div 
      className={cn(generateGridClasses(), className)}
      style={generateCustomStyles()}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;

// 预设配置导出
export const GRID_PRESETS = {
  // 应用卡片网格（适用于数据实验室应用展示）
  appCards: [
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
      minWidth: 1536,
      columns: 4,
      gaps: { row: '2rem', column: '2rem' }
    }
  ] as BreakpointConfig[],

  // 工具网格（适用于工具页面）
  tools: [
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
    }
  ] as BreakpointConfig[],

  // 紧凑网格（适用于信息密集的页面）
  compact: [
    {
      name: 'mobile',
      minWidth: 0,
      columns: 2,
      gaps: { row: '0.75rem', column: '0.75rem' }
    },
    {
      name: 'tablet',
      minWidth: 768,
      columns: 3,
      gaps: { row: '1rem', column: '1rem' }
    },
    {
      name: 'desktop',
      minWidth: 1024,
      columns: 4,
      gaps: { row: '1.25rem', column: '1.25rem' }
    },
    {
      name: 'wide',
      minWidth: 1536,
      columns: 6,
      gaps: { row: '1.25rem', column: '1.25rem' }
    }
  ] as BreakpointConfig[]
};