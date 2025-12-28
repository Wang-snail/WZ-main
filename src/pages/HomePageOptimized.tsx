import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Lightbulb,
  Search,
  DollarSign,
  Rocket,
  BarChart3,
  Zap,
  ArrowRight,
  Globe,
  Package,
  LineChart,
  Users,
  BookOpen,
  ChevronRight,
  Sparkles,
  Calculator,
  Star,
  Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';

// 场景数据
const scenarios = [
  { icon: TrendingUp, title: '追踪业绩', desc: '实时销售目标监控', link: '/sales-target', color: 'bg-blue-600' },
  { icon: Target, title: '分析市场', desc: '深度市场洞察报告', link: '/tools/market-analysis', color: 'bg-indigo-600' },
  { icon: Lightbulb, title: '优化产品', desc: '用户需求智能分析', link: '/tools/kano-analysis', color: 'bg-orange-500' },
  { icon: Search, title: '研究竞品', desc: 'AI 竞品情报系统', link: '/tools/competitor-analysis', color: 'bg-purple-600' },
  { icon: DollarSign, title: '计算成本', desc: '精准利润率分析', link: '/tools/fba-calculator', color: 'bg-green-600' },
  { icon: Rocket, title: '上新产品', desc: '标准化导入流程', link: '/processes/amazon-new-product-import', color: 'bg-pink-600' }
];

// 核心工具数据（含社会证明）
const coreTools = [
  { icon: LineChart, name: '销售额目标追踪', desc: '多币种、多品线业绩实时监控', link: '/sales-target', tag: '核心', usageCount: 12580, rating: 4.9, reviewCount: 328 },
  { icon: BarChart3, name: '市场分析决策系统', desc: '五维分析 + 智能战略推荐', link: '/tools/market-analysis', tag: '智能', usageCount: 8930, rating: 4.8, reviewCount: 215 },
  { icon: Lightbulb, name: 'Kano 评论分析', desc: '从用户评论提取功能需求', link: '/tools/kano-analysis', tag: '智能', usageCount: 6420, rating: 4.9, reviewCount: 186 },
  { icon: Search, name: '竞品智能分析', desc: 'AI 驱动的竞品信息自动提取', link: '/tools/competitor-analysis', tag: '智能', usageCount: 5890, rating: 4.7, reviewCount: 152 },
  { icon: DollarSign, name: 'FBA 费用计算器', desc: '精确计算 + 定价策略辅助', link: '/tools/fba-calculator', tag: '实用', usageCount: 15890, rating: 4.9, reviewCount: 462 },
  { icon: Rocket, name: '新品导入 SOP', desc: '标准化流程文档与指导', link: '/processes/amazon-new-product-import', tag: '流程', usageCount: 4280, rating: 4.8, reviewCount: 98 }
];

// 特色功能
const features = [
  {
    icon: BarChart3,
    title: '数据驱动决策',
    desc: '实时追踪销售数据，精准分析业绩表现，让每个决策都有据可依'
  },
  {
    icon: Zap,
    title: 'AI 智能分析',
    desc: '深度学习算法，自动提取关键洞察，智能推荐最优策略'
  },
  {
    icon: Rocket,
    title: '效率提升 10x',
    desc: '自动化工作流程，节省 80% 重复劳动时间，专注核心业务'
  },
  {
    icon: Users,
    title: '社区协作',
    desc: '工作流模板分享，最佳实践交流，与同行共同成长'
  }
];

// 功能轮播数据
const featureShowcase = [
  {
    icon: Target,
    title: '销售额目标追踪',
    desc: '多币种、多品线业绩实时监控',
    color: 'bg-blue-600'
  },
  {
    icon: Calculator,
    title: 'FBA费用计算器',
    desc: '精确计算亚马逊各项费用',
    color: 'bg-green-600'
  },
  {
    icon: BarChart3,
    title: '市场分析决策',
    desc: '五维分析智能战略推荐',
    color: 'bg-indigo-600'
  },
  {
    icon: Lightbulb,
    title: 'Kano评论分析',
    desc: '用户需求智能情感洞察',
    color: 'bg-orange-500'
  },
  {
    icon: Search,
    title: '竞品智能分析',
    desc: 'AI驱动竞品情报提取',
    color: 'bg-purple-600'
  },
  {
    icon: Rocket,
    title: '新品导入SOP',
    desc: '标准化流程文档指导',
    color: 'bg-pink-600'
  }
];

// 功能轮播组件
function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % featureShowcase.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const goToPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + featureShowcase.length) % featureShowcase.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % featureShowcase.length);
  };

  const currentFeature = featureShowcase[currentIndex];
  const Icon = currentFeature.icon;

  return (
    <div className="relative">
      {/* 主展示区域 */}
      <div className="aspect-square bg-white rounded-xl border border-slate-100 overflow-hidden relative">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex flex-col items-center justify-center p-8"
        >
          <div className={`w-20 h-20 ${currentFeature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">{currentFeature.title}</h3>
          <p className="text-slate-600 text-center">{currentFeature.desc}</p>
        </motion.div>

        {/* 渐变背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-50"></div>
      </div>

      {/* 左右切换按钮 */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 transition z-10"
      >
        <ChevronRight className="w-5 h-5 rotate-180" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 transition z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* 底部指示器 */}
      <div className="flex justify-center gap-2 mt-4">
        {featureShowcase.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-6 bg-slate-900'
                : 'bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>

      {/* 功能名称显示 */}
      <div className="text-center mt-3">
        <span className="text-sm text-slate-500">{currentFeature.title}</span>
        <span className="text-slate-400 mx-2">|</span>
        <span className="text-sm text-slate-400">{currentIndex + 1} / {featureShowcase.length}</span>
      </div>
    </div>
  );
}

export default function ModernHomepage() {
  const [activeTab, setActiveTab] = useState('all');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { id: 'all', name: '全部工具' },
    { id: 'analysis', name: '经营分析' },
    { id: 'market', name: '市场洞察' },
    { id: 'product', name: '产品优化' },
    { id: 'operation', name: '运营工具' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* SEO Helmet */}
      <Helmet>
        <title>跨境智能平台 - 让跨境电商决策更智能 | AI驱动的全链路解决方案</title>
        <meta name="description" content="整合数据分析、市场洞察、AI智能助手的跨境电商全链路解决方案。提供销售额追踪、FBA计算、市场分析、竞品分析等核心工具，提升运营效率10x。" />
        <meta name="keywords" content="跨境电商,亚马逊,FBA,电商工具,销售额追踪,竞品分析,市场分析,电商运营" />
        <meta property="og:title" content="跨境智能平台 - 让跨境电商决策更智能" />
        <meta property="og:description" content="AI驱动的跨境电商全链路解决方案，提供6大核心工具助力业务增长" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wsnail.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="跨境智能平台 - 跨境电商人的智能工具箱" />
        <meta name="twitter:description" content="AI驱动的跨境电商全链路解决方案" />
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://wsnail.com/" },
              { "@type": "ListItem", "position": 2, "name": "工具", "item": "https://wsnail.com/tools" },
              { "@type": "ListItem", "position": 3, "name": "讨论", "item": "https://wsnail.com/community" },
              { "@type": "ListItem", "position": 4, "name": "行业信息", "item": "https://wsnail.com/wiki" }
            ]
          })}
        </script>
      </Helmet>

      {/* Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-lg">跨境智能平台</div>
              <div className="text-xs text-slate-500">Cross-Border Intelligence</div>
            </div>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm">
            <Link to="/" className="text-slate-900 font-medium">首页</Link>
            <Link to="/tools" className="text-slate-600 hover:text-slate-900 transition">工具</Link>
            <Link to="/community" className="text-slate-600 hover:text-slate-900 transition">讨论</Link>
            <Link to="/wiki" className="text-slate-600 hover:text-slate-900 transition">行业信息</Link>
          </nav>
          <div className="flex gap-3 items-center">
            <button className="px-4 py-2 text-sm text-slate-700 hover:text-slate-900 transition hidden sm:block">
              登录
            </button>
            <Link
              to="/tools"
              className="px-6 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition font-medium text-sm"
            >
              开始使用
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>AI 驱动的智能运营平台</span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                  让跨境电商
                  <br />
                  <span className="text-slate-600">决策更智能</span>
                </h1>

                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  整合数据分析、市场洞察、AI 智能助手
                  <br />
                  为跨境电商提供全链路智能运营解决方案
                </p>

                <div className="flex flex-wrap gap-4 mb-12">
                  <Link
                    to="/tools"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition font-medium text-lg shadow-lg shadow-slate-900/10"
                  >
                    开始使用 <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/lab"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition font-medium text-lg"
                  >
                    了解更多
                  </Link>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* 演示视频/GIF 容器 */}
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden border border-slate-200">
                {/* 模拟浏览器窗口 */}
                <div className="bg-slate-100 px-4 py-3 flex items-center gap-2 border-b border-slate-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-400 text-center">
                    platform.crossborder.tools
                  </div>
                </div>

                {/* 模拟仪表盘界面 */}
                <div className="p-6">
                  {/* 顶部统计卡片 */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: '月销售额', value: '$128,520', change: '+24.5%', color: 'text-green-600' },
                      { label: '利润率', value: '32.4%', change: '+5.2%', color: 'text-green-600' },
                      { label: '订单量', value: '1,286', change: '+18.3%', color: 'text-green-600' }
                    ].map((stat, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                        className="p-3 bg-slate-50 rounded-xl"
                      >
                        <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                        <div className="text-lg font-bold text-slate-900">{stat.value}</div>
                        <div className={`text-xs ${stat.color}`}>{stat.change}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* 图表区域 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="h-32 bg-slate-50 rounded-xl p-4 mb-4"
                  >
                    <div className="flex items-end justify-between h-full gap-1">
                      {[45, 62, 38, 75, 52, 68, 89, 72, 65, 78, 85, 92].map((height, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 0.8 + idx * 0.05, duration: 0.3 }}
                          className="flex-1 bg-slate-900 rounded-t"
                        />
                      ))}
                    </div>
                  </motion.div>

                  {/* 底部操作按钮 */}
                  <div className="flex gap-2">
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 }}
                      className="flex-1 py-2 bg-slate-900 text-white text-sm rounded-lg font-medium"
                    >
                      查看详情
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 }}
                      className="px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg font-medium hover:bg-slate-50"
                    >
                      导出报告
                    </motion.button>
                  </div>
                </div>

                {/* 播放按钮覆盖层 */}
                <div className="absolute inset-0 bg-slate-900/0 hover:bg-slate-900/10 transition-colors flex items-center justify-center cursor-pointer group">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5, type: 'spring' }}
                    className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-slate-900 border-b-8 border-b-transparent ml-1"></div>
                  </motion.div>
                </div>
              </div>

              {/* 装饰元素 */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-slate-900/5 rounded-2xl -z-10"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-slate-900/5 rounded-2xl -z-10"></div>

              {/* 效率提升标签 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="absolute -bottom-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                <span className="font-bold">效率提升 3x</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scenarios Section - 场景化入口 */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">选择您的使用场景</h2>
            <p className="text-lg text-slate-600">快速找到适合您业务需求的工具</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((item, idx) => (
              <Link
                key={idx}
                to={item.link}
                className="group p-8 bg-slate-50 hover:bg-white rounded-2xl border-2 border-transparent hover:border-slate-900 transition-all cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 mb-4">{item.desc}</p>
                <div className="flex items-center text-slate-900 font-medium text-sm group-hover:gap-2 transition-all">
                  立即使用 <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Categories - 核心工具矩阵 */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">核心工具矩阵</h2>
            <p className="text-lg text-slate-600">专业工具，助力业务增长</p>
          </div>

          <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition ${
                  activeTab === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreTools.map((tool, i) => (
              <Link
                key={i}
                to={tool.link}
                className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-900 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-slate-900 flex items-center justify-center transition">
                    <tool.icon className="w-6 h-6 text-slate-900 group-hover:text-white transition" />
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">{tool.tag}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{tool.name}</h3>
                <p className="text-slate-600 text-sm mb-4">{tool.desc}</p>

                {/* 社会证明 */}
                <div className="flex items-center gap-4 mb-4 text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{tool.usageCount.toLocaleString()} 人使用</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-medium">{tool.rating}</span>
                    <span className="text-slate-400">({tool.reviewCount})</span>
                  </div>
                </div>

                <div className="flex items-center text-slate-900 text-sm font-medium">
                  了解更多 <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition font-medium"
            >
              查看全部工具 <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - 为什么选择我们 */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">为什么选择我们？</h2>
              <div className="space-y-6">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <FeatureCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-8 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-slate-900" />
                </div>
                <span className="font-bold text-white">跨境智能平台</span>
              </div>
              <p className="text-slate-400 text-sm max-w-md">
                AI 驱动的跨境电商全链路解决方案
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">导航</h4>
              <div className="space-y-2 text-slate-400 text-sm">
                <Link to="/" className="block hover:text-white transition">首页</Link>
                <Link to="/tools" className="block hover:text-white transition">工具</Link>
                <Link to="/community" className="block hover:text-white transition">讨论</Link>
                <Link to="/wiki" className="block hover:text-white transition">行业信息</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">资源</h4>
              <div className="space-y-2 text-slate-400 text-sm">
                <Link to="/about" className="block hover:text-white transition">关于我们</Link>
                <Link to="/email-contact" className="block hover:text-white transition">联系方式</Link>
                <Link to="/sync" className="block hover:text-white transition">更新日志</Link>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-800 text-center text-slate-500 text-xs">
            © 2025 跨境智能平台. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  );
}
