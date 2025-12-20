import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, FileText, Brain, Target, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { useKanoToolStore } from './store/kanoToolStore';
import { WorkflowStepper } from './components/WorkflowStepper';
import { StepContent } from './components/StepContent';
import { StepNavigation } from './components/StepNavigation';

export default function KanoAnalysisToolPage() {
  const { currentStep, resetTool, stepStatus, data } = useKanoToolStore();

  // 计算项目完成度
  const completedSteps = Object.values(stepStatus).filter(status => status === 'completed').length;
  const totalSteps = Object.keys(stepStatus).length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  // 检查是否有分析结果
  const hasResults = data.rawComments.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 工具页面头部 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/tools">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回工具
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kano模型分析工具</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-gray-600">
                    从用户反馈中提取功能洞察，智能分类为必备型、期望型、兴奋型需求
                  </p>
                  {hasResults && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 font-medium">项目进度: {progressPercentage}%</span>
                      </div>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500">{data.rawComments.length} 条评论</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasResults && (
                <div className="text-xs text-gray-500 mr-2">
                  💾 结果已保存，可随时查看各步骤
                </div>
              )}
              <Button variant="outline" onClick={resetTool}>
                🗑️ 开始新项目
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 工作流步骤指示器 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <WorkflowStepper currentStep={currentStep} />
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <StepContent step={currentStep} />
        </motion.div>

        {/* 步骤导航 */}
        <div className="mt-6">
          <StepNavigation />
        </div>
      </div>

      {/* 工具特性说明 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">工具特性</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              基于观点片段级别的分析，提供更精准的Kano模型洞察
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">多格式支持</h3>
              <p className="text-gray-600 text-sm">支持CSV、Excel、TXT、Word等多种文件格式</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">智能拆解</h3>
              <p className="text-gray-600 text-sm">AI驱动的观点片段拆解，避免混合情感数据丢失</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">可视化分析</h3>
              <p className="text-gray-600 text-sm">交互式Kano象限图，直观展示功能优先级</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">策略建议</h3>
              <p className="text-gray-600 text-sm">基于分析结果自动生成可操作的改进建议</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}