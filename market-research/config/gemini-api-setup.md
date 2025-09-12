# Google Gemini Pro API 配置指南

## 第一步：获取Google Gemini API密钥

### 1.1 访问Google AI Studio
1. 打开浏览器，访问 [Google AI Studio](https://aistudio.google.com/)
2. 使用您的Google账号登录

### 1.2 创建API密钥
1. 登录后，点击左侧菜单中的 "API keys"
2. 点击 "Create API key" 按钮
3. 选择一个现有的Google Cloud项目，或创建新项目
4. API密钥会自动生成，格式类似：`AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
5. **重要**：立即复制并安全保存这个API密钥

### 1.3 验证API可用性
1. 在API keys页面，确认您的密钥状态为"Active"
2. 检查配额限制（免费版本通常有每分钟60次请求限制）

## 第二步：在n8n中配置Gemini凭据

### 2.1 访问n8n管理界面
1. 打开您的n8n实例（如：`https://your-service.onrender.com`）
2. 使用管理员账号登录

### 2.2 添加Google Gemini凭据
1. 在n8n界面中，点击右上角的用户头像
2. 选择 "Credentials" 进入凭据管理页面
3. 点击 "Add Credential" 按钮
4. 在搜索框中输入 "Google"，选择 "Google Gemini API"
5. 填写凭据信息：
   - **Credential Name**: 输入一个描述性名称，如 "Gemini Pro API"
   - **API Key**: 粘贴您在步骤1.2中获取的API密钥
6. 点击 "Save" 保存凭据

### 2.3 测试连接
1. 保存凭据后，系统会自动测试连接
2. 如果显示绿色的 "Connected" 状态，说明配置成功
3. 如果显示错误，请检查API密钥是否正确复制

## 第三步：配置工作流中的Gemini节点

### 3.1 导入工作流
1. 在n8n主界面，点击 "Import from file" 或 "Import from URL"
2. 选择我们提供的 `market-research-workflow.json` 文件
3. 工作流导入成功后，您会看到多个节点

### 3.2 配置每个Gemini节点
工作流中有5个Google Gemini节点需要配置：

1. **市场机会分析** 节点
   - 双击节点打开设置
   - 在 "Credentials" 下拉菜单中选择刚才创建的凭据
   - Model 选择 "gemini-pro"
   - 点击 "Save" 保存

2. **关键词需求分析** 节点
   - 重复上述步骤，选择相同的凭据

3. **竞争对手分析** 节点
   - 重复配置步骤

4. **用户画像分析** 节点  
   - 重复配置步骤

5. **营销策略制定** 节点
   - 重复配置步骤

### 3.3 测试单个节点
1. 选择第一个Gemini节点 "市场机会分析"
2. 点击节点上的 "Test step" 按钮
3. 在弹出的测试界面中输入测试数据：
   ```json
   {
     "body": {
       "topic": "智能宠物喂食器"
     }
   }
   ```
4. 点击 "Run test"，如果配置正确，您应该看到AI生成的分析结果

## 第四步：配置邮件发送功能

### 4.1 准备Gmail账户
1. 登录您的Gmail账户
2. 启用两步验证（如果尚未启用）
3. 生成应用专用密码：
   - 访问 [Google账户安全设置](https://myaccount.google.com/security)
   - 在 "登录 Google" 部分找到 "应用专用密码"
   - 选择 "邮件" 和您的设备类型
   - Google会生成一个16位的密码（格式：xxxx xxxx xxxx xxxx）
   - 保存这个密码，它将用于n8n的SMTP配置

### 4.2 配置Gmail凭据
1. 在n8n凭据页面，添加新的 "Gmail" 凭据
2. 填写以下信息：
   - **Credential Name**: "Gmail SMTP"
   - **Email**: 您的Gmail地址
   - **Password**: 使用步骤4.1中生成的应用专用密码（不是您的常规密码）
3. 保存凭据

### 4.3 配置邮件发送节点
1. 在工作流中找到 "发送邮件报告" 节点
2. 双击打开设置
3. 选择刚才创建的Gmail凭据
4. 确认发件人邮箱地址正确
5. 保存设置

## 第五步：最终测试

### 5.1 激活工作流
1. 在工作流编辑器中，确保右上角的 "Active" 开关已打开
2. 点击 "Save" 保存工作流

### 5.2 获取Webhook URL
1. 双击 "接收研究请求" 节点
2. 复制显示的 "Production URL"，格式类似：
   `https://your-service.onrender.com/webhook/market-research`
3. 这个URL需要在前端代码中配置

### 5.3 端到端测试
1. 更新前端代码中的 `WEBHOOK_URL` 配置
2. 使用前端界面提交一个测试请求
3. 检查n8n的执行日志，确认每个步骤都成功执行
4. 检查邮箱，确认收到了完整的市场调研报告

## 费用和配额说明

### Google Gemini Pro API配额
- **免费额度**：每分钟60次请求，每天1500次请求
- **付费计划**：如需更高配额，可升级到付费计划
- **监控使用量**：在Google AI Studio中可查看API使用统计

### 成本估算
- 每次完整的市场调研需要调用5次Gemini API
- 按免费配额计算，每天最多可处理约300个调研请求
- 如果超出免费配额，单次API调用费用约为$0.001-$0.002

## 故障排除

### 常见问题

1. **API密钥无效**
   - 确认API密钥完整复制，没有多余空格
   - 检查Google AI Studio中密钥状态
   - 尝试重新生成API密钥

2. **请求失败 (401 Unauthorized)**
   - API密钥可能已过期或被撤销
   - 检查Google Cloud项目是否正常
   - 确认API服务已启用

3. **请求失败 (429 Too Many Requests)**
   - 超出了免费配额限制
   - 等待一段时间后重试
   - 考虑升级到付费计划

4. **邮件发送失败**
   - 检查Gmail应用专用密码是否正确
   - 确认Gmail账户启用了两步验证
   - 检查SMTP设置是否正确

5. **AI响应格式错误**
   - Gemini有时可能返回非JSON格式
   - 可以在工作流中添加错误处理节点
   - 调整prompt以更明确要求JSON格式输出

### 调试技巧

1. **使用n8n日志**
   - 在执行页面查看详细的节点执行日志
   - 检查每个节点的输入和输出数据

2. **单步测试**
   - 逐个测试每个Gemini节点
   - 确保每个节点都能正确处理数据

3. **监控API使用量**
   - 定期检查Google AI Studio的使用统计
   - 避免超出免费配额限制

---

## 安全注意事项

1. **保护API密钥**
   - 不要在前端代码中暴露API密钥
   - 定期更新API密钥
   - 使用环境变量存储敏感信息

2. **邮件安全**
   - 使用应用专用密码，不要使用常规密码
   - 考虑使用专门的邮箱账户用于发送报告

3. **访问控制**
   - 为n8n设置强密码
   - 考虑启用IP白名单（Render付费功能）
   - 定期更新n8n到最新版本

完成以上配置后，您的AI市场调研系统就可以正常运行了！

---
创建时间: 2025-01-12
更新时间: 2025-01-12