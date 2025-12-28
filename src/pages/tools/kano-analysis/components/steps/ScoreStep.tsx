import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  Eye,
  Play,
  CheckCircle,
  AlertCircle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Download
} from 'lucide-react';

import { Button } from '../../../../../components/ui/button';
import {
  useKanoToolStore,
  useShallow,
  selectToolData,
  selectUIState,
  selectStepResults,
  selectDataActions,
  selectUIActions,
  selectActionActions,
  WorkflowStep,
  KanoFeature,
  ScoreStepResult
} from '../../store/kanoToolStore';
import { KanoAnalysisService, KanoAnalysisResult, KANO_CATEGORIES } from '../../services/KanoAnalysisService';

export function ScoreStep() {
  const data = useKanoToolStore(useShallow(selectToolData));
  const ui = useKanoToolStore(useShallow(selectUIState));
  const stepResults = useKanoToolStore(useShallow(selectStepResults));

  const { setFeatures, setScoreResult } = useKanoToolStore(useShallow(selectDataActions));
  const { setLoading, setError, setProgress } = useKanoToolStore(useShallow(selectUIActions));
  const { setStepStatus } = useKanoToolStore(useShallow(selectActionActions));

  const [scoring, setScoring] = useState(false);

  // 使用保存的结果
  const scoreResults = stepResults.score;

  // Kano情感积分
  const handleScoreFeatures = async () => {
    if (data.fragments.length === 0) {
      setError('没有可处理的观点片段，请先完成功能提取');
      return;
    }

    setScoring(true);
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      setProgress(20);

      // 使用Kano分析服务进行分析
      const analysisResults = KanoAnalysisService.analyzeFragments(data.fragments);

      setProgress(60);

      // 生成表格数据
      const tableData = KanoAnalysisService.generateKanoTable(analysisResults);

      setProgress(80);

      // 计算统计信息
      const categoryDistribution: Record<string, number> = {};
      analysisResults.forEach(result => {
        categoryDistribution[result.finalCategory] = (categoryDistribution[result.finalCategory] || 0) + 1;
      });

      const statistics = {
        totalFeatures: analysisResults.length,
        totalFragments: data.fragments.length,
        categoryDistribution
      };

      // 转换为KanoFeature格式以兼容现有store
      const features: KanoFeature[] = analysisResults.map(result => ({
        name: result.feature,
        category: result.finalCategory,
        frequency: result.totalVotes,
        avgSentiment: 0, // 在Kano模型中不使用平均情感
        sentimentVariance: 0, // 在Kano模型中不使用情感方差
        quadrant: KANO_CATEGORIES[result.finalCategory as keyof typeof KANO_CATEGORIES]?.name || '未知',
        priority: result.betterCoefficient, // 使用Better系数作为优先级
        fragments: result.fragments,
        evidenceTexts: result.evidenceTexts
      }));

      setScoreResult({
        analysisResults,
        tableData,
        statistics
      });

      setFeatures(features);
      setProgress(100);
      setStepStatus(WorkflowStep.SCORE, 'completed');

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Kano分析失败');
      setStepStatus(WorkflowStep.SCORE, 'error');
    } finally {
      setScoring(false);
      setLoading(false);
    }
  };

  // 导出Kano分析表格
  const handleExportTable = () => {
    if (!scoreResults) return;

    const csvContent = [
      ['产品功能', 'A(魅力特性)%', 'O(期望特性)%', 'M(必备特性)%', 'I(无差异特性)%', 'R(反向特性)%', 'Q(可疑结果)%', 'Kano定位', 'Better系数%', 'Worse系数%'].join(','),
      ...scoreResults.tableData.map(row => [
        row.feature,
        row.percentages.A.toFixed(1),
        row.percentages.O.toFixed(1),
        row.percentages.M.toFixed(1),
        row.percentages.I.toFixed(1),
        row.percentages.R.toFixed(1),
        row.percentages.Q.toFixed(1),
        `${row.finalCategory}(${KANO_CATEGORIES[row.finalCategory as keyof typeof KANO_CATEGORIES]?.name || '未知'})`,
        row.betterCoefficient.toFixed(2),
        row.worseCoefficient.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'kano_analysis_matrix.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* 步骤标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">情感积分</h2>
        <p className="text-gray-600">
          基于Kano模型对观点片段进行情感分析和分类积分
        </p>
      </div>

      {/* 数据统计 */}
      <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4">
        <div className="flex items-center mb-3">
          <Calculator className="w-5 h-5 text-indigo-600 mr-2" />
          <h4 className="font-medium text-indigo-800">待积分数据</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-indigo-700">观点片段：</span>
            <span className="font-medium text-indigo-900">{data.fragments.length} 个</span>
          </div>
          <div>
            <span className="text-indigo-700">功能类别：</span>
            <span className="font-medium text-indigo-900">
              {new Set(data.fragments.map(f => f.feature)).size} 种
            </span>
          </div>
          <div>
            <span className="text-indigo-700">已积分功能：</span>
            <span className="font-medium text-indigo-900">{data.features.length} 个</span>
          </div>
          <div>
            <span className="text-indigo-700">状态：</span>
            <span className="font-medium text-indigo-900">
              {data.features.length > 0 ? '已积分' : '待积分'}
            </span>
          </div>
        </div>
      </div>

      {/* 积分按钮 */}
      <div className="flex justify-center">
        <Button
          onClick={handleScoreFeatures}
          disabled={scoring || data.fragments.length === 0}
          className="px-8 py-3 text-lg"
        >
          {scoring ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              积分计算中...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5 mr-2" />
              开始Kano积分
            </>
          )}
        </Button>
      </div>

      {/* 进度条 */}
      {scoring && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">积分进度</span>
            <span className="text-sm text-gray-500">{ui.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${ui.progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            正在计算Kano分类和情感得分...
          </p>
        </div>
      )}

      {/* 错误提示 */}
      {ui.error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start"
        >
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-medium">积分失败</h4>
            <p className="text-red-700 text-sm mt-1">{ui.error}</p>
          </div>
        </motion.div>
      )}

      {/* 积分结果 */}
      {scoreResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-6"
        >
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-green-800 font-medium flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Kano积分结果
                </h4>
                <Button
                  onClick={handleExportTable}
                  variant="outline"
                  size="sm"
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  <Download className="w-4 h-4 mr-1" />
                  导出表格
                </Button>
              </div>

              {/* 统计概览 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded p-3 border">
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">功能总数</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{scoreResults.statistics.totalFeatures}</p>
                </div>
                <div className="bg-white rounded p-3 border">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium">观点片段</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">{scoreResults.statistics.totalFragments}</p>
                </div>
                <div className="bg-white rounded p-3 border">
                  <div className="flex items-center">
                    <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm font-medium">必备特性</span>
                  </div>
                  <p className="text-lg font-bold text-red-600">
                    {scoreResults.statistics.categoryDistribution.M || 0} 个
                  </p>
                </div>
                <div className="bg-white rounded p-3 border">
                  <div className="flex items-center">
                    <Minus className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">魅力特性</span>
                  </div>
                  <p className="text-lg font-bold text-gray-600">
                    {scoreResults.statistics.categoryDistribution.A || 0} 个
                  </p>
                </div>
              </div>

              {/* Kano分析矩阵表格 */}
              <div className="bg-white rounded border overflow-hidden mb-6">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <h5 className="font-medium text-gray-900">Kano分析矩阵表格</h5>
                  <p className="text-sm text-gray-600 mt-1">按照标准Kano模型进行分类统计</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-r">产品功能</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-700 border-r">A<br />(魅力特性)</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-700 border-r">O<br />(期望特性)</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-700 border-r">M<br />(必备特性)</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-700 border-r">I<br />(无差异特性)</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-700 border-r">R<br />(反向特性)</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-700 border-r">Q<br />(可疑结果)</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700 border-r">Kano定位</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-700 border-r">Better系数</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-700">Worse系数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoreResults.tableData.slice(0, 10).map((row, index) => (
                        <tr key={row.feature} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-900 border-r">{row.feature}</td>
                          <td className="px-2 py-2 text-center text-gray-700 border-r">{row.percentages.A.toFixed(1)}%</td>
                          <td className="px-2 py-2 text-center text-gray-700 border-r">{row.percentages.O.toFixed(1)}%</td>
                          <td className="px-2 py-2 text-center text-gray-700 border-r">{row.percentages.M.toFixed(1)}%</td>
                          <td className="px-2 py-2 text-center text-gray-700 border-r">{row.percentages.I.toFixed(1)}%</td>
                          <td className="px-2 py-2 text-center text-gray-700 border-r">{row.percentages.R.toFixed(1)}%</td>
                          <td className="px-2 py-2 text-center text-gray-700 border-r">{row.percentages.Q.toFixed(1)}%</td>
                          <td className="px-3 py-2 text-center border-r">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${KANO_CATEGORIES[row.finalCategory as keyof typeof KANO_CATEGORIES]?.color || 'bg-gray-100 text-gray-800'
                              }`}>
                              {row.finalCategory}({KANO_CATEGORIES[row.finalCategory as keyof typeof KANO_CATEGORIES]?.name || '未知'})
                            </span>
                          </td>
                          <td className="px-2 py-2 text-center font-medium text-green-600 border-r">
                            {row.betterCoefficient.toFixed(2)}%
                          </td>
                          <td className="px-2 py-2 text-center font-medium text-red-600">
                            {row.worseCoefficient.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {scoreResults.tableData.length > 10 && (
                  <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-500">
                    还有 {scoreResults.tableData.length - 10} 个功能未显示，请导出完整表格查看
                  </div>
                )}
              </div>

              {/* Kano类别分布 */}
              <div className="bg-white rounded border p-4 mb-6">
                <h5 className="font-medium text-gray-900 mb-3">Kano类别分布</h5>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {Object.entries(KANO_CATEGORIES).map(([category, info]) => {
                    const count = scoreResults.statistics.categoryDistribution[category] || 0;
                    return (
                      <div key={category} className="text-center">
                        <div className={`${info.color} rounded-lg p-3 mb-2`}>
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-xs font-medium">{category}</div>
                        </div>
                        <div className="text-xs text-gray-600">{info.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 下一步提示 */}
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-blue-800 text-sm">
                  ✅ Kano分析完成！共分析 {scoreResults.statistics.totalFeatures} 个功能，
                  识别出 {scoreResults.statistics.categoryDistribution.M || 0} 个必备特性、
                  {scoreResults.statistics.categoryDistribution.O || 0} 个期望特性、
                  {scoreResults.statistics.categoryDistribution.A || 0} 个魅力特性。
                  点击右下角的"下一步"按钮查看结构化输出和可视化分析。
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}