# 🚀 5分钟手动部署指南

## 第一步：Render.com部署（2分钟）

### 直接点击一键部署链接
**复制以下URL到浏览器：**
```
https://render.com/deploy?repo=https://github.com/n8nio/n8n
```

### 或者手动创建：
1. **访问：** https://render.com
2. **点击：** New + → Web Service → Deploy an existing image
3. **填写：**
   ```
   Image URL: n8nio/n8n:latest
   Name: ai-market-research
   Region: Oregon (US West)
   Plan: Free
   ```

4. **环境变量（一次性复制粘贴）：**
```
GENERIC_TIMEZONE=Asia/Shanghai
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=SiliconFlow2024!
WEBHOOK_URL=https://ai-market-research.onrender.com/
N8N_PROTOCOL=https
N8N_HOST=ai-market-research.onrender.com
N8N_PORT=5678
```

5. **点击：** Create Web Service

## 第二步：配置SiliconFlow API（1分钟）

**部署完成后访问：** https://ai-market-research.onrender.com

1. **登录：** admin / SiliconFlow2024!
2. **添加凭据：** 右上角头像 → Credentials → Add Credential
3. **选择：** HTTP Header Auth
4. **配置：**
   ```
   Name: siliconflow-api
   Header Name: Authorization
   Header Value: Bearer sk-hwbvirmjuviwfyqbjqpmlebxetsdechtbyxmflziefipkbht
   ```

## 第三步：导入工作流（1分钟）

1. **点击：** Import from file
2. **选择文件：** market-research-workflow-siliconflow.json
3. **导入后激活工作流**
4. **复制Webhook URL：** 双击第一个节点获取URL

## 第四步：配置Gmail（1分钟）

1. **添加SMTP凭据：** Credentials → SMTP
2. **配置：**
   ```
   Host: smtp.gmail.com
   Port: 587  
   Username: 你的Gmail
   Password: Gmail应用专用密码
   ```

## 🎯 完成！

**测试URL：** https://ai-market-research.onrender.com/webhook/market-research

---

## 🔧 快速故障排除

**问题1：Render部署失败**
- 检查环境变量是否完整复制
- 确认服务名称没有冲突

**问题2：n8n无法访问**  
- 等待5-10分钟完全部署
- 检查服务状态是否Running

**问题3：API调用失败**
- 验证SiliconFlow密钥是否正确
- 检查HTTP Header Auth格式

**需要帮助？** 告诉我你在哪一步遇到问题！