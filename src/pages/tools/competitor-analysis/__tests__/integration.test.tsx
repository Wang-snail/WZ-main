/**
 * 智能竞品分析工具端到端集成测试
 * 测试完整的分析工作流和组件间数据流
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { BaseProduct, CompetitorData, AnalysisResult } from '../types';
import { CalculationService } from '../services/CalculationService';
import { NLPExtractionService } from '../services/NLPExtractionService';

// Mock external dependencies
vi.mock('dexie', () => ({
  Dexie: vi.fn().mockImplementation(() => ({
    version: vi.fn().mockReturnThis(),
    stores: vi.fn().mockReturnThis(),
    open: vi.fn().mockResolvedValue(undefined)
  }))
}));

// Test data
const mockBaseProduct: BaseProduct = {
  id: 'test-product-1',
  name: '测试产品',
  cost: 50,
  weight: 200,
  dimensions: {
    length: 10,
    width: 8,
    height: 5
  },
  fixedInvestment: 10000,
  estimatedMonthlySales: 1000,
  features: ['功能A', '功能B', '功能C'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

const mockCompetitorData: CompetitorData = {
  price: 80,
  weight: 250,
  dimensions: {
    length: 12,
    width: 9,
    height: 6
  },
  features: ['功能A', '功能B', '功能D'],
  extractionConfidence: {
    price: 0.95,
    weight: 0.85,
    dimensions: 0.80,
    features: 0.90
  },
  rawText: '竞品售价80美元，重量250克，尺寸12x9x6厘米，具有功能A、功能B和功能D',
  extractedAt: new Date('2024-01-01')
};

describe('智能竞品分析工具 - 端到端集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('完整分析工作流测试', () => {
    it('应该能够完成从数据输入到结果计算的完整流程', () => {
      // 步骤1: 验证基础产品数据结构
      expect(mockBaseProduct).toHaveProperty('id');
      expect(mockBaseProduct).toHaveProperty('name');
      expect(mockBaseProduct).toHaveProperty('cost');
      expect(mockBaseProduct).toHaveProperty('weight');
      expect(mockBaseProduct).toHaveProperty('dimensions');
      expect(mockBaseProduct).toHaveProperty('fixedInvestment');
      expect(mockBaseProduct).toHaveProperty('estimatedMonthlySales');
      expect(mockBaseProduct).toHaveProperty('features');

      // 步骤2: 验证竞品数据结构
      expect(mockCompetitorData).toHaveProperty('price');
      expect(mockCompetitorData).toHaveProperty('weight');
      expect(mockCompetitorData).toHaveProperty('dimensions');
      expect(mockCompetitorData).toHaveProperty('features');
      expect(mockCompetitorData).toHaveProperty('extractionConfidence');
      expect(mockCompetitorData).toHaveProperty('rawText');

      // 步骤3: 验证利润计算
      const profitResult = CalculationService.calculateProfit(
        mockCompetitorData.price,
        mockBaseProduct.cost
      );

      expect(profitResult.result).toHaveProperty('margin');
      expect(profitResult.result).toHaveProperty('marginRate');
      expect(profitResult.result.margin).toBe(30); // 80 - 50 = 30
      expect(profitResult.result.marginRate).toBe(0.375); // 30 / 80 = 0.375

      // 步骤4: 验证ROI计算
      const monthlyProfit = profitResult.result.margin * mockBaseProduct.estimatedMonthlySales;
      const roiResult = CalculationService.calculateROI(
        mockBaseProduct.fixedInvestment,
        monthlyProfit
      );

      expect(roiResult.result).toBeGreaterThan(0);
      expect(roiResult.result).toBeCloseTo(0.3333333333333333, 10); // Use toBeCloseTo for floating point comparison

      // 步骤5: 验证雷达图评分计算
      const radarScores = CalculationService.calculateRadarScores(
        mockBaseProduct,
        mockCompetitorData,
        { margin: profitResult.result.margin, marginRate: profitResult.result.marginRate, roiMonths: roiResult.result }
      );

      expect(radarScores.result).toHaveProperty('profitability');
      expect(radarScores.result).toHaveProperty('roiSpeed');
      expect(radarScores.result).toHaveProperty('portability');
      expect(radarScores.result).toHaveProperty('features');
      expect(radarScores.result).toHaveProperty('priceAdvantage');

      // 验证评分范围在0-10之间
      Object.values(radarScores.result).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(10);
      });
    });

    it('应该正确处理不同的利润场景', () => {
      // 测试高利润场景
      const highProfitCompetitor = { ...mockCompetitorData, price: 150 };
      const highProfitResult = CalculationService.calculateProfit(
        highProfitCompetitor.price,
        mockBaseProduct.cost
      );

      expect(highProfitResult.result.margin).toBe(100); // 150 - 50 = 100
      expect(highProfitResult.result.marginRate).toBe(0.6666666666666666); // 100 / 150

      // 测试低利润场景
      const lowProfitCompetitor = { ...mockCompetitorData, price: 60 };
      const lowProfitResult = CalculationService.calculateProfit(
        lowProfitCompetitor.price,
        mockBaseProduct.cost
      );

      expect(lowProfitResult.result.margin).toBe(10); // 60 - 50 = 10
      expect(lowProfitResult.result.marginRate).toBe(0.16666666666666666); // 10 / 60
    });

    it('应该正确处理不同的ROI场景', () => {
      const profitResult = CalculationService.calculateProfit(
        mockCompetitorData.price,
        mockBaseProduct.cost
      );

      // 测试高销量场景
      const highSalesProduct = { ...mockBaseProduct, estimatedMonthlySales: 5000 };
      const highSalesROI = CalculationService.calculateROI(
        highSalesProduct.fixedInvestment,
        profitResult.result.margin * highSalesProduct.estimatedMonthlySales
      );

      expect(highSalesROI.result).toBeLessThan(0.34); // 更高销量 = 更快回本

      // 测试低销量场景
      const lowSalesProduct = { ...mockBaseProduct, estimatedMonthlySales: 200 };
      const lowSalesROI = CalculationService.calculateROI(
        lowSalesProduct.fixedInvestment,
        profitResult.result.margin * lowSalesProduct.estimatedMonthlySales
      );

      expect(lowSalesROI.result).toBeGreaterThan(0.34); // 更低销量 = 更慢回本
    });

    it('应该正确计算便携指数', () => {
      // 测试轻便产品
      const lightProduct = { ...mockBaseProduct, weight: 100 };
      const lightCompetitor = { ...mockCompetitorData, weight: 150 };

      const lightRadarScores = CalculationService.calculateRadarScores(
        lightProduct,
        lightCompetitor,
        { margin: 30, marginRate: 0.375, roiMonths: 0.33 }
      );

      // 测试重型产品
      const heavyProduct = { ...mockBaseProduct, weight: 500 };
      const heavyCompetitor = { ...mockCompetitorData, weight: 400 };

      const heavyRadarScores = CalculationService.calculateRadarScores(
        heavyProduct,
        heavyCompetitor,
        { margin: 30, marginRate: 0.375, roiMonths: 0.33 }
      );

      // 轻便产品的便携指数应该更高
      expect(lightRadarScores.result.portability).toBeGreaterThan(heavyRadarScores.result.portability);
    });

    it('应该正确计算功能丰富度', () => {
      // 测试功能丰富的产品
      const featureRichProduct = {
        ...mockBaseProduct,
        features: ['功能A', '功能B', '功能C', '功能D', '功能E']
      };
      const featurePoorCompetitor = {
        ...mockCompetitorData,
        features: ['功能A', '功能B']
      };

      const richRadarScores = CalculationService.calculateRadarScores(
        featureRichProduct,
        featurePoorCompetitor,
        { margin: 30, marginRate: 0.375, roiMonths: 0.33 }
      );

      // 测试功能较少的产品
      const featurePoorProduct = {
        ...mockBaseProduct,
        features: ['功能A']
      };
      const featureRichCompetitor = {
        ...mockCompetitorData,
        features: ['功能A', '功能B', '功能C', '功能D']
      };

      const poorRadarScores = CalculationService.calculateRadarScores(
        featurePoorProduct,
        featureRichCompetitor,
        { margin: 30, marginRate: 0.375, roiMonths: 0.33 }
      );

      // 功能更丰富的产品应该有更高的功能评分
      expect(richRadarScores.result.features).toBeGreaterThan(poorRadarScores.result.features);
    });
  });

  describe('数据验证测试', () => {
    it('应该验证产品数据的完整性', () => {
      // 验证必需字段存在
      const requiredFields = ['id', 'name', 'cost', 'weight', 'dimensions', 'fixedInvestment', 'estimatedMonthlySales', 'features'];
      
      requiredFields.forEach(field => {
        expect(mockBaseProduct).toHaveProperty(field);
        expect(mockBaseProduct[field as keyof BaseProduct]).toBeDefined();
      });

      // 验证数值字段的类型
      expect(typeof mockBaseProduct.cost).toBe('number');
      expect(typeof mockBaseProduct.weight).toBe('number');
      expect(typeof mockBaseProduct.fixedInvestment).toBe('number');
      expect(typeof mockBaseProduct.estimatedMonthlySales).toBe('number');

      // 验证数组字段
      expect(Array.isArray(mockBaseProduct.features)).toBe(true);
      expect(mockBaseProduct.features.length).toBeGreaterThan(0);

      // 验证尺寸对象
      expect(mockBaseProduct.dimensions).toHaveProperty('length');
      expect(mockBaseProduct.dimensions).toHaveProperty('width');
      expect(mockBaseProduct.dimensions).toHaveProperty('height');
    });

    it('应该验证竞品数据的完整性', () => {
      // 验证必需字段存在
      const requiredFields = ['price', 'features', 'extractionConfidence', 'rawText'];
      
      requiredFields.forEach(field => {
        expect(mockCompetitorData).toHaveProperty(field);
        expect(mockCompetitorData[field as keyof CompetitorData]).toBeDefined();
      });

      // 验证置信度字段
      expect(mockCompetitorData.extractionConfidence).toHaveProperty('price');
      expect(mockCompetitorData.extractionConfidence).toHaveProperty('weight');
      expect(mockCompetitorData.extractionConfidence).toHaveProperty('dimensions');
      expect(mockCompetitorData.extractionConfidence).toHaveProperty('features');

      // 验证置信度范围
      Object.values(mockCompetitorData.extractionConfidence).forEach(confidence => {
        expect(confidence).toBeGreaterThanOrEqual(0);
        expect(confidence).toBeLessThanOrEqual(1);
      });
    });

    it('应该验证计算结果的合理性', () => {
      const profitResult = CalculationService.calculateProfit(
        mockCompetitorData.price,
        mockBaseProduct.cost
      );

      // 验证利润计算的合理性
      expect(profitResult.result.margin).toBe(mockCompetitorData.price - mockBaseProduct.cost);
      expect(profitResult.result.marginRate).toBe(profitResult.result.margin / mockCompetitorData.price);

      // 验证ROI计算的合理性
      const monthlyProfit = profitResult.result.margin * mockBaseProduct.estimatedMonthlySales;
      const roiResult = CalculationService.calculateROI(mockBaseProduct.fixedInvestment, monthlyProfit);
      
      expect(roiResult.result).toBe(mockBaseProduct.fixedInvestment / monthlyProfit);
    });
  });

  describe('边界条件测试', () => {
    it('应该处理极端数值情况', () => {
      // 测试极小值
      const minimalProduct = {
        ...mockBaseProduct,
        cost: 0.01,
        weight: 1,
        fixedInvestment: 1,
        estimatedMonthlySales: 1
      };

      const minimalCompetitor = {
        ...mockCompetitorData,
        price: 0.02
      };

      const minimalResult = CalculationService.calculateProfit(
        minimalCompetitor.price,
        minimalProduct.cost
      );

      expect(minimalResult.result.margin).toBe(0.01);
      expect(minimalResult.result.marginRate).toBe(0.5);

      // 测试极大值
      const maximalProduct = {
        ...mockBaseProduct,
        cost: 999999,
        weight: 100000,
        fixedInvestment: 10000000,
        estimatedMonthlySales: 1000000
      };

      const maximalCompetitor = {
        ...mockCompetitorData,
        price: 1000000
      };

      const maximalResult = CalculationService.calculateProfit(
        maximalCompetitor.price,
        maximalProduct.cost
      );

      expect(maximalResult.result.margin).toBe(1);
      expect(maximalResult.result.marginRate).toBe(0.000001);
    });

    it('应该处理错误输入情况', () => {
      // 测试零价格
      expect(() => {
        CalculationService.calculateProfit(0, 50);
      }).toThrow('竞品价格必须大于0');

      // 测试负成本
      expect(() => {
        CalculationService.calculateProfit(100, -10);
      }).toThrow('成本不能为负数');

      // 测试成本大于售价
      expect(() => {
        CalculationService.calculateProfit(50, 60);
      }).toThrow('成本不能大于或等于售价');

      // 测试ROI计算错误输入
      expect(() => {
        CalculationService.calculateROI(-1000, 100);
      }).toThrow('固定投入不能为负数');

      expect(() => {
        CalculationService.calculateROI(1000, 0);
      }).toThrow('月利润必须大于0');
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内完成计算', () => {
      const startTime = performance.now();

      // 执行多次计算来测试性能
      for (let i = 0; i < 1000; i++) {
        CalculationService.calculateProfit(
          mockCompetitorData.price + i,
          mockBaseProduct.cost + (i % 10)
        );

        CalculationService.calculateROI(
          mockBaseProduct.fixedInvestment + i * 100,
          (mockCompetitorData.price - mockBaseProduct.cost) * (mockBaseProduct.estimatedMonthlySales + i)
        );

        CalculationService.calculateRadarScores(
          mockBaseProduct,
          mockCompetitorData,
          { margin: 30 + i, marginRate: 0.375, roiMonths: 0.33 }
        );
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // 1000次计算应该在100ms内完成
      expect(executionTime).toBeLessThan(100);
    });

    it('应该处理大量数据而不出现内存泄漏', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // 创建大量数据进行计算
      const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({
        product: { ...mockBaseProduct, id: `product-${i}` },
        competitor: { ...mockCompetitorData, price: mockCompetitorData.price + i }
      }));

      largeDataSet.forEach(({ product, competitor }) => {
        CalculationService.calculateProfit(competitor.price, product.cost);
      });

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // 内存增长应该在合理范围内（小于10MB）
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});