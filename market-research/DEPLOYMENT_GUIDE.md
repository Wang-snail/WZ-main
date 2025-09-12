# 一键AI市场调研系统 - 完整部署指南

## 🎯 系统概览

本系统实现了一个完全自动化的AI市场调研服务：
- **前端**：用户友好的网页界面
- **后端**：n8n工作流自动化处理  
- **AI引擎**：Google Gemini Pro进行深度分析
- **交付**：通过邮件发送完整的调研报告

**用户体验**：输入产品名称 → 点击分析 → 3-5分钟后收到专业报告

## 🚀 快速开始（推荐流程）

### 总体部署顺序
1. ✅ 准备必要的账号和服务
2. ✅ 部署n8n后端到Render.com  
3. ✅ 配置Google Gemini API
4. ✅ 导入和配置工作流
5. ✅ 配置邮件发送服务
6. ✅ 部署前端到GitHub Pages
7. ✅ 端到端测试

## 📋 前置准备清单

### 需要注册的账号
- [ ] **Google账号**（用于Gemini API）
- [ ] **Render.com账号**（用于部署n8n）
- [ ] **GitHub账号**（用于托管前端页面）
- [ ] **Gmail账号**（用于发送报告，可与Google账号相同）

### 需要准备的信息
- [ ] Google Gemini API密钥
- [ ] Gmail应用专用密码  
- [ ] Render.com项目名称
- [ ] GitHub仓库名称

## 📦 第一步：部署n8n后端

### 1.1 在Render.com部署n8n

详细步骤请参考：[Render部署指南](./deploy/render-deploy-guide.md)

**快速操作**：
1. 访问 [render.com](https://render.com)，用GitHub登录
2. 点击 "New +" → "Web Service"
3. 选择 "Deploy an existing image from a registry"
4. 配置信息：
   - **Image URL**: `n8nio/n8n:latest`
   - **Service Name**: `ai-market-research`（可自定义）
   - **Region**: 选择离你最近的区域
   - **Instance Type**: Free

5. 添加环境变量（**关键**）：
```bash
GENERIC_TIMEZONE=Asia/Shanghai
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_password
WEBHOOK_URL=https://ai-market-research.onrender.com/
N8N_PROTOCOL=https
N8N_HOST=ai-market-research.onrender.com
N8N_PORT=5678
```

6. 点击 "Create Web Service"，等待部署完成（约5-10分钟）

### 1.2 验证部署
1. 部署完成后，访问生成的URL（如：`https://ai-market-research.onrender.com`）
2. 使用设置的用户名密码登录
3. 看到n8n欢迎界面表示部署成功

## 🤖 第二步：配置Google Gemini API

详细步骤请参考：[Gemini API配置指南](./config/gemini-api-setup.md)

**快速操作**：
1. 访问 [Google AI Studio](https://aistudio.google.com/)
2. 登录后，点击 "API keys" → "Create API key"
3. 复制生成的API密钥（格式：`AIzaSyXXXXXXXXXXXXX...`）
4. 在n8n中添加凭据：
   - 点击右上角头像 → "Credentials" → "Add Credential"
   - 搜索并选择 "Google Gemini API"
   - 输入凭据名称和API密钥
   - 保存并验证连接

## ⚡ 第三步：导入和配置工作流

### 3.1 导入工作流
1. 在n8n主界面，点击 "Import from file"
2. 选择 [market-research-workflow.json](./n8n-workflows/market-research-workflow.json) 文件
3. 工作流成功导入后会显示完整的节点流程

### 3.2 配置所有Gemini节点
需要配置以下5个Google Gemini节点：
1. **市场机会分析** - 双击节点，选择Gemini凭据，选择模型 "gemini-pro"
2. **关键词需求分析** - 同上配置
3. **竞争对手分析** - 同上配置  
4. **用户画像分析** - 同上配置
5. **营销策略制定** - 同上配置

### 3.3 获取Webhook URL
1. 双击 "接收研究请求" 节点
2. 复制 "Production URL"，类似：`https://ai-market-research.onrender.com/webhook/market-research`
3. **保存这个URL，稍后前端配置需要用到**

## 📧 第四步：配置邮件发送

### 4.1 准备Gmail应用专用密码
1. 登录Gmail，进入 [Google账户安全设置](https://myaccount.google.com/security)
2. 启用两步验证（如果未启用）
3. 在 "登录 Google" → "应用专用密码" 中生成新密码
4. 选择 "邮件" 应用，生成16位密码（如：`abcd efgh ijkl mnop`）

### 4.2 在n8n中配置Gmail凭据
1. 在n8n凭据页面，添加 "Gmail" 凭据
2. 填写信息：
   - **Email**: 你的Gmail地址
   - **Password**: 上一步生成的应用专用密码（不是常规密码！）

### 4.3 配置邮件节点
1. 双击工作流中的 "发送邮件报告" 节点
2. 选择刚创建的Gmail凭据
3. 确认发件人邮箱地址正确

## 🌐 第五步：部署前端到GitHub Pages

### 5.1 创建GitHub仓库
1. 登录GitHub，创建新仓库
2. 仓库名建议：`ai-market-research`
3. 设置为 Public（GitHub Pages免费版要求）

### 5.2 上传前端文件
1. 将 [前端文件](./frontend/index.html) 上传到仓库根目录
2. 重命名为 `index.html`（如果不是的话）

### 5.3 配置Webhook URL
编辑 `index.html` 文件，找到这一行：
```javascript
WEBHOOK_URL: 'https://your-n8n-service.onrender.com/webhook/market-research',
```
替换为你的实际webhook URL，例如：
```javascript
WEBHOOK_URL: 'https://ai-market-research.onrender.com/webhook/market-research',
```

### 5.4 启用GitHub Pages
1. 在仓库设置中，找到 "Pages" 部分
2. Source选择 "Deploy from a branch"
3. Branch选择 "main"，目录选择 "/ (root)"
4. 点击 "Save"

### 5.5 获取网站URL
几分钟后，你的网站将可以通过类似以下URL访问：
`https://your-username.github.io/ai-market-research/`

## 🧪 第六步：端到端测试

### 6.1 激活工作流
1. 在n8n工作流编辑器中，确保右上角 "Active" 开关已开启
2. 点击 "Save" 保存工作流

### 6.2 功能测试
1. 访问你的前端网站
2. 输入测试数据：
   - **研究主题**: "智能宠物喂食器"
   - **邮箱**: 你的测试邮箱
3. 点击 "开始AI分析"
4. 观察页面反馈，应显示成功提交的消息

### 6.3 验证后端处理
1. 在n8n中查看 "Executions" 页面
2. 找到最新的执行记录，检查是否所有节点都成功运行
3. 如有错误，点击查看详细日志

### 6.4 验证邮件接收
1. 等待3-5分钟
2. 检查邮箱（包括垃圾邮件文件夹）
3. 应收到包含完整市场调研报告的邮件

## 🎉 完成部署！

如果所有测试都通过，恭喜你！系统已成功部署。

## 📈 系统监控和优化

### 性能监控
- **n8n执行日志**：定期检查工作流执行情况
- **Render监控**：查看服务运行状态和资源使用
- **API配额监控**：在Google AI Studio监控API使用量

### 成本优化
- **Render免费额度**：750小时/月，15分钟无活动后休眠
- **Gemini免费额度**：60请求/分钟，1500请求/天
- **GitHub Pages**：完全免费

### 扩展建议
1. **自定义域名**：为前端配置自定义域名
2. **缓存机制**：对相似查询实现缓存以节省API调用
3. **用户分析**：集成Google Analytics追踪用户行为
4. **报告模板**：根据行业差异定制报告模板

## ❗ 故障排除

### 常见问题

1. **前端提交后无响应**
   - 检查浏览器开发者工具的Console和Network标签
   - 确认WEBHOOK_URL配置正确
   - 检查CORS设置（n8n默认允许跨域请求）

2. **n8n工作流执行失败**  
   - 查看Executions页面的错误详情
   - 检查Gemini API配额是否用完
   - 验证所有凭据配置是否正确

3. **邮件发送失败**
   - 确认使用应用专用密码，不是常规密码
   - 检查Gmail账户是否启用两步验证
   - 验证SMTP设置

4. **Render服务休眠**
   - 免费版会在15分钟无活动后休眠
   - 首次唤醒需要30-60秒
   - 考虑使用付费计划避免休眠

5. **API配额超限**
   - 检查Google AI Studio的使用统计
   - 等待配额重置（通常按分钟和天重置）
   - 考虑升级到付费计划

### 调试工具

1. **浏览器开发者工具**
   ```
   F12 → Console 查看JavaScript错误
   F12 → Network 查看网络请求状态
   ```

2. **n8n执行日志**
   ```
   Executions → 点击具体执行 → 查看每个节点的输入输出
   ```

3. **Render服务日志**
   ```
   Render控制面板 → 选择服务 → Logs 查看实时日志
   ```

## 🔒 安全最佳实践

1. **API密钥保护**
   - 定期轮换API密钥
   - 不要在前端代码中暴露敏感信息
   - 使用环境变量存储密钥

2. **n8n访问控制**
   - 使用强密码
   - 考虑启用IP白名单
   - 定期更新n8n版本

3. **邮件安全**
   - 使用专门的邮箱账户发送报告
   - 定期更新应用专用密码
   - 监控异常登录活动

## 📞 技术支持

如遇到问题：
1. 查阅本文档的故障排除部分
2. 检查系统日志和错误信息  
3. 参考n8n官方文档和社区
4. 联系技术支持团队

---

**🎊 部署成功！**

你现在拥有了一个功能完整的AI市场调研系统！

用户现在可以通过你的网站快速获取专业的市场调研报告，包括：
- 🎯 市场机会与规模分析
- 🔍 关键词与搜索需求洞察  
- 🏆 竞争对手深度分析
- 👥 目标用户画像构建
- 📈 营销策略与执行建议

---
**创建时间**: 2025-01-12  
**系统版本**: v1.0  
**技术栈**: n8n + Google Gemini Pro + Render.com + GitHub Pages