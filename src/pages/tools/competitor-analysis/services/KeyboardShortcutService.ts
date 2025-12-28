/**
 * 键盘快捷键服务
 * 提供全局键盘快捷键的注册、管理和禁用功能
 */

import type { RoleViewType } from '../types';

/**
 * 快捷键配置
 */
export interface ShortcutConfig {
  /** 快捷键描述 */
  description: string;
  /** 快捷键组合 */
  key: string;
  /** 是否需要 Ctrl 键 */
  ctrl?: boolean;
  /** 是否需要 Shift 键 */
  shift?: boolean;
  /** 是否需要 Alt 键 */
  alt?: boolean;
  /** 快捷键回调函数 */
  callback: () => void;
  /** 是否已禁用 */
  disabled?: boolean;
}

/**
 * 快捷键组配置
 */
export interface ShortcutGroupConfig {
  /** 快捷键列表 */
  shortcuts: ShortcutConfig[];
}

/**
 * 默认快捷键配置
 */
export const DEFAULT_SHORTCUTS: Record<string, ShortcutGroupConfig> = {
  NAVIGATION: {
    shortcuts: [
      {
        description: '上一步',
        key: 'ArrowLeft',
        ctrl: true,
        callback: () => {}
      },
      {
        description: '下一步',
        key: 'ArrowRight',
        ctrl: true,
        callback: () => {}
      }
    ]
  },
  ACTIONS: {
    shortcuts: [
      {
        description: '执行当前操作',
        key: 'Enter',
        ctrl: true,
        callback: () => {}
      },
      {
        description: '保存会话',
        key: 's',
        ctrl: true,
        callback: () => {}
      },
      {
        description: '新建分析',
        key: 'n',
        ctrl: true,
        callback: () => {}
      },
      {
        description: '重置步骤',
        key: 'r',
        ctrl: true,
        callback: () => {}
      }
    ]
  },
  UI: {
    shortcuts: [
      {
        description: '显示帮助',
        key: 'h',
        ctrl: true,
        callback: () => {}
      },
      {
        description: '关闭弹窗',
        key: 'Escape',
        callback: () => {}
      },
      {
        description: '显示快捷键帮助',
        key: 'F1',
        callback: () => {}
      }
    ]
  }
};

/**
 * 键盘快捷键服务
 */
export class KeyboardShortcutService {
  private static instance: KeyboardShortcutService;
  private shortcuts: Map<string, ShortcutConfig[]> = new Map();
  private enabled: boolean = true;
  private keyMap: Map<string, string[]> = new Map();

  private constructor() {
    this.setupGlobalListener();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): KeyboardShortcutService {
    if (!KeyboardShortcutService.instance) {
      KeyboardShortcutService.instance = new KeyboardShortcutService();
    }
    return KeyboardShortcutService.instance;
  }

  /**
   * 设置全局键盘监听
   */
  private setupGlobalListener(): void {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 如果快捷键被禁用，不处理
      if (!this.enabled) return;

      // 如果焦点在输入元素上，不处理（除了特定的全局快捷键）
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // 只允许 ESC 键在输入时关闭弹窗
        if (event.key !== 'Escape') return;
      }

      // 构建当前按下的键组合
      const keyParts: string[] = [];
      if (event.ctrlKey) keyParts.push('ctrl');
      if (event.shiftKey) keyParts.push('shift');
      if (event.altKey) keyParts.push('alt');
      keyParts.push(event.key.toLowerCase());
      const keyCombo = keyParts.join('+');

      // 查找匹配的快捷键
      for (const [, shortcuts] of this.shortcuts) {
        for (const shortcut of shortcuts) {
          if (shortcut.disabled) continue;

          const shortcutParts: string[] = [];
          if (shortcut.ctrl) shortcutParts.push('ctrl');
          if (shortcut.shift) shortcutParts.push('shift');
          if (shortcut.alt) shortcutParts.push('alt');
          shortcutParts.push(shortcut.key.toLowerCase());
          const shortcutCombo = shortcutParts.join('+');

          if (keyCombo === shortcutCombo) {
            event.preventDefault();
            event.stopPropagation();
            shortcut.callback();
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    this.keyMap.set('global', ['keydown', handleKeyDown.name]);
  }

  /**
   * 注册快捷键组
   */
  registerShortcutGroup(groupName: string, config: ShortcutGroupConfig): void {
    this.shortcuts.set(groupName, config.shortcuts);
  }

  /**
   * 取消注册快捷键组
   */
  unregisterShortcutGroup(groupName: string): void {
    this.shortcuts.delete(groupName);
  }

  /**
   * 启用或禁用所有快捷键
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 获取快捷键是否已启用
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 获取所有注册的快捷键
   */
  getAllShortcuts(): Map<string, ShortcutConfig[]> {
    return new Map(this.shortcuts);
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.shortcuts.clear();
    this.enabled = false;
    KeyboardShortcutService.instance = null;
  }
}

/**
 * 全局快捷键服务实例
 */
export const keyboardShortcuts = KeyboardShortcutService.getInstance();

export default keyboardShortcuts;
