/**
 * 智能竞品分析主页面组件
 * 提供完整的竞品分析工作流界面
 */

import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCompetitorAnalysisStore, useShallow } from './store/competitorAnalysisStore';
import ProductConfigPanel from './components/workflow/ProductConfigPanel';
import CompetitorInputPanel from './components/workflow/CompetitorInputPanel';
import DataConfirmationCard from './components/workflow/DataConfirmationCard';
import RadarChartComponent from './components/analysis/RadarChartComponent';
import AnalysisReportComponent from './components/analysis/AnalysisReportComponent';
import RoleViewSwitcher from './components/common/RoleViewSwitcher';
import WorkflowStepper from './components/workflow/WorkflowStepper';
import SessionManagement from './components/session/SessionManagement';
import ErrorBoundary, { ErrorNotification } from './components/common/ErrorBoundary';
import KeyboardShortcutsHelp from './components/common/KeyboardShortcutsHelp';
import { LoadingOverlay, StepProgress } from './components/common/LoadingIndicator';

// 稳定的选择器函数，避免在每次渲染时重新创建
const selectCurrentStep = (state: any) => state.currentStep;
const selectUIState = (state: any) => state.ui;
const selectToggleHelp = (state: any) => state.toggleHelp;
const selectSetError = (state: any) => state.setError;

/**
 * 智能竞品分析页面组件
 * 
 * 功能特性：
 * - 产品配置和基础数据管理
 * - 竞品信息智能提取
 * - 利润与ROI分析计算
 * - 多维度雷达图可视化
 * - 智能分析报告生成
 * - 角色视图切换
 * - 会话管理和历史记录
 */
const CompetitorAnalysisPage: React.FC = () => {
  // 使用稳定的选择器获取状态
  // 使用 useShallow 优化性能
  const currentStep = useCompetitorAnalysisStore(selectCurrentStep);
  const { error, loading, progress } = useCompetitorAnalysisStore(
    useShallow((state: any) => ({
      error: state.ui.error,
      loading: state.ui.loading,
      progress: state.ui.progress
    }))
  );
  const toggleHelp = useCompetitorAnalysisStore(selectToggleHelp);
  const setError = useCompetitorAnalysisStore(selectSetError);

  // 本地状态
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // 稳定的回调函数
  const handleToggleHelp = useCallback(() => {
    toggleHelp();
  }, [toggleHelp]);

  const handleSetError = useCallback((error: any) => {
    setError(error);
  }, [setError]);

  const handleShowShortcuts = useCallback(() => {
    setShowShortcutsHelp(true);
  }, []);

  const handleHideShortcuts = useCallback(() => {
    setShowShortcutsHelp(false);
  }, []);

  // 工作流步骤映射
  const stepLabels = ['产品配置', '竞品输入', '数据确认', '分析计算', '结果展示'];
  const stepIndex = ['config', 'input', 'extract', 'analyze', 'result'].indexOf(currentStep);
  const currentStepNumber = stepIndex + 1;

  /**
   * 渲染当前步骤的内容
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 'config':
        return <ProductConfigPanel />;
      case 'input':
        return <CompetitorInputPanel />;
      case 'extract':
        return <DataConfirmationCard />;
      case 'analyze':
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">正在分析计算...</h3>
            <p className="text-gray-600">系统正在处理数据，请稍候</p>
          </div>
        );
      case 'result':
        return (
          <div className="space-y-6 lg:space-y-8">
            {/* 角色视图切换器 - 在移动端置顶 */}
            <div className="lg:hidden">
              <RoleViewSwitcher />
            </div>

            {/* 桌面端布局：左侧雷达图，右侧角色切换器 */}
            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
              <div className="lg:col-span-2">
                <RadarChartComponent />
              </div>
              <div className="lg:col-span-1">
                <RoleViewSwitcher />
              </div>
            </div>

            {/* 移动端布局：垂直堆叠 */}
            <div className="lg:hidden">
              <RadarChartComponent />
            </div>

            {/* 分析报告 - 全宽显示 */}
            <AnalysisReportComponent />
          </div>
        );
      default:
        return <ProductConfigPanel />;
    }
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('React Error Boundary:', error, errorInfo);
      }}
    >
      <>
        {/* SEO优化的页面头部信息 */}
        <Helmet>
          <title>智能竞品分析工具 - 产品竞争力评估与利润分析</title>
          <meta
            name="description"
            content="智能竞品分析工具，通过AI文本解析快速提取竞品信息，自动计算利润空间和ROI，生成多维度竞争力雷达图，为产品决策提供数据支持。"
          />
          <meta
            name="keywords"
            content="竞品分析,产品分析,利润计算,ROI分析,雷达图,市场分析,产品经理工具"
          />
        </Helmet>

        {/* 全局加载遮罩 */}
        <LoadingOverlay
          show={loading}
          text={currentStep === 'analyze' ? '正在分析竞品数据...' : '处理中...'}
          progress={currentStep === 'analyze' ? progress : undefined}
          cancelable={false}
        />

        {/* 全局错误通知 */}
        {error && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            <ErrorNotification
              error={error}
              onDismiss={() => handleSetError(null)}
              onRetry={error.retryable ? () => {
                handleSetError(null);
              } : undefined}
            />
          </div>
        )}

        {/* 页面主容器 */}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* 页面头部 */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                {/* 标题区域 */}
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                      智能竞品分析
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                      AI驱动的产品竞争力评估与利润分析工具
                    </p>
                  </div>
                </div>

                {/* 操作按钮区域 */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* 会话管理组件 */}
                  <SessionManagement />

                  {/* 帮助按钮 */}
                  <button
                    type="button"
                    onClick={handleToggleHelp}
                    className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    title="使用帮助 (Ctrl+H)"
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="hidden sm:inline">使用帮助</span>
                  </button>

                  {/* 快捷键帮助按钮 */}
                  <button
                    type="button"
                    onClick={handleShowShortcuts}
                    className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    title="快捷键帮助 (F1)"
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span className="hidden sm:inline">快捷键</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* 主内容区域 */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {/* 工作流步骤指示器 */}
            <WorkflowStepper />

            {/* 步骤进度指示器 */}
            <div className="mb-6">
              <StepProgress
                currentStep={currentStepNumber}
                totalSteps={5}
                stepLabels={stepLabels}
                showPercentage={true}
              />
            </div>

            {/* 步骤内容 */}
            <div className="min-h-[60vh]">
              {renderStepContent()}
            </div>
          </main>
        </div>

        {/* 快捷键帮助弹窗 */}
        <KeyboardShortcutsHelp
          show={showShortcutsHelp}
          onClose={handleHideShortcuts}
        />
      </>
    </ErrorBoundary>
  );
};

export default CompetitorAnalysisPage;