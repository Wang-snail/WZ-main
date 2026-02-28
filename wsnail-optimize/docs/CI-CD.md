# wsnail.com CI/CD 配置

> **项目：** 跨境电商 AI 工具平台
> **维护者：** 运维工程师 (wsnail-ops)
> **最后更新：** 2026-02-28

---

## 目录

1. [CI/CD 架构](#cicd-架构)
2. [GitHub Actions 配置](#github-actions-配置)
3. [Vercel 自动部署](#vercel-自动部署)
4. [测试策略](#测试策略)
5. [部署流程](#部署流程)
6. [故障回滚](#故障回滚)

---

## CI/CD 架构

```
┌──────────────────────────────────────────────────────────┐
│                   wsnail.com CI/CD 流程                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Push/PR                                                 │
│   │                                                      │
│   ▼                                                      │
│  ┌──────────────────────────────────────┐               │
│  │   GitHub Actions (CI)                │               │
│  │   - ESLint                            │               │
│  │   - TypeScript                       │               │
│  │   - Build                            │               │
│  │   - Lighthouse CI                    │               │
│  └──────────────┬───────────────────────┘               │
│                 │ ✅ 通过                               │
│                 ▼                                       │
│  ┌──────────────────────────────────────┐               │
│  │   Vercel (CD)                        │               │
│  │   - main → Production                │               │
│  │   - develop/PR → Preview             │               │
│  └──────────────┬───────────────────────┘               │
│                 │                                       │
│                 ▼                                       │
│  ┌──────────────────────────────────────┐               │
│  │   监控告警                            │               │
│  │   - Vercel Analytics                 │               │
│  │   - Sentry                           │               │
│  │   - 飞书通知                         │               │
│  └──────────────────────────────────────┘               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## GitHub Actions 配置

### 工作流文件

**文件路径：** `.github/workflows/ci.yml`

**触发条件：**
- Push 到 `main` 或 `develop` 分支
- Pull Request 到 `main` 或 `develop`

### Job 说明

#### 1. Lint - 代码质量检查

```yaml
lint:
  runs-on: ubuntu-latest
  steps:
    - checkout 代码
    - 设置 Node.js 20
    - 安装依赖 (npm ci)
    - 运行 ESLint
```

#### 2. Type-Check - TypeScript 类型检查

```yaml
type-check:
  runs-on: ubuntu-latest
  steps:
    - checkout 代码
    - 设置 Node.js 20
    - 安装依赖
    - 运行 tsc --noEmit
```

#### 3. Build - 构建测试

```yaml
build:
  needs: [lint, type-check]  # 依赖 lint 和 type-check
  runs-on: ubuntu-latest
  steps:
    - checkout 代码
    - 设置 Node.js 20
    - 安装依赖
    - 运行 npm run build
```

#### 4. Lighthouse - 性能检查

```yaml
lighthouse:
  needs: [build]
  if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - checkout 代码
    - 安装依赖
    - 运行 Lighthouse CI
    - 上传报告
```

**Lighthouse 配置：**
- 测试 URL：首页 + FBA 费用计算器
- 运行 3 次取平均值
- 性能预算：`lighthouse-budget.json`

### 并发控制

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**作用：** 同一 PR 的新推送会取消旧的运行，节省资源。

---

## Vercel 自动部署

### 部署配置

**文件：** `vercel.json`

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "regions": ["hkg1"],  // 香港节点
  "headers": [...],
  "rewrites": [...]
}
```

### 部署分支策略

| 分支类型 | 环境 | 触发条件 | 部署目标 |
|---------|------|----------|----------|
| `main` | Production | Push | `wsnail.com` |
| `develop` | Preview | Push | `wsnail-git-develop.vercel.app` |
| `feature/*` | Preview | Pull Request | 自动生成 URL |
| `hotfix/*` | Production | Push + Review | `wsnail.com` |

### 部署预览

**PR 自动部署：**
- 每次 PR 自动创建预览环境
- URL 格式：`https://wsnail-git-*.vercel.app`
- 可直接分享给团队测试

**预览环境特性：**
- 独立的数据库连接（可选）
- 自动销毁（7 天后）
- 评论集成（GitHub PR 评论）

---

## 测试策略

### 单元测试

```bash
# 安装测试依赖
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# 运行测试
npm test
```

`jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### E2E 测试

```bash
# 安装 Playwright
npm install --save-dev @playwright/test

# 运行 E2E 测试
npm run test:e2e
```

`e2e/fba-calculator.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('FBA 费用计算器', () => {
  test('应该正确计算 FBA 费用', async ({ page }) => {
    await page.goto('/tools/fba-fee-calculator');

    // 填写表单
    await page.fill('[name="product-price"]', '100');
    await page.fill('[name="product-weight"]', '0.5');
    await page.selectOption('[name="product-size"]', 'small');

    // 点击计算
    await page.click('[data-testid="calculate-btn"]');

    // 验证结果
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-fee"]')).toContainText(/\d+/);
  });

  test('应该显示错误提示（价格无效）', async ({ page }) => {
    await page.goto('/tools/fba-fee-calculator');

    // 输入无效价格
    await page.fill('[name="product-price"]', '-100');
    await page.click('[data-testid="calculate-btn"]');

    // 验证错误提示
    await expect(page.locator('[data-testid="error"]')).toContainText('价格必须大于 0');
  });
});
```

### 数据库测试

```typescript
// tests/db/migration.test.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('数据库迁移', () => {
  beforeAll(async () => {
    // 运行迁移
    await exec('npx prisma migrate reset --force');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('应该能连接数据库', async () => {
    await expect(prisma.$connect()).resolves.not.toThrow();
  });

  test('应该能创建用户', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    expect(user).toHaveProperty('id');
    expect(user.email).toBe('test@example.com');
  });
});
```

---

## 部署流程

### 常规部署流程

**1. 功能开发**
```bash
git checkout -b feature/fba-calculator
# 开发 + 测试
git add .
git commit -m "feat: 添加 FBA 费用计算器"
git push origin feature/fba-calculator
```

**2. 创建 Pull Request**
```bash
# 在 GitHub 上创建 PR
# 自动触发 CI 检查
```

**3. CI 检查**
- ESLint ✅
- TypeScript ✅
- Build ✅
- Lighthouse ✅

**4. 代码审查**
- 至少 1 人 Approval
- 解决所有 Review 意见

**5. 合并到 develop**
```bash
git checkout develop
git merge feature/fba-calculator
git push origin develop
```

**6. 预发布环境测试**
- QA 测试
- 产品验收
- 性能验证

**7. 合并到 main**
```bash
git checkout main
git merge develop
git push origin main
```

**8. 生产部署**
- Vercel 自动部署
- 监控确认
- 冒烟测试

### 紧急修复流程

**Hotfix 分支：**
```bash
git checkout main
git checkout -b hotfix/critical-bug
# 修复 bug
git commit -m "fix: 修复严重 bug"
git push origin hotfix/critical-bug

# 快速审查后直接合并到 main
git checkout main
git merge hotfix/critical-bug
git push origin main
```

---

## 故障回滚

### 快速回滚（Vercel）

**步骤：**
1. 登录 Vercel Dashboard
2. 进入项目 → Deployments
3. 找到上一个稳定版本
4. 点击 "Promote to Production"
5. 等待部署完成（约 30 秒）

### Git 回滚

**选项 1：Revert（推荐）**
```bash
# 创建 revert commit
git revert HEAD
git push origin main
```

**选项 2：Reset（谨慎使用）**
```bash
# 硬重置到指定 commit
git reset --hard abc123
git push origin main --force
```

### 数据库回滚

```bash
# 查看迁移历史
npx prisma migrate status

# 回滚到指定迁移
npx prisma migrate resolve --rolled-back 20260228000000_add_fba_calculator

# 恢复备份（Vercel Postgres）
# Dashboard → Storage → Postgres → Backups → Restore
```

---

## 性能监控

### 部署后检查清单

- [ ] 网站可访问
- [ ] 核心功能正常
- [ ] 无 JavaScript 错误
- [ ] Lighthouse 评分 >90
- [ ] Sentry 无新错误
- [ ] 响应时间 <2s
- [ ] 数据库连接正常

### 性能指标

| 指标 | 目标值 | 监控工具 |
|------|--------|----------|
| First Contentful Paint | <2s | Lighthouse |
| Largest Contentful Paint | <2.5s | Lighthouse |
| Time to Interactive | <3.5s | Lighthouse |
| Cumulative Layout Shift | <0.1 | Lighthouse |
| Error Rate | <1% | Sentry |
| Uptime | >99.9% | UptimeRobot |

---

## 附录

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | 数据库连接 | - |
| `NEXTAUTH_SECRET` | 认证密钥 | - |
| `NEXT_PUBLIC_SITE_URL` | 网站 URL | `https://wsnail.com` |
| `SENTRY_DSN` | Sentry DSN | - |
| `NEXT_PUBLIC_GA_ID` | Google Analytics | - |

### 相关命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 测试
npm test
npm run test:e2e

# Lint
npm run lint

# 数据库
npx prisma generate
npx prisma db push
npx prisma migrate deploy

# 部署（手动）
vercel --prod
```

### 相关链接

- **GitHub Actions:** https://github.com/features/actions
- **Vercel Docs:** https://vercel.com/docs
- **Lighthouse CI:** https://github.com/GoogleChrome/lighthouse-ci

---

*文档版本：v1.0*
*最后更新：2026-02-28*
