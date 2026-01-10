import React, { useState } from 'react';
import { useAppStore } from '../store';
import {
  Database,
  Filter,
  Calculator,
  BarChart3,
  Settings,
  Search,
  Trash2,
  Edit,
  Copy,
  FileText,
  TrendingUp,
  PieChart,
  Table,
  CircleDot,
  DollarSign,
} from 'lucide-react';
import type { ModuleDefinition, GlobalVariable, Project } from '../types';

// 预设项目模板
const projectTemplates = [
  {
    id: 'profit_analysis',
    name: '利润分析',
    description: '分析产品成本、售价与利润关系',
    icon: <DollarSign className="w-5 h-5" />,
    color: 'bg-green-500',
    nodes: [
      { id: 'input1', moduleId: 'data_input', position: { x: 50, y: 200 } },
      { id: 'calc1', moduleId: 'profit_calculator', position: { x: 500, y: 200 } },
      { id: 'output1', moduleId: 'chart_output', position: { x: 950, y: 200 } },
    ],
    edges: [
      { id: 'e1', source: 'input1', target: 'calc1', sourceHandle: 'output', targetHandle: 'cost' },
      { id: 'e2', source: 'calc1', target: 'output1', sourceHandle: 'profit', targetHandle: 'data' },
    ],
  },
  {
    id: 'data_pipeline',
    name: '数据处理流水线',
    description: '数据输入 -> 过滤 -> 聚合 -> 输出',
    icon: <CircleDot className="w-5 h-5" />,
    color: 'bg-blue-500',
    nodes: [
      { id: 'input1', moduleId: 'data_input', position: { x: 50, y: 200 } },
      { id: 'filter1', moduleId: 'data_filter', position: { x: 500, y: 200 } },
      { id: 'agg1', moduleId: 'data_aggregator', position: { x: 950, y: 200 } },
      { id: 'output1', moduleId: 'chart_output', position: { x: 1400, y: 200 } },
    ],
    edges: [
      { id: 'e1', source: 'input1', target: 'filter1', sourceHandle: 'output', targetHandle: 'data' },
      { id: 'e2', source: 'filter1', target: 'agg1', sourceHandle: 'filtered_data', targetHandle: 'data' },
      { id: 'e3', source: 'agg1', target: 'output1', sourceHandle: 'aggregated_data', targetHandle: 'data' },
    ],
  },
  {
    id: 'pricing_strategy',
    name: '定价策略分析',
    description: '基于成本和市场竞争制定最优定价',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-purple-500',
    nodes: [
      { id: 'roi1', moduleId: 'roi_calculator', position: { x: 50, y: 200 } },
      { id: 'price1', moduleId: 'pricing', position: { x: 500, y: 200 } },
      { id: 'cond1', moduleId: 'conditional', position: { x: 950, y: 200 } },
    ],
    edges: [
      { id: 'e1', source: 'roi1', target: 'price1', sourceHandle: 'roi', targetHandle: 'cost' },
      { id: 'e2', source: 'price1', target: 'cond1', sourceHandle: 'recommended_price', targetHandle: 'condition_value' },
    ],
  },
  {
    id: 'sales_dashboard',
    name: '销售数据看板',
    description: '完整的销售数据可视化方案',
    icon: <PieChart className="w-5 h-5" />,
    color: 'bg-orange-500',
    nodes: [
      { id: 'input1', moduleId: 'data_input', position: { x: 50, y: 100 } },
      { id: 'filter1', moduleId: 'data_filter', position: { x: 500, y: 100 } },
      { id: 'agg1', moduleId: 'data_aggregator', position: { x: 950, y: 100 } },
      { id: 'chart1', moduleId: 'chart_output', position: { x: 1400, y: 50 } },
      { id: 'chart2', moduleId: 'chart_output', position: { x: 1400, y: 180 } },
    ],
    edges: [
      { id: 'e1', source: 'input1', target: 'filter1', sourceHandle: 'output', targetHandle: 'data' },
      { id: 'e2', source: 'filter1', target: 'agg1', sourceHandle: 'filtered_data', targetHandle: 'data' },
      { id: 'e3', source: 'agg1', target: 'chart1', sourceHandle: 'aggregated_data', targetHandle: 'data' },
      { id: 'e4', source: 'agg1', target: 'chart2', sourceHandle: 'aggregated_data', targetHandle: 'data' },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const {
    modules,
    globalVariables,
    activeTab,
    setActiveTab,
    registerModule,
    updateModule,
    deleteModule,
    addGlobalVariable,
    updateGlobalVariable,
    deleteGlobalVariable,
    loadProject,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingVariable, setEditingVariable] = useState<string | null>(null);

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'input':
        return <Database className="w-4 h-4" />;
      case 'processing':
        return <Filter className="w-4 h-4" />;
      case 'calculation':
        return <Calculator className="w-4 h-4" />;
      case 'output':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'input':
        return 'bg-green-600';
      case 'processing':
        return 'bg-blue-600';
      case 'calculation':
        return 'bg-purple-600';
      case 'output':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  };

  const onDragStart = (event: React.DragEvent, module: ModuleDefinition) => {
    event.dataTransfer.setData('application/reactflow', 'custom');
    event.dataTransfer.setData('moduleId', module.id);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddVariable = () => {
    const newVariable: GlobalVariable = {
      id: `var_${Date.now()}`,
      name: '新变量',
      type: 'string',
      value: '',
      description: '',
    };
    addGlobalVariable(newVariable);
  };

  const handleUpdateVariable = (variableId: string, field: string, value: any) => {
    updateGlobalVariable(variableId, { [field]: value });
  };

  // 使用模板创建项目
  const handleUseTemplate = (template: typeof projectTemplates[0]) => {
    // 构建节点数据
    const nodes = template.nodes.map((node, index) => {
      const module = modules.find(m => m.id === node.moduleId);
      return {
        id: node.id,
        type: 'custom' as const,
        position: node.position,
        data: {
          moduleId: node.moduleId,
          config: { ...module?.config },
          label: module?.name || '未命名',
          instanceId: `instance_${Date.now()}_${index}`,
          status: 'idle' as const,
        },
      };
    });

    // 构建连线数据
    const edges = template.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: 'smoothstep' as const,
    }));

    // 创建项目
    const project: Project = {
      id: `project_${Date.now()}`,
      name: template.name,
      description: template.description,
      nodes,
      edges,
      modules: modules,
      globals: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    loadProject(project);
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
      {/* 标签页头部 */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'modules'
              ? 'bg-gray-700 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          模块库
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'bg-gray-700 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          模板
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-gray-700 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          设置
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* 模块库标签页 */}
        {activeTab === 'modules' && (
          <div className="h-full flex flex-col">
            {/* 搜索框 */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                  key={module.id}
                  draggable
                  onDragStart={(event) => onDragStart(event, module)}
                  className="p-3 bg-gray-700 rounded-lg border border-gray-600 cursor-move hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(module.category)}`} />
                      <h3 className="font-medium text-white text-sm">{module.name}</h3>
                      <span className="text-xs text-gray-400">v{module.version}</span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingModule(module.id)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="编辑模块"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
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
                  <p className="text-xs text-gray-400 mb-2">{module.description}</p>
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

        {/* 模板标签页 */}
        {activeTab === 'templates' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <p className="text-xs text-gray-400">选择预设模板快速创建项目</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {projectTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${template.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {template.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{template.description}</p>
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

        {/* 设置标签页 */}
        {activeTab === 'settings' && (
          <div className="h-full p-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-3">项目设置</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">默认货币</label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                      <option value="CNY">人民币 (CNY)</option>
                      <option value="USD">美元 (USD)</option>
                      <option value="EUR">欧元 (EUR)</option>
                    </select>
                  </div>
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

              <div>
                <h3 className="text-white font-medium mb-3">执行设置</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">实时预览</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">自动保存</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">调试模式</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-3">导出设置</h3>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                    导出项目JSON
                  </button>
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
