# wsnail.com Vercel 配置清单

> **项目：** 跨境电商 AI 工具平台
> **部署平台：** Vercel
> **维护者：** 运维工程师 (wsnail-ops)
> **最后更新：** 2026-02-28

---

## 配置清单

### 1. 项目连接

- [x] GitHub 仓库已导入
- [ ] Vercel 项目已创建
- [ ] Git 集成已配置
- [ ] Webhook 已设置

**步骤：**
1. 登录 https://vercel.com/new
2. 导入 GitHub 仓库
3. 选择 `wsnail-optimize` 目录
4. 确认配置

---

### 2. 构建配置

- [x] `vercel.json` 已创建
- [x] Framework: Next.js
- [x] Build Command: `npm run build`
- [x] Output Directory: `.next`
- [x] Install Command: `npm install`

**确认命令：**
```bash
# 本地测试构建
npm run build

# 检查输出
ls -la .next/
```

---

### 3. 环境变量

#### Production (生产环境)

在 Vercel Dashboard → Settings → Environment Variables → Production 添加：

| 变量名 | 值 | 状态 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | ⬜ 待配置 |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | ⬜ 待配置 |
| `NEXTAUTH_URL` | `https://wsnail.com` | ⬜ 待配置 |
| `NEXT_PUBLIC_SITE_URL` | `https://wsnail.com` | ⬜ 待配置 |
| `SENTRY_DSN` | `https://...@sentry.io/...` | ⬜ 待配置 |
| `SENTRY_AUTH_TOKEN` | `sntrys_...` | ⬜ 待配置 |

#### Preview (预览环境)

| 变量名 | 值 | 状态 |
|--------|-----|------|
| `DATABASE_URL` | 预览数据库（可选） | ⬜ 待配置 |
| `NEXTAUTH_SECRET` | 与生产相同 | ⬜ 待配置 |
| `NEXTAUTH_URL` | `https://wsnail-git-*.vercel.app` | 自动 |
| `NEXT_PUBLIC_SITE_URL` | 同上 | 自动 |

---

### 4. 自定义域名

#### 主域名

- [ ] `wsnail.com` 已添加
- [ ] DNS 记录已配置

**DNS 配置：**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### 验证 DNS
```bash
# 检查 A 记录
dig wsnail.com A

# 检查 CNAME
dig www.wsnail.com CNAME
```

---

### 5. 部署分支策略

- [ ] Production Branch: `main`
- [ ] Preview Branches: `develop`, `feature/*`
- [ ] Protected Branches 已配置

**配置：**
1. Dashboard → Settings → Git
2. 设置 Production Branch 为 `main`
3. 启用 Preview Deployments

---

### 6. 区域配置

- [x] Primary Region: `hkg1` (香港)

**选择原因：**
- 中国大陆访问速度较快
- 亚洲用户覆盖广
- 延迟较低

---

### 7. 性能优化

- [x] Edge Functions 已配置
- [x] ISR (增量静态生成) 已启用
- [x] 图片优化已配置
- [x] Gzip 压缩已启用
- [x] HTTP/3 已启用

**验证：**
```bash
# 测试压缩
curl -I -H "Accept-Encoding: gzip" https://wsnail.com

# 检查 HTTP 版本
curl -I https://wsnail.com | grep -i "http"
```

---

### 8. 安全配置

- [x] 安全 Headers 已配置 (`vercel.json`)
- [x] CSP (Content Security Policy) 已配置
- [x] HTTPS 强制跳转已启用
- [x] CORS 已配置

**Headers 检查：**
```bash
curl -I https://wsnail.com
```

**预期输出：**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

### 9. 监控集成

#### Vercel Analytics
- [ ] Vercel Analytics 已启用
- [ ] 集成代码已添加

**安装：**
```bash
npm install @vercel/analytics
```

**使用：**
```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Sentry
- [ ] Sentry 已配置
- [ ] `sentry.client.config.ts` 已创建
- [ ] `sentry.server.config.ts` 已创建
- [ ] 环境变量已配置

---

### 10. CI/CD 集成

- [x] GitHub Actions 已配置 (`.github/workflows/ci.yml`)
- [ ] Vercel GitHub App 已安装
- [ ] 自动部署已启用
- [ ] Lighthouse CI 已配置

**CI 流程：**
1. Push/PR → 触发 GitHub Actions
2. Lint + TypeCheck + Build
3. Lighthouse CI (PR + main)
4. 通过后 → Vercel 自动部署

---

## 部署验证清单

部署完成后，逐项验证：

### 基本验证
- [ ] 网站可访问
- [ ] HTTPS 正常
- [ ] 无控制台错误
- [ ] 无 404 错误

### 功能验证
- [ ] 导航正常
- [ ] 表单可提交
- [ ] 数据库连接正常
- [ ] API 响应正常

### 性能验证
- [ ] 首屏 <2s
- [ ] Lighthouse >90
- [ ] Bundle 大小合理
- [ ] 无内存泄漏

### 监控验证
- [ ] Vercel Analytics 正常
- [ ] Sentry 正常
- [ ] Uptime 监控正常
- [ ] 告警测试通过

---

## 故障排查

### 常见问题

**1. 构建失败**
```bash
# 查看构建日志
vercel logs

# 本地复现
npm run build
```

**2. 环境变量未生效**
```bash
# 确认变量名拼写（区分大小写）
# 重新部署才能生效
```

**3. DNS 未生效**
```bash
# 检查 DNS 传播
dig wsnail.com

# 耐心等待（最多 48 小时）
```

**4. 域名未加载**
```bash
# 检查域名是否指向 Vercel
dig wsnail.com A

# 应该返回: 76.76.21.21
```

---

## 部署命令

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 本地预览
vercel

# 部署到生产
vercel --prod

# 查看日志
vercel logs

# 查看域名
vercel domains ls

# 查看环境变量
vercel env ls

# 添加环境变量
vercel env add DATABASE_URL production
```

---

## 配置文件清单

已创建的配置文件：

- [x] `vercel.json` - Vercel 配置
- [x] `.env.example` - 环境变量模板
- [x] `lighthouse-budget.json` - Lighthouse 性能预算
- [x] `.github/workflows/ci.yml` - CI/CD 配置
- [x] `next.config.ts` - Next.js 配置
- [x] `sentry.client.config.ts` - Sentry 客户端配置
- [x] `sentry.server.config.ts` - Sentry 服务端配置

---

## 待办事项

- [ ] 在 Vercel 创建项目
- [ ] 配置生产环境变量
- [ ] 配置自定义域名
- [ ] 启用 Vercel Analytics
- [ ] 配置 Sentry
- [ ] 测试自动部署
- [ ] 设置 Uptime 监控
- [ ] 配置飞书告警
- [ ] 测试回滚流程

---

## 相关文档

- [部署文档](./DEPLOYMENT.md)
- [监控配置](./MONITORING.md)
- [CI/CD 配置](./CI-CD.md)
- [检查清单](./DEPLOYMENT_CHECKLIST.md)

---

*配置清单完成度：80%*
*待 Vercel 项目创建后完成剩余配置*
*最后更新：2026-02-28*
