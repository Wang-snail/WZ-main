/**
 * ============================================================================
 * 文件名：入口.tsx
 * 功能描述：应用入口文件
 *
 * 本文件是整个应用的入口点，负责：
 * 1. 启用 React 的 StrictMode（开发模式下的额外检查）
 * 2. 使用 ErrorBoundary 包裹整个应用（错误边界处理）
 * 3. 渲染 App 根组件到 DOM
 *
 * React DOM 渲染流程：
 * 1. StrictMode：开发模式下启用额外检查（双重渲染、废弃 API 警告等）
 * 2. ErrorBoundary：捕获子组件的错误，防止整个应用崩溃
 * 3. App：渲染应用的根组件
 *
 * 注意：
 * StrictMode 只在开发模式下生效，生产环境会自动忽略
 * ErrorBoundary 会捕获子组件的渲染错误并显示错误状态
 * ============================================================================
 */

// 从 react 导入 StrictMode（严格模式）和 createRoot（创建根节点）
import { StrictMode } from 'react';

// 从 react-dom 导入 createRoot（React 18 的新渲染 API）
import { createRoot } from 'react-dom/client';

// 导入错误边界组件（捕获子组件错误）
import { 错误边界 } from './组件/错误边界';

// 导入全局样式
import './index.css';

// 导入应用根组件
import { 应用 } from './应用';

// 获取 DOM 中的根元素
// '!' 表示非空断言（确信元素一定存在）
const rootElement = document.getElementById('root')!;

// 使用 React 18 的 createRoot API 创建根节点
const root = createRoot(rootElement);

// 渲染应用
// React 18 支持并发渲染和自动批处理
root.render(
  // StrictMode：开发模式下的额外检查
  <StrictMode>
    {/* ErrorBoundary：错误边界，捕获渲染错误 */}
    <错误边界>
      {/* App：应用根组件 */}
      <应用 />
    </错误边界>
  </StrictMode>
);
