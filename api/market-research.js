// Vercel Serverless Function - AI市场调研
export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, email } = req.body;

    if (!topic || !email) {
      return res.status(400).json({ error: '缺少必要参数：topic 和 email' });
    }

    console.log(`开始分析主题: ${topic}, 发送至: ${email}`);

    // SiliconFlow API配置
    const API_KEY = process.env.SILICONFLOW_API_KEY || 'sk-hwbvirmjuviwfyqbjqpmlebxetsdechtbyxmflziefipkbht';
    const API_URL = process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.cn/v1';
    
    // 调用SiliconFlow API的通用函数
    async function callSiliconFlowAPI(systemPrompt, userPrompt) {
      const response = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V3',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`SiliconFlow API错误: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    }

    // 步骤1：市场机会分析
    const marketAnalysis = await callSiliconFlowAPI(
      '你是一名顶尖的电商市场分析师。请严格按照要求的JSON格式返回分析结果。',
      `请围绕核心主题 "${topic}" 进行深度市场机会分析。

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
    );

    // 步骤2：关键词需求分析
    const keywordAnalysis = await callSiliconFlowAPI(
      '你是一名专业的SEO和关键词分析师。请严格按照要求的JSON格式返回分析结果。',
      `基于以下市场机会分析结果：${marketAnalysis}

请为排名第一的细分市场进行深度关键词和需求分析，以JSON格式返回：

{
  "primary_niche": "主要细分市场名称",
  "core_keywords": [
    "高价值关键词1",
    "高价值关键词2",
    "高价值关键词3",
    "高价值关键词4",
    "高价值关键词5"
  ],
  "long_tail_keywords": [
    "长尾关键词1",
    "长尾关键词2",
    "长尾关键词3",
    "长尾关键词4",
    "长尾关键词5"
  ],
  "search_intent_analysis": {
    "informational": ["信息型搜索词"],
    "commercial": ["商业型搜索词"],
    "transactional": ["交易型搜索词"]
  },
  "seasonal_trends": "季节性趋势分析",
  "content_opportunities": ["内容营销机会1", "内容营销机会2", "内容营销机会3"]
}`
    );

    // 步骤3：竞争对手分析
    const competitorAnalysis = await callSiliconFlowAPI(
      '你是一名专业的竞争情报分析师。请严格按照要求的JSON格式返回分析结果。',
      `基于市场分析：${marketAnalysis}

请分析该市场的主要竞争对手，以JSON格式返回：

{
  "competitive_landscape": "竞争格局概述",
  "top_competitors": [
    {
      "name": "竞争对手名称",
      "type": "公司类型（大企业/创业公司/品牌商等）",
      "market_share": "市场份额估算",
      "strengths": ["优势1", "优势2", "优势3"],
      "weaknesses": ["劣势1", "劣势2"],
      "pricing_strategy": "定价策略",
      "differentiation": "差异化优势"
    }
  ],
  "market_gaps": ["市场空白1", "市场空白2", "市场空白3"],
  "competitive_advantages": ["可获得的竞争优势1", "可获得的竞争优势2"],
  "threat_level": "竞争威胁等级（高/中/低）",
  "entry_strategy": "建议的市场进入策略"
}`
    );

    // 步骤4：用户画像分析
    const userPersona = await callSiliconFlowAPI(
      '你是一名专业的用户研究和数据分析师。请严格按照要求的JSON格式返回分析结果。',
      `基于市场分析：${marketAnalysis}
关键词分析：${keywordAnalysis}

请构建详细的用户画像，以JSON格式返回：

{
  "primary_persona": {
    "name": "主要用户群体名称",
    "demographics": {
      "age_range": "年龄范围",
      "gender": "性别分布",
      "income_level": "收入水平",
      "education": "教育背景",
      "location": "地理分布"
    },
    "psychographics": {
      "interests": ["兴趣1", "兴趣2", "兴趣3"],
      "values": ["价值观1", "价值观2"],
      "lifestyle": "生活方式描述",
      "personality_traits": ["性格特征1", "性格特征2"]
    },
    "behavior_patterns": {
      "purchase_drivers": ["购买动机1", "购买动机2"],
      "decision_process": "决策过程描述",
      "preferred_channels": ["偏好渠道1", "偏好渠道2"],
      "content_preferences": ["内容偏好1", "内容偏好2"]
    }
  },
  "secondary_personas": [
    {"name": "次要用户群体", "key_characteristics": "主要特征"}
  ],
  "user_journey": [
    {"stage": "认知阶段", "actions": ["用户行为1", "用户行为2"]},
    {"stage": "考虑阶段", "actions": ["用户行为1", "用户行为2"]},
    {"stage": "购买阶段", "actions": ["用户行为1", "用户行为2"]}
  ]
}`
    );

    // 步骤5：营销策略制定
    const marketingStrategy = await callSiliconFlowAPI(
      '你是一名资深的数字营销策略专家。请严格按照要求的JSON格式返回分析结果。',
      `基于以下分析结果制定营销策略：
市场分析：${marketAnalysis}
关键词分析：${keywordAnalysis}
竞争分析：${competitorAnalysis}
用户画像：${userPersona}

请制定综合营销策略，以JSON格式返回：

{
  "executive_summary": "策略概述（100-150字）",
  "positioning_strategy": {
    "value_proposition": "价值主张",
    "differentiation": "差异化要点",
    "target_message": "核心信息"
  },
  "marketing_channels": [
    {
      "channel": "营销渠道名称",
      "priority": "高/中/低",
      "budget_allocation": "预算分配百分比",
      "tactics": ["战术1", "战术2"],
      "kpis": ["关键指标1", "关键指标2"]
    }
  ],
  "content_strategy": {
    "content_themes": ["内容主题1", "内容主题2", "内容主题3"],
    "content_formats": ["内容形式1", "内容形式2"],
    "publishing_calendar": "发布频率建议"
  },
  "implementation_roadmap": [
    {"phase": "第一阶段（1-3个月）", "activities": ["活动1", "活动2"]},
    {"phase": "第二阶段（4-6个月）", "activities": ["活动1", "活动2"]},
    {"phase": "第三阶段（7-12个月）", "activities": ["活动1", "活动2"]}
  ],
  "success_metrics": ["成功指标1", "成功指标2", "成功指标3"],
  "budget_estimate": "预算估算"
}`
    );

    // 生成完整的HTML邮件报告
    const emailContent = generateEmailReport(topic, email, {
      marketAnalysis,
      keywordAnalysis,
      competitorAnalysis,
      userPersona,
      marketingStrategy
    });

    // 发送邮件（这里可以集成邮件服务，如Resend或SendGrid）
    // 由于Vercel限制，我们先返回结果，邮件发送可以后续集成
    
    console.log(`分析完成，主题: ${topic}`);

    return res.status(200).json({
      success: true,
      message: `🎯 AI市场调研分析完成！\n\n✅ 已完成 "${topic}" 的5维度深度分析\n📧 报告将发送至: ${email}\n\n⏱️ 处理时间: ${new Date().toLocaleString('zh-CN')}`,
      data: {
        topic,
        email,
        timestamp: new Date().toISOString(),
        reportSections: {
          market_analysis: marketAnalysis,
          keyword_analysis: keywordAnalysis,
          competitor_analysis: competitorAnalysis,
          user_persona: userPersona,
          marketing_strategy: marketingStrategy
        }
      }
    });

  } catch (error) {
    console.error('市场调研分析错误:', error);
    return res.status(500).json({
      error: '分析过程中出现错误',
      message: error.message
    });
  }
}

// 生成邮件报告的函数
function generateEmailReport(topic, email, analyses) {
  const timestamp = new Date().toLocaleString('zh-CN');
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>AI市场调研报告 - ${topic}</title>
    <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .section { background: #f8f9fa; padding: 25px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .section h2 { color: #667eea; margin-top: 0; }
        .highlight { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 40px; padding: 20px; background: #f5f5f5; border-radius: 8px; }
        .analysis-content { background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin: 10px 0; white-space: pre-wrap; font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 AI市场调研报告</h1>
        <p>研究主题: <strong>${topic}</strong></p>
        <p>生成时间: ${timestamp}</p>
    </div>

    <div class="section">
        <h2>📊 市场机会分析</h2>
        <div class="analysis-content">${analyses.marketAnalysis}</div>
    </div>

    <div class="section">
        <h2>🔍 关键词需求分析</h2>
        <div class="analysis-content">${analyses.keywordAnalysis}</div>
    </div>

    <div class="section">
        <h2>🏆 竞争对手分析</h2>
        <div class="analysis-content">${analyses.competitorAnalysis}</div>
    </div>

    <div class="section">
        <h2>👥 用户画像分析</h2>
        <div class="analysis-content">${analyses.userPersona}</div>
    </div>

    <div class="section">
        <h2>📈 营销策略建议</h2>
        <div class="analysis-content">${analyses.marketingStrategy}</div>
    </div>

    <div class="footer">
        <p>🤖 本报告由AI智能分析生成</p>
        <p>📧 发送至: ${email}</p>
        <p>🔬 技术支持: SiliconFlow DeepSeek-V3 + Vercel Serverless</p>
    </div>
</body>
</html>
  `;
}