import React from 'react';

const serializeError = (error: any) => {
  if (error instanceof Error) {
    return error.message + '\n' + error.stack;
  }
  return JSON.stringify(error, null, 2);
};

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    // 更新错误状态
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 在开发环境和生产环境都打印错误信息
    console.error('Error caught by boundary:', error, errorInfo);
    // 在生产环境也输出到控制台，方便调试
    if (typeof window !== 'undefined') {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // 检查是否是生产环境
      const isProduction = import.meta.env.PROD;

      // 在生产环境中显示更友好的错误信息
      if (isProduction) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-2xl p-8 bg-white rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">页面加载出错</h2>
              <p className="text-gray-600 mb-4 text-center">
                抱歉，页面加载出现了问题。请尝试刷新页面或稍后再试。
              </p>
              <details className="mb-4 p-4 bg-gray-100 rounded text-sm">
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                  查看错误详情（用于调试）
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-red-600">
                  {serializeError(this.state.error)}
                </pre>
              </details>
              <div className="flex gap-4 justify-center">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  onClick={() => window.location.reload()}
                >
                  刷新页面
                </button>
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  onClick={() => window.location.href = '/'}
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>
        );
      }

      // 在开发环境中显示详细错误信息
      return (
        <div className="p-4 border border-red-500 rounded">
          <h2 className="text-red-500">Something went wrong.</h2>
          <pre className="mt-2 text-sm">{serializeError(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}