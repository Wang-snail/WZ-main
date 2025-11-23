import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCw, 
  Play, 
  Trophy, 
  Star,
  Brain,
  Zap,
  Hand,
  Scissors,
  Mountain,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOHead from '../../components/common/SEOHead';

type Choice = 'rock' | 'paper' | 'scissors' | null;
type Result = 'win' | 'lose' | 'draw' | 'timeout' | null;
type GameState = 'waiting' | 'countdown' | 'selecting' | 'showing';

export default function AIRockPaperScissors() {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [aiChoice, setAiChoice] = useState<Choice>(null);
  const [result, setResult] = useState<Result>(null);
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0, timeouts: 0 });
  const [gameHistory, setGameHistory] = useState<Array<{player: Choice, ai: Choice, result: Result}>>([]);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [countdown, setCountdown] = useState<number>(3);
  const [round, setRound] = useState<number>(1);

  const choices = [
    { id: 'rock', name: '石头', icon: <Mountain className="w-8 h-8" />, color: 'from-gray-400 to-gray-600' },
    { id: 'paper', name: '布', icon: <Hand className="w-8 h-8" />, color: 'from-white to-gray-200' },
    { id: 'scissors', name: '剪刀', icon: <Scissors className="w-8 h-8" />, color: 'from-yellow-400 to-orange-500' }
  ];

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (gameState === 'countdown' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (gameState === 'countdown' && countdown === 0) {
      // 倒计时结束，进入选择阶段
      setGameState('selecting');
      // 设置超时检测
      timer = setTimeout(() => {
        if (gameState === 'selecting' && !playerChoice) {
          handleTimeout();
        }
      }, 3000); // 3秒内必须选择
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState, countdown, playerChoice]);

  const getChoiceIcon = (choice: Choice) => {
    switch (choice) {
      case 'rock': return <Mountain className="w-12 h-12" />;
      case 'paper': return <Hand className="w-12 h-12" />;
      case 'scissors': return <Scissors className="w-12 h-12" />;
      default: return <Zap className="w-12 h-12" />;
    }
  };

  const getResultText = (result: Result) => {
    switch (result) {
      case 'win': return '你赢了！';
      case 'lose': return 'AI赢了！';
      case 'draw': return '平局！';
      case 'timeout': return '超时！';
      default: return '等待结果...';
    }
  };

  const getResultColor = (result: Result) => {
    switch (result) {
      case 'win': return 'bg-green-100 text-green-800 border-green-300';
      case 'lose': return 'bg-red-100 text-red-800 border-red-300';
      case 'draw': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'timeout': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const determineWinner = (player: Choice, ai: Choice): Result => {
    if (!player || !ai) return null;
    
    if (player === ai) return 'draw';
    
    if (
      (player === 'rock' && ai === 'scissors') ||
      (player === 'paper' && ai === 'rock') ||
      (player === 'scissors' && ai === 'paper')
    ) {
      return 'win';
    }
    
    return 'lose';
  };

  // 开始新回合
  const startRound = () => {
    setPlayerChoice(null);
    setAiChoice(null);
    setResult(null);
    setGameState('countdown');
    setCountdown(3);
  };

  // 处理超时
  const handleTimeout = () => {
    if (gameState === 'selecting') {
      setResult('timeout');
      setScores(prev => ({ ...prev, timeouts: prev.timeouts + 1 }));
      setGameHistory(prev => [{ player: null, ai: null, result: 'timeout' }, ...prev.slice(0, 9)]);
      setRound(round + 1);
      setGameState('showing');
    }
  };

  // 玩家选择
  const makeChoice = (choice: Choice) => {
    if (gameState !== 'selecting') return;
    
    setPlayerChoice(choice);
    
    // AI随机选择
    const aiChoices: Choice[] = ['rock', 'paper', 'scissors'];
    const aiChoice = aiChoices[Math.floor(Math.random() * aiChoices.length)] as Choice;
    setAiChoice(aiChoice);
    
    // 确定结果
    const gameResult = determineWinner(choice, aiChoice);
    setResult(gameResult);
    
    // 更新分数
    if (gameResult === 'win') {
      setScores(prev => ({ ...prev, player: prev.player + 1 }));
    } else if (gameResult === 'lose') {
      setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
    } else if (gameResult === 'draw') {
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
    
    // 添加到历史记录
    setGameHistory(prev => [{ player: choice, ai: aiChoice, result: gameResult }, ...prev.slice(0, 9)]);
    
    setRound(round + 1);
    setGameState('showing');
  };

  // 重置游戏
  const resetGame = () => {
    setPlayerChoice(null);
    setAiChoice(null);
    setResult(null);
    setScores({ player: 0, ai: 0, draws: 0, timeouts: 0 });
    setGameHistory([]);
    setGameState('waiting');
    setRound(1);
  };

  const getPlayerChoiceName = (choice: Choice) => {
    switch (choice) {
      case 'rock': return '石头';
      case 'paper': return '布';
      case 'scissors': return '剪刀';
      default: return '未选择';
    }
  };

  const getAIChoiceName = (choice: Choice) => {
    switch (choice) {
      case 'rock': return '石头';
      case 'paper': return '布';
      case 'scissors': return '剪刀';
      default: return '未选择';
    }
  };

  return (
    <>
      <SEOHead 
        title="AI石头剪刀布游戏 - 经典猜拳游戏 | WSNAIL.COM"
        description="与AI进行经典的石头剪刀布对决，体验3-2-1倒计时同步出拳的刺激。简单有趣的休闲游戏，随时随地享受竞技乐趣。"
        keywords="石头剪刀布,猜拳游戏,休闲游戏,AI对战,WSNAIL"
        url="https://wsnail.com/games/ai-rock-paper-scissors"
        canonical="https://wsnail.com/games/ai-rock-paper-scissors"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                AI石头剪刀布
              </CardTitle>
              
              {/* 分数板 */}
              <div className="flex flex-wrap justify-center gap-6 mb-6">
                <div className="flex items-center space-x-2">
                  <Hand className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">你: {scores.player}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">AI: {scores.ai}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold">平局: {scores.draws}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold">超时: {scores.timeouts}</span>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="flex items-center"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  重置游戏
                </Button>
                {gameState === 'waiting' && (
                  <Button
                    onClick={startRound}
                    className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    开始回合
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {/* 左右对立布局 */}
              <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
                {/* 玩家区域 - 左侧 */}
                <div className="flex-1 w-full max-w-md">
                  <div className="bg-blue-50 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4 text-center">玩家</h3>
                    <div className="flex flex-col items-center">
                      <div className="w-40 h-40 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-4 border-4 border-blue-300">
                        {playerChoice ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-blue-600"
                          >
                            {getChoiceIcon(playerChoice)}
                          </motion.div>
                        ) : (
                          <Zap className="w-16 h-16 text-blue-400" />
                        )}
                      </div>
                      <p className="font-semibold text-blue-800 text-lg">
                        {getPlayerChoiceName(playerChoice)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 对决中心区域 */}
                <div className="flex flex-col items-center justify-center">
                  {/* 开始按钮 */}
                  {gameState === 'waiting' && (
                    <Button
                      onClick={startRound}
                      className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-6 px-8 py-4 text-xl"
                    >
                      <Play className="w-6 h-6 mr-2" />
                      开始对决
                    </Button>
                  )}
                  
                  {/* 对决结果显示区 */}
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 mb-4 shadow-lg min-w-[200px] text-center">
                    {gameState === 'countdown' ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-block w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                      >
                        <span className="text-4xl font-bold text-white">{countdown}</span>
                      </motion.div>
                    ) : result ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`inline-block px-6 py-3 rounded-full border-2 ${getResultColor(result)}`}
                      >
                        <p className="text-lg font-bold">{getResultText(result)}</p>
                      </motion.div>
                    ) : gameState === 'selecting' ? (
                      <div className="inline-block px-6 py-3 rounded-full bg-blue-100 text-blue-800 border-2 border-blue-300">
                        <p className="text-lg font-bold">请出拳！</p>
                      </div>
                    ) : (
                      <div className="inline-block px-6 py-3 rounded-full bg-gray-100 text-gray-800 border-2 border-gray-300">
                        <p className="text-lg font-bold">等待开始</p>
                      </div>
                    )}
                  </div>
                  
                  {/* 回合信息 */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
                    <h4 className="font-semibold text-gray-900">第 {round} 回合</h4>
                    {gameState === 'selecting' && (
                      <p className="text-gray-600 text-sm mt-1">3-2-1倒计时结束，请快速出拳！</p>
                    )}
                  </div>
                </div>
                
                {/* AI区域 - 右侧 */}
                <div className="flex-1 w-full max-w-md">
                  <div className="bg-purple-50 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold text-purple-800 mb-4 text-center">AI</h3>
                    <div className="flex flex-col items-center">
                      <div className="w-40 h-40 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-4 border-4 border-purple-300">
                        {aiChoice ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-purple-600"
                          >
                            {getChoiceIcon(aiChoice)}
                          </motion.div>
                        ) : (
                          <Zap className="w-16 h-16 text-purple-400" />
                        )}
                      </div>
                      <p className="font-semibold text-purple-800 text-lg">
                        {getAIChoiceName(aiChoice)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 游戏说明（移动到下方） */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 text-center">游戏规则</h4>
                <div className="flex flex-wrap justify-center gap-4 text-gray-600 text-sm">
                  <span>• 石头胜剪刀</span>
                  <span>• 剪刀胜布</span>
                  <span>• 布胜石头</span>
                  <span>• 3秒内未出拳视为超时</span>
                </div>
              </div>
              
              {/* 选择按钮 - 紧凑布局 */}
              {gameState === 'selecting' && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">快速出拳！</h3>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-2xl mx-auto">
                    {choices.map((choice) => (
                      <motion.div
                        key={choice.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1"
                      >
                        <Button
                          onClick={() => makeChoice(choice.id as Choice)}
                          className={`w-full h-auto py-4 flex flex-col items-center justify-center bg-gradient-to-r ${choice.color} text-gray-800 hover:shadow-lg border-0`}
                        >
                          <div className="mb-1">
                            {choice.icon}
                          </div>
                          <span className="text-base font-semibold">{choice.name}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 游戏历史 */}
              {gameHistory.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">最近对局</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
                    {gameHistory.map((game, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg text-center ${
                          game.result === 'win' ? 'bg-green-100' :
                          game.result === 'lose' ? 'bg-red-100' :
                          game.result === 'draw' ? 'bg-yellow-100' :
                          'bg-orange-100'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs">你</span>
                          <span className="text-xs">AI</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>{getChoiceIcon(game.player)}</span>
                          <span>{getChoiceIcon(game.ai)}</span>
                        </div>
                        <div className={`text-xs font-semibold px-2 py-1 rounded ${
                          game.result === 'win' ? 'bg-green-500 text-white' :
                          game.result === 'lose' ? 'bg-red-500 text-white' :
                          game.result === 'draw' ? 'bg-yellow-500 text-white' :
                          'bg-orange-500 text-white'
                        }`}>
                          {game.result === 'win' ? '胜' : 
                           game.result === 'lose' ? '负' : 
                           game.result === 'draw' ? '平' : '超'}
                        </div>
                      </div>
                    ))}
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