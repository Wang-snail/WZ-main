/**
 * ============================================================================
 * 文件名：公式编辑器.tsx
 * 功能描述：公式编辑器组件
 *
 * 本组件提供可视化公式编辑功能：
 * 1. 公式语法：[变量名] 用于引用变量
 * 2. 公式格式：输出 = 输入1 * 输入2 + ...
 * 3. 变量提示：未定义变量时提供添加提示
 * 4. 公式预览：实时显示带变量高亮的公式
 *
 * 功能特点：
 * - 隐藏的 textarea 实现纯文本编辑
 * - 叠加的预览层显示格式化内容
 * - 变量高亮显示（输入绿色、输出橙色、未知黄色）
 * - 按 Enter 键自动提示未定义变量
 * ============================================================================
 */

// 导入 React 核心库和 Hooks
import React, { useState, useRef, useCallback, useMemo } from 'react';

// 从 lucide-react 导入图标组件
import { Plus, AlertCircle, Wand2 } from 'lucide-react';

// 从类型定义导入类型
import type { FormulaNode, FormulaVariable, DataType } from '@/types/index';

// ============================================================================
// 第一部分：辅助组件
// ============================================================================

/**
 * 变量胶囊组件
 *
 * 功能说明：
 * 显示变量的类型和名称
 * - 输入变量：绿色
 * - 输出变量：橙色
 * - 未知变量：黄色
 */
const 变量胶囊: React.FC<{
  name: string;                           // 变量名称
  type: 'input' | 'output' | 'unknown';   // 变量类型
}> = ({ name, type }) => {
  // 颜色映射
  const 颜色 = {
    input: 'bg-green-500/20 border-green-500/50 text-green-400',
    output: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
    unknown: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  };

  // 图标映射
  const 图标 = {
    input: '🟢',
    output: '🟠',
    unknown: '⚠️',
  };

  return (
    <span className={`
      inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border
      ${颜色[type]} text-xs font-medium align-middle leading-tight
    `}>
      <span>{图标[type]}</span>
      <span>{name}</span>
    </span>
  );
};

/**
 * 变量提示弹窗组件
 *
 * 功能说明：
 * 当检测到未定义变量时显示的提示弹窗：
 * 1. 显示未定义的变量名
 * 2. 提供"添加为输入"或"添加为输出"选项
 * 3. 显示相似变量建议
 */
const 变量提示弹窗: React.FC<{
  name: string;                                            // 未定义的变量名
  position: { top: number; left: number };                 // 弹窗位置
  similarVars: string[];                                   // 相似变量列表
  onAddInput: () => void;                                  // 添加为输入回调
  onAddOutput: () => void;                                 // 添加为输出回调
  onUseSimilar: (name: string) => void;                    // 使用相似变量回调
  onDismiss: () => void;                                   // 关闭弹窗回调
}> = ({ name, position, similarVars, onAddInput, onAddOutput, onUseSimilar, onDismiss }) => {
  return (
    <div
      className="absolute z-50 bg-yellow-900/95 border border-yellow-500 rounded-lg shadow-xl"
      style={{ top: position.top, left: Math.min(position.left, 400) }}
    >
      {/* 标题栏 */}
      <div className="px-3 py-2 border-b border-yellow-700/50 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <span className="text-sm text-yellow-200">未找到变量 "{name}"</span>
      </div>

      {/* 内容区域 */}
      <div className="p-2">
        {/* 添加为输入按钮 */}
        <button
          onClick={onAddInput}
          className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-yellow-800/50 rounded"
        >
          <Plus className="w-4 h-4 text-green-400" />
          <span className="text-white">添加为新输入</span>
        </button>

        {/* 添加为输出按钮 */}
        <button
          onClick={onAddOutput}
          className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-yellow-800/50 rounded"
        >
          <Plus className="w-4 h-4 text-orange-400" />
          <span className="text-white">添加为新输出</span>
        </button>

        {/* 相似变量建议 */}
        {similarVars.length > 0 && (
          <>
            <div className="my-2 border-t border-yellow-700/30" />
            {similarVars.map(v => (
              <button
                key={v}
                onClick={() => onUseSimilar(v)}
                className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 hover:bg-yellow-800/50 rounded"
              >
                <Wand2 className="w-3 h-3 text-blue-400" />
                <span className="text-blue-300">{v}</span>
              </button>
            ))}
          </>
        )}
      </div>

      {/* 底部提示 */}
      <div className="px-3 py-1.5 bg-yellow-900/50 border-t border-yellow-700/30">
        <span className="text-xs text-yellow-400/60">按 Esc 取消</span>
      </div>
    </div>
  );
};

// ============================================================================
// 第二部分：工具函数
// ============================================================================

/**
 * 公式编辑器属性接口
 */
interface 公式编辑器属性 {
  inputVariables: FormulaVariable[];       // 输入变量列表
  outputVariables: FormulaVariable[];      // 输出变量列表
  expression: FormulaNode;                 // 当前的表达式树
  onChange: (expression: FormulaNode, code: string) => void;  // 变化回调
  onAddVariable?: (name: string, type: 'input' | 'output') => void;  // 添加变量回调
}

/**
 * 渲染带胶囊的公式行
 *
 * 功能说明：
 * 将公式文本中的 [变量名] 替换为变量胶囊组件
 *
 * @param line - 公式文本行
 * @param existingInputs - 已有的输入变量名列表
 * @param existingOutputs - 已有的输出变量名列表
 * @returns 渲染的 React 节点
 */
const renderFormulaLine = (
  line: string,
  existingInputs: string[],
  existingOutputs: string[]
): React.ReactNode => {
  // 按等号分割（左=右）
  const parts = line.split('=');
  if (parts.length !== 2) return <span className="text-gray-400">{line}</span>;

  const [left, right] = parts;

  /**
   * 渲染文本片段，替换变量名为胶囊
   */
  const renderSegment = (text: string): React.ReactNode[] => {
    const segments: React.ReactNode[] = [];
    let lastIndex = 0;
    // 匹配 [变量名] 的正则
    const varPattern = /\[([^\]]+)\]/g;
    let match;

    while ((match = varPattern.exec(text)) !== null) {
      // 添加等号前的普通文本
      if (match.index > lastIndex) {
        segments.push(text.substring(lastIndex, match.index));
      }

      const varName = match[1];
      const isInput = existingInputs.includes(varName);
      const isOutput = existingOutputs.includes(varName);
      let type: 'input' | 'output' | 'unknown' = 'unknown';
      if (isInput) type = 'input';
      else if (isOutput) type = 'output';

      // 添加变量胶囊
      segments.push(
        <变量胶囊 key={`var-${match.index}`} name={varName} type={type} />
      );
      lastIndex = varPattern.lastIndex;
    }

    // 添加剩余的文本
    if (lastIndex < text.length) {
      segments.push(text.substring(lastIndex));
    }

    return segments;
  };

  return (
    <span className="inline-flex items-center align-middle">
      {renderSegment(left)}
      <span className="text-gray-500 mx-0.5 align-middle">=</span>
      {renderSegment(right)}
    </span>
  );
};

/**
 * 解析公式行
 *
 * 功能说明：
 * 从公式文本中提取左侧和右侧的变量名
 *
 * @param line - 公式文本行
 * @returns 左侧变量和右侧变量列表
 */
const parseFormulaLine = (line: string): { leftVars: string[]; rightVars: string[] } => {
  const parts = line.split('=');
  if (parts.length !== 2) return { leftVars: [], rightVars: [] };

  /**
   * 从文本中提取所有 [变量名]
   */
  const extractVars = (text: string): string[] => {
    const vars: string[] = [];
    const varPattern = /\[([^\]]+)\]/g;
    let match;
    while ((match = varPattern.exec(text)) !== null) {
      vars.push(match[1]);
    }
    return vars;
  };

  return {
    leftVars: extractVars(parts[0]),
    rightVars: extractVars(parts[1]),
  };
};

// ============================================================================
// 第三部分：主组件
// ============================================================================

/**
 * 公式编辑器组件
 *
 * 功能说明：
 * 提供可视化公式编辑功能：
 * 1. 编辑区域：隐藏的 textarea 用于输入
 * 2. 预览区域：叠加的 div 显示格式化内容
 * 3. 变量提示：未定义变量时自动提示
 *
 * 公式语法：
 * - [变量名] 引用变量
 * - 输出 = 输入1 * 输入2 + ...
 *
 * @param inputVariables - 输入变量列表
 * @param outputVariables - 输出变量列表
 * @param expression - 当前的表达式树
 * @param onChange - 变化回调
 * @param onAddVariable - 添加变量回调（可选）
 */
export const 公式编辑器: React.FC<公式编辑器属性> = ({
  inputVariables,         // 输入变量列表
  outputVariables,        // 输出变量列表
  expression,             // 表达式树
  onChange,               // 变化回调
  onAddVariable,          // 添加变量回调（可选）
}) => {
  // 所有公式行文本
  const [lines, setLines] = useState<string[]>(['']);

  // 当前激活的行索引
  const [activeLine, setActiveLine] = useState(0);

  // 是否显示变量提示弹窗
  const [showVariablePrompt, setShowVariablePrompt] = useState(false);

  // 提示的变量名
  const [promptVarName, setPromptVarName] = useState('');

  // 提示弹窗位置
  const [promptPosition, setPromptPosition] = useState({ top: 0, left: 0 });

  // 行错误（未定义的变量）
  const [lineErrors, setLineErrors] = useState<Record<number, string[]>>({});

  // textarea 引用
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ========================================================================
  // 计算属性
  // ========================================================================

  /**
   * 所有变量名汇总
   */
  const allVariableNames = useMemo(() => ({
    inputs: inputVariables.map(v => v.name),
    outputs: outputVariables.map(v => v.name),
    all: [...inputVariables.map(v => v.name), ...outputVariables.map(v => v.name)],
  }), [inputVariables, outputVariables]);

  // ========================================================================
  // 回调函数
  // ========================================================================

  /**
   * 查找相似变量
   *
   * 功能说明：
   * 根据输入的部分名称查找相似的已定义变量
   */
  const findSimilarVars = useCallback((name: string): string[] => {
    const all = allVariableNames.all;
    return all.filter(v =>
      v.toLowerCase().includes(name.toLowerCase().slice(0, 2)) ||
      (v.length === name.length && [...v].filter((c, i) => c !== name[i]).length <= 2)
    ).slice(0, 3);  // 最多返回 3 个建议
  }, [allVariableNames]);

  /**
   * 获取某行中未定义的变量
   */
  const getUndefinedVarsInLine = useCallback((lineIndex: number): string[] => {
    const line = lines[lineIndex];
    if (!line) return [];

    const { leftVars, rightVars } = parseFormulaLine(line);
    const allVars = [...leftVars, ...rightVars];

    return allVars.filter(name =>
      !allVariableNames.inputs.includes(name) &&
      !allVariableNames.outputs.includes(name)
    );
  }, [lines, allVariableNames]);

  /**
   * 解析公式行并生成表达式树
   */
  const parseFormulasToNodes = useCallback((formulaLines: string[]): FormulaNode => {
    const allNodes: FormulaNode[] = [];

    formulaLines.forEach((line, index) => {
      if (!line.trim()) return;

      const { leftVars, rightVars } = parseFormulaLine(line);
      if (leftVars.length === 0) return;

      let exprNode: FormulaNode;
      if (rightVars.length === 0) {
        exprNode = { id: `expr_${index}`, type: 'constant', value: '0' };
      } else if (rightVars.length === 1) {
        exprNode = { id: `var_${rightVars[0]}`, type: 'variable', value: rightVars[0] };
      } else {
        exprNode = {
          id: `expr_${index}`,
          type: 'operator',
          value: '*',
          children: rightVars.map(v => ({ id: `var_${v}`, type: 'variable', value: v })),
        };
      }

      const targetVar = leftVars[0];
      allNodes.push({
        id: `assign_${index}`,
        type: 'operator',
        value: '=',
        children: [
          { id: `var_${targetVar}`, type: 'variable', value: targetVar },
          exprNode,
        ],
      });
    });

    if (allNodes.length === 0) {
      return { id: 'empty', type: 'constant', value: '0' };
    }
    if (allNodes.length === 1) return allNodes[0];

    return {
      id: 'root',
      type: 'operator',
      value: ';',
      children: allNodes,
    };
  }, []);

  /**
   * 根据表达式树生成代码
   */
  const generateCode = useCallback((node: FormulaNode): string => {
    const generate = (n: FormulaNode, localVars: Set<string>): string => {
      if (n.type === 'variable') {
        const prefix = localVars.has(n.value) ? '' : 'inputs.';
        return `${prefix}${n.value}`;
      }
      if (n.type === 'constant') return String(n.value);
      if (n.type === 'operator') {
        if (n.value === '=' && n.children && n.children.length >= 2) {
          const target = n.children[0];
          const expr = n.children.slice(1).reduce((acc, child) => {
            if (acc) {
              return { ...acc, children: [...(acc.children || []), child], value: '*' };
            }
            return child;
          }, null as FormulaNode | null);

          const varName = target.type === 'variable' ? target.value : '';
          const newLocalVars = new Set(localVars);
          if (varName) newLocalVars.add(varName);

          return `  const ${varName} = ${generate(expr!, newLocalVars)};\n${generate({ ...n, children: n.children.slice(2) }, newLocalVars)}`;
        }
        if (n.children) {
          const parts = n.children.map(child => generate(child, localVars));
          return n.value === ';' ? parts.join('\n') : parts.join(` ${n.value} `);
        }
      }
      return '0';
    };

    const codeBody = generate(node, new Set());
    return `function execute(inputs, config, globals) {
${codeBody ? '  ' + codeBody.replace(/\n/g, '\n  ') : ''}
}`;
  }, []);

  /**
   * 处理文本变化
   */
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newLines = e.target.value.split('\n');
    setLines(newLines);

    // 检查每行的未定义变量
    const errors: Record<number, string[]> = {};
    newLines.forEach((line, index) => {
      if (line.trim()) {
        const undefinedVars = getUndefinedVarsInLine(index);
        if (undefinedVars.length > 0) errors[index] = undefinedVars;
      }
    });
    setLineErrors(errors);

    // 解析并生成代码
    const parsed = parseFormulasToNodes(newLines);
    const code = generateCode(parsed);
    onChange(parsed, code);
  }, [getUndefinedVarsInLine, parseFormulasToNodes, generateCode, onChange]);

  /**
   * 处理键盘事件
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const undefinedVars = getUndefinedVarsInLine(activeLine);
      if (undefinedVars.length > 0 && textareaRef.current) {
        e.preventDefault();
        const rect = textareaRef.current.getBoundingClientRect();
        const container = textareaRef.current.parentElement?.getBoundingClientRect();

        setPromptVarName(undefinedVars[0]);
        setPromptPosition({
          top: rect.bottom - (container?.top || 0),
          left: rect.left - (container?.left || 0) + 20,
        });
        setShowVariablePrompt(true);
        return;
      }
    }
    if (e.key === 'Escape') {
      setShowVariablePrompt(false);
      setPromptVarName('');
    }
  }, [activeLine, getUndefinedVarsInLine]);

  /**
   * 添加新变量
   */
  const handleAddVariable = useCallback((type: 'input' | 'output') => {
    if (promptVarName && onAddVariable) {
      onAddVariable(promptVarName, type);
    }
    setShowVariablePrompt(false);
    setPromptVarName('');
    textareaRef.current?.focus();
  }, [promptVarName, onAddVariable]);

  /**
   * 使用相似变量
   */
  const handleUseSimilar = useCallback((similarName: string) => {
    setLines(prev => {
      const newLines = [...prev];
      if (newLines[activeLine]) {
        newLines[activeLine] = newLines[activeLine].replace(
          `[${promptVarName}]`,
          `[${similarName}]`
        );
      }
      return newLines;
    });
    setShowVariablePrompt(false);
    setPromptVarName('');
    textareaRef.current?.focus();
  }, [activeLine, promptVarName]);

  /**
   * 在光标位置插入变量
   */
  const insertVariable = useCallback((varName: string) => {
    setLines(prev => {
      const newLines = [...prev];
      const currentLine = newLines[activeLine] || '';
      const cursor = textareaRef.current?.selectionStart || currentLine.length;
      const lineStart = currentLine.lastIndexOf('\n', cursor - 1) + 1;
      const before = currentLine.substring(0, lineStart);
      const after = currentLine.substring(lineStart);
      newLines[activeLine] = `${before}[${varName}] ${after}`;
      return newLines;
    });

    // 触发更新
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const newPos = (textarea.value.substring(0, textarea.selectionStart).lastIndexOf('\n') || 0) +
                       (textarea.value.substring(0, textarea.selectionStart).split('\n').pop()?.length || 0) +
                       varName.length + 3;
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 0);
  }, [activeLine]);

  /**
   * 处理拖拽放置
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /**
   * 处理变量拖拽放置
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'variable' && data.name) {
        insertVariable(data.name);
      }
    } catch (err) {
      // 不是有效的变量拖拽数据
    }
  }, [insertVariable]);

  // ========================================================================
  // 渲染
  // ========================================================================

  return (
    <div className="h-full">
      {/* 纯净的文本编辑区域 */}
      <div
        className="relative h-full min-h-[120px] nodrag"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* 公式预览区 - 只在有内容时显示 */}
        <div className="absolute inset-0 p-3 pl-10 overflow-y-auto pointer-events-none">
          {lines.map((line, index) => (
            <div
              key={index}
              className={`
                h-6 flex items-center leading-tight
                ${line.trim() ? 'text-gray-200' : 'invisible'}
              `}
              style={{ minHeight: '24px' }}
            >
              {/* 行号 */}
              <span className="absolute left-3 text-gray-600 text-xs select-none -mt-3">
                {index + 1}
              </span>
              {/* 公式内容 */}
              {line.trim() ? (
                renderFormulaLine(line, allVariableNames.inputs, allVariableNames.outputs)
              ) : null}
              {/* 未定义变量提示 */}
              {lineErrors[index]?.map(varName => (
                <span key={varName} className="ml-2 text-yellow-400 text-xs align-middle">
                  ⚠️ {varName}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* 隐藏的 textarea 用于输入 */}
        <textarea
          ref={textareaRef}
          value={lines.join('\n')}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setActiveLine(lines.findIndex((l, i) => i === activeLine || (i === lines.length - 1 && !l)))}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="输入公式，例如：利润 = 售价 - 成本（支持 [变量名] 补全）"
          rows={Math.max(5, lines.length + 1)}
          className="
            absolute inset-0 w-full h-full p-3 pl-10
            bg-transparent border-none outline-none resize-none
            text-transparent caret-white font-mono text-sm
            whitespace-pre-wrap break-all select-text
            leading-[24px] caret-blink
            [&::placeholder]:text-gray-500 [&::placeholder]:opacity-60
          "
          style={{ lineHeight: '24px' }}
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      {/* 未定义变量提示弹窗 */}
      {showVariablePrompt && (
        <变量提示弹窗
          name={promptVarName}
          position={promptPosition}
          similarVars={findSimilarVars(promptVarName)}
          onAddInput={() => handleAddVariable('input')}
          onAddOutput={() => handleAddVariable('output')}
          onUseSimilar={handleUseSimilar}
          onDismiss={() => {
            setShowVariablePrompt(false);
            setPromptVarName('');
          }}
        />
      )}
    </div>
  );
};

// 导出默认组件
