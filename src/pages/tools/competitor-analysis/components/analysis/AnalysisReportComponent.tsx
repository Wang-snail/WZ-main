/**
 * 智能分析报告组件
 * 生成基于数据的智能分析洞察和建议
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useCompetitorAnalysisStore, useShallow } from '../../store/competitorAnalysisStore';
import { ReportGenerationService } from '../../services/analysis/ReportGenerationService';
import type { AnalysisInsights, RoleViewType } from '../../types';

/**
 * 报告部分类型
 */
type ReportSection = 'overview' | 'market' | 'pricing' | 'advantages' | 'risks' | 'recommendations' | 'summary';

/**
 * 报告导出格式
 */
type ExportFormat = 'markdown' | 'text' | 'json';

/**
 * 智能分析报告组件
 */
const AnalysisReportComponent: React.FC = () => {
  // 使用 useShallow 优化性能，只订阅所需的数据
  const {
    analysisResult,
    baseProduct,
    competitorData,
    roleView
  } = useCompetitorAnalysisStore(useShallow((state: any) => ({
    analysisResult: state.analysisResult,
    baseProduct: state.baseProduct,
    competitorData: state.competitorData,
    roleView: state.roleView
  })));

  const switchRoleView = useCompetitorAnalysisStore(state => state.switchRoleView);

  // 本地状态
  const [activeSection, setActiveSection] = useState<ReportSection>('overview'); // 当前激活的报告部分
  const [copySuccess, setCopySuccess] = useState<string | null>(null); // 复制成功提示

  /**
   * 获取当前角色的洞察和完整报告数据
   * 使用 useCallback 来稳定化计算函数
   */
  const generateReport = useCallback(() => {
    if (!analysisResult || !baseProduct || !competitorData) return null;

    return ReportGenerationService.generateCompleteReport(
      analysisResult,
      baseProduct,
      competitorData,
      roleView
    );
  }, [analysisResult, baseProduct, competitorData, roleView]);

  const reportData = useMemo(() => {
    return generateReport();
  }, [generateReport]);

  /**
   * 获取当前角色的洞察
   */
  const currentInsights = useMemo(() => {
    return reportData?.insights || null;
  }, [reportData]);

  /**
   * 生成报告概览
   */
  const generateOverview = useCallback(() => {
    if (!reportData) return '';
    return reportData.overview;
  }, [reportData]);

  /**
   * 生成定价策略建议
   */
  const generatePricingStrategy = useCallback(() => {
    if (!reportData) return '';

    const { pricingStrategy } = reportData;

    return `
### 定价策略建议

**推荐售价：** ${pricingStrategy.recommendedPrice} 元
**价格区间：** ${pricingStrategy.priceRange.min} - ${pricingStrategy.priceRange.max} 元
**策略类型：** ${pricingStrategy.description}

**定价逻辑：**
${pricingStrategy.reasoning.map(r => `- ${r}`).join('\n')}
    `.trim();
  }, [reportData]);

  /**
   * 生成市场机会分析
   */
  const generateMarketOpportunity = useCallback(() => {
    if (!reportData) return '';

    const { marketOpportunity } = reportData;

    const opportunityIcon = marketOpportunity.level === 'high' ? '🟢' : marketOpportunity.level === 'medium' ? '🟡' : '🔴';
    const opportunityText = marketOpportunity.level === 'high' ? '高机会市场' : marketOpportunity.level === 'medium' ? '中等机会市场' : '挑战性市场';

    return `
### 市场机会评估

**机会等级：** ${opportunityIcon} ${opportunityText}
**综合评分：** ${marketOpportunity.score}/10

**市场建议：** ${marketOpportunity.description}

**关键成功因素：**
${marketOpportunity.successFactors.join('\n')}

**推荐行动：**
${marketOpportunity.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}
    `.trim();
  }, [reportData]);

  /**
   * 生成完整报告
   */
  const generateFullReport = useCallback(() => {
    if (!reportData) return '';
    return reportData.fullReport;
  }, [reportData]);

  /**
   * 复制内容到剪贴板
   */
  const copyToClipboard = useCallback(async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000); // 2秒后清除提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  }, []);

  /**
   * 导出报告
   */
  const exportReport = useCallback((format: ExportFormat) => {
    if (!reportData) return;

    const fullReport = reportData.fullReport;
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'markdown':
        content = fullReport;
        filename = `竞品分析报告_${new Date().toISOString().split('T')[0]}.md`;
        mimeType = 'text/markdown';
        break;
      case 'text':
        content = fullReport.replace(/[#*`]/g, ''); // 移除markdown标记
        filename = `竞品分析报告_${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
        break;
      case 'json':
        content = JSON.stringify({
          overview: reportData.overview,
          insights: currentInsights,
          metadata: {
            timestamp: new Date().toISOString(),
            roleView,
            baseProduct: baseProduct?.name,
            competitorPrice: competitorData?.price
          }
        }, null, 2);
        filename = `竞品分析数据_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
    }

    // 创建下载链接
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [reportData, currentInsights, roleView, baseProduct?.name, competitorData?.price]);

  // 如果没有分析结果，显示空状态
  if (!analysisResult || !currentInsights) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无分析报告</h3>
          <p className="mt-1 text-sm text-gray-500">请先完成竞品分析流程</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 报告头部 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">智能分析报告</h2>
            <p className="text-gray-600 mt-1">
              基于数据驱动的竞品分析洞察和策略建议
            </p>
          </div>

          {/* 角色视图切换 */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">视角切换：</span>
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => switchRoleView('retail')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${roleView === 'retail'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                零售PM
              </button>
              <button
                type="button"
                onClick={() => switchRoleView('manufacturing')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${roleView === 'manufacturing'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                制造PM
              </button>
            </div>
          </div>
        </div>

        {/* 导出按钮 */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => copyToClipboard(generateFullReport(), 'report')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copySuccess === 'report' ? '已复制!' : '复制报告'}
          </button>

          <button
            type="button"
            onClick={() => exportReport('markdown')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            导出MD
          </button>

          <button
            type="button"
            onClick={() => exportReport('json')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            导出数据
          </button>
        </div>
      </div>

      {/* 报告导航 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="报告导航">
            {[
              { id: 'overview', name: '概览', icon: '📊' },
              { id: 'market', name: '市场机会', icon: '🎯' },
              { id: 'pricing', name: '定价策略', icon: '💰' },
              { id: 'advantages', name: '竞争优势', icon: '🏆' },
              { id: 'risks', name: '风险提示', icon: '⚠️' },
              { id: 'recommendations', name: '策略建议', icon: '💡' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as ReportSection)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.name}
              </button>
            ))}
          </nav>
        </div>

        {/* 报告内容 */}
        <div className="p-6">
          {/* 概览部分 */}
          {activeSection === 'overview' && (
            <div className="prose max-w-none">
              <div className="whitespace-pre-line text-gray-700">
                {generateOverview()}
              </div>
            </div>
          )}

          {/* 市场机会部分 */}
          {activeSection === 'market' && (
            <div className="prose max-w-none">
              <div className="whitespace-pre-line text-gray-700">
                {generateMarketOpportunity()}
              </div>
            </div>
          )}

          {/* 定价策略部分 */}
          {activeSection === 'pricing' && (
            <div className="prose max-w-none">
              <div className="whitespace-pre-line text-gray-700">
                {generatePricingStrategy()}
              </div>
            </div>
          )}

          {/* 竞争优势部分 */}
          {activeSection === 'advantages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">竞争优势分析</h3>
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentInsights.advantages.join('\n'), 'advantages')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  {copySuccess === 'advantages' ? '已复制!' : '复制内容'}
                </button>
              </div>

              <div className="grid gap-4">
                {currentInsights.advantages.map((advantage, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-green-800 flex-1">{advantage}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 风险提示部分 */}
          {activeSection === 'risks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">风险提示</h3>
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentInsights.risks.join('\n'), 'risks')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  {copySuccess === 'risks' ? '已复制!' : '复制内容'}
                </button>
              </div>

              <div className="grid gap-4">
                {currentInsights.risks.map((risk, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      ⚠
                    </div>
                    <p className="text-yellow-800 flex-1">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 策略建议部分 */}
          {activeSection === 'recommendations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">策略建议</h3>
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentInsights.recommendations.join('\n'), 'recommendations')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  {copySuccess === 'recommendations' ? '已复制!' : '复制内容'}
                </button>
              </div>

              <div className="grid gap-4">
                {currentInsights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      💡
                    </div>
                    <p className="text-blue-800 flex-1">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 报告元数据 */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            报告生成时间: {analysisResult.timestamp.toLocaleString()}
          </div>
          <div>
            分析视角: {roleView === 'retail' ? '零售产品经理' : '制造业产品经理'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReportComponent;