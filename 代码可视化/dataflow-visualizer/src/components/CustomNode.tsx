/**
 * 自定义节点组件
 * 功能：完整的节点渲染，包括标题、输入输出区、代码编辑器
 *
 * 布局结构：
 * ┌──────────────────────────────────────────────┐
 * │  分类色点  节点标题（可编辑）                   │ <-- 顶部：标题栏 [拖拽区域]
 * ├──────────────────────┬───────────────────────┤
 * │  输入区              │  输出区                │ <-- 中间：左右并列区
 * ├──────────────────────┴───────────────────────┤
 * │  计算逻辑（可折叠）                            │ <-- 底部：代码编辑器区
 * ├──────────────────────────────────────────────┤
 * │  节点描述                                      │
 * └──────────────────────────────────────────────┘
 */

import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Upload, Code, Calculator } from 'lucide-react';
import { useAppStore } from '../store';
import type {
  ModuleDefinition,
  FormulaConfig,
  FormulaNode,
  DataType
} from '../types';
import FormulaEditor from './FormulaEditor';
import { ValuePreviewPopover, formatValueForDisplay } from './ValuePreviewPopover';
import EditableLabel from './nodes/EditableLabel';
import ResizeHandle from './nodes/ResizeHandle';
import CodeEditorContent from './editors/CodeEditorContent';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 输入格式信息
 * 功能：存储上游输出的格式信息，用于格式预览
 */
interface InputFormatInfo {
  type: string;              // 值类型：number, string, boolean, object, array
  structure?: any;           // 值结构：对象字段、数组元素等
  sourceNodeId: string;      // 上游节点ID
  sourcePortId: string;      // 上游端口ID
}

/**
 * 节点数据类型定义
 */
interface CustomNodeData {
  moduleId: string;                    // 模块ID
  config: Record<string, any>;         // 模块配置
  label: string;                       // 节点标题
  instanceId: string;                  // 节点实例ID
  status: 'idle' | 'running' | 'success' | 'error'; // 运行状态
  preview?: any;                       // 预览数据
  code?: string;                       // 自定义代码
  formulaConfig?: FormulaConfig;       // 公式配置
  editorMode?: 'code' | 'formula';     // 编辑模式
  inputValues?: Record<string, any>;   // 输入端口实时值
  inputFormats?: Record<string, InputFormatInfo>; // 输入端口格式信息
}

export type { CustomNodeData };

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 获取模块的默认表达式
 * 功能：根据模块输入自动生成默认的计算公式
 */
const getDefaultExpression = (module: ModuleDefinition): FormulaNode => {
  const inputs = module.inputs;

  // 无输入时返回常量 0
  if (inputs.length === 0) {
    return { id: 'default', type: 'constant', value: '0' };
  }

  // 单输入时直接传递
  if (inputs.length === 1) {
    return { id: inputs[0].id, type: 'variable', value: inputs[0].id };
  }

  // 双输入时返回乘法表达式
  if (inputs.length === 2) {
    return {
      id: 'expr',
      type: 'operator',
      value: '*',
      children: [
        { id: inputs[0].id, type: 'variable', value: inputs[0].id },
        { id: inputs[1].id, type: 'variable', value: inputs[1].id },
      ],
    };
  }

  // 默认利润公式: (price - cost) * quantity
  return {
    id: 'default',
    type: 'operator',
    value: '*',
    children: [
      {
        id: 'sub',
        type: 'operator',
        value: '-',
        children: [
          { id: inputs[1]?.id || inputs[0].id, type: 'variable', value: inputs[1]?.id || inputs[0].id },
          { id: inputs[0].id, type: 'variable', value: inputs[0].id },
        ],
      },
      { id: inputs[2]?.id || inputs[0].id, type: 'variable', value: inputs[2]?.id || inputs[0].id },
    ],
  };
};

// ============================================================================
// 渲染编辑器内容的辅助函数
// ============================================================================

/**
 * 渲染编辑器内容
 * 功能：根据编辑模式渲染公式编辑器或代码编辑器
 */
const renderEditorContent = (
  module: ModuleDefinition,
  nodeData: CustomNodeData,
  editorMode: 'code' | 'formula',
  formulaConfig: FormulaConfig | undefined,
  updateNode: (nodeId: string, updates: any) => void
): React.ReactNode => {
  // 数据输入节点
  if (module.id === 'data_input') {
    return (
      <div className="text-center py-3">
        <div className="text-xs text-gray-500 bg-gray-900/50 rounded-lg py-2 px-3">
          数据输入节点，直接传递数据到输出
        </div>
      </div>
    );
  }

  // 公式编辑器模式
  if (editorMode === 'formula' && module.category === 'calculation') {
    return (
      <div className="h-full">
        <FormulaEditor
          inputVariables={[
            ...module.inputs.map((input, i) => ({
              id: input.id,
              name: input.name,
              key: input.id,
              type: input.type as DataType,
              color: ['bg-green-500', 'bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500'][i % 5],
            })),
            ...(nodeData.config?.dynamicInputs || []).map((input: any, i: number) => ({
              id: input.id,
              name: input.name,
              key: input.id,
              type: input.type as DataType,
              color: ['bg-green-600', 'bg-red-600', 'bg-blue-600', 'bg-yellow-600', 'bg-purple-600'][(i + module.inputs.length) % 5],
            })),
          ]}
          outputVariables={[
            ...module.outputs.map((output, i) => ({
              id: output.id,
              name: output.name,
              key: output.id,
              type: output.type as DataType,
              color: ['bg-orange-500', 'bg-cyan-500', 'bg-pink-500', 'bg-lime-500', 'bg-indigo-500'][i % 5],
            })),
            ...(nodeData.config?.dynamicOutputs || []).map((output: any, i: number) => ({
              id: output.id,
              name: output.name,
              key: output.id,
              type: output.type as DataType,
              color: ['bg-orange-600', 'bg-cyan-600', 'bg-pink-600', 'bg-lime-600', 'bg-indigo-600'][(i + module.outputs.length) % 5],
            })),
          ]}
          expression={formulaConfig?.expression || getDefaultExpression(module)}
          onAddVariable={(name, type) => {
            const varKey = name.toLowerCase().replace(/\s+/g, '_');
            if (type === 'input') {
              const newInput = {
                id: varKey,
                name: name,
                type: 'number' as DataType,
                description: `动态添加的输入变量: ${name}`,
              };
              const currentDynamicInputs = nodeData.config?.dynamicInputs || [];
              const updatedDynamicInputs = [...currentDynamicInputs, { ...newInput, key: varKey }];
              updateNode(nodeData.instanceId, {
                data: {
                  ...nodeData,
                  config: {
                    ...nodeData.config,
                    dynamicInputs: updatedDynamicInputs,
                  },
                },
              });
            } else {
              const newOutput = {
                id: varKey,
                name: name,
                type: 'number' as DataType,
                description: `动态添加的输出变量: ${name}`,
              };
              const currentDynamicOutputs = nodeData.config?.dynamicOutputs || [];
              const updatedDynamicOutputs = [...currentDynamicOutputs, { ...newOutput, key: varKey }];
              updateNode(nodeData.instanceId, {
                data: {
                  ...nodeData,
                  config: {
                    ...nodeData.config,
                    dynamicOutputs: updatedDynamicOutputs,
                  },
                },
              });
            }
          }}
          onChange={(expression, code) => {
            updateNode(nodeData.instanceId, {
              data: {
                ...nodeData,
                formulaConfig: formulaConfig ? { ...formulaConfig, expression } : {
                  targetOutput: module.outputs[0]?.id || 'output',
                  expression,
                  format: 'simple',
                },
                code,
                editorMode: 'formula',
              },
            });
          }}
        />
      </div>
    );
  }

  // 代码模式
  return <CodeEditorContent code={nodeData.code || module.code} />;
};

// ============================================================================
// 主组件
// ============================================================================

export const CustomNode = memo<NodeProps>(({ data, selected }) => {
  // 从 store 获取状态和方法
  const { modules, updateNode, zoomLevel, nodePortValues, updateNodePortValue, executeSingleNode } = useAppStore();
  const nodeData = (data as unknown) as CustomNodeData;

  // 查找模块定义
  const module = modules.find(m => m.id === nodeData.moduleId);

  // 安全检查：模块未找到时显示错误状态
  if (!module) {
    return (
      <div className="px-4 py-2 shadow-md rounded-md bg-red-900 border border-red-700">
        <div className="flex items-center">
          <span className="text-red-200">模块未找到: {nodeData.moduleId}</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 状态管理
  // =========================================================================

  // 尺寸状态
  const minWidth = module.id === 'data_input' ? 200 : 300;
  const defaultWidth = module.id === 'data_input' ? 280 : 400;
  const [dimensions, setDimensions] = useState<{ width: number; codeHeight: number }>(() => ({
    width: defaultWidth,
    codeHeight: 80,
  }));
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    codeHeight: number;
  } | null>(null);

  // 标签编辑状态
  const [nodeLabel, setNodeLabel] = useState(nodeData.label);
  const [inputLabels, setInputLabels] = useState<Record<string, string>>({});
  const [outputLabels, setOutputLabels] = useState<Record<string, string>>({});

  // 代码编辑状态
  const [isCodeCollapsed, setIsCodeCollapsed] = useState(false);
  const [jsonInput, setJsonInput] = useState(nodeData.config?.sampleData || '{}');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 公式编辑器状态
  const [editorMode, setEditorMode] = useState<'code' | 'formula'>(
    nodeData.editorMode || 'formula'
  );
  const [formulaConfig, setFormulaConfig] = useState<FormulaConfig | undefined>(
    nodeData.formulaConfig
  );

  // 同步外部标签值
  useEffect(() => {
    setNodeLabel(nodeData.label);
  }, [nodeData.label]);

  // =========================================================================
  // 效果处理
  // =========================================================================

  // 数据输入节点初始化时执行，确保有输出数据
  useEffect(() => {
    if (module.id === 'data_input' && jsonInput && jsonInput !== '{}' && executeSingleNode) {
      setTimeout(() => {
        executeSingleNode(nodeData.instanceId);
      }, 500);
    }
  }, []);

  // =========================================================================
  // 事件处理函数
  // =========================================================================

  /**
   * 开始调整大小
   */
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      codeHeight: dimensions.codeHeight,
    };
  }, [dimensions.width, dimensions.codeHeight]);

  /**
   * 鼠标移动 - 调整大小
   * 使用缩放级别修正数学逻辑
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeStartRef.current) return;

      // 计算屏幕坐标系的移动距离
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;

      // 转换为流程坐标系（考虑缩放）
      const zoomCorrection = zoomLevel || 1;
      const flowDeltaX = deltaX / zoomCorrection;
      const flowDeltaY = deltaY / zoomCorrection;

      // 自由拉伸，非等比
      const newWidth = Math.max(minWidth, resizeStartRef.current.width + flowDeltaX);
      const newCodeHeight = Math.max(60, resizeStartRef.current.codeHeight + flowDeltaY);

      setDimensions({ width: newWidth, codeHeight: newCodeHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, zoomLevel]);

  /**
   * 保存节点标题
   */
  const handleLabelSave = (value: string) => {
    updateNode(nodeData.instanceId, {
      data: { ...nodeData, label: value }
    });
  };

  /**
   * 保存输入参数名称
   */
  const handleInputLabelSave = (inputId: string, value: string) => {
    setInputLabels(prev => ({ ...prev, [inputId]: value }));
  };

  /**
   * 处理 JSON 输入变化
   */
  const handleJsonInputChange = (value: string) => {
    setJsonInput(value);

    // 解析 JSON
    let parsedData: any = null;
    let isValid = false;
    try {
      if (value.trim()) {
        parsedData = JSON.parse(value);
        isValid = true;
      }
    } catch (e) {
      // JSON 解析失败是正常的（用户正在输入）
    }

    const performUpdates = async () => {
      // 更新节点配置
      updateNode(nodeData.instanceId, {
        data: { ...nodeData, config: { ...nodeData.config, sampleData: value } }
      });

      // 只有在 JSON 有效时才进行数据传播
      if (isValid && parsedData !== null) {
        await new Promise(resolve => setTimeout(resolve, 0));

        // 更新输出端口值
        module?.outputs.forEach(output => {
          updateNodePortValue(nodeData.instanceId, output.id, parsedData[output.id] ?? parsedData);
        });

        await new Promise(resolve => setTimeout(resolve, 0));

        // 触发下游节点连锁更新
        if (executeSingleNode) {
          executeSingleNode(nodeData.instanceId);
        }
      }
    };

    performUpdates().catch(console.error);
  };

  /**
   * 处理文件上传
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedData = JSON.parse(content);
          setJsonInput(content);
          updateNode(nodeData.instanceId, {
            data: { ...nodeData, config: { ...nodeData.config, sampleData: content } }
          });
          module?.outputs.forEach(output => {
            updateNodePortValue(nodeData.instanceId, output.id, parsedData[output.id] ?? parsedData);
          });
          if (executeSingleNode) {
            executeSingleNode(nodeData.instanceId);
          }
        } catch (error) {
          console.error('Invalid JSON file:', error);
          alert('请上传有效的 JSON 文件');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  /**
   * 触发文件上传
   */
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  /**
   * 保存输出参数名称
   */
  const handleOutputLabelSave = (outputId: string, value: string) => {
    setOutputLabels(prev => ({ ...prev, [outputId]: value }));
  };

  // =========================================================================
  // 样式辅助函数
  // =========================================================================

  /**
   * 获取状态对应的颜色
   */
  const getStatusColor = () => {
    switch (nodeData.status) {
      case 'running':
        return 'border-blue-500 bg-blue-900/50';
      case 'success':
        return 'border-green-500 bg-green-900/50';
      case 'error':
        return 'border-red-500 bg-red-900/50';
      default:
        return 'border-gray-600 bg-gray-800';
    }
  };

  /**
   * 获取分类对应的颜色
   */
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'input':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'calculation':
        return 'bg-purple-500';
      case 'output':
        return 'bg-orange-500';
      case 'custom':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // =========================================================================
  // 渲染
  // =========================================================================

  // 获取最大行数，用于对齐
  const dynamicInputs = nodeData.config?.dynamicInputs || [];
  const dynamicOutputs = nodeData.config?.dynamicOutputs || [];
  const maxRows = Math.max(
    module.inputs.length + dynamicInputs.length,
    module.outputs.length + dynamicOutputs.length
  );

  // 构建输入行
  const inputRows = [];
  for (let i = 0; i < maxRows; i++) {
    const input = module.inputs[i];
    const output = module.outputs[i];
    inputRows.push({
      input: input || null,
      output: output || null,
    });
  }

  return (
    <div
      style={{
        width: dimensions.width,
        minWidth: minWidth,
        minHeight: 200,
        paddingBottom: 16, // 为右下角 resize handle 留出空间
      }}
      className={`rounded-lg border-2 ${getStatusColor()} ${selected ? 'ring-2 ring-blue-400' : ''} flex flex-col relative`}
    >
      {/* === 顶部标题栏 [拖拽区域] === */}
      <div
        className="flex items-center p-2 bg-gray-700 rounded-t-lg cursor-grab"
        data-drag-handle
      >
        <div className={`w-2 h-2 rounded-full ${getCategoryColor(module.category)}`} />
        <EditableLabel
          value={nodeLabel}
          onSave={handleLabelSave}
          className="ml-2 font-medium text-white text-sm"
          placeholder="节点名称"
        />
      </div>

      {/* === 左右并列区 [内容区域 - nodrag] === */}
      <div className="flex nodrag">
        {/* === 输入区 === */}
        <div className="flex-1 p-2 border-r border-gray-600">
          <div className="flex items-center mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
            <span className="text-[10px] text-gray-400">输入区</span>
          </div>

          {/* 数据输入节点的特殊输入框 */}
          {module.id === 'data_input' ? (
            <div className="mt-2">
              <div className="relative w-full">
                <input
                  type="text"
                  value={jsonInput}
                  onChange={(e) => handleJsonInputChange(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full h-7 bg-gray-900/50 border border-gray-600 rounded-lg px-2 pr-8 text-xs text-gray-300 font-mono placeholder-gray-500 focus:outline-none focus:border-blue-500 select-text"
                  placeholder='{"key": "value"} 或拖拽文件到这里'
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        try {
                          const content = ev.target?.result as string;
                          const parsedData = JSON.parse(content);
                          setJsonInput(content);
                          updateNode(nodeData.instanceId, {
                            data: { ...nodeData, config: { ...nodeData.config, sampleData: content } }
                          });
                          module?.outputs.forEach(output => {
                            updateNodePortValue(nodeData.instanceId, output.id, parsedData[output.id] ?? parsedData);
                          });
                          executeSingleNode(nodeData.instanceId);
                        } catch (error) {
                          console.error('Invalid JSON file:', error);
                          alert('请上传有效的 JSON 文件');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
                {/* 隐藏的文件输入 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {/* 上传按钮 */}
                <button
                  onClick={triggerFileUpload}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 bg-gray-700/50 hover:bg-gray-600 rounded transition-colors group"
                  title="上传 JSON 文件"
                >
                  <Upload className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              {/* 原始输入 + 动态添加的输入 */}
              {[...module.inputs, ...(nodeData.config?.dynamicInputs || [])].map((input) => {
                const inputValues = nodeData.inputValues || {};
                const inputFormats = nodeData.inputFormats || {};
                const displayValue = inputValues[input.id];
                const formatInfo = inputFormats[input.id];
                const hasValue = displayValue !== undefined && displayValue !== null;

                return (
                  <div key={input.id} className="flex items-center h-5 relative group">
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={input.id}
                      className="w-2.5 h-2.5 bg-green-500 border border-white rounded-full absolute"
                      style={{ left: -5, top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <div className="ml-4 flex items-center cursor-grab active:cursor-grabbing nodrag">
                      {/* 【关键】格式预览显示 */}
                      {formatInfo ? (
                        <span
                          className="text-[10px] text-purple-400 mr-1 px-1 bg-purple-500/20 rounded"
                          title={`来自: ${formatInfo.sourcePortId}\n类型: ${formatInfo.type}`}
                        >
                          {formatInfo.type === 'object' ? '{...}' : formatInfo.type === 'array' ? '[...]' : formatInfo.type}
                        </span>
                      ) : null}
                      {/* 动态值显示 */}
                      {hasValue ? (
                        <ValuePreviewPopover value={displayValue} position="bottom">
                          <span
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('application/json', JSON.stringify({
                                type: 'variable',
                                name: inputLabels[input.id] || input.name,
                                id: input.id,
                              }));
                            }}
                            className="text-xs text-blue-300 hover:text-blue-200 transition-colors select-none max-w-[80px] truncate"
                            style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                          >
                            ({formatValueForDisplay(displayValue)})
                          </span>
                        </ValuePreviewPopover>
                      ) : (
                        <span className="text-[10px] text-gray-500 ml-1">({input.type})</span>
                      )}
                      {/* 变量名称 */}
                      <span
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/json', JSON.stringify({
                            type: 'variable',
                            name: inputLabels[input.id] || input.name,
                            id: input.id,
                          }));
                        }}
                        className="text-xs text-gray-200 hover:text-blue-300 transition-colors select-none"
                      >
                        {inputLabels[input.id] || input.name}
                      </span>
                    </div>
                  </div>
                );
              })}
              {module.inputs.length === 0 && (nodeData.config?.dynamicInputs?.length || 0) === 0 && (
                <div className="h-5 text-[10px] text-gray-500 italic">无输入</div>
              )}
            </div>
          )}
        </div>

        {/* === 输出区 === */}
        <div className="flex-1 p-2">
          <div className="flex items-center justify-end mb-1">
            <span className="text-[10px] text-gray-400 mr-1">输出区</span>
            <div className="w-2 h-2 rounded-full bg-orange-500" />
          </div>
          {/* 输出参数列表 */}
          <div className="space-y-0.5">
            {/* 原始输出 + 动态添加的输出 */}
            {[...module.outputs, ...(nodeData.config?.dynamicOutputs || [])].map((output) => {
              const portKey = `${nodeData.instanceId}:${output.id}`;
              const portValue = nodePortValues[portKey];
              const displayValue = portValue?.value;
              const hasValue = displayValue !== undefined && displayValue !== null;

              return (
                <div key={output.id} className="flex items-center justify-end h-5 relative group">
                  <div className="mr-4 flex items-center cursor-grab active:cursor-grabbing nodrag">
                    {/* 动态值显示 */}
                    {hasValue ? (
                      <ValuePreviewPopover value={displayValue} position="bottom">
                        <span
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/json', JSON.stringify({
                              type: 'variable',
                              name: outputLabels[output.id] || output.name,
                              id: output.id,
                            }));
                          }}
                          className="text-xs text-blue-300 hover:text-blue-200 transition-colors select-none max-w-[100px] truncate"
                          style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                        >
                          ({formatValueForDisplay(displayValue)})
                        </span>
                      </ValuePreviewPopover>
                    ) : (
                      <span className="text-[10px] text-gray-500 mr-1">({output.type})</span>
                    )}
                    {/* 变量名称 */}
                    <span
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify({
                          type: 'variable',
                          name: outputLabels[output.id] || output.name,
                          id: output.id,
                        }));
                      }}
                      className="text-xs text-gray-200 hover:text-blue-300 transition-colors select-none"
                    >
                      {outputLabels[output.id] || output.name}
                    </span>
                  </div>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={output.id}
                    className="w-2.5 h-2.5 bg-orange-500 border border-white rounded-full absolute"
                    style={{ right: -5, top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              );
            })}
            {module.outputs.length === 0 && (
              <div className="h-5 text-[10px] text-gray-500 italic text-right">无输出</div>
            )}
          </div>
        </div>
      </div>

      {/* === 代码区 [可折叠] === */}
      <div
        className="flex-1 border-t border-gray-600 cursor-text nodrag overflow-hidden flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-2 py-1 bg-gray-750 border-b border-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">计算逻辑</span>
            {/* 编辑模式切换 */}
            {module.category === 'calculation' && (
              <div className="flex items-center space-x-1 bg-gray-700 rounded p-0.5">
                <button
                  onClick={() => setEditorMode('formula')}
                  className={`px-2 py-0.5 text-xs rounded transition-colors flex items-center space-x-1 ${editorMode === 'formula' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <Calculator className="w-3 h-3" />
                  <span>公式</span>
                </button>
                <button
                  onClick={() => setEditorMode('code')}
                  className={`px-2 py-0.5 text-xs rounded transition-colors flex items-center space-x-1 ${editorMode === 'code' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <Code className="w-3 h-3" />
                  <span>代码</span>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCodeCollapsed(!isCodeCollapsed)}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {isCodeCollapsed ? '▼' : '▲'}
          </button>
        </div>
        {!isCodeCollapsed && (
          <div className="flex-1 p-2 nodrag overflow-hidden">
            {renderEditorContent(module, nodeData, editorMode, formulaConfig, updateNode)}
          </div>
        )}
      </div>

      {/* === 底部描述区 === */}
      <div
        className="p-2 border-t border-gray-600 cursor-text nodrag"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="text-xs text-gray-400 leading-relaxed">
          {module.description}
        </div>
      </div>

      {/* === 底部调整大小区域 === */}
      <div
        className="absolute bottom-0 left-0 right-10 h-3 cursor-ns-resize hover:bg-blue-500/30 transition-colors nodrag"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleResizeStart(e);
        }}
        title="拖拽调整大小"
      />
      {/* 右下角缩放手柄 */}
      <ResizeHandle onMouseDown={handleResizeStart} />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
