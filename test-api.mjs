#!/usr/bin/env node
// AI市场调研系统 - 本地API测试脚本

// 直接调用SiliconFlow API进行测试
async function testSiliconFlowAPI() {
  const API_KEY = 'sk-hwbvirmjuviwfyqbjqpmlebxetsdechtbyxmflziefipkbht';
  const API_URL = 'https://api.siliconflow.cn/v1';
  const topic = '智能宠物喂食器';

  console.log('🧪 开始SiliconFlow API测试...');
  console.log('📝 测试主题:', topic);

  try {
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          { 
            role: 'system', 
            content: '你是一名顶尖的电商市场分析师。请严格按照要求的JSON格式返回分析结果。' 
          },
          { 
            role: 'user', 
            content: `请围绕核心主题 "${topic}" 进行深度市场机会分析。

请按照以下结构进行分析，并以JSON格式返回：

{
  "market_overview": "整体市场概况（200-300字）",
  "market_size": "预估市场规模和增长率",
  "key_niches": [
    {
      "niche_name": "细分市场名称",
      "target_audience": "目标用户群体",
      "pain_point": "核心痛点",
      "opportunity_score": "机会评分(1-10)",
      "market_trend": "市场趋势描述"
    }
  ],
  "entry_barriers": "进入门槛分析",
  "success_factors": ["成功关键因素1", "成功关键因素2", "成功关键因素3"]
}` 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    console.log('📡 API响应状态:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`API错误: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('\n✅ API调用成功！');
    console.log('🤖 模型:', result.model);
    console.log('⏱️ 耗时:', result.usage?.total_tokens, '个token');
    console.log('\n📊 分析结果:');
    console.log(result.choices[0].message.content);
    
    return result;

  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    throw error;
  }
}

// 执行测试
testSiliconFlowAPI()
  .then(() => {
    console.log('\n🎉 SiliconFlow API测试通过！');
    console.log('✅ AI市场调研系统后端功能正常');
  })
  .catch(() => {
    console.log('\n💡 如果API测试失败，请检查:');
    console.log('1. 网络连接是否正常');
    console.log('2. SiliconFlow API密钥是否有效'); 
    console.log('3. API配额是否充足');
    process.exit(1);
  });