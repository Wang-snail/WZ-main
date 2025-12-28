/**
 * 键盘快捷键帮助组件
 * 显示所有可用的键盘快捷键
 */

import React from 'react';
import { keyboardShortcuts } from '../../services/KeyboardShortcutService';

/**
 * 快捷键帮助属性
 */
interface KeyboardShortcutsHelpProps {
  /** 是否显示 */
  show: boolean;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 键盘快捷键帮助组件
 */
export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  show,
  onClose
}) => {
  if (!show) return null;

  const { groups } = keyboardShortcuts.getHelpInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            键盘快捷键
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.name} className="space-y-3">
                {/* 分组标题 */}
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  {group.description}
                </h3>
                
                {/* 快捷键列表 */}
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                      <span className="text-sm text-gray-700">
                        {shortcut.description}
                      </span>
                      <kbd className="inline-flex items-center px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-800 shadow-sm">
                        {keyboardShortcuts.formatShortcutDisplay(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 提示信息 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  使用提示
                </h4>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>快捷键在输入框中默认不生效，除非特别说明</li>
                    <li>按 <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-xs">F1</kbd> 可随时打开此帮助</li>
                    <li>按 <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-xs">Esc</kbd> 可关闭弹窗或取消操作</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 快捷键提示组件
 * 在界面上显示当前可用的快捷键提示
 */
interface ShortcutHintProps {
  /** 快捷键配置 */
  shortcut: {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    description: string;
  };
  /** 是否显示 */
  show?: boolean;
  /** 位置 */
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const ShortcutHint: React.FC<ShortcutHintProps> = ({
  shortcut,
  show = true,
  position = 'bottom'
}) => {
  if (!show) return null;

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div className={`absolute ${positionClasses[position]} left-1/2 transform -translate-x-1/2 z-10`}>
      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
        <span className="mr-2">{shortcut.description}</span>
        <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs">
          {keyboardShortcuts.formatShortcutDisplay(shortcut)}
        </kbd>
        {/* 箭头 */}
        <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
          position === 'top' ? 'top-full -mt-1 left-1/2 -translate-x-1/2' :
          position === 'bottom' ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2' :
          position === 'left' ? 'left-full -ml-1 top-1/2 -translate-y-1/2' :
          'right-full -mr-1 top-1/2 -translate-y-1/2'
        }`}></div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;