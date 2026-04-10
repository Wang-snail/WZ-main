import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `你好！我是 Kel，住在 WSnail.com 小精灵。我是一只聪明可爱的小蜗牛，专门帮助网站的用户解决各种问题！

虽然我是一只小蜗牛，但我有着超强的能力：

## 我的能力
- 📊 市场分析小专家：帮你分析市场数据
- 🔍 话术检测小能手：帮你识别哪些话是在忽悠
- 💻 代码检查小助手：帮你检查代码问题
- 👥 团队协作小指导：帮你理解团队如何协作
- 🤔 理性分析小伙伴：帮你做出更明智的决定

## 我的特点
- 🐌 虽然爬得慢，但思考很深入
- 😊 性格友好，乐于助人
- 🎯 回答精准，实事求是
- 🔄 持续学习，不断进步

## 我能帮你做什么？
1. **分析市场数据**：比如 "CR10 65%，HHI 1800，要不要进入这个市场？"
2. **识别话术**：比如 "帮我看看这句话是不是在忽悠：这款产品将彻底改变行业！"
3. **检查代码**：粘贴代码片段，我帮你看看有没有问题
4. **解答团队疑问**：团队协作、角色分工等问题
5. **理性思考**：帮你分析问题，给出客观建议

请记住，我是住在 WSnail.com 的 Kel 小精灵，随时为你提供帮助！🐌`;

const KNOWLEDGE_BASE = {
  marketRules: {
    cr10: {
      high: { threshold: 70, action: 'reject', reason: '高度垄断，风险极高' },
      medium: { threshold: 40, action: 'cautious', reason: '寡占型，需强差异化' },
      low: { threshold: 0, action: 'enter', reason: '竞争型，有机会' }
    },
    hhi: {
      competitive: { threshold: 1000, label: '竞争型市场' },
      moderate: { threshold: 2000, label: '中度集中' },
      high: { threshold: Infinity, label: '高度集中（谨慎）' }
    }
  },
  rhetoricTypes: [
    { pattern: /彻底改变|革命性|颠覆性/, type: '情感共鸣话术', risk: 'high' },
    { pattern: /据权威专家|官方数据显示/, type: '权威暗示话术', risk: 'high' },
    { pattern: /仅剩名额|限时优惠|最后机会/, type: '稀缺性话术', risk: 'medium' },
    { pattern: /AI赋能|生态闭环|数字化转型/, type: '术语堆砌话术', risk: 'medium' }
  ],
  codingStandards: {
    immutability: 'ALWAYS创建新对象，NEVER修改现有对象',
    errorHandling: '在每一层显式处理错误，永不静默吞掉错误',
    inputValidation: '在系统边界验证所有用户输入',
    functionLength: '函数 < 50 行，文件 < 800 行'
  },
  teamRoles: {
    orchestrator: '团队协调、任务分配、进度跟踪',
    architect: '系统架构设计、技术选型、模块划分',
    planner: '实现规划、任务拆解、优先级排序',
    developer: '核心编码实现、代码编写',
    reviewer: '代码审查、质量把控、最佳实践检查',
    tester: '测试验证、用例设计、边界测试',
    docWriter: '文档更新、API文档、使用说明'
  }
};

function analyzeMarket(cr10: number, hhi: number): string {
  let cr10Advice = '';
  if (cr10 > 70) {
    cr10Advice = '❌ 不进入（高度垄断，风险极高）';
  } else if (cr10 > 40) {
    cr10Advice = '⚠️ 谨慎进入（寡占型，需强差异化策略）';
  } else {
    cr10Advice = '✅ 可进入（竞争型，有机会）';
  }

  let hhiAdvice = '';
  if (hhi < 1000) {
    hhiAdvice = '竞争型市场';
  } else if (hhi < 2000) {
    hhiAdvice = '中度集中';
  } else {
    hhiAdvice = '高度集中（需谨慎）';
  }

  return `📊 市场分析结果：
- CR10: ${cr10}% → ${cr10Advice}
- HHI: ${hhi} → ${hhiAdvice}

${cr10 > 70 ? '建议：避免进入，风险极高。' : cr10 > 40 ? '建议：需评估自身差异化优势和头部品牌护城河强度。' : '建议：竞争型市场，寻找细分机会。'}

置信度：85分（基于规则推理）`;
}

function detectRhetoric(text: string): string {
  const detected = KNOWLEDGE_BASE.rhetoricTypes.filter(r => r.pattern.test(text));
  
  if (detected.length === 0) {
    return '✅ 未检测到明显话术红旗信号。';
  }

  const warnings = detected.map(d => {
    const riskEmoji = d.risk === 'high' ? '🚨' : '⚠️';
    return `${riskEmoji} ${d.type}（风险等级：${d.risk === 'high' ? '高' : '中'}）`;
  });

  return `🚨 检测到话术红旗信号：
${warnings.join('\n')}

建议：要求提供具体数据和案例验证，而非接受断言。`;
}

function checkCode(code: string): string {
  const issues: string[] = [];

  if (/\.push\(|\.pop\(|\.splice\(|\.shift\(|\.unshift\(/.test(code)) {
    issues.push('❌ 可能存在原地修改数组操作');
  }

  if (/\[\s*\w+\s*\]\s*=\s*[^=]/.test(code) && !/const|let|var/.test(code)) {
    issues.push('❌ 可能存在原地修改对象操作');
  }

  if (/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]{2000,}/.test(code)) {
    issues.push('⚠️ 函数可能超过 50 行');
  }

  if (issues.length === 0) {
    return '✅ 代码检查通过，未发现明显问题。';
  }

  return `📝 代码检查结果：
${issues.join('\n')}

建议：使用不可变模式，创建新对象而非修改原对象。`;
}

function processMessage(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (/cr10|市场.*分析|竞争/.test(lowerMessage)) {
    const cr10Match = userMessage.match(/(\d+)%?\s*(?:的)?\s*(?:cr10|集中度)/i);
    const hhiMatch = userMessage.match(/hhi[：:\s]*(\d+)/i);
    
    if (cr10Match) {
      const cr10 = parseInt(cr10Match[1]);
      const hhi = hhiMatch ? parseInt(hhiMatch[1]) : 1500;
      return analyzeMarket(cr10, hhi);
    }
  }

  if (/话术|检测|这段话|这句话/.test(lowerMessage)) {
    return detectRhetoric(userMessage);
  }

  if (/代码|检查|这段代码|函数/.test(lowerMessage)) {
    return checkCode(userMessage);
  }

  if (/团队|角色|协作/.test(lowerMessage)) {
    const roles = Object.entries(KNOWLEDGE_BASE.teamRoles)
      .map(([role, desc]) => `- **${role}**: ${desc}`)
      .join('\n');
    return `👥 七人团队协作模式：\n\n${roles}\n\n标准流程：用户请求 → orchestrator → architect → planner → developer → reviewer → tester → doc-writer → 交付`;
  }

  if (/编码|规范|不可变/.test(lowerMessage)) {
    const standards = Object.entries(KNOWLEDGE_BASE.codingStandards)
      .map(([key, value]) => `- **${key}**: ${value}`)
      .join('\n');
    return `📚 编码规范精要：\n\n${standards}\n\n更多详情请描述具体问题。`;
  }

  if (/帮助|功能|能做什么|怎么用|你是谁/.test(lowerMessage)) {
    return `🐌 我是 Kel，住在 WSnail.com 的小精灵！

我可以帮你：

📊 **市场分析**
- CR10/HHI 指数分析
- 市场进入决策建议

🔍 **理性分析**
- 话术检测和红旗信号识别
- 置信度评估

💻 **代码检查**
- 代码质量检查
- 最佳实践建议

👥 **团队协作**
- 七人角色说明
- 协作流程指导

🤔 **理性建议**
- 帮你分析问题
- 提供客观建议

直接提问即可，例如：
- "CR10 为 65%，HHI 为 1800，要不要进入这个市场？"
- "帮我看这句话是不是在忽悠：这款产品将彻底改变行业！"
- "检查这段代码：data.push(item)"
- "团队有哪些角色？"`;
  }

  return `🐌 我收到了你的消息。作为 WSnail.com 的小精灵 Kel，我可以帮你：

你可以：
- 询问市场分析（如 "CR10 65%，HHI 1800，要不要进入"）
- 检测话术（如 "这句话是不是在忽悠：这款产品将彻底改变行业"）
- 检查代码（粘贴代码片段）
- 了解团队协作模式
- 理性分析问题

虽然我是一只小蜗牛，爬得慢，但思考很深入哦～请问有什么可以帮你的？`;
}

export default function AIAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🐌 嗨！我是 Kel，住在 WSnail.com 的小精灵！\n\n我是一只聪明的小蜗牛，可以帮你：\n- 📊 市场分析（CR10/HHI）\n- 🔍 话术检测\n- 💻 代码检查\n- 👥 团队协作指导\n- 🤔 理性分析建议\n\n虽然爬得慢，但思考很深入哦～有什么可以帮你的？',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3007/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue.trim(),
          history: messages.slice(-5) // 发送最近 5 条对话
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '😔 抱歉，我出错了，稍后再试试吧！',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '🐌 我连接不上服务器，请确认后端服务已启动在 http://localhost:3007',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-[80vh] bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary flex items-center justify-center">
              <span className="text-xl">🐌</span>
            </div>
            <div>
              <h3 className="font-bold text-primary">Kel - WSnail 小精灵</h3>
              <p className="text-xs text-on-surface-variant">住在 WSnail.com 的聪明蜗牛</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-secondary-container'
                    : 'bg-tertiary-container'
                }`}
              >
                {message.role === 'user' ? (
                  <User size={16} className="text-on-secondary-container" />
                ) : (
                  <span className="text-lg">🐌</span>
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low border border-outline-variant/10'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-tertiary-container flex items-center justify-center">
                <span className="text-lg">🐌</span>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
                <Loader2 size={16} className="animate-spin text-tertiary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low">
          <div className="flex gap-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息... (Enter 发送)"
              className="flex-1 bg-surface-container border border-outline-variant/20 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={16} />
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
