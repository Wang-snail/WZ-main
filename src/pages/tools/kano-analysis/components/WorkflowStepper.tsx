import React from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Settings,
  Brain,
  BarChart3,
  FileText,
  FileSpreadsheet,
  Check,
  Clock,
  AlertCircle
} from 'lucide-react';
import { WorkflowStep, useKanoToolStore } from '../store/kanoToolStore';

interface WorkflowStepperProps {
  currentStep: WorkflowStep;
}

const stepConfig = {
  [WorkflowStep.IMPORT]: {
    title: '导入数据',
    description: '上传或粘贴评论数据',
    icon: Upload,
  },
  [WorkflowStep.CONVERT]: {
    title: '格式转换',
    description: '转换为Markdown格式',
    icon: FileSpreadsheet,
  },
  [WorkflowStep.ORGANIZE]: {
    title: '数据整理',
    description: '清洗和标准化数据',
    icon: Settings,
  },
  [WorkflowStep.EXTRACT]: {
    title: '功能提取',
    description: '提取功能和观点片段',
    icon: Brain,
  },
  [WorkflowStep.SCORE]: {
    title: '情感积分',
    description: '分析情感并计算积分',
    icon: BarChart3,
  },
  [WorkflowStep.OUTPUT]: {
    title: '结构化输出',
    description: '生成分析结果和建议',
    icon: FileText,
  },
};

const stepOrder = [
  WorkflowStep.IMPORT,
  WorkflowStep.CONVERT,
  WorkflowStep.ORGANIZE,
  WorkflowStep.EXTRACT,
  WorkflowStep.SCORE,
  WorkflowStep.OUTPUT,
];

export function WorkflowStepper({ currentStep }: WorkflowStepperProps) {
  const { stepStatus, jumpToStep } = useKanoToolStore();

  const getStepIcon = (step: WorkflowStep, status: string) => {
    const IconComponent = stepConfig[step].icon;

    if (status === 'completed') {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <Check className="w-5 h-5" />
        </motion.div>
      );
    } else if (status === 'processing') {
      return (
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <IconComponent className="w-5 h-5" />
        </motion.div>
      );
    } else if (status === 'error') {
      return (
        <motion.div
          animate={{ 
            x: [-2, 2, -2, 2, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 0.5 }}
        >
          <AlertCircle className="w-5 h-5" />
        </motion.div>
      );
    } else {
      return <IconComponent className="w-5 h-5" />;
    }
  };

  const getStepColor = (step: WorkflowStep, status: string, isCurrent: boolean) => {
    if (status === 'completed') {
      return 'bg-green-500 text-white border-green-500';
    } else if (status === 'processing') {
      return 'bg-blue-500 text-white border-blue-500';
    } else if (status === 'error') {
      return 'bg-red-500 text-white border-red-500';
    } else if (isCurrent) {
      return 'bg-blue-100 text-blue-600 border-blue-300';
    } else {
      return 'bg-gray-100 text-gray-400 border-gray-300';
    }
  };

  const getConnectorColor = (fromStep: WorkflowStep, toStep: WorkflowStep) => {
    const fromStatus = stepStatus[fromStep];
    if (fromStatus === 'completed') {
      return 'bg-green-300';
    } else {
      return 'bg-gray-300';
    }
  };

  const canJumpToStep = (step: WorkflowStep) => {
    const stepIndex = stepOrder.indexOf(step);
    const currentIndex = stepOrder.indexOf(currentStep);

    // 可以跳转到当前步骤或之前已完成的步骤
    if (stepIndex <= currentIndex) return true;

    // 检查前面的步骤是否都已完成
    for (let i = 0; i < stepIndex; i++) {
      if (stepStatus[stepOrder[i]] !== 'completed') {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="flex items-center justify-between max-w-4xl mx-auto">
      {stepOrder.map((step, index) => {
        const config = stepConfig[step];
        const status = stepStatus[step];
        const isCurrent = step === currentStep;
        const isClickable = canJumpToStep(step);

        return (
          <React.Fragment key={step}>
            {/* 步骤圆圈 */}
            <div className="flex flex-col items-center">
              <motion.button
                onClick={() => isClickable && jumpToStep(step)}
                disabled={!isClickable}
                className={`
                  relative w-12 h-12 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200 mb-2
                  ${getStepColor(step, status, isCurrent)}
                  ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                `}
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
                animate={status === 'processing' ? {
                  boxShadow: [
                    "0 0 0 0 rgba(59, 130, 246, 0.7)",
                    "0 0 0 10px rgba(59, 130, 246, 0)",
                    "0 0 0 0 rgba(59, 130, 246, 0)"
                  ],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }
                } : {}}
              >
                {getStepIcon(step, status)}

                {/* 当前步骤指示器 */}
                {isCurrent && status !== 'processing' && (
                  <motion.div
                    className="absolute -inset-1 rounded-full border-2 border-blue-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* 处理中的脉冲效果 */}
                {status === 'processing' && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-blue-500 opacity-20"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.2, 0.1, 0.2]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.button>

              {/* 步骤标题和描述 */}
              <div className="text-center">
                <div className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-600'}`}>
                  {config.title}
                </div>
                <div className="text-xs text-gray-500 mt-1 max-w-20">
                  {config.description}
                </div>
              </div>
            </div>

            {/* 连接线 */}
            {index < stepOrder.length - 1 && (
              <div className="flex-1 mx-4 mb-8">
                <div
                  className={`h-0.5 transition-colors duration-300 ${getConnectorColor(step, stepOrder[index + 1])}`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}