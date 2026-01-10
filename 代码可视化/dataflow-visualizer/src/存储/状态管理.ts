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
 * ============================================================================
 */

// 从 Zustand 库导入 create 函数，用于创建状态管理 Store
// Zustand 是一个轻量级的 React 状态管理库
import { create } from 'zustand';

// 从 Zustand 库导入 devtools 中间件，用于集成 Redux DevTools
// 可以在浏览器开发者工具中查看状态变化
import { devtools } from 'zustand/middleware';

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
   * 1. 先执行上游节点（确保有输出数据）
   * 2. 再执行下游节点（使用上游结果）
   *
   * 调用时机：
   * - 在 addEdge 函数中调用
   * - 用户创建新连线时自动触发
   */
  executeUpstreamChain: (sourceNodeId: string, targetNodeId: string) => Promise<void>;

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
       * 执行单个节点
       *
       * @param nodeId - 要执行的节点 ID
       *
       * 【核心功能】
       * 1. 找到指定节点及其所有下游节点
       * 2. 按照拓扑排序执行每个节点
       * 3. 每次从全局 state 获取最新的 executionResults
       * 4. 立即更新全局 state，供下游节点使用
       * 5. 自动构建并存储输入格式信息（inputFormats）
       *
       * 【关键设计】
       * - 使用 get() 获取最新状态，而非闭包中的旧状态
       * - 每次循��都重新获取 currentResults
       * - 立即更新 state，下游节点可以读取到上游结果
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

        // 节点不存在，直接返回
        if (!node) return;

        // 【关键】从全局 executionResults 获取数据
        // 这样可以获取到之前执行的其他节点的结果
        const globalResults = state.executionResults;

        // 找到所有依赖该节点的下游节点
        // 使用 Set 避免重复遍历
        const dependentNodes = new Set<string>();

        // 递归查找下游节点的函数
        const findDependents = (nid: string) => {
          // 遍历所有连线
          edges.forEach(edge => {
            // 如果连线的源节点是当前节点，且下游节点未记录
            if (edge.source === nid && !dependentNodes.has(edge.target)) {
              // 记录下游节点
              dependentNodes.add(edge.target);
              // 递归查找该下游节点的下游
              findDependents(edge.target);
            }
          });
        };

        // 从指定节点开始查找所有下游节点
        findDependents(nodeId);

        // 构建执行顺序（拓扑排序）
        const executionOrder = buildExecutionOrder(nodes, edges);

        // 过滤出与指定节点相关的执行顺序
        // 包含：指定节点本身 + 所有下游节点
        const relevantOrder = executionOrder.filter(id =>
          id === nodeId || dependentNodes.has(id)
        );

        // 【关键】遍历执行顺序中的每个节点
        for (const nid of relevantOrder) {
          // 【关键】每次循环从最新的 state 获取 executionResults
          // 这是实现下游节点能读取上游结果的关键
          const currentState = get();
          const currentResults = currentState.executionResults;

          // 在节点列表中查找当前节点
          const n = nodes.find(x => x.id === nid);

          // 如果节点不存在，跳过
          if (!n) continue;

          // 计算当前节点的输入值
          // 【关键】使用最新的 currentResults，而非闭包中的旧结果
          const nodeInputs = getNodeInputs(nid, currentResults, edges, modules);

          // 构建 running 状态的节点数据
          // 包含：现有数据 + running 状态 + 输入值
          const runningNodeData: FlowNode['data'] = {
            ...n.data,
            status: 'running',  // 设置为运行中状态
            inputValues: { ...nodeInputs },  // 存储输入值
          };

          // 更新节点状态为 running
          set(s => ({
            // 确保 currentProject 存在
            currentProject: s.currentProject ? {
              // 复制现有项目
              ...s.currentProject,
              // 更新节点列表
              nodes: s.currentProject.nodes.map(x =>
                // 找到当前节点，更新其数据
                x.id === nid ? { ...x, data: runningNodeData } : x
              ),
            } : null,
          }));

          // 执行节点，获取执行结果
          // 使用当前的 executionResults 作为输入
          const result = await executeNode(
            n,                  // 节点
            currentResults,     // 执行结果
            state.globalVariables,  // 全局变量
            edges,              // 连线
            modules             // 模块
          );

          // 【关键】立即更新全局 state，供下游节点使用
          // 找到节点对应的模块定义
          const module = modules.find(m => m.id === n.data.moduleId);

          set(s => {
            // 复制现有的端口值对象
            const newPortValues = { ...s.nodePortValues };

            // 如果执行成功，且有输出值，且模块存在
            if (result.success && result.output && module) {
              // 遍历模块的所有输出端口
              module.outputs.forEach(output => {
                // 构建端口键名
                const key = `${nid}:${output.id}`;

                // 添加到端口值对象
                newPortValues[key] = {
                  nodeId: nid,          // 节点 ID
                  portId: output.id,    // 端口 ID
                  value: result.output[output.id],  // 端口值
                  format: result.outputFormat[output.id],  // 【新增】格式信息
                  timestamp: Date.now(), // 时间戳
                };
              });
            }

            // 【关键】构建输入格式信息，供下游节点使用
            // 从上游节点的 outputFormat 获取格式信息
            const inputFormats: Record<string, { type: string; structure: any; sourceNodeId: string; sourcePortId: string }> = {};

            // 找到所有指向当前节点的连线
            const incomingEdges = edges.filter(edge => edge.target === nid);

            // 遍历每条入边
            incomingEdges.forEach(edge => {
              // 获取上游节点的执行结果
              const sourceResult = currentState.executionResults[edge.source];

              // 如果上游执行成功，且有 outputFormat
              if (sourceResult && sourceResult.success && sourceResult.outputFormat) {
                // 获取上游端口 ID（默认端口为 'default'）
                const sourcePortId = edge.sourceHandle || 'default';

                // 获取上游输出格式
                const format = sourceResult.outputFormat[sourcePortId];

                // 如果有格式信息，且目标端口存在
                if (format && edge.targetHandle) {
                  // 存储到输入格式对象
                  inputFormats[edge.targetHandle] = {
                    ...format,            // 复制格式信息
                    sourceNodeId: edge.source,  // 上游节点 ID
                    sourcePortId,         // 上游端口 ID
                  };
                }
              }
            });

            // 构建最终的节点数据
            const finalNodeData: FlowNode['data'] = {
              ...runningNodeData,         // 复制运行时的数据
              status: result.success ? 'success' : 'error',  // 设置最终状态
              preview: result.success ? result.output : undefined,  // 预览数据
              inputValues: { ...nodeInputs },  // 存储输入值
              inputFormats,  // 【关键】存储输入格式信息，供 UI 显示
            };

            // 返回更新后的状态
            return {
              // 更新执行结果
              executionResults: {
                ...s.executionResults,
                [nid]: result,  // 存储当前节点执行结果
              },
              // 更新端口值
              nodePortValues: newPortValues,
              // 更新项目中的节点数据
              currentProject: s.currentProject ? {
                ...s.currentProject,
                nodes: s.currentProject.nodes.map(x =>
                  x.id === nid ? { ...x, data: finalNodeData } : x
                ),
              } : null,
            };
          });

          // 【关键】在 set() 内部触发回调，确保使用正确的 finalNodeData
          // 回调在 set() 完成前同步执行，避免 Zustand 批量更新导致的数据不一致
          const callback = get().onNodeDataChange;
          if (callback) {
            // 直接使用 finalNodeData，而不是从 store 读取
            // 因为 set() 内部的状态更新还未完成，从 store 读取可能得到旧数据
            callback(nid, finalNodeData);
          }
        }
      },

      /**
       * 执行上游到下游的数据传递链
       *
       * @param sourceNodeId - 上游节点 ID
       * @param targetNodeId - 下游节点 ID
       *
       * 【核心功能】
       * 1. 先执行上游节点（确保有输出数据）
       * 2. 再执行下游节点（使用上游结果）
       *
       * 【调用时机】
       * - 在 addEdge 函数中调用
       * - 用户创建新连线时自动触发
       *
       * 【为什么需要这个函数？】
       * - 连线后需要自动更新下游节点的输入值和格式预览
       * - 需要确保上游先执行，下游才能读取到上游结果
       */
      executeUpstreamChain: async (sourceNodeId: string, targetNodeId: string) => {
        // 获取当前状态
        const state = get();

        // 如果没有当前项目或正在执行，直接返回
        if (!state.currentProject || state.isExecuting) return;

        // 从当前项目中解构
        const { nodes, edges, modules } = state.currentProject;

        // 1. 先执行上游节点
        // 确保上游节点有输出数据
        await get().executeSingleNode(sourceNodeId);

        // 2. 再执行下游节点
        // 此时上游结果已在全局 state 中
        await get().executeSingleNode(targetNodeId);
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
       * 推入历史记录
       *
       * 【核心功能】
       * 将当前项目状态保存到历史记录
       *
       * 操作步骤：
       * 1. 截取当前历史到当前位置（丢弃重做部分）
       * 2. 深拷贝当前项目，添加到历史末尾
       * 3. 如果超出最大数量，删除最早的记录
       * 4. 更新历史索引指向最新记录
       */
      pushToHistory: () => {
        const state = get();

        // 如果没有当前项目，直接返回
        if (!state.currentProject) return;

        // 1. 截取当前历史到当前位置
        const newHistory = state.history.slice(0, state.historyIndex + 1);

        // 2. 深拷贝当前项目，添加到历史
        // 使用 JSON.parse(JSON.stringify()) 实现深拷贝
        newHistory.push(JSON.parse(JSON.stringify(state.currentProject)));

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

          // 恢复项目
          set({
            currentProject: JSON.parse(JSON.stringify(project)),  // 深拷贝
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

          // 恢复项目
          set({
            currentProject: JSON.parse(JSON.stringify(project)),  // 深拷贝
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
        const sourceValue = edge.sourceHandle
          ? sourceResult.output[edge.sourceHandle]
          : sourceResult.output;

        // 智能提取：如果源值是对象，且包含与目标端口同名的属性
        let finalValue = sourceValue;
        if (
          sourceValue &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          edge.targetHandle in sourceValue
        ) {
          // 提取该属性
          finalValue = sourceValue[edge.targetHandle];
        }

        // 赋值给目标端口
        inputs[edge.targetHandle] = finalValue;
      }
    }
  });

  // 返回输入映射
  return inputs;
}

/**
 * 执行单个节点
 *
 * 【功能】
 * 执行节点的计算逻辑，返回执行结果和格式信息
 *
 * 【执行流程】
 * 1. 获取模块定义
 * 2. 获取输入映射
 * 3. 检查代码是否为空
 * 4. 执行计算逻辑（或直接传递输入到输出）
 * 5. 构建输出格式信息
 *
 * 【空代码处理】
 * 如果代码为空（未编写或只有默认模板）：
 * - 输入直接传递到输出
 * - 不执行任何计算
 *
 * 【格式信息】
 * 返回结果中包含 outputFormat，记录每个输出端口的格式：
 * - type: 值类型（number、string、boolean、object、array）
 * - structure: 值的详细结构（对象字段、数组元素等）
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
    // 1. 获取模��定义
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

    if (isCodeEmpty) {
      // 4a. 空代码：输入直接传递到输出
      output = { ...inputs };
    } else {
      // 4b. 有代码：执行用户代码

      // 包装代码，添加 return 语句
      const wrappedCode = nodeCode + '\n\nreturn execute(inputs, config, globals);';

      // 创建函数并执行
      const executeFn = new Function('inputs', 'config', 'globals', wrappedCode);
      output = executeFn(inputs, config || {}, globalVariables) || {};
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
    // 返回执行失败结果
    return {
      success: false,          // 执行失败
      output: null,            // 无输出
      outputFormat: {},        // 无格式
      error: error instanceof Error ? error.message : 'Unknown error',  // 错误信息
      executionTime: Date.now() - startTime,  // 执行耗时
    };
  }
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
