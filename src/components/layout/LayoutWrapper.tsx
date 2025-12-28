/**
 * 布局包装组件
 * 处理内容区域布局（导航栏由 Header 组件独立管理）
 */

import React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default LayoutWrapper;