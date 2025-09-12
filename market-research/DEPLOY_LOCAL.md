# 本地部署方案 - 完全免费

## 🏠 本地Docker部署n8n

### 第一步：安装Docker
```bash
# 如果没有Docker，先安装
brew install docker
```

### 第二步：启动n8n容器
```bash
# 创建数据目录
mkdir -p ~/.n8n

# 运行n8n容器
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e GENERIC_TIMEZONE="Asia/Shanghai" \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=SiliconFlow2024! \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 第三步：访问n8n
- 打开：http://localhost:5678
- 登录：admin / SiliconFlow2024!

### 第四步：配置内网穿透（用于接收Webhook）
```bash
# 安装ngrok
brew install ngrok

# 创建隧道
ngrok http 5678
```

### 优势：
- ✅ 完全免费
- ✅ 数据在本地，更安全
- ✅ 性能更好，无休眠问题

### 劣势：
- ⚠️ 需要电脑保持运行
- ⚠️ 需要配置内网穿透