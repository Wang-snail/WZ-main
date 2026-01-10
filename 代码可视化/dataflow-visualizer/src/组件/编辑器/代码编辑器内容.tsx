/**
 * ============================================================================
 * 文件名：代码编辑器内容.tsx
 * 功能描述：代码编辑器内容组件
 *
 * 本组件用于显示节点的计算逻辑代码：
 * 1. 如果代码为空，显示提示信息
 * 2. 如果代码有内容，以 pre 标签格式显示
 *
 * 使用场景：
 * - 自定义节点底部显示计算逻辑
 * - 代码预览
 * ============================================================================
 */

// 导入 React 核心库
import React from 'react';

/**
 * 代码编辑器内容属性接口
 */
interface 代码编辑器内容属性 {
  code: string;  // 要显示的代码内容
}

/**
 * 检查代码是否为空
 *
 * 功能说明：
 * 判断代码是否为空，包括：
 * - 空字符串
 * - 只有空白字符
 * - 默认的函数模板
 *
 * @param code - 要检查的代码字符串
 * @returns 是否为空
 */
const isCodeEmpty = (code: string): boolean => {
  return (
    !code ||
    code.trim() === '' ||
    code.trim() === 'function execute(inputs, config, globals) {\n  \n}' ||
    code.trim() === 'function execute(inputs, config, globals) {}'
  );
};

/**
 * 代码编辑器内容组件
 *
 * 功能说明：
 * 显示节点的计算逻辑代码：
 * - 如果代码为空，显示提示信息
 * - 如果有内容，以等宽字体显示
 *
 * @param code - 要显示的代码内容
 */
export const 代码编辑器内容: React.FC<代码编辑器内容属性> = ({ code }) => {
  // 如果代码为空，显示提示信息
  if (isCodeEmpty(code)) {
    return (
      <div className="text-center py-3">
        <div className="text-xs text-gray-500 bg-gray-900/50 rounded-lg py-2 px-3">
          计算逻辑为空，输入直接传递到输出
        </div>
      </div>
    );
  }

  // 渲染代码内容
  return (
    <pre
      className="text-xs text-gray-300 font-mono whitespace-pre-wrap select-text cursor-text"
      onMouseDown={(e) => e.stopPropagation()}  // 阻止鼠标事件冒泡
    >
      {code}
    </pre>
  );
};

// 导出默认组件
export default 代码编辑器内容;
