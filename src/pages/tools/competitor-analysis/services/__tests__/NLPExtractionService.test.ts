/**
 * NLP文本提取服务测试
 * 测试文本解析、数据提取和置信度计算功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NLPExtractionService } from '../NLPExtractionService';
import type { CompetitorData } from '../../types';

describe('NLPExtractionService', () => {
  let service: NLPExtractionService;

  beforeEach(() => {
    service = new NLPExtractionService();
  });

  describe('价格提取测试', () => {
    it('应该正确提取美元价格', async () => {
      const text = 'JISULIFE Portable Neck Fan. Price: $31.99. Ultra-lightweight design.';
      const result = await service.extractCompetitorData(text);
      
      expect(result.price).toBe(31.99);
      expect(result.extractionConfidence.price).toBeGreaterThan(0.8);
    });

    it('应该正确提取人民币价格并转换', async () => {
      const text = '便携式颈挂风扇，售价：¥199.99，超轻设计。';
      const result = await service.extractCompetitorData(text);
      
      expect(result.price).toBeCloseTo(199.99 / 6.5, 2); // 汇率转换
      expect(result.extractionConfidence.price).toBeGreaterThan(0.6);
    });

    it('应该处理多个价格并选择最佳匹配', async () => {
      const text = 'Special price: $31.99, was originally $50.00. Best deal!';
      const result = await service.extractCompetitorData(text);
      
      // 应该选择置信度更高的价格（带有price关键词的）
      expect(result.price).toBe(31.99);
    });

    it('应该在没有价格时抛出错误', async () => {
      const text = 'This is a great product with amazing features but no price mentioned.';
      
      await expect(service.extractCompetitorData(text)).rejects.toThrow('未能从文本中提取到有效的价格信息');
    });
  });

  describe('重量提取测试', () => {
    it('应该正确提取克重量', async () => {
      const text = 'Lightweight design only 258g. Perfect for travel. Price: $25.99';
      const result = await service.extractCompetitorData(text);
      
      expect(result.weight).toBe(258);
      expect(result.extractionConfidence.weight).toBeGreaterThan(0.6);
    });

    it('应该正确提取千克重量并转换', async () => {
      const text = 'Heavy duty model weighs 1.5kg for stability. Price: $45.99';
      const result = await service.extractCompetitorData(text);
      
      expect(result.weight).toBe(1500); // 转换为克
      expect(result.extractionConfidence.weight).toBeGreaterThan(0.6);
    });

    it('应该正确提取磅重量并转换', async () => {
      const text = 'Compact design at just 0.5 pounds. Price: $15.99';
      const result = await service.extractCompetitorData(text);
      
      expect(result.weight).toBeCloseTo(226.8, 1); // 0.5磅转换为克
    });

    it('应该在没有重量时返回undefined', async () => {
      const text = 'Price: $31.99. Great features but no weight mentioned.';
      const result = await service.extractCompetitorData(text);
      
      expect(result.weight).toBeUndefined();
      expect(result.extractionConfidence.weight).toBe(0);
    });
  });

  describe('尺寸提取测试', () => {
    it('应该正确提取英寸尺寸并转换', async () => {
      const text = 'Dimensions: 7.8 x 7.8 x 2.4 inches. Compact design. Price: $31.99';
      const result = await service.extractCompetitorData(text);
      
      expect(result.dimensions).toBeDefined();
      expect(result.dimensions!.length).toBeCloseTo(19.81, 1); // 7.8 * 2.54
      expect(result.dimensions!.width).toBeCloseTo(19.81, 1);
      expect(result.dimensions!.height).toBeCloseTo(6.10, 1);
      expect(result.extractionConfidence.dimensions).toBe(0.9);
    });

    it('应该正确提取厘米尺寸', async () => {
      const text = '产品尺寸：20 x 15 x 5 cm，便于携带。价格：$29.99';
      const result = await service.extractCompetitorData(text);
      
      expect(result.dimensions).toBeDefined();
      expect(result.dimensions!.length).toBe(20);
      expect(result.dimensions!.width).toBe(15);
      expect(result.dimensions!.height).toBe(5);
      expect(result.extractionConfidence.dimensions).toBe(0.95);
    });

    it('应该在没有尺寸时返回undefined', async () => {
      const text = 'Price: $31.99. Weight: 258g. No dimensions mentioned.';
      const result = await service.extractCompetitorData(text);
      
      expect(result.dimensions).toBeUndefined();
      expect(result.extractionConfidence.dimensions).toBe(0);
    });
  });

  describe('功能特性提取测试', () => {
    it('应该提取基本功能关键词', async () => {
      const text = 'Bladeless design with 3 speed modes, rechargeable battery, ultra quiet operation. Price: $31.99';
      const result = await service.extractCompetitorData(text);
      
      // 检查是否包含相关功能特性（可能是完整短语）
      expect(result.features.some(f => f.toLowerCase().includes('bladeless'))).toBe(true);
      expect(result.features.some(f => f.toLowerCase().includes('rechargeable'))).toBe(true);
      expect(result.features.some(f => f.toLowerCase().includes('quiet'))).toBe(true);
      expect(result.extractionConfidence.features).toBeGreaterThan(0);
    });

    it('应该提取数字特性', async () => {
      const text = 'Features 4000mAh battery, 3 speed settings, works for 8 hours continuously. Price: $42.99';
      const result = await service.extractCompetitorData(text);
      
      expect(result.features.some(f => f.includes('4000mAh'))).toBe(true);
      expect(result.features.some(f => f.includes('3档'))).toBe(true);
      expect(result.features.some(f => f.includes('8'))).toBe(true);
    });

    it('应该处理中文功能描述', async () => {
      const text = '无叶设计，三档调速，静音运行，便携轻便。价格：$35.99';
      const result = await service.extractCompetitorData(text);
      
      expect(result.features.some(f => f.includes('静音') || f.includes('便携'))).toBe(true);
    });
  });

  describe('综合提取测试', () => {
    it('应该正确提取完整的产品信息', async () => {
      const text = `
        JISULIFE Portable Neck Fan, Hands Free Bladeless Fan
        Price: $31.99
        Weight: Only 258g
        Dimensions: 7.8 x 7.8 x 2.4 inches
        Features: 4000mAh rechargeable battery, 3 speed modes, ultra quiet motor, 360° cooling airflow
        Perfect for outdoor activities and travel
      `;
      
      const result = await service.extractCompetitorData(text);
      
      // 验证所有字段都被提取
      expect(result.price).toBe(31.99);
      expect(result.weight).toBe(258);
      expect(result.dimensions).toBeDefined();
      expect(result.features.length).toBeGreaterThan(0);
      
      // 验证置信度
      expect(result.extractionConfidence.price).toBeGreaterThan(0.8);
      expect(result.extractionConfidence.weight).toBeGreaterThan(0.6);
      expect(result.extractionConfidence.dimensions).toBeGreaterThan(0.8);
      expect(result.extractionConfidence.features).toBeGreaterThan(0);
      
      // 验证原始文本被保存
      expect(result.rawText).toBe(text);
      expect(result.extractedAt).toBeInstanceOf(Date);
    });

    it('应该处理部分信息缺失的情况', async () => {
      const text = 'Great portable fan for $25.99. Very quiet and efficient.';
      const result = await service.extractCompetitorData(text);
      
      expect(result.price).toBe(25.99);
      expect(result.weight).toBeUndefined();
      expect(result.dimensions).toBeUndefined();
      expect(result.features.some(f => f.includes('quiet'))).toBe(true);
    });
  });

  describe('验证和质量评估测试', () => {
    it('应该正确验证提取结果', () => {
      const validData: CompetitorData = {
        price: 31.99,
        weight: 258,
        features: ['bladeless', 'quiet'],
        extractionConfidence: {
          price: 0.9,
          weight: 0.8,
          dimensions: 0.0,
          features: 0.6
        },
        rawText: 'test',
        extractedAt: new Date()
      };
      
      expect(service.validateExtractionResult(validData)).toBe(true);
    });

    it('应该拒绝无效的提取结果', () => {
      const invalidData: CompetitorData = {
        price: 0, // 无效价格
        features: [],
        extractionConfidence: {
          price: 0.1, // 低置信度
          weight: 0.1,
          dimensions: 0.1,
          features: 0.1
        },
        rawText: 'test',
        extractedAt: new Date()
      };
      
      expect(service.validateExtractionResult(invalidData)).toBe(false);
    });

    it('应该正确评估提取质量', () => {
      const highQualityData: CompetitorData = {
        price: 31.99,
        weight: 258,
        features: ['test'],
        extractionConfidence: {
          price: 0.9,
          weight: 0.8,
          dimensions: 0.9,
          features: 0.8
        },
        rawText: 'test',
        extractedAt: new Date()
      };
      
      expect(service.getExtractionQuality(highQualityData)).toBe('high');
      
      const lowQualityData: CompetitorData = {
        price: 31.99,
        features: [],
        extractionConfidence: {
          price: 0.6,
          weight: 0.3,
          dimensions: 0.2,
          features: 0.1
        },
        rawText: 'test',
        extractedAt: new Date()
      };
      
      expect(service.getExtractionQuality(lowQualityData)).toBe('low');
    });
  });

  describe('错误处理测试', () => {
    it('应该处理空文本输入', async () => {
      await expect(service.extractCompetitorData('')).rejects.toThrow();
    });

    it('应该处理无效文本格式', async () => {
      const invalidText = '!@#$%^&*()_+{}|:"<>?[]\\;\',./ 12345';
      await expect(service.extractCompetitorData(invalidText)).rejects.toThrow();
    });

    it('应该处理极端数值', async () => {
      const text = 'Price: $999999.99, Weight: 50000g, Dimensions: 1000 x 1000 x 1000 cm';
      
      // 这个测试应该抛出错误，因为价格超出合理范围
      await expect(service.extractCompetitorData(text)).rejects.toThrow();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理最小有效价格', async () => {
      const text = 'Special offer: $0.10 only!';
      const result = await service.extractCompetitorData(text);
      
      expect(result.price).toBe(0.10);
    });

    it('应该处理最小有效重量', async () => {
      const text = 'Ultra light at 1g. Price: $5.99';
      const result = await service.extractCompetitorData(text);
      
      expect(result.weight).toBe(1);
    });

    it('应该处理最小有效尺寸', async () => {
      const text = 'Tiny size: 0.1 x 0.1 x 0.1 cm. Price: $1.99';
      const result = await service.extractCompetitorData(text);
      
      expect(result.dimensions).toBeDefined();
      expect(result.dimensions!.length).toBe(0.1);
    });
  });
});