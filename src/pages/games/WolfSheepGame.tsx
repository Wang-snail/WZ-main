import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCw, 
  Play, 
  Trophy, 
  Star,
  Brain,
  Zap,
  Dog,
  Move,
  Target,
  Users,
  Bot
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOHead from '../../components/SEOHead';

type PieceType = 'wolf' | 'sheep' | null;
type Position = { row: number; col: number };
type GamePhase = 'setup' | 'playing' | 'wolfTurn' | 'sheepTurn' | 'gameOver';
type GameMode = 'pve' | 'pvp';

export default function WolfSheepGame() {
  const [board, setBoard] = useState<(PieceType | null)[][]>(Array(7).fill(null).map(() => Array(7).fill(null)));
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [gameMode, setGameMode] = useState<GameMode>('pve'); // 默认人机对战
  const [scores, setScores] = useState({ wolf: 0, sheep: 0 });
  const [moveCount, setMoveCount] = useState(0);
  const [gameMessage, setGameMessage] = useState('点击开始游戏');
  const [capturedSheep, setCapturedSheep] = useState(0);

  // 初始化游戏
  const initializeGame = () => {
    const newBoard: (PieceType | null)[][] = Array(7).fill(null).map(() => Array(7).fill(null));
    
    // 放置狼（通常在中间）
    newBoard[3][3] = 'wolf';
    
    // 放置羊（通常在顶部几行）
    for (let i = 0; i < 4; i++) {
      newBoard[0][i * 2] = 'sheep';
    }
    
    setBoard(newBoard);
    setGamePhase('sheepTurn');
    setGameMessage('羊方先行，请移动一只羊');
    setCapturedSheep(0);
    setMoveCount(0);
    setSelectedPiece(null);
    setValidMoves([]);
  };

  // 获取有效的移动位置
  const getValidMoves = (row: number, col: number, piece: PieceType): Position[] => {
    if (!piece) return [];
    
    const moves: Position[] = [];
    const directions = [
      { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, 
      { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
      { dr: -1, dc: -1 }, { dr: -1, dc: 1 },
      { dr: 1, dc: -1 }, { dr: 1, dc: 1 }
    ];
    
    for (const dir of directions) {
      const newRow = row + dir.dr;
      const newCol = col + dir.dc;
      
      // 检查边界
      if (newRow >= 0 && newRow < 7 && newCol >= 0 && newCol < 7) {
        // 狼可以移动到空位或吃掉羊
        if (piece === 'wolf') {
          if (board[newRow][newCol] === null || board[newRow][newCol] === 'sheep') {
            moves.push({ row: newRow, col: newCol });
          }
        }
        // 羊只能移动到空位
        else if (piece === 'sheep' && board[newRow][newCol] === null) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }
    
    return moves;
  };

  // 处理棋子点击
  const handlePieceClick = (row: number, col: number) => {
    // 如果游戏未开始，不处理
    if (gamePhase === 'setup' || gamePhase === 'gameOver') return;
    
    const piece = board[row][col];
    
    // 如果点击的是当前玩家的棋子
    if ((gamePhase === 'wolfTurn' && piece === 'wolf') || 
        (gamePhase === 'sheepTurn' && piece === 'sheep')) {
      setSelectedPiece({ row, col });
      const moves = getValidMoves(row, col, piece);
      setValidMoves(moves);
      setGameMessage(piece === 'wolf' ? '请选择狼的移动位置' : '请选择羊的移动位置');
    }
    // 如果已选择棋子，且点击的是有效移动位置
    else if (selectedPiece && validMoves.some(move => move.row === row && move.col === col)) {
      movePiece(selectedPiece.row, selectedPiece.col, row, col);
    }
  };

  // 移动棋子
  const movePiece = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const newBoard = [...board.map(row => [...row])];
    const piece = newBoard[fromRow][fromCol];
    
    // 如果是狼吃羊
    if (piece === 'wolf' && newBoard[toRow][toCol] === 'sheep') {
      setCapturedSheep(prev => prev + 1);
      setGameMessage('狼吃掉了一只羊！');
    }
    
    // 移动棋子
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;
    setBoard(newBoard);
    
    // 更新游戏状态
    const newMoveCount = moveCount + 1;
    setMoveCount(newMoveCount);
    
    // 检查胜利条件
    if (capturedSheep >= 2) {
      // 狼胜利
      setGamePhase('gameOver');
      setGameMessage('狼方获胜！吃掉了足够的羊');
      setScores(prev => ({ ...prev, wolf: prev.wolf + 1 }));
      return;
    }
    
    // 检查羊是否到达底部
    let sheepReachedBottom = false;
    for (let col = 0; col < 7; col++) {
      if (newBoard[6][col] === 'sheep') {
        sheepReachedBottom = true;
        break;
      }
    }
    
    if (sheepReachedBottom) {
      // 羊胜利
      setGamePhase('gameOver');
      setGameMessage('羊方获胜！成功到达了底部');
      setScores(prev => ({ ...prev, sheep: prev.sheep + 1 }));
      return;
    }
    
    // 切换回合
    if (gamePhase === 'wolfTurn') {
      setGamePhase('sheepTurn');
      setGameMessage('羊方回合，请移动一只羊');
    } else {
      setGamePhase('wolfTurn');
      setGameMessage('狼方回合，请移动狼');
    }
    
    setSelectedPiece(null);
    setValidMoves([]);
  };

  // 检查是否可以移动
  const canMove = (piece: PieceType): boolean => {
    if (!piece) return false;
    
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (board[row][col] === piece) {
          const moves = getValidMoves(row, col, piece);
          if (moves.length > 0) return true;
        }
      }
    }
    return false;
  };

  // 重置游戏
  const resetGame = () => {
    setGamePhase('setup');
    setGameMessage('点击开始游戏');
    setSelectedPiece(null);
    setValidMoves([]);
  };

  // 开始游戏
  const startGame = () => {
    initializeGame();
  };

  // 检查位置是否是有效移动
  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  // 获取棋子图标
  const getPieceIcon = (piece: PieceType) => {
    if (piece === 'wolf') {
      return <Dog className="w-6 h-6 text-red-600" />;
    } else if (piece === 'sheep') {
      return <Dog className="w-6 h-6 text-blue-600" />;
    }
    return null;
  };

  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                狼吃羊棋
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Dog className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <p className="text-gray-600 text-lg mb-8">
                经典的策略棋盘游戏，狼的目标是吃掉羊，羊的目标是到达底部
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                    <Dog className="w-5 h-5 mr-2" />
                    狼方
                  </h3>
                  <p className="text-red-700 text-sm">吃掉2只羊获胜</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Dog className="w-5 h-5 mr-2" />
                    羊方
                  </h3>
                  <p className="text-blue-700 text-sm">到达底部获胜</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">游戏规则</h3>
                <ul className="space-y-2 text-gray-600 text-left">
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>羊方先行，轮流移动</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>狼可以斜走和直走，可以吃掉相邻的羊</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>羊只能直走，不能后退，也不能吃狼</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>狼吃掉2只羊获胜，羊到达底部获胜</span>
                  </li>
                </ul>
              </div>
              
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-red-500 to-orange-600 text-white hover:shadow-lg py-3 px-8 text-lg"
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
        title="狼吃羊棋游戏 - 经典策略棋盘游戏 | WSNAIL.COM"
        description="体验经典的狼吃羊棋游戏，在7x7棋盘上展开策略对决。狼的目标是吃掉羊，羊的目标是到达底部，考验你的战术思维。"
        keywords="狼吃羊棋,策略游戏,棋盘游戏,经典游戏,WSNAIL"
        url="https://wsnail.com/games/wolf-sheep"
        canonical="https://wsnail.com/games/wolf-sheep"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                狼吃羊棋
              </CardTitle>
              
              <div className="flex flex-wrap justify-center gap-6 mb-4">
                <div className="flex items-center space-x-2">
                  <Dog className="w-5 h-5 text-red-600" />
                  <span className="font-semibold">狼: {scores.wolf}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Dog className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">羊: {scores.sheep}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">吃掉羊: {capturedSheep}/2</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Move className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">回合: {moveCount}</span>
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
              
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                <Star className="w-5 h-5 mr-2" />
                <span className="font-semibold">{gameMessage}</span>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* 游戏棋盘 */}
              <div className="flex justify-center mb-8">
                <div className="bg-amber-100 p-4 rounded-2xl shadow-lg">
                  <div className="grid grid-cols-7 gap-1 bg-amber-800 p-2 rounded-xl">
                    {board.map((row, rowIndex) => (
                      row.map((piece, colIndex) => {
                        const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
                        const isValid = isValidMove(rowIndex, colIndex);
                        
                        return (
                          <motion.div
                            key={`${rowIndex}-${colIndex}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                              w-12 h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200
                              ${rowIndex % 2 === colIndex % 2 ? 'bg-amber-200' : 'bg-amber-100'}
                              ${isSelected ? 'ring-4 ring-yellow-400' : ''}
                              ${isValid ? 'ring-2 ring-green-400 bg-green-200' : ''}
                              ${piece ? 'hover:ring-2 hover:ring-blue-400' : ''}
                            `}
                            onClick={() => handlePieceClick(rowIndex, colIndex)}
                          >
                            {piece ? (
                              <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center shadow-md
                                ${piece === 'wolf' ? 'bg-red-100' : 'bg-blue-100'}
                              `}>
                                {getPieceIcon(piece)}
                              </div>
                            ) : isValid ? (
                              <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            ) : null}
                          </motion.div>
                        );
                      })
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
                  onClick={() => setGameMode(gameMode === 'pve' ? 'pvp' : 'pve')}
                  variant="outline"
                  className="flex items-center"
                >
                  {gameMode === 'pve' ? (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      切换人人对战
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2" />
                      切换人机对战
                    </>
                  )}
                </Button>
                
                {gamePhase === 'gameOver' && (
                  <Button
                    onClick={startGame}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    再来一局
                  </Button>
                )}
              </div>
              
              {/* 游戏说明 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">游戏提示</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">狼方策略</h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• 控制棋盘中心位置</li>
                      <li>• 逐步包围羊群</li>
                      <li>• 寻找吃掉羊的机会</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">羊方策略</h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• 团结一致，避免孤立</li>
                      <li>• 向底部推进</li>
                      <li>• 阻止狼的进攻路线</li>
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