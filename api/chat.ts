import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/*', cors())

const KNOWLEDGE_BASE = {
  marketRules: {
    cr10: {
      high: { threshold: 70, action: 'reject', reason: '高度垄断，风险极高' },
      medium: { threshold: 40, action: 'cautious', reason: '寡占型，需强差异化' },
      low: { threshold: 0, action: 'enter', reason: '竞争型，有机会' }
    }
  },
  teamRoles: {
    orchestrator: '团队协调、任务分配、进度跟踪',
    architect: '系统架构设计、技术选型、模块划分',
    planner: '实现规划、任务拆解、优先级排序',
    developer: '核心编码实现、代码编写',
    reviewer: '代码审查、质量把控、最佳实践检查',
    tester: '测试验证、用例设计、边界测试',
    docWriter: '文档更新、API 文档、使用说明'
  },
  codingStandards: {
    immutability: 'ALWAYS 创建新对象，NEVER 修改现有对象',
    errorHandling: '在每一层显式处理错误，永不静默吞掉错误',
    inputValidation: '在系统边界验证所有用户输入'
  }
}

function analyzeMarket(cr10: number, hhi: number): string {
  let cr10Advice = cr10 > 70 ? '❌ 不进入（高度垄断）' : cr10 > 40 ? '⚠️ 谨慎进入（寡占型）' : '✅ 可进入（竞争型）'
  let hhiAdvice = hhi < 1000 ? '竞争型市场' : hhi < 2000 ? '中度集中' : '高度集中'
  
  return `📊 市场分析：CR10 ${cr10}% → ${cr10Advice}，HHI ${hhi} → ${hhiAdvice}。置信度：85 分`
}

function detectRhetoric(text: string): string {
  const patterns = [
    { regex: /彻底改变 | 革命性 | 颠覆性/, type: '情感共鸣话术' },
    { regex: /据权威专家 | 官方数据/, type: '权威暗示话术' },
    { regex: /仅剩 | 限时 | 最后机会/, type: '稀缺性话术' }
  ]
  const detected = patterns.filter(p => p.regex.test(text))
  return detected.length > 0 
    ? `🚨 检测到话术：${detected.map(d => d.type).join('、')}`
    : '✅ 未检测到明显话术'
}

function chatWithKel(message: string, history: any[]): string {
  const lower = message.toLowerCase()
  
  if (/cr10|hhi|市场/.test(lower)) {
    const cr10 = message.match(/(\d+)%?/)?.[1] || '50'
    const hhi = message.match(/hhi[:\s]*(\d+)/i)?.[1] || message.match(/(\d+)/)?.[1] || '1500'
    return analyzeMarket(parseInt(cr10), parseInt(hhi))
  }
  
  if (/话术 | 检测 | 忽悠/.test(lower)) {
    return detectRhetoric(message)
  }
  
  if (/团队 | 角色 | 协作/.test(lower)) {
    return '👥 七人团队：' + Object.entries(KNOWLEDGE_BASE.teamRoles).map(([k,v]) => `${k}:${v}`).join(' | ')
  }
  
  if (/编码 | 规范 | 代码/.test(lower)) {
    return '💻 编码规范：' + Object.values(KNOWLEDGE_BASE.codingStandards).join('；')
  }
  
  if (/帮助 | 功能 | 能做/.test(lower)) {
    return '🐌 我是 Kel，可以帮你：📊市场分析 🔍话术检测 💻代码检查 👥团队指导。直接提问即可！'
  }
  
  const responses = [
    `🐌 我是 Kel 小精灵，虽然爬得慢但思考深入哦～可以问我市场分析、话术检测、代码检查等问题`,
    `😊 有什么可以帮你？我可以分析市场数据、检测话术、检查代码规范`,
    `🤔 这个问题很有意思！作为 WSnail 的小精灵，我擅长数据分析和理性判断`,
    `🐌 收到！我是 Kel，可以帮你分析市场、检测话术、检查代码。试试看？`
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

app.post('/api/chat', async (c) => {
  try {
    const { message, history = [] } = await c.req.json()
    
    if (!message) {
      return c.json({ error: '缺少消息' }, 400)
    }
    
    const response = chatWithKel(message, history)
    
    return c.json({
      success: true,
      data: {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({ error: '处理失败' }, 500)
  }
})

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', name: 'Kel AI Service' })
})

export default app
