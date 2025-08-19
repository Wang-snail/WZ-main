import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCw, 
  Play, 
  Trophy, 
  Star,
  Brain,
  Zap,
  Shield,
  Sword,
  Flag,
  Bomb,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOHead from '../../components/SEOHead';

type PieceType = '司令' | '军长' | '师长' | '旅长' | '团长' | '营长' | '连长' | '排长' | '工兵' | '地雷' | '炸弹' | '军旗' | null;
type Player = 'red' | 'blue' | null;
type GamePhase = 'setup' | 'playing' | 'redTurn' | 'blueTurn' | 'gameOver';

interface ChessPiece {
  type: PieceType;
  player: Player;
  revealed: boolean;
  movable: boolean;
}

export default function MilitaryChessGame() {
  const [board, setBoard] = useState<(ChessPiece | null)[][]>(Array(12).fill(null).map(() => Array(12).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [selectedPiece, setSelectedPiece] = useState<{row: number, col: number} | null>(null);
  const [validMoves, setValidMoves] = useState<{row: number, col: number}[]>([]);
  const [scores, setScores] = useState({ red: 0, blue: 0 });
  const [gameMessage, setGameMessage] = useState('点击开始游戏');
  const [showSetup, setShowSetup] = useState(true);

  // 初始化游戏
  const initializeGame = () => {
    const newBoard: (ChessPiece | null)[][] = Array(12).fill(null).map(() => Array(12).fill(null));
    
    // 设置玩家1（红色）的棋子 - 底部
    setupPlayerPieces(newBoard, 'red', 6, 11);
    
    // 设置玩家2（蓝色）的棋子 - 顶部
    setupPlayerPieces(newBoard, 'blue', 0, 5);
    
    setBoard(newBoard);
    setCurrentPlayer('red');
    setGamePhase('playing');
    setGameMessage('红方先行，请移动棋子');
    setSelectedPiece(null);
    setValidMoves([]);
  };

  // 设置玩家棋子
  const setupPlayerPieces = (board: (ChessPiece | null)[][], player: Player, startRow: number, endRow: number) => {
    // 简化版本：只放置部分棋子
    const pieceTypes: PieceType[] = ['司令', '军长', '师长', '旅长', '团长', '营长', '连长', '排长', '工兵', '地雷', '炸弹', '军旗'];
    
    // 在指定区域内随机放置棋子
    let pieceIndex = 0;
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < 12; col++) {
        if (pieceIndex < pieceTypes.length && Math.random() > 0.7) {
          board[row][col] = {
            type: pieceTypes[pieceIndex],
            player: player,
            revealed: player === 'red', // 红方棋子默认可见
            movable: pieceTypes[pieceIndex] !== '地雷' && pieceTypes[pieceIndex] !== '军旗'
          };
          pieceIndex++;
        }
      }
    }
  };

  // 获取有效的移动位置
  const getValidMoves = (row: number, col: number, piece: ChessPiece): {row: number, col: number}[] => {
    if (!piece || !piece.movable || !piece.revealed) return [];
    
    const moves: {row: number, col: number}[] = [];
    
    // 四个方向：上、下、左、右
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      // 检查边界
      if (newRow >= 0 && newRow < 12 && newCol >= 0 && newCol < 12) {
        const targetPiece = board[newRow][newCol];
        
        // 空位可以移动
        if (targetPiece === null) {
          moves.push({ row: newRow, col: newCol });
        }
        // 对方棋子可以攻击（需要比较等级）
        else if (targetPiece.player !== piece.player) {
          if (canCapture(piece.type, targetPiece.type)) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }
    }
    
    return moves;
  };

  // 判断是否可以捕获对方棋子
  const canCapture = (attacker: PieceType, defender: PieceType): boolean => {
    if (!attacker || !defender) return false;
    
    // 炸弹可以炸掉任何棋子（除了地雷）
    if (attacker === '炸弹' && defender !== '地雷') return true;
    if (defender === '炸弹' && attacker !== '地雷') return true;
    
    // 地雷只能被工兵排除
    if (defender === '地雷') return attacker === '工兵';
    
    // 工兵可以排除地雷
    if (attacker === '工兵' && defender === '地雷') return true;
    
    // 军旗不能移动攻击
    if (attacker === '军旗' || defender === '军旗') return false;
    
    // 按等级比较（简化版本）
    const ranks: Record<PieceType, number> = {
      '司令': 12, '军长': 11, '师长': 10, '旅长': 9, '团长': 8, 
      '营长': 7, '连长': 6, '排长': 5, '工兵': 4, 
      '地雷': 1, '炸弹': 13, '军旗': 0
    };
    
    return ranks[attacker] >= ranks[defender];
  };

  // 处理棋子点击
  const handlePieceClick = (row: number, col: number) => {
    if (gamePhase !== 'playing') return;
    
    const piece = board[row][col];
    
    // 如果点击的是当前玩家的已翻开棋子
    if (piece && piece.player === currentPlayer && piece.revealed) {
      setSelectedPiece({ row, col });
      const moves = getValidMoves(row, col, piece);
      setValidMoves(moves);
      setGameMessage(`${currentPlayer === 'red' ? '红方' : '蓝方'}选择了${piece.type}，请选择移动位置`);
    }
    // 如果已选择棋子，且点击的是有效移动位置
    else if (selectedPiece && 
             validMoves.some(move => move.row === row && move.col === col)) {
      movePiece(selectedPiece.row, selectedPiece.col, row, col);
    }
    // 如果点击的是未翻开的己方棋子，翻开它
    else if (piece && piece.player === currentPlayer && !piece.revealed) {
      const newBoard = [...board.map(r => [...r])];
      newBoard[row][col]!.revealed = true;
      setBoard(newBoard);
      setGameMessage(`${currentPlayer === 'red' ? '红方' : '蓝方'}翻开了${piece.type}`);
    }
  };

  // 移动棋子
  const movePiece = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const newBoard = [...board.map(r => [...r])];
    const piece = newBoard[fromRow][fromCol];
    const targetPiece = newBoard[toRow][toCol];
    
    if (!piece) return;
    
    // 如果目标位置有棋子，进行战斗
    if (targetPiece) {
      const canWin = canCapture(piece.type, targetPiece.type);
      
      if (canWin) {
        // 攻击方获胜
        newBoard[toRow][toCol] = { ...piece, revealed: true };
        newBoard[fromRow][fromCol] = null;
        setGameMessage(`${currentPlayer === 'red' ? '红方' : '蓝方'}的${piece.type}击败了对方的${targetPiece.type}！`);
        
        // 检查是否获胜（对方军旗被夺）
        if (targetPiece.type === '军旗') {
          setGamePhase('gameOver');
          setGameMessage(`${currentPlayer === 'red' ? '红方' : '蓝方'}获胜！夺得了对方军旗！`);
          setScores(prev => ({
            ...prev,
            [currentPlayer]: prev[currentPlayer] + 1
          }));
          return;
        }
      } else {
        // 防守方获胜，攻击方被移除
        newBoard[fromRow][fromCol] = null;
        setGameMessage(`${currentPlayer === 'red' ? '红方' : '蓝方'}的${piece.type}被对方的${targetPiece.type}击败！`);
      }
    } else {
      // 移动到空位
      newBoard[toRow][toCol] = { ...piece, revealed: true };
      newBoard[fromRow][fromCol] = null;
      setGameMessage(`${currentPlayer === 'red' ? '红方' : '蓝方'}移动了${piece.type}`);
    }
    
    setBoard(newBoard);
    
    // 切换玩家
    const nextPlayer = currentPlayer === 'red' ? 'blue' : 'red';
    setCurrentPlayer(nextPlayer);
    setGameMessage(`${nextPlayer === 'red' ? '红方' : '蓝方'}回合，请移动棋子`);
    
    setSelectedPiece(null);
    setValidMoves([]);
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

  // 翻开所有棋子（用于调试）
  const revealAll = () => {
    const newBoard = [...board.map(row => 
      row.map(piece => piece ? { ...piece, revealed: true } : null)
    )];
    setBoard(newBoard);
  };

  // 检查位置是否是有效移动
  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  // 获取棋子图标
  const getPieceIcon = (piece: ChessPiece) => {
    if (!piece.revealed) {
      return <Shield className="w-6 h-6 text-gray-600" />;
    }
    
    switch (piece.type) {
      case '司令': return <Flag className="w-6 h-6 text-red-600" />;
      case '军长': return <Sword className="w-6 h-6 text-red-600" />;
      case '师长': return <Shield className="w-6 h-6 text-red-600" />;
      case '炸弹': return <Bomb className="w-6 h-6 text-black" />;
      case '地雷': return <Shield className="w-6 h-6 text-gray-800" />;
      case '军旗': return <Flag className="w-6 h-6 text-blue-600" />;
      default: return <User className="w-6 h-6 text-blue-600" />;
    }
  };

  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                军棋游戏
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-red-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <p className="text-gray-600 text-lg mb-8">
                经典的军棋对战游戏，两位玩家分别指挥红蓝两军展开激烈对抗
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    红方军队
                  </h3>
                  <p className="text-red-700 text-sm">从棋盘底部开始部署</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    蓝方军队
                  </h3>
                  <p className="text-blue-700 text-sm">从棋盘顶部开始部署</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">游戏规则</h3>
                <ul className="space-y-2 text-gray-600 text-left">
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>红方先行，轮流移动棋子</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>棋子初始时背面朝上，需要点击翻开才能看见真实身份</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>高等级棋子可以吃掉低等级棋子</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>炸弹可以炸掉任何棋子（除了地雷），地雷只能被工兵排除</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>夺得对方军旗即获胜</span>
                  </li>
                </ul>
              </div>
              
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-red-600 to-blue-600 text-white hover:shadow-lg py-3 px-8 text-lg"
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
        title="军棋游戏 - 经典陆军对战策略游戏 | WSNAIL.COM"
        description="体验经典的军棋对战游戏，两位玩家指挥红蓝两军展开激烈对抗。通过策略部署和智慧对决，争夺对方军旗获得胜利。"
        keywords="军棋,陆军棋,策略游戏,对战游戏,经典游戏,WSNAIL"
        url="https://wsnail.com/games/military-chess"
        canonical="https://wsnail.com/games/military-chess"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                军棋游戏
              </CardTitle>
              
              <div className="flex flex-wrap justify-center gap-6 mb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="font-semibold">红方: {scores.red}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">蓝方: {scores.blue}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">
                    {currentPlayer === 'red' ? '红方回合' : '蓝方回合'}
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
                <div className="bg-amber-100 p-4 rounded-2xl shadow-lg">
                  <div className="grid grid-cols-12 gap-1 bg-amber-800 p-2 rounded-xl">
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
                              w-10 h-10 flex items-center justify-center rounded cursor-pointer transition-all duration-200
                              ${rowIndex < 6 ? 'bg-red-100' : 'bg-blue-100'}
                              ${isSelected ? 'ring-4 ring-yellow-400' : ''}
                              ${isValid ? 'ring-2 ring-green-400 bg-green-200' : ''}
                              ${piece ? 'hover:ring-2 hover:ring-blue-400' : ''}
                            `}
                            onClick={() => handlePieceClick(rowIndex, colIndex)}
                          >
                            {piece ? (
                              <div className={`
                                w-8 h-8 rounded flex items-center justify-center shadow-md
                                ${piece.player === 'red' ? 'bg-red-200' : 'bg-blue-200'}
                                ${piece.revealed ? '' : 'bg-gray-300'}
                              `}>
                                {getPieceIcon(piece)}
                              </div>
                            ) : isValid ? (
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
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
                  onClick={revealAll}
                  variant="outline"
                  className="flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  翻开所有
                </Button>
                
                {gamePhase === 'gameOver' && (
                  <Button
                    onClick={startGame}
                    className="bg-gradient-to-r from-green-600 to-green-800 text-white hover:shadow-lg flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    再来一局
                  </Button>
                )}
              </div>
              
              {/* 棋子等级说明 */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">棋子等级</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-medium text-gray-900">司令 (最高等级)</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-medium text-gray-900">军长</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-medium text-gray-900">师长</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-medium text-gray-900">旅长</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-medium text-gray-900">团长</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-medium text-gray-900">营长</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-medium text-gray-900">连长</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-medium text-gray-900">排长</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-medium text-gray-900">工兵</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-medium text-gray-900">地雷</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-medium text-gray-900">炸弹</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-medium text-gray-900">军旗 (最低等级)</p>
                  </div>
                </div>
              </div>
              
              {/* 特殊规则说明 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">特殊规则</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                      <Bomb className="w-4 h-4 mr-2 text-black" />
                      炸弹规则
                    </h4>
                    <p className="text-gray-600 text-sm">炸弹可以炸掉任何棋子，但会被地雷炸毁</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-gray-800" />
                      地雷规则
                    </h4>
                    <p className="text-gray-600 text-sm">地雷不能移动，只能被工兵排除</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                      <Flag className="w-4 h-4 mr-2 text-blue-600" />
                      军旗规则
                    </h4>
                    <p className="text-gray-600 text-sm">夺得对方军旗即获胜，军旗不能主动攻击</p>
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