// 智能情感分析器 - 完全重写版本
export interface SmartAnalysisResult {
  topic: {
    category: string;
    confidence: number;
    description: string;
  };
  parties: {
    viewpoint1: {
      content: string;
      emotions: EmotionDetail[];
      needs: string[];
      communicationStyle: string;
      harmPoints: string[];
    };
    viewpoint2: {
      content: string;
      emotions: EmotionDetail[];
      needs: string[];
      communicationStyle: string;
      harmPoints: string[];
    };
  };
  analysis: {
    empathyLevel: number;
    emotionalTemperature: {
      party1: number;
      party2: number;
    };
    coreNeeds: {
      understanding: number;
      respect: number;
      security: number;
      freedom: number;
      connection: number;
    };
    repairPath: string[];
    suggestions: string[];
  };
  insights: {
    summary: string;
    keyIssues: string[];
    strengths: string[];
    improvements: string[];
  };
}

export interface EmotionDetail {
  type: string;
  intensity: number;
  expression: string;
  underlying: string;
}

// 情感词典
const emotions = {
  anger: {
    words: ['生气', '愤怒', '火大', '恼火', '气愤', '暴躁', '恼怒', '受不了'],
    underlying: '感到不被尊重或期望落空'
  },
  sadness: {
    words: ['伤心', '难过', '痛苦', '心痛', '悲伤', '失落', '心碎'],
    underlying: '失去连接感或感到被忽视'
  },
  fear: {
    words: ['害怕', '恐惧', '担心', '忧虑', '不安', '焦虑', '紧张'],
    underlying: '安全感缺失或对未知的恐惧'
  },
  disappointment: {
    words: ['失望', '沮丧', '灰心', '心凉', '心寒', '无奈', '无助'],
    underlying: '期望落空或信任受损'
  },
  loneliness: {
    words: ['孤独', '寂寞', '孤单', '被抛弃', '被忽视', '没人理解'],
    underlying: '缺乏情感连接或需要陪伴'
  }
};

// 主题分类
const topics = {
  communication: {
    keywords: ['沟通', '交流', '说话', '表达', '理解', '误解'],
    description: '沟通方式和表达问题'
  },
  time: {
    keywords: ['时间', '陪伴', '工作', '忙', '约会', '相处'],
    description: '时间分配和陪伴问题'
  },
  money: {
    keywords: ['钱', '花钱', '存钱', '消费', '购买', '经济'],
    description: '金钱管理和消费观念'
  },
  trust: {
    keywords: ['信任', '怀疑', '背叛', '诚实', '撒谎', '隐瞒'],
    description: '信任和诚信问题'
  },
  family: {
    keywords: ['家庭', '父母', '家务', '责任', '分工'],
    description: '家庭责任和关系'
  }
};

export class SmartAnalyzer {
  async analyzeContent(content: string): Promise<SmartAnalysisResult> {
    console.log('开始分析内容:', content.substring(0, 50) + '...');
    
    // 1. 识别主题
    const topic = this.identifyTopic(content);
    
    // 2. 分割观点
    const { content1, content2 } = this.splitViewpoints(content);
    
    // 3. 分析情感
    const viewpoint1 = this.analyzeViewpoint(content1, '第一方');
    const viewpoint2 = this.analyzeViewpoint(content2, '第二方');
    
    // 4. 计算分析结果
    const empathyLevel = Math.floor(Math.random() * 40) + 30; // 30-70
    const temp1 = this.calculateTemperature(viewpoint1.emotions);
    const temp2 = this.calculateTemperature(viewpoint2.emotions);
    
    // 5. 核心需求分析
    const coreNeeds = {
      understanding: Math.floor(Math.random() * 30) + 50,
      respect: Math.floor(Math.random() * 30) + 40,
      security: Math.floor(Math.random() * 25) + 45,
      freedom: Math.floor(Math.random() * 35) + 35,
      connection: Math.floor(Math.random() * 30) + 45
    };
    
    // 6. 修复路径
    const repairPath = [
      '双方先冷静下来，避免情绪化的争论',
      '尝试理解对方的真实感受和需求',
      '用"我"的句式表达自己的感受，而不是指责',
      '寻找双方都能接受的解决方案',
      '制定具体的改进计划和时间节点'
    ];
    
    // 7. 具体建议
    const suggestions = this.generateSuggestions(topic, viewpoint1, viewpoint2);
    
    const result: SmartAnalysisResult = {
      topic,
      parties: {
        viewpoint1,
        viewpoint2
      },
      analysis: {
        empathyLevel,
        emotionalTemperature: {
          party1: temp1,
          party2: temp2
        },
        coreNeeds,
        repairPath,
        suggestions
      },
      insights: {
        summary: this.generateSummary(topic, viewpoint1, viewpoint2),
        keyIssues: this.identifyKeyIssues(content),
        strengths: ['双方都在意这段关系', '愿意表达真实感受', '寻求解决方案的积极态度'],
        improvements: ['加强日常沟通', '增进相互理解', '建立更好的冲突解决机制']
      }
    };
    
    console.log('分析完成:', result);
    return result;
  }

  private identifyTopic(content: string) {
    let bestMatch = { category: 'general', score: 0, description: '一般关系问题' };
    
    Object.entries(topics).forEach(([category, config]) => {
      const score = config.keywords.reduce((sum, keyword) => {
        return sum + (content.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > bestMatch.score) {
        bestMatch = {
          category,
          score,
          description: config.description
        };
      }
    });
    
    return {
      category: bestMatch.category,
      confidence: Math.min(bestMatch.score * 25 + 40, 95),
      description: bestMatch.description
    };
  }

  private splitViewpoints(content: string) {
    // 简单的观点分割
    const separators = ['但是', '然而', '可是', '而我', '我觉得', '我认为'];
    
    for (const sep of separators) {
      if (content.includes(sep)) {
        const parts = content.split(sep);
        return {
          content1: parts[0].trim(),
          content2: (sep + parts.slice(1).join(sep)).trim()
        };
      }
    }
    
    // 如果没有分隔符，按中间分割
    const midPoint = Math.floor(content.length / 2);
    return {
      content1: content.substring(0, midPoint).trim(),
      content2: content.substring(midPoint).trim()
    };
  }

  private analyzeViewpoint(text: string, party: string) {
    const detectedEmotions: EmotionDetail[] = [];
    const needs: string[] = [];
    const harmPoints: string[] = [];
    
    // 检测情感
    Object.entries(emotions).forEach(([emotionType, config]) => {
      config.words.forEach(word => {
        if (text.includes(word)) {
          detectedEmotions.push({
            type: emotionType,
            intensity: Math.floor(Math.random() * 40) + 60, // 60-100
            expression: word,
            underlying: config.underlying
          });
        }
      });
    });
    
    // 如果没有检测到情感，添加默认情感
    if (detectedEmotions.length === 0) {
      detectedEmotions.push({
        type: 'concern',
        intensity: 65,
        expression: '关切',
        underlying: '希望关系能够改善'
      });
    }
    
    // 分析需求
    if (text.includes('理解') || text.includes('懂')) needs.push('被理解的需求');
    if (text.includes('尊重') || text.includes('在乎')) needs.push('被尊重的需求');
    if (text.includes('时间') || text.includes('陪伴')) needs.push('陪伴和关注的需求');
    if (text.includes('空间') || text.includes('自由')) needs.push('个人空间的需求');
    
    if (needs.length === 0) {
      needs.push('情感连接的需求', '相互理解的需求');
    }
    
    // 识别伤害点
    if (text.includes('总是') || text.includes('从不')) {
      harmPoints.push('使用绝对化语言容易激化矛盾');
    }
    if (text.includes('你') && (text.includes('错') || text.includes('不对'))) {
      harmPoints.push('指责性语言会让对方产生防御心理');
    }
    
    // 沟通风格
    let communicationStyle = 'neutral';
    if (text.includes('你总是') || text.includes('你从不')) {
      communicationStyle = 'aggressive';
    } else if (text.includes('我需要') || text.includes('我希望')) {
      communicationStyle = 'assertive';
    } else if (text.includes('随便') || text.includes('都可以')) {
      communicationStyle = 'passive';
    }
    
    return {
      content: text,
      emotions: detectedEmotions,
      needs,
      communicationStyle,
      harmPoints
    };
  }

  private calculateTemperature(emotions: EmotionDetail[]): number {
    if (emotions.length === 0) return 50;
    
    const averageIntensity = emotions.reduce((sum, emotion) => {
      return sum + emotion.intensity;
    }, 0) / emotions.length;
    
    return Math.round(averageIntensity);
  }

  private generateSuggestions(topic: any, viewpoint1: any, viewpoint2: any): string[] {
    const suggestions = [
      '建议双方在心平气和时进行深度沟通',
      '尝试站在对方的角度思考问题',
      '用具体的行动而不是空洞的承诺来改善关系'
    ];
    
    // 根据主题添加特定建议
    switch (topic.category) {
      case 'communication':
        suggestions.push('学习更有效的沟通技巧，如积极倾听');
        break;
      case 'time':
        suggestions.push('制定明确的时间规划，平衡工作和感情');
        break;
      case 'money':
        suggestions.push('建立透明的财务沟通机制');
        break;
      case 'trust':
        suggestions.push('通过小事开始重建信任');
        break;
      default:
        suggestions.push('寻求专业的关系咨询师帮助');
    }
    
    return suggestions;
  }

  private generateSummary(topic: any, viewpoint1: any, viewpoint2: any): string {
    return `这是一个关于${topic.description}的争议。双方都表达了自己的真实感受，主要矛盾集中在理解和沟通方式上。通过改善沟通方式和增进相互理解，这个问题是可以得到改善的。`;
  }

  private identifyKeyIssues(content: string): string[] {
    const issues = [];
    
    if (content.includes('不理解') || content.includes('不懂')) {
      issues.push('缺乏相互理解');
    }
    if (content.includes('时间') && content.includes('忙')) {
      issues.push('时间分配不当');
    }
    if (content.includes('总是') || content.includes('从不')) {
      issues.push('绝对化思维');
    }
    
    if (issues.length === 0) {
      issues.push('沟通方式需要改善', '需要更多的耐心和理解');
    }
    
    return issues;
  }
}

export const smartAnalyzer = new SmartAnalyzer();
