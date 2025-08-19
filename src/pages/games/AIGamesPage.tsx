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
  BarChart3
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOHead from '../../components/SEOHead';
import { useNavigate } from 'react-router-dom';

// 游戏类型定义
interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
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
        title="AI小游戏 - 人工智能互动娱乐 | WSNAIL.COM"
        description="体验各种有趣的AI小游戏，包括知识问答、策略对战、益智解谜等。与AI互动，挑战智力，享受科技带来的娱乐乐趣。"
        keywords="AI小游戏,人工智能游戏,互动娱乐,知识问答,策略对战,益智解谜,WSNAIL"
        url="https://wsnail.com/games"
        canonical="https://wsnail.com/games"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "AI小游戏",
          "description": "精选AI互动娱乐游戏集合",
          "url": "https://wsnail.com/games",
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": games.length,
            "itemListElement": games.map((game, index) => ({
              "@type": "Game",
              "position": index + 1,
              "name": game.title,
              "description": game.description,
              "genre": game.category,
              "playMode": "SinglePlayer"
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
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                AI小游戏
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                与人工智能互动，挑战智力极限，体验科技带来的娱乐乐趣
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Gamepad2 className="w-5 h-5 text-blue-500" />
                  <span>{games.length}+ 精选游戏</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span>单人挑战</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span>持续更新</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 分类筛选 */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category === 'all' ? '全部游戏' : category}
                </Button>
              ))}
            </div>
          </div>

          {/* 游戏网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 ${game.bgColor} hover:scale-105`}
                      onClick={() => navigate(`/games/${game.id}`)}>
                  <CardHeader className="text-center pb-4 relative">
                    {/* 标签 */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {game.isNew && (
                        <Badge variant="default" className="bg-gradient-to-r from-green-500 to-teal-500">
                          新
                        </Badge>
                      )}
                      {game.isPopular && (
                        <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                          热门
                        </Badge>
                      )}
                    </div>
                    
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center shadow-lg`}>
                      {game.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800 mb-2">
                      {game.title}
                    </CardTitle>
                    <Badge variant="secondary" className="mb-3">
                      {game.category}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {game.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {getDifficultyBadge(game.difficulty)}
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        {game.duration}
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        {game.players}人
                      </Badge>
                    </div>
                    
                    <Button 
                      className={`w-full bg-gradient-to-r ${game.color} text-white border-0 hover:shadow-lg transition-all duration-300`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/games/${game.id}`);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      开始游戏
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* 游戏介绍 */}
          <section className="mt-20 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">AI游戏的乐趣</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                通过与人工智能互动的游戏，不仅可以娱乐放松，还能锻炼思维能力，了解AI技术的奇妙应用
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">智力挑战</h3>
                <p className="text-gray-600">
                  通过各种智力游戏挑战，锻炼逻辑思维和问题解决能力
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">技术体验</h3>
                <p className="text-gray-600">
                  亲身体验人工智能技术的魅力和无限可能性
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">娱乐放松</h3>
                <p className="text-gray-600">
                  在轻松愉快的游戏氛围中放松心情，享受科技乐趣
                </p>
              </div>
            </div>
          </section>
          
          {/* 工具统计链接 */}
          <section className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">工具数据统计</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                查看工具猫网站的工具分类与数量分析，了解更多AI工具信息
              </p>
              <Button 
                onClick={() => window.location.href = '/tools/statistics'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg py-3 px-6"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                查看工具统计
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}