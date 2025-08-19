import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  Play, 
  Trophy, 
  Star,
  Brain,
  Zap,
  Calculator,
  Check,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOHead from '../../components/SEOHead';

interface MathProblem {
  id: number;
  expression: string;
  answer: number;
  options: number[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function AIMathChallenge() {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // 生成数学问题
  const generateProblem = (difficulty: 'easy' | 'medium' | 'hard'): MathProblem => {
    let expression = '';
    let answer = 0;
    let options: number[] = [];
    
    switch (difficulty) {
      case 'easy':
        // 简单加减法
        const easyOperators = ['+', '-'];
        const easyOperator = easyOperators[Math.floor(Math.random() * easyOperators.length)];
        const easyA = Math.floor(Math.random() * 20) + 1;
        const easyB = Math.floor(Math.random() * 20) + 1;
        expression = `${easyA} ${easyOperator} ${easyB}`;
        answer = easyOperator === '+' ? easyA + easyB : easyA - easyB;
        break;
        
      case 'medium':
        // 中等难度：混合运算
        const mediumOperators = ['+', '-', '*', '/'];
        const mediumOperator = mediumOperators[Math.floor(Math.random() * mediumOperators.length)];
        let mediumA, mediumB;
        
        if (mediumOperator === '/') {
          mediumB = Math.floor(Math.random() * 10) + 1;
          mediumA = mediumB * (Math.floor(Math.random() * 10) + 1);
          answer = mediumA / mediumB;
        } else if (mediumOperator === '*') {
          mediumA = Math.floor(Math.random() * 12) + 1;
          mediumB = Math.floor(Math.random() * 12) + 1;
          answer = mediumA * mediumB;
        } else if (mediumOperator === '+') {
          mediumA = Math.floor(Math.random() * 50) + 1;
          mediumB = Math.floor(Math.random() * 50) + 1;
          answer = mediumA + mediumB;
        } else {
          mediumA = Math.floor(Math.random() * 50) + 1;
          mediumB = Math.floor(Math.random() * 50) + 1;
          answer = mediumA - mediumB;
        }
        
        expression = `${mediumA} ${mediumOperator} ${mediumB}`;
        answer = Math.round(answer * 100) / 100;
        break;
        
      case 'hard':
        // 困难难度：复杂表达式
        const patterns = [
          () => {
            const a = Math.floor(Math.random() * 20) + 1;
            const b = Math.floor(Math.random() * 20) + 1;
            const c = Math.floor(Math.random() * 20) + 1;
            const result = a + b * c;
            return {
              expression: `${a} + ${b} × ${c}`,
              answer: result
            };
          },
          () => {
            const a = Math.floor(Math.random() * 30) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            const c = Math.floor(Math.random() * 10) + 1;
            const result = a - b * c;
            return {
              expression: `${a} - ${b} × ${c}`,
              answer: result
            };
          },
          () => {
            const a = Math.floor(Math.random() * 12) + 1;
            const b = Math.floor(Math.random() * 12) + 1;
            const c = Math.floor(Math.random() * 12) + 1;
            const result = (a * b) / c;
            return {
              expression: `(${a} × ${b}) ÷ ${c}`,
              answer: Math.round(result * 100) / 100
            };
          }
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const result = pattern();
        expression = result.expression;
        answer = result.answer;
        break;
    }
    
    // 生成选项
    options = [answer];
    while (options.length < 4) {
      let option;
      const variation = Math.floor(Math.random() * 20) + 1;
      if (Math.random() > 0.5) {
        option = answer + variation;
      } else {
        option = answer - variation;
      }
      
      // 确保选项是整数或合理的小数
      if (difficulty === 'easy') {
        option = Math.round(option);
      } else {
        option = Math.round(option * 10) / 10;
      }
      
      if (!options.includes(option) && option >= 0) {
        options.push(option);
      }
    }
    
    // 打乱选项
    options = options.sort(() => Math.random() - 0.5);
    
    return {
      id: Date.now(),
      expression,
      answer,
      options,
      difficulty
    };
  };

  // 生成问题集
  const generateProblems = (count: number, difficulty: 'easy' | 'medium' | 'hard') => {
    const newProblems: MathProblem[] = [];
    for (let i = 0; i < count; i++) {
      newProblems.push(generateProblem(difficulty));
    }
    return newProblems;
  };

  // 开始游戏
  const startGame = () => {
    const problemCount = difficulty === 'easy' ? 10 : 
                        difficulty === 'medium' ? 15 : 20;
    const newProblems = generateProblems(problemCount, difficulty);
    setProblems(newProblems);
    setCurrentProblem(0);
    setScore(0);
    setTimeLeft(60);
    setTimerActive(true);
    setGameState('playing');
    setSelectedAnswer(null);
    setShowResult(false);
    setStreak(0);
  };

  // 重置游戏
  const resetGame = () => {
    setGameState('setup');
    setTimerActive(false);
    setTimeLeft(60);
  };

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('completed');
      setTimerActive(false);
      if (streak > bestStreak) {
        setBestStreak(streak);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft, gameState, streak, bestStreak]);

  // 处理答案选择
  const handleAnswerSelect = (answer: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    // 检查答案是否正确
    const isCorrect = answer === problems[currentProblem].answer;
    if (isCorrect) {
      const points = difficulty === 'easy' ? 10 : 
                    difficulty === 'medium' ? 20 : 30;
      setScore(prev => prev + points + streak * 2); // 连击奖励
      setStreak(prev => prev + 1);
    } else {
      if (streak > bestStreak) {
        setBestStreak(streak);
      }
      setStreak(0);
    }
    
    // 延迟进入下一题或结束游戏
    setTimeout(() => {
      if (currentProblem < problems.length - 1) {
        setCurrentProblem(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameState('completed');
        setTimerActive(false);
        if (streak > bestStreak) {
          setBestStreak(streak);
        }
      }
    }, 1500);
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                AI数学挑战
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Calculator className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <p className="text-gray-600 text-lg mb-8">
                挑战你的数学能力，在限定时间内解答尽可能多的数学题！
              </p>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">选择难度</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={difficulty === level ? 'default' : 'outline'}
                      onClick={() => setDifficulty(level)}
                      className="capitalize"
                    >
                      {level === 'easy' ? '简单 (10题)' : 
                       level === 'medium' ? '中等 (15题)' : 
                       '困难 (20题)'}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">游戏规则</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>在60秒内解答尽可能多的数学题</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>简单题10分，中等题20分，困难题30分</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>连续答对可获得连击奖励</span>
                  </li>
                </ul>
              </div>
              
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:shadow-lg py-3 px-8 text-lg"
              >
                <Play className="w-6 h-6 mr-2" />
                开始挑战
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === 'completed') {
    const accuracy = problems.length > 0 ? Math.round((score / (problems.length * (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30))) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                挑战结束！
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                你的最终得分: {score}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-sm opacity-90">准确率</p>
                    <p className="text-2xl font-bold">{accuracy}%</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-sm opacity-90">最高连击</p>
                    <p className="text-2xl font-bold">{bestStreak}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-sm opacity-90">题目数量</p>
                    <p className="text-2xl font-bold">{problems.length}</p>
                  </CardContent>
                </Card>
              </div>
              
              <p className="text-gray-600 mb-8">
                {score >= 200 
                  ? "太棒了！你是数学天才！" 
                  : score >= 100 
                    ? "很不错！继续保持练习！" 
                    : "继续努力，数学能力会越来越强！"}
              </p>
              
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:shadow-lg mr-4"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                再来一次
              </Button>
              
              <Button 
                onClick={resetGame}
                variant="outline"
                className="flex items-center"
              >
                <Calculator className="w-4 h-4 mr-2" />
                返回菜单
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
        title="AI数学挑战游戏 - 快速心算训练 | WSNAIL.COM"
        description="挑战AI数学挑战游戏，在限定时间内解答各种难度的数学题。锻炼心算能力，提升数学技能的趣味练习。"
        keywords="数学游戏,心算训练,数学挑战,智力游戏,WSNAIL"
        url="https://wsnail.com/games/ai-math-challenge"
        canonical="https://wsnail.com/games/ai-math-challenge"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-between items-center mb-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  题目 {currentProblem + 1} / {problems.length}
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Brain className="w-4 h-4 mr-1" />
                  得分: {score}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Zap className="w-4 h-4 mr-1" />
                  连击: {streak}
                </Badge>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentProblem + 1) / problems.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  timeLeft > 20 ? 'bg-green-100 text-green-600' : 
                  timeLeft > 10 ? 'bg-yellow-100 text-yellow-600' : 
                  'bg-red-100 text-red-600'
                }`}>
                  <span className="text-2xl font-bold">{formatTime(timeLeft)}</span>
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {problems[currentProblem]?.expression}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {/* 选项 */}
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                {problems[currentProblem]?.options.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className={`w-full h-auto py-4 px-6 text-lg font-bold ${
                        showResult
                          ? option === problems[currentProblem].answer
                            ? 'bg-green-100 border-green-500 text-green-800'
                            : selectedAnswer === option
                            ? 'bg-red-100 border-red-500 text-red-800'
                            : ''
                          : ''
                      }`}
                      onClick={() => !showResult && handleAnswerSelect(option)}
                      disabled={showResult}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{option}</span>
                        {showResult && option === problems[currentProblem].answer && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                        {showResult && selectedAnswer === option && option !== problems[currentProblem].answer && (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
              
              {/* 进度条 */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <motion.div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 60) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              
              {/* 游戏说明 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">游戏提示</h4>
                <ul className="space-y-1 text-gray-600 text-sm">
                  <li>• 在60秒内解答尽可能多的题目</li>
                  <li>• 连续答对可获得额外分数奖励</li>
                  <li>• 不同难度有不同的分值</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}