/**
 * 性能监控组件
 * 显示应用性能指标和健康状态
 */

import React, { useState, useEffect } from 'react';
import { usePerformanceOptimization } from '../../utils/performance';

/**
 * 性能监控组件属性
 */
interface PerformanceMonitorProps {
  /** 是否显示详细指标 */
  showDetails?: boolean;
  /** 是否在开发环境中显示 */
  showInDevelopment?: boolean;
}

/**
 * 性能监控组件
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showDetails = false,
  showInDevelopment = true
}) => {
  const { metrics, checkHealth } = usePerformanceOptimization();
  const [isVisible, setIsVisible] = useState(false);
  const [healthStatus, setHealthStatus] = useState<ReturnType<typeof checkHealth> | null>(null);

  // 只在开发环境或明确要求时显示
  const shouldShow = process.env.NODE_ENV === 'development' ? showInDevelopment : true;

  // 定期检查健康状态
  useEffect(() => {
    if (!shouldShow) return;
    
    const interval = setInterval(() => {
      const newHealthStatus = checkHealth();
      setHealthStatus(newHealthStatus);
    }, 10000); // 每10秒检查一次

    return () => clearInterval(interval);
  }, [checkHealth, shouldShow]);

  // 键盘快捷键切换显示
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!shouldShow) return null;

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * 格式化时间
   */
  const formatTime = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  /**
   * 格式化内存
   */
  const formatMemory = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(1)}KB`;
    if (mb < 1024) return `${mb.toFixed(1)}MB`;
    return `${(mb / 1024).toFixed(2)}GB`;
  };

  return (
    <>
      {/* 性能状态指示器 */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
            healthStatus ? getStatusColor(healthStatus.status) : 'text-gray-600 bg-gray-100'
          } hover:shadow-lg`}
          title="性能监控 (Ctrl+Shift+P)"
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${
            healthStatus?.status === 'good' ? 'bg-green-500' :
            healthStatus?.status === 'warning' ? 'bg-yellow-500' :
            healthStatus?.status === 'critical' ? 'bg-red-500' : 'bg-gray-500'
          }`} />
          性能
          {healthStatus && healthStatus.issues.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-white bg-opacity-50 rounded-full text-xs">
              {healthStatus.issues.length}
            </span>
          )}
        </button>
      </div>

      {/* 详细性能面板 */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">性能监控</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* 健康状态 */}
            {healthStatus && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">系统状态</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(healthStatus.status)}`}>
                    {healthStatus.status === 'good' ? '良好' :
                     healthStatus.status === 'warning' ? '警告' : '严重'}
                  </span>
                </div>

                {healthStatus.issues.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">发现问题:</span>
                    <ul className="space-y-1">
                      {healthStatus.issues.map((issue: string, index: number) => (
                        <li key={index} className="text-sm text-red-600 flex items-start">
                          <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {healthStatus.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">优化建议:</span>
                    <ul className="space-y-1">
                      {healthStatus.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-blue-600 flex items-start">
                          <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 性能指标 */}
            {showDetails && (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">性能指标</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600">图表渲染</div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatTime(metrics.chartRenderTime)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600">数据计算</div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatTime(metrics.calculationTime)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600">内存使用</div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatMemory(metrics.memoryUsage)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600">渲染次数</div>
                    <div className="text-sm font-medium text-gray-900">
                      {metrics.renderCount}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center pt-2">
                  最后更新: {metrics.lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            )}

            {/* 快捷键提示 */}
            <div className="pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                按 Ctrl+Shift+P 切换显示
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceMonitor;