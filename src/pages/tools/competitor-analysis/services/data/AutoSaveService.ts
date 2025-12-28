/**
 * 自动保存服务
 * 处理会话的自动保存逻辑
 */

import React from 'react';
import { useCompetitorAnalysisStore } from '../../store/competitorAnalysisStore';
import type { BaseProduct, CompetitorData, AnalysisResult } from '../../types';

/**
 * 自动保存配置
 */
interface AutoSaveConfig {
  /** 自动保存间隔 (毫秒) */
  interval: number;
  /** 是否启用自动保存 */
  enabled: boolean;
  /** 最大自动保存会话数量 */
  maxAutoSaveSessions: number;
}

/**
 * 默认自动保存配置
 */
const DEFAULT_CONFIG: AutoSaveConfig = {
  interval: 30000, // 30秒
  enabled: true,
  maxAutoSaveSessions: 5
};

/**
 * 自动保存服务类
 */
export class AutoSaveService {
  private static instance: AutoSaveService | null = null;
  private config: AutoSaveConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private lastSaveData: string | null = null;
  private isInitialized = false;

  private constructor(config: Partial<AutoSaveConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 获取单例实例
   */
  static getInstance(config?: Partial<AutoSaveConfig>): AutoSaveService {
    if (!AutoSaveService.instance) {
      AutoSaveService.instance = new AutoSaveService(config);
    }
    return AutoSaveService.instance;
  }

  /**
   * 初始化自动保存服务
   */
  initialize(): void {
    if (this.isInitialized) return;

    const store = useCompetitorAnalysisStore.getState();
    
    // 检查用户偏好设置
    if (!store.preferences.autoSaveSession) {
      this.config.enabled = false;
    }

    if (this.config.enabled) {
      this.startAutoSave();
    }

    this.isInitialized = true;
  }

  /**
   * 启动自动保存
   */
  startAutoSave(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.performAutoSave();
    }, this.config.interval);
  }

  /**
   * 停止自动保存
   */
  stopAutoSave(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<AutoSaveConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enabled && !this.intervalId) {
      this.startAutoSave();
    } else if (!this.config.enabled && this.intervalId) {
      this.stopAutoSave();
    }
  }

  /**
   * 执行自动保存
   */
  private async performAutoSave(): Promise<void> {
    try {
      const store = useCompetitorAnalysisStore.getState();
      
      // 检查是否有完整的分析数据
      if (!this.hasCompleteAnalysisData(store)) {
        return;
      }

      // 生成当前数据的哈希，避免重复保存相同数据
      const currentDataHash = this.generateDataHash(
        store.baseProduct!,
        store.competitorData!,
        store.analysisResult!
      );

      if (currentDataHash === this.lastSaveData) {
        return; // 数据未变化，跳过保存
      }

      // 清理旧的自动保存会话
      await this.cleanupAutoSaveSessions();

      // 生成自动保存会话名称
      const autoSaveName = this.generateAutoSaveName();

      // 执行自动保存
      await store.saveCurrentSession(autoSaveName, '自动保存的会话');
      
      this.lastSaveData = currentDataHash;
      
      console.log('Auto-save completed:', autoSaveName);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  /**
   * 检查是否有完整的分析数据
   */
  private hasCompleteAnalysisData(store: ReturnType<typeof useCompetitorAnalysisStore.getState>): boolean {
    return !!(
      store.baseProduct &&
      store.competitorData &&
      store.analysisResult &&
      store.currentStep === 'result'
    );
  }

  /**
   * 生成数据哈希用于比较
   */
  private generateDataHash(
    baseProduct: BaseProduct,
    competitorData: CompetitorData,
    analysisResult: AnalysisResult
  ): string {
    const dataString = JSON.stringify({
      baseProduct: {
        id: baseProduct.id,
        name: baseProduct.name,
        cost: baseProduct.cost,
        weight: baseProduct.weight,
        dimensions: baseProduct.dimensions,
        fixedInvestment: baseProduct.fixedInvestment,
        estimatedMonthlySales: baseProduct.estimatedMonthlySales,
        features: baseProduct.features
      },
      competitorData: {
        price: competitorData.price,
        weight: competitorData.weight,
        dimensions: competitorData.dimensions,
        features: competitorData.features
      },
      analysisResult: {
        profitAnalysis: analysisResult.profitAnalysis,
        radarScores: analysisResult.radarScores
      }
    });

    // 简单的哈希函数
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString();
  }

  /**
   * 生成自动保存会话名称
   */
  private generateAutoSaveName(): string {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return `自动保存 - ${timeString}`;
  }

  /**
   * 清理旧的自动保存会话
   */
  private async cleanupAutoSaveSessions(): Promise<void> {
    const store = useCompetitorAnalysisStore.getState();
    const autoSaveSessions = store.sessions
      .filter(session => session.name.startsWith('自动保存'))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // 如果自动保存会话数量超过限制，删除最旧的
    if (autoSaveSessions.length >= this.config.maxAutoSaveSessions) {
      const sessionsToDelete = autoSaveSessions.slice(this.config.maxAutoSaveSessions - 1);
      sessionsToDelete.forEach(session => {
        store.deleteSession(session.id);
      });
    }
  }

  /**
   * 手动触发保存
   */
  async triggerManualSave(): Promise<void> {
    await this.performAutoSave();
  }

  /**
   * 获取当前配置
   */
  getConfig(): AutoSaveConfig {
    return { ...this.config };
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.stopAutoSave();
    this.isInitialized = false;
    AutoSaveService.instance = null;
  }
}

/**
 * React Hook for auto-save service
 */
export const useAutoSave = (config?: Partial<AutoSaveConfig>) => {
  const autoSaveService = AutoSaveService.getInstance(config);
  
  React.useEffect(() => {
    autoSaveService.initialize();
    
    return () => {
      // 组件卸载时不销毁服务，因为它是全局单例
    };
  }, [autoSaveService]);

  return {
    startAutoSave: () => autoSaveService.startAutoSave(),
    stopAutoSave: () => autoSaveService.stopAutoSave(),
    triggerManualSave: () => autoSaveService.triggerManualSave(),
    updateConfig: (newConfig: Partial<AutoSaveConfig>) => autoSaveService.updateConfig(newConfig),
    getConfig: () => autoSaveService.getConfig()
  };
};

export default AutoSaveService;