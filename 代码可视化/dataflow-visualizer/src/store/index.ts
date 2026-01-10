/**
 * ============================================================================
 * 文件名：状态管理.ts
 * 功能描述：使用 Zustand 状态管理库管理整个应用的全局状态
 *
 * 本文件是整个应用的核心状态管理模块，负责管理：
 * 1. 项目数据（节点、连线、全局变量）
 * 2. 模块定义（内置模块和用户自定义模块）
 * 3. 执行状态（节点执行结果、端口值、错误状态）
 * 4. UI 状态（选中节点、缩放级别、侧边栏状态）
 * 5. 操作历史（撤销/重做功能）
 *
 * 核心概念：
 * - Store：全局唯一的状态容器
 * - State：存储的数据（不可直接修改）
 * - Actions：修改状态的方法（只能通过 Actions 修改 State）
 * - Middleware：中间件（devtools 用于开发工具集成）
 * - Immer：简化不可变状态更新
 * ============================================================================
 */

// 从 Zustand 库导入 create 函数，用于创建状态管理 Store
// Zustand 是一个轻量级的 React 状态管理库
import { create } from 'zustand';

// 从 Zustand 库导入 devtools 中间件，用于集成 Redux DevTools
// 可以在浏览器开发者工具中查看状态变化
import { devtools } from 'zustand/middleware';

// 从 Immer 库导入 produce 函数，用于简化不可变状态更新
// 使用 Immer 可以用直接赋值的方式修改深层嵌套对象
import { produce } from 'immer';

// 从类型定义文件导入项目、模块、节点、连线和全局变量类型
// 这些类型定义了数据结构的标准格式
import type {
  Project,           // 项目类型，包含节点、连线、模块等
  ModuleDefinition,  // 模块定义类型，包含输入输出端口、代码等
  FlowNode,          // 流程节点类型
  FlowEdge,          // 流程连线类型
  GlobalVariable     // 全局变量类型
} from '../类型/索引';

// ============================================================================
// 优化：执行超时配置（3秒）
// ============================================================================
const EXECUTION_TIMEOUT_MS = 3000;

// ============================================================================
// 第一部分：类型定义
// ============================================================================

/**
 * 节点端口输出值类型
 *
 * 功能说明：
 * 用于存储节点每个输出端口的实时数值和元数据
 *
 * 存储结构示例：
 * {
 *   nodeId: 'node_123',      // 节点唯一标识符
 *   portId: 'price',         // 端口唯一标识符
 *   value: 199.99,           // 端口的实时值
 *   timestamp: 1704067200000 // 值更新时间戳（毫秒）
 * }
 *
 * 使用场景：
 * - 在 UI 上显示端口的实时值
 * - 追踪数据变化历史
 * - 格式预览显示
 */
export interface NodePortValue {
  // 节点唯一标识符，格式为 'node_时间戳_随机字符串'
  nodeId: string;

  // 端口唯一标识符，对应模块定义中的输入/输出端口 ID
  portId: string;

  // 端口的实时值，可以是任意类型（数字、字符串、对象、数组等）
  value: any;

  // 值更新时间戳，用于判断数据是否过期或显示更新顺序
  timestamp: number;
}

/**
 * 输入格式信息类型
 *
 * 功能说明：
 * 用于存储上游节点的输出格式信息，供下游节点使用
 *
 * 作用：
 * - 传递上游输出的类型信息（number、string、object、array 等）
 * - 记录上游节点和端口的来源
 * - 在 UI 上显示格式预览
 *
 * 使用场景：
 * - 连线后自动传递格式信息
 * - 在输入端口旁边显示紫色格式指示器
 * - 悬停显示来源信息（来自哪个节点/端口）
 */
interface InputFormatInfo {
  // 值类型：'number' | 'string' | 'boolean' | 'object' | 'array' | 'null'
  type: string;

  // 值的详细结构信息（对象字段、数组元素等）
  // 例如：{ type: 'object', fields: { name: { type: 'string' }, age: { type: 'number' } } }
  structure?: any;

  // 上游节点的唯一标识符
  // 用于追踪数据来源
  sourceNodeId: string;

  // 上游端口的唯一标识符
  // 用于显示"来自：端口名"
  sourcePortId: string;
}

/**
 * 应用状态接口
 *
 * 功能说明：
 * 定义整个应用的所有状态数据
 *
 * 状态分类：
 * 1. 项目状态：currentProject（当前项目）
 * 2. 模块状态：modules（模块库）
 * 3. 执行状态：isExecuting、executionResults、nodePortValues
 * 4. UI 状态：selectedNodeId、selectedEdgeId、zoomLevel 等
 * 5. 历史状态：history、historyIndex（撤销/重做）
 * 6. 回调状态：onNodeDataChange（节点数据变更回调）
 */
interface AppState {
  /**
   * 当前项目数据
   *
   * 包含内容：
   * - nodes: 项目中的所有节点
   * - edges: 项目中的所有连线
   * - modules: 项目使用的模块
   * - globals: 全局变量
   * - createdAt/updatedAt: 创建/更新时间
   */
  currentProject: Project | null;

  /**
   * 模块库
   *
   * 包含所有可用的模块定义：
   * - 内置模块（数据输入、利润计算、数据输出等）
   * - 用户自定义模块
   *
   * 模块结构：
   * - id: 模块唯一标识
   * - name: 模块名称
   * - inputs/outputs: 输入/输出端口定义
   * - code: 默认执行代码
   * - category: 模块分类（input/processing/calculation/output）
   */
  modules: ModuleDefinition[];

  /**
   * 全局变量列表
   *
   * 功能：
   * 存储可在任意节点中使用的全局变量
   *
   * 示例：
   * [{ id: 'var_tax', name: 'tax', type: 'number', value: 0.13 }]
   */
  globalVariables: GlobalVariable[];

  /**
   * 是否正在执行
   *
   * 作用：
   * - 防止重复执行
   * - 显示执行状态 UI
   * - 控制执行流程
   */
  isExecuting: boolean;

  /**
   * 节点执行结果
   *
   * 存储结构：
   * {
   *   'node_123': {
   *     success: true,
   *     output: { price: 199.99, cost: 100 },
   *     outputFormat: { price: { type: 'number' }, cost: { type: 'number' } },
   *     executionTime: 15
   *   }
   * }
   *
   * 【关键】每次执行节点后，结果会存储在这里
   * 下游节点通过读取这里的数据来获取输入值
   */
  executionResults: Record<string, any>;

  /**
   * 节点端口输出值
   *
   * 存储结构（使用 portKey 作为键）：
   * {
   *   'node_123:price': { nodeId: 'node_123', portId: 'price', value: 199.99, timestamp: 1234567890 }
   * }
   *
   * 用途：
   * - UI 显示端口实时值
   * - 格式预览显示
   * - 数据变化追踪
   */
  nodePortValues: Record<string, NodePortValue>;

  // =========================================================================
  // UI 状态
  // =========================================================================

  /**
   * 当前选中的节点 ID
   *
   * 用途：
   * - 高亮显示选中的节点
   - 在属性面板中显示节点详情
   * - 复制/粘贴/删除操作的目标
   */
  selectedNodeId: string | null;

  /**
   * 当前选中的连线 ID
   *
   * 用途：
   * - 高亮显示选中的连线
   * - 显示连线属性
   * - 删除连线操作的目标
   */
  selectedEdgeId: string | null;

  /**
   * 侧边栏是否展开
   *
   * true: 展开（显示模块列表）
   * false: 收起（隐藏模块列表）
   */
  sidebarOpen: boolean;

  /**
   * 当前活动标签页
   *
   * 可选值：
   * - 'modules': 模块库标签页
   * - 'templates': 模板标签页
   * - 'settings': 设置标签页
   */
  activeTab: 'modules' | 'templates' | 'settings';

  /**
   * 画布缩放级别
   *
   * 范围：
   * - 0.1: 最小缩放（10%）
   * - 1: 默认缩放（100%）
   * - 2: 最大缩放（200%）
   *
   * 用途：
   * - 响应缩放事件
   * - 调整节点大小计算
   */
  zoomLevel: number;

  // =========================================================================
  // 历史管理（撤销/重做）
  // =========================================================================

  /**
   * 操作历史记录
   *
   * 存储结构：
   * [project_1, project_2, project_3, ...]
   *
   * 每个元素是一个完整的项目快照
   * 用于撤销/重做操作
   */
  history: Project[];

  /**
   * 当前历史记录索引
   *
   * -1: 初始状态，无历史记录
   * 0: 指向 history[0]（最早的记录）
   * history.length - 1: 指向最新的记录
   */
  historyIndex: number;

  /**
   * 最大历史记录数量
   *
   * 作用：
   * 限制历史记录的最大条数，防止内存占用过多
   * 超出后会删除最早的记录
   */
  maxHistorySize: number;

  /**
   * React Flow 节点数据变更回调
   *
   * 功能：
   * 当节点数据变化时，通知 React Flow 更新 UI
   *
   * 参数：
   * - nodeId: 变化的节点 ID
   * - data: 变化后的节点数据
   */
  onNodeDataChange: ((nodeId: string, data: any) => void) | null;

  // =========================================================================
  // 优化：n8n 风格数据流状态
  // =========================================================================

  /**
   * 连线上的数据流状态（仿 n8n 连线上显示数据计数）
   *
   * 功能：
   * - 显示数据流动状态
   * - 显示数据条数（如 "5 items"）
   * - 显示错误状态（连线变红）
   */
  edgeStatus: Record<string, {
    isAnimating: boolean;   // 是否有数据正在流动
    label?: string;         // 例如 "5 items" 或 "1.2kb"
    error?: boolean;        // 连线变红
  }>;

  /**
   * 是否处于预览模式
   *
   * true: 执行单个节点，不级联执行下游（n8n "Test Step" 模式）
   * false: 正常执行，级联执行所有下游节点
   */
  isPreviewMode: boolean;
}

/**
 * 应用操作方法接口
 *
 * 功能说明：
 * 定义所有可以修改状态的方法
 *
 * 分类：
 * 1. 项目管理：createProject、loadProject、saveProject
 * 2. 模块管理：registerModule、updateModule、deleteModule
 * 3. 节点管理：addNode、updateNode、deleteNode
 * 4. 连线管理：addEdge、updateEdge、deleteEdge
 * 5. 变量管理：addGlobalVariable、updateGlobalVariable、deleteGlobalVariable
 * 6. 执行控制：executeFlow、stopExecution、executeSingleNode、executeUpstreamChain
 * 7. UI 控制：setSelectedNode、setSelectedEdge、toggleSidebar、setActiveTab、setZoomLevel
 * 8. 历史管理：pushToHistory、undo、redo
 * 9. 端口管理：updateNodePortValue、clearNodePortValues
 */
interface AppActions {
  // =========================================================================
  // 项目管理
  // =========================================================================

  /**
   * 创建新项目
   *
   * @param name - 项目名称
   * @param description - 项目描述（可选）
   *
   * 操作步骤：
   * 1. 创建项目对象，生成唯一 ID
   * 2. 设置项目名称和描述
   * 3. 初始化空节点和连线数组
   * 4. 设置当前项目
   * 5. 推入历史记录
   */
  createProject: (name: string, description?: string) => void;

  /**
   * 加载项目
   *
   * @param project - 要加载的项目数据
   *
   * 操作步骤：
   * 1. 设置当前项目
   * 2. 将项目 globals 转换为全局变量数组
   */
  loadProject: (project: Project) => void;

  /**
   * 保存项目
   *
   * 功能：
   * 更新时间戳，记录最后修改时间
   *
   * 注意：
   * 实际保存需要配合后端或本地存储
   */
  saveProject: () => void;

  /**
   * 设置节点数据变更回调
   *
   * @param callback - 回调函数，节点数据变化时调用
   *
   * 用途：
   * 通知 React Flow 更新节点显示
   */
  setOnNodeDataChange: (callback: ((nodeId: string, data: any) => void) | null) => void;

  // =========================================================================
  // 模块管理
  // =========================================================================

  /**
   * 注册模块
   *
   * @param module - 要注册的模块定义
   *
   * 操作：
   * 如果模块已存在则替换，否则添加
   */
  registerModule: (module: ModuleDefinition) => void;

  /**
   * 更新模块
   *
   * @param moduleId - 要更新的模块 ID
   * @param updates - 更新内容
   *
   * 注意：
   * 如果更新了代码，会同步更新所有使用该模块的节点
   */
  updateModule: (moduleId: string, updates: Partial<ModuleDefinition>) => void;

  /**
   * 删除模块
   *
   * @param moduleId - 要删除的模块 ID
   *
   * 注意：
   * 不会删除使用该模块的节点（节点会显示"模块未找到"）
   */
  deleteModule: (moduleId: string) => void;

  // =========================================================================
  // 节点管理
  // =========================================================================

  /**
   * 添加节点
   *
   * @param node - 要添加的节点对象
   *
   * 操作：
   * 将节点添加到当前项目的节点列表
   */
  addNode: (node: FlowNode) => void;

  /**
   * 更新节点
   *
   * @param nodeId - 要更新的节点 ID
   * @param updates - 更新内容（可以是部分属性）
   *
   * 注意：
   * updates 是部分更新，会与现有数据合并
   */
  updateNode: (nodeId: string, updates: Partial<FlowNode>) => void;

  /**
   * 删除节点
   *
   * @param nodeId - 要删除的节点 ID
   *
   * 操作步骤：
   * 1. 从节点列表中移除该节点
   * 2. 移除所有与该节点相关的连线
   * 3. 清理相关的执行结果
   */
  deleteNode: (nodeId: string) => void;

  // =========================================================================
  // 连线管理
  // =========================================================================

  /**
   * 添加连线
   *
   * @param edge - 要添加的连线对象
   *
   * 【关键】连线后会自动触发数据传播：
   * 1. 先执行上游节点（确保有输出数据）
   * 2. 再执行下游节点（使用上游结果）
   *
   * 这是实现"连线即赋值"的核心函数
   */
  addEdge: (edge: FlowEdge) => void;

  /**
   * 更新连线
   *
   * @param edgeId - 要更新的连线 ID
   * @param updates - 更新内容
   */
  updateEdge: (edgeId: string, updates: Partial<FlowEdge>) => void;

  /**
   * 删除连线
   *
   * @param edgeId - 要删除的连线 ID
   *
   * 注意：
   * 删除连线不会触发下游节点重新执行
   * 下游节点在下次执行时会读取空值
   */
  deleteEdge: (edgeId: string) => void;

  // =========================================================================
  // 全局变量管理
  // =========================================================================

  /**
   * 添加全局变量
   *
   * @param variable - 要添加的变量对象
   */
  addGlobalVariable: (variable: GlobalVariable) => void;

  /**
   * 更新全局变量
   *
   * @param variableId - 要更新的变量 ID
   * @param updates - 更新内容
   */
  updateGlobalVariable: (variableId: string, updates: Partial<GlobalVariable>) => void;

  /**
   * 删除全局变量
   *
   * @param variableId - 要删除的变量 ID
   */
  deleteGlobalVariable: (variableId: string) => void;

  // =========================================================================
  // 执行控制
  // =========================================================================

  /**
   * 执行整个流程
   *
   * 功能：
   * 按照拓扑排序执行所有节点
   *
   * 执行步骤：
   * 1. 清空旧的执行结果和端口值
   * 2. 构建执行顺序（拓扑排序）
   * 3. 逐个执行节点
   * 4. 更新执行结果和端口值
   * 5. 设置执行状态
   */
  executeFlow: () => Promise<void>;

  /**
   * 停止执行
   *
   * 功能：
   * 设置 isExecuting 为 false，停止正在执行的流程
   */
  stopExecution: () => void;

  /**
   * 执行单个节点
   *
   * @param nodeId - 要执行的节点 ID
   *
   * 功能：
   * 执行指定节点及其所有下游节点
   *
   * 【关键】特点：
   * - 从全局 state 获取上游结果（不是局部变量）
   * - 每次循环从最新的 state 获取 executionResults
   * - 立即更新全局 state，供下游节点使用
   * - 自动传递格式信息（inputFormats）
   *
   * 使用场景：
   * - 输入节点数据变化时
   * - 连线后触发数据传播
   * - 手动执行某个节点
   */
  executeSingleNode: (nodeId: string) => Promise<void>;

  /**
   * 执行上游到下游的数据传递链
   *
   * @param sourceNodeId - 上游节点 ID
   * @param targetNodeId - 下游节点 ID
   *
   * 【关键】这是连线后触发数据传播的核心函数
   *
   * 执行步骤：
   * 1. 优化版：检查上游缓存，有缓存则跳过上游执行
   * 2. 执行下游节点（使用上游的缓存数据或实时数据）
   *
   * 调用时机：
   * - 在 addEdge 函数中调用
   * - 用户创建新连线时自动触发
   */
  executeUpstreamChain: (sourceNodeId: string, targetNodeId: string) => Promise<void>;

  // =========================================================================
  // 优化：n8n 风格执行模式
  // =========================================================================

  /**
   * 仅执行当前节点（n8n 的 "Test Step"）
   *
   * 功能：
   * - 只运行当前选中的节点
   * - 不触发下游级联执行
   * - 用于快速测试单个节点逻辑
   *
   * 使用场景：
   * - 调试某个节点的输出
   * - 不想影响下游节点时
   */
  executeNodeOnly: (nodeId: string) => Promise<void>;

  /**
   * 级联执行（从指定节点开始执行整个流程）
   *
   * 功能：
   * - 从指定节点开始，执行所有下游节点
   * - 类似于 n8n 的 "Run from here"
   *
   * 使用场景：
   * - 修改上游节点后，需要更新所有下游
   */
  executeCascade: (nodeId: string) => Promise<void>;

  // =========================================================================
  // 优化：Pin Data 功能
  // =========================================================================

  /**
   * 固定节点数据（模拟数据）
   *
   * @param nodeId - 节点 ID
   * @param data - 要固定的数据
   *
   * 功能：
   * - 将指定数据"固定"到节点
   * - 后续执行时直接使用固定数据，跳过实际上游执行
   * - 用于测试、模拟数据场景
   *
   * 使用场景：
   * - 上游是 API 请求，固定数据避免重复请求
   * - 模拟各种输入情况测试下游逻辑
   */
  pinNodeData: (nodeId: string, data: any) => void;

  /**
   * 取消固定节点数据
   *
   * @param nodeId - 节点 ID
   *
   * 功能：
   * - 取消之前的固定数据
   * - 后续执行恢复从上游获取数据
   */
  unpinNodeData: (nodeId: string) => void;

  /**
   * 更新连线状态
   *
   * @param edgeId - 连线 ID
   * @param status - 状态对象
   *
   * 功能：
   * - 更新连线的显示状态
   * - 用于显示数据流动动画、数据条数等
   */
  updateEdgeStatus: (edgeId: string, status: { isAnimating?: boolean; label?: string; error?: boolean }) => void;

  // =========================================================================
  // UI 控制
  // =========================================================================

  /**
   * 设置选中的节点
   *
   * @param nodeId - 节点 ID（null 表示取消选择）
   */
  setSelectedNode: (nodeId: string | null) => void;

  /**
   * 设置选中的连线
   *
   * @param edgeId - 连线 ID（null 表示取消选择）
   */
  setSelectedEdge: (edgeId: string | null) => void;

  /**
   * 切换侧边栏展开/收起
   */
  toggleSidebar: () => void;

  /**
   * 设置活动标签页
   *
   * @param tab - 标签页名称
   */
  setActiveTab: (tab: 'modules' | 'templates' | 'settings') => void;

  /**
   * 设置缩放级别
   *
   * @param level - 缩放级别（0.1 - 2）
   */
  setZoomLevel: (level: number) => void;

  /**
   * 更新节点端口值
   *
   * @param nodeId - 节点 ID
   * @param portId - 端口 ID
   * @param value - 要设置的值
   *
   * 操作：
   * 1. 构建端口键名（格式：'nodeId:portId'）
   * 2. 更新 nodePortValues 中对应键的值
   * 3. 设置当前时间戳
   */
  updateNodePortValue: (nodeId: string, portId: string, value: any) => void;

  /**
   * 清理节点的端口值
   *
   * @param nodeId - 节点 ID
   *
   * 功能：
   * 删除指定节点的所有端口值
   *
   * 使用场景：
   * - 删除节点时清理相关数据
   - 重置节点状态时
   */
  clearNodePortValues: (nodeId: string) => void;

  // =========================================================================
  // 历史管理（撤销/重做）
  // =========================================================================

  /**
   * 推入历史记录
   *
   * 功能：
   * 将当前项目状态保存到历史记录
   *
   * 操作步骤：
   * 1. 截取当前历史到当前位置
   * 2. 添加当前项目快照（深拷贝）
   * 3. 如果超出最大数量，删除最早的记录
   * 4. 更新历史索引
   *
   * 调用时机：
   * - 添加节点后
   * - 添加连线后
   * - 修改节点后
   */
  pushToHistory: () => void;

  /**
   * 撤销
   *
   * 功能：
   * 恢复到上一个历史状态
   *
   * 前提条件：
   * - historyIndex > 0
   */
  undo: () => void;

  /**
   * 重做
   *
   * 功能：
   * 恢复到下一个历史状态
   *
   * 前提条件：
   * - historyIndex < history.length - 1
   */
  redo: () => void;
}

// ============================================================================
// 第二部分：创建 Store
// ============================================================================

/**
 * 创建应用状态管理 Store
 *
 * 使用方法：
 * const { currentProject, addNode, executeFlow } = useAppStore();
 *
 * devtools 参数：
 * - name: Store 名称，用于 Redux DevTools 显示
 *
 * 返回值：
 * 包含状态和方法的 Hook
 */
export const useAppStore = create<AppState & AppActions>()(
  // devtools 中间件包装，提供开发工具支持
  devtools(
    // set: 用于更新状态的方法
    // get: 用于获取当前状态的方法
    (set, get) => ({
      // =========================================================================
      // 初始状态
      // =========================================================================

      // 当前项目，初始为 null
      currentProject: null,

      // 模块库，初始为空数组
      modules: [],

      // 全局变量，初始为空数组
      globalVariables: [],

      // 是否正在执行，初始为 false
      isExecuting: false,

      // 节点执行结果，初始为空对象
      executionResults: {},

      // 节点端口输出值，初始为空对象
      nodePortValues: {},

      // 选中的节点，初始为 null
      selectedNodeId: null,

      // 选中的连线，初始为 null
      selectedEdgeId: null,

      // 侧边栏是否展开，初始为 true（展开）
      sidebarOpen: true,

      // 当前活动标签页，初始为 'modules'
      activeTab: 'modules' as const,

      // 画布缩放级别，初始为 1（100%）
      zoomLevel: 1,

      // 操作历史记录，初始为空数组
      history: [],

      // 历史记录索引，初始为 -1（无历史）
      historyIndex: -1,

      // 最大历史记录数量，初始为 50 条
      maxHistorySize: 50,

      // 节点数据变更回调，初始为 null
      onNodeDataChange: null,

      // =========================================================================
      // 优化：n8n 风格数据流状态初始值
      // =========================================================================

      // 连线状态，初始为空对象
      edgeStatus: {},

      // 是否处于预览模式，初始为 false
      isPreviewMode: false,

      // =========================================================================
      // 方法实现
      // =========================================================================

      // ===================== UI 控制方法 =====================

      /**
       * 设置画布缩放级别
       *
       * @param level - 缩放级别
       */
      setZoomLevel: (level: number) => {
        // 直接更新 zoomLevel 状态
        set({ zoomLevel: level });
      },

      /**
       * 设置节点数据变更回调
       *
       * @param callback - 回调函数
       */
      setOnNodeDataChange: (callback) => {
        // 直接更新 onNodeDataChange 状态
        set({ onNodeDataChange: callback });
      },

      /**
       * 更新节点端口值
       *
       * @param nodeId - 节点 ID
       * @param portId - 端口 ID
       * @param value - 要设置的值
       */
      updateNodePortValue: (nodeId: string, portId: string, value: any) => {
        // 构建端口键名，格式为 'nodeId:portId'
        // 例如：'node_123:price' 表示节点 node_123 的 price 端口
        const key = `${nodeId}:${portId}`;

        // 更新 nodePortValues
        // 使用函数式更新，保持不可变性
        set(state => ({
          // 展开现有状态中的 nodePortValues
          nodePortValues: {
            ...state.nodePortValues,
            // 更新或添加指定键的值
            [key]: {
              nodeId,      // 节点 ID
              portId,      // 端口 ID
              value,       // 值
              timestamp: Date.now(), // 当前时间戳
            },
          },
        }));
      },

      /**
       * 清理节点的端口值
       *
       * @param nodeId - 节点 ID
       */
      clearNodePortValues: (nodeId: string) => {
        // 使用函数式更新
        set(state => {
          // 复制现有的端口值对象
          const newValues = { ...state.nodePortValues };

          // 遍历所有键，删除以 'nodeId:' 开头的键
          Object.keys(newValues).forEach(key => {
            // 检查键是否以指定节点 ID 开头
            if (key.startsWith(`${nodeId}:`)) {
              // 从对象中删除该键
              delete newValues[key];
            }
          });

          // 返回更新后的状态
          return { nodePortValues: newValues };
        });
      },

      // ===================== 执行单个节点 =====================

      /**
       * 执行单个节点（优化版：批量状态更新 + Immer）
       *
       * @param nodeId - 要执行的节点 ID
       *
       * 【核心功能】
       * 1. 找到指定节点及其所有下游节点
       * 2. 按照拓扑排序执行每个节点
       * 3. 使用批量更新 + Immer 减少渲染次数和简化代码
       *
       * 【优化】批量更新机制：
       * - 在循环中使用 Immer produce 收集所有状态变更
       * - 立即更新执行结果，供下游节点读取
       * - 使用 Immer 简化深层嵌套更新，避免手动展开
       */
      executeSingleNode: async (nodeId: string) => {
        // 获取当前状态
        const state = get();

        // 如果没有当前项目或正在执行，直接返回
        if (!state.currentProject || state.isExecuting) return;

        // 从当前项目中解构节点、连线和模块
        const { nodes, edges, modules } = state.currentProject;

        // 查找指定节点
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        // 找到所有依赖该节点的下游节点
        const dependentNodes = new Set<string>();
        const findDependents = (nid: string) => {
          edges.forEach(edge => {
            if (edge.source === nid && !dependentNodes.has(edge.target)) {
              dependentNodes.add(edge.target);
              findDependents(edge.target);
            }
          });
        };
        findDependents(nodeId);

        // 检查是否为预览模式（不级联执行下游）
        const isPreview = state.isPreviewMode;

        // 构建执行顺序（拓扑排序）
        const executionOrder = buildExecutionOrder(nodes, edges);

        // 过滤出与指定节点相关的执行顺序
        const relevantOrder = isPreview
          ? [nodeId]
          : executionOrder.filter(id => id === nodeId || dependentNodes.has(id));

        // 遍历执行顺序中的每个节点
        for (const nid of relevantOrder) {
          // 每次循环从最新的 state 获取 executionResults
          const currentState = get();
          const currentResults = currentState.executionResults;

          // 在节点列表中查找当前节点
          const n = nodes.find(x => x.id === nid);
          if (!n) continue;

          // 计算当前节点的输入值
          const nodeInputs = getNodeInputs(nid, currentResults, edges, modules);

          // 构建 running 状态的节点数据
          const runningNodeData: FlowNode['data'] = {
            ...n.data,
            status: 'running',
            inputValues: { ...nodeInputs },
          };

          // 【优化】检查是否有 Pin 住的固定数据
          let result;
          if (n.data.pinnedData !== undefined) {
            console.log(`[Pin Data] 节点 ${nid} 使用固定数据，跳过执行`);
            result = {
              success: true,
              output: n.data.pinnedData,
              outputFormat: getValueStructure(n.data.pinnedData),
              executionTime: 0,
            };
          } else {
            // 正常执行节点
            result = await executeNode(
              n,
              currentResults,
              state.globalVariables,
              edges,
              modules
            );
          }

          // 找到节点对应的模块定义
          const module = modules.find(m => m.id === n.data.moduleId);

          // 构建输入格式信息
          const inputFormats: Record<string, { type: string; structure: any; sourceNodeId: string; sourcePortId: string }> = {};
          const incomingEdges = edges.filter(edge => edge.target === nid);
          incomingEdges.forEach(edge => {
            const sourceResult = currentState.executionResults[edge.source];
            if (sourceResult && sourceResult.success && sourceResult.outputFormat) {
              const sourcePortId = edge.sourceHandle || 'default';
              const format = sourceResult.outputFormat[sourcePortId];
              if (format && edge.targetHandle) {
                inputFormats[edge.targetHandle] = {
                  ...format,
                  sourceNodeId: edge.source,
                  sourcePortId,
                };
              }
            }
          });

          // 构建最终的节点数据
          const finalNodeData: FlowNode['data'] = {
            ...runningNodeData,
            status: result.success ? 'success' : 'error',
            preview: result.success ? result.output : undefined,
            inputValues: { ...nodeInputs },
            inputFormats,
          };

          // 【优化】使用 Immer produce 进行深层状态更新
          set(produce((s: AppState) => {
            // 更新执行结果
            s.executionResults[nid] = result;

            // 更新端口值
            if (result.success && result.output && module) {
              module.outputs.forEach(output => {
                const key = `${nid}:${output.id}`;
                s.nodePortValues[key] = {
                  nodeId: nid,
                  portId: output.id,
                  value: result.output[output.id],
                  format: result.outputFormat[output.id],
                  timestamp: Date.now(),
                };
              });
            }

            // 更新节点数据
            if (s.currentProject) {
              const nodeIndex = s.currentProject.nodes.findIndex(x => x.id === nid);
              if (nodeIndex !== -1) {
                s.currentProject.nodes[nodeIndex] = {
                  ...s.currentProject.nodes[nodeIndex],
                  data: finalNodeData,
                };
              }
            }
          }));

          // 触发 UI 回调
          const callback = get().onNodeDataChange;
          if (callback) {
            const updatedNode = get().currentProject?.nodes.find(x => x.id === nid);
            if (updatedNode) {
              callback(nid, updatedNode.data);
            }
          }
        }
      },

      /**
       * 执行上游到下游的数据传递链（优化版：懒执行 + 缓存）
       *
       * @param sourceNodeId - 上游节点 ID
       * @param targetNodeId - 下游节点 ID
       *
       * 【核心功能】仿 n8n 优化：
       * 1. 检查上游缓存：如有有效缓存，跳过上游执行
       * 2. 执行下游节点：使用上游的缓存数据或实时数据
       *
       * 【优化效果】
       * - 避免不必要的上游重算
       * - 连线更快，响应更及时
       */
      executeUpstreamChain: async (sourceNodeId: string, targetNodeId: string) => {
        // 获取当前状态
        const state = get();

        // 如果没有当前项目或正在执行，直接返回
        if (!state.currentProject || state.isExecuting) return;

        // 从当前项目中解构
        const { nodes, edges, modules } = state.currentProject;

        // 【优化】检查上游是否已有有效缓存
        const sourceResult = state.executionResults[sourceNodeId];
        const hasValidCache = sourceResult &&
          sourceResult.success &&
          sourceResult.output !== undefined;

        // 【优化】只有没有缓存时才执行上游
        if (!hasValidCache) {
          console.log(`[懒执行] 上游节点 ${sourceNodeId} 无缓存，执行上游...`);
          await get().executeSingleNode(sourceNodeId);
        } else {
          console.log(`[懒执行] 上游节点 ${sourceNodeId} 使用缓存，跳过上游执行`);
        }

        // 执行下游节点（无论上游是否有缓存，都需要执行下游以更新预览）
        await get().executeSingleNode(targetNodeId);
      },

      /**
       * 仅执行当前节点（n8n 的 "Test Step" 模式）
       *
       * 功能：
       * - 只运行当前选中的节点
       * - 不触发下游级联执行
       * - 使用预览模式标志位控制
       */
      executeNodeOnly: async (nodeId: string) => {
        const state = get();
        if (!state.currentProject || state.isExecuting) return;

        // 设置为预览模式（不级联执行下游）
        set({ isPreviewMode: true });

        try {
          await get().executeSingleNode(nodeId);
        } finally {
          // 恢复为正常模式
          set({ isPreviewMode: false });
        }
      },

      /**
       * 级联执行（从指定节点开始执行整个流程）
       *
       * 功能：
       * - 从指定节点开始，执行所有下游节点
       * - 不设置预览模式，正常级联执行
       */
      executeCascade: async (nodeId: string) => {
        const state = get();
        if (!state.currentProject || state.isExecuting) return;

        // 确保不是预览模式
        set({ isPreviewMode: false });

        await get().executeSingleNode(nodeId);
      },

      /**
       * 固定节点数据（模拟数据）
       */
      pinNodeData: (nodeId: string, data: any) => {
        // 更新节点数据，添加 pinnedData
        set(state => {
          if (!state.currentProject) return {};

          return {
            currentProject: {
              ...state.currentProject,
              nodes: state.currentProject.nodes.map(node =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, pinnedData: data } }
                  : node
              ),
            },
          };
        });
      },

      /**
       * 取消固定节点数据
       */
      unpinNodeData: (nodeId: string) => {
        // 更新节点数据，移除 pinnedData
        set(state => {
          if (!state.currentProject) return {};

          const node = state.currentProject.nodes.find(n => n.id === nodeId);
          if (!node) return {};

          const { pinnedData, ...restData } = node.data;

          return {
            currentProject: {
              ...state.currentProject,
              nodes: state.currentProject.nodes.map(n =>
                n.id === nodeId
                  ? { ...n, data: restData }
                  : n
              ),
            },
          };
        });
      },

      /**
       * 更新连线状态
       */
      updateEdgeStatus: (edgeId: string, status: { isAnimating?: boolean; label?: string; error?: boolean }) => {
        set(state => ({
          edgeStatus: {
            ...state.edgeStatus,
            [edgeId]: {
              ...state.edgeStatus[edgeId],
              ...status,
            },
          },
        }));
      },

      // ===================== 项目管理方法 =====================

      /**
       * 创建新项目
       *
       * @param name - 项目名称
       * @param description - 项目描述（可选）
       */
      createProject: (name: string, description?: string) => {
        // 创建项目对象
        const project: Project = {
          // 生成唯一项目 ID
          id: `project_${Date.now()}`,
          name,              // 项目名称
          description,       // 项目描述
          nodes: [],         // 空节点列表
          edges: [],         // 空连线列表
          modules: get().modules,  // 复制当前模块库
          globals: {},       // 空全局变量
          createdAt: new Date().toISOString(),  // 创建时间
          updatedAt: new Date().toISOString(),  // 更新时间
        };

        // 设置当前项目
        set({ currentProject: project });

        // 推入历史记录
        get().pushToHistory();
      },

      /**
       * 加载项目
       *
       * @param project - 要加载的项目数据
       */
      loadProject: (project: Project) => {
        // 设置当前项目
        set({
          currentProject: project,
          // 将项目的 globals 对象转换为全局变量数组
          globalVariables: Object.entries(project.globals).map(([name, value]) => ({
            id: `var_${name}`,     // 生成变量 ID
            name,                  // 变量名
            type: typeof value as any,  // 变量类型
            value,                 // 变量值
          })),
        });
      },

      /**
       * 保存项目
       *
       * 注意：
       * 实际保存需要配合后端或本地存储
       * 这里只是更新时间戳
       */
      saveProject: () => {
        const state = get();

        // 如果有当前项目
        if (state.currentProject) {
          // 创建更新后的项目对象
          const updatedProject = {
            ...state.currentProject,
            updatedAt: new Date().toISOString(),  // 更新时间戳
          };

          // 设置当前项目
          set({ currentProject: updatedProject });
        }
      },

      // ===================== 模块管理方法 =====================

      /**
       * 注册模块
       *
       * @param module - 要注册的模块定义
       */
      registerModule: (module: ModuleDefinition) => {
        // 更新模块列表
        set(state => ({
          // 过滤掉已存在的同名模块，然后添加新模块
          modules: [...state.modules.filter(m => m.id !== module.id), module],
        }));
      },

      /**
       * 更新模块
       *
       * @param moduleId - 要更新的模块 ID
       * @param updates - 更新内容
       */
      updateModule: (moduleId: string, updates: Partial<ModuleDefinition>) => {
        // 更新模块列表
        set(state => ({
          modules: state.modules.map(m =>
            // 找到模块，应用更新
            m.id === moduleId ? { ...m, ...updates } : m
          ),
        }));

        // 如果更新了代码，需要同步更新使用该模块的节点
        const state = get();
        if (state.currentProject && updates.code) {
          // 查找所有使用该模块的节点
          const updatedNodes = state.currentProject.nodes.map(node =>
            // 如果节点使用该模块，更新其配置
            node.data.moduleId === moduleId
              ? { ...node, data: { ...node.data, config: { ...node.data.config, ...updates } } }
              : node
          );

          // 更新项目中的节点
          set(state => ({
            currentProject: state.currentProject
              ? { ...state.currentProject, nodes: updatedNodes }
              : null
          }));
        }
      },

      /**
       * 删除模块
       *
       * @param moduleId - 要删除的模块 ID
       */
      deleteModule: (moduleId: string) => {
        // 从模块列表中移除
        set(state => ({
          modules: state.modules.filter(m => m.id !== moduleId),
        }));
      },

      // ===================== 节点管理方法 =====================

      /**
       * 添加节点
       *
       * @param node - 要添加的节点对象
       */
      addNode: (node: FlowNode) => {
        const state = get();

        // 如果有当前项目
        if (state.currentProject) {
          // 创建更新后的项目对象
          const updatedProject = {
            ...state.currentProject,
            nodes: [...state.currentProject.nodes, node],  // 添加新节点
          };

          // 设置当前项目
          set({ currentProject: updatedProject });
        }
      },

      /**
       * 更新节点
       *
       * @param nodeId - 要更新的节点 ID
       * @param updates - 更新内容
       */
      updateNode: (nodeId: string, updates: Partial<FlowNode>) => {
        const state = get();

        if (state.currentProject) {
          // 更新节点列表
          const updatedNodes = state.currentProject.nodes.map(node =>
            // 找到节点，应用更新
            node.id === nodeId ? { ...node, ...updates } : node
          );

          // 设置当前项目
          set({
            currentProject: {
              ...state.currentProject,
              nodes: updatedNodes,
            },
          });
        }
      },

      /**
       * 删除节点
       *
       * @param nodeId - 要删除的节点 ID
       */
      deleteNode: (nodeId: string) => {
        const state = get();

        if (state.currentProject) {
          // 过滤掉要删除的节点
          const updatedNodes = state.currentProject.nodes.filter(node => node.id !== nodeId);

          // 过滤掉与该节点相关的连线
          const updatedEdges = state.currentProject.edges.filter(
            edge => edge.source !== nodeId && edge.target !== nodeId
          );

          // 更新项目
          set({
            currentProject: {
              ...state.currentProject,
              nodes: updatedNodes,
              edges: updatedEdges,
            },
          });

          // 清理相关的执行结果
          const newResults = { ...state.executionResults };
          delete newResults[nodeId];  // 删除该节点的执行结果
          set({ executionResults: newResults });
        }
      },

      // ===================== 连线管理方法 =====================

      /**
       * 添加连线
       *
       * @param edge - 要添加的连线对象
       *
       * 【核心功能】
       * 1. 将连线添加到当前项目的连线列表
       * 2. 【关键】触发数据传播
       *
       * 【数据传播机制】
       * 调用 executeUpstreamChain：
       * 1. 先执行上游节点（确保有输出数据）
       * 2. 再执行下游节点（使用上游结果）
       *
       * 【结果】
       * - 下游节点的 inputValues 被更新
       * - 下游节点的 inputFormats 被更新
       * - UI 自动显示格式预览
       */
      addEdge: (edge: FlowEdge) => {
        const state = get();

        if (state.currentProject) {
          // 创建更新后的项目对象
          const updatedProject = {
            ...state.currentProject,
            edges: [...state.currentProject.edges, edge],  // 添加新连线
          };

          // 设置当前项目
          set({ currentProject: updatedProject });

          // 【关键】连线后触发数据传播
          // 调用 executeUpstreamChain 执行上游到下游的数据传递
          const { executeUpstreamChain } = get();
          executeUpstreamChain(edge.source, edge.target);
        }
      },

      /**
       * 更新连线
       *
       * @param edgeId - 要更新的连线 ID
       * @param updates - 更新内容
       */
      updateEdge: (edgeId: string, updates: Partial<FlowEdge>) => {
        const state = get();

        if (state.currentProject) {
          // 更新连线列表
          const updatedEdges = state.currentProject.edges.map(edge =>
            // 找到连线，应用更新
            edge.id === edgeId ? { ...edge, ...updates } : edge
          );

          // 更新项目
          set({
            currentProject: {
              ...state.currentProject,
              edges: updatedEdges,
            },
          });
        }
      },

      /**
       * 删除连线
       *
       * @param edgeId - 要删除的连线 ID
       *
       * 注意：
       * 删除连线不会触发下游节点重新执行
       * 下游节点在下次执行时会读取空值
       */
      deleteEdge: (edgeId: string) => {
        const state = get();

        if (state.currentProject) {
          // 过滤掉要删除的连线
          const updatedEdges = state.currentProject.edges.filter(edge => edge.id !== edgeId);

          // 更新项目
          set({
            currentProject: {
              ...state.currentProject,
              edges: updatedEdges,
            },
          });
        }
      },

      // ===================== 全局变量管理方法 =====================

      /**
       * 添加全局变量
       *
       * @param variable - 要添加的变量对象
       */
      addGlobalVariable: (variable: GlobalVariable) => {
        set(state => ({
          globalVariables: [...state.globalVariables, variable],
        }));
      },

      /**
       * 更新全局变量
       *
       * @param variableId - 要更新的变量 ID
       * @param updates - 更新内容
       */
      updateGlobalVariable: (variableId: string, updates: Partial<GlobalVariable>) => {
        set(state => ({
          globalVariables: state.globalVariables.map(v =>
            // 找到变量，应用更新
            v.id === variableId ? { ...v, ...updates } : v
          ),
        }));
      },

      /**
       * 删除全局变量
       *
       * @param variableId - 要删除的变量 ID
       */
      deleteGlobalVariable: (variableId: string) => {
        set(state => ({
          globalVariables: state.globalVariables.filter(v => v.id !== variableId),
        }));
      },

      // ===================== 执行控制方法 =====================

      /**
       * 执行整个流程
       *
       * 【核心功能】
       * 按照拓扑排序执行所有节点
       *
       * 执行步骤：
       * 1. 清空旧的执行结果和端口值
       * 2. 构建执行顺序（拓扑排序）
       * 3. 逐个执行节点
       * 4. 更新执行结果和端口值
       * 5. 设置执行状态
       */
      executeFlow: async () => {
        const state = get();

        // 如果没有当前项目或正在执行，直接返回
        if (!state.currentProject || state.isExecuting) return;

        // 清空旧的执行结果和端口值
        set({ isExecuting: true, executionResults: {}, nodePortValues: {} });

        try {
          // 从当前项目中解构
          const { nodes, edges, modules } = state.currentProject;

          // 构建执行顺序（拓扑排序）
          const executionOrder = buildExecutionOrder(nodes, edges);

          // 存储当前执行结果
          let currentExecutionResults: Record<string, any> = {};

          // 遍历执行顺序中的每个节点
          for (const nodeId of executionOrder) {
            // 在节点列表中查找当前节点
            const node = nodes.find(n => n.id === nodeId);

            // 节点不存在，跳过
            if (!node) continue;

            // 更新节点状态为 running
            set(state => ({
              currentProject: state.currentProject ? {
                ...state.currentProject,
                nodes: state.currentProject.nodes.map(n =>
                  n.id === nodeId
                    ? { ...n, data: { ...n.data, status: 'running' as const } }
                    : n
                ),
              } : null,
            }));

            // 执行节点
            const result = await executeNode(
              node,
              currentExecutionResults,
              state.globalVariables,
              edges,
              modules
            );

            // 更新执行结果
            currentExecutionResults = { ...currentExecutionResults, [nodeId]: result };

            // 确保 result 对象是新的引用（避免引用问题）
            const resultCopy = {
              ...result,
              output: result.output ? { ...result.output } : undefined,
            };

            // 找到节点对应的模块定义
            const module = modules.find(m => m.id === node.data.moduleId);

            // 复制现有的端口值对象
            const newPortValues = { ...get().nodePortValues };

            // 如果执行成功，且有输出值，且模块存在
            if (result.success && result.output && module) {
              // 遍历模块的所有输出端口
              module.outputs.forEach(output => {
                // 构建端口键名
                const key = `${nodeId}:${output.id}`;

                // 添加到端口值对象
                newPortValues[key] = {
                  nodeId,
                  portId: output.id,
                  value: result.output[output.id],
                  timestamp: Date.now(),
                };
              });
            }

            // 更新状态
            set(state => ({
              // 更新执行结果
              executionResults: {
                ...state.executionResults,
                [nodeId]: resultCopy,
              },
              // 更新端口值
              nodePortValues: newPortValues,
              // 更新节点
              currentProject: state.currentProject ? {
                ...state.currentProject,
                nodes: state.currentProject.nodes.map(n =>
                  n.id === nodeId
                    ? {
                        ...n,
                        data: {
                          ...n.data,
                          status: result.success ? 'success' : 'error',
                          preview: result.success ? result.output : undefined,
                        }
                      }
                    : n
                ),
              } : null,
            }));
          }
        } catch (error) {
          // 打印错误信息
          console.error('Execution failed:', error);
        } finally {
          // 设置执行状态为 false
          set({ isExecuting: false });
        }
      },

      /**
       * 停止执行
       */
      stopExecution: () => {
        set({ isExecuting: false });
      },

      // ===================== UI 控制方法 =====================

      /**
       * 设置选中的节点
       *
       * @param nodeId - 节点 ID（null 表示取消选择）
       */
      setSelectedNode: (nodeId: string | null) => {
        set({ selectedNodeId: nodeId });
      },

      /**
       * 设置选中的连线
       *
       * @param edgeId - 连线 ID（null 表示取消选择）
       */
      setSelectedEdge: (edgeId: string | null) => {
        set({ selectedEdgeId: edgeId });
      },

      /**
       * 切换侧边栏展开/收起
       */
      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }));
      },

      /**
       * 设置活动标签页
       *
       * @param tab - 标签页名称
       */
      setActiveTab: (tab: 'modules' | 'templates' | 'settings') => {
        set({ activeTab: tab });
      },

      // ===================== 历史管理方法（撤销/重做） =====================

      /**
       * 推入历史记录（优化版：排除运行时数据）
       *
       * 【核心功能】
       * 将当前项目状态保存到历史记录
       *
       * 【优化】排除运行时数据：
       * - status: 节点运行状态（running/success/error）
       * - preview: 节点执行预览数据
       * - inputValues: 节点输入值
       * - inputFormats: 输入格式信息
       * - pinnedData: Pin 住的固定数据
       *
       * 只保存结构相关数据：
       * - 节点位置和尺寸
       * - 节点标题和配置
       * - 模块 ID 和代码
       * - 连线关系
       *
       * 操作步骤：
       * 1. 截取当前历史到当前位置（丢弃重做部分）
       * 2. 深拷贝并清理运行时数据
       * 3. 添加到历史末尾
       * 4. 如果超出最大数量，删除最早的记录
       * 5. 更新历史索引指向最新记录
       */
      pushToHistory: () => {
        const state = get();

        // 如果没有当前项目，直接返回
        if (!state.currentProject) return;

        // 1. 截取当前历史到当前位置
        const newHistory = state.history.slice(0, state.historyIndex + 1);

        // 【优化】深拷贝并清理运行时数据
        const projectCopy = JSON.parse(JSON.stringify(state.currentProject));
        const cleanedProject = cleanRuntimeData(projectCopy);

        newHistory.push(cleanedProject);

        // 3. 如果超出最大数量，删除最早的记录
        if (newHistory.length > state.maxHistorySize) {
          // 删除数组第一个元素
          newHistory.shift();
        }

        // 4. 更新历史状态
        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,  // 指向最新记录
        });
      },

      /**
       * 撤销
       *
       * 【核心功能】
       * 恢复到上一个历史状态
       *
       * 【优化】恢复时也清理运行时数据
       * 确保恢复的项目不包含旧的执行状态
       *
       * 前提条件：
       * - historyIndex > 0（有更早的历史记录）
       */
      undo: () => {
        const state = get();

        // 如果可以撤销（历史索引 > 0）
        if (state.historyIndex > 0) {
          // 索引减一
          const newIndex = state.historyIndex - 1;

          // 获取对应的历史记录
          const project = state.history[newIndex];

          // 【优化】深拷贝并清理运行时数据
          const restoredProject = cleanRuntimeData(JSON.parse(JSON.stringify(project)));

          // 恢复项目
          set({
            currentProject: restoredProject,
            historyIndex: newIndex,  // 更新索引
          });
        }
      },

      /**
       * 重做
       *
       * 【核心功能】
       * 恢复到下一个历史状态
       *
       * 【优化】恢复时也清理运行时数据
       * 确保恢复的项目不包含旧的执行状态
       *
       * 前提条件：
       * - historyIndex < history.length - 1（有更晚的历史记录）
       */
      redo: () => {
        const state = get();

        // 如果可以重做（历史索引 < 最后一条）
        if (state.historyIndex < state.history.length - 1) {
          // 索引加一
          const newIndex = state.historyIndex + 1;

          // 获取对应的历史记录
          const project = state.history[newIndex];

          // 【优化】深拷贝并清理运行时数据
          const restoredProject = cleanRuntimeData(JSON.parse(JSON.stringify(project)));

          // 恢复项目
          set({
            currentProject: restoredProject,
            historyIndex: newIndex,  // 更新索引
          });
        }
      },
    }),
    // devtools 配置
    {
      name: 'dataflow-visualizer-store',  // Store 名称
    }
  )
);

// ============================================================================
// 第三部分：辅助函数
// ============================================================================

/**
 * 构建执行顺序
 *
 * 【功能】
 * 使用拓扑排序确定节点的执行顺序
 *
 * 【拓扑排序规则】
 * 1. 计算每个节点的入度（指向该节点的连线数量）
 * 2. 将所有入度为 0 的节点加入队列
 * 3. 从队列取出节点，加入结果
 * 4. 将该节点的所有下游节点入度减 1
 * 5. 如果下游节点入度变为 0，加入队列
 * 6. 重复步骤 3-5，直到队列为空
 *
 * 【执行顺序保证】
 * - 入度为 0 的节点（无上游依赖）先执行
 * - 一个节点执行前，所有上游节点必须已执行
 * - 同层节点按添加顺序执行
 *
 * 【示例】
 * 节点依赖图：
 * A → B → C
 * │
 * └→ D
 *
 * 执行顺序：A, B, D, C 或 A, D, B, C
 * （取决于边的顺序）
 *
 * @param nodes - 节点数组
 * @param edges - 连线数组
 * @returns 节点 ID 的执行顺序数组
 */
function buildExecutionOrder(nodes: FlowNode[], edges: FlowEdge[]): string[] {
  // 入度映射：节点 ID -> 入度（指向该节点的连线数量）
  const inDegree: Record<string, number> = {};

  // 邻接表：节点 ID -> 该节点指向的下游节点 ID 数组
  const adjacency: Record<string, string[]> = {};

  // 初始化入度和邻接表
  nodes.forEach(node => {
    // 初始入度为 0
    inDegree[node.id] = 0;

    // 初始邻接表为空数组
    adjacency[node.id] = [];
  });

  // 遍历所有连线，计算入度和构建邻接表
  edges.forEach(edge => {
    // 目标节点的入度加 1
    inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;

    // 将目标节点添加到源节点的邻接表
    adjacency[edge.source].push(edge.target);
  });

  // 初始化队列和结果数组
  const queue: string[] = [];
  const result: string[] = [];

  // 找到所有入度为 0 的节点（无上游依赖）
  Object.keys(inDegree).forEach(nodeId => {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId);  // 加入队列
    }
  });

  // 拓扑排序主循环
  while (queue.length > 0) {
    // 从队列取出第一个节点
    const current = queue.shift()!;

    // 将节点加入结果
    result.push(current);

    // 遍历当前节点的所有下游节点
    adjacency[current].forEach(neighbor => {
      // 下游节点入度减 1
      inDegree[neighbor]--;

      // 如果入度变为 0，加入队列
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  // 返回执行顺序
  return result;
}

/**
 * 获取节点的输入映射
 *
 * 【功能】
 * 根据连线关系，将上游输出赋值给下游输入
 *
 * 【核心规则】
 * - 连线将源节点的输出赋值给目标节点的输入
 * - 赋值按端口进行：edge.sourceHandle → edge.targetHandle
 * - 如果源值是对象且包含同名属性，则提取该属性
 *
 * 【输入映射示例】
 *
 * 场景1：简单值传递
 * DataInput ───→ ProfitCalculator
 * {output: 100}     cost: 100
 *
 * 场景2：对象字段提取
 * DataInput ───→ ProfitCalculator
 * {output: {cost: 100, price: 200}}  cost: 100
 *
 * 场景3：多输入
 * DataInput1 ──┐
 *              ├─→ ProfitCalculator
 * DataInput2 ──┘
 *
 * @param nodeId - 当前节点 ID
 * @param executionResults - 所有上游节点的执行结果
 * @param edges - 所有连线
 * @param modules - 所有模块定义
 * @returns 输入映射对象 { portId: value }
 */
function getNodeInputs(
  nodeId: string,                      // 当前节点 ID
  executionResults: Record<string, any>, // 所有上游节点的执行结果
  edges: FlowEdge[],                   // 所有连线
  modules: ModuleDefinition[]          // 所有模块定义
): Record<string, any> {
  // 初始化输入映射对象
  const inputs: Record<string, any> = {};

  // 找到所有指向该节点的连线
  const incomingEdges = edges.filter(edge => edge.target === nodeId);

  // 遍历每条入边，将上游输出赋值给下游输入
  incomingEdges.forEach(edge => {
    // 获取上游节点的执行结果
    const sourceResult = executionResults[edge.source];

    // 如果上游执行成功，且有输出值
    if (sourceResult && sourceResult.success && sourceResult.output) {
      // 如果有目标端口
      if (edge.targetHandle) {
        // 获取上游输出值
        // 如果有源端口 ID，获取指定端口的值；否则获取整个输出对象
        let sourceValue = edge.sourceHandle
          ? sourceResult.output[edge.sourceHandle]
          : sourceResult.output;

        // 【优化】数组流支持（n8n 风格 Item Lists）
        // 如果上游输出是数组，保持数组完整传递
        // 数组表示多条数据记录（如 [{id:1}, {id:2}]）
        if (Array.isArray(sourceValue)) {
          // 数组直接传递，不做属性提取
          inputs[edge.targetHandle] = sourceValue;
          console.log(`[数组流] 节点 ${nodeId} 端口 ${edge.targetHandle} 收到 ${sourceValue.length} 条数据`);
        }
        // 普通对象：智能提取同名属性
        else if (
          sourceValue &&
          typeof sourceValue === 'object' &&
          edge.targetHandle in sourceValue
        ) {
          // 提取该属性
          inputs[edge.targetHandle] = sourceValue[edge.targetHandle];
        }
        // 其他类型：直接赋值
        else {
          inputs[edge.targetHandle] = sourceValue;
        }
      }
    }
  });

  // 返回输入映射
  return inputs;
}

/**
 * 执行单个节点（优化版）
 *
 * 【功能】
 * 执行节点的计算逻辑，返回执行结果和格式信息
 *
 * 【优化特性】
 * 1. 超时控制：使用 Promise.race 防止无限循环（3秒超时）
 * 2. Run Per Item：支持 'once' 和 'each' 两种运行模式
 *    - once: 批量处理（传统模式）
 *    - each: 自动遍历数组，为每项运行代码（n8n 默认模式）
 *
 * 【执行流程】
 * 1. 获取模块定义
 * 2. 获取输入映射
 * 3. 检查代码是否为空
 * 4. 执行计算逻辑（或直接传递输入到输出）
 * 5. 构建输出格式信息
 *
 * @param node - 要执行的节点
 * @param executionResults - 上游节点的执行结果
 * @param globalVariables - 全局变量列表
 * @param edges - 所有连线
 * @param modules - 所有模块定义
 * @returns 执行结果（包含 success、output、outputFormat、error、executionTime）
 */
async function executeNode(
  node: FlowNode,                      // 要执行的节点
  executionResults: Record<string, any>, // 上游节点的执行结果
  globalVariables: GlobalVariable[],    // 全局变量列表
  edges: FlowEdge[],                   // 所有连线
  modules: ModuleDefinition[]          // 所有模块定义
): Promise<{
  success: boolean;   // 是否执行成功
  output: any;        // 输出值
  outputFormat: Record<string, { type: string; structure: any }>; // 输出格式
  error?: string;     // 错误信息（如果执行失败）
  executionTime: number; // 执行耗时（毫秒）
}> {
  // 记录开始时间
  const startTime = Date.now();

  // 从节点数据中解构模块 ID、配置和代码
  const { moduleId, config, code } = node.data;

  try {
    // 1. 获取模块定义
    const module = modules.find(m => m.id === moduleId);

    // 如果模块不存在，抛出错误
    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    // 2. 获取基于连线关系的输入映射
    const inputs = getNodeInputs(node.id, executionResults, edges, modules);

    // 3. 检查计算逻辑是否为空
    const nodeCode = code || module.code || '';

    // 判断代码是否为空
    const isCodeEmpty = !nodeCode ||
      nodeCode.trim() === '' ||
      nodeCode.includes('function execute(inputs, config, globals) {\n  \n}') ||
      nodeCode.trim() === 'function execute(inputs, config, globals) {}';

    // 初始化输出对象
    let output: Record<string, any>;

    // 【优化】获取运行模式（默认 'once'）
    const runMode = module.runMode || 'once';

    if (isCodeEmpty) {
      // 4a. 空代码：输入直接传递到输出
      output = { ...inputs };
    } else {
      // 4b. 有代码：执行用户代码（带超时控制）

      // 包装代码，添加 return 语句
      const wrappedCode = nodeCode + '\n\nreturn execute(inputs, config, globals);';

      // 创建函数
      const executeFn = new Function('inputs', 'config', 'globals', wrappedCode);

      // 【优化】处理数组输入（Run Per Item 模式）
      // 如果运行模式是 'each'，且输入是数组，自动遍历处理
      if (runMode === 'each' && Array.isArray(inputs.default)) {
        // 遍历数组，为每一项运行代码
        const items = inputs.default;
        const results: any[] = [];

        for (const item of items) {
          // 每项的输入是单个对象
          const singleInput = { default: item };
          const itemResult = await executeWithTimeout(
            executeFn, [singleInput, config || {}, globalVariables]
          );
          results.push(itemResult);
        }

        // 合并结果为数组
        output = { default: results };
        console.log(`[Run Per Item] 节点 ${node.id} 处理 ${items.length} 项数据`);
      } else {
        // 【优化】使用超时控制执行
        // 如果输入是数组但模式是 'once'，保持数组完整传递
        const inputForExec = Array.isArray(inputs.default)
          ? { ...inputs, default: inputs.default }
          : inputs;

        output = await executeWithTimeout(
          executeFn, [inputForExec, config || {}, globalVariables]
        ) || {};
      }
    }

    // 5. 构建输出格式信息
    const outputFormat: Record<string, { type: string; structure: any }> = {};

    // 遍历模块的所有输出端口
    module.outputs.forEach(port => {
      // 获取输出值
      const value = output[port.id];

      // 如果输出值存在
      if (value !== undefined) {
        // 使用实际值的类型和结构
        outputFormat[port.id] = {
          type: typeof value,  // 值类型
          structure: getValueStructure(value),  // 值结构
        };
      } else {
        // 如果输出值不存在，使用端口定义的类型
        outputFormat[port.id] = {
          type: port.type,
          structure: null,
        };
      }
    });

    // 处理动态输出（代码中动态添加的输出）
    if (output && typeof output === 'object') {
      Object.keys(output).forEach(key => {
        // 如果该输出不在模块定义中
        if (!outputFormat[key]) {
          const value = output[key];
          outputFormat[key] = {
            type: typeof value,
            structure: getValueStructure(value),
          };
        }
      });
    }

    // 返回执行成功结果
    return {
      success: true,           // 执行成功
      output,                  // 输出值
      outputFormat,            // 【关键】返回格式信息
      executionTime: Date.now() - startTime,  // 执行耗时
    };
  } catch (error) {
    // 处理超时错误
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // 如果是超时错误，添加更详细的错误信息
    if (errorMessage.includes('timeout') || errorMessage.includes('Timed out')) {
      console.error(`[超时] 节点 ${node.id} 执行超时（${EXECUTION_TIMEOUT_MS}ms）`);
    }

    // 返回执行失败结果
    return {
      success: false,          // 执行失败
      output: null,            // 无输出
      outputFormat: {},        // 无格式
      error: errorMessage,     // 错误信息
      executionTime: Date.now() - startTime,  // 执行耗时
    };
  }
}

/**
 * 【优化】带超时的执行函数
 *
 * 功能：
 * 使用 Promise.race 实现超时控制，防止无限循环
 *
 * @param fn - 要执行的函数
 * @param args - 函数参数数组
 * @returns 执行结果
 */
async function executeWithTimeout(fn: Function, args: any[]): Promise<any> {
  // 创建超时 Promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error(`Execution timed out after ${EXECUTION_TIMEOUT_MS}ms`)),
      EXECUTION_TIMEOUT_MS
    );
  });

  // 创建执行 Promise（包装为异步）
  const executionPromise = (async () => {
    // 强制将用户代码作为异步函数执行
    const asyncFn = new Function(
      'inputs', 'config', 'globals',
      `"use strict"; return (async () => { ${fn.toString().split('\n').slice(1, -1).join('\n')} })();`
    );
    return asyncFn(...args);
  })();

  // 竞态执行，返回先完成的 Promise
  return Promise.race([executionPromise, timeoutPromise]);
}

/**
 * 获取值的结构信息
 *
 * 【功能】
 * 递归获取值的结构，用于格式预览
 *
 * 【返回值类型】
 * - 数字: { type: 'number', sample: 值 }
 * - 字符串: { type: 'string', sample: 截取前50字符 }
 * - 布尔值: { type: 'boolean' }
 * - 空值: null / undefined
 * - 数组: { type: 'array', length: 长度, samples: [元素结构...] }
 * - 对象: { type: 'object', fields: { 字段名: 结构... } }
 *
 * 【用途】
 * - 在 UI 上显示格式预览
 * - 显示对象包含哪些字段
 * - 显示数组包含哪些元素
 *
 * @param value - 要获取结构的目标值
 * @returns 值的结构信息
 */
function getValueStructure(value: any): any {
  // 处理 null
  if (value === null) return null;

  // 处理 undefined
  if (value === undefined) return undefined;

  // 处理数字
  if (typeof value === 'number') {
    return { type: 'number', sample: value };
  }

  // 处理字符串（截取前50字符作为示例）
  if (typeof value === 'string') {
    return { type: 'string', sample: value.substring(0, 50) };
  }

  // 处理布尔值
  if (typeof value === 'boolean') {
    return { type: 'boolean' };
  }

  // 处理数组
  if (Array.isArray(value)) {
    // 空数组
    if (value.length === 0) {
      return { type: 'array', length: 0 };
    }

    // 非空数组，获取前3个元素的结构作为示例
    const samples = value.slice(0, 3).map(v => getValueStructure(v));
    return { type: 'array', length: value.length, samples };
  }

  // 处理对象
  if (typeof value === 'object') {
    // 空对象
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return { type: 'object', fields: {} };
    }

    // 非空对象，获取所有字段的结构
    const fields: Record<string, any> = {};
    keys.slice(0, 10).forEach(key => {
      // 递归获取字段值结构
      fields[key] = getValueStructure(value[key]);
    });

    // 如果字段超过10个，标记还有更多
    if (keys.length > 10) {
      fields['...'] = `还有 ${keys.length - 10} 个字段`;
    }

    return { type: 'object', fields };
  }

  // 其他类型，返回 typeof 结果
  return { type: typeof value };
}

/**
 * 【优化】清理项目中的运行时数据
 *
 * 功能：
 * 从项目节点数据中移除运行时生成的数据，只保留结构定义
 *
 * 【被排除的字段】
 * - status: 节点运行状态（running/success/error）
 * - preview: 节点执行预览数据
 * - inputValues: 节点输入值
 * - inputFormats: 输入格式信息
 * - pinnedData: Pin 住的固定数据
 *
 * 【被保留的字段】
 * - 节点位置和尺寸（position, width, height）
 * - 节点标题和标签（label, title）
 * - 模块 ID 和代码（moduleId, code, config）
 * - 样式相关（style, className）
 *
 * @param project - 要清理的项目对象
 * @returns 清理后的项目对象
 */
function cleanRuntimeData(project: any): any {
  // 检查是否是项目对象
  if (!project || typeof project !== 'object') {
    return project;
  }

  // 如果有节点数组，清理每个节点的运行时数据
  if (project.nodes && Array.isArray(project.nodes)) {
    project.nodes = project.nodes.map((node: any) => {
      if (!node || !node.data) {
        return node;
      }

      // 创建新的 data 对象，只保留非运行时字段
      const cleanedData: Record<string, any> = {};

      // 保留的字段列表
      const preservedFields = [
        'label', 'title', 'moduleId', 'code', 'config',
        'style', 'className', 'selected', 'dragging',
        'position', 'width', 'height',
      ];

      // 复制保留的字段
      preservedFields.forEach(field => {
        if (node.data[field] !== undefined) {
          cleanedData[field] = node.data[field];
        }
      });

      // 返回清理后的节点
      return {
        ...node,
        data: cleanedData,
      };
    });
  }

  return project;
}
