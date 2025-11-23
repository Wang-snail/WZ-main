import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Search,
  Filter,
  BookOpen,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ToolReview, toolReviews, getRecommendedReviews, getPopularReviews } from '../data/toolReviews';
import { useAnalytics } from '../services/analyticsService';
import SEOHead from '../components/common/SEOHead';

export default function ToolReviewsPage() {
  const [reviews, setReviews] = useState<ToolReview[]>(toolReviews);
  const [filteredReviews, setFilteredReviews] = useState<ToolReview[]>(toolReviews);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedReview, setSelectedReview] = useState<ToolReview | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const { trackSearch, trackUserAction, getUserProfile } = useAnalytics();

  useEffect(() => {
    filterReviews();
  }, [searchQuery, selectedCategory, activeTab]);

  const filterReviews = () => {
    let filtered = [...reviews];

    // Tab筛选
    if (activeTab === 'popular') {
      filtered = getPopularReviews();
    } else if (activeTab === 'recommended') {
      const userProfile = getUserProfile();
      filtered = getRecommendedReviews(userProfile.preferences.visitedCategories);
    }

    // 分类筛选
    if (selectedCategory) {
      filtered = filtered.filter(review => review.category === selectedCategory);
    }

    // 搜索筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review =>
        review.toolName.toLowerCase().includes(query) ||
        review.category.toLowerCase().includes(query) ||
        review.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredReviews(filtered);
  };

  const categories = [...new Set(toolReviews.map(review => review.category))];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : i < rating 
            ? 'fill-yellow-400/50 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPricingColor = (model: string) => {
    switch (model) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'freemium': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-orange-100 text-orange-800';
      case 'subscription': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedReview) {
    return <ReviewDetail review={selectedReview} onBack={() => setSelectedReview(null)} />;
  }

  return (
    <>
      <SEOHead 
        title="AI工具深度评测 - 专业测评报告 | WSNAIL.COM"
        description="专业的AI工具评测报告，深入分析ChatGPT、Midjourney、Notion AI等热门工具的功能、性价比和使用体验。帮您选择最适合的AI工具。"
        keywords="AI工具评测,工具测评,ChatGPT评测,Midjourney评测,AI工具对比,工具选择指南,WSNAIL"
        url="https://wsnail.com/reviews"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                AI工具深度评测
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                专业评测报告，帮您选择最适合的AI工具
              </p>
              
              <div className="flex justify-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <span>{toolReviews.length}+ 深度评测</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span>专业评测师团队</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                  <span>实时更新</span>
                </div>
              </div>
            </motion.div>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="搜索工具评测..."
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
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  分类筛选
                </h3>
                
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === '' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory('')}
                  >
                    全部评测 ({toolReviews.length})
                  </Button>
                  
                  {categories.map((category) => {
                    const count = toolReviews.filter(r => r.category === category).length;
                    return (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'ghost'}
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedCategory(category)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{category}</span>
                          <Badge variant="secondary" className="ml-2">
                            {count}
                          </Badge>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">全部评测</TabsTrigger>
                  <TabsTrigger value="popular">热门推荐</TabsTrigger>
                  <TabsTrigger value="recommended">为您推荐</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Results */}
              <div className="mb-6">
                <p className="text-gray-600">
                  共找到 <span className="font-semibold">{filteredReviews.length}</span> 个评测
                </p>
              </div>

              {/* Reviews Grid */}
              {filteredReviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredReviews.map((review, index) => (
                    <ReviewCard 
                      key={review.id} 
                      review={review} 
                      index={index}
                      onClick={() => setSelectedReview(review)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    没有找到相关评测
                  </h3>
                  <p className="text-gray-500">
                    尝试调整搜索关键词或筛选条件
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Review Card Component
function ReviewCard({ 
  review, 
  index, 
  onClick 
}: { 
  review: ToolReview; 
  index: number;
  onClick: () => void;
}) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : i < rating 
            ? 'fill-yellow-400/50 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {review.toolName}
              </CardTitle>
              <Badge variant="secondary" className="mt-2">
                {review.category}
              </Badge>
            </div>
            <div className="text-right">
              <div className="flex items-center mb-1">
                {renderStars(review.rating)}
                <span className="ml-2 text-sm font-medium">{review.rating}</span>
              </div>
              <div className="text-xs text-gray-500">评分</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {review.reviewContent.overview}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-3 h-3 text-green-500" />
                <span>{review.priceRange}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3 text-blue-500" />
                <span>{review.learnDifficulty === 'easy' ? '易上手' : 
                       review.learnDifficulty === 'medium' ? '中等' : '需学习'}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {review.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {review.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{review.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <ThumbsUp className="w-3 h-3" />
                <span>{review.pros.length} 优点</span>
              </div>
              <div className="flex items-center space-x-1">
                <ThumbsDown className="w-3 h-3" />
                <span>{review.cons.length} 缺点</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white">
              查看详情
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Review Detail Component
function ReviewDetail({ 
  review, 
  onBack 
}: { 
  review: ToolReview; 
  onBack: () => void;
}) {
  const { trackUserAction } = useAnalytics();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : i < rating 
            ? 'fill-yellow-400/50 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="outline" onClick={onBack} className="mb-6">
            ← 返回评测列表
          </Button>
          
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {review.toolName} 深度评测
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="secondary">{review.category}</Badge>
                <div className="flex items-center">
                  {renderStars(review.rating)}
                  <span className="ml-2 font-semibold">{review.rating}/5</span>
                </div>
                <span className="text-sm text-gray-500">
                  更新于 {review.lastUpdated}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="font-semibold">{review.priceRange}</div>
                <div className="text-sm text-gray-500">价格区间</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="font-semibold">
                  {review.learnDifficulty === 'easy' ? '容易' : 
                   review.learnDifficulty === 'medium' ? '中等' : '困难'}
                </div>
                <div className="text-sm text-gray-500">学习难度</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="font-semibold">{review.useCases.length}+</div>
                <div className="text-sm text-gray-500">使用场景</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 概述 */}
          <Card>
            <CardHeader>
              <CardTitle>工具概述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {review.reviewContent.overview}
              </p>
            </CardContent>
          </Card>

          {/* 功能评分 */}
          <Card>
            <CardHeader>
              <CardTitle>功能详细评分</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {review.reviewContent.features.map((feature, i) => (
                  <div key={i} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{feature.name}</h4>
                      <div className="flex items-center">
                        {renderStars(feature.rating)}
                        <span className="ml-2 text-sm font-medium">{feature.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 优缺点 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  主要优点
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {review.pros.map((pro, i) => (
                    <li key={i} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <ThumbsDown className="w-5 h-5 mr-2" />
                  主要缺点
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {review.cons.map((con, i) => (
                    <li key={i} className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm">{con}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 使用场景 */}
          <Card>
            <CardHeader>
              <CardTitle>适用场景</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {review.useCases.map((useCase, i) => (
                  <div key={i} className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm">{useCase}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 详细分析 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>用户体验分析</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {review.reviewContent.userExperience}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>性能表现分析</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {review.reviewContent.performanceAnalysis}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>性价比评估</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {review.reviewContent.valueForMoney}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 总结 */}
          <Card>
            <CardHeader>
              <CardTitle>评测总结</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                {review.reviewContent.conclusion}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  评测师：{review.author.name} | {review.author.expertise}
                </div>
                <div className="flex items-center">
                  <Button 
                    onClick={() => {
                      trackUserAction('share_review', { toolName: review.toolName });
                      // 实现分享功能
                    }}
                    variant="outline" 
                    size="sm"
                    className="mr-2"
                  >
                    分享评测
                  </Button>
                  <Button 
                    onClick={() => {
                      trackUserAction('helpful_review', { toolName: review.toolName });
                    }}
                    size="sm"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    有帮助
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 替代工具 */}
          {review.alternativeTools.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>相关替代工具</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {review.alternativeTools.map((tool, i) => (
                    <Badge key={i} variant="outline" className="cursor-pointer hover:bg-blue-50">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}