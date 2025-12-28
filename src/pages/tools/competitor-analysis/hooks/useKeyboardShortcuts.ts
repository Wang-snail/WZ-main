/**
 * 键盘快捷键Hook
 * 为竞品分析页面提供键盘快捷键功能
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useCompetitorAnalysisStore, useShallow } from '../store/competitorAnalysisStore';
import { keyboardShortcuts, DEFAULT_SHORTCUTS } from '../services/KeyboardShortcutService';

// 工作流步骤定义
const WORKFLOW_STEPS = ['config', 'input', 'extract', 'analyze', 'result'] as const;

/**
 * 键盘快捷键Hook
 */
export const useKeyboardShortcuts = () => {
  // 使用 useShallow 优化性能
  const { currentStep, stepStatus } = useCompetitorAnalysisStore(
    useShallow((state: any) => ({
      currentStep: state.currentStep,
      stepStatus: state.stepStatus
    }))
  );

  const {
    nextStep,
    previousStep,
    jumpToStep,
    resetFromStep,
    toggleHelp,
    saveCurrentSession,
    clearAnalysisData
  } = useCompetitorAnalysisStore(state => ({
    nextStep: state.nextStep,
    previousStep: state.previousStep,
    jumpToStep: state.jumpToStep,
    resetFromStep: state.resetFromStep,
    toggleHelp: state.toggleHelp,
    saveCurrentSession: state.saveCurrentSession,
    clearAnalysisData: state.clearAnalysisData
  }));

  // 计算是否可以前进/后退
  const { canGoNext, canGoPrevious } = useMemo(() => {
    const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
    const stepComplete = stepStatus[currentStep] === 'completed';
    return {
      canGoPrevious: currentIndex > 0,
      canGoNext: currentIndex < WORKFLOW_STEPS.length - 1 && stepComplete
    };
  }, [currentStep, stepStatus]);

  /**
   * 执行分析操作
   */
  const handleAnalyze = useCallback(() => {
    // 根据当前步骤执行相应的分析操作
    switch (currentStep) {
      case 'config':
        // 如果产品配置完成，进入下一步
        if (canGoNext) {
          nextStep();
        }
        break;
      case 'input':
        // 触发智能解析
        const analyzeButton = document.querySelector('[data-action="analyze"]') as HTMLButtonElement;
        if (analyzeButton && !analyzeButton.disabled) {
          analyzeButton.click();
        }
        break;
      case 'extract':
        // 确认提取的数据
        const confirmButton = document.querySelector('[data-action="confirm"]') as HTMLButtonElement;
        if (confirmButton && !confirmButton.disabled) {
          confirmButton.click();
        }
        break;
      case 'analyze':
        // 分析步骤通常是自动的，不需要用户操作
        break;
      case 'result':
        // 在结果页面，可能触发重新分析或保存
        break;
    }
  }, [currentStep, canGoNext, nextStep]);

  /**
   * 保存会话
   */
  const handleSaveSession = useCallback(async () => {
    try {
      const sessionName = `分析会话 ${new Date().toLocaleString()}`;
      await saveCurrentSession(sessionName);
      
      // 显示保存成功提示
      const event = new CustomEvent('show-toast', {
        detail: { message: '会话保存成功', type: 'success' }
      });
      window.dispatchEvent(event);
    } catch (error) {
      // 显示保存失败提示
      const event = new CustomEvent('show-toast', {
        detail: { message: '会话保存失败', type: 'error' }
      });
      window.dispatchEvent(event);
    }
  }, [saveCurrentSession]);

  /**
   * 新建分析
   */
  const handleNewAnalysis = useCallback(() => {
    if (confirm('确定要开始新的分析吗？当前未保存的数据将丢失。')) {
      clearAnalysisData();
      jumpToStep('config');
    }
  }, [clearAnalysisData, jumpToStep]);

  /**
   * 重置当前步骤
   */
  const handleResetStep = useCallback(() => {
    if (confirm('确定要重置当前步骤吗？')) {
      resetFromStep(currentStep);
    }
  }, [resetFromStep, currentStep]);

  /**
   * 显示快捷键帮助
   */
  const handleShowShortcutsHelp = useCallback(() => {
    const event = new CustomEvent('show-shortcuts-help');
    window.dispatchEvent(event);
  }, []);

  /**
   * 关闭弹窗/取消操作
   */
  const handleEscape = useCallback(() => {
    // 关闭所有打开的弹窗
    const event = new CustomEvent('close-modals');
    window.dispatchEvent(event);
  }, []);

  /**
   * 上一步
   */
  const handlePreviousStep = useCallback(() => {
    if (canGoPrevious) {
      previousStep();
    }
  }, [canGoPrevious, previousStep]);

  /**
   * 下一步
   */
  const handleNextStep = useCallback(() => {
    if (canGoNext) {
      nextStep();
    }
  }, [canGoNext, nextStep]);

  /**
   * 注册快捷键
   */
  useEffect(() => {
    // 创建自定义的快捷键配置
    const customShortcuts = {
      ...DEFAULT_SHORTCUTS,
      NAVIGATION: {
        ...DEFAULT_SHORTCUTS.NAVIGATION,
        shortcuts: DEFAULT_SHORTCUTS.NAVIGATION.shortcuts.map(shortcut => {
          if (shortcut.key === 'ArrowLeft' && shortcut.ctrl) {
            return { ...shortcut, callback: handlePreviousStep };
          }
          if (shortcut.key === 'ArrowRight' && shortcut.ctrl) {
            return { ...shortcut, callback: handleNextStep };
          }
          return shortcut;
        })
      },
      ACTIONS: {
        ...DEFAULT_SHORTCUTS.ACTIONS,
        shortcuts: DEFAULT_SHORTCUTS.ACTIONS.shortcuts.map(shortcut => {
          if (shortcut.key === 'Enter' && shortcut.ctrl) {
            return { ...shortcut, callback: handleAnalyze };
          }
          if (shortcut.key === 's' && shortcut.ctrl) {
            return { ...shortcut, callback: handleSaveSession };
          }
          if (shortcut.key === 'n' && shortcut.ctrl) {
            return { ...shortcut, callback: handleNewAnalysis };
          }
          if (shortcut.key === 'r' && shortcut.ctrl) {
            return { ...shortcut, callback: handleResetStep };
          }
          return shortcut;
        })
      },
      UI: {
        ...DEFAULT_SHORTCUTS.UI,
        shortcuts: DEFAULT_SHORTCUTS.UI.shortcuts.map(shortcut => {
          if (shortcut.key === 'h' && shortcut.ctrl) {
            return { ...shortcut, callback: toggleHelp };
          }
          if (shortcut.key === 'Escape') {
            return { ...shortcut, callback: handleEscape };
          }
          if (shortcut.key === 'F1') {
            return { ...shortcut, callback: handleShowShortcutsHelp };
          }
          return shortcut;
        })
      }
    };

    // 注册快捷键组
    Object.entries(customShortcuts).forEach(([groupName, group]) => {
      keyboardShortcuts.registerShortcutGroup(groupName, group);
    });

    // 启用快捷键
    keyboardShortcuts.setEnabled(true);

    // 清理函数
    return () => {
      // 取消注册快捷键组
      Object.keys(customShortcuts).forEach(groupName => {
        keyboardShortcuts.unregisterShortcutGroup(groupName);
      });
    };
  }, [
    handlePreviousStep,
    handleNextStep,
    handleAnalyze,
    handleSaveSession,
    handleNewAnalysis,
    handleResetStep,
    toggleHelp,
    handleEscape,
    handleShowShortcutsHelp
  ]);

  /**
   * 根据当前步骤启用/禁用特定快捷键
   */
  useEffect(() => {
    // 这里可以根据当前步骤动态调整快捷键的可用性
    // 例如，在某些步骤禁用某些快捷键
  }, [currentStep]);

  return {
    // 返回一些有用的方法供组件使用
    showShortcutsHelp: handleShowShortcutsHelp,
    enableShortcuts: () => keyboardShortcuts.setEnabled(true),
    disableShortcuts: () => keyboardShortcuts.setEnabled(false)
  };
};

export default useKeyboardShortcuts;