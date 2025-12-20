import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid3X3, List, Sparkles, Clock, Zap, Shield, BookOpen, Target, Calculator, FileText, ArrowRight, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
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

// 核心工具数据
const coreTools = [
  {
    id: 1,
    title: '销售额目标追踪系统',
    description: '专业的销售目标管理工具，支持币种自动换算、成本结构分析和多品线业绩追踪。',
    icon: <Target className="w-8 h-8 text-blue-600" />,
    link: '/sales-target',
    color: 'bg-blue-50'
  },
  {
    id: 2,
    title: '亚马逊 FBA 费用计算器',
    description: '精确计算亚马逊 FBA 各项费用，帮助您制定合理的定价策略和利润预期。',
    icon: <Calculator className="w-8 h-8 text-green-600" />,
    link: '/tools/fba-calculator',
    color: 'bg-green-50'
  },
  {
    id: 3,
    title: '市场分析战略决策系统',
    description: '基于产品、用户、市场、竞品、供应链五维分析，智能推荐最优竞争战略。',
    icon: <BarChart3 className="w-8 h-8 text-indigo-600" />,
    link: '/tools/market-analysis',
    color: 'bg-indigo-50'
  },
  {
    id: 4,
    title: 'Kano 评论分析工具',
    description: '基于观点片段的 Kano 模型分析，从用户评论中提取功能需求和情感洞察。',
    icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
    link: '/tools/kano-analysis',
    color: 'bg-orange-50'
  },
  {
    id: 5,
    title: '亚马逊新品导入流程 SOP',
    description: '标准化的新品导入流程文档，涵盖从产品规划到上架销售的全过程。',
    icon: <FileText className="w-8 h-8 text-purple-600" />,
    link: '/processes/amazon-new-product-import',
    color: 'bg-purple-50'
  },
];

export default function ToolsPage() {
  const { t } = useTranslation();
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban'); // Kanban or list view

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const allTools = await dataService.loadAITools('normal');
        setTools(allTools || []); // 确保始终设置数组
      } catch (error) {
        console.error('Failed to load tools:', error);
        setTools([]); // 出错时设置为空数组
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // 按分类分组工具
  const groupedTools = React.useMemo(() => {
    return toolCategories.reduce((acc, category) => {
      const categoryTools = tools.filter(tool =>
        tool && tool.category && tool.category === category.id &&
        (tool.name && tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase())))
      );
      acc[category.id] = categoryTools;
      return acc;
    }, {} as Record<string, AITool[]>);
  }, [tools, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 工具页面头部 */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('nav.tools')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              为电商从业者精心打造的综合工具平台，涵盖核心管理工具和智能辅助工具
            </p>
          </motion.div>

          {/* 搜索栏 */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value || '')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* 核心工具区域 */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">核心管理工具</h2>
            <p className="text-gray-600">关键业务环节的必备工具套件</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {coreTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className={`${tool.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                  {tool.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{tool.description}</p>
                <Link to={tool.link}>
                  <Button className="w-full">
                    立即使用
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 智能辅助工具区域 */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">智能辅助工具</h2>
              <p className="text-gray-600">提升工作效率的半自动化工具集合</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          ) : viewMode === 'kanban' ? (
            <div className="flex overflow-x-auto pb-4" style={{ maxHeight: 'calc(100vh - 400px)' }}>
              {toolCategories.map((category) => {
                const toolsInCategory = groupedTools[category.id] || [];

                return (
                  <div
                    key={category.id}
                    className="kanban-column bg-white border border-gray-200 rounded-lg mr-4 flex-shrink-0"
                    style={{ width: '280px', maxHeight: 'calc(100vh - 480px)' }}
                  >
                    <div className="kanban-title border-b border-gray-200 p-4">
                      <div className="flex items-center">
                        {category.icon ? (
                          <category.icon className="w-5 h-5 mr-2 text-blue-600" />
                        ) : (
                          <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                        )}
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <span className="ml-2 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                          {toolsInCategory.length}
                        </span>
                      </div>
                    </div>
                    <div className="kanban-list flex-1 overflow-y-auto p-3 space-y-3">
                      {(toolsInCategory && toolsInCategory.length > 0) ? (
                        toolsInCategory.map((tool, index) => (
                          <div key={tool?.id || index} className="tool-card p-3 hover:bg-gray-50 transition-colors">
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">{tool?.name}</h4>
                              <p className="text-xs text-gray-600 line-clamp-2">{tool?.description}</p>
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
          ) : (
            <div>
              {toolCategories.map((category) => {
                const toolsInCategory = groupedTools[category.id] || [];
                if (!toolsInCategory || toolsInCategory.length === 0) return null;

                return (
                  <div key={category.id} className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      {category.icon ? <category.icon className="w-5 h-5 mr-2 text-blue-600" /> : <BookOpen className="w-5 h-5 mr-2 text-blue-600" />}
                      {category.name} ({toolsInCategory.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {toolsInCategory.map((tool, index) => (
                        <div key={tool?.id || index} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{tool?.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{tool?.description}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              使用
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 整合优势说明 */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">为什么选择我们的工具？</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">专为电商从业者设计，集成管理与辅助功能，提高工作效率</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">核心管理</h3>
              <p className="text-gray-600 text-sm">关键业务管理工具，助力业务决策</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">效率提升</h3>
              <p className="text-gray-600 text-sm">智能化辅助工具，大幅提升工作效率</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">流程规范</h3>
              <p className="text-gray-600 text-sm">标准化工作流程，提升团队协作效率</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">智能辅助</h3>
              <p className="text-gray-600 text-sm">AI赋能工具，帮助您更快更准地完成任务</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}