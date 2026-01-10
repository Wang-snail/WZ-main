import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Plus, AlertCircle, Wand2 } from 'lucide-react';
import type { FormulaNode, FormulaVariable, DataType } from '../types';

// 胶囊组件
const VariableChip: React.FC<{
  name: string;
  type: 'input' | 'output' | 'unknown';
}> = ({ name, type }) => {
  const colors = {
    input: 'bg-green-500/20 border-green-500/50 text-green-400',
    output: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
    unknown: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  };

  const icons = {
    input: '🟢',
    output: '🟠',
    unknown: '⚠️',
  };

  return (
    <span className={`
      inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border
      ${colors[type]} text-xs font-medium align-middle leading-tight
    `}>
      <span>{icons[type]}</span>
      <span>{name}</span>
    </span>
  );
};

// 变量提示弹窗
const VariablePrompt: React.FC<{
  name: string;
  position: { top: number; left: number };
  similarVars: string[];
  onAddInput: () => void;
  onAddOutput: () => void;
  onUseSimilar: (name: string) => void;
  onDismiss: () => void;
}> = ({ name, position, similarVars, onAddInput, onAddOutput, onUseSimilar, onDismiss }) => {
  return (
    <div
      className="absolute z-50 bg-yellow-900/95 border border-yellow-500 rounded-lg shadow-xl"
      style={{ top: position.top, left: Math.min(position.left, 400) }}
    >
      <div className="px-3 py-2 border-b border-yellow-700/50 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <span className="text-sm text-yellow-200">未找到变量 "{name}"</span>
      </div>

      <div className="p-2">
        <button
          onClick={onAddInput}
          className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-yellow-800/50 rounded"
        >
          <Plus className="w-4 h-4 text-green-400" />
          <span className="text-white">添加为新输入</span>
        </button>
        <button
          onClick={onAddOutput}
          className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-yellow-800/50 rounded"
        >
          <Plus className="w-4 h-4 text-orange-400" />
          <span className="text-white">添加为新输出</span>
        </button>

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

      <div className="px-3 py-1.5 bg-yellow-900/50 border-t border-yellow-700/30">
        <span className="text-xs text-yellow-400/60">按 Esc 取消</span>
      </div>
    </div>
  );
};

interface FormulaEditorProps {
  inputVariables: FormulaVariable[];
  outputVariables: FormulaVariable[];
  expression: FormulaNode;
  onChange: (expression: FormulaNode, code: string) => void;
  onAddVariable?: (name: string, type: 'input' | 'output') => void;
}

// 渲染带胶囊的行
const renderFormulaLine = (
  line: string,
  existingInputs: string[],
  existingOutputs: string[]
): React.ReactNode => {
  const parts = line.split('=');
  if (parts.length !== 2) return <span className="text-gray-400">{line}</span>;

  const [left, right] = parts;

  const renderSegment = (text: string): React.ReactNode[] => {
    const segments: React.ReactNode[] = [];
    let lastIndex = 0;
    const varPattern = /\[([^\]]+)\]/g;
    let match;

    while ((match = varPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push(text.substring(lastIndex, match.index));
      }

      const varName = match[1];
      const isInput = existingInputs.includes(varName);
      const isOutput = existingOutputs.includes(varName);
      let type: 'input' | 'output' | 'unknown' = 'unknown';
      if (isInput) type = 'input';
      else if (isOutput) type = 'output';

      segments.push(
        <VariableChip key={`var-${match.index}`} name={varName} type={type} />
      );
      lastIndex = varPattern.lastIndex;
    }

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

// 解析公式行
const parseFormulaLine = (line: string): { leftVars: string[]; rightVars: string[] } => {
  const parts = line.split('=');
  if (parts.length !== 2) return { leftVars: [], rightVars: [] };

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

export const FormulaEditor: React.FC<FormulaEditorProps> = ({
  inputVariables,
  outputVariables,
  expression,
  onChange,
  onAddVariable,
}) => {
  const [lines, setLines] = useState<string[]>(['']);
  const [activeLine, setActiveLine] = useState(0);
  const [showVariablePrompt, setShowVariablePrompt] = useState(false);
  const [promptVarName, setPromptVarName] = useState('');
  const [promptPosition, setPromptPosition] = useState({ top: 0, left: 0 });
  const [lineErrors, setLineErrors] = useState<Record<number, string[]>>({});

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const allVariableNames = useMemo(() => ({
    inputs: inputVariables.map(v => v.name),
    outputs: outputVariables.map(v => v.name),
    all: [...inputVariables.map(v => v.name), ...outputVariables.map(v => v.name)],
  }), [inputVariables, outputVariables]);

  // 查找相似变量
  const findSimilarVars = useCallback((name: string): string[] => {
    const all = allVariableNames.all;
    return all.filter(v =>
      v.toLowerCase().includes(name.toLowerCase().slice(0, 2)) ||
      (v.length === name.length && [...v].filter((c, i) => c !== name[i]).length <= 2)
    ).slice(0, 3);
  }, [allVariableNames]);

  // 获取未定义变量
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

  // 解析公式并生成表达式树
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

  // 生成代码
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

  // 处理文本变化
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newLines = e.target.value.split('\n');
    setLines(newLines);

    const errors: Record<number, string[]> = {};
    newLines.forEach((line, index) => {
      if (line.trim()) {
        const undefinedVars = getUndefinedVarsInLine(index);
        if (undefinedVars.length > 0) errors[index] = undefinedVars;
      }
    });
    setLineErrors(errors);

    const parsed = parseFormulasToNodes(newLines);
    const code = generateCode(parsed);
    onChange(parsed, code);
  }, [getUndefinedVarsInLine, parseFormulasToNodes, generateCode, onChange]);

  // 处理键盘事件
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

  // 添加新变量
  const handleAddVariable = useCallback((type: 'input' | 'output') => {
    if (promptVarName && onAddVariable) {
      onAddVariable(promptVarName, type);
    }
    setShowVariablePrompt(false);
    setPromptVarName('');
    textareaRef.current?.focus();
  }, [promptVarName, onAddVariable]);

  // 使用相似变量
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

  // 在光标位置插入变量
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

  // 处理拖拽放置
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 处理变量拖拽放置
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
              <span className="absolute left-3 text-gray-600 text-xs select-none -mt-3">
                {index + 1}
              </span>
              {line.trim() ? (
                renderFormulaLine(line, allVariableNames.inputs, allVariableNames.outputs)
              ) : null}
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
        <VariablePrompt
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

export default FormulaEditor;
