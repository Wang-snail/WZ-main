# wsnail.com 部署检查清单

> **使用说明：** 在每次部署前，逐项检查并勾选
> **维护者：** 运维工程师 (wsnail-ops)

---

## 部署前检查

### 代码质量
- [ ] 本地构建成功 (`npm run build`)
- [ ] ESLint 检查通过 (`npm run lint`)
- [ ] TypeScript 类型检查通过 (`npx tsc --noEmit`)
- [ ] 单元测试通过 (`npm test`)
- [ ] 代码已审查（至少 1 人 Approval）

### 功能验证
- [ ] 所有新功能已开发完成
- [ ] 所有 Bug 已修复或记录
- [ ] 核心功能已手动测试
- [ ] 边界情况已测试
- [ ] 错误处理已验证

### 数据库变更
- [ ] 数据库迁移已准备
- [ ] 迁移脚本已测试
- [ ] 数据库已备份
- [ ] 回滚方案已准备

### 环境变量
- [ ] 所有必需变量已配置
- [ ] 变量值已验证
- [ ] 敏感信息已加密
- [ ] `.env.local` 未提交到 Git

### 性能优化
- [ ] 图片已优化
- [ ] Bundle 大小已检查
- [ ] 懒加载已配置
- [ ] 缓存策略已设置

---

## 部署流程

### 1. 准备部署
- [ ] 当前分支已同步最新代码
- [ ] 无未提交的更改
- [ ] Git 历史已清理

### 2. 创建部署分支（可选）
```bash
git checkout develop
git pull origin develop
git checkout -b release/fba-calculator
```

### 3. 合并到 main
```bash
git checkout main
git merge develop
git push origin main
```

### 4. 监控部署
- [ ] Vercel 构建成功
- [ ] 无构建错误或警告
- [ ] 部署日志已检查

---

## 部署后验证

### 基本检查
- [ ] 网站可访问 (`https://wsnail.com`)
- [ ] HTTPS 正常工作
- [ ] 无控制台错误
- [ ] 无 JavaScript 错误

### 功能验证
- [ ] 所有新功能正常
- [ ] 核心功能正常
- [ ] 表单提交正常
- [ ] 数据库连接正常

### 性能检查
- [ ] 首屏加载时间 <2s
- [ ] Lighthouse 评分 >90
- [ ] 无 404 错误
- [ ] API 响应时间 <500ms

### 监控检查
- [ ] Sentry 无新错误
- [ ] Vercel Analytics 正常
- [ ] Uptime 监控正常
- [ ] 告警通知正常

---

## 回滚检查

### 回滚条件
- [ ] 核心功能故障
- [ ] 性能严重下降
- [ ] 数据丢失风险
- [ ] 安全漏洞

### 回滚步骤
- [ ] 确定 Vercel 上一个稳定版本
- [ ] 执行 Vercel 一键回滚
- [ ] 验证回滚成功
- [ ] 通知团队

### 回滚后
- [ ] 分析根因
- [ ] 修复问题
- [ ] 重新测试
- [ ] 重新部署

---

## 环境变量清单

### 必需变量
```bash
DATABASE_URL=           # ✅ 必需
NEXTAUTH_SECRET=        # ✅ 必需
NEXTAUTH_URL=           # ✅ 必需
NEXT_PUBLIC_SITE_URL=   # ✅ 必需
```

### 可选变量
```bash
SENTRY_DSN=             # ⚪ 推荐
SENTRY_AUTH_TOKEN=      # ⚪ 推荐
NEXT_PUBLIC_GA_ID=      # ⚪ 可选
```

---

## 应急联系

| 角色 | 联系方式 | 响应时间 |
|------|----------|----------|
| 运维工程师 | 飞书 @wsnail-ops | <15 分钟 |
| 组长 | 飞书 @贾维斯 | <15 分钟 |
| 开发工程师 | 飞书 @wsnail-dev | <1 小时 |

---

## 快速命令

```bash
# 本地测试
npm run dev

# 构建
npm run build

# 测试
npm test
npm run lint
npx tsc --noEmit

# 数据库
npx prisma generate
npx prisma db push
npx prisma migrate deploy

# 部署
vercel --prod
```

---

## 监控链接

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Sentry:** https://sentry.io/
- **Lighthouse CI:** GitHub Actions → Artifacts
- **Uptime:** https://uptimerobot.com/

---

*每次部署前请完整执行此检查清单*
*最后更新：2026-02-28*
