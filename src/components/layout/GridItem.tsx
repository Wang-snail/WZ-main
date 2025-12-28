import React from 'react';
import { cn } from '@/lib/utils';
import { GridItemProps } from '@/types/layout';

/**
 * 网格项组件
 * 用于在ResponsiveGrid中控制单个项目的布局行为
 */
const GridItem: React.FC<GridItemProps> = ({
  children,
  className = '',
  columnSpan,
  order
}) => {
  // 生成列跨度类名
  const generateColumnSpanClasses = () => {
    if (!columnSpan) return '';
    
    const classes: string[] = [];
    
    if (columnSpan.mobile) {
      classes.push(`col-span-${columnSpan.mobile}`);
    }
    
    if (columnSpan.tablet) {
      classes.push(`md:col-span-${columnSpan.tablet}`);
    }
    
    if (columnSpan.desktop) {
      classes.push(`lg:col-span-${columnSpan.desktop}`);
    }
    
    if (columnSpan.wide) {
      classes.push(`xl:col-span-${columnSpan.wide}`);
    }
    
    return classes.join(' ');
  };

  // 生成排序类名
  const generateOrderClasses = () => {
    if (!order) return '';
    
    const classes: string[] = [];
    
    if (order.mobile !== undefined) {
      classes.push(`order-${order.mobile}`);
    }
    
    if (order.tablet !== undefined) {
      classes.push(`md:order-${order.tablet}`);
    }
    
    if (order.desktop !== undefined) {
      classes.push(`lg:order-${order.desktop}`);
    }
    
    if (order.wide !== undefined) {
      classes.push(`xl:order-${order.wide}`);
    }
    
    return classes.join(' ');
  };

  const itemClasses = cn(
    generateColumnSpanClasses(),
    generateOrderClasses(),
    className
  );

  return (
    <div className={itemClasses}>
      {children}
    </div>
  );
};

export default GridItem;