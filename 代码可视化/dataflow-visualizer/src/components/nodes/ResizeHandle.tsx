import React from 'react';

/**
 * 缩放手柄组件
 * 功能：右下角缩放手柄，用于调整节点大小
 * 关键：添加 className="nodrag" 阻止 React Flow 识别为可拖拽区域
 */
interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ onMouseDown }) => (
  <div
    className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize flex items-end justify-end select-none nodrag"
    onMouseDown={(e) => {
      e.preventDefault();
      e.stopPropagation(); // 阻止冒泡，防止触发节点移动！
      onMouseDown(e);
    }}
    title="拖拽调整大小"
  >
    {/* 简洁的缩放图标 */}
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mb-0.5 mr-0.5">
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

export default ResizeHandle;
