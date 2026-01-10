/**
 * ============================================================================
 * 文件名：可编辑标签.tsx
 * 功能描述：可编辑标签组件
 *
 * 本组件提供双击编辑功能：
 * 1. 显示模式：显示文本，双击进入编辑模式
 * 2. 编辑模式：显示输入框，Enter 保存，Esc 取消
 * 3. 失去焦点时自动保存
 *
 * 使用场景：
 * - 节点标题编辑
 * - 端口名称编辑
 * - 任何需要内联编辑的场景
 * ============================================================================
 */

// 导入 React 核心库和 Hooks
import React, { useState, useRef, useEffect } from 'react';

/**
 * 可编辑标签属性接口
 */
interface 可编辑标签属性 {
  value: string;                 // 当前值
  onSave: (value: string) => void;  // 保存回调
  className?: string;            // 额外的 CSS 类名
  placeholder?: string;          // 占位符文本
}

/**
 * 可编辑标签组件
 *
 * 功能说明：
 * 提供可内联编辑的标签组件，支持：
 * - 双击进入编辑模式
 * - Enter 键保存修改
 * - Esc 键取消编辑
 * - 点击外部自动保存
 */
export const 可编辑标签: React.FC<可编辑标签属性> = ({
  value,                // 当前显示的值
  onSave,               // 保存回调函数
  className = '',       // 额外的 CSS 类名
  placeholder = ''      // 占位符文本
}) => {
  // 是否处于编辑状态
  const [是否编辑, set是否编辑] = useState(false);

  // 编辑时的临时值
  const [编辑值, set编辑值] = useState(value);

  // 输入框的引用（用于自动聚焦和选中）
  const 输入框引用 = useRef<HTMLInputElement>(null);

  // ========================================================================
  // 效果处理（副作用）
  // ========================================================================

  /**
   * 当外部传入的值变化时，同步更新内部编辑状态
   *
   * 触发时机：
   * - 父组件传入新的 value 值
   */
  useEffect(() => {
    set编辑值(value);
  }, [value]);

  /**
   * 进入编辑模式时，自动聚焦并选中文本
   *
   * 触发时机：
   * - 是否编辑状态变为 true
   */
  useEffect(() => {
    if (是否编辑 && 输入框引用.current) {
      输入框引用.current.focus();         // 聚焦输入框
      输入框引用.current.select();        // 选中文本
    }
  }, [是否编辑]);

  // ========================================================================
  // 事件处理函数
  // ========================================================================

  /**
   * 保存编辑的值
   *
   * 功能：
   * 只有当值有效且发生变化时才调用保存回调
   */
  const handle保存 = () => {
    // 只有非空且与原值不同时才保存
    if (编辑值.trim() && 编辑值 !== value) {
      onSave(编辑值.trim());
    }
    // 退出编辑模式
    set是否编辑(false);
  };

  /**
   * 处理键盘按键事件
   *
   * @param event - 键盘事件
   */
  const handle按键 = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      // Enter 键：保存并退出编辑模式
      handle保存();
    } else if (event.key === 'Escape') {
      // Esc 键：恢复原值并退出编辑模式
      set编辑值(value);
      set是否编辑(false);
    }
  };

  // ========================================================================
  // 渲染
  // ========================================================================

  // 渲染编辑模式（输入框）
  if (是否编辑) {
    return (
      <input
        ref={输入框引用}                                      // 绑定引用
        value={编辑值}                                        // 当前编辑值
        onChange={(e) => set编辑值(e.target.value)}           // 更新编辑值
        onBlur={handle保存}                                   // 失去焦点时保存
        onKeyDown={handle按键}                                // 处理键盘事件
        onMouseDown={(e) => e.stopPropagation()}              // 阻止鼠标事件冒泡
        className={`
          bg-gray-700 border border-blue-500 rounded px-1.5 py-0.5
          text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500
          select-text ${className}
        `}
        placeholder={placeholder}
      />
    );
  }

  // 渲染显示模式（文本）
  return (
    <span
      onDoubleClick={(e) => {
        e.stopPropagation();    // 阻止双击事件冒泡
        set是否编辑(true);       // 进入编辑模式
      }}
      onMouseDown={(e) => e.stopPropagation()}    // 阻止鼠标事件冒泡
      className={`
        cursor-text hover:text-blue-300 transition-colors
        inline-flex items-center select-text ${className}
      `}
      title="双击编辑"
    >
      {value || placeholder}
    </span>
  );
};

// 导出默认组件
export default 可编辑标签;
