import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageCircle,
  Heart,
  Sparkles,
  Mail,
  Bell,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import toast from 'react-hot-toast';

export default function CommunityPage() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('请输入有效的邮箱地址');
      return;
    }

    setLoading(true);

    // 模拟订阅请求
    setTimeout(() => {
      setIsSubscribed(true);
      setLoading(false);
      toast.success('订阅成功！我们会在社区上线时第一时间通知您');

      // 保存到localStorage
      localStorage.setItem('community_subscriber', email);
    }, 1000);
  };

  const upcomingFeatures = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: '问答互助',
      description: '遇到问题随时提问，电商同行快速解答',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: '经验分享',
      description: '真实案例分享，成功经验复制，避坑指南',
      color: 'from-green-400 to-emerald-400'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '资源对接',
      description: '供应商、服务商、合作伙伴一站式对接',
      color: 'from-purple-400 to-pink-400'
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: '创意碰撞',
      description: '与优秀电商人交流，激发新的商业灵感',
      color: 'from-orange-400 to-red-400'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: '趋势洞察',
      description: '第一时间获取行业动态和市场趋势分析',
      color: 'from-yellow-400 to-amber-400'
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: '项目孵化',
      description: '优质项目展示，寻找合伙人和投资机会',
      color: 'from-indigo-400 to-purple-400'
    }
  ];

  const stats = [
    { value: '1000+', label: '社区用户', icon: <Users className="w-5 h-5" /> },
    { value: '2025年Q1', label: '预计上线', icon: <Rocket className="w-5 h-5" /> },
    { value: '6大', label: '核心功能', icon: <Sparkles className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-100 to-gray-50 relative overflow-hidden">
      {/* 背景动态光效 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* 状态标签 */}
            <div className="inline-block mb-6">
              <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 rounded-full px-6 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-sm opacity-50 animate-ping"></div>
                  </div>
                  <span className="text-gray-700 text-sm font-medium tracking-wide">正在紧张开发中</span>
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                电商人社区
              </span>
              <br />
              <span className="text-3xl md:text-4xl text-gray-800 mt-4 block font-light">
                即将与您见面
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              一个专为跨境电商从业者打造的互助社区
              <br />
              在这里，您可以提问、分享经验、结识同行、对接资源
            </p>

            {/* 统计数据 */}
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="backdrop-blur-xl bg-white/60 border border-gray-200 rounded-2xl p-6 shadow-xl"
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

            {/* 订阅表单 */}
            {!isSubscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="max-w-xl mx-auto"
              >
                <div className="backdrop-blur-xl bg-white/80 border border-gray-200 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center justify-center mb-4">
                    <Bell className="w-6 h-6 text-blue-600 mr-2" />
                    <h3 className="text-xl font-bold text-gray-800">加入社区</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    留下您的邮箱，社区上线时我们会第一时间通知您
                  </p>
                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        type="email"
                        placeholder="输入您的邮箱地址"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 px-4 py-6 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500"
                        disabled={loading}
                      />
                      <Button
                        type="submit"
                        size="lg"
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg whitespace-nowrap"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            提交中...
                          </div>
                        ) : (
                          <>
                            <Mail className="w-5 h-5 mr-2" />
                            订阅通知
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      我们承诺不会向您发送垃圾邮件，您的邮箱信息将被严格保密
                    </p>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto"
              >
                <div className="backdrop-blur-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    订阅成功！
                  </h3>
                  <p className="text-gray-600 mb-4">
                    感谢您的关注！我们会在社区上线时第一时间通过邮件通知您
                  </p>
                  <p className="text-sm text-gray-500">
                    订阅邮箱：<span className="font-medium text-gray-700">{email}</span>
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 功能预览 */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              即将推出的功能
            </h2>
            <p className="text-xl text-gray-600">
              为电商人精心设计的社区功能
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="backdrop-blur-xl bg-white/60 border border-gray-200 shadow-xl hover:shadow-2xl transition-all hover:scale-105 h-full">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-gray-200 rounded-3xl p-12 shadow-xl text-center"
          >
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              期待与您在社区相见
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              我们正在全力打造一个温暖、专业、高效的电商人社区
              <br />
              在这里，没有人是孤岛，每个问题都能得到解答
            </p>
            {!isSubscribed && (
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
              >
                <Bell className="w-5 h-5 mr-2" />
                立即加入
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* 临时推荐：探索其他功能 */}
      <section className="relative z-10 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-xl bg-white/60 border border-gray-200 rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              在等待的同时，先探索这些功能
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/ai-tools"
                className="flex items-center p-4 rounded-xl hover:bg-white/50 transition-colors group backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white mr-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 group-hover:text-blue-600">AI工具库</h4>
                  <p className="text-sm text-gray-600">106+精选AI工具</p>
                </div>
              </a>

              <a
                href="/platform-news"
                className="flex items-center p-4 rounded-xl hover:bg-white/50 transition-colors group backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 flex items-center justify-center text-white mr-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 group-hover:text-pink-600">平台情报</h4>
                  <p className="text-sm text-gray-600">313条最新资讯</p>
                </div>
              </a>

              <a
                href="/kajian-lessons"
                className="flex items-center p-4 rounded-xl hover:bg-white/50 transition-colors group backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 flex items-center justify-center text-white mr-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 group-hover:text-yellow-600">成功案例</h4>
                  <p className="text-sm text-gray-600">真实经验分享</p>
                </div>
              </a>

              <a
                href="/sales-tracking"
                className="flex items-center p-4 rounded-xl hover:bg-white/50 transition-colors group backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center text-white mr-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 group-hover:text-green-600">销售追踪</h4>
                  <p className="text-sm text-gray-600">数据分析工具</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
