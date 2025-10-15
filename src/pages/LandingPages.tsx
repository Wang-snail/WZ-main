import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  Star,
  Users,
  Award
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import SEOHead from '../components/SEOHead';

// SEO 着陆页配置
const landingPageConfigs: Record<string, {
  title: string;
  description: string;
  keywords: string;
  h1: string;
  subtitle: string;
  features: string[];
  cta: { text: string; link: string };
}> = {
  // AI聊天机器人相关
  'ai-chatbot': {
    title: 'AI聊天机器人大全 - 免费AI对话工具推荐 | WSNAIL.COM',
    description: '精选最好用的AI聊天机器人，包括ChatGPT、Claude、文心一言等。免费AI对话工具，智能客服机器人，24小时在线，支持中文对话。',
    keywords: 'AI聊天机器人,AI对话工具,智能客服,ChatGPT,Claude,文心一言,免费AI聊天',
    h1: '2025年最佳AI聊天机器人推荐',
    subtitle: '探索最前沿的AI对话技术，提升工作效率与创造力',
    features: [
      '智能对话响应，理解上下文',
      '支持中文、英文等多语言',
      '免费试用，部分工具完全免费',
      '24小时在线，随时随地使用',
      '专业领域知识支持',
      '代码生成与调试助手'
    ],
    cta: { text: '查看全部AI聊天工具', link: '/ai-tools?category=chat' }
  },

  // AI绘画工具
  'ai-image-generator': {
    title: 'AI绘画生成器 - 免费AI图像设计工具 | WSNAIL.COM',
    description: 'AI绘画工具大全，包括Midjourney、Stable Diffusion、DALL-E等顶级AI绘画生成器。文字生成图片，AI艺术创作，免费在线使用。',
    keywords: 'AI绘画,AI画图,AI生成图片,Midjourney,Stable Diffusion,DALL-E,文字生成图片,AI艺术',
    h1: 'AI绘画工具 - 让创意瞬间成为现实',
    subtitle: '用文字描述你的想象，AI帮你创作专业级艺术作品',
    features: [
      '文字描述转图片，秒级生成',
      '多种艺术风格选择',
      '高分辨率输出，商用级质量',
      '支持图片编辑和再创作',
      '提供免费试用额度',
      '持续更新最新AI模型'
    ],
    cta: { text: '探索AI绘画工具', link: '/ai-tools?category=image' }
  },

  // AI视频制作
  'ai-video-maker': {
    title: 'AI视频制作工具 - 智能视频生成器推荐 | WSNAIL.COM',
    description: '最好的AI视频制作工具集合，支持文字生成视频、AI配音、智能剪辑。Sora、Runway、Synthesia等专业AI视频工具。',
    keywords: 'AI视频制作,AI生成视频,文字生成视频,AI剪辑,AI配音,Sora,Runway,视频生成器',
    h1: 'AI视频制作 - 轻松创作专业视频内容',
    subtitle: '无需专业技能，AI助你制作高质量视频',
    features: [
      '文字脚本自动生成视频',
      'AI智能剪辑与特效',
      '多语言AI配音',
      '自动添加字幕',
      '海量模板素材库',
      '一键导出多平台格式'
    ],
    cta: { text: '查看AI视频工具', link: '/ai-tools?category=video' }
  },

  // 免费AI工具
  'free-ai-tools': {
    title: '免费AI工具大全 - 106+精选免费人工智能工具 | WSNAIL.COM',
    description: '收录106+款免费AI工具，包括AI聊天、AI绘画、AI写作、AI视频等。无需付费即可使用的优质AI工具推荐。',
    keywords: '免费AI工具,免费人工智能工具,AI工具大全,免费ChatGPT,免费AI绘画,在线AI工具',
    h1: '免费AI工具大全 - 不花钱也能用顶级AI',
    subtitle: '精选106+款完全免费或有免费额度的AI工具',
    features: [
      '106+款精选免费AI工具',
      '涵盖聊天、绘画、视频等6大分类',
      '无需付费，注册即用',
      '定期更新最新免费工具',
      '详细使用教程和评测',
      '中文界面，操作简单'
    ],
    cta: { text: '浏览所有免费工具', link: '/ai-tools' }
  },

  // AI写作助手
  'ai-writing-assistant': {
    title: 'AI写作助手 - 智能文案生成工具推荐 | WSNAIL.COM',
    description: 'AI写作工具大全，智能文案生成、论文写作、创意写作助手。提升写作效率10倍，支持中文创作。',
    keywords: 'AI写作,AI文案生成,智能写作助手,AI写作工具,论文写作,创意写作,自动写作',
    h1: 'AI写作助手 - 让创作更高效',
    subtitle: '从营销文案到学术论文，AI帮你快速完成优质内容',
    features: [
      '多场景写作支持',
      '自动润色和改写',
      'SEO优化建议',
      '多语言翻译',
      '原创度检测',
      '文风模仿功能'
    ],
    cta: { text: '查看AI写作工具', link: '/ai-tools' }
  },

  // AI搜索引擎
  'ai-search-engine': {
    title: 'AI搜索引擎 - 智能搜索工具推荐 | WSNAIL.COM',
    description: '新一代AI搜索引擎，包括Perplexity、You.com等。智能理解问题，直接给出答案，比传统搜索更高效。',
    keywords: 'AI搜索引擎,智能搜索,Perplexity,AI搜索工具,智能问答,搜索助手',
    h1: 'AI搜索引擎 - 更智能的信息获取方式',
    subtitle: '不只是搜索，更是你的AI智能助理',
    features: [
      '理解自然语言问题',
      '直接提供答案，而非链接',
      '引用来源可追溯',
      '支持对话式追问',
      '多语言支持',
      '实时信息更新'
    ],
    cta: { text: '体验AI搜索', link: '/ai-tools?category=search' }
  }
};

export default function LandingPages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pageType = searchParams.get('type') || 'ai-chatbot';

  const config = landingPageConfigs[pageType] || landingPageConfigs['ai-chatbot'];

  return (
    <>
      <SEOHead
        title={config.title}
        description={config.description}
        keywords={config.keywords}
        url={`https://wsnail.com/landing?type=${pageType}`}
        canonical={`https://wsnail.com/landing?type=${pageType}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": config.h1,
          "description": config.description,
          "url": `https://wsnail.com/landing?type=${pageType}`,
          "publisher": {
            "@type": "Organization",
            "name": "WSNAIL.COM",
            "url": "https://wsnail.com"
          }
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-700">WSNAIL.COM 精选推荐</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
                {config.h1}
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {config.subtitle}
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Button
                  size="lg"
                  onClick={() => navigate(config.cta.link)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {config.cta.text}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  返回首页
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {[
                  { icon: Target, label: '106+ AI工具', value: '精选' },
                  { icon: Users, label: '用户信赖', value: '10万+' },
                  { icon: Star, label: '平均评分', value: '4.8/5' },
                  { icon: Award, label: '完全免费', value: '无需付费' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-lg p-4 shadow-md"
                  >
                    <stat.icon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">核心功能特点</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-700 leading-relaxed">{feature}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white"
            >
              <TrendingUp className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">立即开始体验</h2>
              <p className="text-xl mb-8 opacity-90">
                加入10万+用户，探索AI的无限可能
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate(config.cta.link)}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                {config.cta.text}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
