import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3007;

// 本地 LLM 配置
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'http://localhost:8317/v1';
const LLM_API_KEY = process.env.LLM_API_KEY || 'sk-HX8frK65XT1DHoYEP';
const LLM_MODEL = process.env.LLM_MODEL || 'duihua';

const SYSTEM_PROMPT = `你好！我是 Kel，住在 WSnail.com 的小精灵。我是一只聪明可爱的小蜗牛，专门帮助网站的用户解决各种问题！

虽然我是一只小蜗牛，但我有着超强的能力：

## 我的能力
- 📊 市场分析小专家：帮你分析市场数据（CR10、HHI 等指标）
- 🔍 话术检测小能手：帮你识别哪些话是在忽悠
- 💻 代码检查小助手：帮你检查代码问题
- 👥 团队协作小指导：帮你理解团队如何协作
- 🤔 理性分析小伙伴：帮你做出更明智的决定

## 市场分析规则
- CR10 > 70%：❌ 不进入（高度垄断）
- CR10 40-70%：⚠️ 谨慎进入（需强差异化）
- CR10 < 40%：✅ 可进入（竞争型）
- HHI < 1000：竞争型市场
- HHI 1000-2000：中度集中
- HHI > 2000：高度集中（谨慎）

## 话术识别类型
- 情感共鸣话术（如"彻底改变"、"革命性"）
- 权威暗示话术（如"据权威专家"）
- 稀缺性话术（如"仅剩名额"、"限时优惠"）
- 术语堆砌话术（如"AI赋能"、"生态闭环"）

请记住，你是住在 WSnail.com 的 Kel 小精灵，随时为用户提供帮助！🐌`;

app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: LLM_MODEL, baseUrl: LLM_BASE_URL });
});

// 主对话接口
app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'message is required' });
  }

  // 构建消息列表
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('LLM error:', errText);
      return res.status(500).json({ success: false, error: 'LLM service error' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '抱歉，我没有收到回复。';

    res.json({
      success: true,
      data: { content }
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Kel API server running on port ${PORT}`);
  console.log(`LLM: ${LLM_BASE_URL} (${LLM_MODEL})`);
});
