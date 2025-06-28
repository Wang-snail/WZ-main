import { UserState, DivinationResult } from '../types';

const USER_STATE_KEY = 'wsnail_user_state';
const DIVINATION_HISTORY_KEY = 'wsnail_divination_history';

export class LocalStorageService {
  // 获取用户状态
  getUserState(): UserState {
    try {
      const stored = localStorage.getItem(USER_STATE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('读取用户状态失败:', error);
    }
    
    // 返回默认状态
    return {
      freeUsed: false,
      totalUsage: 0,
      lastUsageDate: '',
    };
  }

  // 保存用户状态
  setUserState(state: UserState): void {
    try {
      localStorage.setItem(USER_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('保存用户状态失败:', error);
    }
  }

  // 检查是否可以免费使用
  canUseFree(): boolean {
    const state = this.getUserState();
    return !state.freeUsed;
  }

  // 标记免费使用已用完
  markFreeUsed(): void {
    const state = this.getUserState();
    state.freeUsed = true;
    state.totalUsage += 1;
    state.lastUsageDate = new Date().toISOString();
    this.setUserState(state);
  }

  // 增加使用次数
  incrementUsage(): void {
    const state = this.getUserState();
    state.totalUsage += 1;
    state.lastUsageDate = new Date().toISOString();
    this.setUserState(state);
  }

  // 获取占卜历史记录
  getDivinationHistory(): DivinationResult[] {
    try {
      const stored = localStorage.getItem(DIVINATION_HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('读取占卜历史失败:', error);
    }
    return [];
  }

  // 保存占卜结果
  saveDivinationResult(result: DivinationResult): void {
    try {
      const history = this.getDivinationHistory();
      history.unshift(result); // 最新的在前面
      
      // 只保留最近20条记录
      if (history.length > 20) {
        history.splice(20);
      }
      
      localStorage.setItem(DIVINATION_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('保存占卜结果失败:', error);
    }
  }

  // 清除所有数据
  clearAllData(): void {
    try {
      localStorage.removeItem(USER_STATE_KEY);
      localStorage.removeItem(DIVINATION_HISTORY_KEY);
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  }
}

export const storageService = new LocalStorageService();
