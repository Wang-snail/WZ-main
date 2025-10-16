import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Star,
  Calendar,
  Tag,
  DollarSign,
  BarChart3,
  Award,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { KajianLesson, KajianCategory, KajianStats } from '@/types';
import { KajianService } from '@/services/kajianService';
import { KajianLessonForm } from '@/components/KajianLessonForm';
import toast from 'react-hot-toast';

const KajianLessonsPage: React.FC = () => {
  const [lessons, setLessons] = useState<KajianLesson[]>([]);
  const [categories, setCategories] = useState<KajianCategory[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<KajianLesson[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'importance'>('date');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState<KajianStats>({
    totalLessons: 0,
    successCount: 0,
    failureCount: 0,
    totalInvestment: 0,
    totalRevenue: 0,
    totalProfit: 0,
    avgROI: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLessons();
  }, [lessons, selectedCategory, searchQuery, sortBy]);

  const loadData = async () => {
    try {
      const data = await KajianService.loadAllLessons();
      setLessons(data.lessons || []);
      setCategories(data.categories || []);
      calculateStats(data.lessons || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = (lessonData: Omit<KajianLesson, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      KajianService.addLesson(lessonData);
      toast.success('经验添加成功！');
      setShowForm(false);
      loadData(); // 重新加载数据
    } catch (error) {
      toast.error('添加失败，请重试');
      console.error('添加经验失败:', error);
    }
  };

  const calculateStats = (lessonsData: KajianLesson[]) => {
    const stats: KajianStats = {
      totalLessons: lessonsData.length,
      successCount: lessonsData.filter(l => l.category === 'success').length,
      failureCount: lessonsData.filter(l => l.category === 'failure').length,
      totalInvestment: 0,
      totalRevenue: 0,
      totalProfit: 0,
      avgROI: 0
    };

    lessonsData.forEach(lesson => {
      if (lesson.financialData) {
        stats.totalInvestment += lesson.financialData.investment || 0;
        stats.totalRevenue += lesson.financialData.revenue || 0;
        stats.totalProfit += lesson.financialData.profit || 0;
      }
    });

    stats.avgROI = stats.totalInvestment > 0
      ? Math.round((stats.totalProfit / stats.totalInvestment) * 100)
      : 0;

    setStats(stats);
  };

  const filterLessons = () => {
    let filtered = [...lessons];

    // 分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(lesson => lesson.category === selectedCategory);
    }

    // 搜索筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(query) ||
        lesson.summary.toLowerCase().includes(query) ||
        lesson.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 排序
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'importance') {
      filtered.sort((a, b) => b.importance - a.importance);
    }

    setFilteredLessons(filtered);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      success: '🎉',
      failure: '⚠️',
      operation: '⚙️',
      product: '📦',
      marketing: '📢',
      other: '💡'
    };
    return icons[category] || '📝';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      success: 'bg-green-100 text-green-800 border-green-200',
      failure: 'bg-red-100 text-red-800 border-red-200',
      operation: 'bg-blue-100 text-blue-800 border-blue-200',
      product: 'bg-purple-100 text-purple-800 border-purple-200',
      marketing: 'bg-orange-100 text-orange-800 border-orange-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      success: '成功案例',
      failure: '失败教训',
      operation: '运营技巧',
      product: '选品经验',
      marketing: '营销推广',
      other: '其他经验'
    };
    return names[category] || category;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderStars = (importance: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < importance ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>电商经验库 - 记录与学习 | wsnail.com</title>
        <meta name="description" content="电商经验教训记录库，分享电商运营的成功案例和失败教训，帮助学习和成长" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* 头部横幅 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 justify-center">
                <BookOpen size={40} />
                <h1 className="text-4xl font-bold">电商经验库</h1>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-white text-primary hover:bg-blue-50 flex items-center gap-2"
              >
                <Plus size={20} />
                添加经验
              </Button>
            </div>
            <p className="text-center text-blue-100 text-lg max-w-2xl mx-auto">
              记录每一次实践，无论成败都是宝贵的财富。在这里分享电商路上的经验与教训。
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* 统计数据卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">总经验数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">{stats.totalLessons}</span>
                  <BookOpen className="text-blue-500" size={32} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">成功案例</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-green-600">{stats.successCount}</span>
                  <TrendingUp className="text-green-500" size={32} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">失败教训</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-red-600">{stats.failureCount}</span>
                  <TrendingDown className="text-red-500" size={32} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">平均ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-3xl font-bold ${stats.avgROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.avgROI}%
                  </span>
                  <BarChart3 className="text-purple-500" size={32} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 搜索和筛选 */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* 搜索框 */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="搜索经验标题、标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* 排序 */}
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    onClick={() => setSortBy('date')}
                    className="flex items-center gap-2"
                  >
                    <Calendar size={16} />
                    最新
                  </Button>
                  <Button
                    variant={sortBy === 'importance' ? 'default' : 'outline'}
                    onClick={() => setSortBy('importance')}
                    className="flex items-center gap-2"
                  >
                    <Award size={16} />
                    重要
                  </Button>
                </div>
              </div>

              {/* 分类筛选 */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  size="sm"
                >
                  全部 ({lessons.length})
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.id)}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <span className="text-xs">({category.count})</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 经验列表 */}
          {filteredLessons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">暂无符合条件的经验记录</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map(lesson => (
                <Card
                  key={lesson.id}
                  className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`${getCategoryColor(lesson.category)} border`}>
                        <span className="mr-1">{getCategoryIcon(lesson.category)}</span>
                        {getCategoryName(lesson.category)}
                      </Badge>
                      {renderStars(lesson.importance)}
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {lesson.summary}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {lesson.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag size={10} className="mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {lesson.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{lesson.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* 财务数据 */}
                    {lesson.financialData && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">投入：</span>
                            <span className="font-semibold">
                              {formatCurrency(lesson.financialData.investment || 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">产出：</span>
                            <span className="font-semibold">
                              {formatCurrency(lesson.financialData.revenue || 0)}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">ROI：</span>
                            <span className={`font-bold ${(lesson.financialData.roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {lesson.financialData.roi}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 日期和查看详情 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        {new Date(lesson.date).toLocaleDateString('zh-CN')}
                      </div>
                      <Link to={`/kajian-lessons/${lesson.id}`}>
                        <Button size="sm" variant="link" className="p-0 h-auto">
                          查看详情 →
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 底部说明 */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="py-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">💡 关于这个经验库</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  这里记录了电商实践中的真实经验和教训。每一次尝试，无论成功还是失败，都是成长的阶梯。
                  希望这些记录能帮助你避免同样的错误，复制成功的经验。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 添加经验表单 */}
      {showForm && (
        <KajianLessonForm
          onSave={handleAddLesson}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
};

export default KajianLessonsPage;
