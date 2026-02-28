# FBA 费用计算器技术文档

> **项目：** wsnail.com
> **功能：** FBA 费用计算器
> **版本：** v1.0
> **日期：** 2026-02-28

---

## 1. 概述

FBA 费用计算器是 wsnail.com 的核心工具之一，帮助亚马逊卖家快速计算 FBA 各项费用，评估产品盈利能力。

---

## 2. 技术架构

### 2.1 技术栈
- **前端框架：** Next.js 16.1.6 (App Router)
- **UI 库：** React 19.2.3 + Tailwind CSS v4
- **图表库：** Recharts 3.7.0
- **PDF 生成：** jsPDF 4.2.0 + jspdf-autotable 5.0.7
- **测试框架：** Jest 30.2.0 + Testing Library
- **语言：** TypeScript 5

### 2.2 目录结构
```
src/
├── app/
│   └── tools/
│       └── fba-fee-calculator/
│           └── page.tsx                    # 页面组件
├── components/
│   └── FBAFeeCalculator/
│       └── FBAFeeCalculator.tsx            # 计算器组件
├── lib/
│   └── calculators/
│       ├── fbaFeeCalculator.ts             # 计算引擎
│       └── __tests__/
│           └── fbaFeeCalculator.test.ts    # 单元测试
└── ...
```

---

## 3. 功能实现

### 3.1 计算引擎 (fbaFeeCalculator.ts)

核心函数：
- `calculateFBAFees(input: ProductInput): CalculationResult` - 主计算函数
- `formatCurrency(amount: number, currency: 'USD' | 'CNY'): string` - 货币格式化
- `formatPercentage(value: number): string` - 百分比格式化

#### 费用计算逻辑

1. **尺寸分级**
   - 根据产品尺寸和重量确定尺寸等级（Small Standard / Large Standard 等）
   - 参考 Amazon 2024 FBA 尺寸分级标准

2. **FBA 配送费**
   - 根据尺寸等级查表获取配送费
   - 范围：$3.22 - $89.98

3. **仓储费**
   - 计算产品体积（立方英尺）
   - 使用年度平均费率（1-9 月 $0.87, 10-12 月 $2.40）

4. **销售佣金**
   - 标准类目：15%
   - 服装配饰：17%
   - 珠宝手表：20%

5. **利润分析**
   - 总收入 = 售价
   - 总成本 = 配送费 + 仓储费 + 佣金 + 头程运费 + 产品成本
   - 净利润 = 收入 - 成本
   - 利润率 = (净利润 / 收入) × 100%
   - ROI = (净利润 / 总投资) × 100%

### 3.2 UI 组件 (FBAFeeCalculator.tsx)

主要功能：
- 表单输入（产品信息、成本定价、尺寸重量、类目选择）
- 计算按钮
- 结果展示（费用明细、利润分析、饼图）
- 导出功能（PDF 报告、复制到剪贴板）

#### 状态管理
```typescript
const [result, setResult] = useState<CalculationResult | null>(null);
const [formData, setFormData] = useState<ProductInput>({ ... });
```

#### 事件处理
- `handleInputChange()` - 表单输入变化
- `handleCalculate()` - 执行计算
- `handleCopy()` - 复制结果到剪贴板
- `handleExportPDF()` - 导出 PDF 报告

### 3.3 页面 (page.tsx)

页面结构：
- 导航栏
- Hero Section（标题和描述）
- 计算器组件
- 功能特点介绍
- Footer

SEO 优化：
- Meta title, description, keywords
- Open Graph 标签

---

## 4. 测试

### 4.1 测试覆盖

**计算引擎测试覆盖率：83.05%**

测试用例：
- ✅ 费用计算正确性
- ✅ 不同类目的佣金计算
- ✅ 汇率转换正确性
- ✅ 利润指标计算
- ✅ 利润率计算
- ✅ ROI 计算
- ✅ 费用占比数据结构
- ✅ 零值处理
- ✅ 负利润场景处理
- ✅ 货币格式化
- ✅ 百分比格式化

**测试结果：13/13 通过**

### 4.2 运行测试

```bash
# 运行测试
npm test

# 运行覆盖率测试
npm run test:coverage

# 监视模式
npm run test:watch
```

---

## 5. 部署

### 5.1 构建命令
```bash
npm run build
```

### 5.2 环境变量
无需额外环境变量

### 5.3 Vercel 部署

项目已配置 Vercel 部署：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 5.4 访问地址

生产环境：`https://wsnail.com/tools/fba-fee-calculator`

---

## 6. 性能优化

### 6.1 已实现优化

1. **静态生成**
   - 页面使用静态生成（SSG）
   - 构建时预渲染

2. **图片优化**
   - 使用 Next.js Image 组件
   - 支持 AVIF/WebP 格式

3. **代码分割**
   - 动态导入大型库（jsPDF）
   - 按需加载

4. **安全头部**
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - Referrer-Policy
   - Permissions-Policy

### 6.2 性能指标

- 构建时间：~20s
- 首屏加载：<2s（目标）
- Lighthouse 评分：待测试

---

## 7. 后续优化

### 7.1 功能增强

- [ ] ASIN 自动获取类目
- [ ] 多国家站点支持（UK/DE/JP）
- [ ] 历史记录保存
- [ ] 批量计算
- [ ] 价格建议功能

### 7.2 技术改进

- [ ] 组件测试覆盖
- [ ] E2E 测试
- [ ] 性能监控（Sentry）
- [ ] A/B 测试

---

## 8. 故障排除

### 8.1 常见问题

**问题：PDF 导出失败**
- 解决：检查 jsPDF 和 jspdf-autotable 版本兼容性

**问题：图表不显示**
- 解决：检查 Recharts 数据格式

**问题：计算结果不准确**
- 解决：验证尺寸分级逻辑，检查汇率配置

### 8.2 调试技巧

```typescript
// 启用调试日志
console.log('Input:', formData);
console.log('Result:', result);

// 验证计算逻辑
console.log('Size Tier:', sizeTier);
console.log('Fulfillment Fee:', fulfillmentFee);
```

---

## 9. 参考资料

- [Amazon FBA 费用标准](https://sellercentral.amazon.com/gp/help/external/G200954210)
- [Next.js 文档](https://nextjs.org/docs)
- [Recharts 文档](https://recharts.org/)
- [jsPDF 文档](https://github.com/parallax/jsPDF)

---

*文档版本：v1.0*
*最后更新：2026-02-28*
*维护者：wsnail-dev*
