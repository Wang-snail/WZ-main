/**
 * 计算引擎服务
 * 提供利润计算、ROI分析和雷达图评分等核心计算功能
 */

import type {
  BaseProduct,
  CompetitorData,
  ProfitAnalysis,
  RadarScores,
} from '../../types';
import { AppError } from '../../types';
import { ErrorType } from '../../types';

/**
 * 计算结果接口
 */
export interface CalculationResult<T> {
  /** 计算结果 */
  result: T;
  /** 计算过程的详细信息 */
  details: {
    formula: string;
    inputs: Record<string, number>;
    intermediateSteps?: Record<string, number>;
  };
  /** 计算时间戳 */
  timestamp: Date;
}

/**
 * 风险评估结果
 */
export interface RiskAssessment {
  /** 风险等级 */
  level: 'low' | 'medium' | 'high';
  /** 风险描述 */
  description: string;
  /** 建议措施 */
  recommendations: string[];
}

/**
 * 创建计算错误的辅助函数
 */
const createCalculationError = (message: string, details?: string): AppError => ({
  type: ErrorType.CALCULATION_ERROR,
  message,
  details,
  timestamp: new Date(),
  retryable: false
});

/**
 * 计算引擎服务类
 */
export class CalculationService {
  /**
   * 计算利润分析
   * 
   * @param competitorPrice 竞品价格
   * @param myCost 我方成本
   * @returns 利润分析结果
   */
  static calculateProfit(
    competitorPrice: number,
    myCost: number
  ): CalculationResult<ProfitAnalysis> {
    // 输入验证
    if (competitorPrice <= 0) {
      throw createCalculationError('竞品价格必须大于0', `输入价格: ${competitorPrice}`);
    }
    if (myCost < 0) {
      throw createCalculationError('成本不能为负数', `输入成本: ${myCost}`);
    }
    if (myCost >= competitorPrice) {
      throw createCalculationError(
        '成本不能大于或等于售价',
        `成本: ${myCost}, 售价: ${competitorPrice}`
      );
    }

    // 计算毛利金额和毛利率
    const margin = competitorPrice - myCost;
    const marginRate = margin / competitorPrice;

    const result: ProfitAnalysis = {
      margin,
      marginRate,
      roiMonths: 0 // ROI需要额外的投资和销量数据，这里先设为0
    };

    return {
      result,
      details: {
        formula: '毛利 = 售价 - 成本; 毛利率 = 毛利 / 售价',
        inputs: {
          competitorPrice,
          myCost
        },
        intermediateSteps: {
          margin,
          marginRate: marginRate * 100 // 转换为百分比显示
        }
      },
      timestamp: new Date()
    };
  }

  /**
   * 计算投资回报周期
   * 
   * @param fixedInvestment 固定投入
   * @param monthlyProfit 月利润
   * @returns ROI计算结果
   */
  static calculateROI(
    fixedInvestment: number,
    monthlyProfit: number
  ): CalculationResult<number> {
    // 输入验证
    if (fixedInvestment < 0) {
      throw createCalculationError('固定投入不能为负数', `输入投入: ${fixedInvestment}`);
    }
    if (monthlyProfit <= 0) {
      throw createCalculationError('月利润必须大于0', `输入月利润: ${monthlyProfit}`);
    }

    // 计算回本周期（月）
    const roiMonths = fixedInvestment / monthlyProfit;

    return {
      result: roiMonths,
      details: {
        formula: '回本周期(月) = 固定投入 / 月利润',
        inputs: {
          fixedInvestment,
          monthlyProfit
        }
      },
      timestamp: new Date()
    };
  }

  /**
   * 计算月利润
   * 
   * @param marginPerUnit 单位毛利
   * @param monthlySales 月销量
   * @returns 月利润计算结果
   */
  static calculateMonthlyProfit(
    marginPerUnit: number,
    monthlySales: number
  ): CalculationResult<number> {
    // 输入验证
    if (marginPerUnit < 0) {
      throw createCalculationError('单位毛利不能为负数', `输入毛利: ${marginPerUnit}`);
    }
    if (monthlySales <= 0) {
      throw createCalculationError('月销量必须大于0', `输入销量: ${monthlySales}`);
    }

    const monthlyProfit = marginPerUnit * monthlySales;

    return {
      result: monthlyProfit,
      details: {
        formula: '月利润 = 单位毛利 × 月销量',
        inputs: {
          marginPerUnit,
          monthlySales
        }
      },
      timestamp: new Date()
    };
  }

  /**
   * 计算完整的利润分析（包含ROI）
   * 
   * @param baseProduct 基础产品信息
   * @param competitorPrice 竞品价格
   * @returns 完整利润分析结果
   */
  static calculateCompleteProfitAnalysis(
    baseProduct: BaseProduct,
    competitorPrice: number
  ): CalculationResult<ProfitAnalysis> {
    try {
      // 计算基础利润
      const profitResult = this.calculateProfit(competitorPrice, baseProduct.cost);
      
      // 计算月利润
      const monthlyProfitResult = this.calculateMonthlyProfit(
        profitResult.result.margin,
        baseProduct.estimatedMonthlySales
      );
      
      // 计算ROI
      const roiResult = this.calculateROI(
        baseProduct.fixedInvestment,
        monthlyProfitResult.result
      );

      const result: ProfitAnalysis = {
        margin: profitResult.result.margin,
        marginRate: profitResult.result.marginRate,
        roiMonths: roiResult.result
      };

      return {
        result,
        details: {
          formula: '综合利润分析 = 利润计算 + ROI计算',
          inputs: {
            competitorPrice,
            myCost: baseProduct.cost,
            fixedInvestment: baseProduct.fixedInvestment,
            monthlySales: baseProduct.estimatedMonthlySales
          },
          intermediateSteps: {
            margin: profitResult.result.margin,
            marginRate: profitResult.result.marginRate * 100,
            monthlyProfit: monthlyProfitResult.result,
            roiMonths: roiResult.result
          }
        },
        timestamp: new Date()
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('CALCULATION_ERROR')) {
        throw error;
      }
      throw createCalculationError(
        '完整利润分析计算失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 计算雷达图评分
   * 
   * @param baseProduct 基础产品信息
   * @param competitorData 竞品数据
   * @param profitAnalysis 利润分析结果
   * @returns 雷达图评分结果
   */
  static calculateRadarScores(
    baseProduct: BaseProduct,
    competitorData: CompetitorData,
    profitAnalysis: ProfitAnalysis
  ): CalculationResult<RadarScores> {
    try {
      // 1. 利润空间评分 (0-10)
      // 毛利率越高分数越高，50%以上得满分
      const profitability = Math.min((profitAnalysis.marginRate / 0.5) * 10, 10);

      // 2. ROI速度评分 (0-10)
      // 回本周期越短分数越高，3个月以内得满分
      const roiSpeed = Math.min((12 / profitAnalysis.roiMonths), 10);

      // 3. 便携指数评分 (0-10)
      // 基于重量和体积的综合评分
      let portability = 5; // 默认分数
      
      if (competitorData.weight && competitorData.dimensions) {
        // 重量对比（我方越轻分数越高）
        const weightRatio = competitorData.weight / baseProduct.weight;
        const weightScore = Math.min(weightRatio * 5, 10);
        
        // 体积对比（我方越小分数越高）
        const myVolume = baseProduct.dimensions.length * baseProduct.dimensions.width * baseProduct.dimensions.height;
        const competitorVolume = competitorData.dimensions.length * competitorData.dimensions.width * competitorData.dimensions.height;
        const volumeRatio = competitorVolume / myVolume;
        const volumeScore = Math.min(volumeRatio * 5, 10);
        
        // 综合便携性评分
        portability = (weightScore + volumeScore) / 2;
      } else if (competitorData.weight) {
        // 只有重量数据
        const weightRatio = competitorData.weight / baseProduct.weight;
        portability = Math.min(weightRatio * 5, 10);
      }

      // 4. 功能丰富度评分 (0-10)
      // 基于功能特性数量的对比
      const myFeatureCount = baseProduct.features.length;
      const competitorFeatureCount = competitorData.features.length;
      const featureRatio = myFeatureCount / Math.max(competitorFeatureCount, 1);
      const features = Math.min(featureRatio * 10, 10);

      // 5. 价格竞争力评分 (0-10)
      // 竞品价格越高，代表市场接受度高，我方定价空间大
      const priceAdvantage = Math.min((competitorData.price / 50) * 10, 10); // 假设50为基准价格

      const result: RadarScores = {
        profitability: Math.round(profitability * 10) / 10, // 保留一位小数
        roiSpeed: Math.round(roiSpeed * 10) / 10,
        portability: Math.round(portability * 10) / 10,
        features: Math.round(features * 10) / 10,
        priceAdvantage: Math.round(priceAdvantage * 10) / 10
      };

      return {
        result,
        details: {
          formula: '雷达图评分 = 五个维度的标准化评分',
          inputs: {
            marginRate: profitAnalysis.marginRate,
            roiMonths: profitAnalysis.roiMonths,
            myWeight: baseProduct.weight,
            competitorWeight: competitorData.weight || 0,
            myFeatureCount,
            competitorFeatureCount,
            competitorPrice: competitorData.price
          },
          intermediateSteps: {
            profitability,
            roiSpeed,
            portability,
            features,
            priceAdvantage
          }
        },
        timestamp: new Date()
      };
    } catch (error) {
      throw createCalculationError(
        '雷达图评分计算失败',
        error instanceof Error ? error.message : '未知错误'
      );
    }
  }

  /**
   * 评估利润风险
   * 
   * @param profitAnalysis 利润分析结果
   * @returns 风险评估结果
   */
  static assessProfitRisk(profitAnalysis: ProfitAnalysis): RiskAssessment {
    const { marginRate, roiMonths } = profitAnalysis;

    // 风险评估逻辑
    if (marginRate < 0.2 || roiMonths > 24) {
      return {
        level: 'high',
        description: '高风险：利润率过低或回本周期过长',
        recommendations: [
          '考虑降低成本或提高售价',
          '重新评估市场定位',
          '寻找差异化竞争优势'
        ]
      };
    } else if (marginRate < 0.4 || roiMonths > 12) {
      return {
        level: 'medium',
        description: '中等风险：利润率或回本周期需要优化',
        recommendations: [
          '优化成本结构',
          '提升产品附加值',
          '考虑分阶段投入'
        ]
      };
    } else {
      return {
        level: 'low',
        description: '低风险：利润率和回本周期表现良好',
        recommendations: [
          '保持当前策略',
          '考虑扩大投入规模',
          '关注市场变化'
        ]
      };
    }
  }

  /**
   * 生成定价建议
   * 
   * @param baseProduct 基础产品信息
   * @param competitorData 竞品数据
   * @returns 定价建议
   */
  static generatePricingRecommendations(
    baseProduct: BaseProduct,
    competitorData: CompetitorData
  ): {
    recommendedPrice: number;
    priceRange: { min: number; max: number };
    strategy: string;
    reasoning: string[];
  } {
    const competitorPrice = competitorData.price;
    const myCost = baseProduct.cost;
    
    // 基于成本的最低价格（保证30%毛利率）
    const minPrice = myCost / 0.7;
    
    // 基于竞品的最高价格（略低于竞品以保持竞争力）
    const maxPrice = competitorPrice * 0.95;
    
    // 推荐价格（在合理范围内取中值）
    const recommendedPrice = Math.min(
      Math.max(minPrice, competitorPrice * 0.8), // 不低于最低价格，不超过竞品80%
      maxPrice
    );

    // 定价策略
    let strategy: string;
    let reasoning: string[] = [];

    if (recommendedPrice < competitorPrice * 0.7) {
      strategy = '低价渗透策略';
      reasoning = [
        '通过低价快速获得市场份额',
        '适合成本优势明显的情况',
        '需要关注利润率的可持续性'
      ];
    } else if (recommendedPrice < competitorPrice * 0.9) {
      strategy = '竞争定价策略';
      reasoning = [
        '在保持竞争力的同时获得合理利润',
        '平衡市场份额和盈利能力',
        '适合功能相近的产品'
      ];
    } else {
      strategy = '价值定价策略';
      reasoning = [
        '基于产品独特价值定价',
        '适合有明显差异化优势的产品',
        '需要强化产品价值传播'
      ];
    }

    return {
      recommendedPrice: Math.round(recommendedPrice * 100) / 100,
      priceRange: {
        min: Math.round(minPrice * 100) / 100,
        max: Math.round(maxPrice * 100) / 100
      },
      strategy,
      reasoning
    };
  }

  /**
   * 计算盈亏平衡点
   * 
   * @param baseProduct 基础产品信息
   * @param sellingPrice 销售价格
   * @returns 盈亏平衡点分析
   */
  static calculateBreakEvenPoint(
    baseProduct: BaseProduct,
    sellingPrice: number
  ): {
    breakEvenUnits: number;
    breakEvenMonths: number;
    monthlyBreakEvenUnits: number;
  } {
    const unitMargin = sellingPrice - baseProduct.cost;
    
    if (unitMargin <= 0) {
      throw createCalculationError('销售价格必须高于成本才能计算盈亏平衡点');
    }

    // 盈亏平衡销量
    const breakEvenUnits = Math.ceil(baseProduct.fixedInvestment / unitMargin);
    
    // 基于当前销量预估的盈亏平衡时间
    const breakEvenMonths = breakEvenUnits / baseProduct.estimatedMonthlySales;
    
    // 每月需要的盈亏平衡销量
    const monthlyBreakEvenUnits = Math.ceil(breakEvenUnits / 12); // 假设一年内回本

    return {
      breakEvenUnits,
      breakEvenMonths: Math.round(breakEvenMonths * 10) / 10,
      monthlyBreakEvenUnits
    };
  }

  /**
   * 敏感性分析
   * 计算关键参数变化对利润的影响
   * 
   * @param baseProduct 基础产品信息
   * @param competitorPrice 竞品价格
   * @returns 敏感性分析结果
   */
  static performSensitivityAnalysis(
    baseProduct: BaseProduct,
    competitorPrice: number
  ): {
    costSensitivity: { change: number; profitImpact: number }[];
    priceSensitivity: { change: number; profitImpact: number }[];
    salesSensitivity: { change: number; roiImpact: number }[];
  } {
    const baseProfit = this.calculateCompleteProfitAnalysis(baseProduct, competitorPrice);
    const baseMargin = baseProfit.result.margin;
    const baseROI = baseProfit.result.roiMonths;

    // 成本敏感性分析（成本变化±20%）
    const costSensitivity = [-0.2, -0.1, 0, 0.1, 0.2].map(change => {
      const newCost = baseProduct.cost * (1 + change);
      const newMargin = competitorPrice - newCost;
      const profitImpact = ((newMargin - baseMargin) / baseMargin) * 100;
      
      return {
        change: change * 100,
        profitImpact: Math.round(profitImpact * 10) / 10
      };
    });

    // 价格敏感性分析（价格变化±20%）
    const priceSensitivity = [-0.2, -0.1, 0, 0.1, 0.2].map(change => {
      const newPrice = competitorPrice * (1 + change);
      const newMargin = newPrice - baseProduct.cost;
      const profitImpact = ((newMargin - baseMargin) / baseMargin) * 100;
      
      return {
        change: change * 100,
        profitImpact: Math.round(profitImpact * 10) / 10
      };
    });

    // 销量敏感性分析（销量变化±50%）
    const salesSensitivity = [-0.5, -0.25, 0, 0.25, 0.5].map(change => {
      const newSales = baseProduct.estimatedMonthlySales * (1 + change);
      const monthlyProfit = baseMargin * newSales;
      const newROI = baseProduct.fixedInvestment / monthlyProfit;
      const roiImpact = ((baseROI - newROI) / baseROI) * 100; // ROI改善为正值
      
      return {
        change: change * 100,
        roiImpact: Math.round(roiImpact * 10) / 10
      };
    });

    return {
      costSensitivity,
      priceSensitivity,
      salesSensitivity
    };
  }
}

/**
 * 计算工具类
 * 提供一些通用的计算辅助方法
 */
export class CalculationUtils {
  /**
   * 格式化货币显示
   */
  static formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * 格式化百分比显示
   */
  static formatPercentage(value: number, decimals = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  /**
   * 格式化时间周期显示
   */
  static formatTimePeriod(months: number): string {
    if (months < 1) {
      const days = Math.round(months * 30);
      return `${days}天`;
    } else if (months < 12) {
      return `${months.toFixed(1)}个月`;
    } else {
      const years = (months / 12).toFixed(1);
      return `${years}年`;
    }
  }

  /**
   * 计算两个数值的变化百分比
   */
  static calculateChangePercentage(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  /**
   * 安全除法（避免除零错误）
   */
  static safeDivide(numerator: number, denominator: number, defaultValue = 0): number {
    return denominator === 0 ? defaultValue : numerator / denominator;
  }

  /**
   * 数值范围限制
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * 四舍五入到指定小数位
   */
  static roundTo(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}