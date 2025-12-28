/**
 * 智能竞品分析状态管理导出文件
 * 统一管理所有状态store的导入导出
 */

// 主要状态store导出
export {
  useCompetitorAnalysisStore,
  useShallow
} from './competitorAnalysisStore';

// 状态类型导出
export type * from '../types';

// 选择器函数导出（用于测试）
export {
  selectWorkflowState,
  selectAnalysisData,
  selectSessionState,
  selectBaseProduct
} from './competitorAnalysisStore';