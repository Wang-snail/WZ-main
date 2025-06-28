import { DivinationResult } from '../types';

// AI服务接口
interface AIService {
  name: string;
  available: boolean;
  generateResponse(prompt: string, options?: any): Promise<string>;
}

// Gemini API服务
class GeminiAIService implements AIService {
  name = 'Gemini';
  available = true;
  private apiKey = 'AIzaSyDJdOeCPrhlxjA6nP48J-cvyNWgsMlZurA';

  async generateResponse(prompt: string, options?: any): Promise<string> {
    try {
      // 使用Google Generative AI
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text || text.trim() === '') {
        throw new Error('Empty response from Gemini API');
      }
      
      return text;
    } catch (error) {
      console.error('Gemini API调用失败:', error);
      // 不标记为不可用，允许重试
      throw new Error(`AI服务暂时不可用，请稍后再试。错误信息: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// 备用AI服务 - 使用简单模拟响应
class FallbackAIService implements AIService {
  name = 'Fallback';
  available = true;

  async generateResponse(prompt: string, options?: any): Promise<string> {
    // 基于prompt类型提供智能回复
    if (prompt.includes('塔罗') || prompt.includes('tarot')) {
      return `🔮 塔罗牌占卜结果：

根据您的问题，抽取到的牌面显示：
• 当前状况：您正处在一个重要的转折点
• 影响因素：过去的经验将为您提供指导
• 未来趋势：保持积极的心态，机会即将到来

建议：相信自己的直觉，勇敢地迈出下一步。变化虽然带来不确定性，但也带来新的可能性。`;
    }
    
    if (prompt.includes('星座') || prompt.includes('zodiac')) {
      return `⭐ 星座运势分析：

综合星象显示：
• 事业运势：★★★★☆ 工作中会有新的机会出现
• 爱情运势：★★★☆☆ 感情需要更多的沟通和理解
• 财运状况：★★★★☆ 财务状况稳定，适合小额投资
• 健康指数：★★★★☆ 注意作息规律，适当运动

建议：把握当下的机会，同时保持谨慎的态度。`;
    }
    
    if (prompt.includes('八卦') || prompt.includes('bagua')) {
      return `☯️ 八卦算卦结果：

卦象解析：
• 主卦：代表当前的处境和挑战
• 变卦：预示着未来的发展方向
• 爻辞：提示您需要注意的关键节点

卦意总结：天行健，君子以自强不息。当前虽有困难，但只要坚持努力，终将迎来转机。

建议：保持内心的平静，用智慧化解困难。`;
    }
    
    if (prompt.includes('手相') || prompt.includes('palm')) {
      return `👋 手相分析结果：

生命线：显示您有着旺盛的生命力和健康的体质
智慧线：表明您思维敏捷，善于分析和解决问题
感情线：预示着您在感情方面较为专一，重视长久关系
事业线：暗示您的事业发展稳定，会有贵人相助

总体评价：您是一个有魅力、有智慧的人，未来发展前景良好。

建议：保持现有的优点，在关键时刻要相信自己的判断。`;
    }
    
    if (prompt.includes('测字') || prompt.includes('character')) {
      return `📝 测字算卦结果：

字形分析：此字结构稳定，寓意深远
笔画解读：笔画数暗示着循序渐进的发展
五行属性：与您的运势相配，有助于个人发展
吉凶判断：整体偏吉，预示着积极的变化

字意总结：此字蕴含着成长和进步的含义，预示着您将在努力中获得成功。

建议：保持勤奋的态度，机会总是青睐有准备的人。`;
    }
    
    if (prompt.includes('九宫飞星') || prompt.includes('jiugong')) {
      return `🏠 九宫飞星风水分析：

年度飞星布局：
• 正北方位：一白贪狼星，利于学业和事业发展
• 东北方位：二黑病符星，需要注意健康问题
• 正东方位：三碧禄存星，可能有口舌是非
• 东南方位：四绿文曲星，有利于文昌和学习
• 正中方位：五黄廉贞星，需要谨慎处理重要事务

风水建议：
1. 在有利方位摆放绿色植物增强正能量
2. 避免在不利方位进行重要决策
3. 保持居住环境的整洁和通风

总体运势：通过合理的风水布局，可以提升整体运势。`;
    }
    
    // 情感分析和聊天回复
    if (prompt.includes('情感分析') || prompt.includes('心理')) {
      return `💝 情感分析师建议：

根据您提供的信息，我理解您当前的情感状况。每个人在感情中都会遇到困惑和挑战，这是完全正常的。

建议：
1. 保持开放的沟通 - 真诚地表达自己的感受
2. 学会倾听 - 理解对方的角度和需求
3. 给彼此空间 - 尊重个人的独立性
4. 寻找共同点 - 培养共同的兴趣和目标

记住，健康的关系需要双方的努力和理解。如果您需要更多支持，建议寻求专业的心理咨询帮助。`;
    }
    
    // 默认回复
    return `🤖 AI助手回复：

感谢您的询问。基于您的问题，我建议：

1. 保持积极的心态面对当前的情况
2. 相信自己的判断力和直觉
3. 在做决定时考虑多方面的因素
4. 寻求朋友或专业人士的建议

如果您需要更详细的分析，请提供更多具体信息。我会尽力为您提供有用的建议。`;
  }
}

// AI服务管理器
export class AIServiceManager {
  private services: AIService[] = [
    new GeminiAIService(),
    new FallbackAIService()
  ];

  private conversationHistory: Array<{role: string, content: string, timestamp: Date}> = [];

  // 获取可用的AI服务
  getAvailableService(): AIService | null {
    return this.services.find(service => service.available) || null;
  }

  // 智能选择API服务并生成回复
  async generateResponse(prompt: string, options?: any): Promise<string> {
    let lastError: Error | null = null;
    
    // 尝试所有可用服务
    for (const service of this.services) {
      if (!service.available) continue;
      
      try {
        const response = await service.generateResponse(prompt, options);
        
        // 记录对话历史
        this.conversationHistory.push(
          { role: 'user', content: prompt, timestamp: new Date() },
          { role: 'assistant', content: response, timestamp: new Date() }
        );

        return response;
      } catch (error) {
        console.error(`${service.name} 服务失败:`, error);
        lastError = error as Error;
        
        // 如果是Gemini服务失败，不标记为不可用（允许重试）
        if (service.name !== 'Gemini') {
          service.available = false;
        }
      }
    }
    
    // 如果所有服务都失败，抛出最后一个错误
    throw lastError || new Error('所有AI服务都不可用');
  }

  // 多轮对话支持
  async generateContinuousResponse(prompt: string, useHistory: boolean = true): Promise<string> {
    let fullPrompt = prompt;
    
    if (useHistory && this.conversationHistory.length > 0) {
      const recentHistory = this.conversationHistory.slice(-6); // 最近6轮对话
      const historyContext = recentHistory.map(msg => 
        `${msg.role === 'user' ? '用户' : 'AI助手'}: ${msg.content}`
      ).join('\n');
      
      fullPrompt = `对话历史:\n${historyContext}\n\n当前问题: ${prompt}\n\n请基于对话历史，给出连贯、相关的回复。`;
    }

    return this.generateResponse(fullPrompt);
  }

  // 专业塔罗牌占卜
  async generateProfessionalTarotReading(question: string, spread: string): Promise<DivinationResult> {
    const prompt = `作为专业塔罗师，为用户的问题"${question}"进行${spread === 'single' ? '单张牌' : '三张牌'}占卜。请提供详细的牌面解读、象征意义和人生建议。`;
    
    try {
      const interpretation = await this.generateResponse(prompt);
      return {
        type: 'tarot',
        result: '塔罗牌占卜',
        interpretation,
        advice: this.extractAdvice(interpretation),
        timestamp: new Date().toISOString(),
        metadata: { question, spread }
      };
    } catch (error) {
      // 返回备用结果
      return {
        type: 'tarot',
        result: '塔罗牌占卜',
        interpretation: '🔮 塔罗牌显示您正处在人生的重要节点。过去的经历为您提供了宝贵的智慧，现在是时候相信自己的直觉，勇敢地向前迈进。牌面暗示着积极的变化即将到来，但需要您保持开放的心态去接受新的机会。',
        advice: '相信自己的直觉，勇敢面对变化，保持积极的心态。',
        timestamp: new Date().toISOString(),
        metadata: { question, spread }
      };
    }
  }

  // 高级星座分析
  async generateAdvancedZodiacReading(birthDate: string, birthTime: string, birthPlace: string): Promise<DivinationResult> {
    const prompt = `作为专业占星师，基于出生日期${birthDate}、时间${birthTime}、地点${birthPlace}，提供详细的星座命盘分析，包括太阳、月亮、上升星座的影响。`;
    
    try {
      const interpretation = await this.generateResponse(prompt);
      return {
        type: 'zodiac',
        result: '星座命盘分析',
        interpretation,
        advice: this.extractAdvice(interpretation),
        timestamp: new Date().toISOString(),
        metadata: { birthDate, birthTime, birthPlace }
      };
    } catch (error) {
      return {
        type: 'zodiac',
        result: '星座命盘分析',
        interpretation: '⭐ 您的星座配置显示出强大的内在潜力。太阳星座赋予您独特的个性魅力，月亮星座影响着您的情感世界，而上升星座则塑造了您给他人的第一印象。综合分析显示，您是一个有深度、有魅力的人，在人际关系和事业发展方面都有很好的前景。',
        advice: '发挥您的天赋，保持真诚的态度，机会将会自然到来。',
        timestamp: new Date().toISOString(),
        metadata: { birthDate, birthTime, birthPlace }
      };
    }
  }

  // 专业八卦占卜
  async generateProfessionalBaguaReading(question: string, method: string): Promise<DivinationResult> {
    const prompt = `作为精通周易八卦的大师，使用${method === 'time' ? '时间起卦法' : '数字起卦法'}为问题"${question}"进行占卜分析。请提供卦象解读、爻辞分析和人生指导。`;
    
    try {
      const interpretation = await this.generateResponse(prompt);
      return {
        type: 'bagua',
        result: '八卦占卜',
        interpretation,
        advice: this.extractAdvice(interpretation),
        timestamp: new Date().toISOString(),
        metadata: { question, method }
      };
    } catch (error) {
      return {
        type: 'bagua',
        result: '八卦占卜',
        interpretation: '☯️ 卦象显示"否极泰来"之意。当前虽然面临一些挑战，但这正是转机的前兆。八卦中的阴阳变化提醒我们，任何困境都是暂时的，关键在于如何以智慧和耐心应对。卦辞提示：保持内心的平静，用诚恳的态度面对困难，时机成熟时自然会有转机。',
        advice: '保持耐心和智慧，困难只是成长的垫脚石。',
        timestamp: new Date().toISOString(),
        metadata: { question, method }
      };
    }
  }

  // 提取建议
  private extractAdvice(interpretation: string): string {
    // 简单的建议提取逻辑
    const sentences = interpretation.split(/[。！？.]/).filter(s => s.trim());
    const adviceSentences = sentences.filter(s => 
      s.includes('建议') || s.includes('应该') || s.includes('需要') || 
      s.includes('可以') || s.includes('保持') || s.includes('注意')
    );
    
    if (adviceSentences.length > 0) {
      return adviceSentences[0].trim();
    }
    
    // 如果没找到明确建议，返回最后一句
    return sentences.length > 0 ? sentences[sentences.length - 1].trim() : '保持积极的心态，相信自己的能力。';
  }

  // 获取对话历史
  getConversationHistory() {
    return this.conversationHistory;
  }

  // 清空对话历史
  clearConversationHistory() {
    this.conversationHistory = [];
  }

  // 重置服务状态
  resetServices() {
    this.services.forEach(service => {
      if (service.name !== 'Gemini') { // 保持Gemini服务可用
        service.available = true;
      }
    });
  }
}

// 导出单例实例
export const aiServiceManager = new AIServiceManager();
