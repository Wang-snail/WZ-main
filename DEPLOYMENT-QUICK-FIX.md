# 🚀 Vercel 部署快速修复指南

> **当网站推送后没有更新时，按此顺序操作**

## ⚡ 快速诊断（30秒）

```bash
# 1. 检查最新部署
vercel ls --prod

# 2. 检查域名指向
vercel inspect https://www.wsnail.com
```

**看这里** 👇

如果 `inspect` 显示的创建时间很久以前（如 21 天前），**说明域名指向了旧部署！**

---

## ✅ 三步快速修复

### 步骤 1：获取最新部署 URL

```bash
vercel ls --prod
```

复制输出中的 URL，例如：
```
https://project-abc123.vercel.app
```

### 步骤 2：重新分配域名

```bash
# 替换 <deployment-url> 为上面复制的 URL
vercel alias set <deployment-url> wsnail.com
vercel alias set <deployment-url> www.wsnail.com
```

### 步骤 3：验证

```bash
# 刷新浏览器，使用强制刷新
# Windows/Linux: Ctrl + Shift + R
# Mac: Cmd + Shift + R
```

或者：

```bash
# 使用命令验证
curl -I https://www.wsnail.com/kajian-lessons
# 应该返回 200 状态码
```

---

## 🔧 如果还是不行

### 问题：vercel.json 配置错误

**症状**：
```
Error: Header at index 1 has invalid `source` pattern
```

**快速修复**：

编辑 `vercel.json`，将：
```json
{
  "source": "/(.*\\.(js|css|html))"  // ❌ 错误
}
```

改为：
```json
{
  "source": "/(.*)"  // ✅ 正确
}
```

然后：
```bash
git add vercel.json
git commit -m "🔧 修复配置"
git push origin main
vercel --prod --yes
```

---

## 📋 完整排查清单

如果快速修复不起作用，按此清单检查：

- [ ] 代码已推送到 GitHub
- [ ] Vercel 有新的部署记录
- [ ] 最新部署状态是 "Ready"（绿点）
- [ ] 域名别名已更新
- [ ] 等待 2-3 分钟让 CDN 更新
- [ ] 清除浏览器缓存
- [ ] 使用无痕模式测试

---

## 📚 详细文档

完整的问题排查和解决方案，请查看：
- [docs/vercel-deployment-guide.md](./docs/vercel-deployment-guide.md)

---

## 💾 保存此命令序列

将来遇到部署问题，直接复制粘贴：

```bash
# 快速修复脚本
echo "🔍 检查部署状态..."
LATEST_URL=$(vercel ls --prod | grep -oP 'https://[^ ]+\.vercel\.app' | head -1)
echo "📦 最新部署: $LATEST_URL"

echo "🔗 更新域名别名..."
vercel alias set $LATEST_URL wsnail.com
vercel alias set $LATEST_URL www.wsnail.com

echo "✅ 完成！请刷新浏览器（Ctrl+Shift+R）"
```

---

**最后更新**：2025-10-15
