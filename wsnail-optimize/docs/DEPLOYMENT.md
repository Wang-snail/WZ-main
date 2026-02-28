# wsnail.com 部署文档

> **项目：** 跨境电商 AI 工具平台
> **部署平台：** Vercel
> **维护者：** 运维工程师 (wsnail-ops)
> **最后更新：** 2026-02-28

---

## 目录

1. [部署前准备](#部署前准备)
2. [Vercel 配置](#vercel-配置)
3. [环境变量配置](#环境变量配置)
4. [部署流程](#部署流程)
5. [回滚步骤](#回滚步骤)
6. [监控告警](#监控告警)
7. [故障排查](#故障排查)

---

## 部署前准备

### 1. 仓库准备

**GitHub 仓库：** 确保代码已推送到 GitHub 仓库

**分支策略：**
- `main` - 生产环境
- `develop` - 开发环境
- `feature/*` - 功能分支

### 2. 依赖检查

```bash
# 确保所有依赖已安装
npm install

# 本地构建测试
npm run build

# 运行测试
npm run lint
npm test
```

### 3. 数据库准备

**选项 A：Vercel Postgres (推荐)**
1. 在 Vercel 项目中添加 Postgres 数据库
2. 复制连接字符串
3. 配置到环境变量 `DATABASE_URL`

**选项 B：外部数据库**
1. 使用 Supabase / Neon / Railway
2. 获取连接字符串
3. 配置到环境变量 `DATABASE_URL`

**数据库迁移：**
```bash
# 生成 Prisma Client
npx prisma generate

# 推送数据库 Schema
npx prisma db push

# 或使用迁移（生产环境推荐）
npx prisma migrate deploy
```

---

## Vercel 配置

### 1. 连接 GitHub 仓库

**步骤：**
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入 GitHub 仓库
4. 选择 `wsnail-optimize` 目录

**配置：**
- **Framework Preset:** Next.js
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 2. 配置环境变量

**在 Vercel 项目设置中添加：**

| 变量名 | 说明 | 是否必需 | 示例值 |
|--------|------|----------|--------|
| `DATABASE_URL` | 数据库连接字符串 | ✅ 必需 | `postgresql://...` |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | ✅ 必需 | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | NextAuth URL | ✅ 必需 | `https://wsnail.com` |
| `NEXT_PUBLIC_SITE_URL` | 网站 URL | ✅ 必需 | `https://wsnail.com` |
| `SENTRY_DSN` | Sentry DSN | ⚪ 可选 | `https://...@sentry.io/...` |
| `SENTRY_AUTH_TOKEN` | Sentry Auth Token | ⚪ 可选 | `sntrys_...` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | ⚪ 可选 | `G-XXXXXXXXXX` |

### 3. 配置自定义域名

**步骤：**
1. 进入项目 Settings → Domains
2. 添加域名 `wsnail.com`
3. 配置 DNS 记录：
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. 等待 SSL 证书自动生成（Vercel 自动配置）

### 4. 配置自动部署

**设置：**
- **Production Branch:** `main`
- **Preview Branches:** `develop`, `feature/*`

**部署触发：**
- Push 到 `main` → 生产环境
- Push 到其他分支 → 预览环境
- Pull Request → 预览环境

---

## 环境变量配置

### 本地开发环境

创建 `.env.local` 文件（不要提交到 Git）：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 填入实际值。

### Vercel 生产环境

1. 进入项目 Settings → Environment Variables
2. 添加所有必需的环境变量
3. 选择适用的环境（Production / Preview / Development）

### 环境变量清单

```bash
# 必需变量（无默认值）
DATABASE_URL=          # 数据库连接
NEXTAUTH_SECRET=       # 认证密钥
NEXTAUTH_URL=          # 认证 URL

# 公开变量（可暴露）
NEXT_PUBLIC_SITE_URL=  # 网站 URL
NEXT_PUBLIC_APP_NAME=  # 应用名称

# 可选变量
SENTRY_DSN=            # 错误追踪
NEXT_PUBLIC_GA_ID=     # Google Analytics
```

---

## 部署流程

### 常规部署

**1. 开发环境部署**
```bash
# 推送到 develop 分支
git checkout develop
git merge feature/new-tool
git push origin develop

# Vercel 自动部署到预览环境
# 访问：https://wsnail-optimize-git-develop-xxx.vercel.app
```

**2. 生产环境部署**
```bash
# 1. 确保 develop 分支测试通过
git checkout develop
git pull origin develop

# 2. 合并到 main
git checkout main
git merge develop

# 3. 推送到 main
git push origin main

# 4. Vercel 自动部署到生产环境
# 访问：https://wsnail.com
```

### 数据库变更部署

**重要：** 数据库变更需要特殊处理！

```bash
# 1. 创建迁移
npx prisma migrate dev --name add_fba_calculator

# 2. 本地测试迁移
npx prisma migrate reset

# 3. 部署时执行迁移
# Vercel 会自动运行: npx prisma migrate deploy

# 4. 验证生产环境
npx prisma studio  # 检查数据库
```

### 部署前检查清单

- [ ] 本地构建成功 (`npm run build`)
- [ ] ESLint 检查通过 (`npm run lint`)
- [ ] 类型检查通过 (`npx tsc --noEmit`)
- [ ] 单元测试通过 (`npm test`)
- [ ] 数据库迁移已准备
- [ ] 环境变量已配置
- [ ] 回滚方案已准备
- [ ] 监控告警已配置

---

## 回滚步骤

### 方案 1：Vercel 一键回滚（最快）

**步骤：**
1. 登录 Vercel Dashboard
2. 进入项目 → Deployments
3. 找到之前的稳定版本
4. 点击 "Promote to Production"
5. 等待部署完成（约 30 秒）

### 方案 2：Git 回滚

```bash
# 1. 回滚到上一个 commit
git revert HEAD

# 2. 或者重置到指定 commit
git reset --hard <commit-hash>

# 3. 强制推送
git push origin main --force

# Vercel 自动重新部署
```

### 方案 3：数据库回滚

**警告：** 数据库回滚需要谨慎操作！

```bash
# 1. 查看迁移历史
npx prisma migrate status

# 2. 回滚迁移（手动）
npx prisma migrate resolve --rolled-back <migration-name>

# 3. 恢复数据库备份
# 使用 Vercel Postgres 备份功能
```

### 回滚后验证

- [ ] 网站可访问
- [ ] 核心功能正常
- [ ] 数据库连接正常
- [ ] 无错误日志
- [ ] 监控指标正常

---

## 监控告警

### Vercel Analytics

**配置：**
1. 进入项目 Settings → Analytics
2. 启用 Vercel Analytics
3. 添加集成代码（Next.js 自动集成）

**监控指标：**
- 页面访问量
- 性能指标 (FCP, LCP, TTI)
- 转化率
- 用户位置

### Sentry 错误追踪

**配置：**

1. 安装 Sentry SDK：
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

2. 配置 `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**告警规则：**
- 错误率 >1%
- 新错误类型
- 性能下降 >50%

### Uptime 监控

**选项 A：Vercel Analytics（内置）**
- 自动监控可用性
- 响应时间监控
- 地理分布监控

**选项 B：UptimeRobot（免费）**
1. 注册 [UptimeRobot](https://uptimerobot.com)
2. 添加 Monitor：`https://wsnail.com`
3. 配置告警（邮件 + 飞书）

**选项 C：Checkly**
1. 注册 [Checkly](https://checklyhq.com)
2. 创建 API 检查
3. 配置 Synthetics 监控

### Lighthouse CI

**GitHub Actions 自动运行：**
- 每次 Pull Request
- 每次 main 分支推送
- 性能预算检查

**性能预算：**
- First Contentful Paint: <2s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s
- Total Blocking Time: <300ms

### 告警通知

**飞书群告警：**
```bash
# Webhook URL
https://open.feishu.cn/open-apis/bot/v2/hook/xxx

# 配置告警规则
- 生产环境错误 → 立即通知
- 性能下降 >30% → 5分钟内通知
- 部署失败 → 立即通知
```

---

## 故障排查

### 常见问题

#### 1. 部署失败

**症状：** Vercel 部署时报错

**排查步骤：**
```bash
# 1. 查看构建日志
# Vercel Dashboard → Deployments → 点击失败部署 → Build Log

# 2. 本地复现
npm run build

# 3. 检查环境变量
# 确保所有必需变量已配置

# 4. 检查依赖版本
npm ls
```

**常见原因：**
- 环境变量缺失
- 依赖版本冲突
- 构建超时（Vercel 免费版 10 分钟）
- 内存不足

#### 2. 数据库连接失败

**症状：** 网站报错 "Database connection error"

**排查步骤：**
```bash
# 1. 检查连接字符串
echo $DATABASE_URL

# 2. 测试连接
npx prisma db push

# 3. 检查数据库状态
# Vercel Dashboard → Storage → Postgres → Activity
```

**解决方案：**
- 验证 `DATABASE_URL` 正确
- 检查数据库是否在线
- 验证网络访问权限

#### 3. 环境变量未生效

**症状：** 代码中读取的环境变量为 undefined

**排查步骤：**
```bash
# 1. 区分公开变量和私有变量
# NEXT_PUBLIC_* 变量可在浏览器访问
# 其他变量只能在服务端访问

# 2. 检查变量作用域
# Production / Preview / Development

# 3. 重新部署
# 环境变量变更后必须重新部署
```

#### 4. 性能下降

**症状：** 页面加载变慢，Lighthouse 评分下降

**排查步骤：**
```bash
# 1. 运行 Lighthouse
npx lighthouse https://wsnail.com

# 2. 查看 Vercel Analytics
# Dashboard → Analytics → Performance

# 3. 检查 Bundle 大小
npm run build
# 查看 .next/analyze 目录
```

**优化建议：**
- 启用图片优化
- 减少第三方脚本
- 启用 Edge Functions
- 配置 CDN 缓存

### 应急响应

**P0 故障响应（<15 分钟）：**
1. 立即评估影响范围
2. 执行快速回滚（Vercel 一键回滚）
3. 飞书群通知
4. 事后根因分析

**P1 故障响应（<1 小时）：**
1. 评估故障等级
2. 查看日志和监控
3. 制定修复方案
4. 执行修复或回滚

**P2/P3 故障：**
- 按正常流程处理
- 记录到待办事项
- 下个迭代修复

---

## 附录

### 相关链接

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Sentry Dashboard:** https://sentry.io

### 联系方式

- **运维工程师：** wsnail-ops (Agent)
- **飞书群：** wsnail.com 运维群
- **应急联系：** @贾维斯 (组长)

---

*文档版本：v1.0*
*最后更新：2026-02-28*
