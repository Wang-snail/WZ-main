import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  BarChart3,
  Sparkles,
  BookOpen,
  Users,
  ArrowRight,
  Target,
  Zap,
  ShoppingCart,
  LineChart,
  Megaphone,
  Lightbulb,
  Shield,
} from 'lucide-react';
import { Button } from '../components/ui/button';

export default function HomePage() {
  const ecommerceWorkflow = [
    {
      phase: '选品策划',
      icon: <Target className="w-6 h-6" />,
      color: 'from-blue-400 to-cyan-400',
      tools: [
        { name: 'AI搜索引擎', link: '/ai-tools?category=AI搜索引擎' },
        { name: 'AI数据分析', link: '/ai-tools' },
      ]
    },
    {
      phase: '运营管理',
      icon: <LineChart className="w-6 h-6" />,
      color: 'from-green-400 to-emerald-400',
      tools: [
        { name: '销售追踪', link: '/sales-tracking' },
        { name: 'AI编程工具', link: '/ai-tools?category=AI编程工具' },
      ]
    },
    {
      phase: '营销推广',
      icon: <Megaphone className="w-6 h-6" />,
      color: 'from-orange-400 to-red-400',
      tools: [
        { name: 'AI文案生成', link: '/ai-tools?category=AI写作工具' },
        { name: 'AI图片设计', link: '/ai-tools?category=AI图像工具' },
        { name: 'AI视频制作', link: '/ai-tools?category=AI视频工具' },
      ]
    },
    {
      phase: '平台政策',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-pink-400 to-rose-400',
      tools: [
        { name: '平台情报中心', link: '/platform-news' },
        { name: '2025全年资讯', link: '/platform-news' },
      ]
    },
    {
      phase: '经验沉淀',
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'from-yellow-400 to-amber-400',
      tools: [
        { name: '成功案例库', link: '/kajian-lessons' },
        { name: '踩坑经验', link: '/kajian-lessons' },
      ]
    },
    {
      phase: '社区互助',
      icon: <Users className="w-6 h-6" />,
      color: 'from-teal-400 to-cyan-400',
      tools: [
        { name: '社区问答', link: '/community' },
        { name: '经验交流', link: '/community' },
      ]
    },
  ];

  const stats = [
    { label: '专业AI工具', value: '106+', icon: <Zap className="w-5 h-5" /> },
    { label: '电商场景', value: '20+', icon: <ShoppingCart className="w-5 h-5" /> },
    { label: '成功案例', value: '50+', icon: <TrendingUp className="w-5 h-5" /> },
    { label: '活跃用户', value: '1000+', icon: <Users className="w-5 h-5" /> },
  ];

  const features = [
    {
      title: '全流程覆盖',
      description: '从选品到售后，每个环节都有AI工具支持',
      icon: <BarChart3 className="w-8 h-8" />,
      gradient: 'from-blue-400 to-cyan-400'
    },
    {
      title: '实战经验库',
      description: '真实案例分享，避免踩坑，快速成长',
      icon: <BookOpen className="w-8 h-8" />,
      gradient: 'from-green-400 to-emerald-400'
    },
    {
      title: '社区互助',
      description: '电商同行交流，问题快速解答',
      icon: <Users className="w-8 h-8" />,
      gradient: 'from-purple-400 to-pink-400'
    },
    {
      title: '持续更新',
      description: '紧跟电商趋势，定期更新工具和案例',
      icon: <Sparkles className="w-8 h-8" />,
      gradient: 'from-orange-400 to-red-400'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-100 to-gray-50 relative overflow-hidden" style={{ fontFamily: "'Poppins', 'Noto Sans SC', sans-serif" }}>
      {/* 背景动态光效 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* 玻璃态标签 */}
            <div className="inline-block mb-6">
              <div className="backdrop-blur-xl bg-white/60 border border-gray-200 rounded-full px-6 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700 text-sm font-medium tracking-wide">专为电商人打造的AI工具平台</span>
                </div>
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                WSNAIL.COM
              </span>
              <br />
              <span className="text-4xl md:text-5xl text-gray-800 mt-4 block font-light">
                电商人的智能工具箱
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              从选品到营销，从运营到决策，整合106+专业AI工具
              <br />
              结合真实案例与社区智慧，助力电商人高效成长
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Link to="/ai-tools">
                <Button size="lg" className="backdrop-blur-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border border-blue-200 text-white shadow-xl px-8 py-6 text-lg">
                  <Target className="w-5 h-5 mr-2" />
                  开始使用
                </Button>
              </Link>
              <Link to="/kajian-lessons">
                <Button size="lg" variant="outline" className="backdrop-blur-xl bg-white/50 hover:bg-white/70 border border-gray-300 text-gray-700 shadow-xl px-8 py-6 text-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  查看案例
                </Button>
              </Link>
            </div>

            {/* Stats - 玻璃态卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="backdrop-blur-xl bg-white/60 border border-gray-200 rounded-2xl p-6 shadow-xl hover:bg-white/80 transition-all hover:scale-105 hover:shadow-2xl"
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
          </motion.div>
        </div>
      </section>

      {/* E-commerce Workflow Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">
              覆盖电商全流程
            </h2>
            <p className="text-xl text-gray-600 font-light">
              每个阶段都有专业AI工具助力，让你的电商之路更轻松
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecommerceWorkflow.map((workflow, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="backdrop-blur-xl bg-white/60 border border-gray-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 hover:border-gray-300">
                  <div className="mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${workflow.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                      {workflow.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                      {workflow.phase}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {workflow.tools.map((tool, idx) => (
                      <Link
                        key={idx}
                        to={tool.link}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-colors group backdrop-blur-sm"
                      >
                        <span className="text-gray-700 font-medium">{tool.name}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">
              为什么选择 WSNAIL？
            </h2>
            <p className="text-xl text-gray-600 font-light">
              专为电商人设计的智能平台
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="backdrop-blur-xl bg-white/60 border border-gray-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 hover:bg-white/80"
              >
                <div className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-600 font-light">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-gray-200 rounded-3xl p-12 shadow-xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 tracking-tight">
              开始你的高效电商之旅
            </h2>
            <p className="text-xl mb-8 text-gray-600 font-light">
              加入1000+电商从业者，使用AI工具提升效率，学习成功经验，避免踩坑
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/ai-tools">
                <Button size="lg" className="backdrop-blur-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-xl px-8 py-6 text-lg font-semibold">
                  <Target className="w-5 h-5 mr-2" />
                  立即开始
                </Button>
              </Link>
              <Link to="/community">
                <Button size="lg" variant="outline" className="backdrop-blur-xl bg-white/50 hover:bg-white/70 border-2 border-gray-300 text-gray-700 shadow-xl px-8 py-6 text-lg font-semibold">
                  <Users className="w-5 h-5 mr-2" />
                  加入社区
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
