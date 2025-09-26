import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Star, Sparkles, Target, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface InteractiveGuideProps {
  language: 'en' | 'zh';
}

const InteractiveGuide: React.FC<InteractiveGuideProps> = ({ language }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userPath, setUserPath] = useState<string>('');

  const steps = [
    {
      id: 'welcome',
      title: language === 'en' ? 'Welcome to AI Tools Hub!' : '欢迎来到AI工具站！',
      description: language === 'en'
        ? 'What would you like to do today?'
        : '今天您想要做什么呢？',
      options: [
        {
          id: 'create',
          label: language === 'en' ? '🎨 Create Content' : '🎨 创作内容',
          path: 'creator'
        },
        {
          id: 'learn',
          label: language === 'en' ? '📚 Learn & Research' : '📚 学习研究',
          path: 'learner'
        },
        {
          id: 'business',
          label: language === 'en' ? '💼 Business Solutions' : '💼 商业解决方案',
          path: 'business'
        },
        {
          id: 'explore',
          label: language === 'en' ? '🔍 Just Exploring' : '🔍 随便看看',
          path: 'explorer'
        }
      ]
    },
    {
      id: 'creator',
      title: language === 'en' ? 'Perfect for Creators!' : '创作者的完美选择！',
      description: language === 'en'
        ? 'Here are the best AI tools for content creation:'
        : '这里是最适合内容创作的AI工具：',
      recommendations: [
        { name: 'Midjourney', category: 'AI绘画', reason: '最强AI绘画工具' },
        { name: 'ChatGPT', category: 'AI写作', reason: '智能文案生成' },
        { name: 'Runway', category: 'AI视频', reason: '专业视频制作' },
      ]
    },
    {
      id: 'learner',
      title: language === 'en' ? 'Knowledge Seeker!' : '知识探索者！',
      description: language === 'en'
        ? 'Boost your learning with these AI tools:'
        : '用这些AI工具提升学习效率：',
      recommendations: [
        { name: 'Perplexity', category: 'AI搜索', reason: '智能搜索引擎' },
        { name: 'Notion AI', category: '效率工具', reason: '智能笔记助手' },
        { name: 'Claude', category: 'AI对话', reason: '深度思考伙伴' },
      ]
    },
    {
      id: 'business',
      title: language === 'en' ? 'Business Professional!' : '商业专家！',
      description: language === 'en'
        ? 'Streamline your business with AI:'
        : '用AI简化商业流程：',
      recommendations: [
        { name: 'Copy.ai', category: '营销文案', reason: '智能营销助手' },
        { name: 'Jasper', category: '内容营销', reason: '专业内容生成' },
        { name: 'Zapier AI', category: '流程自动化', reason: '工作流优化' },
      ]
    },
    {
      id: 'explorer',
      title: language === 'en' ? 'Welcome Explorer!' : '欢迎探索者！',
      description: language === 'en'
        ? 'Start with these popular tools:'
        : '从这些热门工具开始：',
      recommendations: [
        { name: 'ChatGPT', category: 'AI对话', reason: '最受欢迎' },
        { name: 'Midjourney', category: 'AI绘画', reason: '创意无限' },
        { name: 'GitHub Copilot', category: 'AI编程', reason: '程序员必备' },
      ]
    }
  ];

  const currentStepData = steps.find(s => s.id === (userPath || 'welcome')) || steps[0];

  const handleOptionClick = (optionPath: string) => {
    setUserPath(optionPath);
    setCurrentStep(1);

    // 记录用户行为 - 提高参与度
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'interactive_guide_selection', {
        event_category: 'engagement',
        event_label: optionPath,
        value: 1
      });
    }
  };

  const handleToolClick = (toolName: string) => {
    // 跳转到AI工具页面并搜索该工具
    window.open(`/ai-tools?search=${encodeURIComponent(toolName)}`, '_blank');

    // 记录转化事件
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'tool_click_from_guide', {
        event_category: 'conversion',
        event_label: toolName,
        value: 1
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-12 shadow-xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-2">
          <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {language === 'en' ? 'Quick Start Guide' : '新手使用指南'}
          </CardTitle>
        </div>
        <div className="flex justify-center space-x-2">
          {[0, 1].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentStep >= step ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepData.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-center mb-3 text-gray-800">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {currentStepData.description}
            </p>

            {/* 第一步：选择用户类型 */}
            {currentStepData.id === 'welcome' && (
              <div className="grid grid-cols-2 gap-3">
                {currentStepData.options?.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 px-3 text-sm font-medium hover:bg-blue-50 hover:border-blue-300 transition-all group"
                      onClick={() => handleOptionClick(option.path)}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{option.label}</div>
                        <ChevronRight className="w-4 h-4 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 第二步：推荐工具 */}
            {currentStepData.recommendations && (
              <div className="space-y-3">
                {currentStepData.recommendations.map((tool, index) => (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all group"
                    onClick={() => handleToolClick(tool.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Star className="w-4 h-4 text-yellow-500 mr-2" />
                          <h4 className="font-semibold text-gray-800">{tool.name}</h4>
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                            {tool.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{tool.reason}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </motion.div>
                ))}

                <div className="mt-6 flex justify-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUserPath('');
                      setCurrentStep(0);
                    }}
                    className="flex items-center"
                  >
                    ← {language === 'en' ? 'Back' : '返回'}
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center"
                    onClick={() => window.open('/ai-tools', '_blank')}
                  >
                    {language === 'en' ? 'Explore All Tools' : '浏览所有工具'}
                    <Zap className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default InteractiveGuide;