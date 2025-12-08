import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Gamepad2,
  Trophy,
  Star,
  Users,
  Zap,
  ArrowRight,
  Play,
  RotateCcw,
  Hand,
  Disc,
  Shield,
  Circle,
  BarChart3,
  Heart,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOHead from '../../components/common/SEOHead';
import { useNavigate } from 'react-router-dom';

// 游戏类型定义
interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  players: number;
  duration: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  isNew?: boolean;
  isPopular?: boolean;
}

export default function AIGamesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 游戏数据
  const games: Game[] = [
    {
      id: 'ai-word-guess',
      title: 'AI词汇猜谜',
      description: '通过线索猜出AI相关术语，考验你的AI知识',
      category: '知识问答',
      difficulty: 'medium',
      players: 1,
      duration: '5-10分钟',
      icon: <Brain className="w-8 h-8" />,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'bg-gradient-to-br from-blue-100 to-purple-100',
      isPopular: true
    },
    {
      id: 'ai-tic-tac-toe',
      title: 'AI井字棋',
      description: '与AI对战经典井字棋游戏，挑战不同难度的AI对手',
      category: '策略对战',
      difficulty: 'easy',
      players: 1,
      duration: '2-5分钟',
      icon: <Gamepad2 className="w-8 h-8" />,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-gradient-to-br from-green-100 to-teal-100',
      isNew: true
    },
    {
      id: 'ai-memory',
      title: 'AI记忆大师',
      description: '挑战记忆力的极限，记住AI展示的图案和序列',
      category: '记忆训练',
      difficulty: 'medium',
      players: 1,
      duration: '5-10分钟',
      icon: <Trophy className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-100 to-pink-100'
    },
    {
      id: 'ai-number-guess',
      title: '数字炸弹',
      description: '小心！数字炸弹即将爆炸，猜中它你就赢了',
      category: '逻辑推理',
      difficulty: 'medium',
      players: 1,
      duration: '5-10分钟',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-yellow-100 to-orange-100',
      isNew: true
    },
    {
      id: 'ai-rock-paper-scissors',
      title: 'AI石头剪刀布',
      description: '3-2-1倒计时同步出拳，体验真正的公平对决',
      category: '休闲娱乐',
      difficulty: 'easy',
      players: 1,
      duration: '5-10分钟',
      icon: <Hand className="w-8 h-8" />,
      color: 'from-gray-500 to-blue-500',
      bgColor: 'bg-gradient-to-br from-gray-100 to-blue-100'
    },
    {
      id: 'ai-math-challenge',
      title: 'AI数学挑战',
      description: '在限定时间内解答各种难度的数学题，挑战你的计算能力',
      category: '智力挑战',
      difficulty: 'hard',
      players: 1,
      duration: '10-15分钟',
      icon: <Star className="w-8 h-8" />,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-red-100 to-pink-100',
      isPopular: true
    },
    {
      id: 'wolf-sheep',
      title: '狼吃羊棋',
      description: '经典的策略棋盘游戏，狼的目标是吃掉羊，羊的目标是到达底部',
      category: '策略棋类',
      difficulty: 'medium',
      players: 2,
      duration: '10-20分钟',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-red-100 to-orange-100',
      isNew: true
    },
    {
      id: 'reversi',
      title: '反转棋',
      description: '通过夹击对方棋子来翻转它们，最终棋子多的一方获胜',
      category: '策略棋类',
      difficulty: 'hard',
      players: 2,
      duration: '15-30分钟',
      icon: <Disc className="w-8 h-8" />,
      color: 'from-gray-700 to-black',
      bgColor: 'bg-gradient-to-br from-gray-200 to-gray-400'
    },
    {
      id: 'military-chess',
      title: '军棋',
      description: '经典的军棋对战游戏，指挥红蓝两军展开激烈对抗',
      category: '策略棋类',
      difficulty: 'hard',
      players: 2,
      duration: '20-40分钟',
      icon: <Shield className="w-8 h-8" />,
      color: 'from-red-600 to-blue-600',
      bgColor: 'bg-gradient-to-br from-red-200 to-blue-200',
      isPopular: true
    },
    {
      id: 'go-game',
      title: '围棋',
      description: '千年传承的策略棋盘游戏，黑白双方展开智慧较量',
      category: '策略棋类',
      difficulty: 'expert',
      players: 2,
      duration: '30-120分钟',
      icon: <Circle className="w-8 h-8" />,
      color: 'from-gray-800 to-black',
      bgColor: 'bg-gradient-to-br from-gray-300 to-gray-500',
      isPopular: true
    }
  ];

  // 筛选游戏
  const filteredGames = selectedCategory === 'all'
    ? games
    : games.filter(game => game.category === selectedCategory);

  // 获取所有分类
  const categories = ['all', ...new Set(games.map(game => game.category))];

  // 获取难度标签
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">简单</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">中等</Badge>;
      case 'hard':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">困难</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  return (
    <>
      <SEOHead
        title="AI游戏与体验 - 寻找内心的平静 | WSNAIL.COM"
        description="探索AI带来的奇妙体验。从寻找内心平静的占卜，到深入了解关系的分析，再到充满乐趣的智力游戏。WSNAIL为您提供全方位的AI互动体验。"
        keywords="AI游戏,AI占卜,情感分析,销售追踪,内心平静,互动娱乐,WSNAIL"
        url="https://wsnail.com/games"
        canonical="https://wsnail.com/games"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "AI游戏与体验",
          "description": "AI互动体验集合",
          "provider": {
            "@type": "Organization",
            "name": "WSNAIL.COM"
          }
        }}
      />

      <div className="min-h-screen bg-[#FDFBF7]">
        {/* Header */}
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-serif-display font-medium text-gray-800 mb-6 tracking-wide">
                AI 互动体验
              </h1>
              <div className="w-16 h-0.5 bg-gray-300 mx-auto mb-8"></div>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                探索科技与心灵的交汇点。
                <br />
                无论是寻找指引、分析关系，还是享受游戏的乐趣，这里都有属于您的空间。
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Featured Apps (Merged Tools) */}
          <section className="mb-20">
            <div className="flex items-center mb-8">
              <h2 className="text-2xl font-serif-display font-medium text-gray-800">精选体验</h2>
              <div className="h-px bg-gray-200 flex-1 ml-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Divination */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div
                  className="group cursor-pointer bg-white border border-gray-100 rounded-xl p-8 hover:shadow-lg transition-all duration-500 hover:-translate-y-1 h-full flex flex-col"
                  onClick={() => navigate('/divination')}
                >
                  <div className="mb-6 p-4 bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-purple-100 transition-colors duration-500">
                    <Sparkles className="w-8 h-8 text-purple-600 stroke-[1.5px]" />
                  </div>
                  <h3 className="text-xl font-serif-display font-medium text-gray-800 mb-2">AI 占卜大师</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                    结合古老智慧与现代AI，为您提供塔罗、星座、周易的专业指引，寻找内心的平静。
                  </p>
                  <div className="flex items-center text-purple-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    开始探索 <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </motion.div>

              {/* Analyzer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div
                  className="group cursor-pointer bg-white border border-gray-100 rounded-xl p-8 hover:shadow-lg transition-all duration-500 hover:-translate-y-1 h-full flex flex-col"
                  onClick={() => navigate('/analyzer')}
                >
                  <div className="mb-6 p-4 bg-pink-50 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-pink-100 transition-colors duration-500">
                    <Heart className="w-8 h-8 text-pink-600 stroke-[1.5px]" />
                  </div>
                  <h3 className="text-xl font-serif-display font-medium text-gray-800 mb-2">情感分析师</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                    深度分析情感关系，提供专业的沟通建议和冲突解决方案，让爱更懂表达。
                  </p>
                  <div className="flex items-center text-pink-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    开始分析 <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </motion.div>


            </div>
          </section>

          {/* Games Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <h2 className="text-2xl font-serif-display font-medium text-gray-800">休闲游戏</h2>
                <div className="h-px bg-gray-200 w-12 ml-6 hidden md:block"></div>
              </div>

              {/* 分类筛选 */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'ghost'}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full text-sm ${selectedCategory === category ? 'bg-gray-800 text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                  >
                    {category === 'all' ? '全部' : category}
                  </Button>
                ))}
              </div>
            </div>

            {/* 游戏网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <div
                    className="group cursor-pointer bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                    onClick={() => navigate(`/games/${game.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gray-50 group-hover:bg-[#FDFBF7] transition-colors duration-300`}>
                        {React.cloneElement(game.icon as React.ReactElement, {
                          className: "w-6 h-6 text-gray-700"
                        })}
                      </div>
                      <div className="flex gap-2">
                        {game.isNew && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-full">NEW</span>
                        )}
                        {game.isPopular && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-orange-50 text-orange-700 rounded-full">HOT</span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-medium text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                      {game.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50">
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" /> {game.players}人
                      </span>
                      <span className="flex items-center">
                        <RotateCcw className="w-3 h-3 mr-1" /> {game.duration}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 工具统计链接 */}
          <section className="mt-20 bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-serif-display font-medium text-gray-800 mb-4">探索更多可能</h2>
            <p className="text-gray-500 mb-8 font-light">
              查看工具猫网站的工具分类与数量分析，了解更多AI工具信息
            </p>
            <Button
              onClick={() => window.location.href = '/tools/statistics'}
              variant="outline"
              className="border-gray-200 text-gray-600 hover:bg-gray-50 px-8"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              查看工具统计
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}