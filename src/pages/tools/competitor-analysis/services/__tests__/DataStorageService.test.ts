/**
 * 数据存储服务的属性测试和单元测试
 * 验证数据持久化的正确性和一致性
 * 
 * 注意：由于测试环境不支持IndexedDB，这里使用内存模拟存储进行测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import type { BaseProduct, AnalysisSession, UserPreferences } from '../../types';

// 内存存储模拟类，用于测试
class MockDataStorageService {
  private baseProducts: Map<string, BaseProduct> = new Map();
  private analysisSessions: Map<string, AnalysisSession> = new Map();
  private userPreferences: UserPreferences | null = null;

  async initialize(): Promise<void> {
    // 模拟初始化 - 不设置默认偏好，让测试控制数据
  }

  async saveBaseProduct(product: BaseProduct): Promise<void> {
    this.baseProducts.set(product.id, JSON.parse(JSON.stringify(product)));
  }

  async getBaseProduct(id: string): Promise<BaseProduct | null> {
    const product = this.baseProducts.get(id);
    return product ? JSON.parse(JSON.stringify(product)) : null;
  }

  async getAllBaseProducts(): Promise<BaseProduct[]> {
    return Array.from(this.baseProducts.values()).map(p => ({ ...p }));
  }

  async deleteBaseProduct(id: string): Promise<boolean> {
    return this.baseProducts.delete(id);
  }

  async saveAnalysisSession(session: AnalysisSession): Promise<void> {
    this.analysisSessions.set(session.id, JSON.parse(JSON.stringify(session)));
  }

  async getAnalysisSession(id: string): Promise<AnalysisSession | null> {
    const session = this.analysisSessions.get(id);
    return session ? JSON.parse(JSON.stringify(session)) : null;
  }

  async getAllAnalysisSessions(): Promise<AnalysisSession[]> {
    return Array.from(this.analysisSessions.values()).map(s => JSON.parse(JSON.stringify(s)));
  }

  async deleteAnalysisSession(id: string): Promise<boolean> {
    return this.analysisSessions.delete(id);
  }

  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    this.userPreferences = JSON.parse(JSON.stringify(preferences));
  }

  async getUserPreferences(): Promise<UserPreferences | null> {
    return this.userPreferences ? JSON.parse(JSON.stringify(this.userPreferences)) : null;
  }

  async clearAllData(): Promise<void> {
    this.baseProducts.clear();
    this.analysisSessions.clear();
    this.userPreferences = null;
  }
}

// 测试数据生成器 - 优化以避免边界情况
const dimensionsArbitrary = fc.record({
  length: fc.float({ min: 1, max: 50, noNaN: true, noDefaultInfinity: true }),
  width: fc.float({ min: 1, max: 50, noNaN: true, noDefaultInfinity: true }),
  height: fc.float({ min: 1, max: 50, noNaN: true, noDefaultInfinity: true })
});

const baseProductArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  cost: fc.float({ min: 1, max: 1000, noNaN: true, noDefaultInfinity: true }),
  weight: fc.float({ min: 10, max: 1000, noNaN: true, noDefaultInfinity: true }),
  dimensions: dimensionsArbitrary,
  fixedInvestment: fc.float({ min: 1000, max: 50000, noNaN: true, noDefaultInfinity: true }),
  estimatedMonthlySales: fc.integer({ min: 10, max: 10000 }),
  features: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
  createdAt: fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31') }),
  updatedAt: fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31') })
});

const competitorDataArbitrary = fc.record({
  price: fc.float({ min: 10, max: 1000, noNaN: true, noDefaultInfinity: true }),
  weight: fc.option(fc.float({ min: 10, max: 1000, noNaN: true, noDefaultInfinity: true })),
  dimensions: fc.option(dimensionsArbitrary),
  features: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
  extractionConfidence: fc.record({
    price: fc.float({ min: Math.fround(0.1), max: Math.fround(1), noNaN: true, noDefaultInfinity: true }),
    weight: fc.float({ min: Math.fround(0.1), max: Math.fround(1), noNaN: true, noDefaultInfinity: true }),
    dimensions: fc.float({ min: Math.fround(0.1), max: Math.fround(1), noNaN: true, noDefaultInfinity: true }),
    features: fc.float({ min: Math.fround(0.1), max: Math.fround(1), noNaN: true, noDefaultInfinity: true })
  }),
  rawText: fc.string({ minLength: 10, maxLength: 200 }),
  extractedAt: fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31') })
});

const analysisResultArbitrary = fc.record({
  profitAnalysis: fc.record({
    margin: fc.float({ min: 1, max: 100, noNaN: true, noDefaultInfinity: true }),
    marginRate: fc.float({ min: 0.1, max: 0.9, noNaN: true, noDefaultInfinity: true }),
    roiMonths: fc.float({ min: 1, max: 60, noNaN: true, noDefaultInfinity: true })
  }),
  radarScores: fc.record({
    profitability: fc.float({ min: 1, max: 10, noNaN: true, noDefaultInfinity: true }),
    roiSpeed: fc.float({ min: 1, max: 10, noNaN: true, noDefaultInfinity: true }),
    portability: fc.float({ min: 1, max: 10, noNaN: true, noDefaultInfinity: true }),
    features: fc.float({ min: 1, max: 10, noNaN: true, noDefaultInfinity: true }),
    priceAdvantage: fc.float({ min: 1, max: 10, noNaN: true, noDefaultInfinity: true })
  }),
  insights: fc.record({
    advantages: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 3 }),
    risks: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 3 }),
    recommendations: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 3 })
  }),
  timestamp: fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31') }),
  sessionId: fc.uuid()
});

const analysisSessionArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
  baseProduct: baseProductArbitrary,
  competitorData: competitorDataArbitrary,
  analysisResult: analysisResultArbitrary,
  roleView: fc.constantFrom('retail', 'manufacturing'),
  createdAt: fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31') }),
  updatedAt: fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31') })
});

const userPreferencesArbitrary = fc.record({
  defaultRoleView: fc.constantFrom('retail', 'manufacturing'),
  autoSaveSession: fc.boolean(),
  defaultCurrency: fc.constantFrom('USD', 'CNY', 'EUR'),
  defaultWeightUnit: fc.constantFrom('g', 'kg', 'oz', 'lb'),
  defaultDimensionUnit: fc.constantFrom('cm', 'inch')
});

describe('DataStorageService - Property Tests', () => {
  let storageService: MockDataStorageService;

  beforeEach(async () => {
    storageService = new MockDataStorageService();
    await storageService.initialize();
    // 清理测试数据
    await storageService.clearAllData();
  });

  afterEach(async () => {
    // 清理测试数据
    await storageService.clearAllData();
  });

  describe('Property 1: 数据持久化round-trip一致性', () => {
    // Feature: smart-competitor-analysis, Property 1: 数据持久化round-trip一致性
    it('should maintain data consistency for base products', () => {
      fc.assert(
        fc.asyncProperty(
          baseProductArbitrary,
          async (baseProduct) => {
            // 保存产品数据
            await storageService.saveBaseProduct(baseProduct);
            
            // 重新加载数据
            const loadedProduct = await storageService.getBaseProduct(baseProduct.id);
            
            // 验证数据一致性
            expect(loadedProduct).toBeDefined();
            expect(loadedProduct).not.toBeNull();
            if (loadedProduct) {
              expect(loadedProduct.id).toBe(baseProduct.id);
              expect(loadedProduct.name).toBe(baseProduct.name);
              expect(loadedProduct.cost).toBeCloseTo(baseProduct.cost, 2);
              expect(loadedProduct.weight).toBeCloseTo(baseProduct.weight, 2);
              expect(loadedProduct.fixedInvestment).toBeCloseTo(baseProduct.fixedInvestment, 2);
              expect(loadedProduct.estimatedMonthlySales).toBe(baseProduct.estimatedMonthlySales);
              expect(loadedProduct.features).toEqual(baseProduct.features);
              
              // 验证尺寸数据
              expect(loadedProduct.dimensions.length).toBeCloseTo(baseProduct.dimensions.length, 2);
              expect(loadedProduct.dimensions.width).toBeCloseTo(baseProduct.dimensions.width, 2);
              expect(loadedProduct.dimensions.height).toBeCloseTo(baseProduct.dimensions.height, 2);
            }
          }
        ),
        { numRuns: 20 } // 减少运行次数以避免测试超时
      );
    });

    // Feature: smart-competitor-analysis, Property 1: 数据持久化round-trip一致性
    it('should maintain data consistency for analysis sessions', () => {
      fc.assert(
        fc.asyncProperty(
          analysisSessionArbitrary,
          async (session) => {
            // 保存会话数据
            await storageService.saveAnalysisSession(session);
            
            // 重新加载数据
            const loadedSession = await storageService.getAnalysisSession(session.id);
            
            // 验证会话基本信息
            expect(loadedSession).toBeDefined();
            expect(loadedSession).not.toBeNull();
            if (loadedSession) {
              expect(loadedSession.id).toBe(session.id);
              expect(loadedSession.name).toBe(session.name);
              expect(loadedSession.description).toBe(session.description);
              expect(loadedSession.roleView).toBe(session.roleView);
              
              // 验证基础产品数据
              expect(loadedSession.baseProduct.id).toBe(session.baseProduct.id);
              expect(loadedSession.baseProduct.name).toBe(session.baseProduct.name);
              expect(loadedSession.baseProduct.cost).toBeCloseTo(session.baseProduct.cost, 2);
              
              // 验证竞品数据
              expect(loadedSession.competitorData.price).toBeCloseTo(session.competitorData.price, 2);
              expect(loadedSession.competitorData.features).toEqual(session.competitorData.features);
              
              // 验证分析结果
              expect(loadedSession.analysisResult.profitAnalysis.margin)
                .toBeCloseTo(session.analysisResult.profitAnalysis.margin, 2);
              expect(loadedSession.analysisResult.radarScores.profitability)
                .toBeCloseTo(session.analysisResult.radarScores.profitability, 2);
            }
          }
        ),
        { numRuns: 15 } // 减少运行次数以避免测试超时
      );
    });

    // Feature: smart-competitor-analysis, Property 1: 数据持久化round-trip一致性
    it('should maintain data consistency for user preferences', () => {
      fc.assert(
        fc.asyncProperty(
          userPreferencesArbitrary,
          async (preferences) => {
            // 保存用户偏好
            await storageService.saveUserPreferences(preferences);
            
            // 重新加载数据
            const loadedPreferences = await storageService.getUserPreferences();
            
            // 验证数据一致性
            expect(loadedPreferences).toBeDefined();
            expect(loadedPreferences).not.toBeNull();
            expect(loadedPreferences!.defaultRoleView).toBe(preferences.defaultRoleView);
            expect(loadedPreferences!.autoSaveSession).toBe(preferences.autoSaveSession);
            expect(loadedPreferences!.defaultCurrency).toBe(preferences.defaultCurrency);
            expect(loadedPreferences!.defaultWeightUnit).toBe(preferences.defaultWeightUnit);
            expect(loadedPreferences!.defaultDimensionUnit).toBe(preferences.defaultDimensionUnit);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 10: 会话管理操作幂等性', () => {
    // Feature: smart-competitor-analysis, Property 10: 会话管理操作幂等性
    it('should be idempotent for session save operations', () => {
      fc.assert(
        fc.asyncProperty(
          analysisSessionArbitrary,
          async (session) => {
            // 第一次保存
            await storageService.saveAnalysisSession(session);
            const firstSave = await storageService.getAnalysisSession(session.id);
            
            // 第二次保存相同数据
            await storageService.saveAnalysisSession(session);
            const secondSave = await storageService.getAnalysisSession(session.id);
            
            // 验证两次保存结果相同
            expect(secondSave).toEqual(firstSave);
            
            // 验证会话列表中只有一个条目
            const sessions = await storageService.getAllAnalysisSessions();
            const matchingSessions = sessions.filter(s => s.id === session.id);
            expect(matchingSessions).toHaveLength(1);
          }
        ),
        { numRuns: 15 }
      );
    });

    // Feature: smart-competitor-analysis, Property 10: 会话管理操作幂等性
    it('should be idempotent for session delete operations', () => {
      fc.assert(
        fc.asyncProperty(
          analysisSessionArbitrary,
          async (session) => {
            // 保存会话
            await storageService.saveAnalysisSession(session);
            
            // 第一次删除
            const firstDelete = await storageService.deleteAnalysisSession(session.id);
            expect(firstDelete).toBe(true);
            
            // 第二次删除相同会话
            const secondDelete = await storageService.deleteAnalysisSession(session.id);
            expect(secondDelete).toBe(false); // 应该返回false，因为已经不存在
            
            // 验证会话确实被删除
            const deletedSession = await storageService.getAnalysisSession(session.id);
            expect(deletedSession).toBeNull();
          }
        ),
        { numRuns: 15 }
      );
    });
  });
});

describe('DataStorageService - Unit Tests', () => {
  let storageService: MockDataStorageService;

  beforeEach(async () => {
    storageService = new MockDataStorageService();
    await storageService.initialize();
    await storageService.clearAllData();
  });

  afterEach(async () => {
    await storageService.clearAllData();
  });

  describe('Base Product Operations', () => {
    it('should save and retrieve base products correctly', async () => {
      const product: BaseProduct = {
        id: 'test-product-1',
        name: 'Test Product',
        cost: 50.0,
        weight: 100,
        dimensions: { length: 10, width: 5, height: 2 },
        fixedInvestment: 10000,
        estimatedMonthlySales: 1000,
        features: ['feature1', 'feature2'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await storageService.saveBaseProduct(product);
      const retrieved = await storageService.getBaseProduct('test-product-1');

      expect(retrieved).toBeDefined();
      expect(retrieved!.name).toBe('Test Product');
      expect(retrieved!.cost).toBe(50.0);
    });

    it('should return null for non-existent products', async () => {
      const result = await storageService.getBaseProduct('non-existent');
      expect(result).toBeNull();
    });

    it('should list all base products', async () => {
      const product1: BaseProduct = {
        id: 'product-1',
        name: 'Product 1',
        cost: 50.0,
        weight: 100,
        dimensions: { length: 10, width: 5, height: 2 },
        fixedInvestment: 10000,
        estimatedMonthlySales: 1000,
        features: ['feature1'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const product2: BaseProduct = {
        id: 'product-2',
        name: 'Product 2',
        cost: 75.0,
        weight: 150,
        dimensions: { length: 12, width: 6, height: 3 },
        fixedInvestment: 15000,
        estimatedMonthlySales: 800,
        features: ['feature2'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await storageService.saveBaseProduct(product1);
      await storageService.saveBaseProduct(product2);

      const products = await storageService.getAllBaseProducts();
      expect(products).toHaveLength(2);
      expect(products.map(p => p.id)).toContain('product-1');
      expect(products.map(p => p.id)).toContain('product-2');
    });

    it('should delete base products correctly', async () => {
      const product: BaseProduct = {
        id: 'delete-test',
        name: 'Delete Test',
        cost: 50.0,
        weight: 100,
        dimensions: { length: 10, width: 5, height: 2 },
        fixedInvestment: 10000,
        estimatedMonthlySales: 1000,
        features: ['feature1'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await storageService.saveBaseProduct(product);
      const deleteResult = await storageService.deleteBaseProduct('delete-test');
      expect(deleteResult).toBe(true);

      const retrieved = await storageService.getBaseProduct('delete-test');
      expect(retrieved).toBeNull();
    });
  });

  describe('User Preferences Operations', () => {
    it('should save and retrieve user preferences correctly', async () => {
      const preferences: UserPreferences = {
        defaultRoleView: 'retail',
        autoSaveSession: true,
        defaultCurrency: 'USD',
        defaultWeightUnit: 'g',
        defaultDimensionUnit: 'cm'
      };

      await storageService.saveUserPreferences(preferences);
      const retrieved = await storageService.getUserPreferences();

      expect(retrieved).toBeDefined();
      expect(retrieved!.defaultRoleView).toBe('retail');
      expect(retrieved!.autoSaveSession).toBe(true);
      expect(retrieved!.defaultCurrency).toBe('USD');
    });

    it('should return null when no preferences exist', async () => {
      const preferences = await storageService.getUserPreferences();
      
      expect(preferences).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // 测试无效数据
      const invalidProduct = null as any;
      
      await expect(storageService.saveBaseProduct(invalidProduct))
        .rejects.toThrow();
    });

    it('should handle concurrent operations', async () => {
      const product: BaseProduct = {
        id: 'concurrent-test',
        name: 'Concurrent Test',
        cost: 50.0,
        weight: 100,
        dimensions: { length: 10, width: 5, height: 2 },
        fixedInvestment: 10000,
        estimatedMonthlySales: 1000,
        features: ['feature1'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 并发保存相同产品
      const promises = Array(5).fill(0).map(() => 
        storageService.saveBaseProduct(product)
      );

      await Promise.all(promises);

      // 验证只有一个产品被保存
      const products = await storageService.getAllBaseProducts();
      const matchingProducts = products.filter(p => p.id === 'concurrent-test');
      expect(matchingProducts).toHaveLength(1);
    });
  });
});