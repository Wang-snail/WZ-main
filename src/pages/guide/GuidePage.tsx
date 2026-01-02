import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Menu, BookOpen, ChevronRight, Clock, Eye, Edit2, FileText,
  Folder, Users, TrendingUp, DollarSign, Package, BarChart3, Globe,
  Plus, Star, Calendar, Tag, Filter, X, Share2, Bookmark, ThumbsUp, Cpu, Zap,
  TrendingUp as TrendUp, RefreshCw, ArrowRight, Target, Shield, Zap as Lightning,
  ExternalLink, AlertCircle
} from 'lucide-react';

// 分类定义
const wikiCategories = [
  {
    id: 'amazon',
    name: '亚马逊运营',
    icon: Globe,
    color: 'bg-blue-100 text-blue-700',
    description: '亚马逊平台开店、选品、运营、广告等全方位指南'
  },
  {
    id: 'tiktok',
    name: 'TikTok电商',
    icon: Zap,
    color: 'bg-purple-100 text-purple-700',
    description: 'TikTok Shop运营、短视频营销、直播带货攻略'
  },
  {
    id: 'tax',
    name: '税务合规',
    icon: Shield,
    color: 'bg-amber-100 text-amber-700',
    description: '各国税务政策、VAT注册、税务合规与申报指南'
  },
  {
    id: 'new-platform',
    name: '新兴平台',
    icon: TrendUp,
    color: 'bg-green-100 text-green-700',
    description: 'TEMU、SHEIN、Ozon等新兴跨境电商平台运营指南'
  },
  {
    id: 'product',
    name: '选品开发',
    icon: Target,
    color: 'bg-rose-100 text-rose-700',
    description: '选品分析、竞品研究、产品差异化与专利布局'
  },
  {
    id: 'ai-news',
    name: 'AI新闻',
    icon: Cpu,
    color: 'bg-indigo-100 text-indigo-700',
    description: '人工智能领域最新动态、GPT、Claude等AI工具资讯'
  },
  {
    id: 'industry',
    name: '行业信息',
    icon: BarChart3,
    color: 'bg-cyan-100 text-cyan-700',
    description: '跨境电商行业动态、政策解读、市场趋势分析'
  }
];

// 文章详情内容库
const articleDetailContents: Record<string, string[]> = {
  'amz-001': [
    '2025年12月，亚马逊全球开店跨境峰会在深圳圆满落幕。本次峰会汇聚了数万名跨境电商从业者，共同探讨行业发展趋势与未来机遇。',
    '峰会核心亮点：',
    '1. 亚马逊宣布2026年将继续加大对中国卖家的扶持力度，包括流量倾斜、物流优惠和费率减免等多重利好。',
    '2. 全新AI工具正式上线，帮助卖家更高效地优化Listing，从3天缩短到3分钟即可完成一个优质listing的创建。',
    '3. 加拿大站KYC审核流程全面优化，卖家可以更快完成资质审核，加速入驻。',
    '4. FBA物流服务全面升级，配送速度再创新高，部分地区可实现当日达。',
    '5. 品牌保护措施加强，透明计划和品牌备案功能进一步完善。',
    '对卖家的影响与建议：',
    '建议卖家密切关注平台政策变化，充分利用AI工具提升运营效率，同时加强合规意识，确保店铺稳健运营。'
  ],
  'tt-001': [
    '12月26日，TikTok CEO周受资发布内部信，确认美国业务最新进展方案，引发跨境电商圈广泛关注。',
    '内部信核心要点：',
    '1. TikTok美国业务将继续正常运营，不受禁令影响，用户和商家无需担忧。',
    '2. 公司将加大在美国的投资，预计未来一年创造更多就业岗位。',
    '3. 继续推进与字节跳动的技术分离计划，确保数据安全。',
    '4. 加大对美国创作者和商家的支持力度，推出多项扶持政策。',
    '对卖家的影响：',
    'TikTok Shop美国站将继续稳定运营，卖家可以放心布局。平台将推出更多商家扶持政策，包括流量扶持、费率优惠等。建议卖家抓住机遇，提前布局美国市场。'
  ],
  'tax-001': [
    '近日，亚马逊卖家圈炸锅了！多位卖家发现平台报给税局的数据与实际收入存在差异，引发广泛关注和担忧。',
    '问题分析：',
    '1. 亚马逊向税务机关申报的销售数据基于平台记录，可能与卖家自行统计存在偏差。',
    '2. 退款、取消订单、退货等数据处理方式可能造成统计口径差异。',
    '3. 部分卖家收到税务局的查账通知，要求解释数据差异。',
    '4. 汇率波动也可能导致最终金额与平台显示不一致。',
    '应对建议：',
    '- 保留完整的销售记录和财务报表，至少保存7年。',
    '- 定期核对平台数据与自营数据，发现差异及时排查。',
    '- 如收到税务局查账通知，及时准备合理解释和相关证据。',
    '- 建议咨询专业税务顾问，确保税务合规。'
  ],
  'ai-001': [
    'OpenAI近日宣布ChatGPT新增Agent模式，这一功能让AI能够自主规划和执行复杂任务，无需人工频繁干预，标志着AI应用进入新纪元。',
    '主要特性：',
    '1. 自主任务规划：AI可根据目标自动分解任务步骤，制定执行计划。',
    '2. 多工具协作：可同时调用搜索、代码编写、文件处理等多种工具。',
    '3. 持续执行：支持长时间运行的后台任务，不受会话限制。',
    '4. 智能决策：能够根据执行结果自动调整策略。',
    '对跨境电商的影响：',
    '卖家可利用Agent模式自动化产品调研、竞品分析、市场调研、文案撰写等工作，大幅提升运营效率。一个提示词即可完成原本需要数小时的工作。',
    '使用建议：',
    '建议先在小范围任务中测试，熟悉其工作方式后再应用于核心业务。同时注意数据安全，避免泄露敏感信息。'
  ],
  'ind-001': [
    '2025年跨境电商行业趋势报告完整版发布，基于对数万家跨境电商企业的调研数据，全面分析了行业发展现状与未来趋势。',
    '报告核心发现：',
    '1. 全球跨境电商市场规模预计突破4万亿美元，中国卖家贡献超过30%。',
    '2. 亚马逊仍是主流平台，但新兴平台份额持续增长。',
    '3. AI工具应用加速，超过60%的卖家已开始使用AI辅助运营。',
    '4. 社交电商崛起，TikTok Shop成为新增长点。',
    '5. 合规要求趋严，税务合规成为卖家关注重点。',
    '2026年趋势预测：',
    '- AI将更深度融入电商运营全流程。',
    '- 本地化运营成为差异化竞争关键。',
    '- 供应链数字化程度进一步提升。',
    '- 新兴市场机会持续涌现。'
  ]
};

const getArticleDetail = (id: string): string[] => {
  return articleDetailContents[id] || [
    '本文为您详细解析该话题的核心内容。',
    '',
    '背景介绍：',
    '随着跨境电商行业的快速发展，越来越多的卖家开始关注这一领域。本文将为您深入分析相关要点。',
    '',
    '主要内容：',
    '1. 行业背景与发展趋势',
    '2. 核心知识点与操作技巧',
    '3. 实战案例分析',
    '4. 常见问题与解决方案',
    '',
    '建议：',
    '卖家应根据自身情况，结合平台最新政策，制定合适的运营策略。持续学习行业知识，保持竞争优势。',
    '',
    '关注我们，获取更多跨境电商资讯。'
  ];
};

// 搜索标签
const allTags = [
  '亚马逊', 'TikTok', 'TEMU', 'SHEIN', 'FBA', 'VAT', 'KYC', 'Listing', 'PPC广告',
  '选品', '广告', 'Review', '专利', '侵权', '税务', '物流', '独立站', 'Shopify',
  '直播', '短视频', '品牌', '欧盟', '美国', '日本', '东南亚', '欧洲', '中东', '拉美',
  'AI', 'ChatGPT', 'Claude', 'Gemini', 'Copilot', 'LLaMA', 'GPT', 'AI选品', 'Midjourney',
  'BSR', 'A+页面', '品牌备案', '透明计划', 'VE账号', 'ACOS', '转化率'
];

// 文章接口
interface Article {
  id: string;
  title: string;
  date: string;
  readTime: string;
  views: number;
  hot: boolean;
  source: string;
  category: string;
  url?: string;
}

interface NewsData {
  lastUpdate: string;
  lastUpdateDate: string;
  articles: Article[];
  aiNews: Article[];
  stats: {
    total: number;
    categories: Record<string, number>;
  };
}

const WikiPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<(Article & { categoryName: string }) | null>(null);
  const [articleLike, setArticleLike] = useState(false);
  const [articleBookmarked, setArticleBookmarked] = useState(false);
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取当前真实日期
  const today = useMemo(() => new Date(), []);

  // 获取相对时间描述
  const getRelativeTimeDesc = (dateStr: string): string => {
    try {
      const articleDate = new Date(dateStr);
      const diffTime = today.getTime() - articleDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return '今天';
      if (diffDays === 1) return '昨天';
      if (diffDays < 7) return `${diffDays}天前`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // 获取数据
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/wiki/latest-news.json');
        if (!response.ok) {
          throw new Error('无法加载资讯数据');
        }
        const data = await response.json();
        setNewsData(data);
      } catch (err) {
        console.error('加载资讯数据失败:', err);
        setError('资讯加载失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, []);

  // 过滤分类后的文章
  const filteredCategories = useMemo(() => {
    if (!newsData) return [];

    let categories = activeCategory
      ? wikiCategories.filter(cat => cat.id === activeCategory)
      : wikiCategories;

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      categories = categories.map(cat => ({
        ...cat,
        articles: cat.articles.filter(article =>
          article.title.toLowerCase().includes(query) ||
          cat.name.toLowerCase().includes(query)
        )
      })).filter(cat => cat.articles.length > 0);
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      categories = categories.map(cat => ({
        ...cat,
        articles: cat.articles.filter(article =>
          selectedTags.some(tag => article.title.toLowerCase().includes(tag.toLowerCase()))
        )
      })).filter(cat => cat.articles.length > 0);
    }

    // 日期过滤
    if (dateFilter !== 'all') {
      const days = parseInt(dateFilter);
      const cutoffDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

      categories = categories.map(cat => ({
        ...cat,
        articles: cat.articles.filter(article => new Date(article.date) >= cutoffDate)
      })).filter(cat => cat.articles.length > 0);
    }

    return categories;
  }, [activeCategory, searchQuery, selectedTags, dateFilter, newsData, today]);

  // 过滤新闻
  const filteredNews = useMemo(() => {
    if (!newsData) return [];

    if (dateFilter === 'all') {
      return [...(newsData.articles || []), ...(newsData.aiNews || [])];
    }

    const days = parseInt(dateFilter);
    const cutoffDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

    const allNews = [...(newsData.articles || []), ...(newsData.aiNews || [])];
    return allNews.filter(news => new Date(news.date) >= cutoffDate);
  }, [dateFilter, newsData, today]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setDateFilter('all');
    setActiveCategory(null);
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || dateFilter !== 'all' || activeCategory;

  // 获取总文章数
  const totalArticles = newsData?.articles.length || 0;

  // 按分类分组的文章
  const articlesByCategory = useMemo(() => {
    if (!newsData) return {};

    const grouped: Record<string, Article[]> = {};
    newsData.articles.forEach(article => {
      if (!grouped[article.category]) {
        grouped[article.category] = [];
      }
      grouped[article.category].push(article);
    });
    return grouped;
  }, [newsData]);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>行业信息 - 跨境智能平台 | 每日更新的跨境电商资讯</title>
        <meta name="description" content="跨境电商行业知识库，包含亚马逊运营、TikTok电商、税务合规、选品开发等全方位指南。每日更新，基于雨果网等公开资讯。" />
        <meta name="keywords" content="跨境电商,亚马逊运营,TikTok电商,税务合规,选品开发,AI新闻,雨果网,跨境资讯" />
      </Helmet>

      {/* Wikipedia-style Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="bg-gray-100 border-b border-gray-200 py-1 px-4 text-xs text-gray-500 text-right">
          <span className="cursor-pointer hover:underline">登录</span>
          <span className="mx-2">|</span>
          <span className="cursor-pointer hover:underline">创建账户</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-gray-900 text-lg">跨境电商百科</div>
                  <div className="text-xs text-gray-500">60天100+篇专业资讯</div>
                </div>
              </Link>
            </div>

            <div className="flex-1 max-w-xl mx-4 lg:mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索资讯、技巧、指南..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${showFilters ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Filter className="w-4 h-4" />
                筛选
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">阅读</button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">编辑</button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 bg-gray-50 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">时间范围：</span>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">全部时间</option>
                    <option value="7">最近7天</option>
                    <option value="30">最近30天</option>
                    <option value="60">最近60天</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">标签：</span>
                  {allTags.slice(0, 20).map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {hasActiveFilters && (
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">清除所有筛选</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 lg:block hidden`}>
          <div className="p-4 border-r border-gray-200 h-[calc(100vh-140px)] overflow-y-auto sticky top-[136px]">
            <nav className="space-y-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                分类导航
              </div>
              <button
                onClick={() => setActiveCategory(null)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCategory === null ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Folder className="w-4 h-4" />
                <span className="flex-1 text-left">全部分类</span>
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{totalArticles}</span>
              </button>

              {wikiCategories.map((cat) => {
                const Icon = cat.icon;
                const catCount = newsData?.stats.categories[cat.name] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === cat.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{cat.name}</span>
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{catCount}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${activeCategory === cat.id ? 'rotate-90' : ''}`} />
                  </button>
                );
              })}

              <div className="border-t border-gray-200 my-4"></div>

              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">快捷入口</div>
              <Link to="/tools" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Package className="w-4 h-4" />
                工具中心
              </Link>
              <Link to="/community" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                <Users className="w-4 h-4" />
                讨论社区
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-2 text-sm text-gray-500">
            <span className="hover:underline cursor-pointer">首页</span>
            <ChevronRight className="w-4 h-4 inline mx-1" />
            <span className="text-gray-900">行业信息</span>
            {activeCategory && (
              <>
                <ChevronRight className="w-4 h-4 inline mx-1" />
                <span className="text-blue-600">{wikiCategories.find(c => c.id === activeCategory)?.name}</span>
              </>
            )}
          </div>

          <div className="flex">
            <div className="flex-1 p-6 lg:p-8">
              {/* Page Title */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {activeCategory ? wikiCategories.find(c => c.id === activeCategory)?.name : '跨境电商行业信息'}
                </h1>
                <p className="text-gray-600">
                  {activeCategory
                    ? wikiCategories.find(c => c.id === activeCategory)?.description
                    : `跨境电商专业知识库，更新${totalArticles}篇专业资讯，涵盖亚马逊运营、TikTok电商、税务合规、选品开发等全方位指南${newsData?.lastUpdateDate ? `，最后更新: ${newsData.lastUpdateDate}` : ''}`}
                </p>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mb-6 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">当前筛选：</span>
                  {searchQuery && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                      关键词: {searchQuery}
                      <button onClick={() => setSearchQuery('')}>×</button>
                    </span>
                  )}
                  {selectedTags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                      {tag}
                      <button onClick={() => toggleTag(tag)}>×</button>
                    </span>
                  ))}
                  {dateFilter !== 'all' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                      最近{dateFilter}天
                      <button onClick={() => setDateFilter('all')}>×</button>
                    </span>
                  )}
                </div>
              )}

              {/* Category Grid */}
              <div className="space-y-8">
                {loading ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>正在加载资讯数据...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <p>{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      刷新页面
                    </button>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>未找到相关内容</p>
                    <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline">清除筛选</button>
                  </div>
                ) : (
                  filteredCategories.map((category) => {
                    const Icon = category.icon;
                    const catArticles = articlesByCategory[category.name] || [];
                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className={`px-4 py-3 ${category.color} flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5" />
                            <h2 className="font-semibold">{category.name}</h2>
                          </div>
                          <span className="text-sm opacity-75">{catArticles.length} 篇</span>
                        </div>

                        <div className="divide-y divide-gray-100">
                          {catArticles.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500">
                              暂无该分类资讯
                            </div>
                          ) : (
                            catArticles.slice(0, 10).map((article) => (
                              <div
                                key={article.id}
                                onClick={() => {
                                  setSelectedArticle({ ...article, categoryName: category.name });
                                  setArticleLike(false);
                                  setArticleBookmarked(false);
                                }}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-700 group-hover:text-blue-600 truncate">{article.title}</span>
                                      {article.hot && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded flex-shrink-0">热</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{getRelativeTimeDesc(article.date)}</span>
                                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
                                      <span className="text-gray-300">|</span>
                                      <span className="text-xs text-gray-500">{article.source}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-400 flex-shrink-0 ml-4">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {(article.views / 1000).toFixed(1)}K
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                          <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            查看全部 {category.name} <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Recent News */}
              <div className="mt-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  最新热门资讯
                  <span className="text-sm font-normal text-gray-500">（{filteredNews.length}条）</span>
                </h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {filteredNews.slice(0, 15).map((news, idx) => (
                      <div key={idx} className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700 hover:text-blue-600 truncate flex-1">{news.title}</span>
                          <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-500 text-xs rounded flex-shrink-0">{news.category}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0 ml-4">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{getRelativeTimeDesc(news.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Popular & Stats */}
              <div className="mt-12 grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    热门文章排行
                  </h3>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">加载中...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-500 flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredNews.filter(n => n.hot).slice(0, 8).map((article, idx) => (
                        <div key={article.id || idx} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer truncate">{article.title}</span>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{(article.views / 1000).toFixed(1)}K</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    数据统计
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{totalArticles}</div>
                      <div className="text-sm text-gray-500">篇专业文章</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{filteredNews.length}</div>
                      <div className="text-sm text-gray-500">条热门资讯</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{wikiCategories.length}</div>
                      <div className="text-sm text-gray-500">个内容分类</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{newsData?.aiNews.length || 0}</div>
                      <div className="text-sm text-gray-500">条AI资讯</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="w-72 hidden xl:block p-6">
              <div className="border border-gray-200 rounded-lg overflow-hidden sticky top-[136px]">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">行业信息</h3>
                </div>
                <div className="p-4 space-y-4">
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">加载中...</div>
                  ) : error ? (
                    <div className="text-center py-4 text-red-500 text-sm">{error}</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold text-gray-900">{totalArticles}</div>
                          <div className="text-xs text-gray-500">篇文章</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold text-gray-900">{wikiCategories.length}</div>
                          <div className="text-xs text-gray-500">个分类</div>
                        </div>
                      </div>

                      {newsData?.lastUpdateDate && (
                        <div className="text-center p-2 bg-blue-50 rounded text-xs text-blue-600">
                          最后更新: {newsData.lastUpdateDate}
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">内容分类</h4>
                        <div className="flex flex-wrap gap-1">
                          {wikiCategories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                              <span key={cat.id} className={`text-xs px-2 py-1 rounded-full cursor-pointer hover:opacity-80 ${cat.color}`}>
                                {cat.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">快速筛选</h4>
                        <div className="flex flex-wrap gap-1">
                          {['7', '30', '60'].map(days => (
                            <button
                              key={days}
                              onClick={() => setDateFilter(days)}
                              className={`text-xs px-2 py-1 rounded-full ${
                                dateFilter === days ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              最近{days}天
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 space-y-2">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                          <RefreshCw className="w-4 h-4" />
                          刷新资讯
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                          <Plus className="w-4 h-4" />
                          添加文章
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{selectedArticle.categoryName}</span>
                  {selectedArticle.hot && <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">热门</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setArticleLike(!articleLike)} className={`p-2 rounded-lg transition-colors ${articleLike ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}>
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <button onClick={() => setArticleBookmarked(!articleBookmarked)} className={`p-2 rounded-lg transition-colors ${articleBookmarked ? 'bg-amber-100 text-amber-600' : 'text-gray-400 hover:bg-gray-100'}`}>
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button onClick={() => setSelectedArticle(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{getRelativeTimeDesc(selectedArticle.date)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{selectedArticle.readTime}</span>
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{selectedArticle.views.toLocaleString()}次</span>
                  <span className="text-xs text-gray-400">来源: {selectedArticle.source}</span>
                </div>
                <div className="prose prose-blue max-w-none">
                  {getArticleDetail(selectedArticle.id).map((paragraph, idx) => (
                    <p key={idx} className="text-gray-700 leading-relaxed mb-3">{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-500">{articleLike ? '您已赞过 👍' : '有帮助吗？'}</span>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                    <Share2 className="w-4 h-4" />分享
                  </button>
                  <button onClick={() => setSelectedArticle(null)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">关闭</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-500">
            <div>© 2025 跨境智能平台 · {totalArticles}篇专业资讯 · {newsData?.lastUpdateDate ? `更新于 ${newsData.lastUpdateDate}` : ''}</div>
            <div className="flex gap-4">
              <span className="hover:underline cursor-pointer">关于我们</span>
              <span className="hover:underline cursor-pointer">使用条款</span>
              <span className="hover:underline cursor-pointer">隐私政策</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WikiPage;
