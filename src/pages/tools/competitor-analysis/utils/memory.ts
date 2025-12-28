/**
 * 内存优化工具
 * 提供状态管理内存优化和数据清理功能
 */

import React from 'react';
import type { AnalysisSession, BaseProduct, CompetitorData, AnalysisResult } from '../types';

/**
 * 内存优化配置
 */
interface MemoryOptimizationConfig {
  /** 最大会话保留数量 */
  maxSessions: number;
  /** 会话过期时间 (ms) */
  sessionExpiryTime: number;
  /** 自动清理间隔 (ms) */
  cleanupInterval: number;
  /** 最大缓存大小 (MB) */
  maxCacheSize: number;
}

/**
 * 默认内存优化配置
 */
const DEFAULT_MEMORY_CONFIG: MemoryOptimizationConfig = {
  maxSessions: 10,
  sessionExpiryTime: 24 * 60 * 60 * 1000, // 24小时
  cleanupInterval: 5 * 60 * 1000, // 5分钟
  maxCacheSize: 50 // 50MB
};

/**
 * 内存使用统计
 */
interface MemoryStats {
  /** 会话数量 */
  sessionCount: number;
  /** 估计内存使用 (MB) */
  estimatedMemoryUsage: number;
  /** 最后清理时间 */
  lastCleanup: Date;
  /** 清理次数 */
  cleanupCount: number;
}

/**
 * 内存优化管理器
 */
export class MemoryOptimizer {
  private config: MemoryOptimizationConfig;
  private stats: MemoryStats;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<MemoryOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_MEMORY_CONFIG, ...config };
    this.stats = {
      sessionCount: 0,
      estimatedMemoryUsage: 0,
      lastCleanup: new Date(),
      cleanupCount: 0
    };

    this.startAutoCleanup();
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * 执行内存清理
   */
  private performCleanup(): void {
    this.stats.lastCleanup = new Date();
    this.stats.cleanupCount++;
    
    // 触发垃圾回收（如果可用）
    if (typeof window !== 'undefined' && 'gc' in window) {
      try {
        (window as any).gc();
      } catch (error) {
        // 垃圾回收不可用，忽略错误
      }
    }
  }

  /**
   * 估算对象内存使用
   */
  private estimateObjectSize(obj: any): number {
    const jsonString = JSON.stringify(obj);
    return new Blob([jsonString]).size / (1024 * 1024); // 转换为MB
  }

  /**
   * 优化会话列表
   */
  public optimizeSessions(sessions: AnalysisSession[]): AnalysisSession[] {
    const now = Date.now();
    
    // 过滤过期会话
    const validSessions = sessions.filter(session => {
      const age = now - session.updatedAt.getTime();
      return age < this.config.sessionExpiryTime;
    });

    // 按更新时间排序，保留最新的会话
    const sortedSessions = validSessions.sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );

    // 限制会话数量
    const optimizedSessions = sortedSessions.slice(0, this.config.maxSessions);

    // 更新统计信息
    this.stats.sessionCount = optimizedSessions.length;
    this.stats.estimatedMemoryUsage = optimizedSessions.reduce(
      (total, session) => total + this.estimateObjectSize(session),
      0
    );

    return optimizedSessions;
  }

  /**
   * 压缩产品数据
   */
  public compressProductData(product: BaseProduct): BaseProduct {
    // 移除不必要的精度
    return {
      ...product,
      cost: Math.round(product.cost * 100) / 100,
      weight: Math.round(product.weight * 10) / 10,
      dimensions: {
        length: Math.round(product.dimensions.length * 10) / 10,
        width: Math.round(product.dimensions.width * 10) / 10,
        height: Math.round(product.dimensions.height * 10) / 10
      },
      fixedInvestment: Math.round(product.fixedInvestment * 100) / 100
    };
  }

  /**
   * 压缩竞品数据
   */
  public compressCompetitorData(data: CompetitorData): CompetitorData {
    return {
      ...data,
      price: Math.round(data.price * 100) / 100,
      weight: data.weight ? Math.round(data.weight * 10) / 10 : data.weight,
      dimensions: data.dimensions ? {
        length: Math.round(data.dimensions.length * 10) / 10,
        width: Math.round(data.dimensions.width * 10) / 10,
        height: Math.round(data.dimensions.height * 10) / 10
      } : data.dimensions,
      extractionConfidence: {
        price: Math.round(data.extractionConfidence.price * 100) / 100,
        weight: Math.round(data.extractionConfidence.weight * 100) / 100,
        dimensions: Math.round(data.extractionConfidence.dimensions * 100) / 100,
        features: Math.round(data.extractionConfidence.features * 100) / 100
      }
    };
  }

  /**
   * 压缩分析结果
   */
  public compressAnalysisResult(result: AnalysisResult): AnalysisResult {
    return {
      ...result,
      profitAnalysis: {
        margin: Math.round(result.profitAnalysis.margin * 100) / 100,
        marginRate: Math.round(result.profitAnalysis.marginRate * 10000) / 10000,
        roiMonths: Math.round(result.profitAnalysis.roiMonths * 100) / 100
      },
      radarScores: {
        profitability: Math.round(result.radarScores.profitability * 10) / 10,
        roiSpeed: Math.round(result.radarScores.roiSpeed * 10) / 10,
        portability: Math.round(result.radarScores.portability * 10) / 10,
        features: Math.round(result.radarScores.features * 10) / 10,
        priceAdvantage: Math.round(result.radarScores.priceAdvantage * 10) / 10
      }
    };
  }

  /**
   * 创建轻量级会话快照
   */
  public createSessionSnapshot(session: AnalysisSession): Partial<AnalysisSession> {
    return {
      id: session.id,
      name: session.name,
      description: session.description,
      roleView: session.roleView,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      // 只保留关键的分析结果数据
      analysisResult: {
        profitAnalysis: session.analysisResult.profitAnalysis,
        radarScores: session.analysisResult.radarScores,
        timestamp: session.analysisResult.timestamp,
        sessionId: session.analysisResult.sessionId,
        insights: {
          advantages: session.analysisResult.insights.advantages.slice(0, 3), // 只保留前3个
          risks: session.analysisResult.insights.risks.slice(0, 3),
          recommendations: session.analysisResult.insights.recommendations.slice(0, 3)
        }
      }
    };
  }

  /**
   * 检查内存使用是否超限
   */
  public checkMemoryLimit(): boolean {
    return this.stats.estimatedMemoryUsage > this.config.maxCacheSize;
  }

  /**
   * 获取内存优化建议
   */
  public getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];

    if (this.stats.sessionCount > this.config.maxSessions * 0.8) {
      suggestions.push('会话数量较多，建议清理旧会话');
    }

    if (this.stats.estimatedMemoryUsage > this.config.maxCacheSize * 0.8) {
      suggestions.push('内存使用较高，建议清理缓存');
    }

    if (this.stats.cleanupCount === 0) {
      suggestions.push('建议启用自动清理功能');
    }

    return suggestions;
  }

  /**
   * 获取内存统计信息
   */
  public getStats(): MemoryStats {
    return { ...this.stats };
  }

  /**
   * 重置统计信息
   */
  public resetStats(): void {
    this.stats = {
      sessionCount: 0,
      estimatedMemoryUsage: 0,
      lastCleanup: new Date(),
      cleanupCount: 0
    };
  }

  /**
   * 销毁优化器
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

/**
 * 全局内存优化器实例
 */
export const memoryOptimizer = new MemoryOptimizer();

/**
 * React Hook for memory optimization
 */
export const useMemoryOptimization = () => {
  const [stats, setStats] = React.useState<MemoryStats>(memoryOptimizer.getStats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(memoryOptimizer.getStats());
    }, 10000); // 每10秒更新一次

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    optimizeSessions: memoryOptimizer.optimizeSessions.bind(memoryOptimizer),
    compressProductData: memoryOptimizer.compressProductData.bind(memoryOptimizer),
    compressCompetitorData: memoryOptimizer.compressCompetitorData.bind(memoryOptimizer),
    compressAnalysisResult: memoryOptimizer.compressAnalysisResult.bind(memoryOptimizer),
    checkMemoryLimit: memoryOptimizer.checkMemoryLimit.bind(memoryOptimizer),
    getOptimizationSuggestions: memoryOptimizer.getOptimizationSuggestions.bind(memoryOptimizer)
  };
};

/**
 * 深度清理对象，移除循环引用
 */
export const deepCleanObject = (obj: any, seen = new WeakSet()): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (seen.has(obj)) {
    return {}; // 移除循环引用
  }

  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => deepCleanObject(item, seen));
  }

  const cleaned: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cleaned[key] = deepCleanObject(obj[key], seen);
    }
  }

  return cleaned;
};

/**
 * 批量处理数据以避免阻塞UI
 */
export const batchProcess = async <T, R>(
  items: T[],
  processor: (item: T) => R,
  batchSize: number = 10
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = batch.map(processor);
    results.push(...batchResults);
    
    // 让出控制权给浏览器
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  return results;
};

export default memoryOptimizer;