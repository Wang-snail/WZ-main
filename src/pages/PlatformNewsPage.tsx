import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Newspaper,
  TrendingUp,
  Calendar,
  Tag,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { Button } from '../components/ui/button';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  platform: string;
  category: string;
  summary: string;
  content: string;
  impact: string;
  relevantPlatforms: string[];
}

interface NewsData {
  news: NewsItem[];
  categories: Record<string, {
    name: string;
    description: string;
    items: string[];
  }>;
  totalCount: number;
  lastUpdate: string;
  year: number;
}

export default function PlatformNewsPage() {
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedNews, setExpandedNews] = useState<string | null>(null);

  useEffect(() => {
    // 加载新闻数据
    fetch('/data/platform_news_2025.json')
      .then(res => res.json())
      .then(data => {
        setNewsData(data);
        setFilteredNews(data.news);
      })
      .catch(err => console.error('加载新闻数据失败:', err));
  }, []);

  useEffect(() => {
    if (!newsData) return;

    let filtered = newsData.news;

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === selectedCategory);
    }

    // 按平台筛选
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(news => news.platform === selectedPlatform);
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(news =>
        news.title.toLowerCase().includes(query) ||
        news.content.toLowerCase().includes(query) ||
        news.platform.toLowerCase().includes(query)
      );
    }

    setFilteredNews(filtered);
  }, [selectedCategory, selectedPlatform, searchQuery, newsData]);

  if (!newsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  const categoryMap = {
    platform_policy: '平台政策',
    market_trends: '市场趋势',
    promotion_activities: '促销活动',
    operation_tips: '运营技巧',
    logistics_payment: '物流支付',
    case_study: '案例分析',
    industry_news: '行业资讯',
  };

  // 统计平台数量
  const platformStats = filteredNews.reduce((acc, news) => {
    acc[news.platform] = (acc[news.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPlatforms = Object.entries(platformStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <>
      <Helmet>
        <title>平台情报中心 - 313条跨境电商平台最新动态 | WSNAIL.COM</title>
        <meta name="description" content="实时追踪313条2025年跨境电商平台情报。涵盖Amazon、Shopee、TikTok等10+平台的政策更新、市场趋势、促销活动。7大分类，精准筛选，助您掌握平台最新动态。" />
        <meta name="keywords" content="平台情报,跨境电商新闻,Amazon政策,Shopee动态,TikTok大促,速卖通活动,平台政策,市场趋势,电商资讯" />
        <link rel="canonical" href="https://wsnail.com/platform-news" />
        <meta property="og:title" content="平台情报中心 - 313条跨境电商平台最新动态" />
        <meta property="og:description" content="实时追踪313条2025年跨境电商平台情报。涵盖Amazon、Shopee、TikTok等主流平台政策、市场、促销动态。" />
        <meta property="og:url" content="https://wsnail.com/platform-news" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-100 to-gray-50">
        {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Newspaper className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">平台情报中心</h1>
            <p className="text-xl text-blue-100 mb-6">
              实时追踪跨境电商平台动态 · 2025年全年资讯
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>更新时间: {newsData.lastUpdate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                <span>共 {newsData.totalCount} 条情报</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧筛选栏 */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-xl bg-white/60 border border-gray-200 rounded-2xl p-6 shadow-xl sticky top-4">
              {/* 搜索框 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  搜索
                </label>
                <input
                  type="text"
                  placeholder="搜索标题或内容..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 分类筛选 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  分类筛选
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    全部分类 ({newsData.totalCount})
                  </button>
                  {Object.entries(categoryMap).map(([key, name]) => {
                    const count = newsData.categories[key]?.items.length || 0;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === key
                            ? 'bg-blue-100 text-blue-700 font-semibold'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {name} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 平台筛选 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  平台筛选
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedPlatform('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedPlatform === 'all'
                        ? 'bg-cyan-100 text-cyan-700 font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    全部平台
                  </button>
                  {topPlatforms.map(([platform, count]) => (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedPlatform === platform
                          ? 'bg-cyan-100 text-cyan-700 font-semibold'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {platform} ({count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧新闻列表 */}
          <div className="lg:col-span-3">
            {filteredNews.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/60 border border-gray-200 rounded-2xl p-12 text-center shadow-xl">
                <Newspaper className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 text-lg">没有找到相关新闻</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNews.map((news, index) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="backdrop-blur-xl bg-white/60 border border-gray-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:border-gray-300"
                  >
                    {/* 新闻头部 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {categoryMap[news.category as keyof typeof categoryMap]}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700">
                            {news.platform}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {news.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {news.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 新闻摘要 */}
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {news.summary || news.content.substring(0, 150)}
                      {news.content.length > 150 && '...'}
                    </p>

                    {/* 展开/收起按钮 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedNews(expandedNews === news.id ? null : news.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {expandedNews === news.id ? '收起' : '查看详情'}
                      <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${expandedNews === news.id ? 'rotate-90' : ''}`} />
                    </Button>

                    {/* 展开的详细内容 */}
                    {expandedNews === news.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {news.content}
                          </p>
                          {news.impact && (
                            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                              <p className="text-sm font-semibold text-amber-800 mb-1">
                                <TrendingUp className="w-4 h-4 inline mr-1" />
                                影响分析
                              </p>
                              <p className="text-sm text-amber-700">{news.impact}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
