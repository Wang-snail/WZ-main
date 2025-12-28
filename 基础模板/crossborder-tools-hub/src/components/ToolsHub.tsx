import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { 
  Settings, 
  RotateCcw, 
  Grid3X3,
  Sparkles 
} from 'lucide-react';
import { ToolCard } from './ToolCard';
import { tools, categories, Tool } from '../data/tools';

export const ToolsHub: React.FC = () => {
  const [toolOrder, setToolOrder] = useState<string[]>([]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 初始化工具顺序
  useEffect(() => {
    const savedOrder = localStorage.getItem('toolOrder');
    if (savedOrder) {
      setToolOrder(JSON.parse(savedOrder));
    } else {
      setToolOrder(tools.map(tool => tool.id));
    }
    setIsLoading(false);
  }, []);

  // 保存工具顺序到本地存储
  const saveToolOrder = (order: string[]) => {
    localStorage.setItem('toolOrder', JSON.stringify(order));
    setToolOrder(order);
  };

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = toolOrder.indexOf(active.id as string);
      const newIndex = toolOrder.indexOf(over?.id as string);

      const newOrder = arrayMove(toolOrder, oldIndex, newIndex);
      saveToolOrder(newOrder);
    }
  };

  // 重置为默认排序
  const resetToDefault = () => {
    const defaultOrder = tools.map(tool => tool.id);
    saveToolOrder(defaultOrder);
  };

  // 切换自定义模式
  const toggleCustomMode = () => {
    setIsCustomMode(!isCustomMode);
    if (isCustomMode) {
      setIsCustomMode(false);
    } else {
      setIsCustomMode(true);
    }
  };

  // 筛选工具
  const filteredTools = tools.filter(tool => {
    if (selectedCategory === '全部') return true;
    return tool.category === selectedCategory;
  });

  // 根据排序数组排列工具
  const sortedTools = filteredTools
    .map(tool => {
      const index = toolOrder.indexOf(tool.id);
      return { ...tool, sortIndex: index === -1 ? 999 : index };
    })
    .sort((a, b) => a.sortIndex - b.sortIndex);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  跨境数据洞察补给站
                </h1>
                <p className="text-gray-600 text-sm">
                  填补数据盲区，洞察跨境真相
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleCustomMode}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${isCustomMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Settings size={16} />
                {isCustomMode ? '完成排序' : '调整顺序'}
              </button>
              
              {isCustomMode && (
                <button
                  onClick={resetToDefault}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw size={16} />
                  重置默认
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 分类筛选器 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors
                ${selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 工具网格 */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedTools.map(tool => tool.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isCustomMode={isCustomMode}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {sortedTools.length === 0 && (
          <div className="text-center py-12">
            <Grid3X3 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              该分类暂无工具
            </h3>
            <p className="text-gray-600">
              请尝试其他分类或稍后再来查看
            </p>
          </div>
        )}
      </div>

      {/* 自定义模式提示 */}
      {isCustomMode && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium">
            拖拽工具卡片来调整顺序 • 排序将自动保存
          </p>
        </div>
      )}
    </div>
  );
};