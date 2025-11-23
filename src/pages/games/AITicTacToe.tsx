import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  Play, 
  Trophy, 
  Star,
  Zap,
  Bot,
  User,
  Users,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import SEOHead from '../../components/common/SEOHead';

interface BoardState {
  squares: (string | null)[];
  isXNext: boolean;
  winner: string | null;
  isDraw: boolean;
}

type GameMode = 'pve' | 'pvp'; // pve: 人机对战, pvp: 人人对战

export default function AITicTacToe() {
  const [board, setBoard] = useState<BoardState>({
    squares: Array(9).fill(null),
    isXNext: true,
    winner: null,
    isDraw: false
  });
  const [gameMode, setGameMode] = useState<GameMode>('pve'); // 默认人机对战
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameStats, setGameStats] = useState({
    playerWins: 0,
    aiWins: 0,
    draws: 0
  });
  const [gameMessage, setGameMessage] = useState('你的回合');

  // 计算获胜者
  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // 行
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // 列
      [0, 4, 8], [2, 4, 6] // 对角线
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    
    return null;
  };

  // 检查是否平局
  const checkDraw = (squares: (string | null)[]) => {
    return squares.every(square => square !== null) && !calculateWinner(squares);
  };

  // AI移动算法
  const getAIMove = (squares: (string | null)[], difficulty: string) => {
    const availableMoves = squares
      .map((square, index) => square === null ? index : null)
      .filter(index => index !== null) as number[];

    if (availableMoves.length === 0) return null;

    switch (difficulty) {
      case 'easy':
        // 简单难度：随机移动
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      
      case 'medium':
        // 中等难度：有一定概率选择最佳移动
        if (Math.random() > 0.3) {
          return getBestMove(squares);
        } else {
          return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
      
      case 'hard':
        // 困难难度：总是选择最佳移动
        return getBestMove(squares);
      
      default:
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
  };

  // 获取最佳移动（迷你最大算法简化版）
  const getBestMove = (squares: (string | null)[]) => {
    // 检查AI是否能获胜
    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === null) {
        const newSquares = [...squares];
        newSquares[i] = 'O';
        if (calculateWinner(newSquares) === 'O') {
          return i;
        }
      }
    }
    
    // 阻止玩家获胜
    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === null) {
        const newSquares = [...squares];
        newSquares[i] = 'X';
        if (calculateWinner(newSquares) === 'X') {
          return i;
        }
      }
    }
    
    // 优先选择中心
    if (squares[4] === null) {
      return 4;
    }
    
    // 选择角落
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(index => squares[index] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // 随机选择剩余位置
    const availableMoves = squares
      .map((square, index) => square === null ? index : null)
      .filter(index => index !== null) as number[];
    
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  // 处理玩家点击
  const handleClick = (index: number) => {
    // 如果游戏结束或格子已被占用，不处理
    if (board.winner || board.isDraw || board.squares[index]) {
      return;
    }

    // 玩家移动
    const newSquares = [...board.squares];
    newSquares[index] = board.isXNext ? 'X' : 'O';
    
    const winner = calculateWinner(newSquares);
    const isDraw = checkDraw(newSquares);
    
    // 更新游戏状态
    setBoard({
      squares: newSquares,
      isXNext: !board.isXNext,
      winner,
      isDraw
    });
    
    // 检查游戏结果
    if (winner) {
      if (gameMode === 'pve') {
        if (winner === 'X') {
          setGameMessage('恭喜你获胜！');
          setGameStats(prev => ({ ...prev, playerWins: prev.playerWins + 1 }));
        } else {
          setGameMessage('AI获胜！');
          setGameStats(prev => ({ ...prev, aiWins: prev.aiWins + 1 }));
        }
      } else {
        if (winner === 'X') {
          setGameMessage('玩家X获胜！');
          setGameStats(prev => ({ ...prev, playerWins: prev.playerWins + 1 }));
        } else {
          setGameMessage('玩家O获胜！');
          setGameStats(prev => ({ ...prev, aiWins: prev.aiWins + 1 }));
        }
      }
      return;
    }
    
    if (isDraw) {
      setGameMessage('平局！');
      setGameStats(prev => ({ ...prev, draws: prev.draws + 1 }));
      return;
    }
    
    // 根据游戏模式处理下一步
    if (gameMode === 'pve' && !board.isXNext) {
      // 人机模式且轮到AI移动
      setGameMessage('AI思考中...');
      
      // AI移动（延迟以增加真实感）
      setTimeout(() => {
        const aiMove = getAIMove(newSquares, difficulty);
        if (aiMove !== null) {
          const aiSquares = [...newSquares];
          aiSquares[aiMove] = 'O';
          
          const aiWinner = calculateWinner(aiSquares);
          const aiIsDraw = checkDraw(aiSquares);
          
          setBoard({
            squares: aiSquares,
            isXNext: true,
            winner: aiWinner,
            isDraw: aiIsDraw
          });
          
          if (aiWinner) {
            setGameMessage('AI获胜！');
            setGameStats(prev => ({ ...prev, aiWins: prev.aiWins + 1 }));
          } else if (aiIsDraw) {
            setGameMessage('平局！');
            setGameStats(prev => ({ ...prev, draws: prev.draws + 1 }));
          } else {
            setGameMessage('你的回合');
          }
        }
      }, 800);
    } else {
      // 人人模式或玩家移动
      setGameMessage(board.isXNext ? '玩家X的回合' : '玩家O的回合');
    }
  };

  // AI自动移动（用于人机模式）
  useEffect(() => {
    return () => {}; // 清理函数
  }, []);

  // 重新开始游戏
  const resetGame = () => {
    setBoard({
      squares: Array(9).fill(null),
      isXNext: true,
      winner: null,
      isDraw: false
    });
    setGameMessage('你的回合');
  };

  // 渲染格子
  const renderSquare = (index: number) => {
    return (
      <motion.button
        whileHover={{ scale: board.squares[index] ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-24 h-24 bg-white border-2 rounded-xl flex items-center justify-center text-4xl font-bold shadow-md transition-all duration-200 ${
          board.squares[index] === 'X' 
            ? 'text-blue-600 border-blue-300' 
            : board.squares[index] === 'O'
            ? 'text-red-600 border-red-300'
            : 'text-gray-400 border-gray-200 hover:border-blue-300 hover:text-blue-400'
        }`}
        onClick={() => handleClick(index)}
        disabled={!!board.winner || board.isDraw || !!board.squares[index]}
      >
        {board.squares[index] === 'X' ? (
          <User className="w-12 h-12" />
        ) : board.squares[index] === 'O' ? (
          <Bot className="w-12 h-12" />
        ) : null}
      </motion.button>
    );
  };

  return (
    <>
      <SEOHead 
        title="AI井字棋游戏 - 与人工智能对战 | WSNAIL.COM"
        description="挑战不同难度的AI对手，在经典井字棋游戏中与人工智能一较高下。体验AI策略思维，享受智力对战的乐趣。"
        keywords="AI井字棋,人工智能游戏,策略对战,经典游戏,WSNAIL"
        url="https://wsnail.com/games/ai-tic-tac-toe"
        canonical="https://wsnail.com/games/ai-tic-tac-toe"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                AI井字棋
              </CardTitle>
              
              <div className="flex flex-wrap justify-center gap-6 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">玩家X: {gameStats.playerWins}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {gameMode === 'pve' ? (
                    <>
                      <Bot className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold">AI: {gameStats.aiWins}</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 text-red-600" />
                      <span className="font-semibold">玩家O: {gameStats.aiWins}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold">平局: {gameStats.draws}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {gameMode === 'pve' ? (
                      <>
                        <Bot className="w-5 h-5 text-gray-600 mr-1" />
                        <span className="font-semibold">人机</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 text-gray-600 mr-1" />
                        <span className="font-semibold">人人</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    难度选择
                  </label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                      <Button
                        key={level}
                        variant={difficulty === level ? 'default' : 'outline'}
                        onClick={() => setDifficulty(level)}
                        className="capitalize"
                      >
                        {level === 'easy' ? '简单' : level === 'medium' ? '中等' : '困难'}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-end">
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    className="flex items-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    重新开始
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="text-center">
              {/* 游戏状态消息 */}
              <div className="mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                  <Star className="w-5 h-5 mr-2" />
                  <span className="font-semibold">{gameMessage}</span>
                </div>
              </div>
              
              {/* 游戏板 */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-4 rounded-2xl">
                  <div className="grid grid-cols-3 gap-2">
                    {Array(9).fill(null).map((_, index) => (
                      <div key={index} className="p-1">
                        {renderSquare(index)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 游戏结果 */}
              {(board.winner || board.isDraw) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                    <CardTitle className="text-2xl mb-2 flex items-center justify-center">
                      {board.winner === 'X' ? (
                        <>
                          <User className="w-8 h-8 mr-2" />
                          {gameMode === 'pve' ? '恭喜获胜！' : '玩家X获胜！'}
                        </>
                      ) : board.winner === 'O' ? (
                        <>
                          {gameMode === 'pve' ? (
                            <Bot className="w-8 h-8 mr-2" />
                          ) : (
                            <User className="w-8 h-8 mr-2" />
                          )}
                          {gameMode === 'pve' ? 'AI获胜！' : '玩家O获胜！'}
                        </>
                      ) : (
                        <>
                          <Trophy className="w-8 h-8 mr-2" />
                          平局！
                        </>
                      )}
                    </CardTitle>
                    <p className="text-blue-100">
                      {board.winner === 'X' 
                        ? (gameMode === 'pve' ? '你成功击败了AI对手！' : '玩家X赢得了比赛！')
                        : board.winner === 'O' 
                        ? (gameMode === 'pve' ? 'AI展现了强大的实力！' : '玩家O赢得了比赛！')
                        : '势均力敌的精彩对局！'}
                    </p>
                  </Card>
                </motion.div>
              )}
              
              {/* 游戏说明 */}
              <div className="bg-gray-50 rounded-lg p-6 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">游戏规则</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {gameMode === 'pve' ? (
                        <>玩家使用 <User className="w-4 h-4 inline text-blue-600" /> 符号，AI使用 <Bot className="w-4 h-4 inline text-red-600" /> 符号</>
                      ) : (
                        <>玩家X使用 <User className="w-4 h-4 inline text-blue-600" /> 符号，玩家O使用 <User className="w-4 h-4 inline text-red-600" /> 符号</>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>三人连线（横、竖、斜）即可获胜</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {gameMode === 'pve' 
                        ? '选择不同难度挑战AI：简单（随机移动）、中等（混合策略）、困难（最优策略）' 
                        : '两位玩家轮流落子，展现策略对决'}
                    </span>
                  </li>
                </ul>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => setGameMode(gameMode === 'pve' ? 'pvp' : 'pve')}
                    variant="outline"
                    className="flex items-center mx-auto"
                  >
                    {gameMode === 'pve' ? (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        切换到人人对战模式
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 mr-2" />
                        切换到人机对战模式
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}