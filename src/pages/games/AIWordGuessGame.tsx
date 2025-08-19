import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  Play, 
  Trophy, 
  Star,
  Brain,
  Zap,
  Lightbulb,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOHead from '../../components/SEOHead';

interface WordPuzzle {
  id: number;
  word: string;
  category: string;
  clues: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function AIWordGuessGame() {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [clueIndex, setClueIndex] = useState(0);

  // AI相关词汇谜题
  const puzzles: WordPuzzle[] = [
    {
      id: 1,
      word: "机器学习",
      category: "AI技术",
      difficulty: "easy",
      clues: [
        "一种让计算机从数据中学习的技术",
        "不需要明确编程就能完成任务",
        "英文名是Machine Learning",
        "包含监督学习和无监督学习"
      ]
    },
    {
      id: 2,
      word: "神经网络",
      category: "AI模型",
      difficulty: "easy",
      clues: [
        "模仿人脑结构的计算模型",
        "由多层节点组成",
        "英文名是Neural Network",
        "是深度学习的基础"
      ]
    },
    {
      id: 3,
      word: "自然语言处理",
      category: "AI应用",
      difficulty: "medium",
      clues: [
        "让计算机理解和生成人类语言的技术",
        "英文缩写是NLP",
        "用于机器翻译和语音识别",
        "涉及语义分析和情感分析"
      ]
    },
    {
      id: 4,
      word: "生成对抗网络",
      category: "AI模型",
      difficulty: "hard",
      clues: [
        "由生成器和判别器组成的模型",
        "英文缩写是GAN",
        "可以生成逼真的图像和文本",
        "由Ian Goodfellow提出"
      ]
    },
    {
      id: 5,
      word: "图灵测试",
      category: "AI理论",
      difficulty: "medium",
      clues: [
        "判断机器是否具有智能的测试",
        "以计算机科学之父命名",
        "通过对话来评估机器智能",
        "1950年提出"
      ]
    },
    {
      id: 6,
      word: "强化学习",
      category: "AI技术",
      difficulty: "medium",
      clues: [
        "通过奖励和惩罚来学习的方法",
        "常用于游戏AI和机器人控制",
        "英文名是Reinforcement Learning",
        "AlphaGo使用了这种方法"
      ]
    }
  ];

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentPuzzle(0);
    setAttempts(0);
    setGuess('');
    setRevealedLetters([]);
    setShowHint(false);
    setClueIndex(0);
  };

  const handleGuess = () => {
    if (!guess.trim()) return;
    
    setAttempts(attempts + 1);
    
    if (guess.trim() === puzzles[currentPuzzle].word) {
      // 猜对了
      const points = calculatePoints();
      setScore(score + points);
      
      // 延迟进入下一题或结束游戏
      setTimeout(() => {
        if (currentPuzzle < puzzles.length - 1) {
          setCurrentPuzzle(currentPuzzle + 1);
          setGuess('');
          setRevealedLetters([]);
          setShowHint(false);
          setClueIndex(0);
        } else {
          setGameCompleted(true);
        }
      }, 1500);
    } else {
      // 猜错了，显示提示
      setShowHint(true);
    }
  };

  const calculatePoints = () => {
    // 根据难度和剩余线索计算分数
    const basePoints = puzzles[currentPuzzle].difficulty === 'easy' ? 100 : 
                      puzzles[currentPuzzle].difficulty === 'medium' ? 200 : 300;
    const cluePenalty = clueIndex * 20;
    const attemptPenalty = attempts * 10;
    return Math.max(10, basePoints - cluePenalty - attemptPenalty);
  };

  const getHint = () => {
    if (clueIndex < puzzles[currentPuzzle].clues.length - 1) {
      setClueIndex(clueIndex + 1);
    }
  };

  const revealLetter = () => {
    const word = puzzles[currentPuzzle].word;
    const unrevealedIndices = Array.from(word).map((_, i) => i)
      .filter(i => !revealedLetters.includes(i));
    
    if (unrevealedIndices.length > 0) {
      const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
      setRevealedLetters([...revealedLetters, randomIndex]);
    }
  };

  const restartGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
  };

  const renderWord = () => {
    return Array.from(puzzles[currentPuzzle].word).map((char, index) => (
      <motion.div
        key={index}
        className={`inline-block w-10 h-10 mx-1 rounded-lg flex items-center justify-center text-xl font-bold ${
          revealedLetters.includes(index) 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-white border border-gray-300 text-gray-800'
        }`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.1 }}
      >
        {revealedLetters.includes(index) ? char : '?'}
      </motion.div>
    ));
  };

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                游戏结束！
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                您的得分: {score}
              </h3>
              
              <p className="text-gray-600 mb-8">
                {score >= 800 
                  ? "完美！您是AI词汇专家！" 
                  : score >= 600 
                    ? "很棒！您对AI术语很了解！" 
                    : score >= 400 
                      ? "不错！继续学习AI知识吧！" 
                      : "继续努力，探索更多AI术语！"}
              </p>
              
              <Button 
                onClick={restartGame}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                再玩一次
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                AI词汇猜谜
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <p className="text-gray-600 text-lg mb-8">
                通过线索猜出AI相关的术语和概念
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">简单</h4>
                  <p className="text-sm text-blue-600">基础AI术语</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">中等</h4>
                  <p className="text-sm text-purple-600">AI技术和应用</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-pink-800 mb-2">困难</h4>
                  <p className="text-sm text-pink-600">高级AI概念</p>
                </div>
              </div>
              
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg py-3 px-8 text-lg"
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
        title="AI词汇猜谜游戏 - 猜测人工智能术语 | WSNAIL.COM"
        description="挑战AI词汇猜谜游戏，通过线索猜出人工智能相关的术语和概念。有趣的AI知识游戏，提升对AI技术的理解。"
        keywords="AI词汇游戏,人工智能术语,猜谜游戏,机器学习,深度学习,自然语言处理,WSNAIL"
        url="https://wsnail.com/games/ai-word-guess"
        canonical="https://wsnail.com/games/ai-word-guess"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-between items-center mb-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  第 {currentPuzzle + 1} 题 / {puzzles.length}
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Brain className="w-4 h-4 mr-1" />
                  得分: {score}
                </Badge>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentPuzzle + 1) / puzzles.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {puzzles[currentPuzzle].category}
              </CardTitle>
              <p className="text-gray-600">
                猜猜这个AI术语是什么？
              </p>
            </CardHeader>
            
            <CardContent>
              {/* 词汇显示 */}
              <div className="flex justify-center my-8">
                {renderWord()}
              </div>
              
              {/* 线索 */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  线索 ({clueIndex + 1}/{puzzles[currentPuzzle].clues.length})
                </h4>
                <p className="text-blue-700 text-lg">
                  {puzzles[currentPuzzle].clues[clueIndex]}
                </p>
              </div>
              
              {/* 猜测输入 */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入您的答案..."
                    onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                  />
                  <Button
                    onClick={handleGuess}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  >
                    <Star className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                <Button
                  onClick={getHint}
                  disabled={clueIndex >= puzzles[currentPuzzle].clues.length - 1}
                  variant="outline"
                  className="flex items-center"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  更多线索
                </Button>
                
                <Button
                  onClick={revealLetter}
                  variant="outline"
                  className="flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  显示字母
                </Button>
                
                <Button
                  onClick={() => setShowHint(!showHint)}
                  variant="outline"
                  className="flex items-center"
                >
                  {showHint ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      隐藏提示
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      显示提示
                    </>
                  )}
                </Button>
              </div>
              
              {/* 提示信息 */}
              {showHint && (
                <motion.div 
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="font-semibold text-yellow-800 mb-2">提示：</h4>
                  <p className="text-yellow-700">
                    答案是 {puzzles[currentPuzzle].word.length} 个字符的词汇
                  </p>
                </motion.div>
              )}
              
              {/* 游戏说明 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">游戏规则</h4>
                <ul className="space-y-1 text-gray-600 text-sm">
                  <li>• 根据提供的线索猜出AI相关术语</li>
                  <li>• 使用"更多线索"获取额外提示</li>
                  <li>• 使用"显示字母"揭示答案中的字母</li>
                  <li>• 猜对得分，线索使用越多得分越低</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}