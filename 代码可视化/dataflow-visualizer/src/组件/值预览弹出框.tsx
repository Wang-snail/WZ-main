/**
 * ============================================================================
 * 文件名：值预览弹出框.tsx
 * 功能描述：值预览弹出框组件，显示数据的完整预览
 *
 * 本组件用于在数据过长时提供预览功能：
 * 1. 格式化显示值（用于端口上简短显示）
 * 2. 完整显示值（用于预览窗口）
 * 3. 鼠标悬停/点击显示预览
 *
 * 格式化规则：
 * - null/undefined 显示为 'null'
 * - 数字直接显示，超长截断
 * - 字符串添加引号，超长截断
 * - 对象/数组显示 JSON，超长截断
 * ============================================================================
 */

// 导入 React 核心库和 Hooks
import React, { useState, useRef, useEffect, useCallback } from 'react';

// ============================================================================
// 第一部分：辅助函数
// ============================================================================

/**
 * 格式化值为字符串（用于端口上简短显示）
 *
 * @param value - 要格式化的值
 * @param maxLength - 最大长度（默认 25）
 * @returns 格式化后的字符串
 */
export const formatValueForDisplay = (value: any, maxLength: number = 25): string => {
  // 处理 null 和 undefined
  if (value === undefined || value === null) {
    return 'null';
  }

  // 处理数字类型
  if (typeof value === 'number') {
    const str = String(value);
    // 超长截断
    return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
  }

  // 处理字符串类型
  if (typeof value === 'string') {
    // 添加引号
    const str = value.length > 20 ? `"${value.substring(0, 18)}..."` : `"${value}"`;
    // 超长截断
    return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
  }

  // 处理布尔类型
  if (typeof value === 'boolean') {
    return String(value);
  }

  // 处理对象或数组
  const jsonStr = JSON.stringify(value);
  if (jsonStr.length > maxLength) {
    return jsonStr.substring(0, maxLength - 3) + '...';
  }
  return jsonStr;
};

/**
 * 格式化值为完整字符串（用于预览窗口）
 *
 * @param value - 要格式化的值
 * @returns 格式化后的完整字符串
 */
export const formatValueForPreview = (value: any): string => {
  // 处理 undefined
  if (value === undefined) return 'undefined';
  // 处理 null
  if (value === null) return 'null';

  // 处理对象类型
  if (typeof value === 'object') {
    try {
      // 格式化 JSON（带缩进）
      return JSON.stringify(value, null, 2);
    } catch {
      // 格式化失败则转为字符串
      return String(value);
    }
  }

  // 其他类型直接转为字符串
  return String(value);
};

// ============================================================================
// 第二部分：预览窗口组件属性接口
// ============================================================================

/**
 * 值预览弹出框组件属性接口
 */
interface 值预览弹出框Props {
  value: any;                                    // 要预览的值
  children: React.ReactElement;                  // 子元素（触发预览的元素）
  position?: 'top' | 'bottom' | 'left' | 'right'; // 弹出位置（默认 top）
}

// ============================================================================
// 第三部分：值预览弹出框主组件
// ============================================================================

/**
 * 值预览弹出框组件
 *
 * 当值需要截断显示时，鼠标悬停或点击可以查看完整值
 *
 * @param value - 要预览的值
 * @param children - 子元素
 * @param position - 弹出位置
 */
export const 值预览弹出框: React.FC<值预览弹出框Props> = ({
  value,
  children,
  position = 'top',
}) => {
  // 是否显示预览
  const [isVisible, setIsVisible] = useState(false);
  // 位置状态
  const [positionState, setPositionState] = useState({ top: 0, left: 0 });
  // 子元素引用
  const childRef = useRef<HTMLElement>(null);
  // 弹出框引用
  const popoverRef = useRef<HTMLDivElement>(null);

  /**
   * 更新弹出框位置
   *
   * 计算弹出框应该显示的位置
   */
  const updatePosition = useCallback(() => {
    // 如果没有子元素引用，返回
    if (!childRef.current) return;

    // 获取子元素的边界矩形
    const rect = childRef.current.getBoundingClientRect();
    // 弹出框尺寸
    const popoverWidth = 280;
    const popoverHeight = 150;

    // 初始化位置
    let top = 0;
    let left = 0;

    // 根据位置计算
    switch (position) {
      case 'top':
        // 上方：弹出框在子元素上方
        top = rect.top - popoverHeight - 8;
        left = rect.left + (rect.width - popoverWidth) / 2;
        break;
      case 'bottom':
        // 下方：弹出框在子元素下方
        top = rect.bottom + 8;
        left = rect.left + (rect.width - popoverWidth) / 2;
        break;
      case 'left':
        // 左侧：弹出框在子元素左侧
        top = rect.top + (rect.height - popoverHeight) / 2;
        left = rect.left - popoverWidth - 8;
        break;
      case 'right':
        // 右侧：弹出框在子元素右侧
        top = rect.top + (rect.height - popoverHeight) / 2;
        left = rect.right + 8;
        break;
    }

    // 边界检测：确保弹出框在视口内
    left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - popoverHeight - 8));

    // 更新位置状态
    setPositionState({ top, left });
  }, [position]);

  /**
   * 位置更新副作用
   *
   * 当显示状态变化时，更新位置并添加事件监听
   */
  useEffect(() => {
    if (isVisible) {
      // 如果显示，先更新位置
      updatePosition();
      // 添加滚动和 resize 事件监听
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    // 清理函数：移除事件监听
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, updatePosition]);

  /**
   * 鼠标进入处理
   *
   * 触发时机：鼠标进入子元素
   */
  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  /**
   * 鼠标离开处理
   *
   * 触发时机：鼠标离开子元素
   */
  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  /**
   * 点击处理
   *
   * 触发时机：点击子元素
   */
  const handleClick = () => {
    updatePosition();
    setIsVisible(!isVisible);
  };

  /**
   * 检测值是否需要截断
   *
   * @param val - 要检测的值
   * @returns 是否需要截断
   */
  const needsTruncation = (val: any): boolean => {
    // 处理 null 和 undefined
    if (val === undefined || val === null) return false;
    // 数字超过 20 位
    if (typeof val === 'number') return String(val).length > 20;
    // 字符串超过 18 字符
    if (typeof val === 'string') return val.length > 18;
    // 对象或数组的 JSON 超过 25 字符
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val).length > 25;
      } catch {
        return true;
      }
    }
    return false;
  };

  // 判断是否应该显示预览
  const shouldShowPreview = needsTruncation(value);

  // 渲染组件
  return (
    <>
      {/* 子元素：克隆并添加事件处理 */}
      {React.cloneElement(children, {
        ref: childRef as any,
        // 如果需要预览，添加鼠标事件
        onMouseEnter: shouldShowPreview ? handleMouseEnter : undefined,
        onMouseLeave: shouldShowPreview ? handleMouseLeave : undefined,
        // 如果需要预览，添加点击事件
        onClick: shouldShowPreview ? handleClick : undefined,
        // 如果需要预览，显示帮助光标和下划线
        style: shouldShowPreview ? { cursor: 'help', borderBottom: '1px dotted gray' } : undefined,
      })}

      {/* 预览弹出框 */}
      {isVisible && shouldShowPreview && (
        <div
          ref={popoverRef}
          className="fixed z-[9999] bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden"
          style={{
            top: positionState.top,
            left: positionState.left,
            width: 280,
            maxHeight: 200,
          }}
          // 鼠标进入时保持显示
          onMouseEnter={() => setIsVisible(true)}
          // 鼠标离开时隐藏
          onMouseLeave={() => setIsVisible(false)}
        >
          {/* 标题栏 */}
          <div className="px-3 py-2 bg-gray-700 border-b border-gray-600 flex items-center justify-between">
            <span className="text-xs text-gray-300 font-medium">数据预览</span>
            <span className="text-[10px] text-gray-500">点击或移出关闭</span>
          </div>
          {/* 内容区域 */}
          <div className="p-3 overflow-auto max-h-36">
            <pre className="text-xs text-gray-200 whitespace-pre-wrap break-all font-mono">
              {formatValueForPreview(value)}
            </pre>
          </div>
        </div>
      )}
    </>
  );
};

// 导出默认值预览弹出框
