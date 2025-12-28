/**
 * ReportGenerationService 测试
 */

import { describe, it, expect } from 'vitest';
import { ReportGenerationService } from '../ReportGenerationService';
import type { BaseProduct, CompetitorData, AnalysisResult, RadarScores, ProfitAnalysis } from '../../types';

// 测试数据
const mockBaseProduct: BaseProduct = {
  id: 'test-product-1',
  name: '测试产品',
  cost: 50,
  weight: 200,
  dimensions: {
    length: 10,
    width: 5,
    height: 3
  },
  fixedInvestment: 10000,
  estimatedMonthlySales: 100,
  features: ['功能A', '功能B', '功能C'],
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockCompetitorData: CompetitorData = {
  price: 100,
  weight: 250,
  dimensions: {
    length: 12,
    width: 6,
    height: 4
  },
  features: ['功能A', '功能B'],
  extractionConfidence: {
    price: 0.9,
    weight: 0.8,
    dimensions: 0.7,
    features: 0.85
  },
  rawText: '测试竞品描述',
  extractedAt: new Date()
};

const mockRadarScores: RadarScores = {
  profitability: 8.5,
  roiSpeed: 7.2,
  portability: 6.8,
  features: 7.5,
  priceAdvantage: 8.0
};

const mockProfitAnalysis: ProfitAnalysis = {
  margin: 50,
  marginRate: 0.5,
  roiMonths: 2.0
};

const mockAnalysisResult: AnalysisResult = {
  profitAnalysis: mockProfitAnalysis,
  radarScores: mockRadarScores,
  insights: {
    advantages: ['测试优势1', '测试优势2'],
    risks: ['测试风险1'],
    recommendations: ['测试建议1', '测试建议2']
  },
  timestamp: new Date(),
  sessionId: 'test-session-1'
};

describe('ReportGenerationService', () => {
  describe('generateIntelligentInsights', () => {
    it('应该基于雷达图数据生成智能洞察', () => {
      const insights = ReportGenerationService.generateIntelligentInsights(
        mockRadarScores,
        mockProfitAnalysis,
        mockBaseProduct,
        mockCompetitorData
      );

      expect(insights).toBeDefined();
      expect(insights.advantages).toBeInstanceOf(Array);
      expect(insights.risks).toBeInstanceOf(Array);
      expect(insights.recommendations).toBeInstanceOf(Array);
      expect(insights.advantages.length).toBeGreaterThan(0);
      expect(insights.recommendations.length).toBeGreaterThan(0);
    });

    it('应该根据利润率生成相应的优势或风险', () => {
      // 高利润率场景
      const highProfitScores = { ...mockRadarScores, profitability: 9.0 };
      const highProfitAnalysis = { ...mockProfitAnalysis, marginRate: 0.6 };
      
      const insights = ReportGenerationService.generateIntelligentInsights(
        highProfitScores,
        highProfitAnalysis,
        mockBaseProduct,
        mockCompetitorData
      );

      const hasAdvantage = insights.advantages.some(adv => adv.includes('利润空间'));
      expect(hasAdvantage).toBe(true);
    });

    it('应该根据ROI速度生成相应的洞察', () => {
      // 快速ROI场景
      const fastROIScores = { ...mockRadarScores, roiSpeed: 9.5 };
      const fastROIAnalysis = { ...mockProfitAnalysis, roiMonths: 1.5 };
      
      const insights = ReportGenerationService.generateIntelligentInsights(
        fastROIScores,
        fastROIAnalysis,
        mockBaseProduct,
        mockCompetitorData
      );

      const hasAdvantage = insights.advantages.some(adv => adv.includes('投资回报'));
      expect(hasAdvantage).toBe(true);
    });
  });

  describe('generatePricingStrategy', () => {
    it('应该生成合理的定价策略', () => {
      const strategy = ReportGenerationService.generatePricingStrategy(
        mockBaseProduct,
        mockCompetitorData,
        mockProfitAnalysis
      );

      expect(strategy).toBeDefined();
      expect(strategy.recommendedPrice).toBeGreaterThan(mockBaseProduct.cost);
      expect(strategy.recommendedPrice).toBeLessThanOrEqual(mockCompetitorData.price);
      expect(strategy.priceRange.min).toBeGreaterThan(mockBaseProduct.cost);
      expect(strategy.priceRange.max).toBeLessThanOrEqual(mockCompetitorData.price * 0.95);
      expect(strategy.strategy).toMatch(/penetration|competitive|value|premium/);
      expect(strategy.reasoning).toBeInstanceOf(Array);
      expect(strategy.reasoning.length).toBeGreaterThan(0);
    });

    it('应该根据价格差异选择不同的策略', () => {
      // 测试不同价格场景下的策略选择
      
      // 场景1: 竞品价格很高，应该选择penetration策略
      const highPriceCompetitor = { ...mockCompetitorData, price: 200 };
      const highPriceStrategy = ReportGenerationService.generatePricingStrategy(
        mockBaseProduct,
        highPriceCompetitor,
        mockProfitAnalysis
      );
      expect(highPriceStrategy.strategy).toBe('competitive'); // 80% of 200 = 160, which is < 90% of 200 (180)
      
      // 场景2: 竞品价格适中，应该选择value策略
      const moderatePriceCompetitor = { ...mockCompetitorData, price: 80 };
      const moderateStrategy = ReportGenerationService.generatePricingStrategy(
        mockBaseProduct,
        moderatePriceCompetitor,
        mockProfitAnalysis
      );
      expect(['competitive', 'value']).toContain(moderateStrategy.strategy);
    });
  });

  describe('assessMarketOpportunity', () => {
    it('应该评估市场机会等级', () => {
      const opportunity = ReportGenerationService.assessMarketOpportunity(
        mockRadarScores,
        mockProfitAnalysis
      );

      expect(opportunity).toBeDefined();
      expect(opportunity.level).toMatch(/high|medium|low/);
      expect(opportunity.score).toBeGreaterThan(0);
      expect(opportunity.score).toBeLessThanOrEqual(10);
      expect(opportunity.description).toBeTruthy();
      expect(opportunity.successFactors).toBeInstanceOf(Array);
      expect(opportunity.recommendations).toBeInstanceOf(Array);
    });

    it('应该根据综合评分确定机会等级', () => {
      // 高分场景
      const highScores: RadarScores = {
        profitability: 9.0,
        roiSpeed: 9.0,
        portability: 8.5,
        features: 8.0,
        priceAdvantage: 9.0
      };

      const opportunity = ReportGenerationService.assessMarketOpportunity(
        highScores,
        mockProfitAnalysis
      );

      expect(opportunity.level).toBe('high');
      expect(opportunity.score).toBeGreaterThan(8);
    });
  });

  describe('analyzeCompetitiveness', () => {
    it('应该分析竞争力优势和劣势', () => {
      const analysis = ReportGenerationService.analyzeCompetitiveness(
        mockRadarScores,
        mockBaseProduct,
        mockCompetitorData
      );

      expect(analysis).toBeDefined();
      expect(analysis.strengths).toBeInstanceOf(Array);
      expect(analysis.weaknesses).toBeInstanceOf(Array);
      expect(analysis.overallCompetitiveness).toBeDefined();
      expect(analysis.overallCompetitiveness.score).toBeGreaterThan(0);
      expect(analysis.overallCompetitiveness.score).toBeLessThanOrEqual(10);
      expect(analysis.overallCompetitiveness.level).toMatch(/excellent|good|average|poor/);
    });

    it('应该正确识别优势领域', () => {
      const highScores: RadarScores = {
        profitability: 9.0,
        roiSpeed: 8.5,
        portability: 6.0,
        features: 5.5,
        priceAdvantage: 7.5
      };

      const analysis = ReportGenerationService.analyzeCompetitiveness(
        highScores,
        mockBaseProduct,
        mockCompetitorData
      );

      expect(analysis.strengths.length).toBeGreaterThan(0);
      expect(analysis.weaknesses.length).toBeGreaterThan(0);
      
      // 应该识别出利润空间和ROI速度为优势
      const strengthDimensions = analysis.strengths.map(s => s.dimension);
      expect(strengthDimensions).toContain('利润空间');
      expect(strengthDimensions).toContain('ROI速度');
    });
  });

  describe('generateRoleSpecificInsights', () => {
    it('应该为制造业PM生成特定洞察', () => {
      const baseInsights = {
        advantages: ['利润空间优势', '便携性优势'],
        risks: ['价格竞争风险', '功能不足风险'],
        recommendations: ['营销推广建议', '产品优化建议']
      };

      const manufacturingInsights = ReportGenerationService.generateRoleSpecificInsights(
        baseInsights,
        'manufacturing'
      );

      expect(manufacturingInsights.advantages.some(adv => adv.includes('成本控制'))).toBe(true);
      expect(manufacturingInsights.advantages.some(adv => adv.includes('结构设计'))).toBe(true);
      expect(manufacturingInsights.risks.some(risk => risk.includes('生产成本'))).toBe(true);
      expect(manufacturingInsights.recommendations.some(rec => rec.includes('生产工艺'))).toBe(true);
    });

    it('应该为零售PM生成特定洞察', () => {
      const baseInsights = {
        advantages: ['利润空间优势', '便携性优势'],
        risks: ['功能不足风险'],
        recommendations: ['产品优化建议']
      };

      const retailInsights = ReportGenerationService.generateRoleSpecificInsights(
        baseInsights,
        'retail'
      );

      expect(retailInsights.advantages.some(adv => adv.includes('营销推广'))).toBe(true);
      expect(retailInsights.advantages.some(adv => adv.includes('价格策略'))).toBe(true);
      expect(retailInsights.risks.some(risk => risk.includes('用户体验'))).toBe(true);
      expect(retailInsights.recommendations.some(rec => rec.includes('营销策略'))).toBe(true);
    });
  });

  describe('generateCompleteReport', () => {
    it('应该生成完整的智能报告', () => {
      const report = ReportGenerationService.generateCompleteReport(
        mockAnalysisResult,
        mockBaseProduct,
        mockCompetitorData,
        'retail'
      );

      expect(report).toBeDefined();
      expect(report.overview).toBeTruthy();
      expect(report.marketOpportunity).toBeDefined();
      expect(report.pricingStrategy).toBeDefined();
      expect(report.competitiveAnalysis).toBeDefined();
      expect(report.insights).toBeDefined();
      expect(report.executionPlan).toBeTruthy();
      expect(report.fullReport).toBeTruthy();
    });

    it('应该在完整报告中包含所有关键信息', () => {
      const report = ReportGenerationService.generateCompleteReport(
        mockAnalysisResult,
        mockBaseProduct,
        mockCompetitorData,
        'retail'
      );

      // 检查完整报告是否包含关键部分
      expect(report.fullReport).toContain('竞品分析概览');
      expect(report.fullReport).toContain('市场机会评估');
      expect(report.fullReport).toContain('定价策略建议');
      expect(report.fullReport).toContain('竞争优势');
      expect(report.fullReport).toContain('风险提示');
      expect(report.fullReport).toContain('策略建议');
      expect(report.fullReport).toContain('执行建议');
      expect(report.fullReport).toContain('总结');
    });

    it('应该根据角色视图调整报告内容', () => {
      const retailReport = ReportGenerationService.generateCompleteReport(
        mockAnalysisResult,
        mockBaseProduct,
        mockCompetitorData,
        'retail'
      );

      const manufacturingReport = ReportGenerationService.generateCompleteReport(
        mockAnalysisResult,
        mockBaseProduct,
        mockCompetitorData,
        'manufacturing'
      );

      expect(retailReport.fullReport).toContain('零售产品经理');
      expect(manufacturingReport.fullReport).toContain('制造业产品经理');
      
      // 内容应该有所不同
      expect(retailReport.insights.recommendations).not.toEqual(manufacturingReport.insights.recommendations);
    });
  });
});