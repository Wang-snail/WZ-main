/**
 * ============================================================================
 * 文件名：索引.ts
 * 功能描述：定义整个应用中使用的数据类型
 *
 * 本文件定义了所有核心数据结构，包括：
 * 1. 基础数据类型（DataType）
 * 2. 节点端口类型（NodePort）
 * 3. 模块定义类型（ModuleDefinition）
 * 4. 流程节点类型（FlowNode）
 * 5. 流程连线类型（FlowEdge）
 * 6. 项目类型（Project）
 * 7. 全局变量类型（GlobalVariable）
 * 8. 执行结果类型（ExecutionResult）
 * 9. 公式编辑器相关类型
 *
 * 设计原则：
 * - 类型名称使用 PascalCase（如 ModuleDefinition）
 * - 属性名称使用 camelCase（如 moduleId）
 * - 所有类型都有详细的中文注释
 * ============================================================================
 */

// ============================================================================
// 第一部分：基础数据类型
// ============================================================================

/**
 * 基础数据类型
 *
 * 功能说明：
 * 定义系统支持的所有基础数据类型
 *
 * 可选值：
 * - 'number': 数字类型（整数、浮点数）
 * - 'string': 字符串类型
 * - 'json': JSON 对象类型
 * - 'boolean': 布尔类型（true/false）
 * - 'array': 数组类型
 * - 'object': 对象类型
 *
 * 使用场景：
 * - 定义端口的数据类型
 * - 验证输入输出的类型匹配
 * - UI 显示类型标识
 */
export type DataType =
  | 'number'   // 数字类型：用于价格、数量、成本等数值数据
  | 'string'   // 字符串类型：用于名称、描述等文本数据
  | 'json'     // JSON 类型：用于复杂的嵌套数据结构
  | 'boolean'  // 布尔类型：用于开关、状态等真假值
  | 'array'    // 数组类型：用于列表、集合等数据
  | 'object';  // 对象类型：用于键值对、字典等结构化数据

// ============================================================================
// 第二部分：节点端口类型
// ============================================================================

/**
 * 节点端口类型
 *
 * 功能说明：
 * 定义节点的输入或输出端口的基本结构
 *
 * 端口的作用：
 * - 输入端口：接收来自上游节点的数据
 * - 输出端口：向下游节点发送数据
 *
 * 使用场景：
 * - 在模块定义中定义模块的接口
 * - 在节点实例中显示端口列表
 * - 验证连线时检查类型兼容性
 *
 * 示例：
 * {
 *   id: 'price',           // 端口 ID
 *   name: '商品售价',       // 显示名称
 *   type: 'number',        // 数据类型
 *   description: '商品的售价信息'  // 描述信息
 * }
 */
export interface NodePort {
  /**
   * 端口唯一标识符
   *
   * 格式：通常使用小写下划线命名
   * 示例：'price'、'cost'、'quantity'
   *
   * 用途：
   * - 在连线中标识源端口和目标端口
   * - 在输入映射中作为键名
   */
  id: string;

  /**
   * 端口显示名称
   *
   * 用途：UI 显示时使用
   * 示例：'商品售价'、'成本价'、'购买数量'
   */
  name: string;

  /**
   * 端口数据类型
   *
   * 用于：
   * - 类型检查（确保连线的端口类型兼容）
   * - UI 显示类型标识
   * - 数据验证
   */
  type: DataType;

  /**
   * 端口描述信息（可选）
   *
   * 用途：
   * - 鼠标悬停时显示提示
   * - 帮助用户理解端口用途
   */
  description?: string;
}

// ============================================================================
// 第三部分：模块定义类型
// ============================================================================

/**
 * 模块定义类型
 *
 * 功能说明：
 * 定义模块的完整结构，包括元数据、接口和实现
 *
 * 模块的概念：
 * - 模块是节点的功能模板
 * - 包含输入输出端口、默认代码、配置等
 * - 用户可以拖拽模块到画布创建节点实例
 *
 * 模块分类（category）：
 * - 'input': 输入模块（数据来源）
 * - 'processing': 处理模块（数据转换）
 * - 'calculation': 计算模块（数学运算）
 * - 'output': 输出模块（数据输出）
 * - 'custom': 自定义模块
 *
 * 示例：
 * {
 *   id: 'profit_calculator',  // 模块 ID
 *   name: '利润计算器',         // 模块名称
 *   category: 'calculation',   // 计算类模块
 *   description: '根据售价和成本计算利润',  // 描述
 *   inputs: [ ... ],           // 输入端口
 *   outputs: [ ... ],          // 输出端口
 *   code: 'function execute(inputs, config, globals) { ... }',  // 默认代码
 *   isBuiltIn: true,          // 是否内置模块
 * }
 */
export interface ModuleDefinition {
  /**
   * 模块唯一标识符
   *
   * 格式：通常使用下划线命名法
   * 示例：'data_input'、'profit_calculator'、'data_output'
   *
   * 用途：
   * - 在模块库中唯一标识模块
   * - 节点通过 moduleId 引用模块
   */
  id: string;

  /**
   * 模块显示名称
   *
   * 用途：
   * - 在侧边栏模块列表中显示
   * - 在节点标题中显示
   */
  name: string;

  /**
   * 模块分类
   *
   * 可选值：
   * - 'input': 输入模块（数据来源，如数据输入节点）
   * - 'processing': 处理模块（数据转换）
   * - 'calculation': 计算模块（数学运算）
   * - 'output': 输出模块（数据输出）
   * - 'custom': 自定义模块
   *
   用途：
   * - 侧边栏模块分类显示
   * - 节点颜色标识（分类色点）
   */
  category: 'input' | 'processing' | 'calculation' | 'output' | 'custom';

  /**
   * 模块描述
   *
   * 用途：
   * - 显示在节点底部
   * - 帮助用户理解模块功能
   */
  description: string;

  /**
   * 模块版本号
   *
   * 格式：语义化版本号
   * 示例：'1.0.0'、'2.1.0'
   *
   用途：
   * - 模块版本管理
   * - 更新检测
   */
  version: string;

  /**
   * 模块作者（可选）
   */
  author?: string;

  /**
   * 输入端口列表
   *
   * 定义模块接收数据的接口
   * 节点实例化时，这些端口会显示在左侧
   */
  inputs: NodePort[];

  /**
   * 输出端口列表
   *
   * 定义模块输出数据的接口
   * 节点实例化时，这些端口会显示在右侧
   */
  outputs: NodePort[];

  /**
   * 模块默认配置
   *
   * 存储模块的默认参数设置
   * 节点实例化时会复制此配置
   *
   * 示例：
   * {
   *   sampleData: '{"price": 100, "cost": 60}',  // 数据输入模块的默认数据
   *   decimalPlaces: 2,  // 数字格式化：小数位数
   * }
   */
  config: Record<string, any>;

  /**
   * 模块默认代码
   *
   * 功能：
   * 定义模块的默认计算逻辑
   *
   * 代码格式：
   * function execute(inputs, config, globals) {
   *   // inputs: 输入值对象 { price: 100, cost: 60 }
   *   // config: 模块配置
   *   // globals: 全局变量
   *
   *   // 计算利润
   *   const profit = inputs.price - inputs.cost;
   *
   *   // 返回输出值对象
   *   return { profit };
   * }
   *
   * 空代码处理：
   * 如果代码为空或只有模板，输入将直接传递到输出
   */
  code: string;

  /**
   * 是否为内置模块
   *
   * true: 内置模块（不可删除）
   * false: 用户自定义模块（可删除）
   */
  isBuiltIn: boolean;

  /**
   * 最后修改时间
   *
   * 格式：ISO 8601 日期时间字符串
   * 示例：'2024-01-15T10:30:00.000Z'
   */
  lastModified: string;
}

// ============================================================================
// 第四部分：流程节点类型
// ============================================================================

/**
 * 流程节点类型
 *
 * 功能说明：
 * 定义画布上节点的完整结构
 *
 * 节点的组成：
 * 1. 基本信息：id、type、position
 * 2. 数据：data（包含模块引用、配置、状态等）
 *
 * 节点状态（status）：
 * - 'idle': 空闲（未执行）
 * - 'running': 运行中
 * - 'success': 执行成功
 * - 'error': 执行失败
 *
 * 示例：
 * {
 *   id: 'node_1704067200000_abc123',
 *   type: 'custom',
 *   position: { x: 100, y: 200 },
 *   data: {
 *     moduleId: 'profit_calculator',
 *     label: '利润计算',
 *     instanceId: 'instance_1704067200000',
 *     status: 'success',
 *     config: { ... },
 *     inputValues: { price: 100, cost: 60 },
 *   }
 * }
 */
export interface FlowNode {
  /**
   * 节点唯一标识符
   *
   * 格式：'node_' + 时间戳 + '_' + 随机字符串
   * 示例：'node_1704067200000_abc123def'
   *
   用途：
   * - 唯一标识节点
   * - 在 edges 中引用节点
   * - 在 executionResults 中存储执行结果
   */
  id: string;

  /**
   * 节点类型
   *
   * 用途：
   * - React Flow 使用类型来渲染不同的节点组件
   * - 本系统使用 'custom' 类型渲染自定义节点
   */
  type: string;

  /**
   * 节点位置
   *
   * 坐标系：
   * - x: 水平位置（从左向右）
   * - y: 垂直位置（从上向下）
   *
   * 单位：像素
   */
  position: {
    x: number;  // X 坐标
    y: number;  // Y 坐标
  };

  /**
   * 节点数据
   *
   * 包含节点的所有动态数据：
   * - 模块引用：通过 moduleId 关联模块定义
   * - 配置参数：config
   * - 显示状态：status、preview
   * - 运行时数据：inputValues、inputFormats
   */
  data: {
    /**
     * 关联的模块 ID
     *
     * 引用 ModuleDefinition 的 id
     * 用于获取模块的输入输出定义和默认代码
     */
    moduleId: string;

    /**
     * 模块配置
     *
     * 存储模块的参数设置
     * 节点创建时从模块定义复制
     * 用户可以修改配置
     */
    config: Record<string, any>;

    /**
     * 节点显示标题
     *
     * 用户可以编辑此标题
     * 默认使用模块名称
     */
    label: string;

    /**
     * 节点实例 ID
     *
     * 格式：'instance_' + 时间戳
     * 示例：'instance_1704067200000'
     *
     * 用途：
     * - 在 UI 组件中引用节点
     * - 存储端口值时作为键的一部分
     */
    instanceId: string;

    /**
     * 节点运行状态
     *
     * 可选值：
     * - 'idle': 空闲（初始状态）
     * - 'running': 运行中
     * - 'success': 执行成功
     * - 'error': 执行失败
     *
     * 用途：
     * - UI 显示状态颜色（蓝/绿/红）
     * - 迷你地图节点着色
     */
    status: 'idle' | 'running' | 'success' | 'error';

    /**
     * 预览数据
     *
     * 功能：
     * 存储节点的执行结果
     * 用于在节点上显示数据预览
     *
     * 仅在执行成功后设置
     */
    preview?: any;

    /**
     * 自定义代码
     *
     * 功能：
     * 用户编写的计算逻辑
     * 覆盖模块的默认代码
     *
     * 如果为空，使用模块的默认代码
     */
    code?: string;

    /**
     * 公式配置
     *
     * 功能：
     * 公式编辑器模式下的配置
     * 包含目标输出和表达式树
     */
    formulaConfig?: FormulaConfig;

    /**
     * 编辑模式
     *
     * 可选值：
     * - 'code': 代码编辑模式
     * - 'formula': 公式编辑模式
     *
     * 仅计算类模块有此属性
     */
    editorMode?: 'code' | 'formula';

    /**
     * 输入端口实时值
     *
     * 功能：
     * 存储每个输入端口的当前值
     * 用于 UI 显示输入值
     *
     * 存储结构：
     * {
     *   'price': 100,      // price 端口的值
     *   'cost': 60,        // cost 端口的值
     * }
     *
     * 更新时机：
     * - 节点执行时更新
     * - 上游节点执行完成后更新
     */
    inputValues?: Record<string, any>;

    /**
     * 输入端口格式信息
     *
     * 功能：
     * 存储每个输入端口的格式信息
     * 用于 UI 显示格式预览
     *
     * 存储结构：
     * {
     *   'price': {
     *     type: 'number',
     *     structure: { type: 'number', sample: 100 },
     *     sourceNodeId: 'node_123',
     *     sourcePortId: 'output',
     *   }
     * }
     *
     * 【关键】
     * 这是实现格式传递的核心字段
     * 连线后，下游节点会自动显示上游输出的格式预览
     */
    inputFormats?: Record<string, {
      type: string;              // 值类型
      structure?: any;           // 值结构
      sourceNodeId: string;      // 上游节点 ID
      sourcePortId: string;      // 上游端口 ID
    }>;
  };
}

// ============================================================================
// 第五部分：流程连线类型
// ============================================================================

/**
 * 流程连线类型
 *
 * 功能说明：
 * 定义节点之间连线的结构
 *
 * 连线的概念：
 * - 连线代表数据流动方向
 * - 从源节点的输出端口指向目标节点的输入端口
 * - 数据从源节点流向目标节点
 *
 * 连线即赋值：
 * - 一条连线将源节点的输出赋值给目标节点的输入
 * - 赋值按端口进行：edge.sourceHandle → edge.targetHandle
 *
 * 示例：
 * {
 *   id: 'edge_1704067200000_xyz789',
 *   source: 'node_1704067200000_abc123',  // 源节点 ID
 *   target: 'node_1704067200000_def456',  // 目标节点 ID
 *   sourceHandle: 'output',                // 源端口 ID
 *   targetHandle: 'price',                 // 目标端口 ID
 *   type: 'smoothstep',                    // 连线样式
 * }
 */
export interface FlowEdge {
  /**
   * 连线唯一标识符
   *
   * 格式：'edge_' + 时间戳 + '_' + 随机字符串
   * 示例：'edge_1704067200000_abc123def'
   */
  id: string;

  /**
   * 源节点 ID
   *
   * 引用 FlowNode.id
   * 表示连线的起始节点
   */
  source: string;

  /**
   * 目标节点 ID
   *
   * 引用 FlowNode.id
   * 表示连线的终止节点
   */
  target: string;

  /**
   * 源端口 ID（可选）
   *
   * 功能：
   * 指定源节点的输出端口
   *
   * 如果不指定，默认使用节点的默认输出端口
   * （通常是第一个输出端口或名为 'output' 的端口）
   */
  sourceHandle?: string;

  /**
   * 目标端口 ID（可选）
   *
   * 功能：
   * 指定目标节点的输入端口
   *
   * 如果不指定，默认使用节点的默认输入端口
   * （通常是第一个输入端口或名为 'input' 的端口）
   */
  targetHandle?: string;

  /**
   * 连线类型（可选）
   *
   * 定义连线的样式
   * 可选值：
   * - 'smoothstep': 直线（带圆角）
   * - 'bezier': 贝塞尔曲线
   * - 'straight': 直线
   * - 'step': 阶梯线
   *
   * 默认值：'smoothstep'
   */
  type?: string;

  /**
   * 连线数据（可选）
   *
   * 功能：
   * 存储连线的附加数据
   * 如：连线标签、样式等
   */
  data?: any;
}

// ============================================================================
// 第六部分：项目类型
// ============================================================================

/**
 * 项目类型
 *
 * 功能说明：
 * 定义项目的完整结构
 *
 * 项目的概念：
 * - 项目是数据流可视化工作的容器
 * - 包含所有节点、连线和配置
 * - 可以保存和加载
 *
 * 示例：
 * {
 *   id: 'project_1704067200000',
 *   name: '利润计算流程',
 *   description: '计算商品利润的数据流',
 *   nodes: [ ... ],           // 节点列表
 *   edges: [ ... ],           // 连线列表
 *   modules: [ ... ],         // 使用的模块
 *   globals: { tax: 0.13 },   // 全局变量
 *   createdAt: '2024-01-01T10:00:00.000Z',
 *   updatedAt: '2024-01-15T14:30:00.000Z',
 * }
 */
export interface Project {
  /**
   * 项目唯一标识符
   *
   * 格式：'project_' + 时间戳
   * 示例：'project_1704067200000'
   */
  id: string;

  /**
   * 项目名称
   */
  name: string;

  /**
   * 项目描述（可选）
   */
  description?: string;

  /**
   * 项目中的节点列表
   */
  nodes: FlowNode[];

  /**
   * 项目中的连线列表
   */
  edges: FlowEdge[];

  /**
   * 项目使用的模块列表
   *
   * 注意：
   * 这是项目级别的模块引用
   * 用于保存项目时可以包含自定义模块
   */
  modules: ModuleDefinition[];

  /**
   * 项目全局变量
   *
   * 存储结构：
   * {
   *   'tax': 0.13,          // 税率
   *   'discount': 0.9,      // 折扣率
   * }
   */
  globals: Record<string, any>;

  /**
   * 项目创建时间
   *
   * 格式：ISO 8601 日期时间字符串
   */
  createdAt: string;

  /**
   * 项目最后更新时间
   *
   * 格式：ISO 8601 日期时间字符串
   */
  updatedAt: string;
}

// ============================================================================
// 第七部分：全局变量类型
// ============================================================================

/**
 * 全局变量类型
 *
 * 功能说明：
 * 定义全局变量的结构
 *
 * 全局变量的概念：
 * - 全局变量可在任意节点中使用
 * - 适用于常量配置（如税率、折扣率）
 * - 在项目级别定义，所有节点共享
 *
 * 示例：
 * {
 *   id: 'var_tax',
 *   name: '税率',
 *   type: 'number',
 *   value: 0.13,
 *   description: '增值税税率',
 * }
 */
export interface GlobalVariable {
  /**
   * 变量唯一标识符
   *
   * 格式：'var_' + 变量名
   * 示例：'var_tax'、'var_discount'
   */
  id: string;

  /**
   * 变量显示名称
   *
   * 用途：UI 显示
   * 示例：'税率'、'折扣率'、'运费'
   */
  name: string;

  /**
   * 变量数据类型
   *
   * 用于：
   * - 类型验证
   * - UI 显示类型标识
   */
  type: DataType;

  /**
   * 变量值
   *
   * 可以是任意类型，取决于 type
   */
  value: any;

  /**
   * 变量描述（可选）
   *
   * 用途：帮助用户理解变量用途
   */
  description?: string;
}

// ============================================================================
// 第八部分：执行结果类型
// ============================================================================

/**
 * 执行结果类型
 *
 * 功能说明：
 * 定义节点执行结果的结构
 *
 * 使用场景：
 * - 存储在 executionResults 中
 * - 返回给调用者
 */
export interface ExecutionResult {
  /**
   * 节点 ID
   *
   * 引用 FlowNode.id
   */
  nodeId: string;

  /**
   * 是否执行成功
   */
  success: boolean;

  /**
   * 执行输出
   */
  output: any;

  /**
   * 错误信息（仅在执行失败时存在）
   */
  error?: string;

  /**
   * 执行耗时（毫秒）
   */
  executionTime: number;
}

// ============================================================================
// 第九部分：公式编辑器类型
// ============================================================================

/**
 * 运算符类型
 *
 * 功能说明：
 * 定义支持的运算符
 */
export type OperatorType =
  | '+'    // 加法
  | '-'    // 减法
  | '*'    // 乘法
  | '/'    // 除法
  | '%'    // 取模
  | '^'    // 幂运算
  | '=='   // 等于
  | '!='   // 不等于
  | '>'    // 大于
  | '<'    // 小于
  | '>='   // 大于等于
  | '<='   // 小于等于
  | '&&'   // 逻辑与
  | '||';  // 逻辑或

/**
 * 公式节点类型
 *
 * 功能说明：
 * 定义公式表达式中的节点类型
 *
 * 可选值：
 * - 'variable': 变量节点（引用输入值）
 * - 'constant': 常量节点（字面量值）
 * - 'operator': 运算符节点（计算操作）
 * - 'function': 函数节点（内置函数）
 * - 'group': 分组节点（括号）
 * - 'output': 输出节点（目标字段）
 */
export type FormulaNodeType =
  | 'variable'   // 变量: inputs.price
  | 'constant'   // 常量: 100, "text"
  | 'operator'   // 运算符: +, -, *, /
  | 'function'   // 函数: sum(), avg(), if()
  | 'group'      // 分组: ( ... )
  | 'output';    // 输出字段

/**
 * 公式变量
 *
 * 功能说明：
 * 定义公式中可以使用的变量
 */
export interface FormulaVariable {
  /**
   * 变量 ID
   */
  id: string;

  /**
   * 显示名称
   *
   * 示例：'售价'、'成本'
   */
  name: string;

  /**
   * 变量键
   *
   * 用于在 inputs 中访问变量值
   * 示例：'price'、'cost'
   */
  key: string;

  /**
   * 数据类型
   */
  type: DataType;

  /**
   * 颜色标识（可选）
   *
   * 用于在公式编辑器中标识变量
   * 示例：'bg-green-500'
   */
  color?: string;
}

/**
 * 公式常量
 *
 * 功能说明：
 * 定义公式中的常量值
 */
export interface FormulaConstant {
  /**
   * 常量 ID
   */
  id: string;

  /**
   * 常量值
   */
  value: string | number;

  /**
   * 数据类型
   */
  type: DataType;
}

/**
 * 公式节点
 *
 * 功能说明：
 * 定义公式表达式的节点结构
 *
 * 公式以树形结构存储：
 * - 叶子节点：变量或常量
 * - 内部节点：运算符或函数
 *
 * 示例（计算利润）：
 * {
 *   id: 'expr',
 *   type: 'operator',
 *   value: '-',
 *   children: [
 *     { id: 'price', type: 'variable', value: 'price' },
 *     { id: 'cost', type: 'variable', value: 'cost' },
 *   ],
 * }
 */
export interface FormulaNode {
  /**
   * 节点 ID
   */
  id: string;

  /**
   * 节点类型
   */
  type: FormulaNodeType;

  /**
   * 节点值
   *
   * 用途取决于类型：
   * - variable: 变量键（'price'）
   * - constant: 常量值（100、"text"）
   * - operator: 运算符（'+'、'-'）
   * - function: 函数名（'sum'、'avg'）
   * - group: 分组标识
   * - output: 输出字段键
   */
  value?: string;

  /**
   * 子节点
   *
   * 用于：
   * - 运算符节点：存储操作数
   * - 函数节点：存储参数
   * - 分组节点：存储分组内容
   */
  children?: FormulaNode[];

  /**
   * 输出字段键（仅 output 类型使用）
   */
  outputKey?: string;
}

/**
 * 公式配置
 *
 * 功能说明：
 * 定义公式编辑器的完整配置
 */
export interface FormulaConfig {
  /**
   * 目标输出字段
   *
   * 指定公式结果存储到哪个输出端口
   */
  targetOutput: string;

  /**
   * 公式表达式树
   *
   * 存储完整的公式结构
   */
  expression: FormulaNode;

  /**
   * 格式模式（可选）
   *
   * 可选值：
   * - 'simple': 简单模式
   * - 'advanced': 进阶模式
   */
  format?: 'simple' | 'advanced';
}

/**
 * 公式模板
 *
 * 功能说明：
 * 定义可复用的公式模板
 */
export interface FormulaTemplate {
  /**
   * 模板 ID
   */
  id: string;

  /**
   * 模板名称
   */
  name: string;

  /**
   * 模板描述
   */
  description: string;

  /**
   * 模板分类
   */
  category: string;

  /**
   * 可用变量列表
   */
  variables: FormulaVariable[];

  /**
   * 输出字段列表
   */
  outputs: { id: string; name: string; type: DataType }[];

  /**
   * 默认表达式
   */
  defaultExpression: FormulaNode;
}
