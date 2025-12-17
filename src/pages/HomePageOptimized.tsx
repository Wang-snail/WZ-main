import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import ToolCard from '../components/common/ToolCard';
import { dataService } from '../services/dataService';
import { AITool } from '../types';

export default function HomePageOptimized() {
  const { t } = useTranslation();
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="relative pt-12 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            为产品经理和电商运营提供半自动化工具，提高 3x 效率
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            无需注册 • 免费使用 • 实战导向
          </p>

          {/* 四个核心按钮 */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg h-auto min-w-[200px]"
              onClick={() => window.location.href = '/tools'}
            >
              所有工具
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 rounded-xl text-lg h-auto min-w-[200px] border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => window.location.href = '/workflows'}
            >
              实战流程
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 rounded-xl text-lg h-auto min-w-[200px] border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => window.location.href = '/forum'}
            >
              讨论区
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Tools Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">{t('home.loading')}</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Featured Tool: Sales Target Tracking */}
              <ToolCard
                name={t('home.tools.salesTarget.name')}
                description={t('home.tools.salesTarget.desc')}
                link="/sales-target"
                hot={true}
                icon={<span className="text-2xl">💰</span>}
              />
              {tools.map((tool, index) => (
                <ToolCard
                  key={tool.id || index}
                  name={tool.name}
                  description={tool.description}
                  link={tool.link || '#'}
                  hot={tool.hot || tool.hot_score > 85}
                  icon={null}
                />
              ))}
            </div>

            {tools.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                {t('home.noResults')}
              </div>
            )}
          </>
        )}
      </section>

      {/* 工具精选区 */}
      <section className="container-padding max-w-7xl mx-auto pb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">工具精选</h2>
          <p className="text-gray-600">最受欢迎的半自动化工具</p>
        </div>

        <div className="grid-responsive">
          {tools.slice(0, 6).map((tool, index) => (
            <ToolCard
              key={tool.id || index}
              name={tool.name}
              description={tool.description}
              link={tool.link || '#'}
              hot={tool.hot || tool.hot_score > 85}
              icon={null}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={() => window.location.href = '/tools'}
          >
            查看全部工具
          </Button>
        </div>
      </section>

      {/* 最新问题 (论坛) */}
      <section className="container-padding max-w-7xl mx-auto pb-12">
        <div className="tool-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">最新问题</h2>
            <Button variant="outline" onClick={() => window.location.href = '/forum'}>
              查看更多
            </Button>
          </div>

          <div className="space-y-4">
            {/* 模拟最新问题 */}
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-medium text-gray-900">如何快速采集商品信息？</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">大家好，我想了解一下有什么工具可以快速采集淘宝/1688商品信息？</p>
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <span>电商小白</span>
                <span className="mx-2">•</span>
                <span>2小时前</span>
                <span className="mx-2">•</span>
                <span>12 条回复</span>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-medium text-gray-900">分享一个批量处理图片的小技巧</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">我发现了一个批量处理商品图片的好方法，可以大幅提升效率...</p>
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <span>运营高手</span>
                <span className="mx-2">•</span>
                <span>5小时前</span>
                <span className="mx-2">•</span>
                <span>8 条回复</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 最新更新 (同步) */}
      <section className="container-padding max-w-7xl mx-auto pb-12">
        <div className="tool-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">最新更新</h2>
            <Button variant="outline" onClick={() => window.location.href = '/sync'}>
              查看更多
            </Button>
          </div>

          <div className="space-y-4">
            {/* 模拟最新更新 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900">商品信息采集工具新增支持1688</h3>
              <p className="text-sm text-gray-600 mt-1">现在可以采集1688商品信息了，支持批量操作和数据导出功能...</p>
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <span>2025-01-15</span>
                <span className="mx-2">•</span>
                <span className="category-tag bg-blue-100 text-blue-800">
                  工具更新
                </span>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900">修复了数据提取工具的兼容性问题</h3>
              <p className="text-sm text-gray-600 mt-1">修复了在某些网站无法正常提取数据的问题，提升了工具的稳定性...</p>
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <span>2025-01-10</span>
                <span className="mx-2">•</span>
                <span className="category-tag bg-green-100 text-green-800">
                  Bug修复
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('home.bottomCta.title')}</h2>
          <p className="text-gray-600 mb-6">{t('home.bottomCta.desc')}</p>
          <div className="flex justify-center gap-4">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg h-auto"
              onClick={() => window.location.href = '/email-contact'}
            >
              {t('home.bottomCta.contact')}
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 rounded-xl text-lg h-auto border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => window.location.href = '/discussion'}
            >
              {t('home.bottomCta.community')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}