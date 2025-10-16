import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  BarChart3,
  Palette,
  MessageSquare,
  Sparkles,
  BookOpen,
  Users,
  ArrowRight,
  CheckCircle,
  Target,
  Zap,
  ShoppingCart,
  LineChart,
  Megaphone,
  Heart,
  Lightbulb,
  Shield,
  FileCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function HomePagePreview() {
  const ecommerceWorkflow = [
    {
      phase: '选品策划',
      icon: <Target className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      tools: [
        { name: 'AI市场分析', link: '/ai-tools?category=analysis' },
        { name: '趋势预测工具', link: '/ai-tools?category=prediction' },
      ]
    },
    {
      phase: '运营管理',
      icon: <LineChart className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      tools: [
        { name: '销售追踪', link: '/sales-tracking' },
        { name: '数据分析', link: '/ai-tools?category=analytics' },
      ]
    },
    {
      phase: '营销推广',
      icon: <Megaphone className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      tools: [
        { name: 'AI文案生成', link: '/ai-tools?category=writing' },
        { name: 'AI图片设计', link: '/ai-tools?category=image' },
        { name: 'AI视频制作', link: '/ai-tools?category=video' },
      ]
    },
    {
      phase: '平台政策',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      tools: [
        { name: '平台规则解读', link: '/ai-tools?category=policy' },
        { name: '合规检查', link: '/ai-tools?category=compliance' },
      ]
    },
    {
      phase: '经验沉淀',
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50',
      tools: [
        { name: '成功案例库', link: '/kajian-lessons' },
        { name: '踩坑经验', link: '/kajian-lessons' },
      ]
    },
    {
      phase: '社区互助',
      icon: <Users className="w-6 h-6" />,
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
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
      color: 'text-blue-600'
    },
    {
      title: '实战经验库',
      description: '真实案例分享，避免踩坑，快速成长',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'text-green-600'
    },
    {
      title: '社区互助',
      description: '电商同行交流，问题快速解答',
      icon: <Users className="w-8 h-8" />,
      color: 'text-purple-600'
    },
    {
      title: '持续更新',
      description: '紧跟电商趋势，定期更新工具和案例',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'text-orange-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
              <Sparkles className="w-3 h-3 mr-1" />
              专为电商人打造的AI工具平台
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                WSNAIL.COM
              </span>
              <br />
              <span className="text-3xl md:text-4xl text-gray-700 mt-2 block">
                电商人的智能工具箱
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              从选品到营销，从运营到决策，整合106+专业AI工具，
              <br />
              结合真实案例与社区智慧，助力电商人高效成长
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Target className="w-5 h-5 mr-2" />
                开始使用
              </Button>
              <Button size="lg" variant="outline">
                <BookOpen className="w-5 h-5 mr-2" />
                查看案例
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg"
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              覆盖电商全流程
            </h2>
            <p className="text-xl text-gray-600">
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
                <Card className={`hover:shadow-xl transition-all duration-300 border-0 ${workflow.bgColor}`}>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${workflow.color} flex items-center justify-center text-white mb-3`}>
                      {workflow.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      {workflow.phase}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {workflow.tools.map((tool, idx) => (
                        <Link
                          key={idx}
                          to={tool.link}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/80 transition-colors group"
                        >
                          <span className="text-gray-700">{tool.name}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              为什么选择 WSNAIL？
            </h2>
            <p className="text-xl text-gray-600">
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
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            开始你的高效电商之旅
          </h2>
          <p className="text-xl mb-8 opacity-90">
            加入1000+电商从业者，使用AI工具提升效率，学习成功经验，避免踩坑
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <Target className="w-5 h-5 mr-2" />
              立即开始
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              <Users className="w-5 h-5 mr-2" />
              加入社区
            </Button>
          </div>
        </div>
      </section>

      {/* Preview Note */}
      <div className="fixed bottom-4 right-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 shadow-xl max-w-sm">
        <div className="flex items-start">
          <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-bold text-yellow-800 mb-1">预览模式</p>
            <p className="text-sm text-yellow-700">
              这是新首页的预览设计，突出电商定位和工作流程。
            </p>
            <Link to="/" className="text-sm text-yellow-800 font-medium underline mt-2 inline-block">
              返回当前首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
