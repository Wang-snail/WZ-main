/**
 * 数据持久化服务
 * 使用IndexedDB存储用户数据和分析历史
 */

import Dexie, { Table } from 'dexie';
import type {
  BaseProduct,
  AnalysisSession,
  UserPreferences,
  AppError,
  ErrorType
} from '../../types';

/**
 * 数据库表结构接口
 */
interface DatabaseSchema {
  /** 用户产品库表 */
  baseProducts: BaseProduct;
  /** 分析会话历史表 */
  analysisSessions: AnalysisSession;
  /** 用户偏好设置表 */
  userPreferences: UserPreferences & { id: string };
}

/**
 * 数据库类
 */
class CompetitorAnalysisDatabase extends Dexie {
  /** 用户产品库表 */
  baseProducts!: Table<BaseProduct>;
  /** 分析会话历史表 */
  analysisSessions!: Table<AnalysisSession>;
  /** 用户偏好设置表 */
  userPreferences!: Table<UserPreferences & { id: string }>;

  constructor() {
    super('CompetitorAnalysisDB');
    
    // 定义数据库schema
    this.version(1).stores({
      baseProducts: 'id, name, cost, weight, fixedInvestment, createdAt, updatedAt',
      analysisSessions: 'id, name, createdAt, updatedAt',
      userPreferences: 'id'
    });
  }
}

/**
 * 数据库实例
 */
const db = new CompetitorAnalysisDatabase();

/**
 * 创建错误对象的辅助函数
 */
const createStorageError = (message: string, details?: string, retryable = true): AppError => ({
  type: ErrorType.STORAGE_ERROR,
  message,
  details,
  timestamp: new Date(),
  retryable
});

/**
 * 数据存储服务类
 */
export class DataStorageService {
  /**
   * 初始化数据库
   * 确保数据库正常工作并设置默认数据
   */
  static async initialize(): Promise<void> {
    try {
      await db.open();
      
      // 检查是否存在用户偏好设置，如果不存在则创建默认设置
      const preferencesCount = await db.userPreferences.count();
      if (preferencesCount === 0) {
        await this.saveUserPreferences({
          defaultRoleView: 'retail',
          autoSaveSession: true,
          defaultCurrency: 'USD',
          defaultWeightUnit: 'g',
          defaultDimensionUnit: 'cm'
        });
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw createStorageError(
        '数据库初始化失败',
        error instanceof Error ? error.message : '未知错误',
        false
      );
    }
  }

  /**
   * 保存基础产品信息
   */
  static async saveBaseProduct(product: BaseProduct): Promise<void> {
    try {
      await db.baseProducts.put(product);
    } catch (error) {
      console.error('Failed to save base product:', error);
      throw createStorageError(
        '保存产品信息失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 获取所有基础产品
   */
  static async getAllBaseProducts(): Promise<BaseProduct[]> {
    try {
      return await db.baseProducts.orderBy('updatedAt').reverse().toArray();
    } catch (error) {
      console.error('Failed to load base products:', error);
      throw createStorageError(
        '加载产品信息失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 根据ID获取基础产品
   */
  static async getBaseProductById(id: string): Promise<BaseProduct | null> {
    try {
      const product = await db.baseProducts.get(id);
      return product || null;
    } catch (error) {
      console.error('Failed to load base product by ID:', error);
      throw createStorageError(
        '加载产品信息失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 删除基础产品
   */
  static async deleteBaseProduct(id: string): Promise<void> {
    try {
      await db.baseProducts.delete(id);
    } catch (error) {
      console.error('Failed to delete base product:', error);
      throw createStorageError(
        '删除产品信息失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 保存分析会话
   */
  static async saveAnalysisSession(session: AnalysisSession): Promise<void> {
    try {
      await db.analysisSessions.put(session);
    } catch (error) {
      console.error('Failed to save analysis session:', error);
      throw createStorageError(
        '保存分析会话失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 获取所有分析会话
   */
  static async getAllAnalysisSessions(): Promise<AnalysisSession[]> {
    try {
      return await db.analysisSessions.orderBy('updatedAt').reverse().toArray();
    } catch (error) {
      console.error('Failed to load analysis sessions:', error);
      throw createStorageError(
        '加载分析会话失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 根据ID获取分析会话
   */
  static async getAnalysisSessionById(id: string): Promise<AnalysisSession | null> {
    try {
      const session = await db.analysisSessions.get(id);
      return session || null;
    } catch (error) {
      console.error('Failed to load analysis session by ID:', error);
      throw createStorageError(
        '加载分析会话失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 删除分析会话
   */
  static async deleteAnalysisSession(id: string): Promise<void> {
    try {
      await db.analysisSessions.delete(id);
    } catch (error) {
      console.error('Failed to delete analysis session:', error);
      throw createStorageError(
        '删除分析会话失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 批量删除分析会话
   */
  static async deleteMultipleAnalysisSessions(ids: string[]): Promise<void> {
    try {
      await db.analysisSessions.bulkDelete(ids);
    } catch (error) {
      console.error('Failed to delete multiple analysis sessions:', error);
      throw createStorageError(
        '批量删除分析会话失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 根据名称搜索分析会话
   */
  static async searchAnalysisSessionsByName(query: string): Promise<AnalysisSession[]> {
    try {
      const allSessions = await db.analysisSessions.toArray();
      const lowerQuery = query.toLowerCase();
      
      return allSessions.filter(session =>
        session.name.toLowerCase().includes(lowerQuery) ||
        (session.description && session.description.toLowerCase().includes(lowerQuery))
      ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      console.error('Failed to search analysis sessions:', error);
      throw createStorageError(
        '搜索分析会话失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 保存用户偏好设置
   */
  static async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await db.userPreferences.put({ ...preferences, id: 'default' });
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      throw createStorageError(
        '保存用户偏好失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 获取用户偏好设置
   */
  static async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const result = await db.userPreferences.get('default');
      if (!result) return null;
      
      // 移除id字段，只返回偏好设置
      const { id, ...preferences } = result;
      return preferences;
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      throw createStorageError(
        '加载用户偏好失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 获取数据库统计信息
   */
  static async getDatabaseStats(): Promise<{
    baseProductsCount: number;
    sessionsCount: number;
    totalStorageSize: number;
  }> {
    try {
      const [baseProductsCount, sessionsCount] = await Promise.all([
        db.baseProducts.count(),
        db.analysisSessions.count()
      ]);

      // 估算存储大小（简单估算）
      const allSessions = await db.analysisSessions.toArray();
      const allProducts = await db.baseProducts.toArray();
      const totalStorageSize = JSON.stringify([...allSessions, ...allProducts]).length;

      return {
        baseProductsCount,
        sessionsCount,
        totalStorageSize
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      throw createStorageError(
        '获取数据库统计信息失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 清理过期数据
   * 删除超过指定天数的分析会话
   */
  static async cleanupExpiredData(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const expiredSessions = await db.analysisSessions
        .where('updatedAt')
        .below(cutoffDate)
        .toArray();

      if (expiredSessions.length > 0) {
        const expiredIds = expiredSessions.map(session => session.id);
        await db.analysisSessions.bulkDelete(expiredIds);
      }

      return expiredSessions.length;
    } catch (error) {
      console.error('Failed to cleanup expired data:', error);
      throw createStorageError(
        '清理过期数据失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 导出所有数据
   */
  static async exportAllData(): Promise<{
    baseProducts: BaseProduct[];
    analysisSessions: AnalysisSession[];
    userPreferences: UserPreferences | null;
    exportedAt: Date;
  }> {
    try {
      const [baseProducts, analysisSessions, userPreferences] = await Promise.all([
        db.baseProducts.toArray(),
        db.analysisSessions.toArray(),
        this.getUserPreferences()
      ]);

      return {
        baseProducts,
        analysisSessions,
        userPreferences,
        exportedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw createStorageError(
        '导出数据失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 导入数据
   */
  static async importData(data: {
    baseProducts?: BaseProduct[];
    analysisSessions?: AnalysisSession[];
    userPreferences?: UserPreferences;
  }): Promise<void> {
    try {
      await db.transaction('rw', [db.baseProducts, db.analysisSessions, db.userPreferences], async () => {
        // 导入基础产品
        if (data.baseProducts && data.baseProducts.length > 0) {
          await db.baseProducts.bulkPut(data.baseProducts);
        }

        // 导入分析会话
        if (data.analysisSessions && data.analysisSessions.length > 0) {
          await db.analysisSessions.bulkPut(data.analysisSessions);
        }

        // 导入用户偏好
        if (data.userPreferences) {
          await db.userPreferences.put({ ...data.userPreferences, id: 'default' });
        }
      });
    } catch (error) {
      console.error('Failed to import data:', error);
      throw createStorageError(
        '导入数据失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 清空所有数据
   */
  static async clearAllData(): Promise<void> {
    try {
      await db.transaction('rw', [db.baseProducts, db.analysisSessions, db.userPreferences], async () => {
        await Promise.all([
          db.baseProducts.clear(),
          db.analysisSessions.clear(),
          db.userPreferences.clear()
        ]);
      });
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw createStorageError(
        '清空数据失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 检查数据库连接状态
   */
  static async checkConnection(): Promise<boolean> {
    try {
      await db.open();
      return db.isOpen();
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  }

  /**
   * 关闭数据库连接
   */
  static async close(): Promise<void> {
    try {
      await db.close();
    } catch (error) {
      console.error('Failed to close database:', error);
      throw createStorageError(
        '关闭数据库失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }
}

/**
 * 数据恢复服务
 * 处理数据损坏和恢复场景
 */
export class DataRecoveryService {
  /**
   * 检测并修复损坏的数据
   */
  static async detectAndRepairCorruptedData(): Promise<{
    corruptedSessions: string[];
    corruptedProducts: string[];
    repaired: boolean;
  }> {
    const corruptedSessions: string[] = [];
    const corruptedProducts: string[] = [];
    let repaired = false;

    try {
      // 检查分析会话数据完整性
      const sessions = await db.analysisSessions.toArray();
      for (const session of sessions) {
        if (!this.validateSessionData(session)) {
          corruptedSessions.push(session.id);
        }
      }

      // 检查产品数据完整性
      const products = await db.baseProducts.toArray();
      for (const product of products) {
        if (!this.validateProductData(product)) {
          corruptedProducts.push(product.id);
        }
      }

      // 删除损坏的数据
      if (corruptedSessions.length > 0) {
        await db.analysisSessions.bulkDelete(corruptedSessions);
        repaired = true;
      }

      if (corruptedProducts.length > 0) {
        await db.baseProducts.bulkDelete(corruptedProducts);
        repaired = true;
      }

      return { corruptedSessions, corruptedProducts, repaired };
    } catch (error) {
      console.error('Failed to detect and repair corrupted data:', error);
      throw createStorageError(
        '数据修复失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 验证会话数据完整性
   */
  private static validateSessionData(session: AnalysisSession): boolean {
    return !!(
      session.id &&
      session.name &&
      session.baseProduct &&
      session.competitorData &&
      session.analysisResult &&
      session.createdAt &&
      session.updatedAt
    );
  }

  /**
   * 验证产品数据完整性
   */
  private static validateProductData(product: BaseProduct): boolean {
    return !!(
      product.id &&
      product.name &&
      typeof product.cost === 'number' &&
      typeof product.weight === 'number' &&
      product.dimensions &&
      typeof product.fixedInvestment === 'number' &&
      typeof product.estimatedMonthlySales === 'number' &&
      Array.isArray(product.features) &&
      product.createdAt &&
      product.updatedAt
    );
  }
}

// 导出数据库实例供其他模块使用
export { db };

// 移除模块加载时的自动初始化
// 数据库将按需初始化，避免在React组件渲染时产生副作用