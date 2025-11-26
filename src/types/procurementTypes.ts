// 采购寻源报价单类型定义

// 采购报价单行数据
export interface ProcurementQuotation {
    id: string; // 系统生成的唯一 ID

    // 基本信息
    brand: string; // 品牌
    requester: string; // 需求提交人
    submitDate: string; // 填写时间
    productName: string; // 产品名称
    productNameEn: string; // 英文名称
    referenceImage?: string; // 参考图
    adjustments?: string; // 基于图片的调整
    salePrice: number; // 售价

    // 产品规格
    length: number; // 长
    width: number; // 宽
    height: number; // 高
    packagingMethod: string; // 包装方式
    certification?: string; // 认证
    expectedQuantity: number; // 预期采购量
    category: string; // 类目
    competitor?: string; // 竞品
    expectedUnitPrice: number; // 期望单价

    // 供应商信息
    quoter: string; // 报价人
    quoteDate: string; // 报价时间
    supplierName: string; // 供应商名称
    productImage?: string; // 产品图片
    quotePriceRMB: number; // 报价￥
    purchasePriceUSD: number; // 采购价$
    moq: number; // MOQ
    leadTime: string; // 交期
    material: string; // 材质

    // 包装尺寸 - 彩盒
    colorBoxLength: number;
    colorBoxWidth: number;
    colorBoxHeight: number;
    colorBoxWeight: number;

    // 包装尺寸 - 外箱
    outerBoxLength: number;
    outerBoxWidth: number;
    outerBoxHeight: number;
    outerBoxWeight: number;
    packingQuantity: number; // 装箱数量

    // 供应商详情
    supplierAddress?: string;
    website?: string;
    productLink?: string;
    companyScale?: string;
    capacity?: string;
    staffing?: string;
    intellectualProperty?: string;
    annualNewProducts?: number;
    mainProducts?: string;

    // 采购意见
    purchaseOpinion?: string;
    otherInfo?: string;

    // 计算字段（自动计算）
    calculated: CalculatedFields;

    createdAt: string;
    updatedAt: string;
}

// 计算字段
export interface CalculatedFields {
    competitorPrice?: number; // 竞品售价
    breakEvenPrice: number; // 保本价
    sellingPrice: number; // 销售价
    profit: number; // 利润
    profitMargin: number; // 利润率

    // 物流计算
    commission: number; // 佣金
    volumeWeightCoefficient: number; // 体积重系数
    firstLegUnitPrice: number; // 头程单价
    exchangeRate: number; // 汇率
    longestSide: number; // 最长边
    secondLongestSide: number; // 次长边
    shortestSide: number; // 最短边
    productSizeType: string; // 商品尺寸类型
    chargeableWeight: number; // VW - 计费重
    volumeWeightKg: number; // 体积重Kg

    // 成本占比
    purchaseRatio: number; // 采购占比
    logisticsRatio: number; // 物流占比
    profitRatio: number; // 利润占比

    // 费用明细
    firstLegFreight: number; // 头程运费
    fbaFee: number; // FBA费用
    platformCost: number; // 平台成本
    advertisingCost: number; // 广告
    discount: number; // 折扣
    refund: number; // 退款
    refundRate: number; // 退款率
    advertisingRatio: number; // 广告占比

    // 保本计算
    unitProfitBreakEven: number; // 单品利润（保本）
    promotionCostTotal: number; // 推广成本合计
    advertisingRate: number; // 广告率
}

// 视图配置
export interface ViewConfig {
    id: string;
    name: string;
    groupBy?: 'product' | 'supplier' | 'category' | 'none';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    visibleColumns: string[];
    filters?: FilterConfig[];
}

// 筛选配置
export interface FilterConfig {
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
    value: any;
}

// 列定义
export interface ColumnDef {
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'image' | 'calculated';
    width?: number;
    editable: boolean;
    format?: (value: any) => string;
    group?: string; // 列分组
}

// 表格数据
export interface ProcurementTableData {
    quotations: ProcurementQuotation[];
    views: ViewConfig[];
    currentViewId: string;
}
