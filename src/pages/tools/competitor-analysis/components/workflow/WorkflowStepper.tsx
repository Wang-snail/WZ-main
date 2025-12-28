/**
 * 工作流步骤指示器组件
 * 显示当前进度和步骤导航
 */

import React from 'react';
import { useCompetitorAnalysisStore, useShallow } from '../../store/competitorAnalysisStore';
import type { WorkflowStep } from '../../types';

/**
 * 步骤配置
 */
interface StepConfig {
  id: WorkflowStep;
  name: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * 工作流步骤指示器组件
 */
const WorkflowStepper: React.FC = () => {
  const { currentStep, stepStatus } = useCompetitorAnalysisStore(
    useShallow((state: any) => ({
      currentStep: state.currentStep,
      stepStatus: state.stepStatus
    }))
  );

  const jumpToStep = useCompetitorAnalysisStore(state => state.jumpToStep);

  /**
   * 步骤配置数据
   */
  const steps: StepConfig[] = [
    {
      id: 'config',
      name: '产品配置',
      description: '设置基础产品信息',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'input',
      name: '竞品输入',
      description: '输入竞品信息',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      id: 'extract',
      name: '数据确认',
      description: '确认提取的数据',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'analyze',
      name: '分析计算',
      description: '执行智能分析',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'result',
      name: '分析结果',
      description: '查看分析报告',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  /**
   * 获取步骤状态样式
   */
  const getStepStyles = (step: StepConfig, index: number) => {
    const status = stepStatus[step.id];
    const isCurrent = currentStep === step.id;
    const isCompleted = status === 'completed';
    const isProcessing = status === 'processing';
    const isError = status === 'error';

    let containerClasses = 'relative flex items-center';
    let circleClasses = 'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200';
    let iconClasses = 'transition-colors duration-200';
    let textClasses = 'ml-3 text-sm font-medium transition-colors duration-200';

    if (isCompleted) {
      circleClasses += ' bg-green-500 border-green-500';
      iconClasses += ' text-white';
      textClasses += ' text-green-600';
    } else if (isCurrent) {
      if (isProcessing) {
        circleClasses += ' bg-blue-500 border-blue-500 animate-pulse';
        iconClasses += ' text-white';
        textClasses += ' text-blue-600';
      } else if (isError) {
        circleClasses += ' bg-red-500 border-red-500';
        iconClasses += ' text-white';
        textClasses += ' text-red-600';
      } else {
        circleClasses += ' bg-blue-500 border-blue-500';
        iconClasses += ' text-white';
        textClasses += ' text-blue-600';
      }
    } else {
      circleClasses += ' bg-gray-100 border-gray-300';
      iconClasses += ' text-gray-400';
      textClasses += ' text-gray-500';
    }

    return { containerClasses, circleClasses, iconClasses, textClasses };
  };

  /**
   * 获取连接线样式
   */
  const getConnectorStyles = (index: number) => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const isCompleted = index < currentIndex || stepStatus[steps[index].id] === 'completed';

    return isCompleted
      ? 'bg-green-500'
      : 'bg-gray-300';
  };

  /**
   * 处理步骤点击
   */
  const handleStepClick = (step: StepConfig) => {
    // 只允许跳转到已完成的步骤或当前步骤
    const status = stepStatus[step.id];
    if (status === 'completed' || step.id === currentStep) {
      jumpToStep(step.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* 移动端：水平滚动步骤指示器 */}
      <div className="block md:hidden">
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const styles = getStepStyles(step, index);
            const isClickable = stepStatus[step.id] === 'completed' || step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => handleStepClick(step)}
                  disabled={!isClickable}
                  className={`${styles.containerClasses} ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  title={step.description}
                >
                  <div className={styles.circleClasses}>
                    {stepStatus[step.id] === 'completed' ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className={styles.iconClasses}>
                        {step.icon}
                      </div>
                    )}
                  </div>
                </button>

                {/* 连接线 */}
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${getConnectorStyles(index)}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* 当前步骤信息 */}
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            {steps.find(s => s.id === currentStep)?.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {steps.find(s => s.id === currentStep)?.description}
          </p>
        </div>
      </div>

      {/* 桌面端：垂直步骤指示器 */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const styles = getStepStyles(step, index);
            const isClickable = stepStatus[step.id] === 'completed' || step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => handleStepClick(step)}
                  disabled={!isClickable}
                  className={`${styles.containerClasses} ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'} transition-opacity duration-200`}
                >
                  <div className={styles.circleClasses}>
                    {stepStatus[step.id] === 'completed' ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className={styles.iconClasses}>
                        {step.icon}
                      </div>
                    )}
                  </div>
                  <div className="hidden lg:block">
                    <div className={styles.textClasses}>
                      {step.name}
                    </div>
                    <div className="ml-3 text-xs text-gray-500 mt-1">
                      {step.description}
                    </div>
                  </div>
                </button>

                {/* 连接线 */}
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${getConnectorStyles(index)}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 进度百分比 */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>整体进度</span>
          <span>
            {(() => {
              const completedSteps = Object.values(stepStatus).filter(status => status === 'completed').length;
              const totalSteps = steps.length;
              const percentage = Math.round((completedSteps / totalSteps) * 100);
              return `${percentage}%`;
            })()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(() => {
                const completedSteps = Object.values(stepStatus).filter(status => status === 'completed').length;
                const totalSteps = steps.length;
                return (completedSteps / totalSteps) * 100;
              })()}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowStepper;