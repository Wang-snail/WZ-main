import { OpinionFragment } from '../store/kanoToolStore';

export interface AIConfig {
  maxFragmentsPerComment: number;
  confidenceThreshold: number;
  enableContextAnalysis: boolean;
  customPrompt?: string;
}

export class AIService {
  private static readonly DEFAULT_FEATURES = [
    // 产品功能
    '电池', '续航', '充电', '屏幕', '显示', '摄像头', '拍照', '音质', '扬声器',
    '性能', '速度', '流畅度', '系统', '操作', '界面', '软件',
    // 外观设计
    '外观', '颜值', '设计', '手感', '握感', '材质', '工艺', '重量', '厚度',
    '尺寸', '大小', '颜色', '配色', '质感',
    // 用户体验
    '操作', '使用', '体验', '便携', '舒适', '方便', '简单', '复杂',
    // 商业属性
    '价格', '性价比', '成本', '值得', '便宜', '贵', '划算',
    // 服务相关
    '客服', '售后', '物流', '包装', '配送', '服务'
  ];

  private static readonly SENTIMENT_KEYWORDS = {
    strong_praise: ['非常好', '超棒', '完美', '惊艳', '爱了', '绝了', '太棒了', '超赞', '神器'],
    weak_praise: ['不错', '还行', '可以', '挺好', '满意', '喜欢', '好用', '舒服'],
    suggestion: ['希望', '建议', '最好', '如果', '要是', '能够', '应该', '期待'],
    neutral: ['一般', '普通', '正常', '还好', '凑合', '马马虎虎'],
    weak_complaint: ['有点', '稍微', '略微', '不太', '感觉', '似乎', '可能'],
    strong_complaint: ['很差', '糟糕', '垃圾', '坑', '失望', '后悔', '不行', '太差', '烂']
  };

  /**
   * 模拟AI提取观点片段
   * 在实际应用中，这里应该调用真实的AI API
   */
  static async extractOpinionFragments(
    content: string, 
    commentId: string, 
    config: AIConfig
  ): Promise<OpinionFragment[]> {
    // 模拟AI处理延迟
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    const fragments: OpinionFragment[] = [];
    const sentences = this.splitIntoSentences(content);

    for (let i = 0; i < sentences.length && fragments.length < config.maxFragmentsPerComment; i++) {
      const sentence = sentences[i];
      
      // 查找功能关键词
      const detectedFeatures = this.detectFeatures(sentence);
      
      for (const feature of detectedFeatures) {
        if (fragments.length >= config.maxFragmentsPerComment) break;

        // 分析情感
        const sentimentResult = this.analyzeSentiment(sentence, feature);
        
        if (sentimentResult.confidence >= config.confidenceThreshold) {
          const startPos = content.indexOf(sentence);
          const endPos = startPos + sentence.length;
          
          fragments.push({
            id: `fragment_${commentId}_${fragments.length}`,
            commentId,
            feature: feature,
            rawText: sentence.trim(),
            sentimentType: sentimentResult.type,
            confidence: sentimentResult.confidence,
            position: [startPos, endPos],
            context: this.extractContext(content, startPos, endPos, 20)
          });
        }
      }
    }

    // 如果没有检测到任何片段，创建一个通用片段
    if (fragments.length === 0 && content.trim().length > 0) {
      const generalSentiment = this.analyzeSentiment(content, '整体');
      fragments.push({
        id: `fragment_${commentId}_0`,
        commentId,
        feature: '整体',
        rawText: content.length > 50 ? content.substring(0, 50) + '...' : content,
        sentimentType: generalSentiment.type,
        confidence: Math.max(0.3, generalSentiment.confidence),
        position: [0, content.length],
        context: content
      });
    }

    return fragments;
  }

  /**
   * 将文本分割成句子
   */
  private static splitIntoSentences(text: string): string[] {
    return text
      .split(/[。！？；\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * 检测文本中的功能关键词
   */
  private static detectFeatures(text: string): string[] {
    const detectedFeatures: string[] = [];
    const lowerText = text.toLowerCase();

    for (const feature of this.DEFAULT_FEATURES) {
      if (lowerText.includes(feature.toLowerCase())) {
        detectedFeatures.push(feature);
      }
    }

    // 如果没有检测到具体功能，尝试通过上下文推断
    if (detectedFeatures.length === 0) {
      if (lowerText.includes('用') || lowerText.includes('操作')) {
        detectedFeatures.push('使用体验');
      } else if (lowerText.includes('看') || lowerText.includes('视觉')) {
        detectedFeatures.push('外观');
      } else if (lowerText.includes('钱') || lowerText.includes('元')) {
        detectedFeatures.push('价格');
      }
    }

    return detectedFeatures.length > 0 ? detectedFeatures : ['整体'];
  }

  /**
   * 分析情感倾向
   */
  private static analyzeSentiment(text: string, feature: string): {
    type: string;
    confidence: number;
  } {
    const lowerText = text.toLowerCase();
    let maxScore = 0;
    let detectedType = 'neutral';

    // 检查各种情感关键词
    for (const [sentimentType, keywords] of Object.entries(this.SENTIMENT_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        detectedType = sentimentType;
      }
    }

    // 基于否定词调整
    const hasNegation = /不|没|无|非|未|别|勿/.test(text);
    if (hasNegation) {
      if (detectedType === 'strong_praise') detectedType = 'weak_complaint';
      else if (detectedType === 'weak_praise') detectedType = 'strong_complaint';
      else if (detectedType === 'weak_complaint') detectedType = 'weak_praise';
      else if (detectedType === 'strong_complaint') detectedType = 'strong_praise';
    }

    // 计算置信度
    let confidence = 0.5; // 基础置信度
    if (maxScore > 0) confidence += maxScore * 0.2;
    if (text.length > 10) confidence += 0.1;
    if (feature !== '整体') confidence += 0.1;

    return {
      type: detectedType,
      confidence: Math.min(0.95, confidence)
    };
  }

  /**
   * 提取上下文
   */
  private static extractContext(text: string, start: number, end: number, contextLength: number): string {
    const contextStart = Math.max(0, start - contextLength);
    const contextEnd = Math.min(text.length, end + contextLength);
    
    let context = text.substring(contextStart, contextEnd);
    
    if (contextStart > 0) context = '...' + context;
    if (contextEnd < text.length) context = context + '...';
    
    return context;
  }

  /**
   * 批量处理评论
   */
  static async batchExtractFragments(
    comments: { id: string; content: string }[],
    config: AIConfig,
    onProgress?: (progress: number) => void
  ): Promise<OpinionFragment[]> {
    const allFragments: OpinionFragment[] = [];
    
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      const fragments = await this.extractOpinionFragments(comment.content, comment.id, config);
      allFragments.push(...fragments);
      
      if (onProgress) {
        onProgress((i + 1) / comments.length * 100);
      }
    }

    return allFragments;
  }

  /**
   * 获取默认AI配置
   */
  static getDefaultConfig(): AIConfig {
    return {
      maxFragmentsPerComment: 10,
      confidenceThreshold: 0.5,
      enableContextAnalysis: true,
      customPrompt: ''
    };
  }

  /**
   * 验证AI配置
   */
  static validateConfig(config: AIConfig): string[] {
    const errors: string[] = [];

    if (config.maxFragmentsPerComment < 1 || config.maxFragmentsPerComment > 50) {
      errors.push('每条评论最大片段数应在1-50之间');
    }

    if (config.confidenceThreshold < 0.1 || config.confidenceThreshold > 1.0) {
      errors.push('置信度阈值应在0.1-1.0之间');
    }

    return errors;
  }
}