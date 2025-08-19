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
    // 在开发环境中打印错误信息
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 检查是否是生产环境（安全地检查，避免 process 未定义错误）
      const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
      
      // 在生产环境中显示更友好的错误信息
      if (isProduction) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">页面加载出错</h2>
              <p className="text-gray-600 mb-4">
                抱歉，页面加载出现了问题。请尝试刷新页面或稍后再试。
              </p>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                刷新页面
              </button>
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