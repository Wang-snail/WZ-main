import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Star, 
  TrendingUp, 
  Sparkles, 
  ExternalLink,
  Crown,
  Zap,
  Users
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AITool, Category } from '../types';
import { dataService } from '../services/dataService';
import SEOHead from '../components/SEOHead';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredTools, setFeaturedTools] = useState<AITool[]>([]);
  const [popularTools, setPopularTools] = useState<AITool[]>([]);
  const [searchResults, setSearchResults] = useState<AITool[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, featuredData, popularData] = await Promise.all([
        dataService.getCategoryStats(),
        dataService.getFeaturedTools(8),
        dataService.getPopularTools(12)
      ]);
      
      setCategories(categoriesData);
      setFeaturedTools(featuredData);
      setPopularTools(popularData);
    } catch (error) {
      console.error('加载数据失败:', error);
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
      setSearchResults(results);
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

  return (
    <>
      <SEOHead 
        title="AI工具集合站 - 106+精选AI工具库 | AI聊天机器人、AI绘画、AI视频 | WSNAIL.COM"
        description="WSNAIL.COM - 精选106+优质AI工具，包含AI聊天机器人、AI搜索引擎、AI图像设计、AI视频制作等6大分类。免费AI工具推荐，AI占卜服务，让AI为生活增添更多精彩。"
        keywords="AI工具,AI工具库,AI工具集合,人工智能工具,AI聊天机器人,AI搜索引擎,AI图像设计,AI视频制作,AI智能抠图,AI占卜,免费AI工具,ChatGPT,AI绘画,AI写作,WSNAIL"
        url="https://wsnail.com/"
        canonical="https://wsnail.com/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "AI工具集合站",
          "description": "精选106+优质AI工具，包含AI聊天机器人、AI搜索引擎、AI图像设计、AI视频制作等6大分类",
          "url": "https://wsnail.com/",
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": 106,
            "itemListElement": categories.map((category, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": category.name,
              "url": `https://wsnail.com/ai-tools?category=${category.id}`
            }))
          },
          "provider": {
            "@type": "Organization",
            "name": "WSNAIL.COM",
            "url": "https://wsnail.com"
          }
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
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI工具集合站
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              发现最佳AI工具，整合7725种技能和扩展，让您的AI获得无限可能
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="搜索AI工具..."
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
                <span>106+ 精选工具</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>6大分类</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span>持续更新</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <h2 className="text-3xl font-bold text-gray-900">工具分类</h2>
                <Link to="/ai-tools">
                  <Button variant="outline" className="hover:bg-blue-50">
                    查看全部 →
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <Link key={category.id} to={`/ai-tools?category=${encodeURIComponent(category.name)}`}>
                    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                      <CardContent className="p-6 text-center">
                        {category.icon && (
                          <img 
                            src={category.icon} 
                            alt={category.name}
                            className="w-12 h-12 mx-auto mb-3 rounded-lg object-cover group-hover:scale-110 transition-transform"
                          />
                        )}
                        <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                        <p className="text-sm text-gray-500">{category.count} 个工具</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>

            {/* Featured Tools */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <h2 className="text-3xl font-bold text-gray-900">精选推荐</h2>
                </div>
                <Link to="/ai-tools?tab=featured">
                  <Button variant="outline" className="hover:bg-yellow-50">
                    查看更多 →
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredTools.map((tool, index) => (
                  <ToolCard key={`featured-${index}`} tool={tool} featured />
                ))}
              </div>
            </section>

            {/* Popular Tools */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-purple-500" />
                  <h2 className="text-3xl font-bold text-gray-900">热门工具</h2>
                </div>
                <Link to="/ai-tools?tab=popular">
                  <Button variant="outline" className="hover:bg-purple-50">
                    查看更多 →
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularTools.map((tool, index) => (
                  <ToolCard key={`popular-${index}`} tool={tool} rank={index + 1} />
                ))}
              </div>
            </section>

            {/* Self-built Apps Section */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">自建应用</h2>
                  <p className="text-gray-600">探索我们精心打造的原创AI应用</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link to="/divination">
                    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">AI占卜大师</h3>
                        <p className="text-white/80">塔罗牌、星座、手相、八卦算命</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link to="/analyzer">
                    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group bg-gradient-to-br from-blue-400 to-indigo-400 text-white">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">智能情感分析</h3>
                        <p className="text-white/80">AI驱动的关系分析与建议</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
      </div>
    </>
  );
}

// Tool Card Component
function ToolCard({ tool, featured = false, rank }: { tool: AITool; featured?: boolean; rank?: number }) {
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
              {tool.name}
            </CardTitle>
            <Badge variant="secondary" className="mt-2">
              {tool.category}
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
          {tool.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>{(tool.popularity.views / 1000).toFixed(1)}K</span>
            </div>
          </div>
          
          <a 
            href={tool.link} 
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
