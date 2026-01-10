import React, { useState, useRef, useEffect, useCallback } from 'react';

// 格式化值为字符串（用于端口上显示）
export const formatValueForDisplay = (value: any, maxLength: number = 25): string => {
  if (value === undefined || value === null) {
    return 'null';
  }

  if (typeof value === 'number') {
    const str = String(value);
    return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
  }

  if (typeof value === 'string') {
    const str = value.length > 20 ? `"${value.substring(0, 18)}..."` : `"${value}"`;
    return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
  }

  if (typeof value === 'boolean') {
    return String(value);
  }

  // 对象或数组
  const jsonStr = JSON.stringify(value);
  if (jsonStr.length > maxLength) {
    return jsonStr.substring(0, maxLength - 3) + '...';
  }
  return jsonStr;
};

// 格式化值为完整字符串（用于预览窗口）
export const formatValueForPreview = (value: any): string => {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

// 预览窗口组件
interface ValuePreviewPopoverProps {
  value: any;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const ValuePreviewPopover: React.FC<ValuePreviewPopoverProps> = ({
  value,
  children,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [positionState, setPositionState] = useState({ top: 0, left: 0 });
  const childRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!childRef.current) return;

    const rect = childRef.current.getBoundingClientRect();
    const popoverWidth = 280;
    const popoverHeight = 150;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - popoverHeight - 8;
        left = rect.left + (rect.width - popoverWidth) / 2;
        break;
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + (rect.width - popoverWidth) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - popoverHeight) / 2;
        left = rect.left - popoverWidth - 8;
        break;
      case 'right':
        top = rect.top + (rect.height - popoverHeight) / 2;
        left = rect.right + 8;
        break;
    }

    // 边界检测
    left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - popoverHeight - 8));

    setPositionState({ top, left });
  }, [position]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, updatePosition]);

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleClick = () => {
    updatePosition();
    setIsVisible(!isVisible);
  };

  // 检测值是否需要截断
  const needsTruncation = (val: any): boolean => {
    if (val === undefined || val === null) return false;
    if (typeof val === 'number') return String(val).length > 20;
    if (typeof val === 'string') return val.length > 18;
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val).length > 25;
      } catch {
        return true;
      }
    }
    return false;
  };

  const shouldShowPreview = needsTruncation(value);

  return (
    <>
      {React.cloneElement(children, {
        ref: childRef as any,
        onMouseEnter: shouldShowPreview ? handleMouseEnter : undefined,
        onMouseLeave: shouldShowPreview ? handleMouseLeave : undefined,
        onClick: shouldShowPreview ? handleClick : undefined,
        style: shouldShowPreview ? { cursor: 'help', borderBottom: '1px dotted gray' } : undefined,
      })}

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
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div className="px-3 py-2 bg-gray-700 border-b border-gray-600 flex items-center justify-between">
            <span className="text-xs text-gray-300 font-medium">数据预览</span>
            <span className="text-[10px] text-gray-500">点击或移出关闭</span>
          </div>
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

export default ValuePreviewPopover;
