/**
 * ============================================================================
 * 文件名：自定义节点.tsx
 * 功能描述：流程节点的可视化组件
 *
 * 本组件是整个应用的核心组件之一，负责渲染流程画布上的每个节点。
 * 它是一个完整的节点渲染组件，包括：
 * 1. 顶部：标题栏（分类色点 + 可编辑标题）[拖拽区域]
 * 2. 中间左侧：输入区（显示输入端口、实时值、格式预览）
 * 3. 中间右侧：输出区（显示输出端口、实时值）
 * 4. 底部：计算逻辑区（代码编辑器或公式编辑器）[可折叠]
 * 5. 最底部：节点描述信息
 *
 * 节点布局结构：
 * ┌──────────────────────────────────────────────┐
 * │  分类色点  节点标题（可编辑）                   │ <-- 顶部：标题栏 [拖拽区域]
 * ├──────────────────────┬───────────────────────┤
 * │  输入区              │  输出区                │ <-- 中间：左右并列区
 * ├──────────────────────┴───────────────────────┤
 * │  计算逻辑（可折叠）                            │ <-- 底部：代码编辑器区
 * ├──────────────────────────────────────────────┤
 * │  节点描述                                      │
 * └──────────────────────────────────────────────┘
 *
 * 核心功能：
 * 1. 节点拖拽（通过顶部标题栏）
 * 2. 节点大小调整（通过右下角手柄）
 * 3. 输入/输出端口显示
 * 4. 实时值预览（悬停显示详细值）
 * 5. 格式预览显示（紫色标识，显示数据类型）
 * 6. 代码/公式编辑切换
 * 7. JSON 数据输入（数据输入节点专用）
 * ============================================================================
 */

// 导入 React 核心库
import React, { memo, useState, useRef, useEffect, useCallback } from 'react';

// 从 React Flow 库导入必要的组件和类型
// Handle: 节点端口句柄（用于连接线）
// Position: 端口位置枚举（左/右）
// NodeProps: 节点组件的属性类型
import { Handle, Position, NodeProps } from '@xyflow/react';

// 从 lucide-react 导入图标组件
import { Upload, Code, Calculator } from 'lucide-react';

// 从 store 导入状态管理 Hook
// useAppStore: 获取应用全局状态和方法
import { useAppStore } from '@/store/index';

// 从类型定义文件导入类型
import type {
  ModuleDefinition,  // 模块定义类型
  FormulaConfig,     // 公式配置类型
  FormulaNode,       // 公式节点类型
  DataType           // 数据类型
} from '@/types/index';

// 导入子组件
import { 公式编辑器 } from './公式编辑器';  // 公式编辑器组件
import { 值预览弹出框, formatValueForDisplay } from './值预览弹出框';  // 值预览组件
import { 可编辑标签 } from './节点/可编辑标签';  // 可编辑标签组件
import { 调整大小手柄 } from './节点/调整大小手柄';  // 调整大小手柄组件
import { 代码编辑器内容 } from './编辑器/代码编辑器内容';  // 代码编辑器内容组件

// ============================================================================
// 第一部分：类型定义
// ============================================================================

/**
 * 输入格式信息接口
 *
 * 功能说明：
 * 用于存储上游节点输出的格式信息，供 UI 显示格式预览
 *
 * 【关键】这个接口用于实现"格式传递"功能：
 * - 连线后，下游节点可以显示上游输出的类型信息
 * - 在输入端口旁边显示紫色格式标识
 * - 悬停时显示来源信息（来自哪个节点/端口）
 *
 * 数据来源：
 * - 在 store 的 executeSingleNode 函数中构建
 * - 从上游节点的 outputFormat 获取
 */
interface 输入格式信息 {
  // 值类型：'number' | 'string' | 'boolean' | 'object' | 'array'
  // 用于 UI 显示类型标识
  type: string;

  // 值的详细结构信息（可选）
  // 包含：对象字段、数组元素等
  // 用于更详细的格式预览
  structure?: any;

  // 上游节点的唯一标识符
  // 用于追踪数据来源
  sourceNodeId: string;

  // 上游端口的唯一标识符
  // 用于显示"来自：端口名"
  sourcePortId: string;
}

/**
 * 节点数据类型接口
 *
 * 功能说明：
 * 定义节点的数据结构，包含模块引用、配置、状态等信息
 *
 * 数据来源：
 * - 节点创建时从模块定义复制
 * - 节点执行时更新状态和值
 * - 连线时更新输入值和格式
 */
interface 节点数据类型 {
  // 关联的模块 ID
  // 引用 ModuleDefinition.id
  moduleId: string;

  // 模块配置参数
  // 节点创建时从模块定义复制
  // 用户可以修改配置
  config: Record<string, any>;

  // 节点显示标题
  // 用户可以编辑
  label: string;

  // 节点实例 ID
  // 格式：'instance_' + 时间戳
  // 用于在 UI 组件中引用节点
  instanceId: string;

  // 节点运行状态
  // 可选值：'idle'(空闲) | 'running'(运行中) | 'success'(成功) | 'error'(失败)
  status: 'idle' | 'running' | 'success' | 'error';

  // 预览数据
  // 节点执行成功后存储执行结果
  // 用于在节点上显示数据预览
  preview?: any;

  // 自定义代码
  // 用户编写的计算逻辑
  // 覆盖模块的默认代码
  code?: string;

  // 公式配置
  // 公式编辑器模式下的配置
  // 包含目标输出和表达式树
  formulaConfig?: FormulaConfig;

  // 编辑模式
  // 可选值：'code'(代码) | 'formula'(公式)
  editorMode?: 'code' | 'formula';

  // 输入端口实时值
  // 存储每个输入端口的当前值
  // 用于 UI 显示输入值
  inputValues?: Record<string, any>;

  // 【关键】输入端口格式信息
  // 存储每个输入端口的格式信息
  // 用于 UI 显示格式预览
  inputFormats?: Record<string, 输入格式信息>;
}

// 导出节点数据类型供其他组件使用
export type { 节点数据类型 };

// ============================================================================
// 第二部分：辅助函数
// ============================================================================

/**
 * 获取模块的默认表达式
 *
 * 功能说明：
 * 根据模块的输入端口自动生成默认的计算公式
 *
 * 生成规则：
 * 1. 无输入：返回常量 0
 * 2. 单输入：直接返回该输入变量
 * 3. 双输入：返回乘法表达式（输入1 × 输入2）
 * 4. 多输入：返回利润公式 (输入2 - 输入1) × 输入3
 *
 * @param module - 模块定义
 * @returns 公式节点树
 */
const 获取默认表达式 = (module: ModuleDefinition): FormulaNode => {
  // 获取模块的输入端口列表
  const inputs = module.inputs;

  // 规则1：无输入时返回常量 0
  if (inputs.length === 0) {
    return {
      id: 'default',       // 节点 ID
      type: 'constant',    // 节点类型：常量
      value: '0'           // 常量值
    };
  }

  // 规则2：单输入时���接传递
  if (inputs.length === 1) {
    return {
      id: inputs[0].id,    // 使用输入端口 ID
      type: 'variable',    // 节点类型：变量
      value: inputs[0].id  // 变量键
    };
  }

  // 规则3：双输入时返回乘法表达式
  if (inputs.length === 2) {
    return {
      id: 'expr',          // 表达式 ID
      type: 'operator',    // 节点类型：运算符
      value: '*',          // 运算符：乘法
      children: [          // 子节点（操作数）
        {
          id: inputs[0].id,
          type: 'variable',
          value: inputs[0].id
        },
        {
          id: inputs[1].id,
          type: 'variable',
          value: inputs[1].id
        }
      ],
    };
  }

  // 规则4：默认利润公式 (price - cost) * quantity
  // 返回减法表达式 × 第三输入的表达式
  return {
    id: 'default',
    type: 'operator',
    value: '*',
    children: [
      // 减法子表达式：(输入2 - 输入1)
      {
        id: 'sub',
        type: 'operator',
        value: '-',
        children: [
          // 输入2（或输入1）
          {
            id: inputs[1]?.id || inputs[0].id,
            type: 'variable',
            value: inputs[1]?.id || inputs[0].id
          },
          // 输入1
          {
            id: inputs[0].id,
            type: 'variable',
            value: inputs[0].id
          },
        ],
      },
      // 输入3（或输入1）
      {
        id: inputs[2]?.id || inputs[0].id,
        type: 'variable',
        value: inputs[2]?.id || inputs[0].id
      },
    ],
  };
};

// ============================================================================
// 第三部分：渲染编辑器内容
// ============================================================================

/**
 * 渲染编辑器内容
 *
 * 功能说明：
 * 根据编辑模式渲染公式编辑器或代码编辑器
 *
 * 特殊处理：
 * - 数据输入节点（data_input）显示特殊提示信息
 * - 计算类模块（calculation）支持公式/代码两种模式
 * - 其他模块只显示代码编辑器
 *
 * @param module - 模块定义
 * @param nodeData - 节点数据
 * @param editorMode - 编辑模式（'code' | 'formula'）
 * @param formulaConfig - 公式配置（可选）
 * @param updateNode - 更新节点的方法
 * @returns React 节点
 */
const 渲染编辑器内容 = (
  module: ModuleDefinition,
  nodeData: 节点数据类型,
  editorMode: 'code' | 'formula',
  formulaConfig: FormulaConfig | undefined,
  updateNode: (nodeId: string, updates: any) => void
): React.ReactNode => {
  // 特殊处理：数据输入节点
  if (module.id === 'data_input') {
    return (
      // 居中显示提示信息
      <div className="text-center py-3">
        <div className="text-xs text-gray-500 bg-gray-900/50 rounded-lg py-2 px-3">
          数据输入节点，直接传递数据到输出
        </div>
      </div>
    );
  }

  // 公式编辑器模式（仅计算类模块支持）
  if (editorMode === 'formula' && module.category === 'calculation') {
    return (
      // 公式编辑器容器
      <div className="h-full">
        <公式编辑器
          // 输入变量列表（原始输入 + 动态输入）
          inputVariables={[
            ...module.inputs.map((input, i) => ({
              id: input.id,
              name: input.name,
              key: input.id,
              type: input.type as DataType,
              // 循环使用颜色数组
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
          // 输出变量列表（原始输出 + 动态输出）
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
          // 当前表达式（使用配置的或默认的）
          expression={formulaConfig?.expression || 获取默认表达式(module)}
          // 添加变量回调
          onAddVariable={(name, type) => {
            // 将变量名转换为小写下划线格式
            const varKey = name.toLowerCase().replace(/\s+/g, '_');

            // 判断是添加输入还是输出
            if (type === 'input') {
              // 创建新输入定义
              const newInput = {
                id: varKey,
                name: name,
                type: 'number' as DataType,
                description: `动态添加的输入变量: ${name}`,
              };

              // 获取当前动态输入列表
              const currentDynamicInputs = nodeData.config?.dynamicInputs || [];
              // 添加新输入
              const updatedDynamicInputs = [...currentDynamicInputs, { ...newInput, key: varKey }];

              // 更新节点
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
              // 创建新输出定义
              const newOutput = {
                id: varKey,
                name: name,
                type: 'number' as DataType,
                description: `动态添加的输出变量: ${name}`,
              };

              // 获取当前动态输出列表
              const currentDynamicOutputs = nodeData.config?.dynamicOutputs || [];
              // 添加新输出
              const updatedDynamicOutputs = [...currentDynamicOutputs, { ...newOutput, key: varKey }];

              // 更新节点
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
          // 表达式变化回调
          onChange={(expression, code) => {
            updateNode(nodeData.instanceId, {
              data: {
                ...nodeData,
                // 更新或创建公式配置
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

  // 代码模式：显示代码编辑器内容
  return <代码编辑器内容 code={nodeData.code || module.code} />;
};

// ============================================================================
// 第四部分：主组件
// ============================================================================

/**
 * 自定义节点组件
 *
 * 【核心组件】
 * 渲染流程画布上的每个节点
 *
 * 使用 memo 包装以优化渲染性能
 * 只有当数据真正变化时才重新渲染
 *
 * @param props - React Flow 节点属性
 * @param props.data - 节点数据
 * @param props.selected - 是否被选中
 */
export const 自定义节点 = memo<NodeProps>(({ data, selected }) => {
  // =========================================================================
  // 第一步：从 store 获取状态和方法
  // =========================================================================

  // 从全局状态获取模块列表和操作方法
  const {
    modules,              // 模块列表
    updateNode,           // 更新节点方法
    zoomLevel,            // 画布缩放级别
    nodePortValues,       // 节点端口值映射
    updateNodePortValue,  // 更新端口值方法
    executeSingleNode     // 执行单个节点方法
  } = useAppStore();

  // 将 data 转换为节点数据类型
  const nodeData = (data as unknown) as 节点数据类型;

  // =========================================================================
  // 第二步：查找模块定义
  // =========================================================================

  // 根据模块 ID 查找模块定义
  const module = modules.find(m => m.id === nodeData.moduleId);

  // 安全检查：模块未找到时显示错误状态
  if (!module) {
    // 返回错误状态节点
    return (
      <div className="px-4 py-2 shadow-md rounded-md bg-red-900 border border-red-700">
        <div className="flex items-center">
          <span className="text-red-200">模块未找到: {nodeData.moduleId}</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 第三步：状态管理
  // =========================================================================

  // 尺寸相关状态
  const minWidth = module.id === 'data_input' ? 200 : 300;  // 最小宽度
  const defaultWidth = module.id === 'data_input' ? 280 : 400;  // 默认宽度

  // 节点尺寸状态
  const [dimensions, setDimensions] = useState<{ width: number; codeHeight: number }>(() => ({
    width: defaultWidth,    // 节点宽度
    codeHeight: 80,         // 代码区域高度
  }));

  // 是否正在调整大小
  const [isResizing, setIsResizing] = useState(false);

  // 调整大小起始状态引用
  const resizeStartRef = useRef<{
    x: number;              // 起始鼠标 X 坐标
    y: number;              // 起始鼠标 Y 坐标
    width: number;          // 起始节点宽度
    codeHeight: number;     // 起始代码区域高度
  } | null>(null);

  // 标签编辑状态
  const [nodeLabel, setNodeLabel] = useState(nodeData.label);  // 节点标题
  const [inputLabels, setInputLabels] = useState<Record<string, string>>({});  // 输入标签映射
  const [outputLabels, setOutputLabels] = useState<Record<string, string>>({});  // 输出标签映射

  // 代码编辑状态
  const [isCodeCollapsed, setIsCodeCollapsed] = useState(false);  // 代码区域是否折叠
  const [jsonInput, setJsonInput] = useState(nodeData.config?.sampleData || '{}');  // JSON 输入
  const fileInputRef = useRef<HTMLInputElement>(null);  // 文件输入引用

  // 公式编辑器状态
  const [editorMode, setEditorMode] = useState<'code' | 'formula'>(
    nodeData.editorMode || 'formula'  // 编辑模式
  );
  const [formulaConfig, setFormulaConfig] = useState<FormulaConfig | undefined>(
    nodeData.formulaConfig  // 公式配置
  );

  // =========================================================================
  // 第四步：效果处理（副作用）
  // =========================================================================

  // 同步外部标签值
  // 当 nodeData.label 变化时，更新本地状态
  useEffect(() => {
    setNodeLabel(nodeData.label);
  }, [nodeData.label]);

  // 数据输入节点初始化时执行
  // 确保数据输入节点有输出数据
  useEffect(() => {
    // 判断条件：数据输入节点、有 JSON 输入、非空数据、有执行方法
    if (module.id === 'data_input' && jsonInput && jsonInput !== '{}' && executeSingleNode) {
      // 延迟 500ms 执行，确保组件已挂载
      setTimeout(() => {
        executeSingleNode(nodeData.instanceId);
      }, 500);
    }
  }, []);

  // =========================================================================
  // 第五步：事件处理函数
  // =========================================================================

  /**
   * 开始调整大小
   *
   * 触发时机：
   * - 用户点击右下角调整大小手柄
   *
   * 处理步骤：
   * 1. 阻止默认行为（防止拖拽节点）
   * 2. 阻止事件冒泡（防止触发其他事件）
   * 3. 设置正在调整大小状态
   * 4. 记录起始状态（鼠标位置、节点尺寸）
   */
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    // 阻止默认行为
    e.preventDefault();
    // 阻止冒泡
    e.stopPropagation();
    // 设置正在调整大小
    setIsResizing(true);
    // 记录起始状态
    resizeStartRef.current = {
      x: e.clientX,                    // 当前鼠标 X 坐标
      y: e.clientY,                    // 当前鼠标 Y 坐标
      width: dimensions.width,         // 当前节点宽度
      codeHeight: dimensions.codeHeight,  // 当前代码区域高度
    };
  }, [dimensions.width, dimensions.codeHeight]);

  /**
   * 鼠标移动 - 调整大小
   *
   * 使用 useEffect 监听鼠标移动事件
   * 因为需要在整个文档范围内监听
   *
   * 关键逻辑：
   * - 计算屏幕坐标系中的移动距离
   * - 考虑缩放级别，转换为流程坐标系
   * - 限制最小尺寸
   */
  useEffect(() => {
    // 鼠标移动处理函数
    const handleMouseMove = (e: MouseEvent) => {
      // 如果没有在调整大小或没有起始状态，直接返回
      if (!isResizing || !resizeStartRef.current) return;

      // 计算屏幕坐标系中的移动距离
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;

      // 考虑缩放级别，转换为流程坐标系
      const zoomCorrection = zoomLevel || 1;
      const flowDeltaX = deltaX / zoomCorrection;
      const flowDeltaY = deltaY / zoomCorrection;

      // 计算新的尺寸（自由拉伸，非等比）
      const newWidth = Math.max(minWidth, resizeStartRef.current.width + flowDeltaX);
      const newCodeHeight = Math.max(60, resizeStartRef.current.codeHeight + flowDeltaY);

      // 更新尺寸状态
      setDimensions({ width: newWidth, codeHeight: newCodeHeight });
    };

    // 鼠标释放处理函数
    const handleMouseUp = () => {
      // 结束调整大小
      setIsResizing(false);
      // 清除起始状态
      resizeStartRef.current = null;
    };

    // 如果正在调整大小，添加事件监听
    if (isResizing) {
      // 监听鼠标移动事件
      window.addEventListener('mousemove', handleMouseMove);
      // 监听鼠标释放事件
      window.addEventListener('mouseup', handleMouseUp);
    }

    // 清理函数：移除事件监听
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, zoomLevel]);

  /**
   * 保存节点标题
   *
   * 触发时机：
   * - 用户编辑完节点标题并保存
   *
   * @param value - 新的标题值
   */
  const handleLabelSave = (value: string) => {
    // 更新节点数据
    updateNode(nodeData.instanceId, {
      data: { ...nodeData, label: value }
    });
  };

  /**
   * 保存输入参数名称
   *
   * 触发时机：
   * - 用户编辑完输入参数名称
   *
   * @param inputId - 输入端口 ID
   * @param value - 新的名称
   */
  const handleInputLabelSave = (inputId: string, value: string) => {
    // 更新本地标签映射
    setInputLabels(prev => ({ ...prev, [inputId]: value }));
  };

  /**
   * 处理 JSON 输入变化
   *
   * 触发时机：
   * - 用户在数据输入节点的输入框中输入内容
   *
   * 处理步骤：
   * 1. 更新输入框显示
   * 2. 尝试解析 JSON
   * 3. 如果解析成功，更新节点配置
   * 4. 更新输出端口值
   * 5. 触发下游节点连锁更新
   *
   * @param value - 输入的字符串
   */
  const handleJsonInputChange = (value: string) => {
    // 更新输入框显示
    setJsonInput(value);

    // 解析 JSON
    let parsedData: any = null;
    let isValid = false;
    try {
      // 如果输入不为空，尝试解析
      if (value.trim()) {
        parsedData = JSON.parse(value);
        isValid = true;
      }
    } catch (e) {
      // JSON 解析失败是正常的（用户正在输入）
      // 不做任何处理
    }

    // 执行更新的异步函数
    const performUpdates = async () => {
      // 更新节点配置
      updateNode(nodeData.instanceId, {
        data: { ...nodeData, config: { ...nodeData.config, sampleData: value } }
      });

      // 只有在 JSON 有效时才进行数据传播
      if (isValid && parsedData !== null) {
        // 等待状态更新
        await new Promise(resolve => setTimeout(resolve, 0));

        // 更新输出端口值
        module?.outputs.forEach(output => {
          // 使用端口 ID 或整个数据作为值
          updateNodePortValue(nodeData.instanceId, output.id, parsedData[output.id] ?? parsedData);
        });

        // 等待状态更新
        await new Promise(resolve => setTimeout(resolve, 0));

        // 触发下游节点连锁更新
        if (executeSingleNode) {
          executeSingleNode(nodeData.instanceId);
        }
      }
    };

    // 执行更新（捕获错误）
    performUpdates().catch(console.error);
  };

  /**
   * 处理文件上传
   *
   * 触发时机：
   * - 用户选择要上传的 JSON 文件
   *
   * 处理步骤：
   * 1. 读取文件内容
   * 2. 解析 JSON
   * 3. 更新输入框和节点配置
   * 4. 更新输出端口值
   * 5. 触发下游节点更新
   *
   * @param event - 文件输入变化事件
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 获取选择的文件
    const file = event.target.files?.[0];

    if (file) {
      // 创建文件读取器
      const reader = new FileReader();

      // 文件读取完成回调
      reader.onload = (e) => {
        try {
          // 获取文件内容
          const content = e.target?.result as string;
          // 解析 JSON
          const parsedData = JSON.parse(content);

          // 更新输入框显示
          setJsonInput(content);

          // 更新节点配置
          updateNode(nodeData.instanceId, {
            data: { ...nodeData, config: { ...nodeData.config, sampleData: content } }
          });

          // 更新输出端口值
          module?.outputs.forEach(output => {
            updateNodePortValue(nodeData.instanceId, output.id, parsedData[output.id] ?? parsedData);
          });

          // 触发下游节点更新
          if (executeSingleNode) {
            executeSingleNode(nodeData.instanceId);
          }
        } catch (error) {
          // 打印错误
          console.error('Invalid JSON file:', error);
          // 提示用户
          alert('请上传有效的 JSON 文件');
        }
      };

      // 读取文件内容
      reader.readAsText(file);
    }

    // 清空文件输入（允许重复选择同一文件）
    event.target.value = '';
  };

  /**
   * 触发文件上传
   *
   * 触发时机：
   * - 用户点击上传按钮
   *
   * 处理方式：
   * - 触发隐藏的文件输入元素
   */
  const triggerFileUpload = () => {
    // 点击隐藏的文件输入
    fileInputRef.current?.click();
  };

  /**
   * 保存输出参数名称
   *
   * 触发时机：
   * - 用户编辑完输出参数名称
   *
   * @param outputId - 输出端口 ID
   * @param value - 新的名称
   */
  const handleOutputLabelSave = (outputId: string, value: string) => {
    // 更新本地标签映射
    setOutputLabels(prev => ({ ...prev, [outputId]: value }));
  };

  // =========================================================================
  // 第六步：样式辅助函数
  // =========================================================================

  /**
   * 获取状态对应的颜色样式
   *
   * 功能：
   * 根据节点状态返回对应的边框和背景颜色
   *
   * 状态颜色映射：
   * - 'running': 蓝色边框 + 蓝色半透明背景
   * - 'success': 绿色边框 + 绿色半透明背景
   * - 'error': 红色边框 + 红色半透明背景
   * - 'idle': 灰色边框 + 深灰背景（默认）
   *
   * @returns 颜色样式字符串
   */
  const getStatusColor = () => {
    // 根据状态返回对应样式
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
   *
   * 功能：
   * 根据模块分类返回对应的颜色
   *
   * 分类颜色映射：
   * - 'input': 绿色（输入模块）
   * - 'processing': 蓝色（处理模块）
   * - 'calculation': 紫色（计算模块）
   * - 'output': 橙色（输出模块）
   * - 'custom': 灰色（自定义模块）
   *
   * @param category - 模块分类
   * @returns 颜色类名字符串
   */
  const getCategoryColor = (category: string) => {
    // 根据分类返回对应颜色
    switch (category) {
      case 'input':
        return 'bg-green-500';      // 绿色
      case 'processing':
        return 'bg-blue-500';       // 蓝色
      case 'calculation':
        return 'bg-purple-500';     // 紫色
      case 'output':
        return 'bg-orange-500';     // 橙色
      case 'custom':
        return 'bg-gray-500';       // 灰色
      default:
        return 'bg-gray-500';       // 默认灰色
    }
  };

  // =========================================================================
  // 第七步：渲染
  // =========================================================================

  // 获取动态输入/输出列表
  const dynamicInputs = nodeData.config?.dynamicInputs || [];
  const dynamicOutputs = nodeData.config?.dynamicOutputs || [];

  // 计算最大行数（用于对齐输入输出区）
  const maxRows = Math.max(
    module.inputs.length + dynamicInputs.length,
    module.outputs.length + dynamicOutputs.length
  );

  // 构建输入行数组
  const inputRows = [];
  for (let i = 0; i < maxRows; i++) {
    // 获取对应位置的输入和输出
    const input = module.inputs[i];
    const output = module.outputs[i];
    // 添加到行数组
    inputRows.push({
      input: input || null,    // 没有则为 null
      output: output || null,  // 没有则为 null
    });
  }

  // 返回节点 JSX
  return (
    // 节点容器
    <div
      // 内联样式：宽度、高度
      style={{
        width: dimensions.width,
        minWidth: minWidth,
        minHeight: 200,
        paddingBottom: 16,  // 为右下角 resize handle 留出空间
      }}
      // CSS 类名：边框、背景、选中状态
      className={`rounded-lg border-2 ${getStatusColor()} ${selected ? 'ring-2 ring-blue-400' : ''} flex flex-col relative`}
    >
      {/* ==================== 顶部标题栏 [拖拽区域] ==================== */}
      <div
        // CSS 类名：flex 布局、内边距、背景、圆角、拖拽光标
        className="flex items-center p-2 bg-gray-700 rounded-t-lg cursor-grab"
        // 标记为拖拽区域（React Flow 识别）
        data-drag-handle
      >
        {/* 分类色点 */}
        <div className={`w-2 h-2 rounded-full ${getCategoryColor(module.category)}`} />

        {/* 可编辑标签组件 */}
        <可编辑标签
          value={nodeLabel}                    // 当前值
          onSave={handleLabelSave}             // 保存回调
          className="ml-2 font-medium text-white text-sm"  // 额外样式
          placeholder="节点名称"               // 占位符
        />
      </div>

      {/* ==================== 左右并列区 [内容区域 - nodrag] ==================== */}
      <div className="flex nodrag">
        {/* ==================== 输入区 ==================== */}
        <div className="flex-1 p-2 border-r border-gray-600">
          {/* 标题：绿色圆点 + "输入区"文字 */}
          <div className="flex items-center mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
            <span className="text-[10px] text-gray-400">输入区</span>
          </div>

          {/* 数据输入节点：特殊输入框 */}
          {module.id === 'data_input' ? (
            <div className="mt-2">
              <div className="relative w-full">
                {/* JSON 输入框 */}
                <input
                  type="text"
                  value={jsonInput}
                  onChange={(e) => handleJsonInputChange(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full h-7 bg-gray-900/50 border border-gray-600 rounded-lg px-2 pr-8 text-xs text-gray-300 font-mono placeholder-gray-500 focus:outline-none focus:border-blue-500 select-text"
                  placeholder='{"key": "value"} 或拖拽文件到这里'
                  // 拖拽处理
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
            // 其他节点：输入端口列表
            <div className="space-y-0.5">
              {/* 遍历所有输入（原始输入 + 动态输入） */}
              {[...module.inputs, ...(nodeData.config?.dynamicInputs || [])].map((input) => {
                // 获取输入值
                const inputValues = nodeData.inputValues || {};
                // 获取输入格式信息
                const inputFormats = nodeData.inputFormats || {};
                const displayValue = inputValues[input.id];
                const formatInfo = inputFormats[input.id];
                const hasValue = displayValue !== undefined && displayValue !== null;

                return (
                  // 输入行容器
                  <div key={input.id} className="flex items-center h-5 relative group">
                    {/* 输入端口句柄（左侧） */}
                    <Handle
                      type="target"          // 类型：目标（输入）
                      position={Position.Left}  // 位置：左侧
                      id={input.id}           // 端口 ID
                      className="w-2.5 h-2.5 bg-green-500 border border-white rounded-full absolute"
                      style={{ left: -5, top: '50%', transform: 'translateY(-50%)' }}
                    />

                    {/* 输入内容区域 */}
                    <div className="ml-4 flex items-center cursor-grab active:cursor-grabbing nodrag">
                      {/* 【关键】格式预览显示 */}
                      {formatInfo ? (
                        <span
                          className="text-[10px] text-purple-400 mr-1 px-1 bg-purple-500/20 rounded"
                          title={`来自: ${formatInfo.sourcePortId}\n类型: ${formatInfo.type}`}
                        >
                          {/* 根据类型显示不同标识 */}
                          {formatInfo.type === 'object' ? '{...}' : formatInfo.type === 'array' ? '[...]' : formatInfo.type}
                        </span>
                      ) : null}

                      {/* 动态值显示（如果有值） */}
                      {hasValue ? (
                        <值预览弹出框 value={displayValue} position="bottom">
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
                        </值预览弹出框>
                      ) : (
                        // 没有值时显示类型
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

              {/* 没有输入时显示提示 */}
              {module.inputs.length === 0 && (nodeData.config?.dynamicInputs?.length || 0) === 0 && (
                <div className="h-5 text-[10px] text-gray-500 italic">无输入</div>
              )}
            </div>
          )}
        </div>

        {/* ==================== 输出区 ==================== */}
        <div className="flex-1 p-2">
          {/* 标题："输出区"文字 + 橙色圆点 */}
          <div className="flex items-center justify-end mb-1">
            <span className="text-[10px] text-gray-400 mr-1">输出区</span>
            <div className="w-2 h-2 rounded-full bg-orange-500" />
          </div>

          {/* 输出端口列表 */}
          <div className="space-y-0.5">
            {/* 遍历所有输出（原始输出 + 动态输出） */}
            {[...module.outputs, ...(nodeData.config?.dynamicOutputs || [])].map((output) => {
              // 构建端口键名
              const portKey = `${nodeData.instanceId}:${output.id}`;
              // 获取端口值
              const portValue = nodePortValues[portKey];
              const displayValue = portValue?.value;
              const hasValue = displayValue !== undefined && displayValue !== null;

              return (
                // 输出行容器
                <div key={output.id} className="flex items-center justify-end h-5 relative group">
                  {/* 输出内容区域 */}
                  <div className="mr-4 flex items-center cursor-grab active:cursor-grabbing nodrag">
                    {/* 动态值显示（如果有值） */}
                    {hasValue ? (
                      <值预览弹出框 value={displayValue} position="bottom">
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
                      </值预览弹出框>
                    ) : (
                      // 没有值时显示类型
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

                  {/* 输出端口句柄（右侧） */}
                  <Handle
                    type="source"           // 类型：源（输出）
                    position={Position.Right}  // 位置：右侧
                    id={output.id}          // 端口 ID
                    className="w-2.5 h-2.5 bg-orange-500 border border-white rounded-full absolute"
                    style={{ right: -5, top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              );
            })}

            {/* 没有输出时显示提示 */}
            {module.outputs.length === 0 && (
              <div className="h-5 text-[10px] text-gray-500 italic text-right">无输出</div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== 代码区 [可折叠] ==================== */}
      <div
        className="flex-1 border-t border-gray-600 cursor-text nodrag overflow-hidden flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* 代码区标题栏 */}
        <div className="flex items-center justify-between px-2 py-1 bg-gray-750 border-b border-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">计算逻辑</span>

            {/* 编辑模式切换（仅计算类模块显示） */}
            {module.category === 'calculation' && (
              <div className="flex items-center space-x-1 bg-gray-700 rounded p-0.5">
                {/* 公式模式按钮 */}
                <button
                  onClick={() => setEditorMode('formula')}
                  className={`px-2 py-0.5 text-xs rounded transition-colors flex items-center space-x-1 ${editorMode === 'formula' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <Calculator className="w-3 h-3" />
                  <span>公式</span>
                </button>
                {/* 代码模式按钮 */}
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

          {/* 折叠按钮 */}
          <button
            onClick={() => setIsCodeCollapsed(!isCodeCollapsed)}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {isCodeCollapsed ? '▼' : '▲'}
          </button>
        </div>

        {/* 代码编辑器内容（未折叠时显示） */}
        {!isCodeCollapsed && (
          <div className="flex-1 p-2 nodrag overflow-hidden">
            {渲染编辑器内容(module, nodeData, editorMode, formulaConfig, updateNode)}
          </div>
        )}
      </div>

      {/* ==================== 底部描述区 ==================== */}
      <div
        className="p-2 border-t border-gray-600 cursor-text nodrag"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="text-xs text-gray-400 leading-relaxed">
          {module.description}
        </div>
      </div>

      {/* ==================== 底部调整大小区域 ==================== */}
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
      <调整大小手柄 onMouseDown={handleResizeStart} />
    </div>
  );
});

// 设置组件显示名称（用于调试）
自定义节点.displayName = '自定义节点';
