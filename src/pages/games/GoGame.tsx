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
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOHead from '../../components/SEOHead';

type Player = 'black' | 'white' | null;
type Position = { row: number; col: number };

export default function GoGame() {
  const [board, setBoard] = useState<(Player | null)[][]>(Array(19).fill(null).map(() => Array(19).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [gameStatus, setGameStatus] = useState<'setup' | 'playing' | 'gameOver'>('setup');
  const [scores, setScores] = useState({ black: 0, white: 0, blackCaptured: 0, whiteCaptured: 0 });
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([{ row: 9, col: 9 }, { row: 9, col: 10 }, { row: 10, col: 9 }, { row: 10, col: 10 }]);
  const [gameMessage, setGameMessage] = useState('点击开始游戏');
  const [moveHistory, setMoveHistory] = useState<Position[]>([]);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [koPosition, setKoPosition] = useState<Position | null>(null); // 劫争位置

  // 初始化游戏
  const initializeGame = () => {
    const newBoard: (Player | null)[][] = Array(19).fill(null).map(() => Array(19).fill(null));
    setBoard(newBoard);
    setCurrentPlayer('black');
    setScores({ black: 0, white: 0, blackCaptured: 0, whiteCaptured: 0 });
    setGameStatus('playing');
    setGameMessage('黑子先行，请落子');
    setSelectedPosition(null);
    setMoveHistory([]);
    setKoPosition(null);
  };

  // 检查是否为有效移动
  const isValidMove = (row: number, col: number): boolean => {
    // 位置必须为空
    if (board[row][col] !== null) return false;
    
    // 不能在劫争位置落子
    if (koPosition && koPosition.row === row && koPosition.col === col) return false;
    
    return true;
  };

  // 检查是否有气
  const hasLiberty = (boardState: (Player | null)[][], row: number, col: number, visited: boolean[][]): boolean => {
    const player = boardState[row][col];
    if (!player) return false;
    
    // 标记为已访问
    visited[row][col] = true;
    
    // 检查四个方向
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      // 检查边界
      if (newRow >= 0 && newRow < 19 && newCol >= 0 && newCol < 19) {
        const neighbor = boardState[newRow][newCol];
        
        // 空位表示有气
        if (neighbor === null) {
          return true;
        }
        // 同色棋子且未访问，递归检查
        else if (neighbor === player && !visited[newRow][newCol]) {
          if (hasLiberty(boardState, newRow, newCol, visited)) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // 获取相连的棋子组
  const getConnectedGroup = (boardState: (Player | null)[][], row: number, col: number, group: Position[], visited: boolean[][]): void => {
    const player = boardState[row][col];
    if (!player) return;
    
    // 添加当前位置到组
    group.push({ row, col });
    visited[row][col] = true;
    
    // 检查四个方向
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      // 检查边界
      if (newRow >= 0 && newRow < 19 && newCol >= 0 && newCol < 19) {
        const neighbor = boardState[newRow][newCol];
        
        // 同色棋子且未访问，递归添加到组
        if (neighbor === player && !visited[newRow][newCol]) {
          getConnectedGroup(boardState, newRow, newCol, group, visited);
        }
      }
    }
  };

  // 检查并移除无气的棋子
  const removeDeadStones = (boardState: (Player | null)[][], player: Player): { newBoard: (Player | null)[][], captured: number } => {
    const newBoard = [...boardState.map(row => [...row])];
    let captured = 0;
    const visited = Array(19).fill(null).map(() => Array(19).fill(false));
    
    // 检查对方棋子
    const opponent = player === 'black' ? 'white' : 'black';
    
    for (let row = 0; row < 19; row++) {
      for (let col = 0; col < 19; col++) {
        if (newBoard[row][col] === opponent && !visited[row][col]) {
          // 获取相连的棋子组
          const group: Position[] = [];
          const groupVisited = Array(19).fill(null).map(() => Array(19).fill(false));
          getConnectedGroup(newBoard, row, col, group, groupVisited);
          
          // 检查整个组是否有气
          let hasLiberty = false;
          const groupCheckVisited = Array(19).fill(null).map(() => Array(19).fill(false));
          
          for (const pos of group) {
            if (hasLiberty(newBoard, pos.row, pos.col, groupCheckVisited)) {
              hasLiberty = true;
              break;
            }
          }
          
          // 如果无气，移除整组棋子
          if (!hasLiberty) {
            for (const pos of group) {
              newBoard[pos.row][pos.col] = null;
              captured++;
            }
          }
        }
      }
    }
    
    return { newBoard, captured };
  };

  // 处理落子
  const placeStone = (row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    if (!isValidMove(row, col)) return;
    
    // 创建新棋盘
    const newBoard = [...board.map(r => [...r])];
    newBoard[row][col] = currentPlayer;
    
    // 检查并移除对方无气的棋子
    const { newBoard: boardAfterCapture, captured } = removeDeadStones(newBoard, currentPlayer);
    
    // 检查自己是否无气（自杀）
    const suicideVisited = Array(19).fill(null).map(() => Array(19).fill(false));
    if (!hasLiberty(boardAfterCapture, row, col, suicideVisited)) {
      setGameMessage('不能自杀，请选择其他位置');
      return;
    }
    
    setBoard(boardAfterCapture);
    
    // 更新分数
    if (currentPlayer === 'black') {
      setScores(prev => ({ ...prev, whiteCaptured: prev.whiteCaptured + captured }));
    } else {
      setScores(prev => ({ ...prev, blackCaptured: prev.blackCaptured + captured }));
    }
    
    // 添加到历史记录
    setMoveHistory(prev => [...prev, { row, col }]);
    
    // 切换玩家
    const nextPlayer = currentPlayer === 'black' ? 'white' : 'black';
    setCurrentPlayer(nextPlayer);
    setGameMessage(nextPlayer === 'black' ? '黑子回合' : '白子回合');
    
    // 清除选中位置
    setSelectedPosition(null);
  };

  // 计算得分（简化版）
  const calculateScore = () => {
    let blackTerritory = 0;
    let whiteTerritory = 0;
    
    // 简单计算：棋子数 + 被捕获数
    let blackStones = 0;
    let whiteStones = 0;
    
    for (let row = 0; row < 19; row++) {
      for (let col = 0; col < 19; col++) {
        if (board[row][col] === 'black') blackStones++;
        else if (board[row][col] === 'white') whiteStones++;
      }
    }
    
    const blackScore = blackStones + scores.blackCaptured;
    const whiteScore = whiteStones + scores.whiteCaptured;
    
    setScores(prev => ({ ...prev, black: blackScore, white: whiteScore }));
    
    return { black: blackScore, white: whiteScore };
  };

  // 重置游戏
  const resetGame = () => {
    setGameStatus('setup');
    setGameMessage('点击开始游戏');
    setSelectedPosition(null);
    setMoveHistory([]);
    setKoPosition(null);
  };

  // 开始游戏
  const startGame = () => {
    initializeGame();
  };

  // 认输
  const resign = () => {
    setGameStatus('gameOver');
    const winner = currentPlayer === 'black' ? 'white' : 'black';
    setGameMessage(`${currentPlayer === 'black' ? '黑方' : '白方'}认输，${winner === 'black' ? '黑方' : '白方'}获胜！`);
  };

  // 暂停/继续游戏
  const togglePause = () => {
    if (gameStatus === 'playing') {
      setGameStatus('setup');
      setGameMessage('游戏已暂停');
    } else if (gameStatus === 'setup') {
      setGameStatus('playing');
      setGameMessage(currentPlayer === 'black' ? '黑子回合' : '白子回合');
    }
  };

  if (gameStatus === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                围棋游戏
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-800 to-black rounded-full flex items-center justify-center">
                  <Disc className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <p className="text-gray-600 text-lg mb-8">
                千年传承的策略棋盘游戏，黑白双方在19×19棋盘上展开智慧较量
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2 flex items-center">
                    <Circle className="w-5 h-5 mr-2" />
                    黑子先行
                  </h3>
                  <p className="text-gray-300 text-sm">力争更多领地</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Circle className="w-5 h-5 mr-2 text-gray-800" />
                    白子后行
                  </h3>
                  <p className="text-gray-600 text-sm">围剿对方势力</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">游戏规则</h3>
                <ul className="space-y-2 text-gray-600 text-left">
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>黑子先行，双方轮流在交叉点落子</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>棋子落下后不能移动</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>没有气的棋子会被提掉</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>不能自杀（落下后立即无气）</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>不能立即回提（劫争规则）</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>双方确认终局后计算领地，多者获胜</span>
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
        title="围棋游戏 - 经典19×19策略棋盘游戏 | WSNAIL.COM"
        description="体验千年传承的围棋游戏，在19×19棋盘上展开黑白双方的智慧较量。学习围棋规则，提升棋艺水平。"
        keywords="围棋,策略游戏,棋盘游戏,经典游戏,WSNAIL"
        url="https://wsnail.com/games/go-game"
        canonical="https://wsnail.com/games/go-game"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                围棋游戏
              </CardTitle>
              
              <div className="flex flex-wrap justify-center gap-6 mb-4">
                <div className="flex items-center space-x-2">
                  <Circle className="w-5 h-5 text-black" />
                  <span className="font-semibold">黑子: {scores.black} (+{scores.blackCaptured})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Circle className="w-5 h-5 text-gray-300" />
                  <span className="font-semibold">白子: {scores.white} (+{scores.whiteCaptured})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">手数: {moveHistory.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">
                    {currentPlayer === 'black' ? '黑方回合' : '白方回合'}
                  </span>
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
                <div className="bg-amber-200 p-6 rounded-2xl shadow-lg">
                  <div className="grid grid-cols-19 gap-0 bg-amber-700 p-2 rounded-xl relative">
                    {/* 棋盘线 */}
                    {Array(19).fill(null).map((_, rowIndex) => (
                      <div key={`row-${rowIndex}`} className="flex">
                        {Array(19).fill(null).map((_, colIndex) => {
                          const isSelected = selectedPosition?.row === rowIndex && selectedPosition?.col === colIndex;
                          const isValid = isValidMove(rowIndex, colIndex);
                          const hasStone = board[rowIndex][colIndex] !== null;
                          
                          // 特殊点位（星位）
                          const isStarPoint = 
                            (rowIndex === 3 && colIndex === 3) ||
                            (rowIndex === 3 && colIndex === 9) ||
                            (rowIndex === 3 && colIndex === 15) ||
                            (rowIndex === 9 && colIndex === 3) ||
                            (rowIndex === 9 && colIndex === 9) ||
                            (rowIndex === 9 && colIndex === 15) ||
                            (rowIndex === 15 && colIndex === 3) ||
                            (rowIndex === 15 && colIndex === 9) ||
                            (rowIndex === 15 && colIndex === 15);
                          
                          return (
                            <motion.div
                              key={`${rowIndex}-${colIndex}`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`
                                w-6 h-6 flex items-center justify-center relative cursor-pointer
                                ${rowIndex < 18 ? 'border-b border-amber-800' : ''}
                                ${colIndex < 18 ? 'border-r border-amber-800' : ''}
                              `}
                              onClick={() => placeStone(rowIndex, colIndex)}
                            >
                              {/* 棋子 */}
                              {hasStone ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`
                                    w-5 h-5 rounded-full absolute z-10 shadow-md
                                    ${board[rowIndex][colIndex] === 'black' ? 'bg-gray-900' : 'bg-white border border-gray-200'}
                                  `}
                                />
                              ) : isValid ? (
                                <div className="w-3 h-3 rounded-full bg-green-500 opacity-70 absolute"></div>
                              ) : null}
                              
                              {/* 星位点 */}
                              {isStarPoint && !hasStone && (
                                <div className="w-2 h-2 rounded-full bg-amber-900 absolute"></div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 游戏控制 */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="flex items-center"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  重置游戏
                </Button>
                
                <Button
                  onClick={togglePause}
                  variant="outline"
                  className="flex items-center"
                >
                  {gameStatus === 'playing' ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      暂停
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      继续
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={resign}
                  variant="outline"
                  className="flex items-center"
                >
                  <Target className="w-4 h-4 mr-2" />
                  认输
                </Button>
                
                {gameStatus === 'gameOver' && (
                  <Button
                    onClick={startGame}
                    className="bg-gradient-to-r from-green-600 to-green-800 text-white hover:shadow-lg flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    再来一局
                  </Button>
                )}
                
                <Button
                  onClick={() => setShowCoordinates(!showCoordinates)}
                  variant="outline"
                  className="flex items-center"
                >
                  {showCoordinates ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      隐藏坐标
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      显示坐标
                    </>
                  )}
                </Button>
              </div>
              
              {/* 游戏说明 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">围棋基础</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">基本规则</h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• 黑子先行，轮流落子</li>
                      <li>• 棋子落下后不能移动</li>
                      <li>• 没有气的棋子会被提掉</li>
                      <li>• 不能自杀</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">胜负判定</h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• 计算各自围成的领地</li>
                      <li>• 棋子数 + 被提子数 = 领地数</li>
                      <li>• 领地多的一方获胜</li>
                      <li>• 黑方贴目（补偿白方）</li>
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