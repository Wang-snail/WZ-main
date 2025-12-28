/**
 * 智能报告生成服务
 * 基于雷达图数据生成智能分析报告和策略建议
 */

import type {
  BaseProduct,
  CompetitorData,
  AnalysisResult,
  RadarScores,
  ProfitAnalysis,
  AnalysisInsights,
  RoleViewType
} from '../types';

/**
 * 报告生成配置
 */
export interface ReportConfig {
  /** 报告语言 */
  language: 'zh' | 'en';
  /** 报告详细程度 */
  detailLevel: 'brief' | 'standard' | 'detailed';
  /** 是否包含图表 */
  includeCharts: boolean;
  /** 是否包含原始数据 */
  includeRawData: boolean;
}

/**
 * 定价策略结果
 */
export interface PricingStrategy {
  /** 推荐价格 */
  recommendedPrice: number;
  /** 价格区间 */
  priceRange: { min: number; max: number };
  /** 策略类型 */
  strategy: 'penetration' | 'competitive' | 'value' | 'premium';
  /** 策略描述 */
  description: string;
  /** 定价逻辑 */
  reasoning: string[];
}

/**
 * 市场机会评估结果
 */
export interface MarketOpportunity {
  /** 机会等级 */
  level: 'high' | 'medium' | 'low';
  /** 综合评分 */
  score: number;
  /** 机会描述 */
  description: string;
  /** 关键成功因素 */
  successFactors: string[];
  /** 市场建议 */
  recommendations: string[];
}

/**
 * 竞争力分析结果
 */
export interface CompetitiveAnalysis {
  /** 优势领域 */
  strengths: Array<{
    dimension: string;
    score: number;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  /** 劣势领域 */
  weaknesses: Array<{
    dimension: string;
    score: number;
    description: string;
    improvement: string;
  }>;
  /** 综合竞争力 */
  overallCompetitiveness: {
    score: number;
    level: 'excellent' | 'good' | 'average' | 'poor';
    summary: string;
  };
}

/**
 * 智能报告生成服务
 */
export class ReportGenerationService {
  /**
   * 生成智能分析洞察
   */
  static generateIntelligentInsights(
    radarScores: RadarScores,
    profitAnalysis: ProfitAnalysis,
    baseProduct: BaseProduct,
    competitorData: CompetitorData
  ): AnalysisInsights {
    const advantages: string[] = [];
    const risks: string[] = [];
    const recommendations: string[] = [];

    // 分析利润空间优势
    if (radarScores.profitability >= 8) {
      advantages.push(`利润空间优势显著，毛利率达到${(profitAnalysis.marginRate * 100).toFixed(1)}%，远超行业平均水平`);
    } else if (radarScores.profitability >= 6) {
      advantages.push(`具备良好的利润空间，毛利率为${(profitAnalysis.marginRate * 100).toFixed(1)}%，有一定竞争优势`);
    } else {
      risks.push(`利润空间偏低，毛利率仅为${(profitAnalysis.marginRate * 100).toFixed(1)}%，需要优化成本结构或提升定价`);
    }

    // 分析ROI速度
    if (radarScores.roiSpeed >= 8) {
      advantages.push(`投资回报速度极快，预计${profitAnalysis.roiMonths.toFixed(1)}个月即可回本，投资风险较低`);
    } else if (radarScores.roiSpeed >= 6) {
      advantages.push(`投资回报周期合理，约${profitAnalysis.roiMonths.toFixed(1)}个月回本，符合行业预期`);
    } else {
      risks.push(`投资回报周期较长，需要${profitAnalysis.roiMonths.toFixed(1)}个月才能回本，存在一定投资风险`);
    }

    // 分析便携性优势
    if (radarScores.portability >= 8) {
      advantages.push(`产品便携性表现优秀，在重量和尺寸方面具有明显优势，适合移动使用场景`);
    } else if (radarScores.portability >= 6) {
      advantages.push(`产品便携性良好，在同类产品中具有一定优势`);
    } else {
      risks.push(`产品便携性有待提升，相比竞品在重量或尺寸方面存在劣势`);
    }

    // 分析功能丰富度
    if (radarScores.features >= 8) {
      advantages.push(`功能特性丰富，共有${baseProduct.features.length}项核心功能，能够满足用户多样化需求`);
    } else if (radarScores.features >= 6) {
      advantages.push(`功能配置合理，具备${baseProduct.features.length}项主要功能，基本满足用户需求`);
    } else {
      risks.push(`功能相对简单，仅有${baseProduct.features.length}项功能，可能无法满足用户的全面需求`);
    }

    // 分析价格竞争力
    if (radarScores.priceAdvantage >= 8) {
      advantages.push(`市场定价空间充足，竞品售价${competitorData.price}元为我方提供了良好的定价参考`);
    } else if (radarScores.priceAdvantage >= 6) {
      advantages.push(`价格竞争力适中，有一定的市场定价空间`);
    } else {
      risks.push(`价格竞争激烈，竞品售价${competitorData.price}元，我方需要在成本控制上下功夫`);
    }

    // 生成策略建议
    if (profitAnalysis.marginRate < 0.3) {
      recommendations.push('优先考虑成本优化，通过供应链整合、工艺改进等方式降低生产成本');
    }
    
    if (profitAnalysis.roiMonths > 12) {
      recommendations.push('考虑分阶段投入策略，降低初期投资风险，根据市场反馈逐步扩大投入');
    }

    if (radarScores.features < 6) {
      recommendations.push('增强产品功能特性，通过差异化功能提升产品竞争力和用户价值');
    }

    if (radarScores.portability < 6) {
      recommendations.push('优化产品设计，在保证功能的前提下减轻重量、缩小体积，提升便携性');
    }

    // 综合评分建议
    const avgScore = (radarScores.profitability + radarScores.roiSpeed + radarScores.portability + radarScores.features + radarScores.priceAdvantage) / 5;
    
    if (avgScore >= 8) {
      recommendations.push('产品综合竞争力强，建议加快市场推广，抢占市场先机');
    } else if (avgScore >= 6) {
      recommendations.push('产品具备基本竞争力，建议重点强化优势维度，补齐短板');
    } else {
      recommendations.push('产品竞争力有待提升，建议重新评估产品定位和市场策略');
    }

    return { advantages, risks, recommendations };
  }

  /**
   * 生成定价策略建议
   */
  static generatePricingStrategy(
    baseProduct: BaseProduct,
    competitorData: CompetitorData,
    profitAnalysis: ProfitAnalysis
  ): PricingStrategy {
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

    // 确定定价策略类型
    let strategy: PricingStrategy['strategy'];
    let description: string;
    let reasoning: string[] = [];

    if (recommendedPrice < competitorPrice * 0.7) {
      strategy = 'penetration';
      description = '低价渗透策略';
      reasoning = [
        '通过低价快速获得市场份额',
        '适合成本优势明显的情况',
        '需要关注利润率的可持续性',
        '建议配合大规模营销推广'
      ];
    } else if (recommendedPrice < competitorPrice * 0.9) {
      strategy = 'competitive';
      description = '竞争定价策略';
      reasoning = [
        '在保持竞争力的同时获得合理利润',
        '平衡市场份额和盈利能力',
        '适合功能相近的产品',
        '需要持续关注竞品价格变化'
      ];
    } else if (recommendedPrice <= competitorPrice) {
      strategy = 'value';
      description = '价值定价策略';
      reasoning = [
        '基于产品独特价值定价',
        '适合有明显差异化优势的产品',
        '需要强化产品价值传播',
        '可获得较高的利润率'
      ];
    } else {
      strategy = 'premium';
      description = '高端定价策略';
      reasoning = [
        '定位高端市场，追求品牌溢价',
        '适合技术领先或品牌优势明显的产品',
        '需要配合高端营销策略',
        '市场容量可能相对较小'
      ];
    }

    return {
      recommendedPrice: Math.round(recommendedPrice * 100) / 100,
      priceRange: {
        min: Math.round(minPrice * 100) / 100,
        max: Math.round(maxPrice * 100) / 100
      },
      strategy,
      description,
      reasoning
    };
  }

  /**
   * 评估市场机会
   */
  static assessMarketOpportunity(
    radarScores: RadarScores,
    profitAnalysis: ProfitAnalysis
  ): MarketOpportunity {
    const avgScore = (radarScores.profitability + radarScores.roiSpeed + radarScores.portability + radarScores.features + radarScores.priceAdvantage) / 5;

    let level: MarketOpportunity['level'];
    let description: string;
    let recommendations: string[] = [];

    if (avgScore >= 8) {
      level = 'high';
      description = '高机会市场 - 产品具备强劲竞争力，市场前景广阔';
      recommendations = [
        '快速进入市场，抢占先发优势',
        '加大营销投入，建立品牌认知度',
        '考虑多渠道布局，扩大市场覆盖',
        '建立用户社区，培养品牌忠诚度'
      ];
    } else if (avgScore >= 6) {
      level = 'medium';
      description = '中等机会市场 - 产品具备基本竞争力，需要精准定位';
      recommendations = [
        '稳步推进，重点强化优势维度',
        '细分市场定位，避免正面竞争',
        '持续产品优化，提升用户体验',
        '建立差异化竞争优势'
      ];
    } else {
      level = 'low';
      description = '挑战性市场 - 竞争激烈，需要重新评估策略';
      recommendations = [
        '重新评估产品定位和目标市场',
        '寻找蓝海市场或细分领域机会',
        '考虑产品重新设计或功能升级',
        '评估是否需要战略合作或技术引进'
      ];
    }

    // 生成关键成功因素
    const successFactors: string[] = [];
    
    if (radarScores.profitability >= 7) {
      successFactors.push('✅ 利润空间充足，支持市场投入');
    } else {
      successFactors.push('⚠️ 利润空间有限，需控制成本');
    }

    if (radarScores.roiSpeed >= 7) {
      successFactors.push('✅ 投资回报快速，风险可控');
    } else {
      successFactors.push('⚠️ 回本周期较长，需谨慎投入');
    }

    if (radarScores.portability >= 7) {
      successFactors.push('✅ 便携性优势明显，适合推广');
    } else {
      successFactors.push('⚠️ 便携性有待提升');
    }

    if (radarScores.features >= 7) {
      successFactors.push('✅ 功能丰富，用户价值高');
    } else {
      successFactors.push('⚠️ 功能相对简单，需增强价值');
    }

    if (radarScores.priceAdvantage >= 7) {
      successFactors.push('✅ 定价空间充足，策略灵活');
    } else {
      successFactors.push('⚠️ 价格竞争激烈，需精准定位');
    }

    return {
      level,
      score: Math.round(avgScore * 10) / 10,
      description,
      successFactors,
      recommendations
    };
  }

  /**
   * 生成竞争力分析
   */
  static analyzeCompetitiveness(
    radarScores: RadarScores,
    baseProduct: BaseProduct,
    competitorData: CompetitorData
  ): CompetitiveAnalysis {
    const dimensions = [
      { key: 'profitability', name: '利润空间', score: radarScores.profitability },
      { key: 'roiSpeed', name: 'ROI速度', score: radarScores.roiSpeed },
      { key: 'portability', name: '便携指数', score: radarScores.portability },
      { key: 'features', name: '功能丰富度', score: radarScores.features },
      { key: 'priceAdvantage', name: '价格竞争力', score: radarScores.priceAdvantage }
    ];

    // 识别优势领域
    const strengths = dimensions
      .filter(d => d.score >= 7)
      .map(d => ({
        dimension: d.name,
        score: d.score,
        description: this.getStrengthDescription(d.key, d.score),
        impact: d.score >= 9 ? 'high' as const : d.score >= 8 ? 'medium' as const : 'low' as const
      }));

    // 识别劣势领域
    const weaknesses = dimensions
      .filter(d => d.score < 6)
      .map(d => ({
        dimension: d.name,
        score: d.score,
        description: this.getWeaknessDescription(d.key, d.score),
        improvement: this.getImprovementSuggestion(d.key)
      }));

    // 计算综合竞争力
    const avgScore = dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length;
    
    let level: CompetitiveAnalysis['overallCompetitiveness']['level'];
    let summary: string;

    if (avgScore >= 8) {
      level = 'excellent';
      summary = '产品具备卓越的市场竞争力，在多个维度表现优秀，具有很强的市场潜力';
    } else if (avgScore >= 6.5) {
      level = 'good';
      summary = '产品具备良好的竞争力，有明显的优势领域，通过优化可以进一步提升';
    } else if (avgScore >= 5) {
      level = 'average';
      summary = '产品竞争力处于平均水平，需要在关键领域进行改进以获得竞争优势';
    } else {
      level = 'poor';
      summary = '产品竞争力较弱，需要重新评估产品策略或进行重大改进';
    }

    return {
      strengths,
      weaknesses,
      overallCompetitiveness: {
        score: Math.round(avgScore * 10) / 10,
        level,
        summary
      }
    };
  }

  /**
   * 生成角色特定的洞察
   */
  static generateRoleSpecificInsights(
    insights: AnalysisInsights,
    role: RoleViewType
  ): AnalysisInsights {
    if (role === 'manufacturing') {
      // 制造业PM视角：关注生产、成本、工艺
      return {
        advantages: insights.advantages.map(adv => {
          if (adv.includes('利润')) return adv.replace('利润', '成本控制');
          if (adv.includes('便携')) return adv + '，体现了优秀的结构设计能力';
          return adv;
        }),
        risks: insights.risks.map(risk => {
          if (risk.includes('价格')) return risk.replace('价格', '生产成本');
          if (risk.includes('功能')) return risk + '，可能需要改进生产工艺';
          return risk;
        }),
        recommendations: [
          ...insights.recommendations.filter(rec => !rec.includes('营销')),
          '考虑优化生产工艺以降低成本',
          '评估供应链稳定性和原材料成本波动',
          '制定产能扩张计划以应对市场需求'
        ]
      };
    } else {
      // 零售PM视角：关注市场、定价、营销
      return {
        advantages: insights.advantages.map(adv => {
          if (adv.includes('便携')) return adv + '，可作为核心卖点进行营销推广';
          if (adv.includes('利润')) return adv + '，为价格策略提供充足空间';
          return adv;
        }),
        risks: insights.risks.map(risk => {
          if (risk.includes('功能')) return risk + '，可能影响用户体验和复购率';
          return risk;
        }),
        recommendations: [
          ...insights.recommendations,
          '制定差异化营销策略突出产品优势',
          '考虑多价格档位覆盖不同用户群体',
          '建立用户反馈机制持续优化产品'
        ]
      };
    }
  }

  /**
   * 生成完整的智能报告
   */
  static generateCompleteReport(
    analysisResult: AnalysisResult,
    baseProduct: BaseProduct,
    competitorData: CompetitorData,
    roleView: RoleViewType,
    config: Partial<ReportConfig> = {}
  ): {
    overview: string;
    marketOpportunity: MarketOpportunity;
    pricingStrategy: PricingStrategy;
    competitiveAnalysis: CompetitiveAnalysis;
    insights: AnalysisInsights;
    executionPlan: string;
    fullReport: string;
  } {
    const { radarScores, profitAnalysis } = analysisResult;

    // 生成各个部分
    const baseInsights = this.generateIntelligentInsights(radarScores, profitAnalysis, baseProduct, competitorData);
    const insights = this.generateRoleSpecificInsights(baseInsights, roleView);
    const marketOpportunity = this.assessMarketOpportunity(radarScores, profitAnalysis);
    const pricingStrategy = this.generatePricingStrategy(baseProduct, competitorData, profitAnalysis);
    const competitiveAnalysis = this.analyzeCompetitiveness(radarScores, baseProduct, competitorData);

    // 生成概览
    const avgScore = (radarScores.profitability + radarScores.roiSpeed + radarScores.portability + radarScores.features + radarScores.priceAdvantage) / 5;
    const overview = `
## 竞品分析概览

**分析对象：** ${baseProduct.name} vs 竞品
**分析时间：** ${analysisResult.timestamp.toLocaleString()}
**分析视角：** ${roleView === 'retail' ? '零售产品经理' : '制造业产品经理'}

### 核心数据对比

| 指标 | 我方产品 | 竞品 | 对比结果 |
|------|----------|------|----------|
| 售价 | - | ${competitorData.price.toFixed(2)} | 参考定价 |
| 成本 | ${baseProduct.cost.toFixed(2)} | - | 成本优势 |
| 重量 | ${baseProduct.weight}g | ${competitorData.weight || '未知'}g | ${competitorData.weight ? (baseProduct.weight < competitorData.weight ? '我方更轻' : '竞品更轻') : '待确认'} |
| 毛利率 | ${(profitAnalysis.marginRate * 100).toFixed(1)}% | - | 利润空间 |
| 回本周期 | ${profitAnalysis.roiMonths.toFixed(1)}个月 | - | 投资回报 |

### 综合竞争力评分：${avgScore.toFixed(1)}/10

${avgScore >= 8 ? '🏆 **优秀** - 产品具有强劲的市场竞争力' : 
  avgScore >= 6 ? '✅ **良好** - 产品具有一定的竞争优势' : 
  avgScore >= 4 ? '⚠️ **一般** - 产品需要进一步优化' : 
  '❌ **需改进** - 产品存在明显劣势，需要重新评估'}
    `.trim();

    // 生成执行计划
    const executionPlan = `
## 执行建议

### 短期行动（1-3个月）
- 完善产品功能和用户体验
- 制定详细的市场推广计划
- 建立供应链和生产体系

### 中期规划（3-12个月）
- 根据市场反馈优化产品
- 扩大市场覆盖和用户基础
- 建立品牌认知度和用户口碑

### 长期战略（1年以上）
- 持续产品创新和技术升级
- 拓展产品线和市场领域
- 建立行业领先地位
    `.trim();

    // 生成完整报告
    const fullReport = `
${overview}

## 市场机会评估

**机会等级：** ${marketOpportunity.level === 'high' ? '🟢 高机会市场' : marketOpportunity.level === 'medium' ? '🟡 中等机会市场' : '🔴 挑战性市场'}
**综合评分：** ${marketOpportunity.score}/10

**市场建议：** ${marketOpportunity.description}

**关键成功因素：**
${marketOpportunity.successFactors.join('\n')}

## 定价策略建议

**推荐售价：** ${pricingStrategy.recommendedPrice} 元
**价格区间：** ${pricingStrategy.priceRange.min} - ${pricingStrategy.priceRange.max} 元
**策略类型：** ${pricingStrategy.description}

**定价逻辑：**
${pricingStrategy.reasoning.map(r => `- ${r}`).join('\n')}

## 竞争优势

${insights.advantages.map((adv, index) => `${index + 1}. ${adv}`).join('\n')}

## 风险提示

${insights.risks.map((risk, index) => `${index + 1}. ${risk}`).join('\n')}

## 策略建议

${insights.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

${executionPlan}

## 总结

基于以上分析，建议${roleView === 'retail' ? '从市场营销角度' : '从生产制造角度'}重点关注产品的核心优势，同时积极应对潜在风险，制定相应的产品策略和市场策略。

**关键决策点：**
- 产品定价策略的选择
- 市场进入时机的把握
- 资源投入优先级的确定
- 风险控制措施的实施

---
*报告生成时间：${new Date().toLocaleString()}*
*分析工具：智能竞品分析系统*
*分析视角：${roleView === 'retail' ? '零售产品经理' : '制造业产品经理'}*
    `.trim();

    return {
      overview,
      marketOpportunity,
      pricingStrategy,
      competitiveAnalysis,
      insights,
      executionPlan,
      fullReport
    };
  }

  // 私有辅助方法
  private static getStrengthDescription(dimension: string, score: number): string {
    const descriptions: Record<string, string> = {
      profitability: `利润空间表现${score >= 9 ? '卓越' : '优秀'}，为业务发展提供充足资金支持`,
      roiSpeed: `投资回报速度${score >= 9 ? '极快' : '很快'}，大大降低了投资风险`,
      portability: `便携性${score >= 9 ? '极佳' : '优秀'}，为用户提供出色的使用体验`,
      features: `功能特性${score >= 9 ? '非常丰富' : '丰富'}，能够满足用户多样化需求`,
      priceAdvantage: `价格竞争力${score >= 9 ? '极强' : '很强'}，在市场中具有明显优势`
    };
    return descriptions[dimension] || '表现优秀';
  }

  private static getWeaknessDescription(dimension: string, score: number): string {
    const descriptions: Record<string, string> = {
      profitability: `利润空间${score < 4 ? '严重不足' : '有限'}，可能影响业务可持续发展`,
      roiSpeed: `投资回报周期${score < 4 ? '过长' : '偏长'}，存在一定投资风险`,
      portability: `便携性${score < 4 ? '较差' : '一般'}，可能影响用户使用体验`,
      features: `功能特性${score < 4 ? '过于简单' : '相对简单'}，可能无法满足用户需求`,
      priceAdvantage: `价格竞争力${score < 4 ? '很弱' : '不足'}，在市场中处于劣势`
    };
    return descriptions[dimension] || '表现不佳';
  }

  private static getImprovementSuggestion(dimension: string): string {
    const suggestions: Record<string, string> = {
      profitability: '优化成本结构，提升产品附加值，或调整定价策略',
      roiSpeed: '降低固定投入，提高销量预期，或分阶段投入',
      portability: '优化产品设计，减轻重量，缩小体积',
      features: '增加核心功能，提升用户价值，或专注细分需求',
      priceAdvantage: '降低成本，提升性价比，或寻找差异化定位'
    };
    return suggestions[dimension] || '需要进一步分析和改进';
  }
}