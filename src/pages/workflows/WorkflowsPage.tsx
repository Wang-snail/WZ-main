import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play, Clock, Users, TrendingUp, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';

// 实战指南数据
const workflows = [
  {
    id: 1,
    title: '10分钟上架新商品',
    description: '使用爬虫工具 + 文案生成 + 图片处理，快速完成商品上架流程',
    duration: '10 分钟',
    difficulty: '初级',
    tools: ['商品信息采集', '文案生成', '图片处理'],
    category: '商品运营',
    icon: Zap
  },
  {
    id: 2,
    title: '1688到咸鱼搬运',
    description: '利用半自动方式快速构建低门槛的搬运操作流程',
    duration: '30 分钟',
    difficulty: '中级',
    tools: ['商品信息采集', '文案生成', '数据提取'],
    category: '商品搬运',
    icon: TrendingUp
  },
  {
    id: 3,
    title: '竞品分析流程',
    description: '使用数据采集工具进行竞品分析，找出市场机会',
    duration: '45 分钟',
    difficulty: '中级',
    tools: ['数据采集', '数据分析', '自动化'],
    category: '市场分析',
    icon: Users
  },
  {
    id: 4,
    title: '自动文案生成',
    description: '通过AI生成高质量商品文案和营销内容',
    duration: '5 分钟',
    difficulty: '初级',
    tools: ['文案生成', '内容优化'],
    category: '内容创作',
    icon: BookOpen
  },
  {
    id: 5,
    title: '图片批量处理',
    description: '快速处理商品图片，提升视觉效果',
    duration: '15 分钟',
    difficulty: '初级',
    tools: ['图片处理', '批量操作'],
    category: '视觉优化',
    icon: Clock
  }
];

const categories = [
  '全部', '商品运营', '商品搬运', '市场分析', '内容创作', '视觉优化'
];

export default function WorkflowsPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesCategory = selectedCategory === '全部' || workflow.category === selectedCategory;
    const matchesSearch = 
      workflow.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.tools.some(tool => tool.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-layout">
      {/* 实战指南页面头部 */}
      <section className="page-header">
        <div className="max-w-7xl mx-auto container-padding py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('nav.workflows')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              为产品经理和电商运营提供的实战操作流程，将工具转化为可直接产生价值的工作流
            </p>
          </motion.div>

          <div className="relative max-w-lg mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="搜索实战指南..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      <div className="page-content">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧目录 */}
          <aside className="page-sidebar">
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">指南分类</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* 中间内容区域 */}
          <main className="page-main">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                找到 {filteredWorkflows.length} 个实战指南
              </p>
            </div>

            <div className="grid-responsive">
              {filteredWorkflows.map((workflow) => {
                const IconComponent = workflow.icon;
                return (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className="tool-card"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="category-tag bg-green-100 text-green-800">
                          {workflow.difficulty}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{workflow.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{workflow.description}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {workflow.duration}
                        </div>
                        <span className="bg-gray-100 px-2 py-1 rounded">{workflow.category}</span>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-1">相关工具</p>
                        <div className="flex flex-wrap gap-1">
                          {workflow.tools.map((tool, index) => (
                            <span key={index} className="category-tag bg-blue-100 text-blue-800">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        开始学习
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredWorkflows.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <p>未找到匹配的实战指南</p>
                <p className="mt-2 text-sm">请尝试调整筛选条件或搜索关键词</p>
              </div>
            )}
          </main>

          {/* 右侧推荐工具 */}
          <aside className="page-sidebar">
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">相关工具推荐</h3>
              <div className="space-y-3">
                {/* 这里可以展示与当前筛选器相关的工具 */}
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium text-gray-900 mb-1">商品信息采集</h4>
                  <p className="text-sm text-gray-600">快速获取商品详细信息</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium text-gray-900 mb-1">文案生成</h4>
                  <p className="text-sm text-gray-600">AI生成高质量营销文案</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium text-gray-900 mb-1">图片处理</h4>
                  <p className="text-sm text-gray-600">批量处理商品图片</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium text-gray-900 mb-1">数据提取</h4>
                  <p className="text-sm text-gray-600">从网页提取结构化数据</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}