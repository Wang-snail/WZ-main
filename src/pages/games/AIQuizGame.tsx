import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  Play, 
  Trophy, 
  Star,
  Brain,
  Zap
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOHead from '../../components/SEOHead';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function AIQuizGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // AI知识问答题目
  const questions: Question[] = [
    {
      id: 1,
      question: "以下哪个是最早的人工智能程序之一？",
      options: [
        "AlphaGo",
        "ELIZA",
        "Watson",
        "Deep Blue"
      ],
      correctAnswer: 1,
      explanation: "ELIZA是1966年由约瑟夫·魏岑鲍姆开发的早期自然语言处理程序，被认为是最早的人工智能程序之一。"
    },
    {
      id: 2,
      question: "机器学习中的'过拟合'指的是什么？",
      options: [
        "模型在训练数据上表现太差",
        "模型在新数据上表现不佳",
        "模型训练时间过长",
        "模型参数太少"
      ],
      correctAnswer: 1,
      explanation: "过拟合是指模型在训练数据上表现很好，但在未见过的测试数据上表现较差的现象。"
    },
    {
      id: 3,
      question: "以下哪种神经网络主要用于处理图像数据？",
      options: [
        "循环神经网络(RNN)",
        "卷积神经网络(CNN)",
        "长短期记忆网络(LSTM)",
        "生成对抗网络(GAN)"
      ],
      correctAnswer: 1,
      explanation: "卷积神经网络(CNN)特别适合处理图像数据，因为它能有效提取图像的局部特征。"
    },
    {
      id: 4,
      question: "什么是'图灵测试'？",
      options: [
        "测试计算机运算速度",
        "测试人工智能是否能表现出与人类相当的智能",
        "测试计算机存储容量",
        "测试网络连接速度"
      ],
      correctAnswer: 1,
      explanation: "图灵测试由艾伦·图灵提出，用于判断机器是否具有智能，如果人类评判员无法区分机器和人类的回应，则认为机器通过了测试。"
    },
    {
      id: 5,
      question: "以下哪个不是机器学习的主要类型？",
      options: [
        "监督学习",
        "无监督学习",
        "强化学习",
        "逻辑学习"
      ],
      correctAnswer: 3,
      explanation: "机器学习的主要类型包括监督学习、无监督学习和强化学习，逻辑学习不是标准分类。"
    }
  ];

  // 倒计时效果
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswerSelect(-1); // 超时自动提交
    }
  }, [timeLeft, showResult, gameCompleted]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    // 检查答案是否正确
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    // 延迟进入下一题或结束游戏
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(30);
      } else {
        setGameCompleted(true);
      }
    }, 2000);
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameCompleted(false);
    setTimeLeft(30);
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
                您的得分: {score}/{questions.length}
              </h3>
              
              <p className="text-gray-600 mb-8">
                {score === questions.length 
                  ? "完美！您是AI知识专家！" 
                  : score >= questions.length * 0.8 
                    ? "很棒！您对AI有很好的了解！" 
                    : score >= questions.length * 0.6 
                      ? "不错！继续学习AI知识吧！" 
                      : "继续努力，AI世界等着您探索！"}
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

  return (
    <>
      <SEOHead 
        title="AI知识问答游戏 - 测试你的AI知识 | WSNAIL.COM"
        description="挑战AI知识问答游戏，测试你对人工智能的了解程度。包含机器学习、深度学习、自然语言处理等领域的趣味题目。"
        keywords="AI知识问答,人工智能游戏,机器学习,深度学习,自然语言处理,WSNAIL"
        url="https://wsnail.com/games/ai-quiz"
        canonical="https://wsnail.com/games/ai-quiz"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-between items-center mb-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  第 {currentQuestion + 1} 题 / {questions.length}
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
                  animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <CardTitle className="text-2xl font-bold text-gray-900">
                {questions[currentQuestion].question}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {/* 倒计时 */}
              <div className="flex justify-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  timeLeft > 10 ? 'bg-green-100 text-green-600' : 
                  timeLeft > 5 ? 'bg-yellow-100 text-yellow-600' : 
                  'bg-red-100 text-red-600'
                }`}>
                  <span className="text-2xl font-bold">{timeLeft}</span>
                </div>
              </div>
              
              {/* 选项 */}
              <div className="space-y-4 mb-8">
                {questions[currentQuestion].options.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className={`w-full h-auto py-4 px-6 text-left justify-start text-lg ${
                        showResult
                          ? index === questions[currentQuestion].correctAnswer
                            ? 'bg-green-100 border-green-500'
                            : selectedAnswer === index
                            ? 'bg-red-100 border-red-500'
                            : ''
                          : ''
                      }`}
                      onClick={() => !showResult && handleAnswerSelect(index)}
                      disabled={showResult}
                    >
                      <div className="flex items-center">
                        <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                        <span>{option}</span>
                      </div>
                      
                      {/* 答案反馈图标 */}
                      {showResult && index === questions[currentQuestion].correctAnswer && (
                        <div className="ml-auto text-green-600">
                          <Star className="w-6 h-6" />
                        </div>
                      )}
                      {showResult && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer && (
                        <div className="ml-auto text-red-600">
                          <Zap className="w-6 h-6" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
              
              {/* 答案解释 */}
              {showResult && (
                <motion.div 
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="font-semibold text-blue-800 mb-2">答案解析：</h4>
                  <p className="text-blue-700">{questions[currentQuestion].explanation}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}