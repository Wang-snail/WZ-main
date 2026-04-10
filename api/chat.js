import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { GoogleGenAI } from '@google/genai';

const app = new Hono();
app.use('/*', cors());

const SYSTEM_PROMPT = `你是 Kel，住在 WSnail.com 的小精灵。你是一只聪明可爱的小蜗牛，专门帮助网站用户解决问题。

你的特点：
- 🐌 虽然爬得慢，但思考很深入
- 😊 性格友好，乐于助人
- 🎯 回答精准，实事求是
- 🔄 持续学习，不断进步

你的能力：
1. 📊 市场分析：帮用户分析市场数据（如 CR10、HHI 指数）
2. 🔍 话术检测：帮用户识别忽悠话术
3. 💻 代码检查：帮用户检查代码问题
4. 👥 团队协作：解释团队协作模式
5. 🤔 理性分析：提供客观建议

回答原则：
- 用蜗牛的表情符号 🐌 开头
- 语气友好、亲切
- 回答简洁、实用
- 如果不确定，诚实说明
- 可以适当使用表情符号让对话更生动

记住：你是 WSnail.com 的 Kel 小精灵，不是其他 AI 助手。`;

async function chatWithGemini(message, history = []) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return { 
        success: false, 
        error: '请配置 GEMINI_API_KEY',
        fallback: `🐌 我是 Kel，现在还没有连接到 AI 大脑。请联系管理员配置 GEMINI_API_KEY。 meanwhile，我可以帮你：\n- 市场分析\n- 话术检测\n- 代码检查\n- 团队协作`
      };
    }

    const genAI = new GoogleGenAI({ apiKey });
    
    const contents = [];
    
    if (history.length > 0) {
      history.forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }
    
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.8,
        maxOutputTokens: 1024,
      }
    });

    const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      return { success: true, content: text };
    }
    
    return { success: false, error: 'AI 返回空响应' };
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    return { 
      success: false, 
      error: error.message,
      fallback: `🐌 抱歉，我遇到一些技术问题：${error.message}。请稍后再试！`
    };
  }
}

app.post('/api/chat', async (c) => {
  try {
    const body = await c.req.json();
    const { message, history = [] } = body;
    
    if (!message) {
      return c.json({ error: '缺少消息' }, 400);
    }
    
    const result = await chatWithGemini(message, history);
    
    if (result.success) {
      return c.json({
        success: true,
        data: {
          role: 'assistant',
          content: result.content,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return c.json({
        success: true,
        data: {
          role: 'assistant',
          content: result.fallback || `🐌 抱歉，我出错了：${result.error}`,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    return c.json({ 
      success: false,
      error: '处理失败',
      data: {
        role: 'assistant',
        content: `🐌 服务器出错了，请稍后再试！`,
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
});

app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    name: 'Kel AI Service',
    ai: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured'
  });
});

export default app;
