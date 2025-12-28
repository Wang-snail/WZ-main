import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Search, 
  Package, 
  MessageSquare, 
  TrendingUp, 
  Truck, 
  BarChart3, 
  Edit3, 
  Calendar, 
  Target, 
  Shield, 
  DollarSign, 
  Zap,
  Star,
  Flame,
  GripVertical
} from 'lucide-react';
import { Tool } from '../data/tools';

interface ToolCardProps {
  tool: Tool;
  isDragging?: boolean;
  isCustomMode?: boolean;
}

const iconMap = {
  Search,
  Package,
  MessageSquare,
  TrendingUp,
  Truck,
  BarChart3,
  Edit3,
  Calendar,
  Target,
  Shield,
  DollarSign,
  Zap
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool, isDragging, isCustomMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging
  } = useSortable({ id: tool.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortableIsDragging ? 0.5 : 1
  };

  const IconComponent = iconMap[tool.icon as keyof typeof iconMap];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-xl p-6 shadow-sm border border-gray-100 
        hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer
        ${isCustomMode ? 'cursor-grab active:cursor-grabbing' : ''}
        ${isDragging ? 'z-50' : ''}
      `}
      {...attributes}
      {...(isCustomMode ? listeners : {})}
    >
      {/* 顶部状态标签和拖拽手柄 */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          {tool.isNew && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              NEW
            </span>
          )}
          {tool.isHot && (
            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full flex items-center gap-1">
              <Flame size={12} />
              HOT
            </span>
          )}
        </div>
        {isCustomMode && (
          <div className="text-gray-400 hover:text-gray-600 transition-colors">
            <GripVertical size={16} />
          </div>
        )}
      </div>

      {/* 图标和类别 */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-3 rounded-lg ${tool.color} text-white`}>
          {IconComponent && <IconComponent size={20} />}
        </div>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {tool.category}
        </span>
      </div>

      {/* 工具名称 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {tool.name}
      </h3>

      {/* 工具描述 */}
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {tool.description}
      </p>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          立即使用
        </button>
        {!isCustomMode && (
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Star size={16} />
          </button>
        )}
      </div>
    </div>
  );
};