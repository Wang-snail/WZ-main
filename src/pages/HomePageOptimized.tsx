import React, { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  Zap,
  Users,
  ArrowRight,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import LoadingProgress from '../components/common/LoadingProgress';
import SocialShareButtons from '../components/features/SocialShareButtons';
import { dataService } from '../services/dataService';

// 懒加载组件
const LazyCoreFeatures = React.lazy(() => import('./features/LazyCoreFeatures'));
const LazySocialProof = React.lazy(() => import('./features/LazySocialProof'));

// 简化的统计数据
const stats = [
  { label: '专业AI工具', value: '106+', icon: <Zap className="w-5 h-5" /> },
  { label: '电商场景', value: '20+', icon: <BarChart3 className="w-5 h-5" /> },
  { label: '成功案例', value: '50+', icon: <TrendingUp className="w-5 h-5" /> },
  { label: '活跃用户', value: '1000+', icon: <Users className="w-5 h-5" /> },
];

export default function HomePageOptimized() {
  const [toolsLoaded, setToolsLoaded] = useState(false);

  // 优先加载核心数据
  useEffect(() => {
    // 高优先级加载前20个工具用于快速显示
    dataService.loadAITools('high').then(() => {
      setToolsLoaded(true);

      // 后台加载完整数据
      dataService.loadAITools('normal');
    });
  }, []);

  // Hero Section
  const HeroSection = () => (
    <div
      className="text-center"
    >
      {/* 简化的玻璃态标签 */}
      <div className="inline-block mb-6">
        <div className="backdrop-blur-xl bg-white/60 border border-gray-200 rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-gray-700 text-sm font-medium tracking-wide">AI提升电商效率30%</span>
          </div>
        </div>
      </div>

      <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
        <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent">
          WSNAIL
        </span>
        <br />
        <span className="text-4xl md:text-5xl text-gray-800 mt-4 block font-light">
          你的AI电商助手
        </span>
      </h1>

      <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
        从选品到营销，106+专业AI工具助力电商人高效成长
      </p>

      {/* 单一明确的CTA */}
      <div className="flex flex-wrap justify-center gap-4 mb-16">
        <Link to="/ai-tools">
          <Button size="lg" className="backdrop-blur-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border border-blue-200 text-white shadow-xl px-8 py-6 text-lg">
            <Target className="w-5 h-5 mr-2" />
            立即免费试用
          </Button>
        </Link>
        <Link to="/kajian-lessons">
          <Button size="lg" variant="outline" className="backdrop-blur-xl bg-white/50 hover:bg-white/70 border border-gray-300 text-gray-700 shadow-xl px-8 py-6 text-lg">
            查看成功案例
          </Button>
        </Link>
        <SocialShareButtons
          title="WSNAIL - 你的AI电商助手"
          description="从选品到营销，106+专业AI工具助力电商人高效成长"
        />
      </div>

      {/* Stats - 简化版 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="backdrop-blur-xl bg-white/60 border border-gray-200 rounded-2xl p-6 shadow-xl hover:bg-white/80 transition-all hover:scale-105"
          >
            <div className="flex items-center justify-center mb-2 text-blue-600">
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // 快速功能展示
  const QuickFeatureSection = () => (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            三步开启AI电商之旅
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "智能选品",
                description: "AI分析市场趋势，帮你找到最有潜力的产品",
                icon: "🎯",
                delay: 0.1
              },
              {
                title: "营销优化",
                description: "自动生成文案和广告素材，提升转化率",
                icon: "📈",
                delay: 0.2
              },
              {
                title: "数据分析",
                description: "实时监控销售数据，智能优化运营策略",
                icon: "📊",
                delay: 0.3
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: feature.delay }}
                className="bg-white/80 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );

  // 懒加载的CTA部分
  const LazyCTASection = () => (
    <Suspense fallback={<div className="py-20 text-center">加载中...</div>}>
      <LazySocialProof />
    </Suspense>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-100 to-gray-50 relative overflow-hidden">
      {/* 简化的背景 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* 加载进度条 */}
      <LoadingProgress showLogo={false} />

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <HeroSection />
        </div>
      </section>

      {/* 快速功能展示 */}
      <QuickFeatureSection />

      {/* 核心功能 - 懒加载 */}
      <Suspense fallback={<div className="py-20 text-center">加载更多功能...</div>}>
        <LazyCoreFeatures />
      </Suspense>

      {/* CTA部分 - 懒加载 */}
      <LazyCTASection />
    </div>
  );
}