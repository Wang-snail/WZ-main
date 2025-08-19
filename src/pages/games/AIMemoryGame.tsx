import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  Play, 
  Trophy, 
  Star,
  Zap,
  Lightbulb,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOHead from '../../components/SEOHead';

interface MemoryCard {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function AIMemoryGame() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // 卡片图案（AI相关图标）
  const cardValues = [
    '🤖', '🧠', '🔍', '📊',
    '💻', '📱', '🌐', '💡',
    '⚡', '🔮', '🎯', '🚀'
  ];

  // 初始化游戏
  const initializeGame = () => {
    // 创建配对卡片
    const pairedCards = [...cardValues.slice(0, 8), ...cardValues.slice(0, 8)];
    
    // 打乱卡片顺序
    const shuffledCards = [...pairedCards]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameCompleted(false);
    setGameStarted(true);
    setTimeElapsed(0);
    setTimerActive(true);
  };

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  // 处理卡片点击
  const handleCardClick = (id: number) => {
    // 如果游戏未开始、卡片已翻开或已匹配，不处理
    if (!gameStarted || flippedCards.length >= 2 || cards[id].isFlipped || cards[id].isMatched) {
      return;
    }

    // 翻开卡片
    const updatedCards = cards.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    );
    
    setCards(updatedCards);
    
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    
    // 检查是否匹配
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = updatedCards[firstId];
      const secondCard = updatedCards[secondId];
      
      if (firstCard.value === secondCard.value) {
        // 匹配成功
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === firstId || card.id === secondId 
                ? { ...card, isMatched: true } 
                : card
            )
          );
          setMatches(matches + 1);
          setFlippedCards([]);
          
          // 检查游戏是否完成
          if (matches + 1 === 8) {
            setGameCompleted(true);
            setTimerActive(false);
          }
        }, 500);
      } else {
        // 不匹配，翻回卡片
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === firstId || card.id === secondId 
                ? { ...card, isFlipped: false } 
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 重新开始游戏
  const resetGame = () => {
    setGameStarted(false);
    setTimerActive(false);
    setTimeElapsed(0);
  };

  return (
    <>
      <SEOHead 
        title="AI记忆大师 - 记忆力训练游戏 | WSNAIL.COM"
        description="挑战AI记忆大师游戏，通过记忆AI相关图标提升记忆力。有趣的记忆力训练游戏，锻炼大脑，享受科技乐趣。"
        keywords="AI记忆游戏,记忆力训练,脑力锻炼,人工智能游戏,WSNAIL"
        url="https://wsnail.com/games/ai-memory"
        canonical="https://wsnail.com/games/ai-memory"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                AI记忆大师
              </CardTitle>
              
              {!gameStarted ? (
                <div className="space-y-6">
                  <p className="text-gray-600 text-lg">
                    挑战你的记忆力！翻开卡片找到相同的AI图标配对
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4 mb-6">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 py-2 px-4 text-base">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      8对卡片等待匹配
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 py-2 px-4 text-base">
                      <Zap className="w-5 h-5 mr-2" />
                      3种难度可选
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={initializeGame}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg py-3 px-8 text-lg"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    开始游戏
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold">匹配: {matches}/8</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">步数: {moves}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">时间: {formatTime(timeElapsed)}</span>
                  </div>
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    className="flex items-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    重新开始
                  </Button>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="text-center">
              {gameStarted && !gameCompleted && (
                <>
                  {/* 游戏板 */}
                  <div className="flex justify-center mb-8">
                    <div className="grid grid-cols-4 gap-3 bg-gradient-to-br from-blue-100 to-purple-100 p-5 rounded-3xl">
                      {cards.map((card) => (
                        <motion.div
                          key={card.id}
                          whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl cursor-pointer shadow-lg transition-all duration-300 ${
                            card.isMatched
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-200'
                              : card.isFlipped
                              ? 'bg-gradient-to-br from-white to-gray-100 text-gray-800 border-2 border-blue-300 shadow-blue-200'
                              : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-blue-300'
                          }`}
                          onClick={() => handleCardClick(card.id)}
                        >
                          {card.isFlipped || card.isMatched ? (
                            <motion.div
                              initial={{ rotateY: 0 }}
                              animate={{ rotateY: 360 }}
                              transition={{ duration: 0.3 }}
                            >
                              {card.value}
                            </motion.div>
                          ) : (
                            <EyeOff className="w-8 h-8" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 游戏提示 */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      {flippedCards.length === 1 
                        ? '记住这张卡片的位置，寻找匹配的卡片' 
                        : flippedCards.length === 2
                        ? '检查这两张卡片是否匹配...'
                        : '点击卡片翻开查看'}
                    </p>
                  </div>
                </>
              )}
              
              {/* 游戏完成 */}
              {gameCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900">
                    恭喜完成挑战！
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <CardContent className="p-4">
                        <p className="text-sm opacity-90">完成时间</p>
                        <p className="text-2xl font-bold">{formatTime(timeElapsed)}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      <CardContent className="p-4">
                        <p className="text-sm opacity-90">总步数</p>
                        <p className="text-2xl font-bold">{moves}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                      <CardContent className="p-4">
                        <p className="text-sm opacity-90">效率</p>
                        <p className="text-2xl font-bold">{moves === 8 ? '完美' : moves <= 12 ? '优秀' : '良好'}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      {moves === 8 
                        ? '完美表现！你的记忆力堪比超级AI！' 
                        : moves <= 12 
                        ? '出色表现！你的大脑运转得像高效的神经网络！' 
                        : '不错表现！继续训练，你的记忆力会越来越强！'}
                    </p>
                    
                    <Button
                      onClick={initializeGame}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      再来一局
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {/* 游戏说明 */}
              {!gameStarted && (
                <div className="bg-gray-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">游戏规则</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <Star className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>翻开两张卡片，如果图案相同则匹配成功</span>
                    </li>
                    <li className="flex items-start">
                      <Star className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>匹配成功卡片会保持翻开状态，否则会重新翻回</span>
                    </li>
                    <li className="flex items-start">
                      <Star className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>找到所有8对匹配卡片即可完成游戏</span>
                    </li>
                    <li className="flex items-start">
                      <Star className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>用尽可能少的步数和时间完成挑战，获得更高评价</span>
                    </li>
                  </ul>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">记忆训练益处</h4>
                    <p className="text-gray-600">
                      定期进行记忆训练有助于提高注意力、增强大脑活跃度，并可能延缓认知衰退。
                      通过这种有趣的AI主题记忆游戏，您可以在享受乐趣的同时锻炼大脑。
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}