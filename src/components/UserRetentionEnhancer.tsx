import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  BookmarkCheck,
  Star,
  TrendingUp,
  Clock,
  RotateCcw,
  Target,
  Gift,
  Gamepad2,
  Sparkles,
  Bell,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAnalytics } from '../services/analyticsService';
import { Link } from 'react-router-dom';

interface UserRetentionEnhancerProps {
  currentPage?: string;
  userId?: string;
}

export default function UserRetentionEnhancer({ currentPage = '', userId }: UserRetentionEnhancerProps) {
  const { getUserProfile, trackUserAction } = useAnalytics();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showRetentionPopup, setShowRetentionPopup] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);
  const [showBookmarkToast, setShowBookmarkToast] = useState(false);
  const [visitCount, setVisitCount] = useState(1);
  const [lastVisitTime, setLastVisitTime] = useState<Date>(new Date());

  useEffect(() => {
    const profile = getUserProfile();
    setUserProfile(profile);

    // 加载收藏数据
    const savedBookmarks = localStorage.getItem('user_bookmarks');
    if (savedBookmarks) {
      setBookmarkedItems(JSON.parse(savedBookmarks));
    }

    // 访问统计
    const visits = localStorage.getItem('visit_count');
    const lastVisit = localStorage.getItem('last_visit');

    if (visits) {
      setVisitCount(parseInt(visits) + 1);
      localStorage.setItem('visit_count', (parseInt(visits) + 1).toString());
    } else {
      localStorage.setItem('visit_count', '1');
    }

    if (lastVisit) {
      setLastVisitTime(new Date(lastVisit));
    }
    localStorage.setItem('last_visit', new Date().toISOString());

    // 检查是否显示留存弹窗 (5秒后，第2次访问时)
    if (visitCount === 2) {
      setTimeout(() => setShowRetentionPopup(true), 5000);
    }

    // 追踪页面访问
    trackUserAction('page_retention_check', {
      page: currentPage,
      visitCount: visitCount,
      profileData: profile
    });
  }, []);

  const handleBookmark = (itemId: string, itemName: string) => {
    const updatedBookmarks = bookmarkedItems.includes(itemId)
      ? bookmarkedItems.filter(id => id !== itemId)
      : [...bookmarkedItems, itemId];

    setBookmarkedItems(updatedBookmarks);
    localStorage.setItem('user_bookmarks', JSON.stringify(updatedBookmarks));

    // 显示提示
    setShowBookmarkToast(true);
    setTimeout(() => setShowBookmarkToast(false), 3000);

    // 追踪行为
    trackUserAction('bookmark_toggle', {
      item: itemName,
      action: updatedBookmarks.includes(itemId) ? 'add' : 'remove',
      page: currentPage
    });
  };

  const getRetentionRecommendations = () => {
    const preferences = userProfile?.preferences;
    if (!preferences) return defaultRecommendations;

    const recommendations = [];

    // 基于访问历史推荐
    if (preferences.visitedCategories.includes('AI聊天机器人')) {
      recommendations.push({
        title: '🤖 试试AI情感分析',
        description: '基于您对AI聊天的兴趣，推荐智能情感分析工具',
        link: '/analyzer',
        type: 'tool'
      });
    }

    if (preferences.visitedCategories.length === 0) {
      recommendations.push({
        title: '🎮 AI游戏挑战',
        description: '与AI对战，锻炼思维，轻松娱乐',
        link: '/games',
        type: 'game'
      });
    }

    // 基于活动水平推荐
    if (userProfile?.activityLevel === 'low') {
      recommendations.push({
        title: '✨ AI占卜体验',
        description: '来一次神秘的AI占卜，探索未来可能',
        link: '/divination',
        type: 'tool'
      });
    }

    return recommendations.length > 0 ? recommendations : defaultRecommendations;
  };

  const defaultRecommendations = [
    {
      title: '🎮 AI智能游戏',
      description: '10+种AI游戏等你挑战，从简单到复杂',
      link: '/games',
      type: 'game'
    },
    {
      title: '🔮 AI占卜大师',
      description: '塔罗牌、星座运势、八卦算命',
      link: '/divination',
      type: 'tool'
    },
    {
      title: '💝 AI情感分析',
      description: '智能分析人际关系，提供专业建议',
      link: '/analyzer',
      type: 'tool'
    }
  ];

  const getWelcomeMessage = () => {
    if (visitCount === 1) {
      return '欢迎第一次访问！';
    } else if (visitCount <= 5) {
      return `欢迎第${visitCount}次访问！`;
    } else {
      return '欢迎老朋友回来！';
    }
  };

  const getDaysSinceLastVisit = () => {
    const days = Math.floor((new Date().getTime() - lastVisitTime.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <>
      {/* 页面顶部欢迎横幅 */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-center text-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
          <Bell className="w-4 h-4" />
          <span>{getWelcomeMessage()}</span>
          {visitCount > 1 && getDaysSinceLastVisit() > 0 && (
            <span className="opacity-80">
              距上次访问 {getDaysSinceLastVisit()} 天
            </span>
          )}
        </div>
      </motion.div>

      {/* 收藏按钮组件 */}
      <div className="fixed bottom-20 right-6 z-40">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="space-y-2"
        >
          <Button
            onClick={() => handleBookmark(currentPage, `页面-${currentPage}`)}
            className={`rounded-full w-12 h-12 shadow-lg ${
              bookmarkedItems.includes(currentPage)
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={bookmarkedItems.includes(currentPage) ? '取消收藏' : '收藏此页'}
          >
            {bookmarkedItems.includes(currentPage) ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* 收藏提示Toast */}
      <AnimatePresence>
        {showBookmarkToast && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed bottom-32 right-6 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            {bookmarkedItems.includes(currentPage) ? '已收藏！' : '已取消收藏'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 用户留存弹窗 */}
      <AnimatePresence>
        {showRetentionPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRetentionPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Gift className="w-6 h-6 text-purple-500 mr-2" />
                    发现更多精彩
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRetentionPopup(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <p className="text-gray-600 mb-6">
                  既然您再次访问，不如探索一些我们为您精心准备的特色功能？
                </p>

                <div className="space-y-3 mb-6">
                  {getRetentionRecommendations().map((rec, index) => (
                    <Link
                      key={index}
                      to={rec.link}
                      onClick={() => {
                        setShowRetentionPopup(false);
                        trackUserAction('retention_recommendation_click', {
                          recommendation: rec.title,
                          type: rec.type
                        });
                      }}
                    >
                      <div className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer">
                        <h4 className="font-semibold text-sm text-gray-900 mb-1">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {rec.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      setShowRetentionPopup(false);
                      trackUserAction('retention_popup_dismissed', {
                        action: 'maybe_later'
                      });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    稍后再看
                  </Button>
                  <Link to="/ai-tools" className="flex-1">
                    <Button
                      onClick={() => {
                        setShowRetentionPopup(false);
                        trackUserAction('retention_popup_action', {
                          action: 'explore_tools'
                        });
                      }}
                      className="w-full"
                    >
                      立即探索
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 用户行为统计面板（开发调试用） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-16 right-4 bg-white p-4 rounded-lg shadow-lg text-xs max-w-xs z-30">
          <h4 className="font-bold mb-2">用户留存数据</h4>
          <p>访问次数: {visitCount}</p>
          <p>活跃度: {userProfile?.activityLevel}</p>
          <p>会话时长: {Math.floor((userProfile?.sessionDuration || 0) / 1000)}s</p>
          <p>收藏数: {bookmarkedItems.length}</p>
          <p>偏好类别: {userProfile?.preferences?.visitedCategories?.join(', ') || '无'}</p>
        </div>
      )}
    </>
  );
}