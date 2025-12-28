/**
 * NLP文本提取服务
 * 负责从非结构化文本中提取竞品的结构化信息
 */

import type { CompetitorData, ExtractionConfidence, ProductDimensions } from '../types';

/**
 * 提取规则接口
 */
interface ExtractionRule {
  /** 规则名称 */
  name: string;
  /** 正则表达式模式 */
  pattern: RegExp;
  /** 提取函数 */
  extract: (match: RegExpMatchArray) => any;
  /** 置信度计算函数 */
  confidence: (match: RegExpMatchArray, text: string) => number;
}

/**
 * 尺寸转换结果
 */
interface DimensionConversion {
  /** 转换后的尺寸 */
  dimensions: ProductDimensions;
  /** 转换置信度 */
  confidence: number;
}

/**
 * NLP文本提取服务类
 */
export class NLPExtractionService {
  /**
   * 价格提取规则
   */
  private readonly priceRules: ExtractionRule[] = [
    {
      name: 'dollar_price',
      pattern: /\$\s*(\d+(?:\.\d{2})?)/gi,
      extract: (match) => parseFloat(match[1]),
      confidence: (match, text) => {
        // 如果价格附近有"price"等关键词，置信度更高
        const context = this.getContext(text, match.index!, 20);
        const hasKeyword = /price|cost|售价|价格/i.test(context);
        return hasKeyword ? 0.9 : 0.7;
      }
    },
    {
      name: 'yuan_price',
      pattern: /[¥￥]\s*(\d+(?:\.\d{2})?)/gi,
      extract: (match) => parseFloat(match[1]) / 6.5, // 简单汇率转换
      confidence: (match, text) => {
        const context = this.getContext(text, match.index!, 20);
        const hasKeyword = /price|cost|售价|价格/i.test(context);
        return hasKeyword ? 0.8 : 0.6;
      }
    },
    {
      name: 'number_price',
      pattern: /(?:price|售价|价格)[\s:：]*(\d+(?:\.\d{2})?)/gi,
      extract: (match) => parseFloat(match[1]),
      confidence: () => 0.85
    }
  ];

  /**
   * 重量提取规则
   */
  private readonly weightRules: ExtractionRule[] = [
    {
      name: 'gram_weight',
      pattern: /(\d+(?:\.\d+)?)\s*g(?:ram)?s?/gi,
      extract: (match) => parseFloat(match[1]),
      confidence: (match, text) => {
        const context = this.getContext(text, match.index!, 15);
        const hasKeyword = /weight|重量|轻|light/i.test(context);
        return hasKeyword ? 0.9 : 0.7;
      }
    },
    {
      name: 'kilogram_weight',
      pattern: /(\d+(?:\.\d+)?)\s*kg/gi,
      extract: (match) => parseFloat(match[1]) * 1000, // 转换为克
      confidence: (match, text) => {
        const context = this.getContext(text, match.index!, 15);
        const hasKeyword = /weight|重量|轻|light/i.test(context);
        return hasKeyword ? 0.85 : 0.65;
      }
    },
    {
      name: 'pound_weight',
      pattern: /(\d+(?:\.\d+)?)\s*(?:lb|pound)s?/gi,
      extract: (match) => parseFloat(match[1]) * 453.592, // 转换为克
      confidence: () => 0.8
    }
  ];

  /**
   * 尺寸提取规则
   */
  private readonly dimensionRules: ExtractionRule[] = [
    {
      name: 'inch_dimensions',
      pattern: /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*inch(?:es)?/gi,
      extract: (match) => ({
        length: parseFloat(match[1]) * 2.54, // 转换为厘米
        width: parseFloat(match[2]) * 2.54,
        height: parseFloat(match[3]) * 2.54
      }),
      confidence: () => 0.9
    },
    {
      name: 'cm_dimensions',
      pattern: /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*cm/gi,
      extract: (match) => ({
        length: parseFloat(match[1]),
        width: parseFloat(match[2]),
        height: parseFloat(match[3])
      }),
      confidence: () => 0.95
    },
    {
      name: 'mixed_dimensions',
      pattern: /(?:dimensions?|尺寸)[\s:：]*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/gi,
      extract: (match) => ({
        length: parseFloat(match[1]),
        width: parseFloat(match[2]),
        height: parseFloat(match[3])
      }),
      confidence: () => 0.8
    }
  ];

  /**
   * 功能特性关键词
   */
  private readonly featureKeywords = [
    // 电池相关
    'battery', 'mah', '电池', '续航', 'rechargeable', 'usb',
    // 性能相关
    'speed', 'quiet', 'silent', '静音', '档位', 'mode',
    // 设计相关
    'portable', 'lightweight', 'compact', '便携', '轻便', '小巧',
    // 功能相关
    'bladeless', 'cooling', 'airflow', '无叶', '制冷', '风力',
    // 材质相关
    'abs', 'plastic', 'metal', '金属', '塑料',
    // 其他特性
    'waterproof', 'dustproof', '防水', '防尘', 'led', 'display'
  ];

  /**
   * 从文本中提取竞品数据
   */
  async extractCompetitorData(rawText: string): Promise<CompetitorData> {
    try {
      // 清理和预处理文本
      const cleanText = this.preprocessText(rawText);

      // 提取各个字段
      const price = this.extractPrice(cleanText);
      const weight = this.extractWeight(cleanText);
      const dimensions = this.extractDimensions(cleanText);
      const features = this.extractFeatures(cleanText);

      // 计算置信度
      const extractionConfidence: ExtractionConfidence = {
        price: price.confidence,
        weight: weight.confidence,
        dimensions: dimensions.confidence,
        features: features.confidence
      };

      // 构建竞品数据对象
      const competitorData: CompetitorData = {
        price: price.value,
        weight: weight.value,
        dimensions: dimensions.value,
        features: features.value,
        extractionConfidence,
        rawText: rawText,
        extractedAt: new Date()
      };

      return competitorData;

    } catch (error) {
      throw new Error(`文本提取失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 文本预处理
   */
  private preprocessText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // 合并多个空格
      .replace(/[""'']/g, '"') // 统一引号
      .trim(); // 去除首尾空格
  }

  /**
   * 提取价格信息
   */
  private extractPrice(text: string): { value: number; confidence: number } {
    let bestMatch: { value: number; confidence: number } = { value: 0, confidence: 0 };

    // 遍历所有价格规则
    for (const rule of this.priceRules) {
      const matches = Array.from(text.matchAll(rule.pattern));
      
      for (const match of matches) {
        const value = rule.extract(match);
        const confidence = rule.confidence(match, text);
        
        // 价格合理性检查 (0.1 - 10000 USD)
        if (value >= 0.1 && value <= 10000 && confidence > bestMatch.confidence) {
          bestMatch = { value, confidence };
        }
      }
    }

    // 如果没有找到价格，返回默认值
    if (bestMatch.confidence === 0) {
      throw new Error('未能从文本中提取到有效的价格信息');
    }

    return bestMatch;
  }

  /**
   * 提取重量信息
   */
  private extractWeight(text: string): { value?: number; confidence: number } {
    let bestMatch: { value?: number; confidence: number } = { confidence: 0 };

    // 遍历所有重量规则
    for (const rule of this.weightRules) {
      const matches = Array.from(text.matchAll(rule.pattern));
      
      for (const match of matches) {
        const value = rule.extract(match);
        const confidence = rule.confidence(match, text);
        
        // 重量合理性检查 (1g - 10kg)
        if (value >= 1 && value <= 10000 && confidence > bestMatch.confidence) {
          bestMatch = { value, confidence };
        }
      }
    }

    return bestMatch;
  }

  /**
   * 提取尺寸信息
   */
  private extractDimensions(text: string): { value?: ProductDimensions; confidence: number } {
    let bestMatch: { value?: ProductDimensions; confidence: number } = { confidence: 0 };

    // 遍历所有尺寸规则
    for (const rule of this.dimensionRules) {
      const matches = Array.from(text.matchAll(rule.pattern));
      
      for (const match of matches) {
        const dimensions = rule.extract(match);
        const confidence = rule.confidence(match, text);
        
        // 尺寸合理性检查 (0.1cm - 200cm)
        if (this.isValidDimensions(dimensions) && confidence > bestMatch.confidence) {
          bestMatch = { value: dimensions, confidence };
        }
      }
    }

    return bestMatch;
  }

  /**
   * 提取功能特性
   */
  private extractFeatures(text: string): { value: string[]; confidence: number } {
    const features: string[] = [];
    const lowerText = text.toLowerCase();

    // 查找功能关键词
    for (const keyword of this.featureKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        // 提取包含关键词的短语
        const phrase = this.extractFeaturePhrase(text, keyword);
        if (phrase && !features.includes(phrase)) {
          features.push(phrase);
        }
      }
    }

    // 提取数字+单位的特性 (如 4000mAh, 3 speeds)
    const numericFeatures = this.extractNumericFeatures(text);
    features.push(...numericFeatures);

    // 计算置信度
    const confidence = Math.min(features.length * 0.2, 1.0);

    return { value: features, confidence };
  }

  /**
   * 提取包含关键词的特性短语
   */
  private extractFeaturePhrase(text: string, keyword: string): string | null {
    const keywordIndex = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (keywordIndex === -1) return null;

    // 提取关键词前后的上下文
    const start = Math.max(0, keywordIndex - 20);
    const end = Math.min(text.length, keywordIndex + keyword.length + 20);
    const context = text.substring(start, end);

    // 查找完整的特性描述
    const phrases = context.split(/[,.;]/).map(p => p.trim());
    for (const phrase of phrases) {
      if (phrase.toLowerCase().includes(keyword.toLowerCase()) && phrase.length > keyword.length) {
        return phrase;
      }
    }

    return keyword;
  }

  /**
   * 提取数字特性 (如 4000mAh, 3 speeds)
   */
  private extractNumericFeatures(text: string): string[] {
    const features: string[] = [];
    
    // 电池容量
    const batteryMatches = text.matchAll(/(\d+)\s*mah/gi);
    for (const match of batteryMatches) {
      features.push(`${match[1]}mAh电池`);
    }

    // 档位数量
    const speedMatches = text.matchAll(/(\d+)\s*(?:speed|档|mode)s?/gi);
    for (const match of speedMatches) {
      features.push(`${match[1]}档调速`);
    }

    // 其他数字特性
    const otherMatches = text.matchAll(/(\d+)\s*(?:hour|小时|min|分钟|°|度)/gi);
    for (const match of otherMatches) {
      features.push(match[0]);
    }

    return features;
  }

  /**
   * 验证尺寸数据的合理性
   */
  private isValidDimensions(dimensions: ProductDimensions): boolean {
    const { length, width, height } = dimensions;
    
    // 检查数值范围 (0.1cm - 200cm)
    const isInRange = (value: number) => value >= 0.1 && value <= 200;
    
    return isInRange(length) && isInRange(width) && isInRange(height);
  }

  /**
   * 获取指定位置的上下文文本
   */
  private getContext(text: string, index: number, radius: number): string {
    const start = Math.max(0, index - radius);
    const end = Math.min(text.length, index + radius);
    return text.substring(start, end);
  }

  /**
   * 验证提取结果的完整性
   */
  validateExtractionResult(data: CompetitorData): boolean {
    // 必须有价格信息
    if (!data.price || data.price <= 0) {
      return false;
    }

    // 至少要有一个置信度大于0.5的字段
    const confidences = Object.values(data.extractionConfidence);
    const hasReliableData = confidences.some(conf => conf >= 0.5);

    return hasReliableData;
  }

  /**
   * 获取提取质量评估
   */
  getExtractionQuality(data: CompetitorData): 'high' | 'medium' | 'low' {
    const avgConfidence = Object.values(data.extractionConfidence)
      .reduce((sum, conf) => sum + conf, 0) / 4;

    if (avgConfidence >= 0.8) return 'high';
    if (avgConfidence >= 0.5) return 'medium';
    return 'low';
  }
}