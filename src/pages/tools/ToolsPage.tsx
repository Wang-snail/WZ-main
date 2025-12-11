import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid3X3, List, Sparkles, Clock, Zap, Shield, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import ToolCard from '../../components/common/ToolCard';
import { dataService } from '../../services/dataService';
import { AITool } from '../../types';

// 工具分类数据
const toolCategories = [
  { id: 'data', name: '数据采集', icon: BookOpen },
  { id: 'automation', name: '自动化', icon: Zap },
  { id: 'content', name: '内容生成', icon: Sparkles },
  { id: 'image', name: '图片处理', icon: Clock },
  { id: 'utility', name: '实用工具', icon: Shield },
];

export default function ToolsPage() {
  const { t } = useTranslation();
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const allTools = await dataService.loadAITools('normal');
        setTools(allTools);
      } catch (error) {
        console.error('Failed to load tools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // 按分类分组工具
  const groupedTools = toolCategories.reduce((acc, category) => {
    const categoryTools = tools.filter(tool =>
      tool.category === category.id &&
      (tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    acc[category.id] = categoryTools;
    return acc;
  }, {} as Record<string, AITool[]>);

  return (
    <div className="page-layout">
      {/* 工具页面头部 */}
      <section className="page-header">
        <div className="max-w-7xl mx-auto container-padding py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('nav.tools')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              面向产品经理和电商运营的专业半自动化工具集合，提升工作效率
            </p>
          </motion.div>

          {/* 搜索栏 */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      <div className="page-content pt-0">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-4" style={{ height: 'calc(100vh - 200px)' }}>
            {toolCategories.map((category) => {
              const IconComponent = category.icon;
              const toolsInCategory = groupedTools[category.id] || [];

              return (
                <div
                  key={category.id}
                  className="kanban-column bg-white border border-gray-200 rounded-lg mr-4 flex-shrink-0"
                  style={{ width: '280px', height: 'calc(100vh - 120px)' }}
                >
                  <div className="kanban-title border-b border-gray-200 p-4">
                    <div className="flex items-center">
                      <IconComponent className="w-5 h-5 mr-2 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                        {toolsInCategory.length}
                      </span>
                    </div>
                  </div>
                  <div className="kanban-list flex-1 overflow-y-auto p-3 space-y-3">
                    {toolsInCategory.length > 0 ? (
                      toolsInCategory.map((tool, index) => (
                        <div key={tool.id || index} className="tool-card p-3 hover:bg-gray-50 transition-colors">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">{tool.name}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2">{tool.description}</p>
                          </div>
                          <Button variant="outline" size="sm" className="mt-2 w-full text-xs">
                            使用
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p className="text-sm">暂无工具</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}