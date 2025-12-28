import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Search,
  Globe,
  CheckCircle,
  Server,
  Zap,
  Database
} from 'lucide-react';

// 侧边栏筛选配置
const sidebarFilters = {
  all: {
    title: '全部',
    options: [
      { id: 'all', label: '所有工具', count: 6 },
      { id: 'featured', label: '⭐ 星标', count: 2 },
      { id: 'new', label: '🆕 上新', count: 1 }
    ]
  }
};

// 工具卡片数据
const toolCards = [
  {
    id: 'sales-target',
    title: '销售额目标追踪',
    shortDesc: '多币种、多品线业绩实时监控',
    description: '支持多币种、多品线业绩实时监控，提供销售目标设定、进度追踪、业绩对比分析等功能，帮助您全面掌控业务表现。',
    category: 'ai',
    location: 'cloud',
    status: 'official',
    icon: Server,
    color: '#3b82f6',
    usageCount: 12580,
    tags: ['🌐 偏僻的', '🔐 认证'],
    features: ['多币种支持', '品线管理', '进度追踪']
  },
  {
    id: 'fba-calculator',
    title: 'FBA 费用计算器',
    shortDesc: '精确计算亚马逊各项费用',
    description: '精确计算亚马逊 FBA 各项费用，包括仓储费、物流费、佣金等，提供利润分析和定价建议。',
    category: 'devtools',
    location: 'global',
    status: 'verified',
    icon: CalculatorIcon,
    color: '#10b981',
    usageCount: 15890,
    tags: ['🌐 偏僻的'],
    features: ['费用计算', '利润分析', '定价建议']
  },
  {
    id: 'market-analysis',
    title: '市场分析决策',
    shortDesc: '五维分析 + 智能战略推荐',
    description: '从市场趋势、竞品分析、价格策略、流量来源、客户画像五个维度进行深度分析，AI 智能推荐最优策略。',
    category: 'ai',
    location: 'cloud',
    status: 'community',
    icon: Globe,
    color: '#8b5cf6',
    usageCount: 8930,
    tags: ['☁️ 云端'],
    features: ['五维分析', '趋势预测', '竞品监测']
  },
  {
    id: 'kano-analysis',
    title: 'Kano 评论分析',
    shortDesc: '用户需求智能情感洞察',
    description: '运用 Kano 模型分析用户评论，自动识别基本需求、期望需求和兴奋需求，指导产品迭代优化方向。',
    category: 'ai',
    location: 'local',
    status: 'official',
    icon: Zap,
    color: '#f59e0b',
    usageCount: 6420,
    tags: ['📍 当地的'],
    features: ['情感分析', '需求分类', '优先级排序']
  },
  {
    id: 'competitor-analysis',
    title: '竞品智能分析',
    shortDesc: 'AI 驱动的竞品情报提取',
    description: 'AI 自动提取竞品信息，生成竞品情报报告，包括价格、评价、排名、流量等多维度对比分析。',
    category: 'ai',
    location: 'cloud',
    status: 'verified',
    icon: Server,
    color: '#6366f1',
    usageCount: 5890,
    tags: ['☁️ 云端', '🔐 认证'],
    features: ['竞品监控', '多维对比', '情报报告']
  },
  {
    id: 'new-product-sop',
    title: '新品导入 SOP',
    shortDesc: '标准化流程文档与指导',
    description: '提供从选品到上架的完整 SOP 流程，包括市场调研、Listing 优化、广告策略等标准化操作指南。',
    category: 'database',
    location: 'global',
    status: 'community',
    icon: Database,
    color: '#ec4899',
    usageCount: 4280,
    tags: ['🌐 偏僻的'],
    features: ['流程模板', '检查清单', '操作指南']
  }
];

// 自定义计算器图标
function CalculatorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="10" y2="10" />
      <line x1="14" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="10" y2="14" />
      <line x1="14" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  );
}

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    all: 'all'
  });

  // 过滤工具
  const filteredTools = toolCards.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const filterType = selectedFilters.all;
    const matchesFilter = filterType === 'all' ||
                         (filterType === 'featured' && tool.status === 'verified') ||
                         (filterType === 'new' && tool.category === 'database');
    return matchesSearch && matchesFilter;
  });

  const handleFilterChange = (group: string, id: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [group]: prev[group] === id ? 'all' : id
    }));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300">
      {/* SEO Helmet */}
      <Helmet>
        <title>工具中心 - 跨境智能平台 | 亚马逊FBA计算器、市场分析、竞品分析等电商工具</title>
        <meta name="description" content="专业的跨境电商工具平台，提供FBA费用计算器、市场分析决策系统、Kano评论分析、竞品智能分析等核心工具，助您提升运营效率。" />
        <meta name="keywords" content="电商工具,FBA计算器,市场分析,竞品分析,Kano分析,亚马逊工具,跨境电商工具" />
        <meta property="og:title" content="工具中心 - 跨境智能平台" />
        <meta property="og:description" content="专业的跨境电商工具平台，提供6大核心工具" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wsnail.com/tools" />
      </Helmet>

      {/* Navigation Header */}
      <header className="fixed w-full top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-bold text-white text-lg">跨境智能平台</div>
              <div className="text-xs text-gray-500">Cross-Border Intelligence</div>
            </div>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm">
            <Link to="/" className="text-gray-500 hover:text-white transition">首页</Link>
            <Link to="/tools" className="text-white font-medium">工具</Link>
            <Link to="/community" className="text-gray-500 hover:text-white transition">讨论</Link>
            <Link to="/wiki" className="text-gray-500 hover:text-white transition">行业信息</Link>
          </nav>
        </div>
      </header>

      <div className="pt-20">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex gap-8">
            {/* Left Sidebar - Filters */}
            <aside className="w-64 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="搜索工具..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#161616] border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
                  />
                </div>

                {/* Filter Groups */}
                {Object.entries(sidebarFilters).map(([key, group]) => (
                  <div key={key}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {group.title}
                    </h3>
                    <div className="space-y-1">
                      {group.options.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedFilters[key as keyof typeof sidebarFilters] === option.id;

                        return (
                          <button
                            key={option.id}
                            onClick={() => handleFilterChange(key, option.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                              isSelected
                                ? 'bg-[#1a1a1a] text-white'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-[#161616]'
                            }`}
                          >
                            {option.icon ? (
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-orange-500' : ''}`} />
                            ) : (
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-600'
                              }`}>
                                {isSelected && <div className="w-2 h-2 bg-black rounded-full" />}
                              </div>
                            )}
                            <span className="flex-1 text-left">{option.label}</span>
                            {option.count && (
                              <span className="text-xs text-gray-600">{option.count}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Main Content - Card Grid */}
            <main className="flex-1 min-w-0">
              {/* Mobile Search */}
              <div className="lg:hidden mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="搜索工具..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#161616] border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center gap-2 mb-6 text-sm">
                <span className="text-gray-500">找到</span>
                <span className="text-white font-medium">{filteredTools.length}</span>
                <span className="text-gray-500">个工具</span>
              </div>

              {/* Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTools.map((tool) => {
                  const Icon = tool.icon;

                  return (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      className="group bg-[#161616] border border-white/5 rounded-xl overflow-hidden hover:border-orange-500/30 transition-all duration-300"
                    >
                      <Link to={tool.link} className="block">
                        {/* Card Header */}
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${tool.color}20` }}
                              >
                                <Icon className="w-6 h-6" style={{ color: tool.color }} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-white font-semibold">{tool.title}</h3>
                                  {tool.status === 'verified' && (
                                    <CheckCircle className="w-4 h-4 text-orange-500" />
                                  )}
                                </div>
                                <span className="text-xs text-gray-600">@{tool.id}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Body */}
                          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
                            {tool.description}
                          </p>

                          {/* Card Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <div className="flex gap-2">
                              {tool.tags.slice(0, 2).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-[#1a1a1a] rounded text-gray-500"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 3v18h18" />
                                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                              </svg>
                              <span className="text-xs">{formatNumber(tool.usageCount)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {filteredTools.length === 0 && (
                <div className="text-center py-16">
                  <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500">未找到相关工具</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFilters({ all: 'all' });
                    }}
                    className="mt-4 text-orange-500 hover:text-orange-400 text-sm"
                  >
                    清除筛选
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 mt-12">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-600">
            <div>
              © 2025 跨境智能平台. All rights reserved.
            </div>
            <div className="flex gap-4">
              <Link to="/about" className="hover:text-gray-400 transition">关于我们</Link>
              <Link to="/email-contact" className="hover:text-gray-400 transition">联系方式</Link>
              <Link to="/sync" className="hover:text-gray-400 transition">更新日志</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
