/**
 * 计算引擎服务的属性测试和单元测试
 * 验证核心计算功能的正确性和数学准确性
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { CalculationService, CalculationUtils } from '../CalculationService';
import type { BaseProduct, CompetitorData, ProfitAnalysis } from '../../types';

// 测试数据生成器
const dimensionsArbitrary = fc.record({
  length: fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }),
  width: fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }),
  height: fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true })
});

const baseProductArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  cost: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
  weight: fc.float({ min: Math.fround(1), max: Math.fround(5000), noNaN: true }),
  dimensions: dimensionsArbitrary,
  fixedInvestment: fc.float({ min: Math.fround(100), max: Math.fround(100000), noNaN: true }),
  estimatedMonthlySales: fc.integer({ min: 1, max: 100000 }),
  features: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 10 }),
  createdAt: fc.date(),
  updatedAt: fc.date()
});

const competitorDataArbitrary = fc.record({
  price: fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true }),
  weight: fc.option(fc.float({ min: Math.fround(1), max: Math.fround(5000), noNaN: true })),
  dimensions: fc.option(dimensionsArbitrary),
  features: fc.array(fc.string({ minLength: 1, maxLength: 30 })),
  extractionConfidence: fc.record({
    price: fc.float({ min: Math.fround(0), max: Math.fround(1) }),
    weight: fc.float({ min: Math.fround(0), max: Math.fround(1) }),
    dimensions: fc.float({ min: Math.fround(0), max: Math.fround(1) }),
    features: fc.float({ min: Math.fround(0), max: Math.fround(1) })
  }),
  rawText: fc.string({ minLength: 10, maxLength: 1000 }),
  extractedAt: fc.date()
});

describe('CalculationService - Property Tests', () => {
  describe('Property 2: 计算引擎数学正确性', () => {
    // Feature: smart-competitor-analysis, Property 2: 计算引擎数学正确性
    it('should calculate profit correctly for all valid inputs', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true }), // competitorPrice
          fc.float({ min: Math.fround(0.01), max: Math.fround(9999), noNaN: true }), // myCost
          (competitorPrice, myCost) => {
            // 确保成本小于价格
            fc.pre(myCost < competitorPrice);
            
            const result = CalculationService.calculateProfit(competitorPrice, myCost);
            
            // 验证毛利计算正确性
            expect(result.result.margin).toBeCloseTo(competitorPrice - myCost, 5);
            
            // 验证毛利率计算正确性
            const expectedMarginRate = (competitorPrice - myCost) / competitorPrice;
            expect(result.result.marginRate).toBeCloseTo(expectedMarginRate, 5);
            
            // 验证毛利率在合理范围内
            expect(result.result.marginRate).toBeGreaterThan(0);
            expect(result.result.marginRate).toBeLessThan(1);
            
            // 验证计算详情
            expect(result.details.inputs.competitorPrice).toBe(competitorPrice);
            expect(result.details.inputs.myCost).toBe(myCost);
            expect(result.timestamp).toBeInstanceOf(Date);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: ROI计算一致性', () => {
    // Feature: smart-competitor-analysis, Property 3: ROI计算一致性
    it('should calculate ROI correctly for all valid inputs', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(100), max: Math.fround(100000), noNaN: true }), // fixedInvestment
          fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }), // monthlyProfit
          (fixedInvestment, monthlyProfit) => {
            const result = CalculationService.calculateROI(fixedInvestment, monthlyProfit);
            
            // 验证ROI计算正确性: 回本周期 = 固定投入 / 月利润
            const expectedROI = fixedInvestment / monthlyProfit;
            expect(result.result).toBeCloseTo(expectedROI, 5);
            
            // 验证ROI为正数
            expect(result.result).toBeGreaterThan(0);
            
            // 验证计算详情
            expect(result.details.inputs.fixedInvestment).toBe(fixedInvestment);
            expect(result.details.inputs.monthlyProfit).toBe(monthlyProfit);
            expect(result.timestamp).toBeInstanceOf(Date);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: 雷达图评分标准化', () => {
    // Feature: smart-competitor-analysis, Property 4: 雷达图评分标准化
    it('should generate radar scores within 0-10 range for all inputs', () => {
      fc.assert(
        fc.property(
          baseProductArbitrary,
          competitorDataArbitrary,
          fc.record({
            margin: fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }),
            marginRate: fc.float({ min: Math.fround(0.01), max: Math.fround(0.99), noNaN: true }),
            roiMonths: fc.float({ min: Math.fround(0.1), max: Math.fround(120), noNaN: true })
          }),
          (baseProduct, competitorData, profitAnalysis) => {
            // 确保竞品价格大于基础产品成本
            const adjustedCompetitorData = {
              ...competitorData,
              price: Math.max(competitorData.price, baseProduct.cost + 1)
            };
            
            const result = CalculationService.calculateRadarScores(
              baseProduct,
              adjustedCompetitorData,
              profitAnalysis
            );
            
            // 验证所有评分都在0-10范围内
            expect(result.result.profitability).toBeGreaterThanOrEqual(0);
            expect(result.result.profitability).toBeLessThanOrEqual(10);
            
            expect(result.result.roiSpeed).toBeGreaterThanOrEqual(0);
            expect(result.result.roiSpeed).toBeLessThanOrEqual(10);
            
            expect(result.result.portability).toBeGreaterThanOrEqual(0);
            expect(result.result.portability).toBeLessThanOrEqual(10);
            
            expect(result.result.features).toBeGreaterThanOrEqual(0);
            expect(result.result.features).toBeLessThanOrEqual(10);
            
            expect(result.result.priceAdvantage).toBeGreaterThanOrEqual(0);
            expect(result.result.priceAdvantage).toBeLessThanOrEqual(10);
            
            // 验证评分精度（保留一位小数）
            expect(result.result.profitability).toBe(Math.round(result.result.profitability * 10) / 10);
            expect(result.result.roiSpeed).toBe(Math.round(result.result.roiSpeed * 10) / 10);
            expect(result.result.portability).toBe(Math.round(result.result.portability * 10) / 10);
            expect(result.result.features).toBe(Math.round(result.result.features * 10) / 10);
            expect(result.result.priceAdvantage).toBe(Math.round(result.result.priceAdvantage * 10) / 10);
            
            // 验证计算详情存在
            expect(result.details).toBeDefined();
            expect(result.timestamp).toBeInstanceOf(Date);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: 响应式数据更新一致性', () => {
    // Feature: smart-competitor-analysis, Property 5: 响应式数据更新一致性
    it('should maintain consistency when base product data changes', () => {
      fc.assert(
        fc.property(
          baseProductArbitrary,
          fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true }), // competitorPrice
          (baseProduct, competitorPrice) => {
            // 确保价格大于成本
            const adjustedPrice = Math.max(competitorPrice, baseProduct.cost + 1);
            
            // 第一次计算
            const result1 = CalculationService.calculateCompleteProfitAnalysis(
              baseProduct,
              adjustedPrice
            );
            
            // 修改销量后重新计算
            const modifiedProduct = {
              ...baseProduct,
              estimatedMonthlySales: baseProduct.estimatedMonthlySales * 2
            };
            
            const result2 = CalculationService.calculateCompleteProfitAnalysis(
              modifiedProduct,
              adjustedPrice
            );
            
            // 验证毛利和毛利率保持不变（不依赖销量）
            expect(result2.result.margin).toBeCloseTo(result1.result.margin, 5);
            expect(result2.result.marginRate).toBeCloseTo(result1.result.marginRate, 5);
            
            // 验证ROI发生变化（依赖销量）
            expect(result2.result.roiMonths).toBeCloseTo(result1.result.roiMonths / 2, 5);
            
            // 验证计算的一致性
            expect(result1.result.margin).toBeCloseTo(adjustedPrice - baseProduct.cost, 5);
            expect(result2.result.margin).toBeCloseTo(adjustedPrice - baseProduct.cost, 5);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('CalculationService - Unit Tests', () => {
  describe('calculateProfit', () => {
    it('should throw error for invalid inputs', () => {
      expect(() => CalculationService.calculateProfit(0, 10)).toThrow('竞品价格必须大于0');
      expect(() => CalculationService.calculateProfit(-1, 10)).toThrow('竞品价格必须大于0');
      expect(() => CalculationService.calculateProfit(100, -1)).toThrow('成本不能为负数');
      expect(() => CalculationService.calculateProfit(100, 100)).toThrow('成本不能大于或等于售价');
      expect(() => CalculationService.calculateProfit(100, 101)).toThrow('成本不能大于或等于售价');
    });

    it('should calculate profit correctly for specific examples', () => {
      const result = CalculationService.calculateProfit(100, 60);
      
      expect(result.result.margin).toBe(40);
      expect(result.result.marginRate).toBe(0.4);
      expect(result.details.formula).toContain('毛利 = 售价 - 成本');
    });
  });

  describe('calculateROI', () => {
    it('should throw error for invalid inputs', () => {
      expect(() => CalculationService.calculateROI(-1, 100)).toThrow('固定投入不能为负数');
      expect(() => CalculationService.calculateROI(1000, 0)).toThrow('月利润必须大于0');
      expect(() => CalculationService.calculateROI(1000, -1)).toThrow('月利润必须大于0');
    });

    it('should calculate ROI correctly for specific examples', () => {
      const result = CalculationService.calculateROI(12000, 1000);
      
      expect(result.result).toBe(12);
      expect(result.details.formula).toContain('回本周期(月) = 固定投入 / 月利润');
    });
  });

  describe('calculateMonthlyProfit', () => {
    it('should throw error for invalid inputs', () => {
      expect(() => CalculationService.calculateMonthlyProfit(-1, 100)).toThrow('单位毛利不能为负数');
      expect(() => CalculationService.calculateMonthlyProfit(10, 0)).toThrow('月销量必须大于0');
      expect(() => CalculationService.calculateMonthlyProfit(10, -1)).toThrow('月销量必须大于0');
    });

    it('should calculate monthly profit correctly', () => {
      const result = CalculationService.calculateMonthlyProfit(40, 100);
      
      expect(result.result).toBe(4000);
      expect(result.details.formula).toContain('月利润 = 单位毛利 × 月销量');
    });
  });

  describe('assessProfitRisk', () => {
    it('should assess high risk correctly', () => {
      const highRiskAnalysis: ProfitAnalysis = {
        margin: 10,
        marginRate: 0.1, // 10% margin rate
        roiMonths: 30 // 30 months ROI
      };
      
      const risk = CalculationService.assessProfitRisk(highRiskAnalysis);
      expect(risk.level).toBe('high');
      expect(risk.description).toContain('高风险');
    });

    it('should assess medium risk correctly', () => {
      const mediumRiskAnalysis: ProfitAnalysis = {
        margin: 30,
        marginRate: 0.3, // 30% margin rate
        roiMonths: 15 // 15 months ROI
      };
      
      const risk = CalculationService.assessProfitRisk(mediumRiskAnalysis);
      expect(risk.level).toBe('medium');
      expect(risk.description).toContain('中等风险');
    });

    it('should assess low risk correctly', () => {
      const lowRiskAnalysis: ProfitAnalysis = {
        margin: 50,
        marginRate: 0.5, // 50% margin rate
        roiMonths: 6 // 6 months ROI
      };
      
      const risk = CalculationService.assessProfitRisk(lowRiskAnalysis);
      expect(risk.level).toBe('low');
      expect(risk.description).toContain('低风险');
    });
  });
});

describe('CalculationUtils - Unit Tests', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(CalculationUtils.formatCurrency(1234.56)).toBe('$1,234.56');
      expect(CalculationUtils.formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(CalculationUtils.formatPercentage(0.1234)).toBe('12.3%');
      expect(CalculationUtils.formatPercentage(0.1234, 2)).toBe('12.34%');
    });
  });

  describe('formatTimePeriod', () => {
    it('should format time periods correctly', () => {
      expect(CalculationUtils.formatTimePeriod(0.5)).toBe('15天');
      expect(CalculationUtils.formatTimePeriod(6)).toBe('6.0个月');
      expect(CalculationUtils.formatTimePeriod(18)).toBe('1.5年');
    });
  });

  describe('safeDivide', () => {
    it('should handle division by zero', () => {
      expect(CalculationUtils.safeDivide(10, 0)).toBe(0);
      expect(CalculationUtils.safeDivide(10, 0, 999)).toBe(999);
      expect(CalculationUtils.safeDivide(10, 2)).toBe(5);
    });
  });

  describe('clamp', () => {
    it('should clamp values correctly', () => {
      expect(CalculationUtils.clamp(5, 0, 10)).toBe(5);
      expect(CalculationUtils.clamp(-5, 0, 10)).toBe(0);
      expect(CalculationUtils.clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('roundTo', () => {
    it('should round to specified decimals', () => {
      expect(CalculationUtils.roundTo(3.14159, 2)).toBe(3.14);
      expect(CalculationUtils.roundTo(3.14159, 0)).toBe(3);
      expect(CalculationUtils.roundTo(3.14159, 4)).toBe(3.1416);
    });
  });
});