/**
 * 数据确认卡片组件
 * 显示NLP提取的竞品数据，允许用户确认和编辑
 */

import React, { useState, useCallback } from 'react';
import { useCompetitorAnalysisStore, useShallow } from '../../store/competitorAnalysisStore';
import { CalculationService } from '../../services/analysis/CalculationService';
import { ReportGenerationService } from '../../services/analysis/ReportGenerationService';
import type { CompetitorData, ProductDimensions, AnalysisResult } from '../../types';

/**
 * 置信度颜色映射
 */
const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'text-green-600 bg-green-100';
  if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

/**
 * 置信度文本映射
 */
const getConfidenceText = (confidence: number): string => {
  if (confidence >= 0.8) return '高置信度';
  if (confidence >= 0.5) return '中等置信度';
  return '低置信度';
};

/**
 * 数据确认卡片组件
 */
const DataConfirmationCard: React.FC = () => {
  // 状态管理
  // 状态管理 - 使用 useShallow 和 granular selectors 优化高性能
  const { competitorData, baseProduct } = useCompetitorAnalysisStore(
    useShallow((state: any) => ({
      competitorData: state.competitorData,
      baseProduct: state.baseProduct
    }))
  );

  const updateCompetitorData = useCompetitorAnalysisStore(state => state.updateCompetitorData);
  const setLoading = useCompetitorAnalysisStore(state => state.setLoading);
  const setError = useCompetitorAnalysisStore(state => state.setError);
  const setProgress = useCompetitorAnalysisStore(state => state.setProgress);
  const nextStep = useCompetitorAnalysisStore(state => state.nextStep);
  const setStepStatus = useCompetitorAnalysisStore(state => state.setStepStatus);
  const setAnalysisResult = useCompetitorAnalysisStore(state => state.setAnalysisResult);

  // 本地编辑状态
  const [editingField, setEditingField] = useState<string | null>(null); // 当前编辑的字段
  const [editValues, setEditValues] = useState<Partial<CompetitorData>>({}); // 编辑中的值

  /**
   * 开始编辑字段
   */
  const startEditing = useCallback((field: string) => {
    if (!competitorData) return;

    setEditingField(field); // 设置编辑字段
    // 初始化编辑值
    setEditValues({
      [field]: competitorData[field as keyof CompetitorData]
    });
  }, [competitorData]);

  /**
   * 取消编辑
   */
  const cancelEditing = useCallback(() => {
    setEditingField(null); // 清除编辑字段
    setEditValues({}); // 清除编辑值
  }, []);

  /**
   * 保存编辑
   */
  const saveEditing = useCallback(() => {
    if (!editingField || !competitorData) return;

    // 更新竞品数据
    updateCompetitorData(editValues);

    // 结束编辑状态
    setEditingField(null);
    setEditValues({});
  }, [editingField, competitorData, editValues, updateCompetitorData]);

  /**
   * 处理输入变化
   */
  const handleInputChange = useCallback((field: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  /**
   * 处理尺寸输入变化
   */
  const handleDimensionChange = useCallback((dimension: keyof ProductDimensions, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditValues(prev => ({
      ...prev,
      dimensions: {
        ...(prev.dimensions || competitorData?.dimensions || { length: 0, width: 0, height: 0 }),
        [dimension]: numValue
      }
    }));
  }, [competitorData]);

  /**
   * 处理功能特性变化
   */
  const handleFeaturesChange = useCallback((value: string) => {
    const features = value.split('\n').map(f => f.trim()).filter(f => f.length > 0);
    setEditValues(prev => ({
      ...prev,
      features
    }));
  }, []);

  /**
   * 计算体积
   */
  const calculateVolume = useCallback((dimensions?: ProductDimensions): number => {
    if (!dimensions) return 0;
    return dimensions.length * dimensions.width * dimensions.height;
  }, []);

  /**
   * 获取对比结果
   */
  const getComparisonResult = useCallback((field: string, competitorValue: any, baseValue: any) => {
    switch (field) {
      case 'weight':
        if (!competitorValue || !baseValue) return null;
        const weightDiff = ((baseValue - competitorValue) / competitorValue * 100);
        return {
          advantage: weightDiff > 0,
          text: weightDiff > 0 ? `我方更轻 ${weightDiff.toFixed(1)}%` : `竞品更轻 ${Math.abs(weightDiff).toFixed(1)}%`,
          icon: weightDiff > 0 ? '🏆' : '⚠️'
        };

      case 'dimensions': {
        if (!competitorValue || !baseValue) return null;
        const compVolume = calculateVolume(competitorValue);
        const baseVolume = calculateVolume(baseValue);
        const volumeDiff = ((baseVolume - compVolume) / compVolume * 100);
        return {
          advantage: volumeDiff < 0,
          text: volumeDiff < 0 ? `我方更小 ${Math.abs(volumeDiff).toFixed(1)}%` : `竞品更小 ${volumeDiff.toFixed(1)}%`,
          icon: volumeDiff < 0 ? '🏆' : '⚠️'
        };
      }

      case 'features': {
        if (!competitorValue || !baseValue) return null;
        const compFeatureCount = competitorValue.length;
        const baseFeatureCount = baseValue.length;
        return {
          advantage: baseFeatureCount >= compFeatureCount,
          text: `我方 ${baseFeatureCount} 项 vs 竞品 ${compFeatureCount} 项`,
          icon: baseFeatureCount >= compFeatureCount ? '🏆' : '⚠️'
        };
      }

      default:
        return null;
    }
  }, [calculateVolume]);

  /**
   * 处理确认并分析
   */
  const handleConfirmAndAnalyze = useCallback(async () => {
    if (!competitorData || !baseProduct) {
      setError({
        type: 'VALIDATION_ERROR' as any,
        message: '数据不完整',
        details: '缺少竞品数据或基础产品信息',
        timestamp: new Date(),
        retryable: false
      });
      return;
    }

    try {
      setLoading(true); // 开始加载
      setProgress(0); // 重置进度
      setError(null); // 清除错误
      setStepStatus('extract', 'processing'); // 设置步骤状态

      // 使用静态方法进行计算
      setProgress(20);

      // 执行利润分析
      const profitResult = CalculationService.calculateCompleteProfitAnalysis(
        baseProduct,
        competitorData.price
      );
      const profitAnalysis = profitResult.result;
      setProgress(50);

      // 计算雷达图评分
      const radarScoresResult = CalculationService.calculateRadarScores(
        baseProduct,
        competitorData,
        profitAnalysis
      );
      const radarScores = radarScoresResult.result;
      setProgress(70);

      // 生成智能洞察
      const insights = ReportGenerationService.generateIntelligentInsights(
        radarScores,
        profitAnalysis,
        baseProduct,
        competitorData
      );
      setProgress(90);

      // 构建分析结果
      const analysisResult: AnalysisResult = {
        profitAnalysis,
        radarScores,
        insights,
        timestamp: new Date(),
        sessionId: useCompetitorAnalysisStore.getState().generateSessionId()
      };

      // 保存分析结果
      setAnalysisResult(analysisResult);
      setProgress(100);

      // 标记步骤完成并进入下一步
      setStepStatus('extract', 'completed');
      setStepStatus('analyze', 'completed');
      nextStep(); // 进入结果展示步骤

    } catch (error) {
      // 处理分析错误
      setError({
        type: 'CALCULATION_ERROR' as any,
        message: '分析计算失败',
        details: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date(),
        retryable: true
      });
      setStepStatus('extract', 'error'); // 设置错误状态
    } finally {
      setLoading(false); // 结束加载
      setProgress(0); // 重置进度
    }
  }, [competitorData, baseProduct, setLoading, setProgress, setError, setStepStatus, setAnalysisResult, nextStep]);

  // 如果没有竞品数据，显示空状态
  if (!competitorData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无提取数据</h3>
          <p className="mt-1 text-sm text-gray-500">请先完成竞品信息输入和解析</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          数据提取确认
        </h2>
        <p className="text-gray-600">
          请确认提取的竞品信息，可以手动修正不准确的数据
        </p>
      </div>

      {/* 提取结果卡片 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">提取结果确认</h3>
          <p className="text-sm text-gray-600 mt-1">
            系统已从输入文本中提取以下信息，请核实准确性
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {/* 价格信息 */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="text-sm font-medium text-gray-900">销售价格</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(competitorData.extractionConfidence.price)}`}>
                    {getConfidenceText(competitorData.extractionConfidence.price)}
                  </span>
                </div>

                {editingField === 'price' ? (
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      value={editValues.price || competitorData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className="block w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-sm text-gray-500">USD</span>
                    <button
                      onClick={saveEditing}
                      className="text-green-600 hover:text-green-500 text-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-gray-600 hover:text-gray-500 text-sm"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-lg font-semibold text-green-600">
                      ${competitorData.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => startEditing('price')}
                      className="text-blue-600 hover:text-blue-500 text-sm"
                    >
                      编辑
                    </button>
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600">提取来源</p>
                <p className="text-sm font-medium">文本解析</p>
              </div>
            </div>
          </div>

          {/* 重量信息 */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="text-sm font-medium text-gray-900">产品重量</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(competitorData.extractionConfidence.weight)}`}>
                    {getConfidenceText(competitorData.extractionConfidence.weight)}
                  </span>
                </div>

                {editingField === 'weight' ? (
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.1"
                      value={editValues.weight || competitorData.weight || ''}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || undefined)}
                      className="block w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="未提取到"
                    />
                    <span className="text-sm text-gray-500">g</span>
                    <button
                      onClick={saveEditing}
                      className="text-green-600 hover:text-green-500 text-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-gray-600 hover:text-gray-500 text-sm"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {competitorData.weight ? `${competitorData.weight}g` : '未提取到'}
                    </span>
                    <button
                      onClick={() => startEditing('weight')}
                      className="text-blue-600 hover:text-blue-500 text-sm"
                    >
                      编辑
                    </button>
                  </div>
                )}
              </div>

              <div className="text-right">
                {baseProduct && competitorData.weight && (
                  <>
                    <p className="text-sm text-gray-600">对比我方</p>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">{baseProduct.weight}g</span>
                      {(() => {
                        const comparison = getComparisonResult('weight', competitorData.weight, baseProduct.weight);
                        return comparison ? (
                          <span className={`text-sm ${comparison.advantage ? 'text-green-600' : 'text-yellow-600'}`}>
                            {comparison.icon} {comparison.text}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 尺寸信息 */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="text-sm font-medium text-gray-900">产品尺寸</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(competitorData.extractionConfidence.dimensions)}`}>
                    {getConfidenceText(competitorData.extractionConfidence.dimensions)}
                  </span>
                </div>

                {editingField === 'dimensions' ? (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.1"
                        value={editValues.dimensions?.length || competitorData.dimensions?.length || ''}
                        onChange={(e) => handleDimensionChange('length', e.target.value)}
                        className="block w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="长"
                      />
                      <span className="text-sm text-gray-500">×</span>
                      <input
                        type="number"
                        step="0.1"
                        value={editValues.dimensions?.width || competitorData.dimensions?.width || ''}
                        onChange={(e) => handleDimensionChange('width', e.target.value)}
                        className="block w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="宽"
                      />
                      <span className="text-sm text-gray-500">×</span>
                      <input
                        type="number"
                        step="0.1"
                        value={editValues.dimensions?.height || competitorData.dimensions?.height || ''}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                        className="block w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="高"
                      />
                      <span className="text-sm text-gray-500">cm</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={saveEditing}
                        className="text-green-600 hover:text-green-500 text-sm"
                      >
                        保存
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-gray-600 hover:text-gray-500 text-sm"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {competitorData.dimensions
                        ? `${competitorData.dimensions.length} × ${competitorData.dimensions.width} × ${competitorData.dimensions.height} cm`
                        : '未提取到'
                      }
                    </span>
                    <button
                      onClick={() => startEditing('dimensions')}
                      className="text-blue-600 hover:text-blue-500 text-sm"
                    >
                      编辑
                    </button>
                  </div>
                )}

                {competitorData.dimensions && (
                  <p className="text-sm text-gray-500 mt-1">
                    体积: {calculateVolume(competitorData.dimensions).toFixed(1)} cm³
                  </p>
                )}
              </div>

              <div className="text-right">
                {baseProduct && competitorData.dimensions && (
                  <>
                    <p className="text-sm text-gray-600">对比我方</p>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">{calculateVolume(baseProduct.dimensions).toFixed(1)} cm³</span>
                      {(() => {
                        const comparison = getComparisonResult('dimensions', competitorData.dimensions, baseProduct.dimensions);
                        return comparison ? (
                          <span className={`text-sm ${comparison.advantage ? 'text-green-600' : 'text-yellow-600'}`}>
                            {comparison.icon} {comparison.text}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 功能特性 */}
          <div className="px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="text-sm font-medium text-gray-900">功能特性</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(competitorData.extractionConfidence.features)}`}>
                    {getConfidenceText(competitorData.extractionConfidence.features)}
                  </span>
                </div>

                {editingField === 'features' ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={4}
                      value={(editValues.features || competitorData.features).join('\n')}
                      onChange={(e) => handleFeaturesChange(e.target.value)}
                      className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="每行一个特性"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={saveEditing}
                        className="text-green-600 hover:text-green-500 text-sm"
                      >
                        保存
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-gray-600 hover:text-gray-500 text-sm"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {competitorData.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => startEditing('features')}
                      className="text-blue-600 hover:text-blue-500 text-sm"
                    >
                      编辑特性
                    </button>
                  </div>
                )}
              </div>

              <div className="text-right ml-4">
                {baseProduct && (
                  <>
                    <p className="text-sm text-gray-600">对比我方</p>
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const comparison = getComparisonResult('features', competitorData.features, baseProduct.features);
                        return comparison ? (
                          <span className={`text-sm ${comparison.advantage ? 'text-green-600' : 'text-yellow-600'}`}>
                            {comparison.icon} {comparison.text}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">提取质量:</span>
              {(() => {
                const conf = competitorData.extractionConfidence;
                const avgConfidence = (conf.price + conf.weight + conf.dimensions + conf.features) / 4;
                if (avgConfidence >= 0.8) return <span className="text-green-600 ml-1">优秀</span>;
                if (avgConfidence >= 0.5) return <span className="text-yellow-600 ml-1">良好</span>;
                return <span className="text-red-600 ml-1">需要人工确认</span>;
              })()}
            </div>

            <button
              type="button"
              onClick={handleConfirmAndAnalyze}
              disabled={editingField !== null}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              确认数据并开始分析
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataConfirmationCard;