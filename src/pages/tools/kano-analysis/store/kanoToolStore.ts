import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { DataCleaningService } from '../services/DataCleaningService';
import { AIService } from '../services/AIService';
import { KanoAnalysisService, KANO_CATEGORIES } from '../services/KanoAnalysisService';

// 工作流步骤枚举
export enum WorkflowStep {
  IMPORT = 'import',           // 导入数据
  CONVERT = 'convert',         // 格式转换
  ORGANIZE = 'organize',       // 数据整理
  EXTRACT = 'extract',         // 功能提取
  SCORE = 'score',            // 情感积分
  OUTPUT = 'output'           // 结构化输出
}

// 步骤状态
export type StepStatus = 'pending' | 'processing' | 'completed' | 'error';

// 评论数据结构
export interface CommentData {
  id: string;
  content: string;
  source: string;
  timestamp?: Date;
  metadata: {
    platform: string;
    rating?: number;
    verified?: boolean;
  };
}

// 观点片段数据结构
export interface OpinionFragment {
  id: string;
  commentId: string; // 原始评论ID，用于回溯
  feature: string;
  rawText: string; // 证据原文
  sentimentType: string; // 对应情感类型
  confidence: number;
  position: [number, number]; // 在原文中的位置
  context: string; // 上下文信息
}

// 处理后的评论
export interface ProcessedComment extends CommentData {
  features: FeatureTag[];
  emotions: EmotionScore[];
  sizeInfo?: SizeInfo[];
  cleanedContent: string;
}

// 数据整理结果（用于持久化显示）
export interface OrganizeStepResult {
  beforeSamples: string[];
  afterSamples: string[];
  stats: {
    removed: number;
    duplicates: number;
    cleaned: number;
  };
}

// 功能提取结果（用于持久化显示）
export interface ExtractStepResult {
  totalFragments: number;
  avgFragmentsPerComment: number;
  topFeatures: { name: string; count: number }[];
  sampleFragments: OpinionFragment[];
}

// 情感积分结果（用于持久化显示）
export interface ScoreStepResult {
  analysisResults: any[]; // KanoAnalysisResult from service
  tableData: any[];
  statistics: {
    totalFeatures: number;
    totalFragments: number;
    categoryDistribution: Record<string, number>;
  };
}

// 功能标签
export interface FeatureTag {
  category: string;
  keywords: string[];
  confidence: number;
  position: [number, number];
}

// 情感得分
export interface EmotionScore {
  type: string;
  intensity: number; // 0-1
  confidence: number; // 0-1
  triggers: string[]; // 触发词
}

// 尺寸信息
export interface SizeInfo {
  value: number;
  unit: string;
  dimension: string;
  preference: string;
  sentiment: number;
}

// Kano功能
export interface KanoFeature {
  name: string;
  category: string;
  frequency: number;        // 基于观点片段的提及频率
  avgSentiment: number;     // 平均情感得分
  sentimentVariance: number; // 情感方差
  quadrant: string;         // Kano象限
  priority: number;
  fragments: OpinionFragment[]; // 关联的观点片段
  evidenceTexts: string[];      // 典型证据文本
}

// 分析结果
export interface KanoAnalysisResult {
  features: KanoFeature[];
  statistics: {
    totalFragments: number;
    totalFeatures: number;
    avgFragmentsPerComment: number;
    sentimentDistribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    rationale: string;
  }[];
}

// 工具数据
export interface KanoToolData {
  rawComments: CommentData[];
  cleanedComments: ProcessedComment[];
  fragments: OpinionFragment[];
  features: KanoFeature[];
  analysis: KanoAnalysisResult | null;
}

// 处理选项
export interface ProcessingOptions {
  removeEmpty: boolean;
  removeDuplicates: boolean;
  minLength: number;
  filterPatterns: string[];
}

// 分析参数
export interface AnalysisParams {
  frequencyThreshold: number;
  sentimentThreshold: number;
  varianceThreshold: number;
  maxFragmentsPerComment: number;
  confidenceThreshold: number;
}

// 导出设置
export interface ExportSettings {
  format: 'pdf' | 'excel' | 'json';
  includeCharts: boolean;
  includeRawData: boolean;
}

// 工具配置
export interface KanoToolConfig {
  processingOptions: ProcessingOptions;
  analysisParams: AnalysisParams;
  exportSettings: ExportSettings;
}

// 状态接口
interface KanoToolState {
  // 当前步骤
  currentStep: WorkflowStep;

  // 当前上传的文件（用于转换步骤）
  currentFile: File | null;

  // 步骤完成状态
  stepStatus: Record<WorkflowStep, StepStatus>;

  // 数据状态
  data: KanoToolData;

  // 步骤结果（持久化保存）
  stepResults: {
    organize: OrganizeStepResult | null;
    extract: ExtractStepResult | null;
    score: ScoreStepResult | null;
  };

  // UI状态
  ui: {
    loading: boolean;
    error: string | null;
    progress: number;
    selectedFeature: string | null;
    isAutoRunning: boolean;
  };

  // 配置状态
  config: KanoToolConfig;
}

// 动作接口
interface KanoToolActions {
  // 步骤控制
  setCurrentStep: (step: WorkflowStep) => void;
  setStepStatus: (step: WorkflowStep, status: StepStatus) => void;
  nextStep: () => void;
  previousStep: () => void;
  jumpToStep: (step: WorkflowStep) => void;

  // 文件管理
  setCurrentFile: (file: File | null) => void;

  // 数据更新
  setRawComments: (comments: CommentData[]) => void;
  setProcessedComments: (comments: ProcessedComment[]) => void;
  setFragments: (fragments: OpinionFragment[]) => void;
  setFeatures: (features: KanoFeature[]) => void;
  setAnalysis: (analysis: KanoAnalysisResult) => void;
  updateData: (data: Partial<KanoToolData>) => void;

  // UI控制
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: number) => void;
  setSelectedFeature: (feature: string | null) => void;

  // 步骤结果管理
  setOrganizeResult: (result: OrganizeStepResult) => void;
  setExtractResult: (result: ExtractStepResult) => void;
  setScoreResult: (result: ScoreStepResult) => void;

  // 配置管理
  updateProcessingOptions: (options: Partial<ProcessingOptions>) => void;
  updateAnalysisParams: (params: Partial<AnalysisParams>) => void;
  updateExportSettings: (settings: Partial<ExportSettings>) => void;

  // 重置
  resetTool: () => void;
  resetFromStep: (step: WorkflowStep) => void;

  // 自动运行
  startAutoAnalysis: () => Promise<void>;
  stopAutoAnalysis: () => void;
}

// 步骤顺序
const stepOrder = [
  WorkflowStep.IMPORT,
  WorkflowStep.CONVERT,
  WorkflowStep.ORGANIZE,
  WorkflowStep.EXTRACT,
  WorkflowStep.SCORE,
  WorkflowStep.OUTPUT
];

// 初始状态
const initialState: KanoToolState = {
  currentStep: WorkflowStep.IMPORT,
  stepStatus: {
    [WorkflowStep.IMPORT]: 'pending',
    [WorkflowStep.CONVERT]: 'pending',
    [WorkflowStep.ORGANIZE]: 'pending',
    [WorkflowStep.EXTRACT]: 'pending',
    [WorkflowStep.SCORE]: 'pending',
    [WorkflowStep.OUTPUT]: 'pending',
  },
  currentFile: null,
  data: {
    rawComments: [],
    cleanedComments: [],
    fragments: [],
    features: [],
    analysis: null,
  },
  stepResults: {
    organize: null,
    extract: null,
    score: null,
  },
  ui: {
    loading: false,
    error: null,
    progress: 0,
    selectedFeature: null,
    isAutoRunning: false,
  },
  config: {
    processingOptions: {
      removeEmpty: true,
      removeDuplicates: true,
      minLength: 5,
      filterPatterns: [],
    },
    analysisParams: {
      frequencyThreshold: 0.01,
      sentimentThreshold: 0.1,
      varianceThreshold: 0.3,
      maxFragmentsPerComment: 10,
      confidenceThreshold: 0.5,
    },
    exportSettings: {
      format: 'pdf',
      includeCharts: true,
      includeRawData: false,
    },
  },
};

// 创建store
export const useKanoToolStore = create<KanoToolState & KanoToolActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 步骤控制
      setCurrentStep: (step) => set({ currentStep: step }),

      setStepStatus: (step, status) =>
        set((state) => ({
          stepStatus: { ...state.stepStatus, [step]: status }
        })),

      nextStep: () => {
        const { currentStep } = get();
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex < stepOrder.length - 1) {
          set({ currentStep: stepOrder[currentIndex + 1] });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) {
          set({ currentStep: stepOrder[currentIndex - 1] });
        }
      },

      jumpToStep: (step) => set({ currentStep: step }),

      setCurrentFile: (file) => set({ currentFile: file }),

      // 数据更新
      setRawComments: (comments) =>
        set((state) => ({
          data: { ...state.data, rawComments: comments }
        })),

      setProcessedComments: (comments) =>
        set((state) => ({
          data: { ...state.data, cleanedComments: comments }
        })),

      setFragments: (fragments) =>
        set((state) => ({
          data: { ...state.data, fragments }
        })),

      setFeatures: (features) =>
        set((state) => ({
          data: { ...state.data, features }
        })),

      setAnalysis: (analysis) =>
        set((state) => ({
          data: { ...state.data, analysis }
        })),

      updateData: (data) =>
        set((state) => ({
          data: { ...state.data, ...data }
        })),

      // UI控制
      setLoading: (loading) =>
        set((state) => ({
          ui: { ...state.ui, loading }
        })),

      setError: (error) =>
        set((state) => ({
          ui: { ...state.ui, error }
        })),

      setProgress: (progress) =>
        set((state) => ({
          ui: { ...state.ui, progress }
        })),

      setSelectedFeature: (feature) =>
        set((state) => ({
          ui: { ...state.ui, selectedFeature: feature }
        })),

      // 步骤结果管理
      setOrganizeResult: (result) =>
        set((state) => ({
          stepResults: { ...state.stepResults, organize: result }
        })),

      setExtractResult: (result) =>
        set((state) => ({
          stepResults: { ...state.stepResults, extract: result }
        })),

      setScoreResult: (result) =>
        set((state) => ({
          stepResults: { ...state.stepResults, score: result }
        })),

      // 配置管理
      updateProcessingOptions: (options) =>
        set((state) => ({
          config: {
            ...state.config,
            processingOptions: { ...state.config.processingOptions, ...options }
          }
        })),

      updateAnalysisParams: (params) =>
        set((state) => ({
          config: {
            ...state.config,
            analysisParams: { ...state.config.analysisParams, ...params }
          }
        })),

      updateExportSettings: (settings) =>
        set((state) => ({
          config: {
            ...state.config,
            exportSettings: { ...state.config.exportSettings, ...settings }
          }
        })),

      // 重置
      resetTool: () => set(initialState),

      resetFromStep: (step) => {
        const stepIndex = stepOrder.indexOf(step);
        const resetSteps = stepOrder.slice(stepIndex);

        set((state) => {
          const newStepStatus = { ...state.stepStatus };
          resetSteps.forEach(s => {
            newStepStatus[s] = 'pending';
          });

          return {
            currentStep: step,
            stepStatus: newStepStatus,
            data: {
              ...state.data,
              // 根据步骤重置相应数据
              ...(stepIndex <= 1 && { cleanedComments: [] }),
              ...(stepIndex <= 2 && { fragments: [] }),
              ...(stepIndex <= 3 && { features: [] }),
              ...(stepIndex <= 4 && { analysis: null }),
            },
            stepResults: {
              ...state.stepResults,
              // 根据步骤重置相应结果
              ...(stepIndex <= 2 && { organize: null }),
              ...(stepIndex <= 3 && { extract: null }),
              ...(stepIndex <= 4 && { score: null }),
            },
            ui: {
              ...state.ui,
              error: null,
              progress: 0,
            }
          };
        });
      },

      stopAutoAnalysis: () => {
        set((state) => ({
          ui: { ...state.ui, isAutoRunning: false, loading: false }
        }));
      },

      startAutoAnalysis: async () => {
        const { data, config, setStepStatus, setCurrentStep, setProcessedComments, setFragments, setFeatures, setAnalysis, setOrganizeResult, setExtractResult, setScoreResult } = get();

        // 辅助延迟函数
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        if (data.rawComments.length === 0) {
          set((state) => ({ ui: { ...state.ui, error: '没有可处理的数据' } }));
          return;
        }

        set((state) => ({
          ui: { ...state.ui, isAutoRunning: true, loading: true, error: null, progress: 0 }
        }));

        try {
          // 0. 格式转换 (Convert) - 显示处理动画
          setCurrentStep(WorkflowStep.CONVERT);
          setStepStatus(WorkflowStep.CONVERT, 'processing');

          // 模拟格式转换过程
          for (let i = 0; i <= 100; i += 20) {
            if (!get().ui.isAutoRunning) return;
            set((state) => ({ ui: { ...state.ui, progress: i } }));
            await delay(200);
          }

          setStepStatus(WorkflowStep.CONVERT, 'completed');
          await delay(800); // 让用户看到完成状态

          // 检查是否停止
          if (!get().ui.isAutoRunning) return;

          // 1. 数据整理 (Organize)
          setCurrentStep(WorkflowStep.ORGANIZE);
          setStepStatus(WorkflowStep.ORGANIZE, 'processing');
          set((state) => ({ ui: { ...state.ui, progress: 0 } }));

          const cleaningResult = await DataCleaningService.clean(
            data.rawComments,
            config.processingOptions,
            (progress) => {
              if (get().ui.isAutoRunning) {
                set((state) => ({ ui: { ...state.ui, progress } }));
              }
            }
          );

          setProcessedComments(cleaningResult.cleaned);

          // 保存数据整理结果
          const organizeResult: OrganizeStepResult = {
            beforeSamples: data.rawComments.slice(0, 3).map(c => c.content),
            afterSamples: cleaningResult.cleaned.slice(0, 3).map(c => c.cleanedContent),
            stats: cleaningResult.stats
          };
          setOrganizeResult(organizeResult);

          setStepStatus(WorkflowStep.ORGANIZE, 'completed');
          await delay(1500); // 让用户看到完成状态和结果

          // 检查是否停止
          if (!get().ui.isAutoRunning) return;

          // 2. 功能提取 (Extract)
          setCurrentStep(WorkflowStep.EXTRACT);
          setStepStatus(WorkflowStep.EXTRACT, 'processing');
          set((state) => ({ ui: { ...state.ui, progress: 0 } }));

          const fragments = await AIService.batchExtractFragments(
            cleaningResult.cleaned.map(c => ({ id: c.id, content: c.cleanedContent })),
            AIService.getDefaultConfig(),
            (progress) => {
              if (get().ui.isAutoRunning) {
                set((state) => ({ ui: { ...state.ui, progress } }));
              }
            }
          );

          setFragments(fragments);

          // 保存功能提取结果
          const featureCounts: Record<string, number> = {};
          fragments.forEach(fragment => {
            featureCounts[fragment.feature] = (featureCounts[fragment.feature] || 0) + 1;
          });

          const topFeatures = Object.entries(featureCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));

          const extractResult: ExtractStepResult = {
            totalFragments: fragments.length,
            avgFragmentsPerComment: cleaningResult.cleaned.length > 0 ? fragments.length / cleaningResult.cleaned.length : 0,
            topFeatures,
            sampleFragments: fragments.slice(0, 5)
          };
          setExtractResult(extractResult);

          setStepStatus(WorkflowStep.EXTRACT, 'completed');
          await delay(1500); // 让用户看到完成状态和结果

          // 检查是否停止
          if (!get().ui.isAutoRunning) return;

          // 3. 情感积分 (Score)
          setCurrentStep(WorkflowStep.SCORE);
          setStepStatus(WorkflowStep.SCORE, 'processing');
          set((state) => ({ ui: { ...state.ui, progress: 0 } }));

          // 模拟分析过程的进度
          for (let i = 0; i <= 80; i += 20) {
            if (!get().ui.isAutoRunning) return;
            set((state) => ({ ui: { ...state.ui, progress: i } }));
            await delay(300);
          }

          const analysisResults = KanoAnalysisService.analyzeFragments(fragments);
          const features: KanoFeature[] = analysisResults.map(result => ({
            name: result.feature,
            category: result.finalCategory,
            frequency: result.totalVotes,
            avgSentiment: 0,
            sentimentVariance: 0,
            quadrant: KANO_CATEGORIES[result.finalCategory as keyof typeof KANO_CATEGORIES]?.name || '未知',
            priority: result.betterCoefficient,
            fragments: result.fragments,
            evidenceTexts: result.evidenceTexts
          }));

          setFeatures(features);

          // 保存情感积分结果
          const tableData = KanoAnalysisService.generateKanoTable(analysisResults);
          const categoryDistribution: Record<string, number> = {};
          analysisResults.forEach(result => {
            categoryDistribution[result.finalCategory] = (categoryDistribution[result.finalCategory] || 0) + 1;
          });

          const scoreResult: ScoreStepResult = {
            analysisResults,
            tableData,
            statistics: {
              totalFeatures: analysisResults.length,
              totalFragments: fragments.length,
              categoryDistribution
            }
          };
          setScoreResult(scoreResult);

          // 生成完整的分析结果对象
          const analysis: KanoAnalysisResult = {
            features: features,
            statistics: {
              totalFragments: fragments.length,
              totalFeatures: analysisResults.length,
              avgFragmentsPerComment: fragments.length / data.rawComments.length,
              sentimentDistribution: { positive: 0, negative: 0, neutral: 0 }
            },
            recommendations: KanoAnalysisService.generateRecommendations(analysisResults)
          };
          setAnalysis(analysis);

          set((state) => ({ ui: { ...state.ui, progress: 100 } }));
          await delay(500);

          setStepStatus(WorkflowStep.SCORE, 'completed');
          await delay(1500); // 让用户看到完成状态和结果

          // 检查是否停止
          if (!get().ui.isAutoRunning) return;

          // 4. 完成，跳转到输出页
          setCurrentStep(WorkflowStep.OUTPUT);
          setStepStatus(WorkflowStep.OUTPUT, 'completed');

        } catch (error) {
          console.error('Auto analysis failed:', error);
          set((state) => ({
            ui: { ...state.ui, error: error instanceof Error ? error.message : '自动分析失败', isAutoRunning: false, loading: false }
          }));
        } finally {
          set((state) => ({
            ui: { ...state.ui, isAutoRunning: false, loading: false, progress: 0 }
          }));
        }
      },
    }),
    {
      name: 'kano-tool-store',
    }
  )
);

// ------------------------------------------------------------------
// Selectors for optimized re-renders
// ------------------------------------------------------------------

export const selectWorkflowState = (state: KanoToolState) => ({
  currentStep: state.currentStep,
  stepStatus: state.stepStatus,
});

export const selectToolData = (state: KanoToolState) => state.data;

export const selectUIState = (state: KanoToolState) => state.ui;

export const selectConfig = (state: KanoToolState) => state.config;

export const selectStepResults = (state: KanoToolState) => state.stepResults;

export const selectActionActions = (actions: KanoToolActions) => ({
  setCurrentStep: actions.setCurrentStep,
  setStepStatus: actions.setStepStatus,
  nextStep: actions.nextStep,
  previousStep: actions.previousStep,
  jumpToStep: actions.jumpToStep,
  resetTool: actions.resetTool,
  resetFromStep: actions.resetFromStep,
  startAutoAnalysis: actions.startAutoAnalysis,
  stopAutoAnalysis: actions.stopAutoAnalysis,
});

export const selectFileActions = (actions: KanoToolActions) => ({
  setCurrentFile: actions.setCurrentFile,
});

export const selectDataActions = (actions: KanoToolActions) => ({
  setRawComments: actions.setRawComments,
  setProcessedComments: actions.setProcessedComments,
  setFragments: actions.setFragments,
  setFeatures: actions.setFeatures,
  setAnalysis: actions.setAnalysis,
  updateData: actions.updateData,
  setOrganizeResult: actions.setOrganizeResult,
  setExtractResult: actions.setExtractResult,
  setScoreResult: actions.setScoreResult,
});

export const selectUIActions = (actions: KanoToolActions) => ({
  setLoading: actions.setLoading,
  setError: actions.setError,
  setProgress: actions.setProgress,
  setSelectedFeature: actions.setSelectedFeature,
});

export const selectConfigActions = (actions: KanoToolActions) => ({
  updateProcessingOptions: actions.updateProcessingOptions,
  updateAnalysisParams: actions.updateAnalysisParams,
  updateExportSettings: actions.updateExportSettings,
});

export { useShallow };