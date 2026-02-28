# wsnail.com 监控告警配置

> **项目：** 跨境电商 AI 工具平台
> **维护者：** 运维工程师 (wsnail-ops)
> **最后更新：** 2026-02-28

---

## 目录

1. [监控架构](#监控架构)
2. [Vercel Analytics](#vercel-analytics)
3. [Sentry 错误追踪](#sentry-错误追踪)
4. [Lighthouse CI](#lighthouse-ci)
5. [Uptime 监控](#uptime-监控)
6. [告警配置](#告警配置)
7. [监控仪表盘](#监控仪表盘)

---

## 监控架构

```
┌─────────────────────────────────────────────────────────┐
│                    wsnail.com 监控系统                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Vercel     │  │    Sentry    │  │   Lighthouse │  │
│  │  Analytics   │  │  Error Track │  │      CI      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                   ┌───────▼────────┐                    │
│                   │  告警聚合中心   │                    │
│                   │  (飞书 Webhook) │                    │
│                   └────────────────┘                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Vercel Analytics

### 配置步骤

**1. 启用 Vercel Analytics**

```bash
# 安装 Next.js Analytics
npm install @vercel/analytics
```

**2. 集成到应用**

修改 `src/app/layout.tsx`:

```typescript
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

**3. Dashboard 配置**

访问：`https://vercel.com/dashboard/xxx/analytics`

### 监控指标

**实时监控：**
- 当前在线用户
- 页面访问量（PV）
- 唯一访客（UV）
- 地理位置

**性能监控：**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

**转化监控：**
- 转化率
- 跳出率
- 会话时长
- 页面停留时间

### 数据查询

```sql
-- 查询最近 7 天的访问量
SELECT
  date_trunc('day', timestamp) as day,
  count(*) as visits
FROM analytics
WHERE timestamp >= now() - interval '7 days'
GROUP BY day
ORDER BY day DESC;

-- 查询最受欢迎的页面
SELECT
  url,
  count(*) as visits
FROM analytics
WHERE timestamp >= now() - interval '30 days'
GROUP BY url
ORDER BY visits DESC
LIMIT 10;
```

---

## Sentry 错误追踪

### 配置步骤

**1. 安装 Sentry SDK**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**2. 配置环境变量**

```bash
# .env.local
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ENVIRONMENT=production
```

**3. 配置文件**

`src/app/sentry.client.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],

  beforeSend(event, hint) {
    // 过滤敏感信息
    if (event.request?.headers) {
      delete event.request.headers['cookie'];
      delete event.request.headers['authorization'];
    }
    return event;
  },
});
```

`src/app/sentry.server.config.ts`:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 错误监控指标

**关键指标：**
- 错误率（Errors / Visits）
- 错误数量趋势
- 错误类型分布
- 受影响用户数

**性能监控：**
- API 响应时间
- 数据库查询时间
- 第三方 API 调用时间
- 页面加载时间

### 告警规则

```yaml
# 高优先级告警
alerts:
  - name: "高错误率"
    condition: "error_rate > 1%"
    duration: "5m"
    severity: "critical"

  - name: "新错误类型"
    condition: "new_error_type"
    duration: "immediate"
    severity: "high"

  - name: "性能下降"
    condition: "p95_response_time > 2000ms"
    duration: "10m"
    severity: "warning"

  - name: "数据库连接失败"
    condition: "error_message: Database connection"
    duration: "immediate"
    severity: "critical"
```

---

## Lighthouse CI

### 配置文件

`lighthouse-budget.json` (已配置):

```json
{
  "budgets": [
    {
      "path": "/*",
      "timings": [
        { "metric": "first-contentful-paint", "budget": 2000 },
        { "metric": "interactive", "budget": 3500 },
        { "metric": "total-blocking-time", "budget": 300 },
        { "metric": "largest-contentful-paint", "budget": 2500 }
      ],
      "resourceSizes": [
        { "resourceType": "script", "budget": 200 },
        { "resourceType": "total", "budget": 500 }
      ]
    }
  ]
}
```

### GitHub Actions 集成

`.github/workflows/ci.yml` (已配置):

```yaml
lighthouse:
  name: Lighthouse 性能检查
  runs-on: ubuntu-latest
  needs: [build]
  if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
  steps:
    - name: 运行 Lighthouse CI
      uses: treosh/lighthouse-ci-action@v12
      with:
        urls: |
          https://wsnail.com
          https://wsnail.com/tools/fba-fee-calculator
        budgetPath: ./lighthouse-budget.json
        uploadArtifacts: true
```

### 性能目标

| 指标 | 目标值 | 当前值 | 状态 |
|------|--------|--------|------|
| Performance | >90 | - | 🟡 待测量 |
| Accessibility | >95 | - | 🟡 待测量 |
| Best Practices | >90 | - | 🟡 待测量 |
| SEO | >95 | - | 🟡 待测量 |
| FCP | <2s | - | 🟡 待测量 |
| LCP | <2.5s | - | 🟡 待测量 |
| TTI | <3.5s | - | 🟡 待测量 |

---

## Uptime 监控

### 选项 1：UptimeRobot (免费)

**配置：**

1. 注册 [UptimeRobot](https://uptimerobot.com/register)
2. 创建 Monitor：
   - Type: HTTPS
   - URL: `https://wsnail.com`
   - Check Interval: 5 minutes
   - Alert: Email + 飞书 Webhook

3. 配置飞书 Webhook:
   ```bash
   # 飞书群设置 → 群机器人 → 添加机器人 → 自定义
   # 复制 Webhook URL 到 UptimeRobot
   ```

### 选项 2：Checkly (推荐)

**配置：**

1. 注册 [Checkly](https://checklyhq.com)
2. 创建 API 检查:

   `checks/fba-calculator.spec.ts`:

   ```typescript
   import { test, expect } from '@playwright/test';

   test('FBA 费用计算器可用性检查', async ({ page }) => {
     // 访问页面
     await page.goto('https://wsnail.com/tools/fba-fee-calculator');

     // 检查标题
     await expect(page).toHaveTitle(/FBA 费用计算器/);

     // 检查关键元素
     const calculator = page.locator('[data-testid="fba-calculator"]');
     await expect(calculator).toBeVisible();

     // 测试计算功能
     await page.fill('[name="product-price"]', '100');
     await page.click('[data-testid="calculate-btn"]');
     await expect(page.locator('[data-testid="result"]')).toBeVisible();
   });
   ```

3. 配置告警:
   - Slack / Email / PagerDuty / 飞书
   - 检查频率：5 分钟
   - 地理位置分布：US, EU, Asia

### 选项 3：Pingdom (付费)

**高级功能：**
- 多地点监控
- 根节点分析
- 水印报告
- API 监控

---

## 告警配置

### 告警等级

| 等级 | 条件 | 响应时间 | 通知方式 |
|------|------|----------|----------|
| P0 | 网站完全不可用 | <15 分钟 | 电话 + 飞书 |
| P1 | 核心功能故障 | <1 小时 | 飞书 @全体 |
| P2 | 性能严重下降 | <4 小时 | 飞书 |
| P3 | 非关键问题 | <24 小时 | 邮件 |

### 飞书告警配置

**1. 创建飞书机器人**

```bash
# 飞书群 → 群设置 → 群机器人 → 添加机器人
# 选择"自定义机器人"
# 复制 Webhook URL
```

**2. 告警脚本**

`scripts/alert.sh`:

```bash
#!/bin/bash

WEBHOOK_URL="https://open.feishu.cn/open-apis/bot/v2/hook/xxx"

send_alert() {
  local title="$1"
  local message="$2"
  local severity="$3"

  local color="#FF0000"
  case "$severity" in
    "P0") color="#FF0000" ;;  # 红色
    "P1") color="#FF9900" ;;  # 橙色
    "P2") color="#FFCC00" ;;  # 黄色
    "P3") color="#00CC00" ;;  # 绿色
  esac

  curl -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"msg_type\": \"interactive\",
      \"card\": {
        \"header\": {
          \"title\": {
            \"tag\": \"plain_text\",
            \"content\": \"[$severity] $title\"
          },
          \"template\": \"$color\"
        },
        \"elements\": [{
          \"tag\": \"div\",
          \"text\": {
            \"tag\": \"plain_text\",
            \"content\": \"$message\"
          }
        }]
      }
    }"
}

# 使用示例
send_alert "网站不可用" "wsnail.com 返回 500 错误" "P0"
```

**3. 告警规则**

```yaml
alerts:
  - name: "网站不可用"
    condition: "status_code != 200"
    severity: "P0"
    channels: ["feishu", "sms"]

  - name: "错误率过高"
    condition: "error_rate > 5%"
    duration: "5m"
    severity: "P1"
    channels: ["feishu"]

  - name: "响应时间过长"
    condition: "response_time > 3000ms"
    duration: "10m"
    severity: "P2"
    channels: ["feishu"]

  - name: "磁盘空间不足"
    condition: "disk_usage > 80%"
    severity: "P3"
    channels: ["email"]
```

---

## 监控仪表盘

### Vercel Dashboard

**URL:** `https://vercel.com/dashboard`

**关键视图：**
- Deployments: 部署历史和状态
- Analytics: 访问量和性能
- Logs: 实时日志
- Functions: Edge Functions 性能

### Sentry Dashboard

**URL:** `https://sentry.io/organizations/xxx/`

**关键视图：**
- Issues: 错误列表和趋势
- Performance: 性能监控
- Alerts: 告警历史
- Releases: 版本关联

### 自定义仪表盘 (可选)

**Grafana + Prometheus:**

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'vercel'
    static_configs:
      - targets: ['wsnail.com']
    metrics_path: '/api/metrics'
```

```json
// grafana-dashboard.json
{
  "title": "wsnail.com 监控",
  "panels": [
    {
      "title": "请求速率",
      "targets": [{
        "expr": "rate(requests_total[5m])"
      }]
    },
    {
      "title": "错误率",
      "targets": [{
        "expr": "rate(errors_total[5m]) / rate(requests_total[5m]) * 100"
      }]
    },
    {
      "title": "响应时间",
      "targets": [{
        "expr": "histogram_quantile(0.95, response_time)"
      }]
    }
  ]
}
```

---

## 附录

### 监控检查清单

**部署前：**
- [ ] 监控已配置
- [ ] 告警已测试
- [ ] 仪表盘已设置
- [ ] 通知渠道已验证

**部署后：**
- [ ] 检查部署状态
- [ ] 验证监控数据
- [ ] 测试告警触发
- [ ] 确认响应时间

### 故障响应流程

1. **发现故障** → 监控告警或用户报告
2. **评估等级** → 确定 P0/P1/P2/P3
3. **通知团队** → 飞书群 + 电话（P0）
4. **执行修复** → 修复或回滚
5. **验证恢复** → 确认服务正常
6. **事后分析** → 输出故障报告

### 相关链接

- **Vercel Analytics:** https://vercel.com/docs/analytics
- **Sentry Docs:** https://docs.sentry.io
- **Lighthouse CI:** https://github.com/GoogleChrome/lighthouse-ci
- **UptimeRobot:** https://uptimerobot.com

---

*文档版本：v1.0*
*最后更新：2026-02-28*
