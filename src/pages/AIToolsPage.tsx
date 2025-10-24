import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Grid,
  List,
  ExternalLink,
  Star,
  TrendingUp,
  Crown,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import SocialShareButtons from '../components/SocialShareButtons';
import { AITool, Category } from '../types';
import { dataService } from '../services/dataService';
import { useAnalytics } from '../services/analyticsService';
import SEOHead from '../components/SEOHead';
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';

export default function AIToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tools, setTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredTools, setFilteredTools] = useState<AITool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  const { trackSearch, trackCategoryFilter } = useAnalytics();

  const filterTools = useCallback(async () => {
    let filtered = [...tools];

    // 根据Tab筛选
    if (activeTab === 'featured') {
      const featuredTools = await dataService.getFeaturedTools(20);
      filtered = featuredTools;
    } else if (activeTab === 'popular') {
      filtered = filtered.sort((a, b) => b.hot_score - a.hot_score);
    } else if (activeTab === 'latest') {
      const latestTools = await dataService.getLatestTools(20);
      filtered = latestTools;
    }

    // 按分类筛选
    if (selectedCategory) {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
      );
    }

    setFilteredTools(filtered);
  }, [tools, activeTab, selectedCategory, searchQuery]);

  useEffect(() => {
    loadData();
    
    // 处理URL参数
    const category = searchParams.get('category');
    const tab = searchParams.get('tab');
    
    if (category) {
      setSelectedCategory(category);
    }
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    filterTools();
  }, [filterTools]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [toolsData, categoriesData] = await Promise.all([
        dataService.loadAITools(),
        dataService.getCategoryStats()
      ]);
      
      setTools(toolsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    const newCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(newCategory);
    
    // 追踪分类筛选
    if (newCategory) {
      trackCategoryFilter(newCategory);
    }
    
    // 更新URL参数
    const newParams = new URLSearchParams(searchParams);
    if (category && category !== selectedCategory) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // 更新URL参数
    const newParams = new URLSearchParams(searchParams);
    if (tab !== 'all') {
      newParams.set('tab', tab);
    } else {
      newParams.delete('tab');
    }
    setSearchParams(newParams);
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
        title={`AI工具库 - ${selectedCategory ? categories.find(c => c.id === selectedCategory)?.name + '工具 - ' : ''}106+精选AI工具集合 | WSNAIL.COM`}
        description={`浏览${selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : '全部'}AI工具，包含${tools.length}个精选工具。${selectedCategory ? categories.find(c => c.id === selectedCategory)?.description || '' : 'AI聊天机器人、AI搜索引擎、AI图像设计、AI视频制作、AI智能抠图、AI效率工具等多个分类。'}免费AI工具推荐，助力提升工作效率。`}
        keywords={`AI工具库,${selectedCategory ? categories.find(c => c.id === selectedCategory)?.name + ',': ''}AI工具集合,人工智能工具,免费AI工具,AI工具推荐,${categories.map(c => c.name).join(',')},WSNAIL`}
        url={`https://wsnail.com/ai-tools${selectedCategory ? '?category=' + selectedCategory : ''}`}
        canonical={`https://wsnail.com/ai-tools${selectedCategory ? '?category=' + selectedCategory : ''}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `AI工具库${selectedCategory ? ' - ' + categories.find(c => c.id === selectedCategory)?.name : ''}`,
          "description": `精选AI工具集合，包含${tools.length}个优质工具`,
          "url": `https://wsnail.com/ai-tools${selectedCategory ? '?category=' + selectedCategory : ''}`,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": filteredTools.length,
            "itemListElement": filteredTools.slice(0, 20).map((tool, index) => ({
              "@type": "SoftwareApplication",
              "position": index + 1,
              "name": tool.name,
              "description": tool.description,
              "url": tool.link,
              "applicationCategory": tool.category,
              "operatingSystem": "Web"
            }))
          },
          "provider": {
            "@type": "Organization", 
            "name": "WSNAIL.COM",
            "url": "https://wsnail.com"
          }
        }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI工具库
            </h1>
            <p className="text-xl text-gray-600">
              发现最佳AI工具，提升工作效率
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="搜索AI工具..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) {
                      trackSearch(e.target.value);
                    }
                  }}
                  className="pl-12 pr-4 py-3 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0 space-y-6">
            {/* Category Filter */}
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                分类筛选
              </h3>
              
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleCategorySelect('')}
                >
                  全部工具 ({tools.length})
                </Button>
                
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.name ? 'default' : 'ghost'}
                    className="w-full justify-start text-left"
                    onClick={() => handleCategorySelect(category.name)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {category.count}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Personalized Recommendations */}
            <PersonalizedRecommendations />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center space-x-2">
                  <span>全部</span>
                </TabsTrigger>
                <TabsTrigger value="featured" className="flex items-center space-x-2">
                  <Crown className="w-4 h-4" />
                  <span>精选</span>
                </TabsTrigger>
                <TabsTrigger value="popular" className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>热门</span>
                </TabsTrigger>
                <TabsTrigger value="latest" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>最新</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {/* Results Summary */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    共找到 <span className="font-semibold">{filteredTools.length}</span> 个工具
                    {selectedCategory && (
                      <span> 在 <span className="font-semibold">{selectedCategory}</span> 分类中</span>
                    )}
                  </p>
                </div>

                {/* Tools Grid/List */}
                {filteredTools.length > 0 ? (
                  <div className={
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }>
                    {filteredTools.map((tool, index) => (
                      <ToolCard 
                        key={`${tool.name}-${index}`} 
                        tool={tool} 
                        viewMode={viewMode}
                        rank={activeTab === 'popular' ? index + 1 : undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      没有找到相关工具
                    </h3>
                    <p className="text-gray-500">
                      尝试调整搜索关键词或筛选条件
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* 社交分享组件 */}
            <div className="pt-4 border-t">
              <SocialShareButtons
                title={`AI工具库 - ${selectedCategory ? categories.find(c => c.id === selectedCategory)?.name + '工具' : '106+精选AI工具'}`}
                description={`发现${tools.length}个精选AI工具，提升工作效率。${selectedCategory ? categories.find(c => c.id === selectedCategory)?.description || '' : 'AI聊天、设计、写作、视频制作一站式解决方案。'}`}
                hashtags={['AI工具', '人工智能', '效率工具', 'WSNAIL']}
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

// Tool Card Component
function ToolCard({ 
  tool, 
  viewMode, 
  rank 
}: { 
  tool: AITool; 
  viewMode: 'grid' | 'list';
  rank?: number;
}) {
  const { trackToolClick } = useAnalytics();
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start space-x-4">
                {rank && (
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {rank}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {tool.name}
                    </h3>
                    <div className="flex items-center space-x-2 ml-4">
                      {tool.vpn_required && (
                        <Badge variant="destructive" className="text-xs">
                          需要VPN
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>{formatNumber(tool.popularity.views)} 次浏览</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>{formatNumber(tool.popularity.favorites)} 次收藏</span>
                      </div>
                    </div>
                    
                    <a 
                      href={tool.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => trackToolClick(tool.name, tool.category)}
                    >
                      <Button size="sm" className="hover:bg-blue-600">
                        访问工具
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 group relative">
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
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {tool.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>{formatNumber(tool.popularity.views)}</span>
            </div>
          </div>
          
          <a 
            href={tool.link} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              trackToolClick(tool.name, tool.category);
            }}
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
