import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Clock, ArrowRight, Bookmark, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import SocialShareButtons from './SocialShareButtons';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: number;
  publishDate: string;
  tags: string[];
  featured: boolean;
  popular: boolean;
  author: string;
}

interface ContentRecommendationProps {
  location?: string;
  userId?: string;
}

const ContentRecommendation: React.FC<ContentRecommendationProps> = ({ location, userId }) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 模拟内容数据
  const mockContent: ContentItem[] = [
    {
      id: '1',
      title: '2024年AI工具发展趋势：从工具到生态',
      description: '深度分析AI工具市场的发展趋势，探讨未来AI技术的发展方向和商业模式。',
      category: '行业分析',
      readTime: 8,
      publishDate: '2024-01-15',
      tags: ['AI趋势', '行业分析', '技术发展'],
      featured: true,
      popular: true,
      author: 'WSNAIL团队'
    },
    {
      id: '2',
      title: '电商人必看的10个AI效率工具推荐',
      description: '精选10个最适合电商从业者使用的AI工具，涵盖选品、设计、客服等各个环节。',
      category: '工具推荐',
      readTime: 12,
      publishDate: '2024-01-12',
      tags: ['电商', '效率工具', 'AI推荐'],
      featured: true,
      popular: false,
      author: 'WSNAIL团队'
    },
    {
      id: '3',
      title: 'AI绘画工具Midjourney使用完全指南',
      description: '从入门到精通，详细介绍Midjourney的使用技巧和最佳实践。',
      category: '教程',
      readTime: 15,
      publishDate: '2024-01-10',
      tags: ['AI绘画', 'Midjourney', '设计工具'],
      featured: false,
      popular: true,
      author: 'WSNAI团队'
    },
    {
      id: '4',
      title: '如何利用AI工具提升客户服务体验',
      description: '探讨AI在客户服务领域的应用，提供实用的实施方案和效果评估方法。',
      category: '应用案例',
      readTime: 10,
      publishDate: '2024-01-08',
      tags: ['客户服务', 'AI应用', '案例分享'],
      featured: false,
      popular: false,
      author: 'WSNAIL团队'
    },
    {
      id: '5',
      title: 'ChatGPT最新功能详解：从GPT-4到GPT-5',
      description: '全面解析ChatGPT的最新功能特性，以及未来发展的可能方向。',
      category: '技术解析',
      readTime: 6,
      publishDate: '2024-01-05',
      tags: ['ChatGPT', 'GPT-4', '技术分析'],
      featured: false,
      popular: true,
      author: 'WSNAIL团队'
    }
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setContent(mockContent);
      setLoading(false);
    }, 1000);
  }, [location, userId]);

  const featuredContent = content.filter(item => item.featured);
  const popularContent = content.filter(item => item.popular && !item.featured);
  const recentContent = content.filter(item => !item.featured && !item.popular).slice(0, 3);

  const ContentCard: React.FC<{ item: ContentItem }> = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group cursor-pointer"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 hover:border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
            {item.featured && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                <Star className="w-3 h-3 mr-1" />
                精选
              </Badge>
            )}
            {item.popular && (
              <Badge className="bg-red-100 text-red-800 text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                热门
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg leading-tight group-hover:text-blue-600 transition-colors">
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {item.description}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.readTime}分钟
            </span>
            <span>{item.publishDate}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-4">
            {item.tags.map((tag, index) => (
              <span key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 group-hover:translate-x-1 transition-all"
            >
              阅读更多
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            <SocialShareButtons
              title={item.title}
              description={item.description}
              hashtags={item.tags}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      {/* 精选内容 */}
      {featuredContent.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              精选内容
            </h2>
            <Button variant="outline" size="sm">
              查看全部
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredContent.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* 热门内容 */}
      {popularContent.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-red-500" />
              热门文章
            </h2>
            <Button variant="outline" size="sm">
              查看更多
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularContent.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* 最新内容 */}
      {recentContent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">最新发布</h2>
            <Button variant="outline" size="sm">
              查看全部
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentContent.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ContentRecommendation;