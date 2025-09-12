import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star,
  TrendingUp,
  Heart,
  Sparkles,
  ArrowRight,
  RefreshCw,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAnalytics } from '../services/analyticsService';

interface RecommendedTool {
  name: string;
  category: string;
  description: string;
  link: string;
  reason: string;
  confidence: number;
}

interface RecommendedWorkflow {
  id: string;
  title: string;
  description: string;
  category: string;
  reason: string;
  confidence: number;
}

export default function PersonalizedRecommendations() {
  const { getRecommendations, getUserProfile } = useAnalytics();
  const [recommendations, setRecommendations] = useState<{
    tools: RecommendedTool[];
    workflows: RecommendedWorkflow[];
  }>({ tools: [], workflows: [] });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    
    try {
      // 获取用户画像
      const profile = getUserProfile();
      setUserProfile(profile);
      
      // 获取推荐内容
      const recs = getRecommendations();
      
      // 模拟推荐数据（实际应该从API获取）
      const toolRecommendations = generateToolRecommendations(profile);
      const workflowRecommendations = generateWorkflowRecommendations(profile);
      
      setRecommendations({
        tools: toolRecommendations,
        workflows: workflowRecommendations
      });
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  // 基于用户画像生成工具推荐
  const generateToolRecommendations = (profile: any): RecommendedTool[] => {
    const { preferences } = profile;
    const tools: RecommendedTool[] = [];
    
    // 基于访问过的分类推荐
    if (preferences.visitedCategories.includes('AI写作')) {
      tools.push({
        name: 'Notion AI',
        category: 'AI写作',
        description: '强大的AI写作和知识管理工具',
        link: 'https://notion.so',
        reason: '您对AI写作工具感兴趣',
        confidence: 90
      });
    }
    
    if (preferences.visitedCategories.includes('AI设计')) {
      tools.push({
        name: 'Midjourney',
        category: 'AI设计',
        description: 'AI图像生成和创意设计工具',
        link: 'https://midjourney.com',
        reason: '基于您的设计工具使用历史',
        confidence: 85
      });
    }
    
    // 热门推荐
    tools.push({
      name: 'ChatGPT',
      category: 'AI对话',
      description: '最受欢迎的AI对话助手',
      link: 'https://chat.openai.com',
      reason: '用户热门选择',
      confidence: 95
    });
    
    return tools.slice(0, 4);
  };

  // 基于用户画像生成工作流推荐
  const generateWorkflowRecommendations = (profile: any): RecommendedWorkflow[] => {
    const { preferences, activityLevel } = profile;
    const workflows: RecommendedWorkflow[] = [];
    
    if (preferences.visitedCategories.includes('AI写作') || 
        preferences.searchKeywords.some(k => k.includes('写作'))) {
      workflows.push({
        id: 'wechat-marketing',
        title: '微信公众号运营工作流',
        description: '从选题到发布的完整自动化流程',
        category: 'social-media',
        reason: '匹配您对内容创作的兴趣',
        confidence: 88
      });
    }
    
    if (activityLevel === 'high') {
      workflows.push({
        id: 'product-manager',
        title: '产品经理全流程工作流',
        description: '从需求调研到产品上线的完整流程',
        category: 'product-management',
        reason: '适合活跃用户的高级工作流',
        confidence: 92
      });
    }
    
    return workflows.slice(0, 3);
  };

  const refreshRecommendations = () => {
    loadRecommendations();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>正在生成个性化推荐...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProfile || (recommendations.tools.length === 0 && recommendations.workflows.length === 0)) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            开始探索，获取专属推荐
          </h3>
          <p className="text-gray-500">
            使用几个工具后，我们将为您提供个性化推荐
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 用户画像摘要 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">您的使用画像</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={refreshRecommendations}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{userProfile.preferences.usedTools.length}</div>
              <div className="text-gray-500">使用过的工具</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{userProfile.preferences.visitedCategories.length}</div>
              <div className="text-gray-500">探索的分类</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">
                {Math.round(userProfile.sessionDuration / 1000 / 60)}分钟
              </div>
              <div className="text-gray-500">本次访问</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">
                {userProfile.activityLevel === 'high' ? '活跃' : 
                 userProfile.activityLevel === 'medium' ? '一般' : '新手'}
              </div>
              <div className="text-gray-500">活跃度</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 推荐工具 */}
      {recommendations.tools.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-lg">为您推荐的工具</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.tools.map((tool, index) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => window.open(tool.link, '_blank')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold group-hover:text-blue-600 transition-colors">
                        {tool.name}
                      </h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {tool.category}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {tool.confidence}%
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600">
                      💡 {tool.reason}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 推荐工作流 */}
      {recommendations.workflows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <CardTitle className="text-lg">为您推荐的工作流</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.workflows.map((workflow, index) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold group-hover:text-blue-600 transition-colors mb-1">
                        {workflow.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {workflow.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {workflow.category}
                        </Badge>
                        <span className="text-xs text-blue-600">
                          💡 {workflow.reason}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 ml-4">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {workflow.confidence}%
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white">
                      查看详情
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}