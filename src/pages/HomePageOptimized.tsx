import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import ToolCard from '../components/common/ToolCard';
import { dataService } from '../services/dataService';
import { AITool } from '../types';

export default function HomePageOptimized() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        // Load all tools or popular ones. The user wants a "toolbox hall", so maybe all or a large list.
        // Let's load all and filter/display.
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

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-medium text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            <span>DeepSeek 驱动 · 免费无需登录 · 实时生成</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            跨境电商 AI 提效工具箱
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            一站式聚合 100+ 款 AI 提效工具，从选品、文案到运营全流程覆盖，让跨境生意更简单。
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative mb-12">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-lg"
              placeholder="搜索工具（如：亚马逊文案、利润计算...）"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>
      </section>

      {/* Tools Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">正在加载工具库...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Featured Tool: Sales Target Tracking */}
              <ToolCard
                name="销售额目标追踪系统"
                description="专业的销售目标管理工具，支持币种自动换算、成本结构分析和多品线业绩追踪。"
                link="/sales-target"
                hot={true}
                icon={<span className="text-2xl">💰</span>}
              />
              {filteredTools.map((tool, index) => (
                <ToolCard
                  key={tool.id || index}
                  name={tool.name}
                  description={tool.description}
                  link={tool.link || '#'}
                  hot={tool.hot || tool.hot_score > 85}
                  icon={null} // Can add specific icons based on category later
                />
              ))}
            </div>

            {filteredTools.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                未找到相关工具，换个关键词试试？
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer CTA */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">没找到想要的工具？</h2>
          <p className="text-gray-600 mb-6">添加顾问微信，告诉我们您的需求，我们将在 24 小时内为您寻找或定制。</p>
          <div className="flex justify-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg h-auto">
              联系顾问定制
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 rounded-xl text-lg h-auto border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => window.location.href = '/discussion'}
            >
              互动社区
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}