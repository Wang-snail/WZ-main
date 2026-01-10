/**
 * ============================================================================
 * 文件名：调整大小手柄.tsx
 * 功能描述：缩放手柄组件
 *
 * 本组件是节点右下角的缩放手柄，用于调整节点大小：
 * 1. 显示缩放图标
 * 2. 处理鼠标拖拽事件
 * 3. 阻止事件冒泡，防止触发节点移动
 *
 * 关键要点：
 * - 添加 className="nodrag" 阻止 React Flow 识别为可拖拽区域
 * - 使用 e.stopPropagation() 阻止事件冒泡
 * ============================================================================
 */

// 导入 React 核心库
import React from 'react';

/**
 * 调整大小手柄属性接口
 */
interface 调整大小手柄属性 {
  onMouseDown: (event: React.MouseEvent) => void;  // 鼠标按下事件回调
}

/**
 * 调整大小手柄组件
 *
 * 功能说明：
 * 渲染节点右下角的缩放手柄：
 * 1. 显示缩放图标（L 形）
 * 2. 捕获鼠标按下事件
 * 3. 阻止事件冒泡，防止触发节点移动
 *
 * @param onMouseDown - 鼠标按下事件回调
 */
export const 调整大小手柄: React.FC<调整大小手柄属性> = ({ onMouseDown }) => (
  <div
    className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize flex items-end justify-end select-none nodrag"
    onMouseDown={(event) => {
      event.preventDefault();          // 阻止默认行为
      event.stopPropagation();         // 阻止事件冒泡，防止触发节点移动！
      onMouseDown(event);              // 调用回调
    }}
    title="拖拽调整大小"
  >
    {/* 简洁的缩放图标 */}
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="mb-0.5 mr-0.5"
    >
      {/* L 形缩放图标路径 */}
      <path
        d="M8 4L11 7M8 4H4V8M11 7V3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-400"
      />
    </svg>
  </div>
);

// 导出默认组件
export default 调整大小手柄;
