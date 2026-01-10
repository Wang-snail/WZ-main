/**
 * ============================================================================
 * 文件名：提示.tsx
 * 功能描述：提示通知组件，提供成功、错误、警告、信息四种类型的提示
 *
 * 本组件是一个提示通知系统，提供以下功能：
 * 1. 显示不同类型的提示（成功、错误、警告、信息）
 * 2. 自动消失（可配置时长）
 * 3. 手动关闭
 * 4. 全局提示支持
 *
 * 提示类型：
 * - success: 成功提示（绿色）
 * - error: 错误提示（红色）
 * - warning: 警告提示（黄色）
 * - info: 信息提示（蓝色）
 * ============================================================================
 */

// 导入 React 核心库和 Hooks
import React, { useState, useEffect } from 'react';

// 从 lucide-react 导入图标组件
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ============================================================================
// 第一部分：提示类型定义
// ============================================================================

/**
 * 提示数据类型
 */
interface 提示 {
  id: string;                                      // 提示唯一标识符
  message: string;                                 // 提示消息内容
  type: 'success' | 'error' | 'warning' | 'info';  // 提示类型
  duration?: number;                               // 显示时长（毫秒）
}

/**
 * 提示容器组件属性接口
 */
interface 提示容器Props {
  toasts: 提示[];           // 提示列表
  onRemove: (id: string) => void;  // 移除提示回调
}

// ============================================================================
// 第二部分：提示容器组件
// ============================================================================

/**
 * 提示容器组件
 *
 * 渲染所有提示通知
 *
 * @param toasts - 提示列表
 * @param onRemove - 移除提示回调
 */
const 提示容器: React.FC<提示容器Props> = ({ toasts, onRemove }) => {
  /**
   * 获取提示图标
   *
   * 根据提示类型返回对应的图标
   *
   * @param type - 提示类型
   * @returns 图标组件
   */
  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;  // 成功图标
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;        // 错误图标
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />; // 警告图标
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;          // 信息图标
    }
  };

  /**
   * 获取提示颜色
   *
   * 根据提示类型返回对应的背景和边框颜色
   *
   * @param type - 提示类型
   * @returns 颜色类名
   */
  const getToastColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-900 border-green-700';  // 成功：绿色
      case 'error':
        return 'bg-red-900 border-red-700';      // 错误：红色
      case 'warning':
        return 'bg-yellow-900 border-yellow-700';// 警告：黄色
      case 'info':
      default:
        return 'bg-blue-900 border-blue-700';    // 信息：蓝色
    }
  };

  // 如果没有提示，返回 null
  if (toasts.length === 0) return null;

  // 渲染提示容器
  return (
    // 固定在右上角、z-index 50、垂直排列
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* 遍历渲染每个提示 */}
      {toasts.map((toast) => (
        <div
          key={toast.id}  // 唯一键
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg border backdrop-blur-sm ${getToastColor(toast.type)} max-w-sm shadow-lg animate-in slide-in-from-right-full duration-300`}
        >
          {/* 图标 */}
          {getToastIcon(toast.type)}
          {/* 消息内容 */}
          <span className="text-white text-sm flex-1">{toast.message}</span>
          {/* 关闭按钮 */}
          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 第三部分：提示 Hook
// ============================================================================

/**
 * 提示 Hook
 *
 * 提供添加和移除提示的方法
 *
 * @returns 包含 toast 方法、removeToast 方法和 ToastComponent 组件的对象
 */
export const useToast = () => {
  // 提示列表状态
  const [toasts, setToasts] = useState<提示[]>([]);

  /**
   * 添加提示
   *
   * @param message - 提示消息
   * @param type - 提示类型（默认 info）
   * @param duration - 显示时长（默认 5000 毫秒）
   * @returns 提示 ID
   */
  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 5000) => {
    // 生成唯一 ID
    const id = Math.random().toString(36).substr(2, 9);
    // 创建新提示
    const newToast: 提示 = { id, message, type, duration };

    // 添加到列表
    setToasts(prev => [...prev, newToast]);

    // 如果设置了时长，自动移除
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    // 返回提示 ID
    return id;
  };

  /**
   * 移除提示
   *
   * @param id - 要移除的提示 ID
   */
  const removeToast = (id: string) => {
    // 从列表中移除
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // 提示组件
  const ToastComponent = () => (
    <提示容器 toasts={toasts} onRemove={removeToast} />
  );

  // 返回方法
  return {
    toast: addToast,           // 添加提示方法
    removeToast,               // 移除提示方法
    ToastComponent,            // 提示组件
  };
};

// ============================================================================
// 第四部分：全局提示支持
// ============================================================================

// 全局提示函数引用
let globalToastFunction: ((message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => string) | null = null;

/**
 * 设置全局提示函数
 *
 * 用于在非 React 组件中调用提示
 *
 * @param toastFunction - 提示函数
 */
export const setGlobalToast = (toastFunction: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => string) => {
  globalToastFunction = toastFunction;
};

/**
 * 显示全局提示
 *
 * 可以在任何地方调用
 *
 * @param message - 提示消息
 * @param type - 提示类型（默认 info）
 * @param duration - 显示时长（可选）
 */
export const showGlobalToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number) => {
  // 如果有全局提示函数，调用它
  if (globalToastFunction) {
    globalToastFunction(message, type, duration);
  }
};

// ============================================================================
// 第五部分：自定义事件监听器
// ============================================================================

// 在浏览器环境中设置自定义事件监听器
if (typeof window !== 'undefined') {
  // 监听 show-toast 自定义事件
  window.addEventListener('show-toast', (event: any) => {
    // 从事件中获取参数
    const { message, type, duration } = event.detail;
    // 这里会通过 useToast hook 来处理
  });
}
