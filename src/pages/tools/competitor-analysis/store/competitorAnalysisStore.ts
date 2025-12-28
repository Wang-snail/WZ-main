/**
 * 智能竞品分析工具的Zustand状态管理store
 * 管理整个分析工作流的状态、数据和操作
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type {
  BaseProduct,
  CompetitorData,
  AnalysisResult,
  AnalysisSession,
  RoleViewType,
  WorkflowStep,
  UserPreferences,
  AppError
} from '../types';
import { ErrorType } from '../types';

/**
 * 步骤状态枚举
 */
export type StepStatus = 'pending' | 'processing' | 'completed' | 'error';

/**
 * UI状态接口
 */
interface UIState {
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: AppError | null;
  /** 处理进度 (0-100) */
  progress: number;
  /** 是否显示帮助信息 */
  showHelp: boolean;
  /** 是否显示历史记录面板 */
  showHistory: boolean;
  /** 当前选中的会话ID */
  selectedSessionId: string | null;
}

/**
 * 主要状态接口
 */
interface CompetitorAnalysisState {
  // 工作流状态
  /** 当前工作流步骤 */
  currentStep: WorkflowStep;
  /** 各步骤的完成状态 */
  stepStatus: Record<WorkflowStep, StepStatus>;

  // 核心数据
  /** 基础产品信息 */
  baseProduct: BaseProduct | null;
  /** 竞品数据 */
  competitorData: CompetitorData | null;
  /** 分析结果 */
  analysisResult: AnalysisResult | null;

  // 用户设置
  /** 当前角色视图 */
  roleView: RoleViewType;
  /** 用户偏好设置 */
  preferences: UserPreferences;

  // 会话管理
  /** 当前会话ID */
  currentSessionId: string | null;
  /** 历史会话列表 */
  sessions: AnalysisSession[];

  // UI状态
  ui: UIState;

  // 临时数据
  /** 原始输入文本 */
  rawInputText: string;
  /** 上传的文件信息 */
  uploadedFile: File | null;
}

/**
 * 操作接口
 */
interface CompetitorAnalysisActions {
  // 工作流控制
  /** 设置当前步骤 */
  setCurrentStep: (step: WorkflowStep) => void;
  /** 设置步骤状态 */
  setStepStatus: (step: WorkflowStep, status: StepStatus) => void;
  /** 进入下一步 */
  nextStep: () => void;
  /** 返回上一步 */
  previousStep: () => void;
  /** 跳转到指定步骤 */
  jumpToStep: (step: WorkflowStep) => void;
  /** 重置工作流到指定步骤 */
  resetFromStep: (step: WorkflowStep) => void;

  // 数据管理
  /** 设置基础产品信息 */
  setBaseProduct: (product: BaseProduct) => void;
  /** 更新基础产品信息 */
  updateBaseProduct: (updates: Partial<BaseProduct>) => void;
  /** 设置竞品数据 */
  setCompetitorData: (data: CompetitorData) => void;
  /** 更新竞品数据 */
  updateCompetitorData: (updates: Partial<CompetitorData>) => void;
  /** 设置分析结果 */
  setAnalysisResult: (result: AnalysisResult) => void;

  // 输入管理
  /** 设置原始输入文本 */
  setRawInputText: (text: string) => void;
  /** 设置上传文件 */
  setUploadedFile: (file: File | null) => void;

  // 角色视图管理
  /** 切换角色视图 */
  switchRoleView: (role: RoleViewType) => void;
  /** 更新用户偏好 */
  updatePreferences: (updates: Partial<UserPreferences>) => void;

  // 会话管理
  /** 创建新会话 */
  createNewSession: (name?: string) => string;
  /** 保存当前会话 */
  saveCurrentSession: (name: string, description?: string) => Promise<void>;
  /** 加载会话 */
  loadSession: (sessionId: string) => Promise<void>;
  /** 删除会话 */
  deleteSession: (sessionId: string) => void;
  /** 更新会话信息 */
  updateSession: (sessionId: string, updates: Partial<AnalysisSession>) => void;

  // UI控制
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置错误信息 */
  setError: (error: AppError | null) => void;
  /** 设置进度 */
  setProgress: (progress: number) => void;
  /** 切换帮助显示 */
  toggleHelp: () => void;
  /** 切换历史记录显示 */
  toggleHistory: () => void;
  /** 设置选中的会话 */
  setSelectedSession: (sessionId: string | null) => void;

  // 工具方法
  /** 完全重置状态 */
  resetAll: () => void;
  /** 清除当前分析数据 */
  clearAnalysisData: () => void;
  /** 生成会话ID */
  generateSessionId: () => string;
}

/**
 * 工作流步骤顺序
 */
const WORKFLOW_STEPS: WorkflowStep[] = ['config', 'input', 'extract', 'analyze', 'result'];

/**
 * 默认用户偏好设置
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  defaultRoleView: 'retail',
  autoSaveSession: true,
  defaultCurrency: 'USD',
  defaultWeightUnit: 'g',
  defaultDimensionUnit: 'cm'
};

/**
 * 初始状态
 */
const initialState: CompetitorAnalysisState = {
  // 工作流状态
  currentStep: 'config',
  stepStatus: {
    config: 'pending',
    input: 'pending',
    extract: 'pending',
    analyze: 'pending',
    result: 'pending'
  },

  // 核心数据
  baseProduct: null,
  competitorData: null,
  analysisResult: null,

  // 用户设置
  roleView: 'retail',
  preferences: DEFAULT_PREFERENCES,

  // 会话管理
  currentSessionId: null,
  sessions: [],

  // UI状态
  ui: {
    loading: false,
    error: null,
    progress: 0,
    showHelp: false,
    showHistory: false,
    selectedSessionId: null
  },

  // 临时数据
  rawInputText: '',
  uploadedFile: null
};

/**
 * 创建错误对象的辅助函数
 */
const createError = (type: ErrorType, message: string, details?: string, retryable = false): AppError => ({
  type,
  message,
  details,
  timestamp: new Date(),
  retryable
});

/**
 * 生成唯一ID的辅助函数
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * 创建智能竞品分析store
 */
export const useCompetitorAnalysisStore = create<CompetitorAnalysisState & CompetitorAnalysisActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 工作流控制
      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      setStepStatus: (step, status) => {
        set((state) => ({
          stepStatus: { ...state.stepStatus, [step]: status }
        }));
      },

      nextStep: () => {
        const { currentStep } = get();
        const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
        if (currentIndex < WORKFLOW_STEPS.length - 1) {
          const nextStep = WORKFLOW_STEPS[currentIndex + 1];
          set({ currentStep: nextStep });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
        if (currentIndex > 0) {
          const prevStep = WORKFLOW_STEPS[currentIndex - 1];
          set({ currentStep: prevStep });
        }
      },

      jumpToStep: (step) => {
        set({ currentStep: step });
      },

      resetFromStep: (step) => {
        const stepIndex = WORKFLOW_STEPS.indexOf(step);
        const resetSteps = WORKFLOW_STEPS.slice(stepIndex);

        set((state) => {
          const newStepStatus = { ...state.stepStatus };
          resetSteps.forEach(s => {
            newStepStatus[s] = 'pending';
          });

          return {
            currentStep: step,
            stepStatus: newStepStatus,
            // 根据步骤重置相应数据
            ...(stepIndex <= 1 && { competitorData: null }),
            ...(stepIndex <= 2 && { analysisResult: null }),
            ui: {
              ...state.ui,
              error: null,
              progress: 0
            }
          };
        });
      },

      // 数据管理
      setBaseProduct: (product) => {
        set({ baseProduct: product });
      },

      updateBaseProduct: (updates) => {
        set((state) => ({
          baseProduct: state.baseProduct ? { ...state.baseProduct, ...updates } : null
        }));
      },

      setCompetitorData: (data) => {
        set({ competitorData: data });
      },

      updateCompetitorData: (updates) => {
        set((state) => ({
          competitorData: state.competitorData ? { ...state.competitorData, ...updates } : null
        }));
      },

      setAnalysisResult: (result) => {
        set({ analysisResult: result });
      },

      // 输入管理
      setRawInputText: (text) => {
        set({ rawInputText: text });
      },

      setUploadedFile: (file) => {
        set({ uploadedFile: file });
      },

      // 角色视图管理
      switchRoleView: (role) => {
        set({ roleView: role });
      },

      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates }
        }));
      },

      // 会话管理
      createNewSession: (name) => {
        const sessionId = generateId();
        const sessionName = name || `分析会话 ${new Date().toLocaleString()}`;

        set((state) => ({
          currentSessionId: sessionId,
          sessions: [...state.sessions, {
            id: sessionId,
            name: sessionName,
            description: '',
            baseProduct: state.baseProduct!,
            competitorData: state.competitorData!,
            analysisResult: state.analysisResult!,
            roleView: state.roleView,
            createdAt: new Date(),
            updatedAt: new Date()
          }]
        }));

        return sessionId;
      },

      saveCurrentSession: async (name, description) => {
        const { baseProduct, competitorData, analysisResult, roleView, currentSessionId } = get();

        if (!baseProduct || !competitorData || !analysisResult) {
          throw createError(
            ErrorType.VALIDATION_ERROR,
            '无法保存会话：缺少必要的分析数据',
            '请确保已完成产品配置、竞品分析和结果生成',
            false
          );
        }

        const sessionId = currentSessionId || generateId();
        const now = new Date();

        const session: AnalysisSession = {
          id: sessionId,
          name,
          description: description || '',
          baseProduct,
          competitorData,
          analysisResult,
          roleView,
          createdAt: currentSessionId ? get().sessions.find(s => s.id === sessionId)?.createdAt || now : now,
          updatedAt: now
        };

        set((state) => {
          const existingIndex = state.sessions.findIndex(s => s.id === sessionId);
          const newSessions = [...state.sessions];

          if (existingIndex >= 0) {
            newSessions[existingIndex] = session;
          } else {
            newSessions.push(session);
          }

          return {
            currentSessionId: sessionId,
            sessions: newSessions
          };
        });
      },

      loadSession: async (sessionId) => {
        const { sessions } = get();
        const session = sessions.find(s => s.id === sessionId);

        if (!session) {
          throw createError(
            ErrorType.STORAGE_ERROR,
            '会话不存在',
            `无法找到ID为 ${sessionId} 的会话`,
            false
          );
        }

        set({
          currentSessionId: sessionId,
          baseProduct: session.baseProduct,
          competitorData: session.competitorData,
          analysisResult: session.analysisResult,
          roleView: session.roleView,
          currentStep: 'result', // 加载会话后直接跳转到结果页
          stepStatus: {
            config: 'completed',
            input: 'completed',
            extract: 'completed',
            analyze: 'completed',
            result: 'completed'
          }
        });
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId),
          ...(state.currentSessionId === sessionId && { currentSessionId: null })
        }));
      },

      updateSession: (sessionId, updates) => {
        set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, ...updates, updatedAt: new Date() }
              : session
          )
        }));
      },

      // UI控制
      setLoading: (loading) => {
        set((state) => ({
          ui: { ...state.ui, loading }
        }));
      },

      setError: (error) => {
        set((state) => ({
          ui: { ...state.ui, error }
        }));
      },

      setProgress: (progress) => {
        set((state) => ({
          ui: { ...state.ui, progress: Math.max(0, Math.min(100, progress)) }
        }));
      },

      toggleHelp: () => {
        set((state) => ({
          ui: { ...state.ui, showHelp: !state.ui.showHelp }
        }));
      },

      toggleHistory: () => {
        set((state) => ({
          ui: { ...state.ui, showHistory: !state.ui.showHistory }
        }));
      },

      setSelectedSession: (sessionId) => {
        set((state) => ({
          ui: { ...state.ui, selectedSessionId: sessionId }
        }));
      },

      // 工具方法
      resetAll: () => {
        set(initialState);
      },

      clearAnalysisData: () => {
        set({
          competitorData: null,
          analysisResult: null,
          rawInputText: '',
          uploadedFile: null,
          currentStep: 'config',
          stepStatus: {
            config: 'pending',
            input: 'pending',
            extract: 'pending',
            analyze: 'pending',
            result: 'pending'
          },
          ui: {
            ...get().ui,
            error: null,
            progress: 0
          }
        });
      },

      generateSessionId: () => generateId()
    }),
    {
      name: 'competitor-analysis-store'
    }
  )
);

/**
 * 选择器函数 - 提供稳定的状态访问
 * 注意：这些是纯函数，不是 hooks，避免循环依赖
 */

// 工作流步骤常量（用于选择器中）
const WORKFLOW_STEPS_ARRAY = ['config', 'input', 'extract', 'analyze', 'result'] as const;

/** 获取当前工作流状态的选择器 */
export const selectWorkflowState = (state: CompetitorAnalysisState & CompetitorAnalysisActions) => {
  const currentIndex = WORKFLOW_STEPS_ARRAY.indexOf(state.currentStep);
  return {
    currentStep: state.currentStep,
    stepStatus: state.stepStatus,
    canGoNext: state.stepStatus[state.currentStep] === 'completed' && currentIndex < WORKFLOW_STEPS_ARRAY.length - 1,
    canGoPrevious: currentIndex > 0
  };
};

/** 获取分析数据状态的选择器 */
export const selectAnalysisData = (state: CompetitorAnalysisState & CompetitorAnalysisActions) => ({
  baseProduct: state.baseProduct,
  competitorData: state.competitorData,
  analysisResult: state.analysisResult,
  hasCompleteData: !!(state.baseProduct && state.competitorData && state.analysisResult)
});

/** 获取UI状态的选择器 */
export const selectUIState = (state: CompetitorAnalysisState & CompetitorAnalysisActions) => state.ui;

/** 获取会话管理状态的选择器 */
export const selectSessionState = (state: CompetitorAnalysisState & CompetitorAnalysisActions) => ({
  currentSessionId: state.currentSessionId,
  sessions: state.sessions,
  hasActiveSessions: state.sessions.length > 0
});

/** 获取基础产品信息的选择器 */
export const selectBaseProduct = (state: CompetitorAnalysisState) => state.baseProduct;

/** 获取工作流控制动作的选择器 */
export const selectWorkflowActions = (state: CompetitorAnalysisActions) => ({
  setCurrentStep: state.setCurrentStep,
  setStepStatus: state.setStepStatus,
  nextStep: state.nextStep,
  previousStep: state.previousStep,
  jumpToStep: state.jumpToStep,
  resetFromStep: state.resetFromStep
});

/** 获取UI控制动作的选择器 */
export const selectUIActions = (state: CompetitorAnalysisActions) => ({
  setLoading: state.setLoading,
  setError: state.setError,
  setProgress: state.setProgress,
  toggleHelp: state.toggleHelp,
  toggleHistory: state.toggleHistory
});

/** 导出 useShallow 方便组件使用 */
export { useShallow };