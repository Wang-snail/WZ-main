# GitHub Codespaces 部署方案

## ☁️ 使用GitHub Codespaces

### 免费额度
- ✅ **每月120小时**
- ✅ **2核CPU、4GB RAM**
- ✅ **完全免费**（GitHub账户默认包含）

### 部署步骤
1. **创建GitHub仓库**
2. **启动Codespace**
3. **运行Docker命令启动n8n**
4. **使用Codespace的端口转发功能**

### 命令
```bash
# 在Codespace中运行
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e GENERIC_TIMEZONE="Asia/Shanghai" \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=SiliconFlow2024! \
  n8nio/n8n
```

### 优势
- ✅ 完全免费
- ✅ 无需本地安装
- ✅ 自动提供公网URL
- ✅ 24/7运行（在免费时间内）