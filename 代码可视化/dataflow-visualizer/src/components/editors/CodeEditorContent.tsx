import React from 'react';

/**
 * 代码编辑器内容组件
 * 功能：显示计算逻辑代码，空代码时显示提示信息
 */
interface CodeEditorContentProps {
  code: string;
}

/**
 * 检查代码是否为空
 */
const isCodeEmpty = (code: string): boolean => {
  return (
    !code ||
    code.trim() === '' ||
    code.trim() === 'function execute(inputs, config, globals) {\n  \n}' ||
    code.trim() === 'function execute(inputs, config, globals) {}'
  );
};

export const CodeEditorContent: React.FC<CodeEditorContentProps> = ({ code }) => {
  if (isCodeEmpty(code)) {
    return (
      <div className="text-center py-3">
        <div className="text-xs text-gray-500 bg-gray-900/50 rounded-lg py-2 px-3">
          计算逻辑为空，输入直接传递到输出
        </div>
      </div>
    );
  }

  return (
    <pre
      className="text-xs text-gray-300 font-mono whitespace-pre-wrap select-text cursor-text"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {code}
    </pre>
  );
};

export default CodeEditorContent;
