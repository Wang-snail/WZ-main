import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCw, 
  Play, 
  Trophy, 
  Star,
  Brain,
  Zap,
  Circle,
  Disc,
  Target,
  Shuffle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOHead from '../../components/SEOHead';

type Player = 'black' | 'white' | null;
type Position = { row: number; col: number };

export default function ReversiGame() {
  const [board, setBoard] = useState<(Player | null)[][]>(Array(8).fill(null).map(() => Array(8).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [scores, setScores] = useState({ black: 2, white: 2 });
  const [gameStatus, setGameStatus] = useState<'setup' | 'playing' | 'gameOver'>('setup');
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<Position | null>(null);
  const [gameMessage, setGameMessage] = useState('点击开始游戏');

  // 初始化游戏
  const initializeGame = () => {
    const newBoard: (Player | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // 设置初始棋子
    newBoard[3][3] = 'white';
    newBoard[3][4] = 'black';
    newBoard[4][3] = 'black';
    newBoard[4][4] = 'white';
    
    setBoard(newBoard);
    setCurrentPlayer('black');
    setScores({ black: 2, white: 2 });
    setGameStatus('playing');
    setGameMessage('黑子先行，请放置棋子');
    setLastMove(null);
    calculateValidMoves(newBoard, 'black');
  };

  // 计算有效移动
  const calculateValidMoves = (boardState: (Player | null)[][], player: Player) => {
    const moves: Position[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(boardState, row, col, player)) {
          moves.push({ row, col });
        }
      }
    }
    
    setValidMoves(moves);
    return moves;
  };

  // 检查是否为有效移动
  const isValidMove = (boardState: (Player | null)[][], row: number, col: number, player: Player): boolean => {
    // 位置必须为空
    if (boardState[row][col] !== null) return false;
    
    // 检查8个方向
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dr, dc] of directions) {
      if (wouldFlip(boardState, row, col, dr, dc, player)) {
        return true;
      }
    }
    
    return false;
  };

  // 检查是否会翻转对方棋子
  const wouldFlip = (boardState: (Player | null)[][], row: number, col: number, dr: number, dc: number, player: Player): boolean => {
    let r = row + dr;
    let c = col + dc;
    let foundOpponent = false;
    
    // 沿着方向检查
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const cell = boardState[r][c];
      
      if (cell === null) {
        // 空位，不构成夹击
        return false;
      } else if (cell === player) {
        // 找到自己的棋子
        return foundOpponent; // 只有在找到对方棋子后才有效
      } else {
        // 对方棋子
        foundOpponent = true;
        r += dr;
        c += dc;
      }
    }
    
    return false;
  };

  // 执行移动
  const makeMove = (row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    if (!validMoves.some(move => move.row === row && move.col === col)) return;
    
    const newBoard = [...board.map(r => [...r])];
    newBoard[row][col] = currentPlayer;
    
    // 翻转被夹击的棋子
    flipPieces(newBoard, row, col, currentPlayer);
    
    setBoard(newBoard);
    setLastMove({ row, col });
    
    // 更新分数
    const newScores = calculateScores(newBoard);
    setScores(newScores);
    
    // 切换玩家
    const nextPlayer = currentPlayer === 'black' ? 'white' : 'black';
    
    // 检查下一个玩家是否有有效移动
    const nextMoves = calculateValidMoves(newBoard, nextPlayer);
    
    if (nextMoves.length > 0) {
      setCurrentPlayer(nextPlayer);
      setGameMessage(nextPlayer === 'black' ? '黑子回合' : '白子回合');
    } else {
      // 检查当前玩家是否还能移动
      const currentMoves = calculateValidMoves(newBoard, currentPlayer);
      if (currentMoves.length > 0) {
        setGameMessage(currentPlayer === 'black' ? '白子无路可走，黑子继续' : '黑子无路可走，白子继续');
      } else {
        // 游戏结束
        endGame(newScores);
      }
    }
  };

  // 翻转棋子
  const flipPieces = (boardState: (Player | null)[][], row: number, col: number, player: Player) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dr, dc] of directions) {
      if (wouldFlip(boardState, row, col, dr, dc, player)) {
        // 翻转这条线上的棋子
        let r = row + dr;
        let c = col + dc;
        
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
          const cell = boardState[r][c];
          
          if (cell === player) {
            // 找到自己的棋子，停止翻转
            break;
          } else if (cell !== null) {
            // 翻转对方棋子
            boardState[r][c] = player;
            r += dr;
            c += dc;
          } else {
            // 空位，不应该发生
            break;
          }
        }
      }
    }
  };

  // 计算分数
  const calculateScores = (boardState: (Player | null)[][]): { black: number; white: number } => {
    let black = 0;
    let white = 0;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (boardState[row][col] === 'black') black++;
        else if (boardState[row][col] === 'white') white++;
      }
    }
    
    return { black, white };
  };

  // 结束游戏
  const endGame = (finalScores: { black: number; white: number }) => {
    setGameStatus('gameOver');
    
    if (finalScores.black > finalScores.white) {
      setGameMessage(`黑子获胜！${finalScores.black}:${finalScores.white}`);
    } else if (finalScores.white > finalScores.black) {
      setGameMessage(`白子获胜！${finalScores.white}:${finalScores.black}`);
    } else {
      setGameMessage(`平局！${finalScores.black}:${finalScores.white}`);
    }
  };

  // 重置游戏
  const resetGame = () => {
    setGameStatus('setup');
    setGameMessage('点击开始游戏');
    setValidMoves([]);
    setLastMove(null);
  };

  // 开始游戏
  const startGame = () => {
    initializeGame();
  };

  // 检查位置是否是有效移动
  const isValidPosition = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  if (gameStatus === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                反转棋（黑白棋）
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-800 to-black rounded-full flex items-center justify-center">
                  <Disc className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <p className="text-gray-600 text-lg mb-8">
                经典的策略棋盘游戏，通过夹击对方棋子来翻转它们，最终棋子多的一方获胜
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2 flex items-center">
                    <Circle className="w-5 h-5 mr-2" />
                    黑子先行
                  </h3>
                  <p className="text-gray-300 text-sm">通过夹击翻转白子</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Circle className="w-5 h-5 mr-2 text-gray-800" />
                    白子后行
                  </h3>
                  <p className="text-gray-600 text-sm">通过夹击翻转黑子</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">游戏规则</h3>
                <ul className="space-y-2 text-gray-600 text-left">
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>黑子先行，双方轮流放置棋子</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>棋子必须放置在能夹击对方棋子的位置</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>被夹击的对方棋子会立即翻转为己方颜色</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>无法移动时跳过回合，双方都无法移动时游戏结束</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>棋子多的一方获胜</span>
                  </li>
                </ul>
              </div>
              
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-gray-800 to-black text-white hover:shadow-lg py-3 px-8 text-lg"
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
        title="反转棋游戏 - 经典黑白棋对战 | WSNAIL.COM"
        description="挑战经典的反转棋（黑白棋/奥赛罗）游戏，在8x8棋盘上通过策略夹击对方棋子。考验你的战术思维和前瞻性。"
        keywords="反转棋,黑白棋,奥赛罗,策略游戏,棋盘游戏,WSNAIL"
        url="https://wsnail.com/games/reversi"
        canonical="https://wsnail.com/games/reversi"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                反转棋（黑白棋）
              </CardTitle>
              
              <div className="flex flex-wrap justify-center gap-6 mb-4">
                <div className="flex items-center space-x-2">
                  <Circle className="w-5 h-5 text-black" />
                  <span className="font-semibold">黑子: {scores.black}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Circle className="w-5 h-5 text-gray-300" />
                  <span className="font-semibold">白子: {scores.white}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">有效移动: {validMoves.length}</span>
                </div>
              </div>
              
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                <Star className="w-5 h-5 mr-2" />
                <span className="font-semibold">{gameMessage}</span>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* 游戏棋盘 */}
              <div className="flex justify-center mb-8">
                <div className="bg-green-700 p-4 rounded-2xl shadow-lg">
                  <div className="grid grid-cols-8 gap-1 bg-green-800 p-2 rounded-xl">
                    {board.map((row, rowIndex) => (
                      row.map((piece, colIndex) => {
                        const isValid = isValidPosition(rowIndex, colIndex);
                        const isLastMove = lastMove?.row === rowIndex && lastMove?.col === colIndex;
                        
                        return (
                          <motion.div
                            key={`${rowIndex}-${colIndex}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                              w-10 h-10 flex items-center justify-center rounded cursor-pointer transition-all duration-200
                              ${isValid ? 'bg-green-600 ring-2 ring-yellow-400' : 'bg-green-500'}
                              ${isLastMove ? 'ring-2 ring-blue-400' : ''}
                            `}
                            onClick={() => makeMove(rowIndex, colIndex)}
                          >
                            {piece ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`
                                  w-8 h-8 rounded-full shadow-md
                                  ${piece === 'black' ? 'bg-gray-900' : 'bg-white border border-gray-200'}
                                `}
                              />
                            ) : isValid ? (
                              <div className="w-4 h-4 rounded-full bg-yellow-300 opacity-70"></div>
                            ) : null}
                          </motion.div>
                        );
                      })
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 游戏控制 */}
              <div className="flex justify-center gap-4 mb-8">
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="flex items-center"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  重置游戏
                </Button>
                
                {gameStatus === 'gameOver' && (
                  <Button
                    onClick={startGame}
                    className="bg-gradient-to-r from-green-600 to-green-800 text-white hover:shadow-lg flex items-center"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    再来一局
                  </Button>
                )}
              </div>
              
              {/* 游戏说明 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">策略提示</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">开局策略</h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• 控制棋盘中心区域</li>
                      <li>• 避免过早占据角落</li>
                      <li>• 保持棋子的灵活性</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">中后期策略</h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• 争取占据棋盘边缘</li>
                      <li>• 限制对方的有效移动</li>
                      <li>• 为终局做准备</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}