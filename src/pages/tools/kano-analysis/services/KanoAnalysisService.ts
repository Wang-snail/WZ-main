import { OpinionFragment, KanoFeature } from '../store/kanoToolStore';

// Kano问卷映射：情感类型 -> (功能性问题答案, 非功能性问题答案)
export const SENTIMENT_TO_KANO_MAPPING = {
  'strong_praise': { functional: '非常喜欢', dysfunctional: '无所谓' },      // 惊喜 -> A类
  'weak_praise': { functional: '理应如此', dysfunctional: '无所谓' },        // 满意 -> A/I类
  'suggestion': { functional: '非常喜欢', dysfunctional: '很不喜欢' },       // 期望 -> O类
  'neutral': { functional: '无所谓', dysfunctional: '无所谓' },              // 中性 -> I类
  'weak_complaint': { functional: '理应如此', dysfunctional: '勉强接受' },   // 轻微不满 -> I类
  'strong_complaint': { functional: '理应如此', dysfunctional: '很不喜欢' }, // 强烈不满 -> M类
};

// 标准Kano矩阵 (5x5)
export const KANO_MATRIX = {
  '非常喜欢': {
    '非常喜欢': 'Q',    // 可疑结果
    '理应如此': 'A',    // 魅力特性
    '无所谓': 'A',      // 魅力特性
    '勉强接受': 'A',    // 魅力特性
    '很不喜欢': 'O'     // 期望特性
  },
  '理应如此': {
    '非常喜欢': 'R',    // 反向特性
    '理应如此': 'I',    // 无差异特性
    '无所谓': 'I',      // 无差异特性
    '勉强接受': 'I',    // 无差异特性
    '很不喜欢': 'M'     // 必备特性
  },
  '无所谓': {
    '非常喜欢': 'R',    // 反向特性
    '理应如此': 'I',    // 无差异特性
    '无所谓': 'I',      // 无差异特性
    '勉强接受': 'I',    // 无差异特性
    '很不喜欢': 'M'     // 必备特性
  },
  '勉强接受': {
    '非常喜欢': 'R',    // 反向特性
    '理应如此': 'I',    // 无差异特性
    '无所谓': 'I',      // 无差异特性
    '勉强接受': 'I',    // 无差异特性
    '很不喜欢': 'M'     // 必备特性
  },
  '很不喜欢': {
    '非常喜欢': 'R',    // 反向特性
    '理应如此': 'R',    // 反向特性
    '无所谓': 'R',      // 反向特性
    '勉强接受': 'R',    // 反向特性
    '很不喜欢': 'Q'     // 可疑结果
  }
};

// Kano类别说明
export const KANO_CATEGORIES = {
  'M': { name: '必备特性', description: '基本型需求，必须具备的功能', color: 'bg-red-100 text-red-800' },
  'O': { name: '期望特性', description: '意愿型需求，越好越满意', color: 'bg-blue-100 text-blue-800' },
  'A': { name: '魅力特性', description: '兴奋型需求，超出期望的惊喜', color: 'bg-green-100 text-green-800' },
  'I': { name: '无差异特性', description: '对用户满意度影响不大', color: 'bg-gray-100 text-gray-800' },
  'R': { name: '反向特性', description: '用户不希望有的功能', color: 'bg-purple-100 text-purple-800' },
  'Q': { name: '可疑结果', description: '问题表述不清或理解有误', color: 'bg-yellow-100 text-yellow-800' }
};

export interface KanoVoteDetail {
  A: number; // 魅力特性票数
  O: number; // 期望特性票数
  M: number; // 必备特性票数
  I: number; // 无差异特性票数
  R: number; // 反向特性票数
  Q: number; // 可疑结果票数
}

export interface KanoAnalysisResult {
  feature: string;
  totalVotes: number;
  voteDetail: KanoVoteDetail;
  finalCategory: string;
  categoryPercentage: number;
  betterCoefficient: number;  // Better系数 = (A+O)/(A+O+M+I)
  worseCoefficient: number;   // Worse系数 = -1*(O+M)/(A+O+M+I)
  fragments: OpinionFragment[];
  evidenceTexts: string[];
}

export class KanoAnalysisService {
  /**
   * 分析观点片段，生成Kano分析结果
   */
  static analyzeFragments(fragments: OpinionFragment[]): KanoAnalysisResult[] {
    // 按功能分组
    const featureGroups = this.groupFragmentsByFeature(fragments);
    const results: KanoAnalysisResult[] = [];

    for (const [featureName, featureFragments] of Object.entries(featureGroups)) {
      const result = this.analyzeFeature(featureName, featureFragments);
      results.push(result);
    }

    // 按总票数排序
    return results.sort((a, b) => b.totalVotes - a.totalVotes);
  }

  /**
   * 分析单个功能的Kano属性
   */
  private static analyzeFeature(featureName: string, fragments: OpinionFragment[]): KanoAnalysisResult {
    const voteDetail: KanoVoteDetail = { A: 0, O: 0, M: 0, I: 0, R: 0, Q: 0 };
    const evidenceTexts: string[] = [];

    // 对每个观点片段进行Kano分类投票
    fragments.forEach(fragment => {
      const kanoCategory = this.classifyFragment(fragment);
      voteDetail[kanoCategory as keyof KanoVoteDetail]++;

      // 收集证据文本（最多5条）
      if (evidenceTexts.length < 5) {
        evidenceTexts.push(fragment.rawText);
      }
    });

    const totalVotes = fragments.length;
    
    // 确定最终分类（票数最多的类别）
    const finalCategory = this.getFinalCategory(voteDetail);
    const categoryPercentage = totalVotes > 0 ? (voteDetail[finalCategory as keyof KanoVoteDetail] / totalVotes) * 100 : 0;

    // 计算Better和Worse系数
    const { betterCoefficient, worseCoefficient } = this.calculateCoefficients(voteDetail, totalVotes);

    return {
      feature: featureName,
      totalVotes,
      voteDetail,
      finalCategory,
      categoryPercentage,
      betterCoefficient,
      worseCoefficient,
      fragments,
      evidenceTexts
    };
  }

  /**
   * 对单个观点片段进行Kano分类
   */
  private static classifyFragment(fragment: OpinionFragment): string {
    const mapping = SENTIMENT_TO_KANO_MAPPING[fragment.sentimentType as keyof typeof SENTIMENT_TO_KANO_MAPPING];
    
    if (!mapping) {
      return 'I'; // 默认为无差异特性
    }

    const functionalAnswer = mapping.functional;
    const dysfunctionalAnswer = mapping.dysfunctional;

    // 查询Kano矩阵
    const matrixRow = KANO_MATRIX[functionalAnswer as keyof typeof KANO_MATRIX];
    if (!matrixRow) {
      return 'I';
    }

    const kanoCategory = matrixRow[dysfunctionalAnswer as keyof typeof matrixRow];
    return kanoCategory || 'I';
  }

  /**
   * 按功能分组观点片段
   */
  private static groupFragmentsByFeature(fragments: OpinionFragment[]): Record<string, OpinionFragment[]> {
    const groups: Record<string, OpinionFragment[]> = {};

    fragments.forEach(fragment => {
      if (!groups[fragment.feature]) {
        groups[fragment.feature] = [];
      }
      groups[fragment.feature].push(fragment);
    });

    return groups;
  }

  /**
   * 确定最终Kano分类（票数最多的）
   */
  private static getFinalCategory(voteDetail: KanoVoteDetail): string {
    let maxVotes = 0;
    let finalCategory = 'I';

    Object.entries(voteDetail).forEach(([category, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        finalCategory = category;
      }
    });

    return finalCategory;
  }

  /**
   * 计算Better和Worse系数
   */
  private static calculateCoefficients(voteDetail: KanoVoteDetail, totalVotes: number): {
    betterCoefficient: number;
    worseCoefficient: number;
  } {
    if (totalVotes === 0) {
      return { betterCoefficient: 0, worseCoefficient: 0 };
    }

    // Better系数 = (A+O)/(A+O+M+I) * 100%
    const validVotes = voteDetail.A + voteDetail.O + voteDetail.M + voteDetail.I;
    const betterCoefficient = validVotes > 0 ? ((voteDetail.A + voteDetail.O) / validVotes) * 100 : 0;

    // Worse系数 = -1*(O+M)/(A+O+M+I) * 100%
    const worseCoefficient = validVotes > 0 ? -1 * ((voteDetail.O + voteDetail.M) / validVotes) * 100 : 0;

    return {
      betterCoefficient: Math.round(betterCoefficient * 100) / 100,
      worseCoefficient: Math.round(worseCoefficient * 100) / 100
    };
  }

  /**
   * 生成Kano分析表格数据
   */
  static generateKanoTable(results: KanoAnalysisResult[]): Array<{
    feature: string;
    percentages: {
      A: number; O: number; M: number; I: number; R: number; Q: number;
    };
    finalCategory: string;
    betterCoefficient: number;
    worseCoefficient: number;
  }> {
    return results.map(result => ({
      feature: result.feature,
      percentages: {
        A: result.totalVotes > 0 ? Math.round((result.voteDetail.A / result.totalVotes) * 1000) / 10 : 0,
        O: result.totalVotes > 0 ? Math.round((result.voteDetail.O / result.totalVotes) * 1000) / 10 : 0,
        M: result.totalVotes > 0 ? Math.round((result.voteDetail.M / result.totalVotes) * 1000) / 10 : 0,
        I: result.totalVotes > 0 ? Math.round((result.voteDetail.I / result.totalVotes) * 1000) / 10 : 0,
        R: result.totalVotes > 0 ? Math.round((result.voteDetail.R / result.totalVotes) * 1000) / 10 : 0,
        Q: result.totalVotes > 0 ? Math.round((result.voteDetail.Q / result.totalVotes) * 1000) / 10 : 0,
      },
      finalCategory: result.finalCategory,
      betterCoefficient: result.betterCoefficient,
      worseCoefficient: result.worseCoefficient
    }));
  }

  /**
   * 获取Kano类别的显示信息
   */
  static getCategoryInfo(category: string) {
    return KANO_CATEGORIES[category as keyof typeof KANO_CATEGORIES] || KANO_CATEGORIES['I'];
  }

  /**
   * 生成策略建议
   */
  static generateRecommendations(results: KanoAnalysisResult[]): Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    rationale: string;
    features: string[];
  }> {
    const recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      category: string;
      action: string;
      rationale: string;
      features: string[];
    }> = [];

    // M类功能（必备特性）- 高优先级
    const mFeatures = results.filter(r => r.finalCategory === 'M' && r.worseCoefficient < -30);
    if (mFeatures.length > 0) {
      recommendations.push({
        priority: 'high',
        category: '必备特性改进',
        action: `立即修复 ${mFeatures.slice(0, 3).map(f => f.feature).join('、')} 等必备功能的问题`,
        rationale: `这些功能的缺失会直接导致用户不满，Worse系数显示负面影响严重`,
        features: mFeatures.map(f => f.feature)
      });
    }

    // O类功能（期望特性）- 中优先级
    const oFeatures = results.filter(r => r.finalCategory === 'O' && r.betterCoefficient > 50);
    if (oFeatures.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: '期望特性提升',
        action: `重点提升 ${oFeatures.slice(0, 3).map(f => f.feature).join('、')} 等功能的表现`,
        rationale: `这些功能的改进能直接提升用户满意度，Better系数显示正面影响显著`,
        features: oFeatures.map(f => f.feature)
      });
    }

    // A类功能（魅力特性）- 中优先级
    const aFeatures = results.filter(r => r.finalCategory === 'A' && r.betterCoefficient > 60);
    if (aFeatures.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: '魅力特性发扬',
        action: `继续强化 ${aFeatures.slice(0, 2).map(f => f.feature).join('、')} 等亮点功能`,
        rationale: `这些功能获得用户惊喜好评，应该作为产品卖点重点宣传`,
        features: aFeatures.map(f => f.feature)
      });
    }

    // R类功能（反向特性）- 高优先级
    const rFeatures = results.filter(r => r.finalCategory === 'R');
    if (rFeatures.length > 0) {
      recommendations.push({
        priority: 'high',
        category: '反向特性移除',
        action: `考虑移除或重新设计 ${rFeatures.map(f => f.feature).join('、')} 功能`,
        rationale: `这些功能用户明确表示不需要，可能造成负面体验`,
        features: rFeatures.map(f => f.feature)
      });
    }

    return recommendations;
  }
}