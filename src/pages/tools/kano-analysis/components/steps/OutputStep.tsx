import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  FileText,
  Image,
  Table,
  Lightbulb,
  Target,
  TrendingUp,
  AlertTriangle,
  Info,
  Zap,
  Shield,
  Star,
  Minus
} from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import {
  useKanoToolStore,
  useShallow,
  selectToolData,
  selectUIState,
  selectConfig,
  selectDataActions,
  selectUIActions,
  KanoAnalysisResult,
  KanoFeature
} from '../../store/kanoToolStore';
import { KanoAnalysisService, KanoAnalysisResult as ServiceResult, KANO_CATEGORIES } from '../../services/KanoAnalysisService';

export function OutputStep() {
  const data = useKanoToolStore(useShallow(selectToolData));
  const ui = useKanoToolStore(useShallow(selectUIState));
  const config = useKanoToolStore(useShallow(selectConfig));

  const { setAnalysis } = useKanoToolStore(useShallow(selectDataActions));
  const { setLoading, setError } = useKanoToolStore(useShallow(selectUIActions));

  const [generating, setGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<KanoAnalysisResult | null>(null);
  const [serviceResults, setServiceResults] = useState<ServiceResult[] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成分析结果
  useEffect(() => {
    if (data.features.length > 0 && !analysisResult) {
      generateAnalysis();
    }
  }, [data.features, analysisResult]);

  const generateAnalysis = useCallback(async () => {
    if (data.features.length === 0) {
      setError('没有可分析的功能数据，请先完成情感积分');
      return;
    }

    setGenerating(true);
    setLoading(true);
    setError(null);

    try {
      // 使用KanoAnalysisService重新分析以获取Better/Worse系数
      const serviceResults = KanoAnalysisService.analyzeFragments(data.fragments);
      setServiceResults(serviceResults);

      // 计算统计信息
      const totalFragments = data.fragments.length;
      const totalFeatures = data.features.length;
      const avgFragmentsPerComment = data.cleanedComments.length > 0
        ? totalFragments / data.cleanedComments.length
        : 0;

      // 情感分布统计
      const positiveFragments = data.fragments.filter(f =>
        ['strong_praise', 'weak_praise'].includes(f.sentimentType)).length;
      const negativeFragments = data.fragments.filter(f =>
        ['strong_complaint', 'weak_complaint'].includes(f.sentimentType)).length;
      const neutralFragments = totalFragments - positiveFragments - negativeFragments;

      // 生成五维度策略建议
      const recommendations = generateComprehensiveRecommendations(serviceResults);

      const result: KanoAnalysisResult = {
        features: data.features,
        statistics: {
          totalFragments,
          totalFeatures,
          avgFragmentsPerComment,
          sentimentDistribution: {
            positive: totalFragments > 0 ? (positiveFragments / totalFragments) * 100 : 0,
            negative: totalFragments > 0 ? (negativeFragments / totalFragments) * 100 : 0,
            neutral: totalFragments > 0 ? (neutralFragments / totalFragments) * 100 : 0
          }
        },
        recommendations
      };

      setAnalysisResult(result);
      setAnalysis(result);

      // 绘制Better-Worse散点图
      setTimeout(() => drawBetterWorseChart(serviceResults), 100);

    } catch (error) {
      setError(error instanceof Error ? error.message : '分析生成失败');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  }, [data.features, data.fragments, data.cleanedComments, setError, setLoading, setAnalysis]);

  // 绘制Better-Worse散点图
  const drawBetterWorseChart = (results: ServiceResult[]) => {
    const canvas = canvasRef.current;
    if (!canvas || !results.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const width = 600;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    // 清空画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 设置边距
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // 计算数据范围
    const betterRange = [0, Math.max(...results.map(r => r.betterCoefficient), 100)];
    const worseRange = [Math.min(...results.map(r => r.worseCoefficient), -100), 0];

    // 绘制坐标轴
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // X轴 (Worse)
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();

    // Y轴 (Better)
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.stroke();

    // 绘制象限分割线
    ctx.strokeStyle = '#d1d5db';
    ctx.setLineDash([5, 5]);

    // 中心线 (Better = 0.6, Worse = -0.27)
    const centerX = margin.left + (Math.abs(-27) / Math.abs(worseRange[0] - worseRange[1])) * chartWidth;
    const centerY = margin.top + chartHeight - ((60 - betterRange[0]) / (betterRange[1] - betterRange[0])) * chartHeight;

    // 垂直分割线
    ctx.beginPath();
    ctx.moveTo(centerX, margin.top);
    ctx.lineTo(centerX, margin.top + chartHeight);
    ctx.stroke();

    // 水平分割线
    ctx.beginPath();
    ctx.moveTo(margin.left, centerY);
    ctx.lineTo(margin.left + chartWidth, centerY);
    ctx.stroke();

    ctx.setLineDash([]);

    // 绘制象限标签
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';

    // 第一象限 (右上) - 期望型
    ctx.fillText('期望型', margin.left + chartWidth * 0.75, margin.top + chartHeight * 0.25);

    // 第二象限 (左上) - 魅力型
    ctx.fillText('魅力型', margin.left + chartWidth * 0.25, margin.top + chartHeight * 0.25);

    // 第三象限 (左下) - 无差异型
    ctx.fillText('无差异型', margin.left + chartWidth * 0.25, margin.top + chartHeight * 0.75);

    // 第四象限 (右下) - 必备型
    ctx.fillText('必备型', margin.left + chartWidth * 0.75, margin.top + chartHeight * 0.75);

    // 绘制数据点
    results.forEach((result, index) => {
      const x = margin.left + (Math.abs(result.worseCoefficient) / Math.abs(worseRange[0] - worseRange[1])) * chartWidth;
      const y = margin.top + chartHeight - ((result.betterCoefficient - betterRange[0]) / (betterRange[1] - betterRange[0])) * chartHeight;

      // 根据Kano类别设置颜色
      const colors = {
        'M': '#ef4444', // 红色 - 必备型
        'O': '#3b82f6', // 蓝色 - 期望型
        'A': '#10b981', // 绿色 - 魅力型
        'I': '#6b7280', // 灰色 - 无差异型
        'R': '#8b5cf6', // 紫色 - 反向型
        'Q': '#f59e0b'  // 黄色 - 可疑结果
      };

      ctx.fillStyle = colors[result.finalCategory as keyof typeof colors] || '#6b7280';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();

      // 绘制功能名称
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(result.feature.length > 8 ? result.feature.substring(0, 8) + '...' : result.feature, x, y - 10);
    });

    // 绘制坐标轴标签
    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';

    // X轴标签
    ctx.fillText('Worse系数 (不满意度消除率)', margin.left + chartWidth / 2, height - 20);

    // Y轴标签
    ctx.save();
    ctx.translate(20, margin.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Better系数 (满意度提升率)', 0, 0);
    ctx.restore();
  };

  // 生成五维度综合策略建议
  const generateComprehensiveRecommendations = (results: ServiceResult[]) => {
    const recommendations: KanoAnalysisResult['recommendations'] = [];

    // 第一梯队：生死存亡 (Killer Issues)
    const killerIssues = results.filter(r =>
      r.finalCategory === 'M' && Math.abs(r.worseCoefficient) > 80
    ).sort((a, b) => Math.abs(b.worseCoefficient) - Math.abs(a.worseCoefficient));

    if (killerIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        category: '生死存亡 (Killer Issues)',
        action: `P0级 Bug，立即修复 ${killerIssues.slice(0, 3).map(r => r.feature).join('、')}`,
        rationale: `基础功能严重缺失或故障(Worse>80%)，用户正在大量流失。`
      });
    }

    // 第二梯队：核心提升 (Core Performance)
    const corePerformance = results.filter(r =>
      r.finalCategory === 'O' && r.totalVotes >= 5 // Assuming totalVotes correlates to Mentions
    ).sort((a, b) => b.totalVotes - a.totalVotes);

    if (corePerformance.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: '核心提升 (Core Performance)',
        action: `列入下一版本主要Feature开发计划：${corePerformance.slice(0, 3).map(r => r.feature).join('、')}`,
        rationale: `用户最关注的性能指标，且直接关联满意度。`
      });
    }

    // 第三梯队：低成本惊喜 (Quick Wins)
    const quickWins = results.filter(r =>
      r.finalCategory === 'A' && r.betterCoefficient > 50 // Keep 50 as 'High' for now, user didn't specify number for A
    ).sort((a, b) => b.betterCoefficient - a.betterCoefficient);

    if (quickWins.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: '低成本惊喜 (Quick Wins)',
        action: `作为版本的小彩蛋发布：${quickWins.slice(0, 2).map(r => r.feature).join('、')}`,
        rationale: `能用较小的成本博取较大的用户欢心。`
      });
    }

    // 第四梯队：基础维护 (Maintenance)
    const maintenance = results.filter(r =>
      r.finalCategory === 'M' && Math.abs(r.worseCoefficient) <= 80
    );

    if (maintenance.length > 0) {
      recommendations.push({
        priority: 'low',
        category: '基础维护 (Maintenance)',
        action: `排期优化 ${maintenance.slice(0, 2).map(r => r.feature).join('、')}`,
        rationale: `虽然是必备，但目前还没烂到让用户退货。防止恶化。`
      });
    }

    // 特殊修正：反向特性警告
    const reverseFeatures = results.filter(r => r.finalCategory === 'R');
    if (reverseFeatures.length > 0) {
      recommendations.push({
        priority: 'high',
        category: '反向特性移除',
        action: `考虑移除 ${reverseFeatures.map(r => r.feature).join('、')} 功能`,
        rationale: `这些功能用户明确表示不需要，可能造成负面体验。建议重新设计或直接移除。`
      });
    }

    return recommendations;
  };

  // 导出PDF报告
  const handleExportPDF = () => {
    // 这里应该集成PDF生成库，暂时提示
    alert('PDF导出功能正在开发中，请使用Excel导出或JSON导出');
  };

  // 导出Excel数据
  const handleExportExcel = () => {
    if (!analysisResult) return;

    // 生成CSV格式数据（简化版Excel）
    const csvData = [
      // 功能分析表
      ['功能分析表'],
      ['功能名称', 'Kano类别', '象限', '提及频率', '平均情感', '情感方差', '优先级', '典型证据'],
      ...analysisResult.features.map(f => [
        f.name, f.category, f.quadrant, f.frequency,
        f.avgSentiment.toFixed(3), f.sentimentVariance.toFixed(3),
        f.priority.toFixed(2), f.evidenceTexts[0] || ''
      ]),
      [],
      // 统计信息
      ['统计信息'],
      ['指标', '数值'],
      ['总观点片段数', analysisResult.statistics.totalFragments],
      ['总功能数', analysisResult.statistics.totalFeatures],
      ['平均片段密度', analysisResult.statistics.avgFragmentsPerComment.toFixed(2)],
      ['正面情感占比', `${analysisResult.statistics.sentimentDistribution.positive.toFixed(1)}%`],
      ['负面情感占比', `${analysisResult.statistics.sentimentDistribution.negative.toFixed(1)}%`],
      ['中性情感占比', `${analysisResult.statistics.sentimentDistribution.neutral.toFixed(1)}%`],
      [],
      // 策略建议
      ['策略建议'],
      ['优先级', '类别', '行动建议', '理由'],
      ...analysisResult.recommendations.map(r => [r.priority, r.category, r.action, r.rationale])
    ];

    const csvContent = csvData.map(row =>
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'kano_analysis_report.csv';
    link.click();
  };

  // 导出JSON数据
  const handleExportJSON = () => {
    if (!analysisResult) return;

    const jsonData = {
      metadata: {
        exportTime: new Date().toISOString(),
        toolVersion: '1.0.0',
        dataSource: 'Kano Analysis Tool'
      },
      rawData: {
        comments: data.rawComments.length,
        cleanedComments: data.cleanedComments.length,
        fragments: data.fragments.length
      },
      analysis: analysisResult
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'kano_analysis_data.json';
    link.click();
  };

  if (!analysisResult) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在生成分析结果...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 步骤标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">结构化输出</h2>
        <p className="text-gray-600">
          基于Kano模型的完整分析结果，包含Better-Worse散点图和五维度策略分析
        </p>
      </div>

      {/* 分析概览 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6"
      >
        <div className="flex items-start">
          <CheckCircle className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">分析完成概览</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {analysisResult.statistics.totalFragments}
                </div>
                <div className="text-sm text-gray-600">观点片段</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {analysisResult.statistics.totalFeatures}
                </div>
                <div className="text-sm text-gray-600">功能类别</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analysisResult.statistics.avgFragmentsPerComment.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">平均密度</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {analysisResult.recommendations.length}
                </div>
                <div className="text-sm text-gray-600">策略建议</div>
              </div>
            </div>

            {/* 情感分布 */}
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">情感分布</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 flex-1">正面情感</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analysisResult.statistics.sentimentDistribution.positive.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 flex-1">负面情感</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analysisResult.statistics.sentimentDistribution.negative.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 flex-1">中性情感</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analysisResult.statistics.sentimentDistribution.neutral.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Better-Worse散点图 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Better-Worse系数散点图
        </h3>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 散点图 */}
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto border rounded"
                style={{ maxWidth: '600px', maxHeight: '400px' }}
              />
            </div>

            {/* 图例 */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
              {Object.entries(KANO_CATEGORIES).map(([key, info]) => (
                <div key={key} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded mr-2"
                    style={{
                      backgroundColor: key === 'M' ? '#ef4444' :
                        key === 'O' ? '#3b82f6' :
                          key === 'A' ? '#10b981' :
                            key === 'I' ? '#6b7280' :
                              key === 'R' ? '#8b5cf6' : '#f59e0b'
                    }}
                  ></div>
                  <span className="text-gray-700">{key}({info.name})</span>
                </div>
              ))}
            </div>
          </div>

          {/* 象限解读 */}
          <div className="lg:w-80">
            <h4 className="font-medium text-gray-900 mb-3">四象限分析法</h4>
            <div className="space-y-3 text-sm">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="flex items-center mb-1">
                  <Target className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">第一象限 (右上)</span>
                </div>
                <p className="text-blue-800 text-xs">期望型(O)：Better高，Worse高</p>
                <p className="text-blue-700 text-xs mt-1">核心竞争区，兵家必争之地。全公司最优秀的资源应该砸在这里。</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded p-3">
                <div className="flex items-center mb-1">
                  <Star className="w-4 h-4 text-green-600 mr-2" />
                  <span className="font-medium text-green-900">第二象限 (左上)</span>
                </div>
                <p className="text-green-800 text-xs">魅力型(A)：Better高，Worse低</p>
                <p className="text-green-700 text-xs mt-1">差异化优势区。在保证M和O做好的前提下，挑选性价比最高的A功能进行迭代，作为营销爆点。</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-center mb-1">
                  <Shield className="w-4 h-4 text-red-600 mr-2" />
                  <span className="font-medium text-red-900">第四象限 (右下)</span>
                </div>
                <p className="text-red-800 text-xs">必备型(M)：Better低，Worse高</p>
                <p className="text-red-700 text-xs mt-1">基本保障区。这里的分数只要不是负数就行。目标是消除差评。</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="flex items-center mb-1">
                  <Minus className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">第三象限 (左下)</span>
                </div>
                <p className="text-gray-800 text-xs">无差异型(I)：Better低，Worse低</p>
                <p className="text-gray-700 text-xs mt-1">资源浪费区。维持现状，或者在产品迭代时作为被“砍”的首选对象。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 维度1：属性定性分析 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          维度1：属性定性分析 (Kano Category Interpretation)
        </h3>

        <p className="text-gray-600 text-sm mb-4">
          这是最基础的分类解读，决定了我们对待该功能的基本态度。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">分类</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">业务含义</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">典型用户心理</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">决策策略</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">本次分析案例</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                    M (必备型)
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">门槛/痛点</td>
                <td className="px-4 py-3 text-gray-600 text-xs">"连这个都没有/都做不好，垃圾产品！"</td>
                <td className="px-4 py-3">
                  <span className="text-red-600 font-medium">止血 (Fix It)</span>
                  <br />
                  <span className="text-xs text-gray-600">必须达到行业平均水平，做到及格即可，过度投入无收益。</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {serviceResults?.filter(r => r.finalCategory === 'M').slice(0, 2).map(r => r.feature).join('、') || '暂无'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    O (期望型)
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">战场/卖点</td>
                <td className="px-4 py-3 text-gray-600 text-xs">"这个越强越好，我会因为这个买单。"</td>
                <td className="px-4 py-3">
                  <span className="text-blue-600 font-medium">军备竞赛 (Invest)</span>
                  <br />
                  <span className="text-xs text-gray-600">资源投入的重点区域，直接决定竞争力，需持续优化。</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {serviceResults?.filter(r => r.finalCategory === 'O').slice(0, 2).map(r => r.feature).join('、') || '暂无'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    A (魅力型)
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">惊喜/差异化</td>
                <td className="px-4 py-3 text-gray-600 text-xs">"哇！没想到还有这个功能，太棒了！"</td>
                <td className="px-4 py-3">
                  <span className="text-green-600 font-medium">营销 (Promote)</span>
                  <br />
                  <span className="text-xs text-gray-600">低成本高收益，用于广告宣传和建立口碑。</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {serviceResults?.filter(r => r.finalCategory === 'A').slice(0, 2).map(r => r.feature).join('、') || '暂无'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                    I (无差异)
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">鸡肋/沉没成本</td>
                <td className="px-4 py-3 text-gray-600 text-xs">"哦，有或者没有我都无所谓。"</td>
                <td className="px-4 py-3">
                  <span className="text-gray-600 font-medium">减负 (Cut/Ignore)</span>
                  <br />
                  <span className="text-xs text-gray-600">停止优化，甚至可以砍掉以节省成本。</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {serviceResults?.filter(r => r.finalCategory === 'I').slice(0, 2).map(r => r.feature).join('、') || '暂无'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                    R (反向型)
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">雷区</td>
                <td className="px-4 py-3 text-gray-600 text-xs">"这功能太恶心了，赶紧去掉！"</td>
                <td className="px-4 py-3">
                  <span className="text-purple-600 font-medium">剔除 (Remove)</span>
                  <br />
                  <span className="text-xs text-gray-600">这也是AI分析评论容易发现的，如“强制广告”。无法卸载的预装软件</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {serviceResults?.filter(r => r.finalCategory === 'R').slice(0, 2).map(r => r.feature).join('、') || '暂无'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 维度2：系数定量分析 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          维度2：系数定量分析 (Better-Worse Matrix)
        </h3>

        <p className="text-gray-600 text-sm mb-4">
          仅仅知道分类是不够的（比如有5个功能都是O型，先做哪个？）。这时需要利用 Better系数 (满意度提升率) 和 Worse系数 (不满意度消除率) 绘制散点图。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Better系数 TOP5</h4>
            <div className="space-y-2">
              {serviceResults?.sort((a, b) => b.betterCoefficient - a.betterCoefficient).slice(0, 5).map((result, index) => (
                <div key={result.feature} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm font-medium text-gray-900">{result.feature}</span>
                  <span className="text-sm font-bold text-green-600">+{result.betterCoefficient.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Better系数越高，优化该功能带来的好评越多
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Worse系数 TOP5</h4>
            <div className="space-y-2">
              {serviceResults?.sort((a, b) => a.worseCoefficient - b.worseCoefficient).slice(0, 5).map((result, index) => (
                <div key={result.feature} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm font-medium text-gray-900">{result.feature}</span>
                  <span className="text-sm font-bold text-red-600">{result.worseCoefficient.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Worse系数绝对值越大，不解决后果越严重
            </p>
          </div>
        </div>
      </div>

      {/* 维度3：综合优先级排序 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2" />
          维度3：综合优先级排序 (Prioritization Logic)
        </h3>

        <p className="text-gray-600 text-sm mb-4">
          结合 "Kano分类" + "Worse系数" + "用户关注度(Total Mentions)"，得出加权后的开发优先级清单。
        </p>

        <div className="space-y-4">
          {analysisResult.recommendations.map((rec, index) => {
            const priorityColors = {
              'high': 'border-red-200 bg-red-50',
              'medium': 'border-orange-200 bg-orange-50',
              'low': 'border-blue-200 bg-blue-50'
            };
            const priorityIcons = {
              'high': <AlertTriangle className="w-5 h-5 text-red-600" />,
              'medium': <Target className="w-5 h-5 text-orange-600" />,
              'low': <TrendingUp className="w-5 h-5 text-blue-600" />
            };

            return (
              <div key={index} className={`rounded-lg border p-4 ${priorityColors[rec.priority]}`}>
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {priorityIcons[rec.priority]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{rec.category}</h4>
                      <span className="text-xs px-2 py-1 rounded bg-white border">
                        {rec.priority === 'high' ? '第一梯队' : rec.priority === 'medium' ? '第二梯队' : '第三梯队'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2 font-medium">{rec.action}</p>
                    <p className="text-xs text-gray-600">{rec.rationale}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 维度4：评论数据特殊修正 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          维度4：针对"评论数据分析"的特殊修正 (Context Check)
        </h3>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              "幸存者偏差"警示
            </h4>
            <p className="text-yellow-800 text-sm mb-2">
              <strong>M型功能的"隐身"特性：</strong>如果一个M型功能（如基础通话功能）做得很好，用户在评论里是绝对不会提的（Mentions极低）。
            </p>
            <p className="text-yellow-700 text-xs">
              分析警示：如果某个公认的基础功能在报表中是"无差异(I)"甚至没出现，这其实是好事，说明它没出问题。不要因为它关注度低就砍掉它。
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              A型功能的"时效性"
            </h4>
            <p className="text-blue-800 text-sm mb-2">
              <strong>Kano模型具有生命周期：</strong>A（惊喜）随着时间推移会变成O（期望），最后变成M（必备）。
            </p>
            <p className="text-blue-700 text-xs">
              分析警示：如果去年的A类功能今年Better系数下降了，说明用户已经被"惯坏了"，由于它变成了普通功能，你可能需要寻找新的兴奋点了。
            </p>
          </div>
        </div>
      </div>

      {/* 维度5：最终输出给产品经理的建议模板 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          维度5：最终输出给产品经理的建议模板 (Actionable Insight)
        </h3>

        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-bold text-gray-900 mb-3">【产品改进决策建议】</h4>

          {/* 最高优先级 */}
          {serviceResults && serviceResults.filter(r => r.finalCategory === 'M' && Math.abs(r.worseCoefficient) > 50).length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold text-red-700 mb-2">最高优先级 (P0) - 修复痛点：</h5>
              {serviceResults.filter(r => r.finalCategory === 'M' && Math.abs(r.worseCoefficient) > 50).slice(0, 2).map(result => (
                <p key={result.feature} className="text-sm text-gray-800 mb-1">
                  <strong>{result.feature}</strong> (Kano: M, Worse: {Math.abs(result.worseCoefficient).toFixed(0)}%):
                  目前是最大的扣分项，大量用户因此给出差评。务必在下个版本优化。
                </p>
              ))}
            </div>
          )}

          {/* 次级优先级 */}
          {serviceResults && serviceResults.filter(r => r.finalCategory === 'O' && r.totalVotes >= 3).length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold text-orange-700 mb-2">次级优先级 (P1) - 提升竞争力：</h5>
              {serviceResults.filter(r => r.finalCategory === 'O' && r.totalVotes >= 3).slice(0, 2).map(result => (
                <p key={result.feature} className="text-sm text-gray-800 mb-1">
                  <strong>{result.feature}</strong> (Kano: O, Better: {result.betterCoefficient.toFixed(0)}%):
                  是用户关注的高频区，建议重点提升该功能表现。
                </p>
              ))}
            </div>
          )}

          {/* 营销建议 */}
          {serviceResults && serviceResults.filter(r => r.finalCategory === 'A' && r.betterCoefficient > 50).length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold text-green-700 mb-2">营销建议 (P2)：</h5>
              {serviceResults.filter(r => r.finalCategory === 'A' && r.betterCoefficient > 50).slice(0, 2).map(result => (
                <p key={result.feature} className="text-sm text-gray-800 mb-1">
                  <strong>{result.feature}</strong> (Kano: A):
                  用户对此功能感到非常惊喜。建议在广告素材中放大宣传，这是我们的差异化优势。
                </p>
              ))}
            </div>
          )}

          {/* 资源调整建议 */}
          {serviceResults && serviceResults.filter(r => r.finalCategory === 'I').length > 0 && (
            <div>
              <h5 className="font-semibold text-gray-700 mb-2">资源调整建议：</h5>
              {serviceResults.filter(r => r.finalCategory === 'I').slice(0, 2).map(result => (
                <p key={result.feature} className="text-sm text-gray-800 mb-1">
                  <strong>{result.feature}</strong> (Kano: I):
                  几乎无人关注，且数据偏中性。建议后续采用通用方案以降低成本。
                </p>
              ))}
            </div>
          )}

          <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
            <p className="text-purple-800 text-sm font-medium">
              这套分析逻辑将冰冷的数据转化为了<strong>"先做什么，后做什么，为什么做"</strong>的战略决策。
            </p>
          </div>
        </div>
      </div>

      {/* 导出选项 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Download className="w-5 h-5 mr-2" />
          导出完整报告
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleExportPDF}
            className="flex items-center justify-center py-3"
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF完整报告
          </Button>
          <Button
            onClick={handleExportExcel}
            className="flex items-center justify-center py-3"
            variant="outline"
          >
            <Table className="w-4 h-4 mr-2" />
            Excel数据表
          </Button>
          <Button
            onClick={handleExportJSON}
            className="flex items-center justify-center py-3"
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            JSON原始数据
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-blue-800 text-sm">
            💡 建议：导出Excel数据进行进一步分析，或导出JSON数据集成到其他系统中。
            完整的五维度分析报告包含散点图、策略建议和决策模板。
          </p>
        </div>
      </div>

      {/* 完成提示 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
      >
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">五维度Kano分析完成！</h3>
        <p className="text-green-700 mb-4">
          已完成属性定性分析、系数定量分析、优先级排序、特殊修正和决策建议五个维度的完整分析。
          共分析了 {data.rawComments.length} 条原始评论，
          提取了 {analysisResult.statistics.totalFragments} 个观点片段，
          识别了 {analysisResult.statistics.totalFeatures} 个功能类别，
          生成了 {analysisResult.recommendations.length} 条分层策略建议。
        </p>
        <div className="flex justify-center space-x-4">
          <Button onClick={() => window.location.reload()} variant="outline">
            重新分析
          </Button>
          <Button onClick={handleExportExcel}>
            导出完整报告
          </Button>
        </div>
      </motion.div>
    </div>
  );
}