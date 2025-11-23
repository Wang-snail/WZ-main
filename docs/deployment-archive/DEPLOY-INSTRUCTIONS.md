# 🚀 立即部署指南

## ⚠️ 重要提示

由于网络限制，无法通过 API 自动触发部署。请按以下步骤**手动触发部署**：

## 📋 快速部署步骤（2分钟完成）

### 方法 1: Vercel 控制台（最快，推荐）

1. **访问项目页面**
   ```
   https://vercel.com/snails-projects-d6eda891/wz-main
   ```

2. **触发重新部署**
   - 找到最上面的部署（21天前的那个）
   - 点击右侧的 **"⋯"** (三个点)菜单
   - 选择 **"Redeploy"**
   - 在弹窗中确认选择 **"Production"**
   - 点击 **"Redeploy"** 按钮

3. **等待部署完成**
   - 通常需要 2-3 分钟
   - 可以在页面上看到部署进度
   - 等待状态变为 **"Ready"** (绿色勾号)

4. **验证部署**
   - 访问 https://www.wsnail.com
   - 按 F12 打开控制台
   - 刷新页面 (Ctrl/Cmd + R)
   - 确认没有 "userProfile is not defined" 错误
   - 访问 https://www.wsnail.com/kajian-lessons
   - 确认页面正常显示

### 方法 2: 使用 Deploy Hook（一次性设置）

如果您经常需要手动部署，可以创建一个 Deploy Hook：

1. **创建 Hook**
   - 访问项目设置: https://vercel.com/snails-projects-d6eda891/wz-main/settings/git
   - 滚动到 "Deploy Hooks" 部分
   - 点击 "Create Hook"
   - 名称: `Manual Deploy`
   - 分支: `main`
   - 点击 "Create Hook"
   - 复制生成的 URL (类似 `https://api.vercel.com/v1/integrations/deploy/...`)

2. **触发部署**
   ```bash
   # 使用 curl 触发
   curl -X POST 'YOUR_HOOK_URL'

   # 或者直接在浏览器中访问这个 URL
   ```

3. **保存 Hook**
   - 将 Hook URL 保存到 `.env.local`:
     ```
     VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/...
     ```
   - 以后可以直接运行: `curl -X POST "$VERCEL_DEPLOY_HOOK"`

## ✅ 本次部署包含的修复

部署完成后，以下问题将被解决：

### 1. HomePage 错误修复
- **文件**: `src/pages/HomePage.tsx:211`
- **问题**: `ReferenceError: userProfile is not defined`
- **修复**: 将 `userId={userProfile?.userId}` 改为 `userId={undefined}`
- **影响**: 网站首页不再报错，正常加载

### 2. 卡吉安经验库功能
完整的功能现已可用：
- ✅ 经验列表页面: `/kajian-lessons`
- ✅ 经验详情页面: `/kajian-lessons/:id`
- ✅ 添加/编辑经验表单
- ✅ 本地数据持久化
- ✅ 5个示例数据
- ✅ 导航入口（顶部菜单栏）

### 3. 错误处理增强
- **文件**: `src/components/ErrorBoundary.tsx`
- **改进**: 生产环境显示友好的错误页面，并提供详细错误信息用于调试

### 4. 配置安全性
- **文件**: `src/utils/websiteConfig.ts`
- **改进**: 安全检查 `import.meta.env`，避免在特定环境下出错

## 🔄 长期解决方案：配置 GitHub 自动部署

为了避免每次都要手动触发，建议配置 GitHub 自动部署：

### 步骤

1. **访问项目设置**
   ```
   https://vercel.com/snails-projects-d6eda891/wz-main/settings/git
   ```

2. **检查 Git 集成**
   - 确认已连接到 GitHub 仓库: `Wang-snail/WZ-main`
   - 确认生产分支设置为: `main`

3. **启用自动部署**
   - 找到 "Git Integration" 部分
   - 确保启用了以下选项:
     - ✅ Automatically expose System Environment Variables
     - ✅ Ignored Build Step: 留空（不要勾选）
     - ✅ Auto Deploy: 启用

4. **测试自动部署**
   ```bash
   # 本地做一个小改动并推送
   echo "# Test $(date)" >> .vercel-redeploy
   git add .vercel-redeploy
   git commit -m "测试自动部署"
   git push origin main
   ```

   几秒钟后，Vercel 应该会自动开始新的部署。

## 📊 验证清单

部署完成后，请检查：

- [ ] 访问 https://www.wsnail.com 无错误
- [ ] 浏览器控制台无红色错误
- [ ] 首页正常显示所有内容
- [ ] 导航栏显示"经验库"入口
- [ ] 访问 /kajian-lessons 页面正常
- [ ] 可以看到 5 条示例数据
- [ ] 点击"添加经验"按钮，表单正常弹出
- [ ] 点击某条经验，详情页正常显示

## 🆘 如遇问题

如果部署后仍有问题：

1. **清除浏览器缓存**
   - Chrome: Ctrl + Shift + Delete
   - 选择"缓存的图片和文件"
   - 点击"清除数据"

2. **强制刷新页面**
   - Windows/Linux: Ctrl + Shift + R
   - Mac: Cmd + Shift + R

3. **使用无痕模式测试**
   - Chrome: Ctrl + Shift + N
   - 访问网站，看是否正常

4. **检查 Vercel 部署日志**
   - 在 Vercel 控制台查看部署详情
   - 查看构建日志，确认没有错误

5. **验证数据文件**
   - 访问 https://www.wsnail.com/data/kajian_lessons.json
   - 应该返回 JSON 数据，而不是 404

## 📞 项目信息

- **项目 ID**: `prj_OXALain1SCUD0EJtGviaB4yHNZMz`
- **团队 ID**: `team_W4MxdTuAtOWNfVacOgrWZok5`
- **GitHub**: https://github.com/Wang-snail/WZ-main
- **域名**: https://www.wsnail.com
- **Vercel**: https://vercel.com/snails-projects-d6eda891/wz-main

## 📝 最新提交

```
commit 048c13ce7accbc75e2260d5e2f4b89b15be653ca
Author: bingzi <bingzi@example.com>
Date: 2025-10-15 15:02:53

🚀 强制部署：修复 userProfile 错误
```

---

**创建时间**: 2025-10-15 15:20
**状态**: ⏳ 等待手动部署
**预计用时**: 2-3 分钟（部署） + 1分钟（验证）= 总共约 5 分钟
