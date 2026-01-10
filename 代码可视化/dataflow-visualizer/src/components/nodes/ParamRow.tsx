import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * 参数行组件（带独立连接点）
 * 功能：每行显示一个参数，左侧有输入连接点，右侧有输出连接点
 */
interface ParamRowProps {
  name: string;
  type: string;
  hasInput?: boolean;
  hasOutput?: boolean;
  inputId?: string;
  outputId?: string;
  editable?: boolean;
  onNameSave?: (value: string) => void;
}

export const ParamRow: React.FC<ParamRowProps> = ({
  name,
  type,
  hasInput = false,
  hasOutput = false,
  inputId,
  outputId,
  editable = true,
  onNameSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  // 同步外部值
  useEffect(() => {
    setEditValue(name);
  }, [name]);

  // 编辑模式下自动聚焦并选中
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 保存编辑
  const handleSave = () => {
    if (editValue.trim() && editValue !== name && onNameSave) {
      onNameSave(editValue.trim());
    }
    setIsEditing(false);
  };

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(name);
      setIsEditing(false);
    }
  };

  // 根据是否可编辑显示不同的名称显示
  const displayName = editable ? (
    isEditing ? (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="bg-gray-700 border border-blue-500 rounded px-1 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    ) : (
      <span
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className="cursor-text hover:text-blue-300 text-xs"
      >
        {name}
      </span>
    )
  ) : (
    <span className="text-xs">{name}</span>
  );

  return (
    <div className="flex items-center h-5">
      {/* 输入连接点 */}
      {hasInput && inputId && (
        <Handle
          type="target"
          position={Position.Left}
          id={inputId}
          className="w-2 h-2 bg-green-500 border border-white rounded-full"
          style={{ left: -6 }}
        />
      )}

      {/* 参数名 */}
      <span className="ml-2 text-xs text-gray-200">{displayName}</span>

      {/* 类型标注 */}
      <span className="ml-1 text-[10px] text-gray-500">({type})</span>

      {/* 占位符，保持输出连接点位置 */}
      {hasOutput && <span className="flex-1" />}

      {/* 输出连接点 */}
      {hasOutput && outputId && (
        <Handle
          type="source"
          position={Position.Right}
          id={outputId}
          className="w-2 h-2 bg-orange-500 border border-white rounded-full"
          style={{ right: -6 }}
        />
      )}
    </div>
  );
};

export default ParamRow;
