/**
 * 全局错误边界组件
 * 捕获React组件树中的JavaScript错误，显示友好的错误界面
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppError, ErrorType } from '../../types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 提供错误捕获、错误显示和错误恢复功能
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新state以显示错误UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    this.setState({
      error,
      errorInfo
    });

    // 调用外部错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 在开发环境下打印详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // 在生产环境下可以发送错误报告到监控服务
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  /**
   * 报告错误到监控服务
   */
  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // 这里可以集成错误监控服务，如Sentry、LogRocket等
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // 发送错误报告（示例）
    console.error('Error Report:', errorReport);
  };

  /**
   * 重置错误状态
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * 刷新页面
   */
  private handleRefresh = () => {
    window.location.reload();
  };

  /**
   * 返回首页
   */
  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {/* 错误图标 */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-8 h-8 text-red-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                    />
                  </svg>
                </div>
              </div>

              {/* 错误标题 */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  出现了一些问题
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  应用程序遇到了意外错误，我们正在努力解决这个问题。
                </p>
              </div>

              {/* 错误详情（仅开发环境显示） */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-gray-100 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">错误详情：</h3>
                  <p className="text-xs text-gray-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer">
                        查看堆栈跟踪
                      </summary>
                      <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  重试
                </button>
                
                <button
                  type="button"
                  onClick={this.handleRefresh}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  刷新页面
                </button>
                
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  返回首页
                </button>
              </div>

              {/* 帮助信息 */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  如果问题持续存在，请联系技术支持或稍后再试。
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 错误通知组件
 * 用于显示非致命性错误的通知
 */
interface ErrorNotificationProps {
  error: AppError;
  onDismiss: () => void;
  onRetry?: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onDismiss,
  onRetry
}) => {
  /**
   * 获取错误类型对应的图标和颜色
   */
  const getErrorStyle = (type: ErrorType) => {
    switch (type) {
      case ErrorType.VALIDATION_ERROR:
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-800'
        };
      case ErrorType.NETWORK_ERROR:
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          textColor: 'text-orange-800'
        };
      default:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-800'
        };
    }
  };

  const style = getErrorStyle(error.type);

  return (
    <div className={`rounded-md p-4 ${style.bgColor} ${style.borderColor} border`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg 
            className={`h-5 w-5 ${style.iconColor}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${style.textColor}`}>
            {error.message}
          </h3>
          {error.details && (
            <div className={`mt-2 text-sm ${style.textColor}`}>
              <p>{error.details}</p>
            </div>
          )}
          <div className="mt-4 flex space-x-3">
            {error.retryable && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className={`text-sm font-medium ${style.textColor} hover:underline`}
              >
                重试
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className={`text-sm font-medium ${style.textColor} hover:underline`}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;