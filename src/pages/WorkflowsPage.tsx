import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  Clock,
  Users,
  TrendingUp,
  Zap,
  CheckCircle,
  BookOpen,
  Play,
  Star,
  MessageSquare,
  ShoppingCart,
  Video,
  Briefcase
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import SEOHead from '../components/common/SEOHead';
import { useAnalytics } from '../services/analyticsService';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  tools: string[];
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Workflow {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  popularity: number;
  steps: WorkflowStep[];
  benefits: string[];
  tools: string[];
  targetAudience: string[];
}

const workflows: Workflow[] = [
  {
    id: 'wechat-marketing',
    title: '微信公众号运营工作流',
    description: '从选题到发布的完整自动化流程，提升内容创作效率60%',
    category: 'social-media',
    icon: <MessageSquare className="w-8 h-8" />,
    difficulty: 'intermediate',
    duration: '2-3小时/篇',
    popularity: 95,
    targetAudience: ['新媒体运营', '内容创作者', '市场营销人员'],
    benefits: [
      '自动化选题调研，节省80%选题时间',
      'AI辅助创作，提升内容质量',
      '一键生成多平台适配内容',
      '数据驱动优化，提升阅读量'
    ],
    tools: ['微信指数', 'ChatGPT', 'Notion AI', 'Canva', '稿定设计', '新榜'],
    steps: [
      {
        id: 'research',
        title: '智能选题调研',
        description: '通过多维度数据分析，发现热门话题和用户需求',
        tools: ['微信指数', '百度指数', 'ChatGPT'],
        duration: '30分钟',
        difficulty: 'beginner'
      },
      {
        id: 'content',
        title: 'AI辅助内容创作',
        description: '利用AI工具生成大纲、初稿，并进行多轮优化',
        tools: ['Notion AI', 'DeepL', 'Grammarly'],
        duration: '60分钟',
        difficulty: 'intermediate'
      },
      {
        id: 'design',
        title: '视觉设计制作',
        description: '创建吸引人的封面图和配图，提升文章视觉效果',
        tools: ['Canva', '稿定设计', 'Photoshop AI'],
        duration: '45分钟',
        difficulty: 'beginner'
      },
      {
        id: 'publish',
        title: '优化发布策略',
        description: '选择最佳发布时间，优化标题和摘要',
        tools: ['微信公众平台', '草料二维码', '新榜'],
        duration: '15分钟',
        difficulty: 'beginner'
      },
      {
        id: 'analyze',
        title: '数据分析优化',
        description: '追踪文章表现，分析用户行为，持续优化策略',
        tools: ['微信后台', 'Google Analytics', '热力图工具'],
        duration: '30分钟',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'ecommerce-launch',
    title: '电商产品上架工作流',
    description: '从市场调研到产品上线的系统化运营流程',
    category: 'ecommerce',
    icon: <ShoppingCart className="w-8 h-8" />,
    difficulty: 'advanced',
    duration: '1-2周',
    popularity: 88,
    targetAudience: ['电商运营', '产品经理', '创业者'],
    benefits: [
      '数据驱动产品决策，降低试错成本',
      '自动化视觉营销，提升转化率',
      '多渠道协同推广，扩大市场覆盖',
      '实时数据监控，快速调整策略'
    ],
    tools: ['阿里指数', 'ProductHunt', 'Midjourney', '剪映', '生意参谋'],
    steps: [
      {
        id: 'market-research',
        title: '智能市场调研',
        description: '分析市场需求、竞品情况和用户画像',
        tools: ['阿里指数', '竞品分析工具', 'ChatGPT'],
        duration: '2-3天',
        difficulty: 'intermediate'
      },
      {
        id: 'product-dev',
        title: '产品开发优化',
        description: '基于市场反馈优化产品功能和定位',
        tools: ['ProductHunt', '用户调研问卷', 'AI需求分析'],
        duration: '3-5天',
        difficulty: 'advanced'
      },
      {
        id: 'visual-marketing',
        title: '视觉营销制作',
        description: '制作高转化的产品图片和营销视频',
        tools: ['Midjourney', '剪映', '小红书笔记'],
        duration: '2-3天',
        difficulty: 'intermediate'
      },
      {
        id: 'channel-promotion',
        title: '多渠道推广',
        description: '在多个平台同步推广，扩大品牌影响力',
        tools: ['微信生态', '抖音直播', '淘宝客分销'],
        duration: '持续进行',
        difficulty: 'advanced'
      },
      {
        id: 'data-analysis',
        title: '数据分析复盘',
        description: '分析销售数据和用户反馈，持续优化',
        tools: ['生意参谋', '飞瓜数据', 'Excel数据透视'],
        duration: '每日30分钟',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'video-creator',
    title: '自媒体视频制作工作流',
    description: '高效的视频内容创作和多平台分发流程',
    category: 'content-creation',
    icon: <Video className="w-8 h-8" />,
    difficulty: 'intermediate',
    duration: '4-6小时/期',
    popularity: 92,
    targetAudience: ['视频博主', '内容创作者', '教育工作者'],
    benefits: [
      'AI自动生成脚本大纲，创意不断',
      '一键生成多尺寸视频，适配全平台',
      '智能字幕和配音，大幅减少后期时间',
      '数据驱动内容优化，提升播放量'
    ],
    tools: ['Runway', '剪映', 'ChatGPT', 'Canva', '飞瓜数据'],
    steps: [
      {
        id: 'planning',
        title: '智能策划选题',
        description: '基于热点趋势和用户兴趣，AI辅助策划内容',
        tools: ['ChatGPT', '飞瓜数据', '微博热搜'],
        duration: '30分钟',
        difficulty: 'beginner'
      },
      {
        id: 'scripting',
        title: 'AI脚本创作',
        description: '生成结构化脚本，包含开场、主体和结尾',
        tools: ['ChatGPT', 'Notion AI', '脚本模板'],
        duration: '45分钟',
        difficulty: 'beginner'
      },
      {
        id: 'production',
        title: '视频拍摄制作',
        description: '高效拍摄技巧和AI辅助后期制作',
        tools: ['手机拍摄', 'Runway', '剪映'],
        duration: '2-3小时',
        difficulty: 'intermediate'
      },
      {
        id: 'editing',
        title: '智能剪辑优化',
        description: '自动字幕、智能配音和特效添加',
        tools: ['剪映', 'Runway', 'AI配音'],
        duration: '1-2小时',
        difficulty: 'intermediate'
      },
      {
        id: 'distribution',
        title: '多平台分发',
        description: '一键分发到抖音、小红书、B站等平台',
        tools: ['各平台客户端', '第三方分发工具'],
        duration: '30分钟',
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'product-manager',
    title: '产品经理全流程工作流',
    description: '从需求调研到产品上线的完整产品管理流程',
    category: 'product-management',
    icon: <Briefcase className="w-8 h-8" />,
    difficulty: 'advanced',
    duration: '2-3个月',
    popularity: 85,
    targetAudience: ['产品经理', '项目经理', '创业者'],
    benefits: [
      '数据驱动产品决策，提升成功率',
      '高效原型设计，快速验证想法',
      '敏捷开发管理，按时交付产品',
      '用户反馈闭环，持续产品优化'
    ],
    tools: ['问卷星', 'Figma', 'JIRA', 'Google Analytics', 'TestFlight'],
    steps: [
      {
        id: 'research',
        title: '用户需求调研',
        description: '深入了解用户痛点和需求，验证产品假设',
        tools: ['问卷星', '用户访谈', '数据分析AI'],
        duration: '1-2周',
        difficulty: 'intermediate'
      },
      {
        id: 'design',
        title: '原型设计迭代',
        description: '快速设计产品原型，验证核心功能',
        tools: ['Figma', '墨刀', 'AI设计助手'],
        duration: '1-2周',
        difficulty: 'intermediate'
      },
      {
        id: 'development',
        title: '开发过程管理',
        description: '敏捷开发管理，确保开发进度和质量',
        tools: ['JIRA', 'Slack', 'GitHub'],
        duration: '4-8周',
        difficulty: 'advanced'
      },
      {
        id: 'testing',
        title: '测试优化迭代',
        description: '用户测试和数据分析，持续产品优化',
        tools: ['TestFlight', 'UserVoice', 'A/B测试工具'],
        duration: '1-2周',
        difficulty: 'intermediate'
      },
      {
        id: 'analytics',
        title: '数据分析运营',
        description: '产品数据监控和用户行为分析',
        tools: ['Google Analytics', 'Mixpanel', 'SQL查询AI'],
        duration: '持续进行',
        difficulty: 'advanced'
      }
    ]
  }
];

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800', 
  advanced: 'bg-red-100 text-red-800'
};

const difficultyLabels = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级'
};

export default function WorkflowsPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filteredWorkflows, setFilteredWorkflows] = useState(workflows);
  const { trackWorkflowView, trackCategoryFilter, trackUserAction } = useAnalytics();

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredWorkflows(workflows);
    } else {
      setFilteredWorkflows(workflows.filter(w => w.category === activeTab));
    }
  }, [activeTab]);

  const categories = [
    { id: 'all', name: '全部', count: workflows.length },
    { id: 'social-media', name: '新媒体', count: workflows.filter(w => w.category === 'social-media').length },
    { id: 'ecommerce', name: '电商', count: workflows.filter(w => w.category === 'ecommerce').length },
    { id: 'content-creation', name: '内容创作', count: workflows.filter(w => w.category === 'content-creation').length },
    { id: 'product-management', name: '产品管理', count: workflows.filter(w => w.category === 'product-management').length }
  ];

  if (selectedWorkflow) {
    return <WorkflowDetail workflow={selectedWorkflow} onBack={() => setSelectedWorkflow(null)} />;
  }

  return (
    <>
      <SEOHead 
        title="AI工具工作流 - 职业化场景解决方案 | WSNAIL.COM"
        description="专业的AI工具工作流指南，涵盖微信公众号运营、电商运营、视频制作、产品管理等场景。提供完整的工具链配置和使用教程，大幅提升工作效率。"
        keywords="AI工作流,工具组合,微信公众号运营,电商运营,视频制作,产品管理,效率提升,WSNAIL"
        url="https://wsnail.com/workflows"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                AI工具工作流
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                职业化场景解决方案，让AI工具发挥最大价值
              </p>
              
              <div className="flex justify-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span>效率提升60%+</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span>10万+用户使用</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>4.9分好评</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Categories */}
          <Tabs value={activeTab} onValueChange={(value) => {
            trackCategoryFilter(value);
            setActiveTab(value);
          }} className="mb-8">
            <TabsList className="grid w-full grid-cols-5">
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Workflows Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredWorkflows.map((workflow, index) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      onClick={() => {
                        trackWorkflowView(workflow.id);
                        setSelectedWorkflow(workflow);
                      }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-600 group-hover:text-blue-700">
                          {workflow.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                            {workflow.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={difficultyColors[workflow.difficulty]}>
                              {difficultyLabels[workflow.difficulty]}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {workflow.duration}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-yellow-500 mb-1">
                          <Star className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">{workflow.popularity}%</span>
                        </div>
                        <div className="text-xs text-gray-500">满意度</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {workflow.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">适用人群</h4>
                        <div className="flex flex-wrap gap-1">
                          {workflow.targetAudience.slice(0, 3).map((audience, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {audience}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">核心工具</h4>
                        <div className="flex flex-wrap gap-1">
                          {workflow.tools.slice(0, 4).map((tool, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                          {workflow.tools.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{workflow.tools.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {workflow.steps.length} 个步骤
                      </span>
                      <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white">
                        查看详情
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Workflow Detail Component
function WorkflowDetail({ 
  workflow, 
  onBack 
}: { 
  workflow: Workflow; 
  onBack: () => void;
}) {
  const { trackUserAction } = useAnalytics();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const handleStartWorkflow = () => {
    // 追踪用户开始使用工作流
    trackUserAction('start_workflow', { 
      workflowId: workflow.id,
      workflowTitle: workflow.title,
      difficulty: workflow.difficulty
    });
    
    // 创建更好的工作流开始体验
    const confirmStart = window.confirm(
      `🚀 准备开始工作流：${workflow.title}\n\n` +
      `📋 包含 ${workflow.steps.length} 个步骤\n` +
      `⏱️ 预计用时：${workflow.duration}\n` +
      `🔧 需要工具：${workflow.tools.slice(0, 3).join(', ')}${workflow.tools.length > 3 ? '等' : ''}\n\n` +
      `点击确定将在新标签页中打开相关工具链接，方便您开始工作流程。`
    );
    
    if (confirmStart) {
      // 打开第一步的工具链接（如果有的话）
      const firstStep = workflow.steps[0];
      if (firstStep && firstStep.tools.length > 0) {
        // 为常见工具提供直接链接
        const toolLinks: { [key: string]: string } = {
          'ChatGPT': 'https://chat.openai.com',
          'Notion AI': 'https://notion.so',
          'Canva': 'https://canva.com',
          'Midjourney': 'https://midjourney.com',
          '稿定设计': 'https://gaoding.com',
          '新榜': 'https://newrank.cn',
          '微信指数': 'https://index.weixin.qq.com',
          '百度指数': 'https://index.baidu.com'
        };
        
        const toolToOpen = firstStep.tools.find(tool => toolLinks[tool]);
        if (toolToOpen) {
          window.open(toolLinks[toolToOpen], '_blank');
        }
      }
      
      // 显示成功提示
      alert(`✅ 工作流已启动！\n\n接下来请按照步骤指导完成各个环节。如需帮助，可随时返回查看详细说明。`);
    }
  };

  const handleCompleteStep = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
      trackUserAction('complete_step', {
        workflowId: workflow.id,
        stepId: stepId,
        completedSteps: completedSteps.length + 1,
        totalSteps: workflow.steps.length
      });
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" onClick={onBack}>
              ← 返回
            </Button>
            <div className="text-blue-600">
              {workflow.icon}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {workflow.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4 mb-4">
            <Badge className={difficultyColors[workflow.difficulty]}>
              {difficultyLabels[workflow.difficulty]}
            </Badge>
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {workflow.duration}
            </Badge>
            <div className="flex items-center text-yellow-500">
              <Star className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{workflow.popularity}%</span>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 mb-6">
            {workflow.description}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">核心优势</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {workflow.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">适用人群</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workflow.targetAudience.map((audience, i) => (
                    <Badge key={i} variant="secondary" className="mr-2 mb-2">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">使用工具</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workflow.tools.map((tool, i) => (
                    <Badge key={i} variant="outline" className="mr-2 mb-2">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">工作流步骤</h2>
            <div className="text-sm text-gray-600">
              进度：{completedSteps.length} / {workflow.steps.length}
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${workflow.steps.length > 0 ? (completedSteps.length / workflow.steps.length) * 100 : 0}%` 
              }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-6">
          {workflow.steps.map((step, index) => (
            <Card key={step.id}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold transition-colors ${
                    completedSteps.includes(step.id) 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {completedSteps.includes(step.id) ? '✓' : index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={difficultyColors[step.difficulty]} variant="secondary">
                        {difficultyLabels[step.difficulty]}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {step.duration}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {step.description}
                </p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">推荐工具</h4>
                  <div className="flex flex-wrap gap-2">
                    {step.tools.map((tool, i) => (
                      <Badge key={i} variant="outline">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    {completedSteps.includes(step.id) ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">已完成</span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        <span className="text-sm text-gray-500">待完成</span>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant={completedSteps.includes(step.id) ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleCompleteStep(step.id)}
                    disabled={completedSteps.includes(step.id)}
                  >
                    {completedSteps.includes(step.id) ? "✓ 已完成" : "标记完成"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleStartWorkflow}
          >
            <Play className="w-5 h-5 mr-2" />
            开始使用这个工作流
          </Button>
        </div>
      </div>
    </div>
  );
}