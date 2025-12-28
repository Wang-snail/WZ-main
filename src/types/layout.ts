/**
 * 布局系统类型定义
 */

export interface LayoutBreakpoint {
  name: string;
  minWidth: number;
  columns: number;
  gaps: {
    row: string;
    column: string;
  };
}

export interface ResponsiveLayout {
  breakpoints: LayoutBreakpoint[];
  defaultColumns: number;
  adaptiveSpacing: boolean;
}

export interface ColumnConfig {
  span: number;
  order: number;
  minWidth?: string;
}

export interface GridItemProps {
  children: React.ReactNode;
  className?: string;
  columnSpan?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  order?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
}

export interface LayoutConfig {
  type: 'grid' | 'flex' | 'masonry';
  responsive: boolean;
  breakpoints: LayoutBreakpoint[];
  spacing: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

// 预定义的布局模式
export enum LayoutMode {
  SINGLE_COLUMN = 'single-column',
  TWO_COLUMN = 'two-column',
  THREE_COLUMN = 'three-column',
  FOUR_COLUMN = 'four-column',
  ADAPTIVE = 'adaptive',
  MASONRY = 'masonry'
}

// 内容区域类型
export enum ContentArea {
  MAIN = 'main',
  SIDEBAR = 'sidebar',
  HEADER = 'header',
  FOOTER = 'footer',
  NAVIGATION = 'navigation'
}

export interface LayoutSection {
  area: ContentArea;
  content: React.ReactNode;
  config?: {
    sticky?: boolean;
    collapsible?: boolean;
    minWidth?: string;
    maxWidth?: string;
  };
}