import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gift,
  Users,
  Star,
  TrendingUp,
  Award,
  Share2,
  Copy,
  Check,
  Crown,
  Target,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'invite' | 'achievement' | 'daily';
  points: number;
  claimed: boolean;
  expires?: string;
}

interface UserStats {
  totalPoints: number;
  totalInvites: number;
  achievements: string[];
  dailyStreak: number;
  level: number;
  nextLevelPoints: number;
}

const UserGrowthSystem: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 250,
    totalInvites: 3,
    achievements: ['first_invite', 'ai_explorer'],
    dailyStreak: 5,
    level: 2,
    nextLevelPoints: 500
  });
  const [copiedLink, setCopiedLink] = useState(false);

  // 模拟奖励数据
  useEffect(() => {
    const mockRewards: Reward[] = [
      {
        id: '1',
        name: '邀请好友',
        description: '成功邀请一位好友注册',
        icon: 'Share2',
        type: 'invite',
        points: 100,
        claimed: false
      },
      {
        id: '2',
        name: 'AI探索者',
        description: '使用10个不同的AI工具',
        icon: 'Zap',
        type: 'achievement',
        points: 200,
        claimed: false
      },
      {
        id: '3',
        name: '每日签到',
        description: '连续签到7天',
        icon: 'Star',
        type: 'daily',
        points: 50,
        claimed: true
      },
      {
        id: '4',
        name: '社交达人',
        description: '通过社交媒体分享5次',
        icon: 'Users',
        type: 'achievement',
        points: 150,
        claimed: false
      },
      {
        id: '5',
        name: 'VIP试用',
        description: '获得7天VIP会员体验',
        icon: 'Crown',
        type: 'invite',
        points: 500,
        claimed: false
      }
    ];
    setRewards(mockRewards);
  }, []);

  const handleClaimReward = (rewardId: string) => {
    setRewards(prev => prev.map(reward =>
      reward.id === rewardId ? { ...reward, claimed: true } : reward
    ));

    // ���新用户积分
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && !reward.claimed) {
      setUserStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints + reward.points,
        level: Math.floor((prev.totalPoints + reward.points) / 250) + 1,
        nextLevelPoints: ((Math.floor((prev.totalPoints + reward.points) / 250) + 1) * 250) - (prev.totalPoints + reward.points)
      }));
    }
  };

  const handleInvite = () => {
    const inviteLink = `${window.location.origin}/invite?ref=${userStats.totalInvites + 1}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const getLevelBadgeColor = (level: number) => {
    if (level >= 10) return 'bg-purple-600 text-white';
    if (level >= 5) return 'bg-blue-600 text-white';
    if (level >= 3) return 'bg-green-600 text-white';
    return 'bg-gray-600 text-white';
  };

  const ProgressRing = ({ progress, size = 80 }: { progress: number; size?: number }) => (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          stroke="#e5e7eb"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          stroke="#3b82f6"
          strokeWidth="4"
          fill="none"
          strokeDasharray={`${2 * Math.PI * ((size - 8) / 2)}`}
          strokeDashoffset={`${2 * Math.PI * ((size - 8) / 2) * (1 - progress / 100)}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-700">{progress}%</span>
      </div>
    </div>
  );

  const rewardsByType = rewards.reduce((acc, reward) => {
    if (!acc[reward.type]) acc[reward.type] = [];
    acc[reward.type].push(reward);
    return acc;
  }, {} as Record<string, Reward[]>);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 用户状态卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full ${getLevelBadgeColor(userStats.level)} flex items-center justify-center`}>
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs">
                    Lv.{userStats.level}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">成长达人</h3>
                  <p className="text-gray-600">距离下个等级还需 {userStats.nextLevelPoints} 积分</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900">{userStats.totalPoints}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>已邀请 {userStats.totalInvites} 人</span>
                </div>
              </div>
            </div>

            {/* 进度条 */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">等级进度</span>
                <span className="text-sm text-gray-600">{userStats.totalPoints}/{userStats.level * 250}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(userStats.totalPoints / (userStats.level * 250)) * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 邀请好友 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              邀请好友，赚取积分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">邀请奖励</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 成功邀请好友注册：+100 积分</li>
                  <li>• 好友完成首次使用：+50 积分</li>
                  <li>• 邀请5位好友：获得VIP试用7天</li>
                  <li>• 邀请10位好友：升级为高级会员</li>
                </ul>
              </div>
              <div className="flex flex-col space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">您的专属邀请链接</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/invite?ref=${userStats.totalInvites + 1}`}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                    />
                    <Button
                      onClick={handleInvite}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          复制链接
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  分享到社交平台
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 成就系统 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              成就系统
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(rewardsByType).map(([type, typeRewards]) => (
                <div key={type}>
                  <h4 className="font-semibold mb-3 text-gray-700">
                    {type === 'invite' && '邀请奖励'}
                    {type === 'achievement' && '成就奖励'}
                    {type === 'daily' && '每日任务'}
                  </h4>
                  <div className="space-y-3">
                    {typeRewards.map((reward) => {
                      const IconComponent = require(`lucide-react`).[reward.icon];
                      return (
                        <motion.div
                          key={reward.id}
                          whileHover={{ scale: 1.02 }}
                          className="border rounded-lg p-3 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                reward.claimed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                              }`}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{reward.name}</p>
                                <p className="text-xs text-gray-600">{reward.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={reward.claimed ? 'default' : 'secondary'}>
                                +{reward.points}
                              </Badge>
                              {!reward.claimed && (
                                <Button
                                  size="sm"
                                  onClick={() => handleClaimReward(reward.id)}
                                  className="text-xs"
                                >
                                  领取
                                </Button>
                              )}
                              {reward.claimed && (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 排行榜 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              本周排行榜
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { rank: 1, name: 'AI达人', points: 1500, avatar: '👑' },
                { rank: 2, name: '效率专家', points: 1200, avatar: '🥈' },
                { rank: 3, name: '创新先锋', points: 980, avatar: '🥉' },
                { rank: 4, name: '您的排名', points: 250, avatar: '👤' }
              ].map((user, index) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    user.name === '您的排名' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      user.rank === 1 ? 'bg-yellow-500' :
                      user.rank === 2 ? 'bg-gray-400' :
                      user.rank === 3 ? 'bg-orange-400' : 'bg-gray-300'
                    }`}>
                      <span className="text-white font-bold text-sm">
                        {user.rank === 4 ? '您' : user.rank}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{user.avatar}</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold">{user.points}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserGrowthSystem;