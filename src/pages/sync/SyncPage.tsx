import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Calendar, AlertCircle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';

// 模拟更新/同步信息数据
const syncData = [
  {
    id: 1,
    title: '商品信息采集工具新增支持1688',
    content: '现在可以采集1688商品信息了，支持批量操作和数据导出功能。详细使用方法请查看工具页面。',
    date: '2025-01-15',
    type: '更新',
    category: '工具更新',
    status: 'info'
  },
  {
    id: 2,
    title: '修复了数据提取工具的兼容性问题',
    content: '修复了在某些网站无法正常提取数据的问题，提升了工具的稳定性。感谢用户的反馈。',
    date: '2025-01-10',
    type: '修复',
    category: 'Bug修复',
    status: 'success'
  },
  {
    id: 3,
    title: '新增了商品上架工作流指南',
    content: '添加了一个完整的商品上架工作流，从信息采集到文案生成，帮助用户快速上手业务流程。',
    date: '2025-01-08',
    type: '新增',
    category: '教程',
    status: 'info'
  },
  {
    id: 4,
    title: '图片批量处理工具性能优化',
    content: '优化了图片批量处理工具的性能，处理速度提升了30%，同时支持更多格式。',
    date: '2025-01-05',
    type: '优化',
    category: '性能',
    status: 'success'
  },
  {
    id: 5,
    title: '系统维护通知',
    content: '为了提升服务稳定性，我们将在1月20日晚上10点到11点进行系统维护，届时可能会有短暂的服务中断。',
    date: '2025-01-18',
    type: '通知',
    category: '系统',
    status: 'warning'
  }
];

const categories = [
  '全部', '工具更新', 'Bug修复', '教程', '性能', '系统'
];

export default function SyncPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = syncData.filter(item => {
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="page-layout">
      {/* 更新/同步页面头部 */}
      <section className="page-header">
        <div className="max-w-7xl mx-auto container-padding py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('nav.sync')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              工具更新、版本日志、教程和系统状态监控结果，保持与用户的沟通
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="搜索更新内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="page-content">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧分类 */}
          <aside className="page-sidebar">
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">分类</h3>
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

              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">系统状态</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>工具服务</span>
                    <span className="ml-auto text-green-600">正常</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>API服务</span>
                    <span className="ml-auto text-green-600">正常</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>数据同步</span>
                    <span className="ml-auto text-green-600">正常</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* 中间内容列表 */}
          <main className="page-main">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                共 {filteredData.length} 条更新
              </p>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
            </div>

            <div className="space-y-6">
              {filteredData.map((item) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="tool-card"
                >
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                        <span className="ml-3 category-tag bg-gray-100 text-gray-800">
                          {item.type}
                        </span>
                        <span className="ml-2 category-tag bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4">{item.content}</p>

                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{item.date}</span>
                        <TrendingUp className="w-4 h-4 ml-4 mr-1" />
                        <span>持续更新中</span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <p>暂无更新内容</p>
                <p className="mt-2 text-sm">请稍后再来查看最新动态</p>
              </div>
            )}
          </main>

          {/* 右侧信息 */}
          <aside className="page-sidebar">
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">关于更新</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">为什么关注更新？</h4>
                  <p>及时了解工具的新功能和改进，保持业务流程的高效性。</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">订阅通知</h4>
                  <p>我们会在重要更新时通过邮件通知您，确保您不会错过任何重要变化。</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">反馈渠道</h4>
                  <p>如果您对工具有任何建议或反馈，欢迎在论坛板块与我们交流。</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">更新频率</h4>
                  <p>我们每周都会对工具进行优化，每月发布新功能。</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}