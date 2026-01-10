/**
 * ============================================================================
 * 文件名：侧边栏.tsx
 * 功能描述：侧边栏组件，提供模块库、模板和设置等功能
 *
 * 本组件是应用的主要侧边栏，包含以下功能：
 * 1. 模块库：显示所有可用的模块，支持搜索和拖拽
 * 2. 模板：提供预设的项目模板，快速创建数据流
 * 3. 设置：项目配置、执行设置、导出设置
 *
 * 标签页结构：
 * - 模块库：显示模块列表，支持拖拽到画布
 * - 模板：显示预设模板，点击使用
 * - 设置：各种应用设置
 * ============================================================================
 */

// 导入 React 核心库和 useState Hook
import React, { useState } from 'react';

// 从状态管理导入全局状态和操作方法
import { useAppStore } from '@/store/index';

// 从 lucide-react 导入图标组件
import {
  Database,      // 数据库图标（输入模块）
  Filter,        // 过滤器图标（处理模块）
  Calculator,    // 计算器图标（计算模块）
  BarChart3,     // 图表图标（输出模块）
  Settings,      // 设置图标
  Search,        // 搜索图标
  Trash2,        // 删除图标
  Edit,          // 编辑图标
  Copy,          // 复制图标
  FileText,      // 文件图标
  TrendingUp,    // 上升趋势图标
  PieChart,      // 饼图图标
  Table,         // 表格图标
  CircleDot,     // 圆点图标
  DollarSign,    // 美元图标
} from 'lucide-react';

// 从类型定义导入类型
import type { ModuleDefinition, GlobalVariable, Project } from '@/types/index';

// ============================================================================
// 第一部分：预设项目模板
// ============================================================================

/**
 * 项目模板类型
 *
 * 定义预设项目模板的结构
 */
interface 项目模板类型 {
  id: string;                    // 模板唯一标识符
  name: string;                  // 模板名称
  description: string;           // 模板描述
  icon: React.ReactElement;      // 图标组件
  color: string;                 // 颜色类名
  nodes: Array<{                 // 节点列表
    id: string;                  // 节点 ID
    moduleId: string;            // 模块 ID
    position: { x: number; y: number };  // 位置
  }>;
  edges: Array<{                 // 连线列表
    id: string;                  // 连线 ID
    source: string;              // 源节点 ID
    target: string;              // 目标节点 ID
    sourceHandle: string;        // 源端口 ID
    targetHandle: string;        // 目标端口 ID
  }>;
}

/**
 * 预设项目模板列表
 *
 * 提供常用数据流场景的预设模板，用户可以快速使用
 */
const 项目模板: 项目模板类型[] = [
  {
    id: 'profit_analysis',       // 利润分析模板
    name: '利润分析',
    description: '分析产品成本、售价与利润关系',
    icon: <DollarSign className="w-5 h-5" />,  // 美元图标
    color: 'bg-green-500',       // 绿色主题
    // 节点：输入 -> 计算 -> 输出
    nodes: [
      { id: 'input1', moduleId: 'data_input', position: { x: 50, y: 200 } },
      { id: 'calc1', moduleId: 'profit_calculator', position: { x: 500, y: 200 } },
      { id: 'output1', moduleId: 'chart_output', position: { x: 950, y: 200 } },
    ],
    // 连线：输入的输出连接到计算的成本，计算的结果连接到输出
    edges: [
      { id: 'e1', source: 'input1', target: 'calc1', sourceHandle: 'output', targetHandle: 'cost' },
      { id: 'e2', source: 'calc1', target: 'output1', sourceHandle: 'profit', targetHandle: 'data' },
    ],
  },
  {
    id: 'data_pipeline',         // 数据处理流水线模板
    name: '数据处理流水线',
    description: '数据输入 -> 过滤 -> 聚合 -> 输出',
    icon: <CircleDot className="w-5 h-5" />,  // 圆点图标
    color: 'bg-blue-500',        // 蓝色主题
    // 节点：输入 -> 过滤 -> 聚合 -> 输出
    nodes: [
      { id: 'input1', moduleId: 'data_input', position: { x: 50, y: 200 } },
      { id: 'filter1', moduleId: 'data_filter', position: { x: 500, y: 200 } },
      { id: 'agg1', moduleId: 'data_aggregator', position: { x: 950, y: 200 } },
      { id: 'output1', moduleId: 'chart_output', position: { x: 1400, y: 200 } },
    ],
    // 连线：依次连接
    edges: [
      { id: 'e1', source: 'input1', target: 'filter1', sourceHandle: 'output', targetHandle: 'data' },
      { id: 'e2', source: 'filter1', target: 'agg1', sourceHandle: 'filtered_data', targetHandle: 'data' },
      { id: 'e3', source: 'agg1', target: 'output1', sourceHandle: 'aggregated_data', targetHandle: 'data' },
    ],
  },
  {
    id: 'pricing_strategy',      // 定价策略模板
    name: '定价策略分析',
    description: '基于成本和市场竞争制定最优定价',
    icon: <TrendingUp className="w-5 h-5" />,  // 上升趋势图标
    color: 'bg-purple-500',      // 紫色主题
    // 节点：ROI 计算 -> 定价 -> 条件判断
    nodes: [
      { id: 'roi1', moduleId: 'roi_calculator', position: { x: 50, y: 200 } },
      { id: 'price1', moduleId: 'pricing', position: { x: 500, y: 200 } },
      { id: 'cond1', moduleId: 'conditional', position: { x: 950, y: 200 } },
    ],
    // 连线
    edges: [
      { id: 'e1', source: 'roi1', target: 'price1', sourceHandle: 'roi', targetHandle: 'cost' },
      { id: 'e2', source: 'price1', target: 'cond1', sourceHandle: 'recommended_price', targetHandle: 'condition_value' },
    ],
  },
  {
    id: 'sales_dashboard',       // 销售数据看板模板
    name: '销售数据看板',
    description: '完整的销售数据可视化方案',
    icon: <PieChart className="w-5 h-5" />,  // 饼图图标
    color: 'bg-orange-500',      // 橙色主题
    // 节点：输入 -> 过滤 -> 聚合 -> 两个图表输出
    nodes: [
      { id: 'input1', moduleId: 'data_input', position: { x: 50, y: 100 } },
      { id: 'filter1', moduleId: 'data_filter', position: { x: 500, y: 100 } },
      { id: 'agg1', moduleId: 'data_aggregator', position: { x: 950, y: 100 } },
      { id: 'chart1', moduleId: 'chart_output', position: { x: 1400, y: 50 } },
      { id: 'chart2', moduleId: 'chart_output', position: { x: 1400, y: 180 } },
    ],
    // 连线：聚合结果连接到两个图表
    edges: [
      { id: 'e1', source: 'input1', target: 'filter1', sourceHandle: 'output', targetHandle: 'data' },
      { id: 'e2', source: 'filter1', target: 'agg1', sourceHandle: 'filtered_data', targetHandle: 'data' },
      { id: 'e3', source: 'agg1', target: 'chart1', sourceHandle: 'aggregated_data', targetHandle: 'data' },
      { id: 'e4', source: 'agg1', target: 'chart2', sourceHandle: 'aggregated_data', targetHandle: 'data' },
    ],
  },
];

// ============================================================================
// 第二部分：侧边栏组件属性接口
// ============================================================================

/**
 * 侧边栏组件属性接口
 */
interface 侧边栏Props {
  isOpen: boolean;  // 是否展开
}

// ============================================================================
// 第三部分：侧边栏主组件
// ============================================================================

/**
 * 侧边栏组件
 *
 * @param isOpen - 是否展开显示
 */
export const 侧边栏: React.FC<侧边栏Props> = ({ isOpen }) => {
  // 从全局状态获取状态和方法
  const {
    modules,                   // 模块列表
    globalVariables,           // 全局变量列表
    activeTab,                 // 当前活动标签页
    setActiveTab,              // 设置活动标签页方法
    registerModule,            // 注册模块方法
    updateModule,              // 更新模块方法
    deleteModule,              // 删除模块方法
    addGlobalVariable,         // 添加全局变量方法
    updateGlobalVariable,      // 更新全局变量方法
    deleteGlobalVariable,      // 删除全局变量方法
    loadProject,               // 加载项目方法
  } = useAppStore();

  // 搜索关键词状态
  const [searchTerm, setSearchTerm] = useState('');
  // 编辑中的模块 ID 状态
  const [editingModule, setEditingModule] = useState<string | null>(null);
  // 编辑中的变量 ID 状态
  const [editingVariable, setEditingVariable] = useState<string | null>(null);

  /**
   * 过滤模块列表
   *
   * 根据搜索关键词过滤模块
   */
  const filteredModules = modules.filter(module =>
    // 匹配模块名称或描述
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * 获取分类图标
   *
   * 根据模块分类返回对应的图标
   *
   * @param category - 模块分类
   * @returns 图标组件
   */
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'input':
        return <Database className="w-4 h-4" />;       // 输入模块
      case 'processing':
        return <Filter className="w-4 h-4" />;         // 处理模块
      case 'calculation':
        return <Calculator className="w-4 h-4" />;     // 计算模块
      case 'output':
        return <BarChart3 className="w-4 h-4" />;      // 输出模块
      default:
        return <Settings className="w-4 h-4" />;       // 默认
    }
  };

  /**
   * 获取分类颜色
   *
   * 根据模块分类返回对应的颜色类名
   *
   * @param category - 模块分类
   * @returns 颜色类名
   */
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'input':
        return 'bg-green-600';      // 绿色
      case 'processing':
        return 'bg-blue-600';       // 蓝色
      case 'calculation':
        return 'bg-purple-600';     // 紫色
      case 'output':
        return 'bg-orange-600';     // 橙色
      default:
        return 'bg-gray-600';       // 灰色
    }
  };

  /**
   * 开始拖拽模块
   *
   * 触发时机：用户开始拖拽模块时
   *
   * @param event - 拖拽事件
   * @param module - 模块定义
   */
  const onDragStart = (event: React.DragEvent, module: ModuleDefinition) => {
    // 设置拖拽数据
    event.dataTransfer.setData('application/reactflow', 'custom');
    event.dataTransfer.setData('moduleId', module.id);
    event.dataTransfer.effectAllowed = 'move';
  };

  /**
   * 添加全局变量
   *
   * 触发时机：用户点击添加变量按钮
   */
  const handleAddVariable = () => {
    // 创建新变量
    const newVariable: GlobalVariable = {
      id: `var_${Date.now()}`,      // 生成唯一 ID
      name: '新变量',                // 默认名称
      type: 'string',               // 默认类型
      value: '',                    // 默认值
      description: '',              // 默认描述
    };
    // 添加到全局状态
    addGlobalVariable(newVariable);
  };

  /**
   * 更新全局变量
   *
   * 触发时机：用户编辑变量时
   *
   * @param variableId - 变量 ID
   * @param field - 字段名
   * @param value - 新值
   */
  const handleUpdateVariable = (variableId: string, field: string, value: any) => {
    // 更新全局变量
    updateGlobalVariable(variableId, { [field]: value });
  };

  /**
   * 使用模板创建项目
   *
   * 触发时机：用户点击模板的使用按钮
   *
   * @param template - 项目模板
   */
  const handleUseTemplate = (template: 项目模板类型) => {
    // 构建节点数据
    const nodes = template.nodes.map((node, index) => {
      // 查找对应的模块定义
      const module = modules.find(m => m.id === node.moduleId);
      return {
        id: node.id,                              // 节点 ID
        type: 'custom' as const,                  // 节点类型
        position: node.position,                  // 位置
        data: {
          moduleId: node.moduleId,                // 模块 ID
          config: { ...module?.config },          // 模块配置
          label: module?.name || '未命名',         // 显示标签
          instanceId: `instance_${Date.now()}_${index}`,  // 实例 ID
          status: 'idle' as const,                // 初始状态
        },
      };
    });

    // 构建连线数据
    const edges = template.edges.map((edge) => ({
      id: edge.id,                                // 连线 ID
      source: edge.source,                        // 源节点
      target: edge.target,                        // 目标节点
      sourceHandle: edge.sourceHandle,            // 源端口
      targetHandle: edge.targetHandle,            // 目标端口
      type: 'smoothstep' as const,                // 连线类型
    }));

    // 创建项目对象
    const project: Project = {
      id: `project_${Date.now()}`,                // 项目 ID
      name: template.name,                        // 项目名称
      description: template.description,          // 项目描述
      nodes,                                      // 节点列表
      edges,                                      // 连线列表
      modules: modules,                           // 使用的模块
      globals: {},                                // 全局变量
      createdAt: new Date().toISOString(),        // 创建时间
      updatedAt: new Date().toISOString(),        // 更新时间
    };

    // 加载项目
    loadProject(project);
  };

  // 如果不展开，返回 null
  if (!isOpen) return null;

  // 渲染侧边栏
  return (
    // 侧边栏容器：固定宽度、深色背景、右侧边框
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
      {/* ==================== 标签页头部 ==================== */}
      <div className="flex border-b border-gray-700">
        {/* 模块库标签页按钮 */}
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'modules'
              ? 'bg-gray-700 text-white border-b-2 border-blue-500'  // 选中状态
              : 'text-gray-400 hover:text-white'                     // 未选中状态
          }`}
        >
          模块库
        </button>
        {/* 模板标签页按钮 */}
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'bg-gray-700 text-white border-b-2 border-blue-500'  // 选中状态
              : 'text-gray-400 hover:text-white'                     // 未选中状态
          }`}
        >
          模板
        </button>
        {/* 设置标签页按钮 */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-gray-700 text-white border-b-2 border-blue-500'  // 选中状态
              : 'text-gray-400 hover:text-white'                     // 未选中状态
          }`}
        >
          设置
        </button>
      </div>

      {/* ==================== 内容区域 ==================== */}
      <div className="flex-1 overflow-hidden">
        {/* ==================== 模块库标签页 ==================== */}
        {activeTab === 'modules' && (
          <div className="h-full flex flex-col">
            {/* 搜索框 */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                {/* 搜索图标 */}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                {/* 搜索输入框 */}
                <input
                  type="text"
                  placeholder="搜索模块..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 模块列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredModules.map((module) => (
                <div
                  key={module.id}                  // 唯一键
                  draggable                         // 允许拖拽
                  onDragStart={(event) => onDragStart(event, module)}  // 开始拖拽
                  className="p-3 bg-gray-700 rounded-lg border border-gray-600 cursor-move hover:border-gray-500 transition-colors"
                >
                  {/* 模块头部：色点、名称、版本 */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {/* 分类色点 */}
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(module.category)}`} />
                      {/* 模块名称 */}
                      <h3 className="font-medium text-white text-sm">{module.name}</h3>
                      {/* 版本号 */}
                      <span className="text-xs text-gray-400">v{module.version}</span>
                    </div>
                    {/* 操作按钮 */}
                    <div className="flex space-x-1">
                      {/* 编辑按钮 */}
                      <button
                        onClick={() => setEditingModule(module.id)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="编辑模块"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      {/* 删除按钮（非内置模块显示） */}
                      {!module.isBuiltIn && (
                        <button
                          onClick={() => deleteModule(module.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="删除模块"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* 模块描述 */}
                  <p className="text-xs text-gray-400 mb-2">{module.description}</p>
                  {/* 底部信息：分类、输入输出数量 */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{module.category}</span>
                    <div className="flex items-center space-x-2">
                      <span>{module.inputs.length} 输入</span>
                      <span>{module.outputs.length} 输出</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 模板标签页 ==================== */}
        {activeTab === 'templates' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <p className="text-xs text-gray-400">选择预设模板快速创建项目</p>
            </div>

            {/* 模板列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {项目模板.map((template) => (
                <div
                  key={template.id}
                  className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  {/* 模板头部：图标、名称、描述 */}
                  <div className="flex items-start space-x-3">
                    {/* 图标 */}
                    <div className={`w-10 h-10 rounded-lg ${template.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {template.icon}
                    </div>
                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                      {/* 统计信息 */}
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Table className="w-3 h-3 mr-1" />
                          {template.nodes.length} 个节点
                        </span>
                        <span className="flex items-center">
                          <Filter className="w-3 h-3 mr-1" />
                          {template.edges.length} 条连线
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* 使用模板按钮 */}
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full mt-3 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">使用此模板</span>
                  </button>
                </div>
              ))}

              {/* 自定义模板提示 */}
              <div className="p-4 bg-gray-700/50 rounded-lg border border-dashed border-gray-600">
                <div className="flex items-center space-x-2 text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs">保存当前项目为模板</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 设置标签页 ==================== */}
        {activeTab === 'settings' && (
          <div className="h-full p-4">
            <div className="space-y-6">
              {/* 项目设置 */}
              <div>
                <h3 className="text-white font-medium mb-3">项目设置</h3>
                <div className="space-y-3">
                  {/* 默认货币设置 */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">默认货币</label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                      <option value="CNY">人民币 (CNY)</option>
                      <option value="USD">美元 (USD)</option>
                      <option value="EUR">欧元 (EUR)</option>
                    </select>
                  </div>
                  {/* 小数位数设置 */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">小数位数</label>
                    <input
                      type="number"
                      min="0"
                      max="6"
                      defaultValue="2"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 执行设置 */}
              <div>
                <h3 className="text-white font-medium mb-3">执行设置</h3>
                <div className="space-y-3">
                  {/* 实时预览开关 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">实时预览</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  {/* 自动保存开关 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">自动保存</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  {/* 调试模式开关 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">调试模式</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>

              {/* 导出设置 */}
              <div>
                <h3 className="text-white font-medium mb-3">导出设置</h3>
                <div className="space-y-2">
                  {/* 导出项目 JSON */}
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                    导出项目JSON
                  </button>
                  {/* 导出模板 */}
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors">
                    导出模板
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
