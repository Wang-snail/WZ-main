/**
 * 雷达图组件
 * 使用ECharts展示五维度竞争力分析
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as echarts from 'echarts';
import jsPDF from 'jspdf';
import { useCompetitorAnalysisStore, useShallow } from '../../store/competitorAnalysisStore';
import { RoleAdaptationService } from '../../services/nlp/RoleAdaptationService';
import { performanceOptimizer, CHART_PERFORMANCE_CONFIG } from '../../utils/performance';
import type { RadarScores, ChartExportOptions } from '../../types';

/**
 * 雷达图维度配置
 */
interface RadarDimension {
  /** 维度名称 */
  name: string;
  /** 维度描述 */
  description: string;
  /** 最大值 */
  max: number;
  /** 颜色 */
  color: string;
}

/**
 * 雷达图维度定义
 */
const RADAR_DIMENSIONS: RadarDimension[] = [
  {
    name: '利润空间',
    description: '毛利率越高得分越高',
    max: 10,
    color: '#10B981'
  },
  {
    name: 'ROI速度',
    description: '回本周期越短得分越高',
    max: 10,
    color: '#3B82F6'
  },
  {
    name: '便携指数',
    description: '重量和体积优势',
    max: 10,
    color: '#8B5CF6'
  },
  {
    name: '功能丰富度',
    description: '功能特性对比',
    max: 10,
    color: '#F59E0B'
  },
  {
    name: '价格竞争力',
    description: '价格优势和溢价能力',
    max: 10,
    color: '#EF4444'
  }
];

/**
 * 雷达图组件属性
 */
interface RadarChartComponentProps {
  /** 图表高度 */
  height?: number;
  /** 是否显示导出按钮 */
  showExportButton?: boolean;
  /** 是否显示详细信息 */
  showDetails?: boolean;
}

/**
 * 雷达图组件
 */
const RadarChartComponent: React.FC<RadarChartComponentProps> = ({
  height = 400,
  showExportButton = true,
  showDetails = true
}) => {
  // 图表容器引用
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 状态管理
  // 状态管理 - 使用 useShallow 优化性能
  const { analysisResult, roleView } = useCompetitorAnalysisStore(
    useShallow((state: any) => ({
      analysisResult: state.analysisResult,
      roleView: state.roleView
    }))
  );

  // 本地状态
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null); // 悬停的维度
  const [exportLoading, setExportLoading] = useState(false); // 导出加载状态
  const [showExportMenu, setShowExportMenu] = useState(false); // 导出菜单显示状态

  /**
   * 优化的图表配置（使用useMemo缓存）
   */
  const chartConfig = useMemo(() => {
    if (!analysisResult?.radarScores) return null;

    // 直接使用 radarScores 生成配置，避免循环依赖
    const config = RoleAdaptationService.getRadarChartConfig(roleView, analysisResult.radarScores);

    // 应用性能优化配置
    return {
      ...config,
      animation: true,
      animationDuration: CHART_PERFORMANCE_CONFIG.animation.duration,
      animationEasing: CHART_PERFORMANCE_CONFIG.animation.easing as any,
      lazyUpdate: CHART_PERFORMANCE_CONFIG.lazyUpdate
    };
  }, [analysisResult?.radarScores, roleView]);

  /**
   * 优化的图表初始化
   */
  const initChart = useCallback(() => {
    if (!chartRef.current || !chartConfig) return;

    // 使用性能优化的渲染函数
    performanceOptimizer.optimizedChartRender(() => {
      // 销毁现有图表实例
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // 创建新的图表实例
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: CHART_PERFORMANCE_CONFIG.renderer
      });

      // 设置图表配置
      chartInstance.current.setOption(chartConfig, true);

      // 添加事件监听
      chartInstance.current.on('mouseover', (params: any) => {
        if (params.componentType === 'radar') {
          const dimension = RADAR_DIMENSIONS[params.dataIndex];
          setHoveredDimension(dimension.name);
        }
      });

      chartInstance.current.on('mouseout', () => {
        setHoveredDimension(null);
      });
    });

    // 响应式处理（使用节流优化）
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartConfig]);

  /**
   * 导出图表
   */
  const exportChart = useCallback(async (options: ChartExportOptions) => {
    if (!chartInstance.current) return;

    try {
      setExportLoading(true);

      if (options.format === 'pdf') {
        // PDF导出处理
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('无法创建Canvas上下文');

        // 设置画布尺寸
        const width = options.width || 800;
        const height = options.height || 600;
        canvas.width = width;
        canvas.height = height;

        // 获取图表PNG数据
        const dataURL = chartInstance.current.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: options.backgroundColor || '#ffffff'
        });

        // 创建图片对象
        const img = new Image();
        img.onload = () => {
          // 绘制到画布
          ctx.fillStyle = options.backgroundColor || '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // 创建PDF
          const pdf = new jsPDF({
            orientation: width > height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [width, height]
          });

          // 添加标题（如果需要）
          if (options.includeTitle) {
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('产品竞争力雷达图分析', width / 2, 30, { align: 'center' });
          }

          // 添加图表
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, options.includeTitle ? 50 : 0, width, options.includeTitle ? height - 50 : height);

          // 下载PDF
          pdf.save(`竞争力雷达图_${new Date().toISOString().split('T')[0]}.pdf`);
        };
        img.src = dataURL;
      } else {
        // PNG/SVG导出处理
        const dataURL = chartInstance.current.getDataURL({
          type: options.format === 'svg' ? 'svg' : 'png',
          pixelRatio: 2,
          backgroundColor: options.backgroundColor || '#ffffff'
        });

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `竞争力雷达图_${new Date().toISOString().split('T')[0]}.${options.format}`;
        link.href = dataURL;

        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (error) {
      console.error('图表导出失败:', error);
    } finally {
      setExportLoading(false);
    }
  }, []);

  /**
   * 处理导出按钮点击
   */
  const handleExport = useCallback((format: 'png' | 'svg' | 'pdf') => {
    exportChart({
      format,
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      includeTitle: true
    });
    setShowExportMenu(false);
  }, [exportChart]);

  /**
   * 获取维度得分颜色
   */
  const getScoreColor = useCallback((score: number): string => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  }, []);

  /**
   * 获取维度得分等级
   */
  const getScoreLevel = useCallback((score: number): string => {
    if (score >= 8) return '优秀';
    if (score >= 6) return '良好';
    if (score >= 4) return '一般';
    return '需改进';
  }, []);

  // 初始化和更新图表（添加性能监控）
  useEffect(() => {
    if (!chartConfig) return;

    const cleanup = initChart();

    // 预加载资源
    performanceOptimizer.preloadResources();

    return cleanup;
  }, [chartConfig]); // 直接依赖 chartConfig，而不是 initChart

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  // 点击外部关闭导出菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && !(event.target as Element).closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // 如果没有分析结果，显示空状态
  if (!analysisResult) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无分析数据</h3>
          <p className="mt-1 text-sm text-gray-500">请先完成竞品分析流程</p>
        </div>
      </div>
    );
  }

  const { radarScores } = analysisResult;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 图表头部 */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">竞争力雷达图</h3>
            <p className="text-sm text-gray-600 mt-1">
              五维度产品竞争力评估
              {roleView === 'retail' && '（零售PM视角）'}
              {roleView === 'manufacturing' && '（制造PM视角）'}
            </p>
          </div>

          {showExportButton && (
            <div className="relative export-menu-container">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exportLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {exportLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                导出图表
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 导出格式下拉菜单 */}
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('png')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      PNG 图片
                      <span className="ml-auto text-xs text-gray-500">高质量位图</span>
                    </button>
                    <button
                      onClick={() => handleExport('svg')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-4a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      SVG 矢量图
                      <span className="ml-auto text-xs text-gray-500">可缩放矢量</span>
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF 文档
                      <span className="ml-auto text-xs text-gray-500">便于分享</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* 图表容器 */}
        <div
          ref={chartRef}
          style={{ height: `${height}px` }}
          className="w-full"
        />

        {/* 详细信息 */}
        {showDetails && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {RADAR_DIMENSIONS.map((dimension, index) => {
              const scores = [
                radarScores.profitability,
                radarScores.roiSpeed,
                radarScores.portability,
                radarScores.features,
                radarScores.priceAdvantage
              ];
              const score = scores[index];
              const isHovered = hoveredDimension === dimension.name;

              return (
                <div
                  key={dimension.name}
                  className={`p-4 rounded-lg border transition-all duration-200 ${isHovered
                    ? 'border-blue-300 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {dimension.name}
                    </h4>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: dimension.color }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                        {score.toFixed(1)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getScoreColor(score)} bg-opacity-10`}>
                        {getScoreLevel(score)}
                      </span>
                    </div>

                    {/* 进度条 */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(score / 10) * 100}%`,
                          backgroundColor: dimension.color
                        }}
                      />
                    </div>

                    <p className="text-xs text-gray-600">
                      {dimension.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 综合评分 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">综合竞争力评分</h4>
              <p className="text-xs text-gray-600">基于五个维度的加权平均分</p>
            </div>
            <div className="text-right">
              {(() => {
                const avgScore = (
                  radarScores.profitability +
                  radarScores.roiSpeed +
                  radarScores.portability +
                  radarScores.features +
                  radarScores.priceAdvantage
                ) / 5;

                return (
                  <>
                    <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
                      {avgScore.toFixed(1)}
                    </div>
                    <div className={`text-sm ${getScoreColor(avgScore)}`}>
                      {getScoreLevel(avgScore)}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* 角色特定分析提示 */}
        {(() => {
          const roleHints = RoleAdaptationService.getRoleAnalysisHints(roleView, radarScores);
          const roleConfig = RoleAdaptationService.getRoleConfig(roleView);

          if (roleHints.length === 0) return null;

          return (
            <div className="mt-6 p-4 rounded-lg border" style={{
              borderColor: roleConfig.themeColor + '40',
              backgroundColor: roleConfig.themeColor + '08'
            }}>
              <div className="flex items-center mb-3">
                <div
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: roleConfig.themeColor }}
                />
                <h4 className="text-sm font-medium text-gray-900">
                  {roleConfig.roleName}视角分析提示
                </h4>
              </div>
              <div className="space-y-2">
                {roleHints.map((hint, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-sm">{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default RadarChartComponent;