/**
 * 加载指示器和进度提示组件
 * 提供多种加载状态的视觉反馈
 */

import React from 'react';

/**
 * 加载指示器类型
 */
export type LoadingType = 'spinner' | 'dots' | 'pulse' | 'progress' | 'skeleton';

/**
 * 加载指示器属性
 */
interface LoadingIndicatorProps {
  /** 加载类型 */
  type?: LoadingType;
  /** 加载文本 */
  text?: string;
  /** 进度值 (0-100) */
  progress?: number;
  /** 大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示 */
  show?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 旋转加载器
 */
const SpinnerLoader: React.FC<{ size: string; className?: string }> = ({ size, className }) => (
  <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${size} ${className}`}>
    <span className="sr-only">Loading...</span>
  </div>
);

/**
 * 点状加载器
 */
const DotsLoader: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex space-x-1 ${className}`}>
    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

/**
 * 脉冲加载器
 */
const PulseLoader: React.FC<{ size: string; className?: string }> = ({ size, className }) => (
  <div className={`animate-pulse bg-current rounded ${size} ${className}`}></div>
);

/**
 * 进度条加载器
 */
const ProgressLoader: React.FC<{ progress: number; className?: string }> = ({ progress, className }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
      style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
    ></div>
  </div>
);

/**
 * 骨架屏加载器
 */
const SkeletonLoader: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    </div>
  </div>
);

/**
 * 主加载指示器组件
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  type = 'spinner',
  text,
  progress = 0,
  size = 'md',
  show = true,
  className = ''
}) => {
  if (!show) return null;

  // 尺寸映射
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const sizeClass = sizeClasses[size];

  // 渲染不同类型的加载器
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return <SpinnerLoader size={sizeClass} className="text-blue-600" />;
      case 'dots':
        return <DotsLoader className="text-blue-600" />;
      case 'pulse':
        return <PulseLoader size={sizeClass} className="text-blue-600" />;
      case 'progress':
        return <ProgressLoader progress={progress} />;
      case 'skeleton':
        return <SkeletonLoader />;
      default:
        return <SpinnerLoader size={sizeClass} className="text-blue-600" />;
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        {renderLoader()}
        {text && (
          <p className="text-sm text-gray-600 text-center">
            {text}
            {type === 'progress' && progress > 0 && (
              <span className="ml-2 font-medium">
                {Math.round(progress)}%
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * 全屏加载遮罩
 */
interface LoadingOverlayProps {
  /** 是否显示 */
  show: boolean;
  /** 加载文本 */
  text?: string;
  /** 进度值 */
  progress?: number;
  /** 是否可取消 */
  cancelable?: boolean;
  /** 取消回调 */
  onCancel?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  text = '正在处理...',
  progress,
  cancelable = false,
  onCancel
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center">
          {/* 加载指示器 */}
          <div className="mb-4">
            <LoadingIndicator
              type={progress !== undefined ? 'progress' : 'spinner'}
              progress={progress}
              size="lg"
            />
          </div>
          
          {/* 加载文本 */}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {text}
          </h3>
          
          {/* 进度信息 */}
          {progress !== undefined && (
            <p className="text-sm text-gray-600 mb-4">
              {Math.round(progress)}% 完成
            </p>
          )}
          
          {/* 取消按钮 */}
          {cancelable && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              取消
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 内联加载状态组件
 */
interface InlineLoadingProps {
  /** 是否正在加载 */
  loading: boolean;
  /** 加载文本 */
  loadingText?: string;
  /** 子组件 */
  children: React.ReactNode;
  /** 加载时的占位内容 */
  placeholder?: React.ReactNode;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  loading,
  loadingText = '加载中...',
  children,
  placeholder
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        {placeholder || (
          <LoadingIndicator
            type="spinner"
            text={loadingText}
            size="md"
          />
        )}
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * 按钮加载状态组件
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 是否正在加载 */
  loading: boolean;
  /** 加载文本 */
  loadingText?: string;
  /** 子组件 */
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  loadingText,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`relative ${className} ${loading ? 'cursor-not-allowed' : ''}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingIndicator type="spinner" size="sm" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {loading && loadingText ? loadingText : children}
      </span>
    </button>
  );
};

/**
 * 步骤进度指示器
 */
interface StepProgressProps {
  /** 当前步骤 */
  currentStep: number;
  /** 总步骤数 */
  totalSteps: number;
  /** 步骤标签 */
  stepLabels?: string[];
  /** 是否显示百分比 */
  showPercentage?: boolean;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  stepLabels = [],
  showPercentage = true
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* 进度条 */}
      <div className="flex items-center mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {showPercentage && (
          <span className="ml-3 text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      
      {/* 步骤信息 */}
      <div className="flex justify-between text-xs text-gray-600">
        <span>
          步骤 {currentStep} / {totalSteps}
        </span>
        {stepLabels[currentStep - 1] && (
          <span className="font-medium">
            {stepLabels[currentStep - 1]}
          </span>
        )}
      </div>
    </div>
  );
};

export default LoadingIndicator;