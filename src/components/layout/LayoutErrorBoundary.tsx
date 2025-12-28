/**
 * 布局错误边界组件
 * 捕获布局相关的错误并提供回退UI
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Monitor } from 'lucide-react';
import { layoutErrorHandler, LayoutError, LayoutConfiguration } from '@/utils/layoutErrorHandler';

interface LayoutErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: LayoutError, retry: () => void) => ReactNode;
  onError?: (error: LayoutError) => void;
  component?: string;
  enableAutoRecovery?: boolean;
  maxRetries?: number;
}

interface LayoutErrorBoundaryState {
  hasError: boolean;
  layoutError: LayoutError | null;
  retryCount: number;
  isRecovering: boolean;
  safeConfig: LayoutConfiguration | null;
}

/**
 * 布局错误边界组件
 */
export class LayoutErrorBoundary extends Component<LayoutErrorBoundaryProps, LayoutErrorBoundaryState> {
  private retryTimer: NodeJS.Timeout | null = null;

  constructor(props: LayoutErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      layoutError: null,
      retryCount: 0,
      isRecovering: false,
      safeConfig: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<LayoutErrorBoundaryState> {
    // 检查是否是布局相关错误
    if (LayoutErrorBoundary.isLayoutError(error)) {
      const layoutError: LayoutError = {
        type: 'css_grid_failure',
        component: 'LayoutErrorBoundary',
        viewport: LayoutErrorBoundary.getCurrentViewport(),
        details: {
          errorMessage: error.message
        },
        timestamp: new Date()
      };

      return {
        hasError: true,
        layoutError
      };
    }

    return {};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (LayoutErrorBoundary.isLayoutError(error)) {
      const layoutError: LayoutError = {
        type: 'css_grid_failure',
        component: this.props.component || 'LayoutErrorBoundary',
        viewport: LayoutErrorBoundary.getCurrentViewport(),
        details: {
          errorMessage: error.message,
          componentStack: errorInfo.componentStack
        },
        timestamp: new Date()
      };

      // 处理布局错误并获取安全配置
      const safeConfig = layoutErrorHandler.handleLayoutError(layoutError);
      
      this.setState({
        hasError: true,
        layoutError,
        safeConfig
      });

      // 调用错误回调
      if (this.props.onError) {
        this.props.onError(layoutError);
      }

      // 如果启用自动恢复，尝试恢复
      if (this.props.enableAutoRecovery && this.state.retryCount < (this.props.maxRetries || 3)) {
        this.scheduleRetry();
      }
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  /**
   * 检查是否是布局相关错误
   */
  static isLayoutError(error: Error): boolean {
    const layoutKeywords = [
      'grid',
      'flexbox',
      'layout',
      'css',
      'style',
      'responsive',
      'viewport',
      'overflow'
    ];

    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    return layoutKeywords.some(keyword => 
      message.includes(keyword) || stack.includes(keyword)
    );
  }

  /**
   * 获取当前视口信息
   */
  static getCurrentViewport(): { width: number; height: number; breakpoint: string } {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768, breakpoint: 'desktop' };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    let breakpoint = 'desktop';
    if (width < 768) breakpoint = 'mobile';
    else if (width < 1024) breakpoint = 'tablet';
    else if (width >= 1280) breakpoint = 'wide';

    return { width, height, breakpoint };
  }

  /**
   * 安排重试
   */
  scheduleRetry = () => {
    this.setState({ isRecovering: true });
    
    this.retryTimer = setTimeout(() => {
      this.handleRetry();
    }, 2000); // 2秒后重试
  };

  /**
   * 处理重试
   */
  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      layoutError: null,
      retryCount: prevState.retryCount + 1,
      isRecovering: false,
      safeConfig: null
    }));
  };

  /**
   * 手动重试
   */
  handleManualRetry = () => {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    this.handleRetry();
  };

  /**
   * 重置错误状态
   */
  handleReset = () => {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    
    this.setState({
      hasError: false,
      layoutError: null,
      retryCount: 0,
      isRecovering: false,
      safeConfig: null
    });
  };

  /**
   * 返回首页
   */
  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  /**
   * 刷新页面
   */
  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError && this.state.layoutError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback(this.state.layoutError, this.handleManualRetry);
      }

      // 默认错误界面
      return (
        <DefaultLayoutErrorFallback
          error={this.state.layoutError}
          safeConfig={this.state.safeConfig}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
          isRecovering={this.state.isRecovering}
          onRetry={this.handleManualRetry}
          onReset={this.handleReset}
          onGoHome={this.handleGoHome}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * 默认布局错误回退界面
 */
interface DefaultLayoutErrorFallbackProps {
  error: LayoutError;
  safeConfig: LayoutConfiguration | null;
  retryCount: number;
  maxRetries: number;
  isRecovering: boolean;
  onRetry: () => void;
  onReset: () => void;
  onGoHome: () => void;
  onReload: () => void;
}

const DefaultLayoutErrorFallback: React.FC<DefaultLayoutErrorFallbackProps> = ({
  error,
  safeConfig,
  retryCount,
  maxRetries,
  isRecovering,
  onRetry,
  onReset,
  onGoHome,
  onReload
}) => {
  const getErrorTypeDescription = (type: LayoutError['type']) => {
    switch (type) {
      case 'css_grid_failure':
        return 'CSS Grid 布局不支持或失败';
      case 'overflow':
        return '内容溢出容器';
      case 'performance':
        return '性能约束导致布局问题';
      case 'viewport_constraint':
        return '视口尺寸限制';
      case 'content_mismatch':
        return '内容与布局不匹配';
      default:
        return '未知布局错误';
    }
  };

  return (
    <div className="layout-error-boundary min-h-64 bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* 错误图标和标题 */}
          <div className="text-center mb-6">
            <Monitor className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">
              布局显示异常
            </h2>
            <p className="text-gray-600 mt-2">
              {getErrorTypeDescription(error.type)}
            </p>
          </div>

          {/* 错误详情 */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-orange-800">
              <div className="font-medium mb-2">错误信息:</div>
              <div className="mb-2">{error.details.errorMessage}</div>
              <div className="text-xs text-orange-600">
                组件: {error.component} | 
                视口: {error.viewport.width}x{error.viewport.height} ({error.viewport.breakpoint}) |
                时间: {error.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* 安全配置信息 */}
          {safeConfig && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-2">已启用安全模式:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>列数: {safeConfig.columns}</li>
                  <li>简化布局: {safeConfig.useSimplified ? '是' : '否'}</li>
                  <li>虚拟化: {safeConfig.enableVirtualization ? '是' : '否'}</li>
                  {safeConfig.maxItems && <li>最大项目数: {safeConfig.maxItems}</li>}
                </ul>
              </div>
            </div>
          )}

          {/* 恢复状态 */}
          {isRecovering && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-green-800">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">正在尝试恢复布局...</span>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="space-y-3">
            {retryCount < maxRetries && (
              <button
                onClick={onRetry}
                disabled={isRecovering}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isRecovering ? 'animate-spin' : ''}`} />
                <span>重试布局 ({retryCount}/{maxRetries})</span>
              </button>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onReset}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>重置</span>
              </button>
              
              <button
                onClick={onReload}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>刷新页面</span>
              </button>
            </div>
            
            <button
              onClick={onGoHome}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Home className="w-4 h-4" />
              <span>返回首页</span>
            </button>
          </div>

          {/* 帮助信息 */}
          <div className="text-center text-xs text-gray-500 mt-6">
            如果问题持续存在，请尝试使用不同的浏览器或设备
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 高阶组件：为组件添加布局错误边界
 */
export function withLayoutErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<LayoutErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <LayoutErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </LayoutErrorBoundary>
  );

  WrappedComponent.displayName = `withLayoutErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default LayoutErrorBoundary;