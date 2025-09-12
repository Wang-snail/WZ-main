# 一键AI市场调研系统 - SiliconFlow版部署指南

## 🎯 系统概览

本系统使用SiliconFlow API替代Google Gemini，实现完全自动化的AI市场调研服务：
- **前端**：用户友好的网页界面
- **后端**：n8n工作流自动化处理  
- **AI引擎**：SiliconFlow API (DeepSeek-V3/Qwen3-32B)
- **交付**：通过邮件发送完整的调研报告

**您的API信息**：
- API密钥：sk-hwbvirmjuviwfyqbjqpmlebxetsdechtbyxmflziefipkbht
- API地址：https://api.siliconflow.cn/v1
- 推荐模型：deepseek-ai/DeepSeek-V3 或 Qwen/Qwen3-32B

## 🚀 快速部署流程

### 第一步：部署n8n后端到Render.com

1. **访问Render.com**
   ```
   打开：https://render.com
   使用GitHub账号登录
   ```

2. **创建Web服务**
   ```
   点击：New + → Web Service
   选择：Deploy an existing image from a registry
   Image URL: n8nio/n8n:latest
   Service Name: ai-market-research
   Region: Oregon（美国免费区域）
   Instance Type: Free
   ```

3. **配置环境变量**
   ```bash
   GENERIC_TIMEZONE=Asia/Shanghai
   N8N_BASIC_AUTH_ACTIVE=true
   N8N_BASIC_AUTH_USER=admin
   N8N_BASIC_AUTH_PASSWORD=MySecure123!
   WEBHOOK_URL=https://ai-market-research.onrender.com/
   N8N_PROTOCOL=https
   N8N_HOST=ai-market-research.onrender.com
   N8N_PORT=5678
   ```

4. **点击"Create Web Service"等待部署**（约5-10分钟）

### 第二步：配置SiliconFlow API凭据

1. **访问n8n管理界面**
   - 打开：`https://ai-market-research.onrender.com`
   - 登录：用户名`admin`，密码`MySecure123!`

2. **添加SiliconFlow API凭据**
   ```
   点击：右上角头像 → Credentials → Add Credential
   搜索：HTTP Header Auth
   Credential Name: siliconflow-api
   
   Header Name: Authorization
   Header Value: Bearer sk-hwbvirmjuviwfyqbjqpmlebxetsdechtbyxmflziefipkbht
   
   点击：Save
   ```

### 第三步：导入SiliconFlow工作流

1. **下载工作流文件**
   - 使用提供的 `market-research-workflow-siliconflow.json` 文件

2. **导入工作流**
   ```
   在n8n界面：Import from file
   选择：market-research-workflow-siliconflow.json
   点击：Import
   ```

3. **验证节点配置**
   - 确认所有HTTP Request节点都选择了 `siliconflow-api` 凭据
   - 检查API URL都是 `https://api.siliconflow.cn/v1/chat/completions`
   - 确认模型设置为 `deepseek-ai/DeepSeek-V3`

### 第四步：配置Gmail邮件发送

1. **生成Gmail应用专用密码**
   ```
   访问：https://myaccount.google.com/security
   启用：两步验证
   生成：应用专用密码（选择"邮件"类型）
   复制：16位密码（格式：abcd efgh ijkl mnop）
   ```

2. **在n8n中配置SMTP**
   ```
   Credentials → Add Credential → SMTP
   Credential Name: gmail-smtp
   
   Host: smtp.gmail.com
   Port: 587
   Security: STARTTLS
   Username: 你的Gmail地址
   Password: 16位应用专用密码
   ```

3. **配置邮件节点**
   - 双击"发送邮件报告"节点
   - 选择 `gmail-smtp` 凭据
   - 保存设置

### 第五步：激活并测试工作流

1. **激活工作流**
   ```
   确保右上角"Active"开关已开启
   点击"Save"保存工作流
   ```

2. **获取Webhook URL**
   ```
   双击"接收研究请求"节点
   复制Production URL：
   https://ai-market-research.onrender.com/webhook/market-research
   ```

3. **测试单个节点**（可选）
   ```
   选择第一个HTTP Request节点
   点击"Test step"
   输入测试数据：{"body": {"topic": "智能宠物喂食器"}}
   查看是否返回JSON格式的AI分析结果
   ```

### 第六步：部署前端到GitHub Pages

1. **创建GitHub仓库**
   ```
   仓库名：ai-market-research
   设置：Public
   ```

2. **上传前端文件**
   - 将 `frontend/index.html` 文件上传到仓库根目录
   - 确保WEBHOOK_URL已配置为你的实际n8n地址

3. **启用GitHub Pages**
   ```
   仓库设置 → Pages
   Source: Deploy from a branch
   Branch: main
   目录: / (root)
   ```

### 第七步：端到端测试

1. **访问前端网站**
   - URL：`https://your-username.github.io/ai-market-research/`

2. **提交测试请求**
   ```
   研究主题：智能宠物喂食器
   邮箱：你的测试邮箱
   点击：开始AI分析
   ```

3. **验证结果**
   - 前端显示提交成功
   - n8n执行日志显示所有节点成功
   - 3-5分钟后收到专业分析报告邮件

## ⚡ SiliconFlow API特点

### API配额和费用
- **DeepSeek-V3**：高性能推理，适合复杂分析
- **Qwen3-32B**：平衡性价比，适合常规分析  
- **并发支持**：支持同时处理多个请求
- **响应速度**：通常2-5秒返回结果

### 模型选择建议
```json
{
  "DeepSeek-V3": {
    "适用": "复杂市场分析，深度洞察",
    "优势": "推理能力强，分析更深入",
    "场景": "高价值产品调研"
  },
  "Qwen3-32B": {
    "适用": "常规市场调研，快速分析", 
    "优势": "响应速度快，成本较低",
    "场景": "批量调研，日常使用"
  }
}
```

## 🔧 故障排除

### 常见问题

1. **SiliconFlow API调用失败**
   - 检查API密钥是否正确
   - 确认Header格式：`Bearer your-api-key`
   - 验证API URL是否为 `https://api.siliconflow.cn/v1/chat/completions`

2. **AI响应格式错误**
   - DeepSeek-V3通常返回结构化JSON
   - 如遇格式问题，检查prompt是否明确要求JSON输出
   - 可在Code节点中添加JSON解析错误处理

3. **n8n节点执行超时**
   - SiliconFlow通常响应较快，检查网络连接
   - 可在HTTP Request节点中增加timeout设置

### 性能优化

1. **模型选择**
   ```javascript
   // 根据需求选择合适模型
   "deepseek-ai/DeepSeek-V3"     // 深度分析
   "Qwen/Qwen3-32B"            // 快速分析
   ```

2. **并发处理**
   - n8n支持并行处理多个AI请求
   - 可同时处理多个用户提交的调研请求

3. **缓存策略**（可选扩展）
   - 对相似主题的调研结果进行缓存
   - 减少重复API调用，节省成本

## ✅ 部署完成

**恭喜！你的SiliconFlow版AI市场调研系统已成功部署**

系统现在可以：
- 🎯 接收用户输入的产品/行业名称
- 🤖 使用SiliconFlow强大AI进行5步深度分析
- 📊 生成包含市场机会、关键词、竞争、用户画像、营销策略的专业报告
- 📧 自动发送HTML格式的详细分析报告

**技术栈**：
- 前端：GitHub Pages (免费)
- 后端：Render.com + n8n (免费750小时/月)
- AI：SiliconFlow API  
- 邮件：Gmail SMTP (免费)

**预期性能**：
- 响应时间：3-5分钟完成完整分析
- 并发能力：支持多用户同时使用
- 报告质量：专业级5维度深度分析

---
**部署时间**：2025-01-12  
**版本**：SiliconFlow v1.0  
**技术支持**：基于DeepSeek-V3和Qwen3-32B模型