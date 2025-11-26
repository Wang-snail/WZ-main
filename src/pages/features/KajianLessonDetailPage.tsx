import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SEOHead from '@/components/common/SEOHead';
import {
  ArrowLeft,
  Calendar,
  Tag,
  TrendingUp,
  TrendingDown,
  Star,
  ExternalLink,
  Share2,
  Bookmark,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KajianLesson } from '@/types';
import { KajianService } from '@/services/kajianService';
import { KajianLessonForm } from '@/components/features/KajianLessonForm';
import toast from 'react-hot-toast';

// Static helpers
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

const RenderStars = React.memo(({ importance }: { importance: number }) => {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={18}
          className={i < importance ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
});

const KajianLessonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<KajianLesson | null>(null);
  const [allLessons, setAllLessons] = useState<KajianLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isCustomLesson, setIsCustomLesson] = useState(false);

  useEffect(() => {
    loadLesson();
    // 检查是否已收藏
    const bookmarks = JSON.parse(localStorage.getItem('kajian_bookmarks') || '[]');
    setBookmarked(bookmarks.includes(id));
  }, [id]);

  const loadLesson = async () => {
    try {
      // Use cached data loading
      const data = await KajianService.loadAllLessons();
      setAllLessons(data.lessons);

      const currentLesson = data.lessons.find((l: KajianLesson) => l.id === id);

      if (currentLesson) {
        setLesson(currentLesson);
        setIsCustomLesson(KajianService.isCustomLesson(id || ''));
      } else {
        toast.error('未找到该经验记录');
        navigate('/kajian-lessons');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // Memoize related lessons calculation
  const relatedLessons = useMemo(() => {
    if (!lesson || !allLessons.length) return [];
    return allLessons
      .filter((l: KajianLesson) => l.id !== id && l.category === lesson.category)
      .slice(0, 3);
  }, [lesson, allLessons, id]);

  const handleEdit = useCallback((lessonData: Omit<KajianLesson, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (id) {
        KajianService.updateLesson(id, lessonData);
        toast.success('经验更新成功！');
        setShowEditForm(false);
        loadLesson(); // 重新加载数据
      }
    } catch (error) {
      toast.error('更新失败，请重试');
      console.error('更新经验失败:', error);
    }
  }, [id]);

  const handleDelete = useCallback(() => {
    if (!id) return;

    if (window.confirm('确定要删除这条经验记录吗？此操作无法撤销。')) {
      try {
        const success = KajianService.deleteLesson(id);
        if (success) {
          toast.success('经验已删除');
          navigate('/kajian-lessons');
        } else {
          toast.error('删除失败');
        }
      } catch (error) {
        toast.error('删除失败，请重试');
        console.error('删除经验失败:', error);
      }
    }
  }, [id, navigate]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: lesson?.title,
        text: lesson?.summary,
        url: window.location.href
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('链接已复制到剪贴板');
    }
  }, [lesson]);

  const handleBookmark = useCallback(() => {
    const bookmarks = JSON.parse(localStorage.getItem('kajian_bookmarks') || '[]');
    if (bookmarked) {
      const newBookmarks = bookmarks.filter((b: string) => b !== id);
      localStorage.setItem('kajian_bookmarks', JSON.stringify(newBookmarks));
      setBookmarked(false);
      toast.success('已取消收藏');
    } else {
      bookmarks.push(id);
      localStorage.setItem('kajian_bookmarks', JSON.stringify(bookmarks));
      setBookmarked(true);
      toast.success('已添加到收藏');
    }
  }, [bookmarked, id]);

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

  if (!lesson) {
    return null;
  }

  return (
    <>
      <SEOHead
        title={`${lesson.title} - 电商经验库 | wsnail.com`}
        description={lesson.summary}
        keywords={`${lesson.category},${lesson.tags.join(',')},跨境电商经验,电商案例`}
        url={`https://wsnail.com/kajian-lessons/${lesson.id}`}
        type="article"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* 返回按钮 */}
          <div className="mb-6">
            <Link to="/kajian-lessons">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                返回经验库
              </Button>
            </Link>
          </div>

          {/* 主内容卡片 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={`${getCategoryColor(lesson.category)} border text-sm px-3 py-1`}>
                      <span className="mr-1">{getCategoryIcon(lesson.category)}</span>
                      {getCategoryName(lesson.category)}
                    </Badge>
                    <RenderStars importance={lesson.importance} />
                  </div>
                  <CardTitle className="text-3xl mb-3">{lesson.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(lesson.date).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isCustomLesson && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowEditForm(true)}
                        title="编辑"
                      >
                        <Edit size={20} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleDelete}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        title="删除"
                      >
                        <Trash2 size={20} />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleBookmark}
                    className={bookmarked ? 'text-yellow-600 border-yellow-600' : ''}
                    title="收藏"
                  >
                    <Bookmark size={20} className={bookmarked ? 'fill-current' : ''} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare} title="分享">
                    <Share2 size={20} />
                  </Button>
                </div>
              </div>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2">
                {lesson.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    <Tag size={12} className="mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 摘要 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-l-4 border-primary">
                <p className="text-lg font-medium text-gray-800">{lesson.summary}</p>
              </div>

              {/* 财务数据 */}
              {lesson.financialData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="text-sm text-gray-600 mb-1">投入成本</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(lesson.financialData.investment || 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <div className="text-sm text-gray-600 mb-1">产出收益</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(lesson.financialData.revenue || 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-4">
                      <div className="text-sm text-gray-600 mb-1">实际利润</div>
                      <div className={`text-2xl font-bold ${(lesson.financialData.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(lesson.financialData.profit || 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-4">
                      <div className="text-sm text-gray-600 mb-1">投资回报率</div>
                      <div className={`text-2xl font-bold ${(lesson.financialData.roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {lesson.financialData.roi}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Separator />

              {/* 背景 */}
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded"></div>
                  背景描述
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{lesson.background}</p>
              </div>

              <Separator />

              {/* 过程 */}
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded"></div>
                  实施过程
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{lesson.process}</p>
              </div>

              <Separator />

              {/* 结果 */}
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded"></div>
                  最终结果
                </h3>
                <div className={`p-4 rounded-lg border-l-4 ${lesson.category === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{lesson.result}</p>
                </div>
              </div>

              <Separator />

              {/* 经验教训 */}
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded"></div>
                  {lesson.category === 'success' ? '成功经验' : '经验教训'}
                </h3>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-500">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line font-medium">{lesson.lesson}</p>
                </div>
              </div>

              {/* 关键要点 */}
              {lesson.keyPoints && lesson.keyPoints.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded"></div>
                      关键要点
                    </h3>
                    <div className="space-y-3">
                      {lesson.keyPoints.map((point, index) => (
                        <div key={index} className="flex gap-3 items-start">
                          <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 leading-relaxed flex-1">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 相关产品 */}
              {lesson.relatedProducts && lesson.relatedProducts.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded"></div>
                      相关产品
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {lesson.relatedProducts.map((product, index) => (
                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 相关链接 */}
              {lesson.relatedLinks && lesson.relatedLinks.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded"></div>
                      相关链接
                    </h3>
                    <div className="space-y-2">
                      {lesson.relatedLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <ExternalLink size={16} />
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 相关经验 */}
          {relatedLessons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>相关经验</CardTitle>
                <CardDescription>查看更多同类别的经验记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedLessons.map(related => (
                    <Link key={related.id} to={`/kajian-lessons/${related.id}`}>
                      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <Badge className={`${getCategoryColor(related.category)} border w-fit mb-2`}>
                            <span className="mr-1">{getCategoryIcon(related.category)}</span>
                            {getCategoryName(related.category)}
                          </Badge>
                          <CardTitle className="text-base">{related.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 line-clamp-2">{related.summary}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 编辑表单 */}
      {showEditForm && lesson && (
        <KajianLessonForm
          lesson={lesson}
          onSave={handleEdit}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </>
  );
};

export default KajianLessonDetailPage;
