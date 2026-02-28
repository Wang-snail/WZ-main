/**
 * FBA 费用计算引擎
 * 参考 Amazon FBA 2024 费用标准
 */

// 汇率配置
export const EXCHANGE_RATE = 7.2; // 1 USD = 7.2 CNY

// 佣金费率配置
export const COMMISSION_RATES = {
  STANDARD: 0.15, // 15%
  CLOTHING: 0.17, // 17%
  JEWELRY: 0.20,  // 20%
};

// 尺寸分级配置
export interface Dimensions {
  length: number; // cm
  width: number;  // cm
  height: number; // cm
  weight: number; // g
}

// 尺寸等级定义
export enum SizeTier {
  SMALL_STANDARD = 'small_standard',
  LARGE_STANDARD = 'large_standard',
  SMALL_OVERSIZE = 'small_oversize',
  MEDIUM_OVERSIZE = 'medium_oversize',
  LARGE_OVERSIZE = 'large_oversize',
  SPECIAL_OVERSIZE = 'special_oversize',
}

// 配送费配置（USD）
export const FULFILLMENT_FEES: Record<SizeTier, number> = {
  [SizeTier.SMALL_STANDARD]: 3.22,
  [SizeTier.LARGE_STANDARD]: 4.75,
  [SizeTier.SMALL_OVERSIZE]: 8.23,
  [SizeTier.MEDIUM_OVERSIZE]: 12.59,
  [SizeTier.LARGE_OVERSIZE]: 29.21,
  [SizeTier.SPECIAL_OVERSIZE]: 89.98,
};

// 仓储费配置（USD/立方英尺/月）
export const STORAGE_FEES = {
  JAN_SEP: 0.87,
  OCT_DEC: 2.40,
};

// 产品输入参数
export interface ProductInput {
  productName?: string;
  asin?: string;
  productCost: number;      // CNY
  sellingPrice: number;     // USD
  shippingCost: number;     // CNY (头程运费)
  dimensions: Dimensions;
  category: 'standard' | 'clothing' | 'jewelry';
}

// 计算结果
export interface CalculationResult {
  // 费用明细
  fulfillmentFee: number;    // USD - FBA 配送费
  storageFee: number;        // USD - 月度仓储费
  commission: number;        // USD - 销售佣金
  shippingCostUSD: number;   // USD - 头程运费（折算）
  productCostUSD: number;    // USD - 产品成本（折算）

  // 利润分析
  revenue: number;           // USD - 总收入
  totalCost: number;         // USD - 总成本
  netProfitUSD: number;      // USD - 净利润（美元）
  netProfitCNY: number;      // CNY - 净利润（人民币）
  profitMargin: number;      // % - 利润率
  roi: number;               // % - ROI

  // 费用占比（用于图表）
  feeBreakdown: {
    name: string;
    value: number;
    color: string;
  }[];
}

/**
 * 将厘米转换为英寸
 */
function cmToInch(cm: number): number {
  return cm * 0.393701;
}

/**
 * 将克转换为磅
 */
function gToLb(g: number): number {
  return g * 0.00220462;
}

/**
 * 将克转换为盎司
 */
function gToOz(g: number): number {
  return g * 0.035274;
}

/**
 * 计算体积（立方英尺）
 */
function calculateCubicFeet(dimensions: Dimensions): number {
  const cubicInches =
    cmToInch(dimensions.length) *
    cmToInch(dimensions.width) *
    cmToInch(dimensions.height);
  return cubicInches / 1728;
}

/**
 * 判断尺寸等级
 */
function determineSizeTier(dimensions: Dimensions): SizeTier {
  const lengthIn = cmToInch(dimensions.length);
  const widthIn = cmToInch(dimensions.width);
  const heightIn = cmToInch(dimensions.height);
  const weightLb = gToLb(dimensions.weight);
  const weightOz = gToOz(dimensions.weight);

  // 排序尺寸
  const sortedDims = [lengthIn, widthIn, heightIn].sort((a, b) => a - b);
  const [shortest, median, longest] = sortedDims;

  // 特大号：>150 磅
  if (weightLb > 150) {
    return SizeTier.SPECIAL_OVERSIZE;
  }

  // 大号大件：最长边 >108 英寸 或 第二长边 >60 英寸
  if (longest > 108 || median > 60) {
    return SizeTier.LARGE_OVERSIZE;
  }

  // 小号标准：≤15x12x0.75 英寸 且 ≤15 盎司
  if (
    longest <= 15 &&
    median <= 12 &&
    shortest <= 0.75 &&
    weightOz <= 15
  ) {
    return SizeTier.SMALL_STANDARD;
  }

  // 大号标准：≤18x14x8 英寸 且 ≤20 磅
  if (longest <= 18 && median <= 14 && shortest <= 8 && weightLb <= 20) {
    return SizeTier.LARGE_STANDARD;
  }

  // 小号大件：≤60x30x15 英寸 且 ≤20 磅
  if (
    longest <= 60 &&
    median <= 30 &&
    shortest <= 15 &&
    weightLb <= 20
  ) {
    return SizeTier.SMALL_OVERSIZE;
  }

  // 中号大件：≤108 英寸最长边 且 ≤20 磅
  if (longest <= 108 && weightLb <= 20) {
    return SizeTier.MEDIUM_OVERSIZE;
  }

  // 默认为大号大件
  return SizeTier.LARGE_OVERSIZE;
}

/**
 * 计算 FBA 费用
 */
export function calculateFBAFees(input: ProductInput): CalculationResult {
  // 1. 确定尺寸等级
  const sizeTier = determineSizeTier(input.dimensions);

  // 2. 计算 FBA 配送费
  const fulfillmentFee = FULFILLMENT_FEES[sizeTier];

  // 3. 计算仓储费（使用平均费率）
  const cubicFeet = calculateCubicFeet(input.dimensions);
  const avgStorageFee = (STORAGE_FEES.JAN_SEP * 9 + STORAGE_FEES.OCT_DEC * 3) / 12;
  const storageFee = cubicFeet * avgStorageFee;

  // 4. 计算销售佣金
  const commissionRate =
    input.category === 'clothing'
      ? COMMISSION_RATES.CLOTHING
      : input.category === 'jewelry'
        ? COMMISSION_RATES.JEWELRY
        : COMMISSION_RATES.STANDARD;
  const commission = input.sellingPrice * commissionRate;

  // 5. 转换成本为美元
  const shippingCostUSD = input.shippingCost / EXCHANGE_RATE;
  const productCostUSD = input.productCost / EXCHANGE_RATE;

  // 6. 计算总收入和总成本
  const revenue = input.sellingPrice;
  const totalCost =
    fulfillmentFee + storageFee + commission + shippingCostUSD + productCostUSD;

  // 7. 计算净利润
  const netProfitUSD = revenue - totalCost;
  const netProfitCNY = netProfitUSD * EXCHANGE_RATE;

  // 8. 计算利润率
  const profitMargin = revenue > 0 ? (netProfitUSD / revenue) * 100 : 0;

  // 9. 计算 ROI
  const totalInvestmentCNY = input.productCost + input.shippingCost;
  const roi = totalInvestmentCNY > 0 ? (netProfitCNY / totalInvestmentCNY) * 100 : 0;

  // 10. 构建费用占比数据
  const feeBreakdown = [
    { name: 'FBA 配送费', value: fulfillmentFee, color: '#0071E3' },
    { name: '仓储费', value: storageFee, color: '#5856D6' },
    { name: '销售佣金', value: commission, color: '#FF9500' },
    { name: '头程运费', value: shippingCostUSD, color: '#34C759' },
    { name: '产品成本', value: productCostUSD, color: '#FF3B30' },
  ];

  return {
    fulfillmentFee,
    storageFee,
    commission,
    shippingCostUSD,
    productCostUSD,
    revenue,
    totalCost,
    netProfitUSD,
    netProfitCNY,
    profitMargin,
    roi,
    feeBreakdown,
  };
}

/**
 * 格式化货币
 */
export function formatCurrency(amount: number, currency: 'USD' | 'CNY'): string {
  const locale = currency === 'CNY' ? 'zh-CN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
