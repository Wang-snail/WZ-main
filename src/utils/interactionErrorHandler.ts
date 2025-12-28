/**
 * 交互错误处理系统
 * 处理连接验证、拖拽操作失败和UI状态同步问题
 */

import { errorHandler, ErrorCategory, ErrorSeverity } from '@/lib/lab/ErrorHandler';

export interface InteractionError {
  type: 'connection_validation' | 'drag_operation_failed' | 'ui_state_sync' | 'touch_interaction' | 'keyboard_interaction';
  component: string;
  operation: string;
  details: {
    sourceNode?: string;
    targetNode?: string;
    sourcePort?: string;
    targetPort?: string;
    expectedState?: any;
    actualState?: any;
    errorMessage?: string;
    userAgent?: string;
    inputType?: 'mouse' | 'touch' | 'keyboard';
    coordinates?: { x: number; y: number };
  };
  timestamp: Date;
  recoverable: boolean;
}

export interface InteractionRecovery {
  condition: (error: InteractionError) => boolean;
  action: (error: InteractionError) => Promise<boolean>;
  description: string;
  priority: number;
}

export interface UIStateSnapshot {
  component: string;
  state: any;
  timestamp: Date;
}

/**
 * 交互错误处理器类
 */
export class InteractionErrorHandler {
  private static instance: InteractionErrorHandler;
  private recoveryStrategies: InteractionRecovery[] = [];
  private interactionErrors: InteractionError[] = [];
  private stateSnapshots: Map<string, UIStateSnapshot[]> = new Map();
  private dragOperationTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private connectionValidationCache: Map<string, boolean> = new Map();

  private constructor() {
    this.initializeDefaultRecoveries();
    this.setupInteractionMonitoring();
  }

  static getInstance(): InteractionErrorHandler {
    if (!InteractionErrorHandler.instance) {
      InteractionErrorHandler.instance = new InteractionErrorHandler();
    }
    return InteractionErrorHandler.instance;
  }

  /**
   * 初始化默认恢复策略
   */
  private initializeDefaultRecoveries(): void {
    this.recoveryStrategies = [
      // 连接验证失败恢复
      {
        condition: (error) => error.type === 'connection_validation',
        action: async (error) => {
          try {
            // 清除验证缓存
            this.connectionValidationCache.clear();
            
            // 重新验证连接
            if (error.details.sourceNode && error.details.targetNode) {
              const isValid = await this.validateConnection(
                error.details.sourceNode,
                error.details.sourcePort || '',
                error.details.targetNode,
                error.details.targetPort || ''
              );
              
              if (isValid) {
                this.showUserNotification('连接验证已恢复', 'success');
                return true;
              }
            }
            
            this.showUserNotification('连接无效，请检查节点类型匹配', 'warning');
            return false;
          } catch (recoveryError) {
            console.error('Connection validation recovery failed:', recoveryError);
            return false;
          }
        },
        description: '重新验证节点连接',
        priority: 1
      },

      // 拖拽操作失败恢复
      {
        condition: (error) => error.type === 'drag_operation_failed',
        action: async (error) => {
          try {
            // 清理拖拽状态
            this.clearDragState(error.component);
            
            // 恢复UI状态
            const restored = await this.restoreUIState(error.component);
            
            if (restored) {
              this.showUserNotification('拖拽操作已重置', 'info');
              return true;
            }
            
            return false;
          } catch (recoveryError) {
            console.error('Drag operation recovery failed:', recoveryError);
            return false;
          }
        },
        description: '重置拖拽操作状态',
        priority: 2
      },

      // UI状态同步失败恢复
      {
        condition: (error) => error.type === 'ui_state_sync',
        action: async (error) => {
          try {
            // 尝试从快照恢复状态
            const restored = await this.restoreUIState(error.component);
            
            if (restored) {
              this.showUserNotification('UI状态已恢复', 'success');
              return true;
            }
            
            // 如果快照恢复失败，重置到默认状态
            await this.resetToDefaultState(error.component);
            this.showUserNotification('已重置到默认状态', 'info');
            return true;
          } catch (recoveryError) {
            console.error('UI state sync recovery failed:', recoveryError);
            return false;
          }
        },
        description: '恢复UI状态同步',
        priority: 3
      },

      // 触摸交互失败恢复
      {
        condition: (error) => error.type === 'touch_interaction',
        action: async (error) => {
          try {
            // 启用触摸友好模式
            this.enableTouchFriendlyMode(error.component);
            this.showUserNotification('已启用触摸优化模式', 'info');
            return true;
          } catch (recoveryError) {
            console.error('Touch interaction recovery failed:', recoveryError);
            return false;
          }
        },
        description: '启用触摸友好模式',
        priority: 4
      },

      // 键盘交互失败恢复
      {
        condition: (error) => error.type === 'keyboard_interaction',
        action: async (error) => {
          try {
            // 重新设置键盘焦点
            this.restoreKeyboardFocus(error.component);
            this.showUserNotification('键盘导航已重置', 'info');
            return true;
          } catch (recoveryError) {
            console.error('Keyboard interaction recovery failed:', recoveryError);
            return false;
          }
        },
        description: '重置键盘导航',
        priority: 5
      }
    ];

    // 按优先级排序
    this.recoveryStrategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 设置交互监控
   */
  private setupInteractionMonitoring(): void {
    if (typeof window === 'undefined') return;

    // 监控拖拽超时
    this.setupDragTimeoutMonitoring();
    
    // 监控触摸事件
    this.setupTouchEventMonitoring();
    
    // 监控键盘事件
    this.setupKeyboardEventMonitoring();
  }

  /**
   * 设置拖拽超时监控
   */
  private setupDragTimeoutMonitoring(): void {
    // 监听拖拽开始事件
    document.addEventListener('dragstart', (event) => {
      const dragId = `drag_${Date.now()}_${Math.random()}`;
      
      // 设置超时检测
      const timeout = setTimeout(() => {
        this.handleInteractionError({
          type: 'drag_operation_failed',
          component: 'global',
          operation: 'drag_timeout',
          details: {
            errorMessage: 'Drag operation timed out',
            coordinates: { x: event.clientX, y: event.clientY },
            inputType: 'mouse'
          },
          timestamp: new Date(),
          recoverable: true
        });
      }, 10000); // 10秒超时

      this.dragOperationTimeouts.set(dragId, timeout);
      
      // 存储拖拽ID到事件中
      if (event.dataTransfer) {
        event.dataTransfer.setData('text/plain', dragId);
      }
    });

    // 监听拖拽结束事件
    document.addEventListener('dragend', (event) => {
      // 清理所有超时
      this.dragOperationTimeouts.forEach((timeout, id) => {
        clearTimeout(timeout);
        this.dragOperationTimeouts.delete(id);
      });
    });
  }

  /**
   * 设置触摸事件监控
   */
  private setupTouchEventMonitoring(): void {
    let touchStartTime = 0;
    let touchStartPosition = { x: 0, y: 0 };

    document.addEventListener('touchstart', (event) => {
      touchStartTime = Date.now();
      if (event.touches.length > 0) {
        touchStartPosition = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      }
    });

    document.addEventListener('touchend', (event) => {
      const touchDuration = Date.now() - touchStartTime;
      
      // 检测异常长的触摸操作
      if (touchDuration > 5000) {
        this.handleInteractionError({
          type: 'touch_interaction',
          component: 'global',
          operation: 'long_touch',
          details: {
            errorMessage: 'Touch operation took too long',
            coordinates: touchStartPosition,
            inputType: 'touch'
          },
          timestamp: new Date(),
          recoverable: true
        });
      }
    });
  }

  /**
   * 设置键盘事件监控
   */
  private setupKeyboardEventMonitoring(): void {
    let keySequence: string[] = [];
    let lastKeyTime = 0;

    document.addEventListener('keydown', (event) => {
      const currentTime = Date.now();
      
      // 重置序列如果间隔太长
      if (currentTime - lastKeyTime > 1000) {
        keySequence = [];
      }
      
      keySequence.push(event.key);
      lastKeyTime = currentTime;
      
      // 检测键盘卡死（相同键连续按下）
      if (keySequence.length > 10) {
        const lastTenKeys = keySequence.slice(-10);
        const allSame = lastTenKeys.every(key => key === lastTenKeys[0]);
        
        if (allSame) {
          this.handleInteractionError({
            type: 'keyboard_interaction',
            component: 'global',
            operation: 'key_stuck',
            details: {
              errorMessage: `Key '${event.key}' appears to be stuck`,
              inputType: 'keyboard'
            },
            timestamp: new Date(),
            recoverable: true
          });
          
          keySequence = []; // 重置序列
        }
      }
    });
  }

  /**
   * 处理交互错误
   */
  handleInteractionError(error: InteractionError): void {
    // 记录错误
    this.interactionErrors.push(error);
    
    // 限制错误历史大小
    if (this.interactionErrors.length > 100) {
      this.interactionErrors = this.interactionErrors.slice(-50);
    }

    // 报告错误到统一错误处理系统
    errorHandler.handleError(new Error(`Interaction error: ${error.type} in ${error.component}`), {
      additionalData: {
        interactionType: error.type,
        component: error.component,
        operation: error.operation,
        details: error.details
      }
    });

    // 执行恢复策略
    if (error.recoverable) {
      this.executeRecoveryStrategy(error);
    }
  }

  /**
   * 验证节点连接
   */
  async validateConnection(
    sourceNodeId: string,
    sourcePortId: string,
    targetNodeId: string,
    targetPortId: string
  ): Promise<boolean> {
    const cacheKey = `${sourceNodeId}:${sourcePortId}->${targetNodeId}:${targetPortId}`;
    
    // 检查缓存
    if (this.connectionValidationCache.has(cacheKey)) {
      return this.connectionValidationCache.get(cacheKey)!;
    }

    try {
      // 这里应该调用实际的连接验证逻辑
      // 暂时使用简单的验证规则
      const isValid = sourceNodeId !== targetNodeId && 
                     sourcePortId !== '' && 
                     targetPortId !== '';
      
      // 缓存结果
      this.connectionValidationCache.set(cacheKey, isValid);
      
      return isValid;
    } catch (error) {
      console.error('Connection validation failed:', error);
      return false;
    }
  }

  /**
   * 处理拖拽操作失败
   */
  handleDragOperationFailure(
    component: string,
    operation: string,
    details: any
  ): void {
    this.handleInteractionError({
      type: 'drag_operation_failed',
      component,
      operation,
      details: {
        ...details,
        errorMessage: 'Drag operation failed',
        inputType: 'mouse'
      },
      timestamp: new Date(),
      recoverable: true
    });
  }

  /**
   * 处理UI状态同步失败
   */
  handleUIStateSyncFailure(
    component: string,
    expectedState: any,
    actualState: any
  ): void {
    this.handleInteractionError({
      type: 'ui_state_sync',
      component,
      operation: 'state_sync',
      details: {
        expectedState,
        actualState,
        errorMessage: 'UI state synchronization failed'
      },
      timestamp: new Date(),
      recoverable: true
    });
  }

  /**
   * 保存UI状态快照
   */
  saveUIStateSnapshot(component: string, state: any): void {
    if (!this.stateSnapshots.has(component)) {
      this.stateSnapshots.set(component, []);
    }

    const snapshots = this.stateSnapshots.get(component)!;
    snapshots.push({
      component,
      state: JSON.parse(JSON.stringify(state)), // 深拷贝
      timestamp: new Date()
    });

    // 限制快照数量
    if (snapshots.length > 10) {
      snapshots.splice(0, snapshots.length - 10);
    }
  }

  /**
   * 恢复UI状态
   */
  private async restoreUIState(component: string): Promise<boolean> {
    const snapshots = this.stateSnapshots.get(component);
    
    if (!snapshots || snapshots.length === 0) {
      return false;
    }

    try {
      // 获取最近的快照
      const latestSnapshot = snapshots[snapshots.length - 1];
      
      // 这里应该调用组件的状态恢复方法
      // 暂时只是触发一个自定义事件
      const event = new CustomEvent('restore-ui-state', {
        detail: {
          component,
          state: latestSnapshot.state
        }
      });
      
      document.dispatchEvent(event);
      return true;
    } catch (error) {
      console.error('Failed to restore UI state:', error);
      return false;
    }
  }

  /**
   * 重置到默认状态
   */
  private async resetToDefaultState(component: string): Promise<void> {
    const event = new CustomEvent('reset-to-default-state', {
      detail: { component }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * 清理拖拽状态
   */
  private clearDragState(component: string): void {
    // 清理所有拖拽相关的超时
    this.dragOperationTimeouts.forEach((timeout, id) => {
      clearTimeout(timeout);
      this.dragOperationTimeouts.delete(id);
    });

    // 触发拖拽状态清理事件
    const event = new CustomEvent('clear-drag-state', {
      detail: { component }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * 启用触摸友好模式
   */
  private enableTouchFriendlyMode(component: string): void {
    const event = new CustomEvent('enable-touch-friendly-mode', {
      detail: { component }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * 恢复键盘焦点
   */
  private restoreKeyboardFocus(component: string): void {
    // 尝试找到第一个可聚焦的元素
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }

  /**
   * 执行恢复策略
   */
  private async executeRecoveryStrategy(error: InteractionError): Promise<void> {
    const applicableStrategies = this.recoveryStrategies.filter(
      strategy => strategy.condition(error)
    );

    for (const strategy of applicableStrategies) {
      try {
        const success = await strategy.action(error);
        
        if (success) {
          console.log(`Recovery strategy succeeded: ${strategy.description}`);
          break; // 成功后停止尝试其他策略
        }
      } catch (strategyError) {
        console.error(`Recovery strategy failed: ${strategy.description}`, strategyError);
      }
    }
  }

  /**
   * 显示用户通知
   */
  private showUserNotification(message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info'): void {
    if (typeof window === 'undefined') return;

    // 尝试使用toast通知（如果可用）
    if ((window as any).toast) {
      (window as any).toast[type](message);
      return;
    }

    // 回退到浏览器原生通知
    const notification = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
      error: 'bg-red-500'
    };
    
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded shadow-lg z-50`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * 添加自定义恢复策略
   */
  addRecoveryStrategy(strategy: InteractionRecovery): void {
    this.recoveryStrategies.push(strategy);
    this.recoveryStrategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 获取交互错误统计
   */
  getInteractionErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByComponent: Record<string, number>;
    recentErrors: InteractionError[];
  } {
    const errorsByType: Record<string, number> = {};
    const errorsByComponent: Record<string, number> = {};

    this.interactionErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsByComponent[error.component] = (errorsByComponent[error.component] || 0) + 1;
    });

    return {
      totalErrors: this.interactionErrors.length,
      errorsByType,
      errorsByComponent,
      recentErrors: this.interactionErrors.slice(-10)
    };
  }

  /**
   * 清除错误历史
   */
  clearErrorHistory(): void {
    this.interactionErrors = [];
    this.stateSnapshots.clear();
    this.connectionValidationCache.clear();
  }
}

/**
 * 全局交互错误处理器实例
 */
export const interactionErrorHandler = InteractionErrorHandler.getInstance();

/**
 * React Hook for interaction error handling
 */
export function useInteractionErrorHandler() {
  const handleInteractionError = (error: InteractionError) => {
    interactionErrorHandler.handleInteractionError(error);
  };

  const validateConnection = async (sourceNode: string, sourcePort: string, targetNode: string, targetPort: string) => {
    return interactionErrorHandler.validateConnection(sourceNode, sourcePort, targetNode, targetPort);
  };

  const saveUIState = (component: string, state: any) => {
    interactionErrorHandler.saveUIStateSnapshot(component, state);
  };

  const handleDragFailure = (component: string, operation: string, details: any) => {
    interactionErrorHandler.handleDragOperationFailure(component, operation, details);
  };

  const handleStateSyncFailure = (component: string, expected: any, actual: any) => {
    interactionErrorHandler.handleUIStateSyncFailure(component, expected, actual);
  };

  return {
    handleInteractionError,
    validateConnection,
    saveUIState,
    handleDragFailure,
    handleStateSyncFailure,
    stats: interactionErrorHandler.getInteractionErrorStats(),
    clearErrors: () => interactionErrorHandler.clearErrorHistory()
  };
}

export default InteractionErrorHandler;