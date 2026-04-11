/**
 * OpenCode Web Standalone - JavaScript SDK
 * 
 * 轻量级 JavaScript SDK，用于在浏览器或 Node.js 环境中集成 OpenCode 助手
 * 支持：静态注入模式、API 查询模式
 */

class OpenCodeWebSDK {
  constructor(config = {}) {
    this.config = {
      mode: config.mode || 'static',
      apiUrl: config.apiUrl || 'http://localhost:8080',
      knowledgeBase: config.knowledgeBase || null,
      ...config
    };
    
    if (this.config.mode === 'static' && !this.config.knowledgeBase) {
      console.warn('[OpenCode] Static mode requires knowledgeBase to be provided');
    }
  }

  /**
   * 加载知识快照（静态模式）
   * @param {string} jsonPath - knowledge_snapshot.json 的路径
   */
  async loadKnowledge(jsonPath = './knowledge_snapshot.json') {
    if (typeof fetch !== 'undefined') {
      const response = await fetch(jsonPath);
      this.config.knowledgeBase = await response.json();
    } else if (typeof require !== 'undefined') {
      this.config.knowledgeBase = require(jsonPath);
    }
    return this.config.knowledgeBase;
  }

  /**
   * 查询知识库（静态模式）
   * @param {string} query - 查询关键词
   * @param {object} options - 查询选项
   */
  queryKnowledge(query, options = {}) {
    if (!this.config.knowledgeBase) {
      throw new Error('Knowledge base not loaded. Call loadKnowledge() first.');
    }

    const kb = this.config.knowledgeBase;
    const results = {
      query,
      timestamp: new Date().toISOString(),
      matches: []
    };

    const queryLower = query.toLowerCase();

    if (queryLower.includes('cr规则') || queryLower.includes('市场分析')) {
      results.matches.push({
        category: 'cr_rules',
        data: kb.cr_rules || []
      });
    }

    if (queryLower.includes('hhci') || queryLower.includes('用户体验')) {
      results.matches.push({
        category: 'hhci_rules',
        data: kb.hhci_rules || []
      });
    }

    if (queryLower.includes('编码规范') || queryLower.includes('代码规范')) {
      results.matches.push({
        category: 'coding_standards',
        data: kb.coding_standards || []
      });
    }

    if (queryLower.includes('理性') || queryLower.includes('框架')) {
      results.matches.push({
        category: 'rational_framework',
        data: kb.rational_framework || []
      });
    }

    return results;
  }

  /**
   * 分析内容（市场分析规则）
   * @param {string} content - 待分析的内容
   */
  analyzeContent(content) {
    const kb = this.config.knowledgeBase;
    if (!kb || !kb.cr_rules) {
      throw new Error('CR rules not available in knowledge base');
    }

    const violations = [];
    const warnings = [];
    const suggestions = [];

    kb.cr_rules.forEach(rule => {
      const pattern = new RegExp(rule.pattern, 'gi');
      if (pattern.test(content)) {
        if (rule.severity === 'violation') {
          violations.push({
            rule: rule.name,
            message: rule.description,
            pattern: rule.pattern
          });
        } else if (rule.severity === 'warning') {
          warnings.push({
            rule: rule.name,
            message: rule.description,
            pattern: rule.pattern
          });
        }
      }
    });

    return {
      original: content,
      analysis: {
        violations,
        warnings,
        suggestions
      },
      score: this._calculateScore(violations.length, warnings.length),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 生成系统提示（用于 LLM 注入）
   * @param {object} options - 生成选项
   */
  generateSystemPrompt(options = {}) {
    const kb = this.config.knowledgeBase;
    if (!kb) {
      throw new Error('Knowledge base not loaded');
    }

    const sections = [
      '# OpenCode 助手系统提示',
      '',
      '你是一个专业的 AI 编程助手，遵循以下规则和框架：',
      ''
    ];

    if (options.includeCodingStandards !== false && kb.coding_standards) {
      sections.push('## 编码规范');
      kb.coding_standards.forEach(rule => {
        sections.push(`- ${rule}`);
      });
      sections.push('');
    }

    if (options.includeCRRules !== false && kb.cr_rules) {
      sections.push('## 市场分析规则（CR 规则）');
      kb.cr_rules.forEach(rule => {
        sections.push(`- **${rule.name}**: ${rule.description}`);
      });
      sections.push('');
    }

    if (options.includeRationalFramework !== false && kb.rational_framework) {
      sections.push('## 理性分析框架');
      Object.entries(kb.rational_framework).forEach(([key, value]) => {
        sections.push(`### ${key}`);
        if (Array.isArray(value)) {
          value.forEach(item => sections.push(`- ${item}`));
        } else {
          sections.push(value);
        }
      });
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * 通过 API 查询（API 模式）
   * @param {string} query - 查询内容
   * @param {object} options - 查询选项
   */
  async queryViaAPI(query, options = {}) {
    if (this.config.mode !== 'api') {
      throw new Error('SDK not configured for API mode');
    }

    const response = await fetch(`${this.config.apiUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  _calculateScore(violations, warnings) {
    const baseScore = 100;
    const violationPenalty = 10;
    const warningPenalty = 3;
    return Math.max(0, baseScore - (violations * violationPenalty) - (warnings * warningPenalty));
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = OpenCodeWebSDK;
}

if (typeof window !== 'undefined') {
  window.OpenCodeWebSDK = OpenCodeWebSDK;
}
