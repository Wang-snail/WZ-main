import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GripHorizontal, Play, Settings, Menu, Search, ChevronDown, ChevronRight, Box, Type, FileText, Database, Cpu, HardDrive } from 'lucide-react';

// 定义节点数据结构
interface BatteryData {
  id: string;
  name: string;
  type: 'csv' | 'json' | 'excel' | 'text';
  level: number; // 电量
  content?: string;
  selectedDataTypes?: string[]; // 新增：记录用户选择的数据类型
}

// 文件解析结果类型
interface FileParseResult {
  file_id: string;
  file_name: string;
  file_type: string;
  detected_energy: {
    key: string;
    label: string;
    preview: string;
    available: boolean;
  }[];
}

// 数据类型选项接口
interface DataTypeOption {
  id: string;
  label: string;
  type: string;
}

// 工作流节点类型
interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label?: string;
    [key: string]: any;
  };
}

// 连接类型
interface Connection {
  id: string;
  sourceNodeId: string;
  sourceHandle: string;
  targetNodeId: string;
  targetHandle: string;
}

// 视口类型
interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

// 拖拽项类型
type DragItem = 
  | { type: 'pane'; startX: number; startY: number; viewStartX: number; viewStartY: number }
  | { type: 'node'; id: string; offsetX: number; offsetY: number }
  | { type: 'connection'; sourceNodeId: string; sourceHandle: string; x: number; y: number }
  | null;

// 模拟文件分析函数
const mockAnalyzeFile = async (fileType: string, fileName: string): Promise<DataTypeOption[]> => {
  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 模拟后端解析结果
  const parseResult: FileParseResult = {
    file_id: `battery_${Date.now()}`,
    file_name: fileName,
    file_type: fileType,
    detected_energy: []
  };
  
  switch(fileType) {
    case 'csv':
      parseResult.detected_energy = [
        {
          key: "reviews",
          label: "评论数据",
          preview: "Great product, fast delivery...",
          available: true
        },
        {
          key: "sales",
          label: "销量趋势",
          preview: "Calculable from Column C",
          available: true
        },
        {
          key: "return_rate",
          label: "退货率",
          preview: "Calculable from Column D",
          available: true
        },
        {
          key: "features",
          label: "产品特点",
          preview: "20W fast charging, 20000mAh capacity",
          available: true
        }
      ];
      break;
    case 'json':
      parseResult.detected_energy = [
        {
          key: "features",
          label: "产品特点",
          preview: "{ type: 'power_bank', capacity: '20000mAh' }",
          available: true
        },
        {
          key: "metadata",
          label: "元数据",
          preview: "{ created: '2023-01-01', version: '1.0' }",
          available: true
        },
        {
          key: "reviews",
          label: "评论数据", 
          preview: "[{ rating: 5, comment: 'Excellent!' }, ...]",
          available: true
        }
      ];
      break;
    case 'excel':
      parseResult.detected_energy = [
        {
          key: "reviews",
          label: "评论数据",
          preview: "Great capacity but heavy...",
          available: true
        },
        {
          key: "specs", 
          label: "产品特点",
          preview: "20000mAh, USB-C",
          available: true
        },
        {
          key: "return_rate",
          label: "退货率", 
          preview: "Calculable from Column F",
          available: true
        }
      ];
      break;
    case 'text':
      parseResult.detected_energy = [
        {
          key: "comments",
          label: "评论数据",
          preview: "The product is good but could be improved...",
          available: true
        },
        {
          key: "keywords",
          label: "关键词",
          preview: "good, quality, recommend, fast charging",
          available: true
        }
      ];
      break;
    default:
      parseResult.detected_energy = [
        {
          key: "reviews",
          label: "评论数据",
          preview: "Standard review content...",
          available: true
        }
      ];
  }
  
  // 转换为选项格式
  return parseResult.detected_energy
    .filter(item => item.available)
    .map(item => ({
      id: item.key,
      label: `${item.label} (${item.preview.substring(0, 15)}...)`,
      type: item.label
    }));
};

// 节点类型定义
const NODE_TYPES: Record<string, {
  title: string;
  category: string;
  color: string;
  inputs: { name: string; label: string; type: string }[];
  outputs: { name: string; label: string; type: string }[];
}> = {
  'battery': {
    title: '数据电池',
    category: '输入',
    color: 'border-blue-500',
    inputs: [],
    outputs: [
      { name: 'data', label: '数据输出', type: 'any' }
    ]
  },
  'processor': {
    title: '数据处理器',
    category: '处理',
    color: 'border-yellow-500',
    inputs: [
      { name: 'input', label: '数据输入', type: 'any' }
    ],
    outputs: [
      { name: 'output', label: '处理后数据', type: 'any' }
    ]
  },
  'analyzer': {
    title: '数据分析器',
    category: '处理',
    color: 'border-green-500',
    inputs: [
      { name: 'input', label: '数据输入', type: 'any' }
    ],
    outputs: [
      { name: 'output', label: '分析结果', type: 'any' }
    ]
  },
  'exporter': {
    title: '数据导出器',
    category: '输出',
    color: 'border-red-500',
    inputs: [
      { name: 'input', label: '数据输入', type: 'any' }
    ],
    outputs: []
  }
};

// 生成唯一ID的函数
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 贝塞尔曲线路径生成函数
const getBezierPath = (x1: number, y1: number, x2: number, y2: number, sourcePos: string, targetPos: string) => {
  const cpx1 = x1 + (sourcePos === 'right' ? 80 : -80);
  const cpy1 = y1;
  const cpx2 = x2 + (targetPos === 'right' ? 80 : -80);
  const cpy2 = y2;
  
  return `M ${x1} ${y1} C ${cpx1} ${cpy1} ${cpx2} ${cpy2} ${x2} ${y2}`;
};

// 屏幕坐标转换为世界坐标的函数
const screenToWorld = (screenX: number, screenY: number, viewportX: number, viewportY: number, zoom: number) => {
  return {
    x: (screenX - viewportX) / zoom,
    y: (screenY - viewportY) / zoom
  };
};

// 数据提取选择器弹窗组件
interface DataExtractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceNode: WorkflowNode | null;
  onConfirm: (selectedTypes: string[]) => void;
  dataTypeOptions: DataTypeOption[];
}

const DataExtractionDialog: React.FC<DataExtractionDialogProps> = ({
  open,
  onOpenChange,
  sourceNode,
  onConfirm,
  dataTypeOptions
}) => {
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  
  // 当弹窗打开时，初始化选项（默认全选）
  useEffect(() => {
    if (open && dataTypeOptions.length > 0) {
      setSelectedDataTypes(dataTypeOptions.map(option => option.id));
    }
  }, [open, dataTypeOptions]);

  const handleCheckboxChange = (id: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(id) 
        ? prev.filter(typeId => typeId !== id) 
        : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedDataTypes);
    onOpenChange(false);
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${open ? 'block' : 'hidden'}`}>
      <div className="bg-[#252525] rounded-lg shadow-xl w-full max-w-md p-6 border border-[#333]">
        <h3 className="text-lg font-bold text-gray-200 mb-4">数据预处理</h3>
        
        <div className="mb-4">
          <p className="text-gray-400">输入源：<span className="font-medium text-white">{sourceNode?.data?.label}</span></p>
        </div>
        
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-300 mb-3">选择要提取的数据类型：</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {dataTypeOptions.map((option) => (
              <div key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={option.id}
                  checked={selectedDataTypes.includes(option.id)}
                  onChange={() => handleCheckboxChange(option.id)}
                  className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 bg-[#333] border-[#555]"
                />
                <label htmlFor={option.id} className="ml-2 text-gray-400">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-[#333] rounded-md text-gray-300 hover:bg-[#333] hover:text-white"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            确认连接
          </button>
        </div>
      </div>
    </div>
  );
};

// 节点组件
interface NodeComponentProps {
  node: WorkflowNode;
  selected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onHandleMouseDown: (e: React.MouseEvent, nodeId: string, handleName: string, type: 'input' | 'output', isLeft: boolean) => void;
  onNodeClick: (e: React.MouseEvent, nodeId: string) => void; // 新增点击事件
  onDelete?: () => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({ node, selected, onMouseDown, onHandleMouseDown, onNodeClick, onDelete }) => {
  const nodeType = NODE_TYPES[node.type];
  if (!nodeType) return null;

  // 根据文件类型选择颜色
  const getColorClass = () => {
    if (node.type === 'battery') {
      const batteryData = node.data as BatteryData;
      switch(batteryData.type) {
        case 'csv': return 'from-blue-600 to-blue-700';
        case 'json': return 'from-green-600 to-green-700';
        case 'excel': return 'from-yellow-600 to-yellow-700';
        case 'text': return 'from-purple-600 to-purple-700';
        default: return 'from-gray-600 to-gray-700';
      }
    }
    return 'from-gray-600 to-gray-700';
  };

  return (
    <div
      className={`absolute flex flex-col rounded-lg shadow-xl backdrop-blur-sm transition-shadow duration-200 group
        ${selected ? 'ring-2 ring-purple-500 shadow-purple-900/20' : 'border border-[#333] shadow-black/50'}
        bg-[#1e1e1e]/90 w-64 select-none`}
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        zIndex: selected ? 50 : 10
      }}
      onMouseDown={onMouseDown}
      onClick={(e) => onNodeClick(e, node.id)}
    >
      {/* Header */}
      <div className={`h-2 rounded-t-lg bg-gradient-to-r ${getColorClass()}`}></div>
      <div className="px-3 py-2 border-b border-[#333] flex justify-between items-center bg-[#252525]/50">
        <span className="text-sm font-bold text-gray-200 truncate pr-2">{node.data.label || nodeType.title}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="text-gray-500 hover:text-white p-0.5 rounded hover:bg-gray-700">
             <GripHorizontal size={12} />
          </button>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-gray-500 hover:text-red-400 p-0.5 rounded hover:bg-gray-700"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-4 relative">
        {/* Render Inputs */}
        <div className="space-y-3">
          {nodeType.inputs.map((input, idx) => (
            <div key={input.name} className="flex items-center relative h-5">
              {/* Input Handle */}
              <div
                className="absolute -left-[19px] w-4 h-4 rounded-full bg-[#0f0f0f] border-2 border-[#555] hover:border-purple-400 hover:scale-110 transition-all cursor-crosshair z-20 flex items-center justify-center"
                onMouseDown={(e) => onHandleMouseDown(e, node.id, input.name, 'input', true)}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#333]"></div>
              </div>

              <span className="text-xs text-gray-400 ml-1 font-medium">{input.label || input.name}</span>
              <span className="text-[10px] text-gray-600 uppercase ml-auto">{input.type}</span>
            </div>
          ))}
        </div>

        {/* Render Outputs */}
        <div className="space-y-3 text-right">
          {nodeType.outputs.map((output, idx) => (
            <div key={output.name} className="flex items-center justify-end relative h-5">
              <span className="text-[10px] text-gray-600 uppercase mr-auto">{output.type}</span>
              <span className="text-xs text-gray-400 mr-1 font-medium">{output.label || output.name}</span>

              {/* Output Handle */}
              <div
                className="absolute -right-[19px] w-4 h-4 rounded-full bg-[#0f0f0f] border-2 border-[#555] hover:border-purple-400 hover:scale-110 transition-all cursor-crosshair z-20 flex items-center justify-center"
                onMouseDown={(e) => onHandleMouseDown(e, node.id, output.name, 'output', false)}
              >
                 <div className="w-1.5 h-1.5 rounded-full bg-[#333]"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Params */}
      <div className="px-3 py-2 bg-[#151515]/50 border-t border-[#333] rounded-b-lg">
         <div className="flex items-center justify-center text-gray-600 hover:text-gray-400 cursor-pointer">
            <GripHorizontal size={12} />
         </div>
      </div>
    </div>
  );
};

// 头部组件
const Header: React.FC = () => {
  return (
    <header className="h-14 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-4 z-50 sticky top-0">
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white lg:hidden">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 font-bold text-white text-lg tracking-tight">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h20"/>
              <path d="M14 4l-8 8 8 8"/>
            </svg>
          </div>
          Data<span className="text-purple-400">Flow</span>
        </div>

        <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 bg-[#252525] rounded-full border border-[#333]">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-gray-300 font-medium">就绪</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded-md transition-colors text-sm font-medium border border-[#3a3a3a]">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          导出
        </button>
        <button className="flex items-center gap-2 px-5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-lg shadow-purple-900/20 transition-all transform active:scale-95 text-sm font-bold">
          <Play size={14} fill="currentColor" />
          运行流程
        </button>
        <div className="h-6 w-px bg-[#333] mx-1"></div>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-[#252525] rounded-full transition-colors">
          <Settings size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-[#1a1a1a] cursor-pointer"></div>
      </div>
    </header>
  );
};

// 侧边栏组件
interface SidebarProps {
  onAddNode: (type: string, x: number, y: number) => void;
}

const CategoryItem: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean
}> = ({ title, icon, children, isOpen: defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-gray-400 hover:text-white hover:bg-[#252525] rounded-md transition-colors text-sm font-medium group"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="group-hover:translate-x-0.5 transition-transform">{title}</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {isOpen && (
        <div className="ml-2 pl-2 border-l border-[#333] mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

const NodeDragItem: React.FC<{ type: string; label: string; onAdd: () => void }> = ({ type, label, onAdd }) => {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/reactflow/type', type);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={onAdd}
      className="flex items-center px-3 py-1.5 text-sm text-gray-400 hover:text-purple-300 hover:bg-[#2a2a2a] rounded cursor-grab active:cursor-grabbing transition-colors"
    >
      <div className="w-2 h-2 rounded-full bg-[#444] mr-2"></div>
      {label}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  // Group nodes by category
  const categories: Record<string, string[]> = {};
  Object.keys(NODE_TYPES).forEach(type => {
    const cat = NODE_TYPES[type].category;
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(type);
  });

  const getIconForCategory = (cat: string) => {
    switch(cat) {
      case '输入': return <HardDrive size={16} />;
      case '处理': return <Cpu size={16} />;
      case '输出': return <Database size={16} />;
      case '图像': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
      case '条件/提示词': return <Type size={16} />;
      default: return <Box size={16} />;
    }
  };

  return (
    <aside className="w-64 bg-[#141414] border-r border-[#2a2a2a] flex flex-col h-full shrink-0 select-none">
      <div className="p-4 border-b border-[#2a2a2a]">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="搜索节点..."
            className="w-full bg-[#0a0a0a] border border-[#333] rounded-md py-1.5 pl-9 pr-3 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 mt-2">组件库</div>

        {Object.entries(categories).map(([cat, types]) => (
          <CategoryItem key={cat} title={cat} icon={getIconForCategory(cat)} isOpen={cat === '输入' || cat === '处理'}>
            {types.map(type => (
              <NodeDragItem
                key={type}
                type={type}
                label={NODE_TYPES[type].title}
                onAdd={() => onAddNode(type, 100, 100)} // Default add for click
              />
            ))}
          </CategoryItem>
        ))}
      </div>

      <div className="p-4 border-t border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="text-xs text-gray-500 mb-2">工作区存储</div>
        <div className="w-full bg-[#333] h-1.5 rounded-full overflow-hidden">
          <div className="bg-purple-500 w-[45%] h-full rounded-full"></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">4.5 GB 已用</span>
          <span className="text-[10px] text-gray-400">10 GB 总量</span>
        </div>
      </div>
    </aside>
  );
};

// 画布组件
interface CanvasProps {
  nodes: WorkflowNode[];
  connections: Connection[];
  setNodes: React.Dispatch<React.SetStateAction<WorkflowNode[]>>;
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
}

const Canvas: React.FC<CanvasProps> = ({ nodes, connections, setNodes, setConnections }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [dragItem, setDragItem] = useState<DragItem>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Connection Draft State - 新的连接状态管理
  const [connectionStart, setConnectionStart] = useState<{
    nodeId: string;
    handleId: string;
    x: number;
    y: number;
  } | null>(null);
  const [connectionEnd, setConnectionEnd] = useState<{x: number, y: number} | null>(null);

  // 数据提取对话框相关状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSourceNode, setDialogSourceNode] = useState<WorkflowNode | null>(null);
  const [dataTypeOptions, setDataTypeOptions] = useState<DataTypeOption[]>([]);

  // 处理连接确认
  const handleConfirmConnection = useCallback((selectedTypes: string[]) => {
    if (dialogSourceNode) {
      // 更新节点的数据类型选择
      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === dialogSourceNode.id 
            ? { ...node, data: { ...node.data, selectedDataTypes: selectedTypes } } 
            : node
        )
      );
    }
  }, [dialogSourceNode, setNodes]);

  // Handle Wheel Zoom & Pan
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const newZoom = Math.min(Math.max(0.1, viewport.zoom - e.deltaY * zoomSensitivity), 3);
      setViewport(prev => ({ ...prev, zoom: newZoom }));
    } else {
      setViewport(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  }, [viewport]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // 如果正在连接中，取消连接
    if (connectionStart) {
      setConnectionStart(null);
      setConnectionEnd(null);
      return;
    }

    // Button 0 = Left Click, Button 1 = Middle Click
    const isLeftClick = e.button === 0;
    const isMiddleClick = e.button === 1;

    // Pan if middle click OR if left click on empty background
    const isBackgroundClick = e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-bg';

    if (isMiddleClick || (isLeftClick && isBackgroundClick)) {
      if (isMiddleClick) e.preventDefault(); // Prevent scroll icon

      setSelectedNodeId(null);
      setDragItem({
        type: 'pane',
        startX: e.clientX,
        startY: e.clientY,
        viewStartX: viewport.x,
        viewStartY: viewport.y
      });
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 更新临时连接终点位置
    if (connectionStart) {
      const worldPos = screenToWorld(e.clientX, e.clientY, viewport.x, viewport.y, viewport.zoom);
      setConnectionEnd({ x: worldPos.x, y: worldPos.y });
    }
    
    if (!dragItem) return;

    if (dragItem?.type === 'pane') {
      const dx = e.clientX - dragItem.startX;
      const dy = e.clientY - dragItem.startY;
      setViewport({
        ...viewport,
        x: dragItem.viewStartX + dx,
        y: dragItem.viewStartY + dy
      });
    } else if (dragItem?.type === 'node') {
      const worldPos = screenToWorld(e.clientX, e.clientY, viewport.x, viewport.y, viewport.zoom);

      setNodes(prev => prev.map(n => {
        if (n.id === dragItem.id) {
          return {
            ...n,
            position: {
              x: worldPos.x - dragItem.offsetX,
              y: worldPos.y - dragItem.offsetY
            }
          };
        }
        return n;
      }));
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setDragItem(null);
  };

  const handleHandleMouseDown = (e: React.MouseEvent, nodeId: string, handleName: string, type: 'input' | 'output', isLeft: boolean) => {
    e.stopPropagation();
    e.preventDefault();

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // 计算句柄的世界坐标
    const nodeType = NODE_TYPES[node.type];
    if (!nodeType) return;

    // 根据句柄类型计算句柄在世界坐标中的位置
    let handleX = node.position.x;
    let handleY = node.position.y;

    if (type === 'output') {
      // 输出句柄在节点右侧
      handleX += 256; // 节点宽度
      const outIdx = nodeType.outputs.findIndex(o => o.name === handleName);
      if (outIdx !== -1) {
        handleY += 44 + (nodeType.inputs.length * 32) + 12 + (outIdx * 32) + 10;
      }
    } else {
      // 输入句柄在节点左侧
      const inIdx = nodeType.inputs.findIndex(i => i.name === handleName);
      if (inIdx !== -1) {
        handleY += 44 + (inIdx * 32) + 10;
      }
    }

    // 如果是电池节点，打开数据提取对话框
    if (node.type === 'battery') {
      setDialogSourceNode(node);
      mockAnalyzeFile(node.data.type, node.data.name).then(options => {
        setDataTypeOptions(options);
        setDialogOpen(true);
      });
      return;
    }

    // 设置连接起点
    setConnectionStart({
      nodeId: nodeId,
      handleId: handleName,
      x: handleX,
      y: handleY
    });
    setConnectionEnd({ x: handleX, y: handleY });
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();

    // 如果正在连接中且点击了另一个节点，则完成连接
    if (connectionStart && connectionStart.nodeId !== nodeId) {
      const sourceNode = nodes.find(n => n.id === connectionStart.nodeId);
      const targetNode = nodes.find(n => n.id === nodeId);

      if (sourceNode && targetNode) {
        // 检查连接是否有效（从输出到输入）
        const sourceNodeType = NODE_TYPES[sourceNode.type];
        const targetNodeType = NODE_TYPES[targetNode.type];

        if (sourceNodeType && targetNodeType) {
          // 检查是否已有相同连接
          const exists = connections.some(c =>
            c.sourceNodeId === connectionStart.nodeId &&
            c.sourceHandle === connectionStart.handleId &&
            c.targetNodeId === nodeId &&
            c.targetHandle === 'input'
          );

          if (!exists) {
            const newConn: Connection = {
              id: generateId(),
              sourceNodeId: connectionStart.nodeId,
              sourceHandle: connectionStart.handleId,
              targetNodeId: nodeId,
              targetHandle: 'input'
            };
            setConnections(prev => [...prev, newConn]);
          }
        }
      }

      // 重置连接状态
      setConnectionStart(null);
      setConnectionEnd(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow/type');

    if (type && NODE_TYPES[type]) {
      const worldPos = screenToWorld(e.clientX, e.clientY, viewport.x, viewport.y, viewport.zoom);

      let newNode: WorkflowNode;
      if (type === 'battery') {
        // 默认电池数据
        const defaultBatteryData: BatteryData = {
          id: `battery-${Date.now()}`,
          name: `新数据电池_${nodes.filter(n => n.type === 'battery').length + 1}.json`,
          type: 'json',
          level: 100,
          content: '',
          selectedDataTypes: ['reviews', 'features'] // 默认选中
        };
        
        newNode = {
          id: generateId(),
          type,
          position: { x: worldPos.x - 100, y: worldPos.y - 20 },
          data: defaultBatteryData
        };
      } else {
        newNode = {
          id: generateId(),
          type,
          position: { x: worldPos.x - 100, y: worldPos.y - 20 },
          data: {
            label: NODE_TYPES[type].title
          }
        };
      }

      setNodes(prev => [...prev, newNode]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.sourceNodeId !== id && c.targetNodeId !== id));
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-[#101010] relative overflow-hidden cursor-grab active:cursor-grabbing"
      id="canvas-bg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* 数据提取对话框 */}
      <DataExtractionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sourceNode={dialogSourceNode}
        onConfirm={handleConfirmConnection}
        dataTypeOptions={dataTypeOptions}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#555 1px, transparent 1px)',
          backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
          backgroundPosition: `${viewport.x}px ${viewport.y}px`
        }}
      />

      <div
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <svg className="absolute top-0 left-0 w-[50000px] h-[50000px] pointer-events-none overflow-visible -z-10">
          {connections.map(conn => {
            const source = nodes.find(n => n.id === conn.sourceNodeId);
            const target = nodes.find(n => n.id === conn.targetNodeId);
            if (!source || !target) return null;

            const sourceType = NODE_TYPES[source.type];
            const targetType = NODE_TYPES[target.type];

            // Calculate positions
            const sOutIdx = sourceType.outputs.findIndex(o => o.name === conn.sourceHandle);
            const tInIdx = targetType.inputs.findIndex(i => i.name === conn.targetHandle);

            const sy = 44 + (sourceType.inputs.length * 32) + 12 + (sOutIdx * 32) + 10;
            const ty = 44 + (tInIdx * 32) + 10;

            const x1 = source.position.x + 256;
            const y1 = source.position.y + sy;
            const x2 = target.position.x;
            const y2 = target.position.y + ty;

            return (
              <path
                key={conn.id}
                d={getBezierPath(x1, y1, x2, y2, 'right', 'left')}
                stroke="#64748b"
                strokeWidth="2"
                fill="none"
                className="hover:stroke-purple-400 hover:stroke-[3px] transition-colors"
              />
            );
          })}

          {/* 绘制正在创建的连接线 */}
          {connectionStart && connectionEnd && (
            <path
              d={getBezierPath(
                connectionStart.x, 
                connectionStart.y, 
                connectionEnd.x, 
                connectionEnd.y, 
                'right', 
                'left'
              )}
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
            />
          )}
        </svg>

        {nodes.map(node => (
          <NodeComponent
            key={node.id}
            node={node}
            selected={selectedNodeId === node.id}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            onHandleMouseDown={handleHandleMouseDown}
            onNodeClick={handleNodeClick}
            onDelete={() => deleteNode(node.id)}
          />
        ))}
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-50">
         <button onClick={() => setViewport(v => ({...v, zoom: v.zoom + 0.1}))} className="p-2 bg-[#2a2a2a] text-white rounded hover:bg-[#333] border border-[#444] shadow-lg">+</button>
         <button onClick={() => setViewport(v => ({...v, zoom: v.zoom - 0.1}))} className="p-2 bg-[#2a2a2a] text-white rounded hover:bg-[#333] border border-[#444] shadow-lg">-</button>
         <button onClick={() => setViewport({x:0,y:0,zoom:1})} className="p-2 bg-[#2a2a2a] text-white rounded hover:bg-[#333] border border-[#444] shadow-lg text-xs">R</button>
      </div>
    </div>
  );
};

const DataProcessingFactory: React.FC = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const addNode = (type: string, x: number, y: number) => {
    let newNode: WorkflowNode;
    
    if (type === 'battery') {
      // 默认电池数据
      const defaultBatteryData: BatteryData = {
        id: `battery-${Date.now()}`,
        name: `新数据电池_${nodes.filter(n => n.type === 'battery').length + 1}.json`,
        type: 'json',
        level: 100,
        content: '',
        selectedDataTypes: ['reviews', 'features'] // 默认选中
      };
      
      newNode = {
        id: generateId(),
        type,
        position: { x, y },
        data: defaultBatteryData
      };
    } else {
      newNode = {
        id: generateId(),
        type,
        position: { x, y },
        data: {
          label: NODE_TYPES[type].title
        }
      };
    }
    
    setNodes((prev) => [...prev, newNode]);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0f0f0f] text-gray-200">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onAddNode={addNode} />
        <Canvas
          nodes={nodes}
          connections={connections}
          setNodes={setNodes}
          setConnections={setConnections}
        />
      </div>
    </div>
  );
};

export default DataProcessingFactory;