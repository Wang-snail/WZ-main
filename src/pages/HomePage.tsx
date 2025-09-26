import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  Star, 
  TrendingUp, 
  Sparkles, 
  ExternalLink,
  Crown,
  Zap,
  Users,
  Gamepad2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AITool, Category } from '../types';
import { dataService } from '../services/dataService';
import SEOHead from '../components/SEOHead';
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';
import InteractiveGuide from '../components/InteractiveGuide';
import UserRetentionEnhancer from '../components/UserRetentionEnhancer';
import EngagementBooster from '../components/EngagementBooster';
import SEOEnhancer from '../components/SEOEnhancer';
import { getCurrentLanguage, setLanguage, generateLocalizedURL } from '../utils/languageUtils';
import { SEOManager } from '../utils/seoUtils';

// 版本标识 - 用于验证部署更新
const BUILD_VERSION = `v2.1.${Date.now()}`;

export default function HomePage() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredTools, setFeaturedTools] = useState<AITool[]>([]);
  const [popularTools, setPopularTools] = useState<AITool[]>([]);
  const [searchResults, setSearchResults] = useState<AITool[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  useEffect(() => {
    loadData();
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setCurrentLang(langCode);
    // 重新加载页面以应用语言更改
    window.location.reload();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 添加超时机制
      const timeout = 10000; // 10秒超时
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('数据加载超时')), timeout)
      );
      
      const dataPromise = Promise.all([
        dataService.getCategoryStats(),
        dataService.getFeaturedTools(8),
        dataService.getPopularTools(12)
      ]);
      
      const [categoriesData, featuredData, popularData] = await Promise.race([
        dataPromise,
        timeoutPromise
      ]) as [Category[], AITool[], AITool[]];
      
      // 数据验证
      if (!Array.isArray(categoriesData)) {
        console.warn('分类数据格式不正确:', categoriesData);
        setCategories([]);
      } else {
        setCategories(categoriesData);
      }
      
      if (!Array.isArray(featuredData)) {
        console.warn('推荐工具数据格式不正确:', featuredData);
        setFeaturedTools([]);
      } else {
        setFeaturedTools(featuredData);
      }
      
      if (!Array.isArray(popularData)) {
        console.warn('热门工具数据格式不正确:', popularData);
        setPopularTools([]);
      } else {
        setPopularTools(popularData);
      }
      
      // 检查是否有数据加载
      if ((!Array.isArray(categoriesData) || categoriesData.length === 0) && 
          (!Array.isArray(featuredData) || featuredData.length === 0) && 
          (!Array.isArray(popularData) || popularData.length === 0)) {
        setError('未加载到数据，请检查网络连接或稍后重试');
      }
    } catch (error: any) {
      console.error('加载数据失败:', error);
      setError(`加载数据时发生错误: ${error?.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await dataService.searchTools(query);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载AI工具库...</p>
        </div>
      </div>
    );
  }

  // 多语言SEO配置
  const seoConfig = {
    title: currentLang === 'en' ? 
      "AI Tools Collection - 106+ Selected AI Tools | WSNAIL.COM" : 
      "AI工具集合站 - 106+精选AI工具库 | AI聊天机器人、AI绘画、AI视频 | WSNAIL.COM",
    description: currentLang === 'en' ? 
      "WSNAIL.COM - Curated collection of 106+ premium AI tools, including AI chatbots, AI search engines, AI image design, AI video production and more. Free AI tool recommendations, AI divination services." : 
      "WSNAIL.COM - 精选106+优质AI工具，包含AI聊天机器人、AI搜索引擎、AI图像设计、AI视频制作等6大分类。免费AI工具推荐，AI占卜服务，让AI为生活增添更多精彩。",
    keywords: currentLang === 'en' ? 
      "AI tools, AI tool library, AI tool collection, artificial intelligence, AI chat, AI painting, AI video, AI programming, ChatGPT, WSNAIL" : 
      "AI工具,AI工具库,AI工具集合,人工智能工具,AI聊天机器人,AI搜索引擎,AI图像设计,AI视频制作,AI智能抠图,AI占卜,免费AI工具,ChatGPT,AI绘画,AI写作,WSNAIL",
    url: "https://wsnail.com/",
    canonical: "https://wsnail.com/",
    locale: currentLang === 'en' ? 'en_US' : 'zh_CN',
  };

  return (
    <>
      {/* Enhanced SEO优化 */}
      <SEOEnhancer
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        url={seoConfig.url}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": currentLang === 'en' ? "AI Tools Collection" : "AI工具集合站",
          "description": currentLang === 'en' ?
            "Curated collection of 106+ premium AI tools, including AI chatbots, AI search engines, AI image design, AI video production and more." :
            "精选106+优质AI工具，包含AI聊天机器人、AI搜索引擎、AI图像设计、AI视频制作等6大分类",
          "url": "https://wsnail.com/",
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": categories.length,
            "itemListElement": categories.map((category, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": category.name,
              "url": `https://wsnail.com/ai-tools?category=${encodeURIComponent(category.id || category.name)}`
            }))
          },
          "provider": {
            "@type": "Organization",
            "name": "WSNAIL.COM",
            "url": "https://wsnail.com"
          }
        }}
        breadcrumbs={[
          { name: "首页", url: "https://wsnail.com/" }
        ]}
      />

      {/* 用户留存增强器 */}
      <UserRetentionEnhancer
        currentPage="/"
        userId={userProfile?.userId}
      />

      {/* 参与度提升器 */}
      <EngagementBooster
        currentPage="/"
        content={{
          readingTime: 5,
          sections: ["首页介绍", "工具分类", "推荐工具", "自建应用"],
          relatedLinks: [
            {
              title: "AI工具库",
              url: "/ai-tools",
              description: "浏览完整的AI工具集合"
            },
            {
              title: "AI游戏中心",
              url: "/games",
              description: "体验AI驱动的智能游戏"
            }
          ]
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section */}
      <section className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {currentLang === 'en' ? 'AI Tools Collection' : 'AI工具集合站'}
                </span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              {currentLang === 'en' ? 
                'Discover the best AI tools, integrating 7725 skills and extensions, giving your AI unlimited possibilities' : 
                '发现最佳AI工具，整合7725种技能和扩展，让您的AI获得无限可能'}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder={currentLang === 'en' ? 'Search AI tools...' : '搜索AI工具...'}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500 shadow-lg"
                />
              </div>
              {isSearching && (
                <p className="text-sm text-gray-500 mt-2">搜索中...</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span>{featuredTools.length}+ {currentLang === 'en' ? 'Selected Tools' : '精选工具'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>{categories.length} {currentLang === 'en' ? 'Categories' : '大分类'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span>{currentLang === 'en' ? 'Continuously Updated' : '持续更新'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Interactive Guide - 降低跳出率的互动元素 */}
        {!searchQuery && (
          <section id="quick-start" className="mb-16">
            <InteractiveGuide language={currentLang === 'en' ? 'en' : 'zh'} />
          </section>
        )}

        {/* Search Results */}
        {searchQuery && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              搜索结果 "{searchQuery}" ({searchResults.length})
            </h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((tool, index) => (
                  <ToolCard key={`search-${index}`} tool={tool} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">未找到相关工具，请尝试其他关键词</p>
              </div>
            )}
          </section>
        )}

        {!searchQuery && (
          <>
            {/* Categories */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  {currentLang === 'en' ? 'Tool Categories' : '工具分类'}
                </h2>
                <Link to="/ai-tools">
                  <Button variant="outline" className="hover:bg-blue-50">
                    {currentLang === 'en' ? 'View All →' : '查看全部 →'}
                  </Button>
                </Link>
              </div>
              
              {categories && categories.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {categories.map((category, index) => (
                    <Link 
                      key={category.id || category.name || index} 
                      to={`/ai-tools?category=${encodeURIComponent(category.name || '')}`}
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          {category.icon && (
                            <img 
                              src={category.icon} 
                              alt={category.name || '分类图标'}
                              className="w-12 h-12 mx-auto mb-3 rounded-lg object-cover group-hover:scale-110 transition-transform"
                              onError={(e) => {
                                // 如果图片加载失败，使用默认图片
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/categories/ai-chatbot.jpg';
                              }}
                            />
                          )}
                          <h3 className="font-semibold text-gray-900 mb-1">{category.name || '未知分类'}</h3>
                          <p className="text-sm text-gray-500">{(category.count || 0)} 个工具</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无分类数据</p>
                </div>
              )}
            </section>

            {/* Personalized Recommendations */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-8 h-8 text-blue-500" />
                  <h2 className="text-3xl font-bold text-gray-900">
                    {currentLang === 'en' ? 'Personalized for You' : '个性化推荐'}
                  </h2>
                </div>
              </div>
              <PersonalizedRecommendations />
            </section>

            {/* Featured Tools */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <h2 className="text-3xl font-bold text-gray-900">
                    {currentLang === 'en' ? 'Featured Recommendations' : '精选推荐'}
                  </h2>
                </div>
                <Link to="/ai-tools?tab=featured">
                  <Button variant="outline" className="hover:bg-yellow-50">
                    {currentLang === 'en' ? 'View More →' : '查看更多 →'}
                  </Button>
                </Link>
              </div>
              
              {featuredTools && featuredTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredTools.map((tool, index) => (
                    <ToolCard key={`featured-${index}`} tool={tool} featured />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无推荐工具</p>
                </div>
              )}
            </section>

            {/* Popular Tools */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-purple-500" />
                  <h2 className="text-3xl font-bold text-gray-900">
                    {currentLang === 'en' ? 'Popular Tools' : '热门工具'}
                  </h2>
                </div>
                <Link to="/ai-tools?tab=popular">
                  <Button variant="outline" className="hover:bg-purple-50">
                    {currentLang === 'en' ? 'View More →' : '查看更多 →'}
                  </Button>
                </Link>
              </div>
              
              {popularTools && popularTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularTools.map((tool, index) => (
                    <ToolCard key={`popular-${index}`} tool={tool} rank={index + 1} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无热门工具</p>
                </div>
              )}
            </section>

            {/* Self-built Apps Section */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {currentLang === 'en' ? 'Self-built Applications' : '自建应用'}
                  </h2>
                  <p className="text-gray-600">
                    {currentLang === 'en' ? 
                      'Explore our carefully crafted original AI applications' : 
                      '探索我们精心打造的原创AI应用'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link to="/divination">
                    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                          {currentLang === 'en' ? 'AI Divination Master' : 'AI占卜大师'}
                        </h3>
                        <p className="text-white/80">
                          {currentLang === 'en' ? 
                            'Tarot, Astrology, Palmistry, Fortune Telling' : 
                            '塔罗牌、星座、手相、八卦算命'}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link to="/analyzer">
                    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group bg-gradient-to-br from-blue-400 to-indigo-400 text-white">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                          {currentLang === 'en' ? 'Intelligent Emotional Analysis' : '智能情感分析'}
                        </h3>
                        <p className="text-white/80">
                          {currentLang === 'en' ? 
                            'AI-driven relationship analysis and advice' : 
                            'AI驱动的关系分析与建议'}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link to="/games">
                    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group bg-gradient-to-br from-green-400 to-teal-400 text-white">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Gamepad2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                          {currentLang === 'en' ? 'AI Mini Games' : 'AI小游戏'}
                        </h3>
                        <p className="text-white/80">
                          {currentLang === 'en' ? 
                            'Intellectual challenges and entertainment' : 
                            '智力挑战与娱乐放松'}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}

        {/* 版本信息 - 用于验证部署更新 */}
        <div className="text-center py-4 text-xs text-gray-400">
          <div className="max-w-7xl mx-auto px-4">
            Build: {BUILD_VERSION} | 最后更新: {new Date().toLocaleString('zh-CN')}
          </div>
        </div>

      </div>
      </div>
    </>
  );
}

// Tool Card Component
function ToolCard({ tool, featured = false, rank }: { tool: AITool; featured?: boolean; rank?: number }) {
  // 添加安全检查
  if (!tool) {
    return null;
  }
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 group relative">
      {featured && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
          精选
        </div>
      )}
      {rank && (
        <div className="absolute -top-2 -left-2 bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10">
          {rank}
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
              {tool.name || '未知工具'}
            </CardTitle>
            <Badge variant="secondary" className="mt-2">
              {tool.category || '未分类'}
            </Badge>
          </div>
          {tool.vpn_required && (
            <Badge variant="destructive" className="text-xs">
              需要VPN
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {tool.description || '暂无描述'}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>{tool.popularity?.views ? (tool.popularity.views / 1000).toFixed(1) + 'K' : '0K'}</span>
            </div>
          </div>
          
          <a 
            href={tool.link || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button size="sm" className="group-hover:bg-blue-600">
              访问
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
