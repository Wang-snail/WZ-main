import { useState, useRef, useEffect } from 'react';
import { Network, Bell, HelpCircle, Save, Play, Search, Plus, History, Share2, Settings2, X, Send, ChevronDown, Edit3, Database, Calculator, DollarSign, Truck, Megaphone, Wallet, MoreVertical } from 'lucide-react';
import TopNavBar from '../components/TopNavBar';
import ResizableSidebar from '../components/ResizableSidebar';

export default function FlowEditor({ currentPath, onNavigate }: { currentPath: string, onNavigate: (path: string) => void }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const [nodes, setNodes] = useState([
    { id: 'node1', x: 100, y: 80 },
    { id: 'node2', x: 470, y: 280 }
  ]);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [nodeDragOffset, setNodeDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const zoomSensitivity = 0.005;
        const delta = -e.deltaY * zoomSensitivity;
        const newScale = Math.min(Math.max(0.2, scale + delta), 3);
        
        // Zoom towards cursor
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scaleRatio = newScale / scale;
        const newX = mouseX - (mouseX - position.x) * scaleRatio;
        const newY = mouseY - (mouseY - position.y) * scaleRatio;

        setScale(newScale);
        setPosition({ x: newX, y: newY });
      } else {
        // Pan
        setPosition(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [scale, position]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingNode) {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        
        const mouseX = (e.clientX - rect.left - position.x) / scale;
        const mouseY = (e.clientY - rect.top - position.y) / scale;

        let newX = mouseX - nodeDragOffset.x;
        let newY = mouseY - nodeDragOffset.y;

        // Snapping to 20px grid
        newX = Math.round(newX / 20) * 20;
        newY = Math.round(newY / 20) * 20;

        setNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x: newX, y: newY } : n));
      } else if (isPanning) {
        setPosition({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      setDraggingNode(null);
    };

    if (isPanning || draggingNode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, draggingNode, panStart, nodeDragOffset, scale, position]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-element')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).closest('.node-element')?.getBoundingClientRect();
    if (rect) {
      setDraggingNode(id);
      setNodeDragOffset({
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-surface font-body text-on-surface overflow-hidden">
      {/* Top Nav */}
      <TopNavBar 
        currentPath={currentPath} 
        onNavigate={onNavigate} 
        className="w-full z-50 bg-white border-b border-outline-variant/10 shadow-sm shrink-0"
        rightContent={
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-surface-container-high rounded-lg px-3 py-1.5">
              <Search size={16} className="text-outline" />
              <input type="text" placeholder="搜索流程..." className="bg-transparent border-none focus:ring-0 text-sm w-40 text-on-surface placeholder-outline ml-2 outline-none" />
            </div>
            <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-error rounded-full border border-white"></span>
            </button>
            <div className="w-7 h-7 rounded-full overflow-hidden border border-outline-variant/30 cursor-pointer" onClick={() => onNavigate('settings')}>
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGs0lyd1vo6e8klmbPQp9l0kdSLDHcMtpXNwjj83E7ghm5w5KHOE1yeBHHzDHiAKqGoi1bVq09DPByoX_vhRVZzdORdS_2TVKinEZwyKGrvsnwhdaBfUC4rvFHr2CxjufJhWjHBPf0w7YL4C8QcOupMAANA2tSfzQ33pHy_9afi4GvwCT8pwUZZDLQ0vuknsbW6-m5OgmxmMrDdKIYyG0rozmP54V70e_7ZZTJgVRRqZNBC62xw4dhqYpD9ByKhORuNbDMjI8s8jqC" alt="User Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <ResizableSidebar side="left" initialWidth={224} minWidth={180} maxWidth={400} className="h-full bg-[#f8fafb] border-r border-outline-variant/10">
          <div className="p-3 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">节点库</h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
              {/* Selection & Research */}
              <div>
                <button className="w-full flex items-center justify-between px-1 py-1.5 text-sm font-bold text-slate-700 hover:text-primary mb-1 transition-colors">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    <Search size={14} /> 选品与市场调研
                  </span>
                  <ChevronDown size={12} />
                </button>
                <div className="space-y-1 ml-3 border-l border-outline-variant/20 pl-2">
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>关键词热度抓取</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>类目排名监控</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>竞品参数拆解</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>专利侵权初筛</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>市场容量测算</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>评论差评提取</div>
                </div>
              </div>
              
              {/* Listing & Content */}
              <div>
                <button className="w-full flex items-center justify-between px-1 py-1.5 text-sm font-bold text-slate-700 hover:text-primary mb-1 transition-colors">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    <Edit3 size={14} /> 上架与内容生成
                  </span>
                  <ChevronDown size={12} />
                </button>
                <div className="space-y-1 ml-3 border-l border-outline-variant/20 pl-2">
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>标题生成器</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>卖点（五点）提取</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>文本翻译/本地化</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>图片格式校验</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>SKU编码生成</div>
                </div>
              </div>

              {/* Sourcing & Cost */}
              <div>
                <button className="w-full flex items-center justify-between px-1 py-1.5 text-sm font-bold text-slate-700 hover:text-primary mb-1 transition-colors">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    <DollarSign size={14} /> 供应链与成本
                  </span>
                  <ChevronDown size={12} />
                </button>
                <div className="space-y-1 ml-3 border-l border-outline-variant/20 pl-2">
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>采购价询价</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>头程运费估算</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>体积重转换</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>利润模型节点</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>盈亏临界点计算</div>
                </div>
              </div>

              {/* Logistics & Inventory */}
              <div>
                <button className="w-full flex items-center justify-between px-1 py-1.5 text-sm font-bold text-slate-700 hover:text-primary mb-1 transition-colors">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    <Truck size={14} /> 物流与库存管理
                  </span>
                  <ChevronDown size={12} />
                </button>
                <div className="space-y-1 ml-3 border-l border-outline-variant/20 pl-2">
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>FBA标签生成</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>装箱清单校验</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>库存周转计算</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>补货量建议</div>
                </div>
              </div>

              {/* Ads & Operations */}
              <div>
                <button className="w-full flex items-center justify-between px-1 py-1.5 text-sm font-bold text-slate-700 hover:text-primary mb-1 transition-colors">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    <Megaphone size={14} /> 广告与推广
                  </span>
                  <ChevronDown size={12} />
                </button>
                <div className="space-y-1 ml-3 border-l border-outline-variant/20 pl-2">
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>广告词库过滤</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>出价自动调整</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>广告位溢价计算</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>预算消耗预警</div>
                </div>
              </div>

              {/* Finance & Service */}
              <div>
                <button className="w-full flex items-center justify-between px-1 py-1.5 text-sm font-bold text-slate-700 hover:text-primary mb-1 transition-colors">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    <Wallet size={14} /> 财务与售后
                  </span>
                  <ChevronDown size={12} />
                </button>
                <div className="space-y-1 ml-3 border-l border-outline-variant/20 pl-2">
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>回款金额核算</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>退货率监控</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>评价自动分类</div>
                  <div className="py-1 text-xs text-on-surface-variant hover:text-primary cursor-move flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>VAT/税金计算</div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-3 border-t border-outline-variant/10">
              <button className="flex items-center gap-2 px-2 py-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-md transition-all w-full">
                <HelpCircle size={14} />
                <span className="font-medium text-xs">帮助中心</span>
              </button>
            </div>
          </div>
        </ResizableSidebar>

        {/* Canvas Area */}
        <main className="flex-1 relative bg-surface-bright overflow-hidden">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-outline-variant/10">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md font-medium text-xs hover:opacity-90 transition-opacity">
              <Save size={14} /> 保存
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-tertiary text-white rounded-md font-medium text-xs hover:opacity-90 transition-opacity">
              <Play size={14} fill="currentColor" /> 运行
            </button>
          </div>

          <div 
            ref={containerRef}
            className={`absolute inset-0 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleCanvasMouseDown}
            style={{
              backgroundImage: 'radial-gradient(#d9e4e8 1px, transparent 1px)',
              backgroundSize: `${20 * scale}px ${20 * scale}px`,
              backgroundPosition: `${position.x}px ${position.y}px`
            }}
          >
            <div 
              className="absolute top-0 left-0 origin-top-left"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              }}
            >
              <style>{`
                @keyframes flow {
                  from { stroke-dashoffset: 40; }
                  to { stroke-dashoffset: 0; }
                }
              `}</style>
              
              <svg className="absolute inset-0 w-[2000px] h-[2000px] pointer-events-none" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#146a65" />
                    <stop offset="100%" stopColor="#4e6073" />
                  </linearGradient>
                </defs>
                {(() => {
                  const n1 = nodes.find(n => n.id === 'node1') || { x: 100, y: 80 };
                  const n2 = nodes.find(n => n.id === 'node2') || { x: 470, y: 280 };
                  const startX = n1.x + 230;
                  const startY = n1.y + 65;
                  const endX = n2.x;
                  const endY = n2.y + 43;
                  const cp1X = startX + Math.max(Math.abs(endX - startX) / 2, 50);
                  const cp1Y = startY;
                  const cp2X = endX - Math.max(Math.abs(endX - startX) / 2, 50);
                  const cp2Y = endY;
                  const pathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
                  return (
                    <>
                      <path d={pathD} fill="none" stroke="#146a65" strokeWidth="4" opacity="0.15" style={{ filter: 'blur(2px)' }} />
                      <path d={pathD} fill="none" stroke="url(#wireGradient)" strokeWidth="2" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))' }} />
                      <path d={pathD} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 12" opacity="0.5" style={{ animation: 'flow 3s linear infinite' }} />
                    </>
                  );
                })()}
              </svg>

              {/* Node 1 */}
              <div 
                className="absolute w-[230px] bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden node-element cursor-default transition-shadow hover:shadow-xl"
                style={{ top: nodes.find(n => n.id === 'node1')?.y, left: nodes.find(n => n.id === 'node1')?.x, zIndex: draggingNode === 'node1' ? 50 : 10 }}
              >
                <div 
                  className="bg-[#37474F] px-2.5 py-1.5 flex items-center justify-between cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => handleNodeMouseDown(e, 'node1')}
                >
                  <div className="flex items-center gap-2">
                    <Calculator size={14} className="text-white" />
                    <h4 className="text-white text-sm font-bold font-headline">利润计算器</h4>
                  </div>
                  <button className="p-0.5 text-white/60 hover:text-white transition-colors">
                    <MoreVertical size={11} />
                  </button>
                </div>
                <div className="flex">
                  <div className="flex-1 p-2 border-r border-slate-50 relative">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1.5">输入</div>
                    <div className="space-y-1.5">
                      <div className="relative flex items-center justify-between">
                        <div className="absolute w-2 h-2 bg-white border-[1.5px] border-current rounded-full top-1/2 -translate-y-1/2 z-10 shadow-[0_0_2px_rgba(0,0,0,0.1)] -left-[9px] text-slate-300"></div>
                        <span className="text-xs text-slate-500">成本</span>
                        <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-1 rounded">1240.0</span>
                      </div>
                      <div className="relative flex items-center justify-between">
                        <div className="absolute w-2 h-2 bg-white border-[1.5px] border-current rounded-full top-1/2 -translate-y-1/2 z-10 shadow-[0_0_2px_rgba(0,0,0,0.1)] -left-[9px] text-slate-300"></div>
                        <span className="text-xs text-slate-500">售价</span>
                        <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-1 rounded">2800.0</span>
                      </div>
                      <div className="relative flex items-center justify-between">
                        <div className="absolute w-2 h-2 bg-white border-[1.5px] border-current rounded-full top-1/2 -translate-y-1/2 z-10 shadow-[0_0_2px_rgba(0,0,0,0.1)] -left-[9px] text-slate-300"></div>
                        <span className="text-xs text-slate-500">销量</span>
                        <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-1 rounded">450</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-2 relative text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1.5">输出</div>
                    <div className="space-y-1.5">
                      <div className="relative flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-tertiary bg-tertiary/10 px-1 rounded">656k</span>
                        <span className="text-xs text-slate-500">利润</span>
                        <div className="absolute w-2 h-2 bg-white border-[1.5px] border-current rounded-full top-1/2 -translate-y-1/2 z-10 shadow-[0_0_2px_rgba(0,0,0,0.1)] -right-[9px] text-tertiary"></div>
                      </div>
                      <div className="relative flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-tertiary bg-tertiary/10 px-1 rounded">52.1%</span>
                        <span className="text-xs text-slate-500">利润率</span>
                        <div className="absolute w-2 h-2 bg-white border-[1.5px] border-current rounded-full top-1/2 -translate-y-1/2 z-10 shadow-[0_0_2px_rgba(0,0,0,0.1)] -right-[9px] text-tertiary"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50/80 border-t border-slate-100 p-2">
                  <button className="flex items-center justify-between w-full text-xs font-bold text-slate-500 uppercase mb-1">
                    <span>计算逻辑</span>
                    <ChevronDown size={10} className="rotate-180" />
                  </button>
                  <div className="text-xs text-slate-400 leading-relaxed italic">
                    利润 = (售价 - 成本) * 销售量
                  </div>
                </div>
              </div>

              {/* Node 2 */}
              <div 
                className="absolute w-[230px] bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden node-element cursor-default transition-shadow hover:shadow-xl"
                style={{ top: nodes.find(n => n.id === 'node2')?.y, left: nodes.find(n => n.id === 'node2')?.x, zIndex: draggingNode === 'node2' ? 50 : 10 }}
              >
                <div 
                  className="bg-[#37474F] px-2.5 py-1.5 flex items-center justify-between cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => handleNodeMouseDown(e, 'node2')}
                >
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-white" />
                    <h4 className="text-white text-sm font-bold font-headline">数据持久化</h4>
                  </div>
                  <button className="p-0.5 text-white/60 hover:text-white transition-colors">
                    <MoreVertical size={11} />
                  </button>
                </div>
                <div className="p-2 space-y-2">
                  <div className="relative flex items-center justify-between">
                    <div className="absolute w-2 h-2 bg-white border-[1.5px] border-current rounded-full top-1/2 -translate-y-1/2 z-10 shadow-[0_0_2px_rgba(0,0,0,0.1)] -left-[9px] text-primary"></div>
                    <span className="text-xs text-slate-500">输入数据</span>
                    <span className="text-xs font-bold text-slate-800">Financial_Report</span>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-slate-400">存储引擎</span>
                    <span className="text-xs font-medium text-slate-500">RDS / PostgreSQL</span>
                  </div>
                </div>
                <div className="bg-slate-50/80 border-t border-slate-100 p-2">
                  <div className="flex items-center justify-between w-full text-xs font-bold text-slate-500 uppercase mb-1">
                    <span>处理脚本</span>
                  </div>
                  <div className="bg-slate-900 rounded p-1.5 font-mono text-xs text-emerald-400 shadow-inner">
                    return 利润;
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#37474F] text-white py-2.5 px-6 rounded-full shadow-2xl z-50">
            <button className="flex items-center gap-2 hover:text-tertiary-fixed transition-colors">
              <Plus size={18} /> <span className="text-sm font-medium">添加节点</span>
            </button>
            <div className="w-px h-4 bg-white/20"></div>
            <button className="flex items-center gap-2 hover:text-tertiary-fixed transition-colors">
              <History size={18} /> <span className="text-sm font-medium">版本记录</span>
            </button>
            <div className="w-px h-4 bg-white/20"></div>
            <button className="flex items-center gap-2 hover:text-tertiary-fixed transition-colors">
              <Share2 size={18} /> <span className="text-sm font-medium">协作分享</span>
            </button>
          </div>
        </main>

        {/* Right Sidebar */}
        <ResizableSidebar side="right" initialWidth={320} minWidth={250} maxWidth={500} className="h-full border-l border-outline-variant/10 bg-white">
          <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#37474F] flex items-center gap-2">
              <Settings2 size={18} /> 编辑节点
            </h3>
            <button className="p-1 hover:bg-slate-100 rounded">
              <X size={16} className="text-slate-400" />
            </button>
          </div>
          <div className="flex border-b border-outline-variant/10">
            <button className="flex-1 py-3 text-sm font-bold text-[#37474F] border-b-2 border-[#37474F]">AI 编辑</button>
            <button className="flex-1 py-3 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">公式修改</button>
          </div>
          <div className="flex-1 p-5 space-y-6 overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">AI 辅助描述</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg rounded-tl-none border border-outline-variant/10">
                <p className="text-xs text-on-surface">帮我把利润计算公式改为：减去 10% 的人工费用。</p>
              </div>
              <div className="bg-[#37474F]/5 p-3 rounded-lg rounded-tr-none border border-[#37474F]/10">
                <p className="text-xs text-[#37474F] leading-relaxed">
                  已为您准备好公式更新：<br/>
                  <strong className="font-bold">利润 = (售价 - 成本 - 人工) * 0.9</strong>
                </p>
              </div>
              <div className="relative mt-2">
                <textarea className="w-full bg-surface-container-high border-none rounded-lg text-sm py-2.5 px-3 focus:ring-1 focus:ring-[#37474F]/20 min-h-[80px] resize-none outline-none" placeholder="描述您想对节点做的修改..."></textarea>
                <button className="absolute right-2 bottom-2 bg-[#37474F] text-white p-1.5 rounded-md transition-opacity hover:opacity-90">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-outline-variant/10">
            <button className="w-full py-2.5 bg-[#37474F] text-white rounded-lg text-sm font-medium shadow-md hover:opacity-95 transition-opacity">
              保存节点修改
            </button>
          </div>
        </ResizableSidebar>
      </div>
    </div>
  );
}
