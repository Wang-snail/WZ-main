import React, { useState, useRef, useEffect } from 'react';

/**
 * 可编辑标签组件
 * 功能：双击可编辑，Enter保存，Esc取消
 */
interface EditableLabelProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const EditableLabel: React.FC<EditableLabelProps> = ({
  value,
  onSave,
  className = '',
  placeholder = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // 当外部值变化时，同步更新内部状态
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // 编辑模式下自动聚焦并选中
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 保存编辑的值
  const handleSave = () => {
    if (editValue.trim() && editValue !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  // 渲染编辑状态
  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        className={`bg-gray-700 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 select-text ${className}`}
        placeholder={placeholder}
      />
    );
  }

  // 渲染显示状态
  return (
    <span
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      onMouseDown={(e) => e.stopPropagation()}
      className={`cursor-text hover:text-blue-300 transition-colors inline-flex items-center select-text ${className}`}
      title="双击编辑"
    >
      {value || placeholder}
    </span>
  );
};

export default EditableLabel;
