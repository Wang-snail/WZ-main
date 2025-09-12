# Render.com 部署 n8n 详细指南

## 第一步：准备部署配置

### 1.1 创建 Dockerfile（可选，使用官方镜像更简单）
```dockerfile
# 使用官方n8n镜像
FROM n8nio/n8n:latest

# 设置时区
ENV GENERIC_TIMEZONE=Asia/Shanghai

# 设置工作目录
WORKDIR /data

# 暴露端口
EXPOSE 5678
```

### 1.2 环境变量配置
在Render.com中需要设置的环境变量：

```bash
# 基础配置
GENERIC_TIMEZONE=Asia/Shanghai
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_password_here

# Webhook配置
WEBHOOK_URL=https://your-service-name.onrender.com/
N8N_PROTOCOL=https
N8N_HOST=your-service-name.onrender.com
N8N_PORT=5678

# 数据库配置（可选，使用SQLite）
DB_TYPE=sqlite
DB_SQLITE_DATABASE=/data/database.sqlite

# 邮件配置
N8N_EMAIL_MODE=smtp
N8N_SMTP_HOST=smtp.gmail.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=your-gmail@gmail.com
N8N_SMTP_PASS=your-gmail-app-password
N8N_SMTP_SENDER=your-gmail@gmail.com
```

## 第二步：在Render.com部署

### 2.1 注册并登录Render.com
1. 访问 [render.com](https://render.com)
2. 使用GitHub账号注册登录

### 2.2 创建Web Service
1. 点击 "New +" -> "Web Service"
2. 选择 "Deploy an existing image from a registry"
3. 配置如下：
   - **Image URL**: `n8nio/n8n:latest`
   - **Service Name**: `market-research-n8n`（或你喜欢的名字）
   - **Region**: 选择离你最近的区域
   - **Instance Type**: Free（免费套餐）

### 2.3 设置环境变量
在"Environment"部分添加上面列出的所有环境变量，特别注意：
- 将 `your_secure_password_here` 替换为强密码
- 将 `your-service-name` 替换为你的实际服务名称
- 将Gmail相关信息替换为你的实际信息

### 2.4 高级设置
- **Port**: 5678
- **Health Check Path**: `/healthz`
- **Start Command**: 保持默认

## 第三步：部署和验证

### 3.1 开始部署
点击 "Create Web Service" 开始部署，等待5-10分钟。

### 3.2 获取服务URL
部署成功后，你会得到类似这样的URL：
`https://market-research-n8n.onrender.com`

### 3.3 首次访问设置
1. 访问你的n8n URL
2. 使用设置的用户名密码登录（admin/your_password）
3. 完成初始设置向导

## 注意事项

### 免费套餐限制
- Render免费套餐在15分钟无活动后会休眠
- 首次访问会有冷启动延迟（30-60秒）
- 每月750小时的运行时间

### 数据持久化
- 免费套餐不提供持久化磁盘
- 重启后工作流配置可能丢失
- 建议定期备份工作流JSON配置

### 安全建议
- 使用强密码
- 定期更新密码
- 考虑添加IP白名单（付费功能）

## 故障排除

### 常见问题
1. **部署失败**: 检查环境变量是否正确设置
2. **无法访问**: 检查端口是否设置为5678
3. **Webhook不工作**: 确保WEBHOOK_URL正确设置

### 日志查看
在Render控制面板中可以查看实时日志，用于调试问题。

---
创建时间: 2025-01-12
更新时间: 2025-01-12