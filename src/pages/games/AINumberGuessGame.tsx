import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  Play, 
  Trophy, 
  Star,
  Brain,
  Zap,
  Target,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOHead from '../../components/SEOHead';

export default function AINumberGuessGame() {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'won' | 'lost'>('setup');
  const [range, setRange] = useState({ min: 1, max: 100 });
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(7);
  const [feedback, setFeedback] = useState('');
  const [guesses, setGuesses] = useState<Array<{number: number, hint: string}>>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // 根据难度设置范围和最大尝试次数
  useEffect(() => {
    switch (difficulty) {
      case 'easy':
        setRange({ min: 1, max: 50 });
        setMaxAttempts(6);
        break;
      case 'medium':
        setRange({ min: 1, max: 100 });
        setMaxAttempts(7);
        break;
      case 'hard':
        setRange({ min: 1, max: 200 });
        setMaxAttempts(8);
        break;
    }
  }, [difficulty]);

  const startGame = () => {
    const target = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    setTargetNumber(target);
    setGameState('playing');
    setAttempts(0);
    setGuess('');
    setFeedback('');
    setGuesses([]);
  };

  const resetGame = () => {
    setGameState('setup');
    setGuess('');
    setFeedback('');
    setGuesses([]);
  };

  const handleGuess = () => {
    const num = parseInt(guess);
    if (isNaN(num) || num < range.min || num > range.max) {
      setFeedback(`请输入 ${range.min} 到 ${range.max} 之间的数字`);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setGuess('');

    if (num === targetNumber) {
      setGameState('won');
      setFeedback(`🎉 恭喜！你猜对了！答案就是 ${targetNumber}`);
      setGuesses([...guesses, { number: num, hint: '正确!' }]);
    } else if (newAttempts >= maxAttempts) {
      setGameState('lost');
      setFeedback(`😢 游戏结束！答案是 ${targetNumber}`);
      setGuesses([...guesses, { 
        number: num, 
        hint: num > targetNumber ? '太大了' : '太小了' 
      }]);
    } else {
      const hint = num > targetNumber ? '太大了' : '太小了';
      setFeedback(`_try ${newAttempts}/${maxAttempts}: ${hint}`);
      setGuesses([...guesses, { number: num, hint }]);
    }
  };

  const getHintIcon = (hint: string) => {
    if (hint === '太大了') return <ArrowDown className="w-4 h-4 text-red-500" />;
    if (hint === '太小了') return <ArrowUp className="w-4 h-4 text-blue-500" />;
    if (hint === '正确!') return <Target className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                数字炸弹
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Target className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <p className="text-gray-600 text-lg mb-8">
                小心！数字炸弹即将爆炸，猜中它你就赢了！
              </p>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">选择难度</h3>
                <div className="flex justify-center gap-4">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={difficulty === level ? 'default' : 'outline'}
                      onClick={() => setDifficulty(level)}
                      className="capitalize"
                    >
                      {level === 'easy' ? '简单 (1-50)' : 
                       level === 'medium' ? '中等 (1-100)' : 
                       '困难 (1-200)'}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">游戏规则</h3>
                <ul className="space-y-2 text-gray-600 text-left">
                  <li>• AI会设置一个 {range.min} 到 {range.max} 之间的数字炸弹</li>
                  <li>• 你需要在 {maxAttempts} 次内猜中这个数字</li>
                  <li>• 每次猜测后，AI会告诉你数字是太大还是太小</li>
                  <li>• 猜中数字即拆除炸弹获胜！</li>
                </ul>
              </div>
              
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-lg py-3 px-8 text-lg"
              >
                <Play className="w-6 h-6 mr-2" />
                开始游戏
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="AI猜数字游戏 - 经典数字猜测游戏 | WSNAIL.COM"
        description="挑战AI猜数字游戏，在限定次数内猜出AI想的数字。经典益智游戏，锻炼逻辑推理能力。"
        keywords="猜数字游戏,数字猜测,逻辑推理,益智游戏,WSNAIL"
        url="https://wsnail.com/games/ai-number-guess"
        canonical="https://wsnail.com/games/ai-number-guess"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-between items-center mb-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  尝试: {attempts}/{maxAttempts}
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  范围: {range.min}-{range.max}
                </Badge>
              </div>
              
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                数字炸弹
              </CardTitle>
              <p className="text-gray-600">
                数字炸弹已设置，范围 {range.min} 到 {range.max}，你能安全拆除吗？
              </p>
            </CardHeader>
            
            <CardContent>
              {(gameState === 'playing' || gameState === 'won' || gameState === 'lost') && (
                <>
                  {/* 猜测输入 */}
                  <div className="mb-6">
                    <div className="flex gap-2 max-w-md mx-auto">
                      <input
                        type="number"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`输入 ${range.min}-${range.max} 之间的数字`}
                        onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                        disabled={gameState !== 'playing'}
                        min={range.min}
                        max={range.max}
                      />
                      <Button
                        onClick={handleGuess}
                        disabled={gameState !== 'playing'}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      >
                        <Zap className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* 反馈信息 */}
                  {feedback && (
                    <motion.div 
                      className={`rounded-lg p-4 mb-6 text-center ${
                        gameState === 'won' ? 'bg-green-100 text-green-800' :
                        gameState === 'lost' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="font-semibold">{feedback}</p>
                    </motion.div>
                  )}
                  
                  {/* 猜测历史 */}
                  {guesses.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">猜测历史</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {guesses.map((g, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                          >
                            <span className="font-mono">{g.number}</span>
                            <span className="flex items-center">
                              {getHintIcon(g.hint)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 游戏结束状态 */}
                  {(gameState === 'won' || gameState === 'lost') && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-8"
                    >
                      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                        <CardTitle className="text-2xl mb-2 flex items-center justify-center">
                          {gameState === 'won' ? (
                            <>
                              <Trophy className="w-8 h-8 mr-2" />
                              恭喜获胜！
                            </>
                          ) : (
                            <>
                              <Brain className="w-8 h-8 mr-2" />
                              继续努力！
                            </>
                          )}
                        </CardTitle>
                        <p className="text-blue-100">
                          {gameState === 'won' 
                            ? `你用了 ${attempts} 次猜中了数字 ${targetNumber}！` 
                            : `答案是 ${targetNumber}，下次一定会猜中！`}
                        </p>
                      </Card>
                    </motion.div>
                  )}
                  
                  {/* 操作按钮 */}
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={resetGame}
                      variant="outline"
                      className="flex items-center"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      重新开始
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}