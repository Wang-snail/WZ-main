# Vercel 部署问题排查与解决指南

## 📋 目录
1. [常见部署问题](#常见部署问题)
2. [问题排查步骤](#问题排查步骤)
3. [解决方案](#解决方案)
4. [预防措施](#预防措施)
5. [常用命令](#常用命令)

---

## 🔍 常见部署问题

### 问题 1：代码已推送但网站未更新

**症状**：
- Git 推送成功
- Vercel 显示部署成功
- 但访问域名时看到的仍是旧版本

**根本原因**：
1. **域名别名未更新** - 域名指向旧的部署实例
2. **多项目冲突** - 存在多个 Vercel 项目，域名指向了错误的项目
3. **vercel.json 配置错误** - 阻止了部署的完成

---

## 🛠️ 问题排查步骤

### 第 1 步：检查最近的提交

```bash
# 查看最近的 Git 提交
git log --oneline -5

# 确认代码已推送到远程
git status
```

### 第 2 步：检查 Vercel 项目列表

```bash
# 列出所有 Vercel 项目
vercel ls --prod

# 查看项目输出示例：
# Age     Deployment                                               Status
# 6m      https://project-abc123.vercel.app                        ● Ready
```

**关键信息**：
- 查看最新部署的时间（Age）
- 确认部署状态（Status 应为 ● Ready）

### 第 3 步：检查域名指向

```bash
# 检查域名当前指向的部署
vercel inspect https://www.wsnail.com

# 查看域名列表
vercel domains ls
```

**关键输出**：
```
General
  name    wz-main
  status  ● Ready
  url     https://old-deployment.vercel.app
  created Wed Sep 24 2025 [21d ago]  # ⚠️ 注意创建时间

Aliases
  ╶ https://www.wsnail.com
  ╶ https://wsnail.com
```

⚠️ **如果 `created` 时间很久以前，说明域名指向旧部署！**

### 第 4 步：检查 vercel.json 配置

```bash
# 尝试手动部署，查看错误信息
vercel --prod --yes
```

**常见错误**：
```
Error: Header at index 1 has invalid `source` pattern "/(.*\.(js|css|html))".
```

这说明 `vercel.json` 配置有语法错误。

---

## ✅ 解决方案

### 方案 1：重新分配域名别名（最常用）

当域名指向旧部署时使用此方法。

```bash
# 1. 获取最新部署的 URL
vercel ls --prod

# 输出示例：
# https://project-new123.vercel.app

# 2. 将主域名指向新部署
vercel alias set project-new123.vercel.app wsnail.com

# 3. 将 www 域名指向新部署
vercel alias set project-new123.vercel.app www.wsnail.com

# 4. 验证更新
vercel inspect https://www.wsnail.com
```

**预期结果**：
```
> Success! https://wsnail.com now points to https://project-new123.vercel.app
```

### 方案 2：修复 vercel.json 配置错误

如果遇到配置错误：

**错误配置示例**：
```json
{
  "headers": [
    {
      "source": "/(.*\\.(js|css|html))",  // ❌ 错误：转义字符问题
      "headers": [...]
    }
  ]
}
```

**正确配置**：
```json
{
  "headers": [
    {
      "source": "/(.*)",  // ✅ 正确：简化模式
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

**修复步骤**：
```bash
# 1. 编辑 vercel.json 文件
vim vercel.json  # 或使用其他编辑器

# 2. 提交更改
git add vercel.json
git commit -m "🔧 修复 vercel.json 配置"
git push origin main

# 3. 手动触发部署
vercel --prod --yes
```

### 方案 3：强制触发新部署

当 GitHub 推送未触发 Vercel 自动部署时：

```bash
# 方法 1：使用 Vercel CLI
vercel --prod --yes

# 方法 2：更新触发文件并推送
echo "# Force deploy - $(date)" > .vercel-redeploy
git add .vercel-redeploy
git commit -m "🚀 强制触发 Vercel 部署"
git push origin main
```

### 方案 4：清除 CDN 缓存

域名更新后可能需要时间传播：

```bash
# 使用强制刷新访问网站
# Chrome/Firefox: Ctrl + Shift + R (Windows/Linux)
# Chrome/Firefox: Cmd + Shift + R (Mac)

# 或使用无痕模式测试
# Chrome: Ctrl + Shift + N
# Firefox: Ctrl + Shift + P
```

---

## 🛡️ 预防措施

### 1. 配置自动部署

在 Vercel 项目设置中确认：
- ✅ Git Integration 已启用
- ✅ Production Branch 设置为 `main`
- ✅ 自动部署已启用

### 2. 设置部署钩子

在 `vercel.json` 中添加：

```json
{
  "github": {
    "enabled": true,
    "autoAlias": true,
    "autoJobCancelation": true
  }
}
```

### 3. 监控部署状态

使用 Vercel CLI 查看部署历史：

```bash
# 查看最近 10 次部署
vercel ls

# 查看特定部署的详细信息
vercel inspect <deployment-url>
```

### 4. 版本验证脚本

创建一个脚本来验证部署版本：

```bash
#!/bin/bash
# scripts/verify-deployment.sh

DOMAIN="https://www.wsnail.com"
EXPECTED_VERSION="v2.0.0"  # 从 package.json 读取

echo "🔍 验证部署版本..."

# 检查版本（假设在页面中包含版本信息）
DEPLOYED_VERSION=$(curl -s $DOMAIN | grep -oP 'version":\s*"\K[^"]+' || echo "unknown")

if [ "$DEPLOYED_VERSION" == "$EXPECTED_VERSION" ]; then
    echo "✅ 部署验证成功！版本：$DEPLOYED_VERSION"
    exit 0
else
    echo "❌ 部署版本不匹配！"
    echo "   期望：$EXPECTED_VERSION"
    echo "   实际：$DEPLOYED_VERSION"
    exit 1
fi
```

---

## 📚 常用命令速查

### 查看状态

```bash
# 查看项目列表
vercel projects ls

# 查看生产环境部署
vercel ls --prod

# 查看所有部署
vercel ls

# 检查特定 URL
vercel inspect https://www.wsnail.com

# 查看域名
vercel domains ls
```

### 部署操作

```bash
# 部署到生产环境
vercel --prod

# 部署到预览环境
vercel

# 自动确认部署
vercel --prod --yes

# 强制重新构建
vercel --prod --force
```

### 别名管理

```bash
# 设置别名
vercel alias set <deployment-url> <domain>

# 删除别名
vercel alias rm <domain>

# 列出所有别名
vercel alias ls
```

### 日志查看

```bash
# 查看构建日志
vercel logs <deployment-url>

# 实时查看日志
vercel logs <deployment-url> --follow
```

---

## 🔄 完整部署流程

### 标准流程（推荐）

```bash
# 1. 本地开发和测试
npm run dev
npm run build
npm run test

# 2. 提交代码
git add .
git commit -m "✨ 新功能描述"
git push origin main

# 3. 等待 Vercel 自动部署（1-3分钟）

# 4. 验证部署
vercel inspect https://www.wsnail.com

# 5. 如果域名未更新，手动分配别名
vercel ls --prod  # 获取最新部署 URL
vercel alias set <new-deployment-url> wsnail.com
vercel alias set <new-deployment-url> www.wsnail.com
```

### 紧急修复流程

```bash
# 1. 快速修复代码
git add .
git commit -m "🐛 紧急修复"
git push origin main

# 2. 立即手动触发部署
vercel --prod --yes

# 3. 实时监控构建
# 在 Vercel 控制台查看构建日志

# 4. 验证修复
curl https://www.wsnail.com | grep "关键内容"
```

---

## 📊 故障排查清单

当遇到部署问题时，按以下顺序检查：

- [ ] 1. Git 代码已推送到 main 分支
- [ ] 2. Vercel 项目中有新的部署记录
- [ ] 3. 最新部署状态为 "Ready"（绿点）
- [ ] 4. 域名别名指向最新部署
- [ ] 5. vercel.json 配置正确无误
- [ ] 6. 构建命令执行成功
- [ ] 7. 清除浏览器缓存
- [ ] 8. CDN 缓存已更新（等待 5-10 分钟）

---

## 💡 最佳实践

1. **使用 Vercel CLI 进行关键部署**
   - Git push 可能因各种原因失败
   - CLI 部署更可控，能实时看到输出

2. **保持项目配置简洁**
   - vercel.json 只包含必要配置
   - 避免复杂的正则表达式

3. **监控部署通知**
   - 在 Vercel 项目设置中配置 Slack/Email 通知
   - 及时发现部署失败

4. **定期清理旧部署**
   ```bash
   # Vercel 会自动保留最近 100 个部署
   # 可以在控制台手动删除不需要的
   ```

5. **使用环境变量**
   - 敏感信息不要写在代码中
   - 在 Vercel 项目设置中配置环境变量

---

## 🆘 当一切都失败时

如果以上所有方法都不起作用：

1. **联系 Vercel 支持**
   - https://vercel.com/support

2. **检查 Vercel 状态页**
   - https://www.vercel-status.com/

3. **重新链接项目**
   ```bash
   rm -rf .vercel
   vercel link
   vercel --prod
   ```

4. **创建新的 Vercel 项目**
   - 作为最后的手段
   - 在 Vercel 控制台创建新项目
   - 重新配置域名

---

## 📝 本次问题记录（2025-10-15）

### 问题描述
- 代码已推送到 GitHub
- Vercel 显示部署成功
- 访问 www.wsnail.com 仍显示旧版本

### 根本原因
1. vercel.json 配置有误，导致初始部署失败
2. 修复后新部署创建在 `wsnail-ai-tools-platform` 项目
3. 但域名仍指向 `wz-main` 项目的旧部署（21天前）

### 解决步骤
```bash
# 1. 修复 vercel.json
vim vercel.json  # 修复正则表达式

# 2. 手动触发部署
vercel --prod --yes

# 3. 重新分配域名别名
vercel alias set wsnail-ai-tools-platform-dwubh2prj.vercel.app wsnail.com
vercel alias set wsnail-ai-tools-platform-dwubh2prj.vercel.app www.wsnail.com
```

### 预防措施
- 每次部署后检查域名指向
- 保持 vercel.json 配置简洁
- 使用 CLI 部署重要更新

---

**文档创建时间**：2025-10-15
**最后更新时间**：2025-10-15
**维护者**：开发团队
