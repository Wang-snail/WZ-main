/**
 * 智能竞品分析功能的核心类型定义
 * 定义了产品数据、竞品数据、分析结果等核心数据结构
 */

/**
 * 产品尺寸信息
 */
export interface ProductDimensions {
  /** 长度 (cm) */
  length: number;
  /** 宽度 (cm) */
  width: number;
  /** 高度 (cm) */
  height: number;
}

/**
 * 基础产品信息
 * 用于存储用户自有产品的基本数据
 */
export interface BaseProduct {
  /** 产品唯一标识 */
  id: string;
  /** 产品名称 */
  name: string;
  /** BOM成本 (USD) */
  cost: number;
  /** 重量 (g) */
  weight: number;
  /** 产品尺寸 */
  dimensions: ProductDimensions;
  /** 固定投入成本 (USD) - 包括模具、认证等 */
  fixedInvestment: number;
  /** 预估月销量 (件) */
  estimatedMonthlySales: number;
  /** 产品功能特性列表 */
  features: string[];
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 数据提取置信度
 * 用于表示NLP提取各字段的可信程度
 */
export interface ExtractionConfidence {
  /** 价格提取置信度 (0-1) */
  price: number;
  /** 重量提取置信度 (0-1) */
  weight: number;
  /** 尺寸提取置信度 (0-1) */
  dimensions: number;
  /** 功能特性提取置信度 (0-1) */
  features: number;
}

/**
 * 竞品数据信息
 * 从用户输入的文本中提取的结构化竞品信息
 */
export interface CompetitorData {
  /** 竞品售价 (USD) */
  price: number;
  /** 竞品重量 (g) - 可选 */
  weight?: number;
  /** 竞品尺寸 - 可选 */
  dimensions?: ProductDimensions;
  /** 竞品功能特性列表 */
  features: string[];
  /** 各字段提取的置信度 */
  extractionConfidence: ExtractionConfidence;
  /** 原始输入文本 */
  rawText: string;
  /** 提取时间 */
  extractedAt: Date;
}

/**
 * 利润分析结果
 */
export interface ProfitAnalysis {
  /** 毛利金额 (USD) */
  margin: number;
  /** 毛利率 (0-1) */
  marginRate: number;
  /** 投资回本周期 (月) */
  roiMonths: number;
}

/**
 * 雷达图评分数据
 * 五个维度的标准化评分 (0-10)
 */
export interface RadarScores {
  /** 利润空间评分 */
  profitability: number;
  /** ROI速度评分 */
  roiSpeed: number;
  /** 便携指数评分 */
  portability: number;
  /** 功能丰富度评分 */
  features: number;
  /** 价格竞争力评分 */
  priceAdvantage: number;
}

/**
 * 智能分析洞察
 */
export interface AnalysisInsights {
  /** 竞争优势列表 */
  advantages: string[];
  /** 风险提示列表 */
  risks: string[];
  /** 策略建议列表 */
  recommendations: string[];
}

/**
 * 完整分析结果
 * 包含所有计算和分析的综合结果
 */
export interface AnalysisResult {
  /** 利润分析数据 */
  profitAnalysis: ProfitAnalysis;
  /** 雷达图评分 */
  radarScores: RadarScores;
  /** 智能分析洞察 */
  insights: AnalysisInsights;
  /** 分析完成时间 */
  timestamp: Date;
  /** 关联的会话ID */
  sessionId: string;
}

/**
 * 用户角色视图类型
 */
export type RoleViewType = 'retail' | 'manufacturing';

/**
 * 分析工作流步骤
 */
export type WorkflowStep = 'config' | 'input' | 'extract' | 'analyze' | 'result';

/**
 * 分析会话数据
 * 用于保存和恢复完整的分析过程
 */
export interface AnalysisSession {
  /** 会话唯一标识 */
  id: string;
  /** 用户自定义会话名称 */
  name: string;
  /** 会话描述/备注 */
  description?: string;
  /** 基础产品数据 */
  baseProduct: BaseProduct;
  /** 竞品数据 */
  competitorData: CompetitorData;
  /** 分析结果 */
  analysisResult: AnalysisResult;
  /** 当前角色视图 */
  roleView: RoleViewType;
  /** 创建时间 */
  createdAt: Date;
  /** 最后更新时间 */
  updatedAt: Date;
}

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  /** 默认角色视图 */
  defaultRoleView: RoleViewType;
  /** 是否自动保存会话 */
  autoSaveSession: boolean;
  /** 默认货币单位 */
  defaultCurrency: 'USD' | 'CNY' | 'EUR';
  /** 默认重量单位 */
  defaultWeightUnit: 'g' | 'kg' | 'oz' | 'lb';
  /** 默认尺寸单位 */
  defaultDimensionUnit: 'cm' | 'inch';
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  /** 输入验证错误 */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** NLP解析错误 */
  EXTRACTION_ERROR = 'EXTRACTION_ERROR',
  /** 计算错误 */
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  /** 数据存储错误 */
  STORAGE_ERROR = 'STORAGE_ERROR',
  /** 网络错误 */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** 未知错误 */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 应用错误信息
 */
export interface AppError {
  /** 错误类型 */
  type: ErrorType;
  /** 错误消息 */
  message: string;
  /** 详细错误信息 */
  details?: string;
  /** 错误发生时间 */
  timestamp: Date;
  /** 是否可重试 */
  retryable: boolean;
}

/**
 * API响应基础结构
 */
export interface ApiResponse<T = any> {
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 错误信息 */
  error?: AppError;
  /** 响应时间戳 */
  timestamp: Date;
}

/**
 * 文件上传结果
 */
export interface FileUploadResult {
  /** 文件名 */
  fileName: string;
  /** 文件大小 (bytes) */
  fileSize: number;
  /** 文件类型 */
  fileType: string;
  /** 提取的文本内容 */
  extractedText: string;
  /** 上传时间 */
  uploadedAt: Date;
}

/**
 * 图表导出选项
 */
export interface ChartExportOptions {
  /** 导出格式 */
  format: 'png' | 'svg' | 'pdf';
  /** 图片宽度 */
  width?: number;
  /** 图片高度 */
  height?: number;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 是否包含标题 */
  includeTitle?: boolean;
}