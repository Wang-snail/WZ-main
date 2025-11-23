import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  Zap,
  Star,
  ChevronRight,
  BookOpen,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useAnalytics } from '@/services/analyticsService';
import { Link } from 'react-router-dom';

interface EngagementBoosterProps {
  currentPage: string;
  content?: {
    readingTime?: number;
    sections?: string[];
    relatedLinks?: Array<{
      title: string;
      url: string;
      description: string;
    }>;
  };
}

export default function EngagementBooster({
  currentPage,
  content = {}
}: EngagementBoosterProps) {
  const { trackUserAction } = useAnalytics();
  const [timeSpent, setTimeSpent] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showProgressRing, setShowProgressRing] = useState(false);
  const [engagementLevel, setEngagementLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [showNextActions, setShowNextActions] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showReadingMode, setShowReadingMode] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const scrollCheckRef = useRef<HTMLDivElement>(null);

  // 页面停留时间计时器
  useEffect(() => {
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeSpent(currentTime);

      // 根据停留时间调整参与度
      if (currentTime > 30) setEngagementLevel('medium');
      if (currentTime > 120) setEngagementLevel('high');

      // 30秒后显示进度环
      if (currentTime === 30) {
        setShowProgressRing(true);
        trackUserAction('engagement_milestone', {
          page: currentPage,
          milestone: '30_seconds',
          timeSpent: currentTime
        });
      }

      // 2分钟后显示下一步行动建议
      if (currentTime === 120) {
        setShowNextActions(true);
        trackUserAction('engagement_milestone', {
          page: currentPage,
          milestone: '2_minutes',
          timeSpent: currentTime
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // 记录最终停留时间
      const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      trackUserAction('page_exit', {
        page: currentPage,
        timeSpent: finalTime,
        engagementLevel: engagementLevel
      });
    };
  }, [currentPage]);

  // 滚动进度追踪
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      setReadingProgress(Math.min(100, Math.max(0, progress)));

      // 根据阅读进度显示组件
      if (progress > 10 && !isVisible) {
        setIsVisible(true);
      }

      // 追踪阅读里程碑
      if (progress > 50 && progress < 55) {
        trackUserAction('reading_milestone', {
          page: currentPage,
          milestone: '50_percent',
          timeSpent: timeSpent
        });
      }

      if (progress > 90) {
        trackUserAction('reading_milestone', {
          page: currentPage,
          milestone: 'completed',
          timeSpent: timeSpent
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [timeSpent, currentPage, isVisible]);

  // 页面可见性变化追踪
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // 页面失去焦点，暂停计时
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        trackUserAction('page_blur', {
          page: currentPage,
          timeSpent: timeSpent
        });
      } else {
        // 页面重新获得焦点，重新开始计时
        startTimeRef.current = Date.now() - (timeSpent * 1000);
        timerRef.current = setInterval(() => {
          setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);

        trackUserAction('page_focus', {
          page: currentPage,
          timeSpent: timeSpent
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timeSpent, currentPage]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const getEngagementColor = () => {
    switch (engagementLevel) {
      case 'low': return 'text-gray-500 bg-gray-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'high': return 'text-green-600 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getRecommendedActions = () => {
    const recommendations = [];

    if (currentPage === '/' || currentPage === '/ai-tools') {
      recommendations.push({
        title: '🎮 尝试AI游戏',
        description: '轻松娱乐，测试AI智能',
        link: '/games',
        color: 'from-green-400 to-teal-400'
      });
    }

    if (!currentPage.includes('divination')) {
      recommendations.push({
        title: '🔮 AI占卜体验',
        description: '神秘有趣的AI占卜服务',
        link: '/divination',
        color: 'from-purple-400 to-pink-400'
      });
    }

    if (!currentPage.includes('analyzer')) {
      recommendations.push({
        title: '💝 情感分析',
        description: '智能分析人际关系',
        link: '/analyzer',
        color: 'from-blue-400 to-indigo-400'
      });
    }

    return recommendations.slice(0, 2);
  };

  // 如果参与度太低，不显示组件
  if (!isVisible || timeSpent < 10) return null;

  return (
    <>
      {/* 阅读进度条 */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50 origin-left"
        style={{ transform: `scaleX(${readingProgress / 100})` }}
      />

      {/* 浮动参与度指示器 */}
      <AnimatePresence>
        {showProgressRing && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-6 left-6 z-40"
          >
            <Card className="p-3 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-200">
                    <div
                      className={`w-full h-full rounded-full border-4 border-transparent ${engagementLevel === 'low' ? 'border-t-blue-500' :
                        engagementLevel === 'medium' ? 'border-t-purple-500' :
                          'border-t-green-500'
                        } animate-spin`}
                      style={{
                        transform: `rotate(${(timeSpent % 60) * 6}deg)`
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gray-600" />
                  </div>
                </div>

                <div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getEngagementColor()}`}>
                    {formatTime(timeSpent)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(readingProgress)}% 完成
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 下一步行动建议 */}
      <AnimatePresence>
        {showNextActions && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 right-6 z-40 max-w-sm"
          >
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center">
                    <Target className="w-4 h-4 mr-2 text-blue-600" />
                    继续探索
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNextActions(false)}
                    className="w-6 h-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-xs text-gray-600 mb-3">
                  您已浏览了{Math.round(readingProgress)}%，不如试试这些：
                </p>

                <div className="space-y-2">
                  {getRecommendedActions().map((action, index) => (
                    <Link
                      key={index}
                      to={action.link}
                      onClick={() => {
                        trackUserAction('next_action_click', {
                          action: action.title,
                          fromPage: currentPage,
                          engagementTime: timeSpent
                        });
                        setShowNextActions(false);
                      }}
                    >
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} text-white hover:shadow-md transition-shadow cursor-pointer`}>
                        <h4 className="text-sm font-semibold mb-1">
                          {action.title}
                        </h4>
                        <p className="text-xs opacity-90">
                          {action.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>参与度: {engagementLevel === 'high' ? '高' : engagementLevel === 'medium' ? '中' : '低'}</span>
                    <span className="flex items-center">
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      感谢您的关注
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 阅读模式切换按钮 */}
      {readingProgress > 20 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-20 right-6 z-30"
        >
          <Button
            onClick={() => {
              setShowReadingMode(!showReadingMode);
              trackUserAction('reading_mode_toggle', {
                page: currentPage,
                enabled: !showReadingMode
              });
            }}
            variant="outline"
            size="sm"
            className="bg-white/90 backdrop-blur-sm shadow-lg"
            title="阅读模式"
          >
            <BookOpen className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* 声音控制（模拟，实际可接入TTS） */}
      {engagementLevel === 'high' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-32 right-6 z-30"
        >
          <Button
            onClick={() => {
              setIsMuted(!isMuted);
              trackUserAction('audio_toggle', {
                page: currentPage,
                muted: !isMuted
              });
            }}
            variant="outline"
            size="sm"
            className="bg-white/90 backdrop-blur-sm shadow-lg"
            title={isMuted ? "开启声音" : "关闭声音"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </motion.div>
      )}

      {/* 阅读模式覆盖层 */}
      <AnimatePresence>
        {showReadingMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-20"
            onClick={() => setShowReadingMode(false)}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Card className="p-6 shadow-2xl">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">专注阅读模式</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    减少干扰，专心阅读内容
                  </p>
                  <Button
                    onClick={() => setShowReadingMode(false)}
                    className="w-full"
                  >
                    退出阅读模式
                  </Button>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}