import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, Play, Settings2, Calculator, Plus, Trash2, Send } from 'lucide-react';
import TopNavBar from '../../components/TopNavBar';
import ResizableSidebar from '../../components/ResizableSidebar';

export default function AdminNodeEdit({ currentPath, onNavigate }: { currentPath: string, onNavigate: (path: string) => void }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [nodeData, setNodeData] = useState({
    id: 'N-001',
    name: '利润计算器',
    inputs: ['成本', '售价', '销量'],
    outputs: ['利润', '利润率'],
    logic: '利润 = (售价 - 成本) * 销售量;\n利润率 = 利润 / 售价;'
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const zoomSensitivity = 0.005;
        const delta = -e.deltaY * zoomSensitivity;
        const newScale = Math.min(Math.max(0.2, scale + delta), 3);
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const scaleRatio = newScale / scale;
        const newX = mouseX - (mouseX - position.x) * scaleRatio;
        const newY = mouseY - (mouseY - position.y) * scaleRatio;
        setScale(newScale);
        setPosition({ x: newX, y: newY });
      } else {
        setPosition(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [scale, position]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPosition({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      }
    };
    const handleMouseUp = () => setIsPanning(false);
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, panStart]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-element')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  return (
    <div className="h-screen flex flex-col bg-surface font-body text-on-surface overflow-hidden">
      <TopNavBar currentPath={currentPath} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col pt-14 overflow-hidden">
        <header className="w-full z-40 bg-white border-b border-outline-variant/10 shadow-sm shrink-0">
        <div className="flex justify-between items-center h-14 px-6 w-full">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('admin/nodes')} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="h-5 w-px bg-outline-variant/30"></div>
            <span className="text-base font-bold text-slate-700">编辑节点: {nodeData.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-surface-container text-on-surface-variant rounded-md font-medium text-sm hover:bg-surface-container-high transition-colors">
              <Play size={14} fill="currentColor" /> 测试运行
            </button>
            <button onClick={() => onNavigate('admin/nodes')} className="flex items-center gap-1.5 px-4 py-1.5 border border-outline-variant/30 text-slate-700 bg-white rounded-md font-medium text-sm hover:bg-slate-50 transition-colors">
              <Save size={14} /> 保存草稿
            </button>
            <button onClick={() => onNavigate('admin/nodes')} className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-md font-medium text-sm hover:opacity-90 transition-opacity">
              <Send size={14} /> 发布
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 relative bg-surface-bright overflow-hidden">
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
            <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}>
              <div className="absolute top-[150px] left-[200px] w-[260px] bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden node-element cursor-default">
                <div className="bg-[#37474F] px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator size={14} className="text-white" />
                    <h4 className="text-white text-sm font-bold font-headline">{nodeData.name || '未命名节点'}</h4>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-1 p-3 border-r border-slate-50 relative">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-2">输入</div>
                    <div className="space-y-2">
                      {nodeData.inputs.length === 0 && <div className="text-xs text-slate-400 italic">无输入</div>}
                      {nodeData.inputs.map((input, idx) => (
                        <div key={idx} className="relative flex items-center justify-between">
                          <div className="absolute w-2 h-2 bg-white border-[1.5px] border-current rounded-full top-1/2 -translate-y-1/2 z-10 shadow-[0_0_2px_rgba(0,0,0,0.1)] -left-[13px] text-slate-300"></div>
                          <span className="text-xs text-slate-600">{input}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 p-3 relative text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-2">输出</div>
                    <div className="space-y-2">
                      {nodeData.outputs.length === 0 && <div className="text-xs text-slate-400 italic">无输出</div>}
                      {nodeData.outputs.map((output, idx) => (
                        <div key={idx} className="relative flex items-center justify-end">
                          <span className="text-xs text-slate-600">{output}</span>
                          <div className="absolute w-2 h-2 bg-white border-[1.5px] border-current rounded-full top-1/2 -translate-y-1/2 z-10 shadow-[0_0_2px_rgba(0,0,0,0.1)] -right-[13px] text-tertiary"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50/80 border-t border-slate-100 p-2.5">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">计算逻辑</div>
                  <div className="text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-wrap">
                    {nodeData.logic || '// 暂无逻辑'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <ResizableSidebar side="right" initialWidth={384} minWidth={300} maxWidth={600} className="h-full border-l border-outline-variant/10 bg-white">
          <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-bright">
            <h3 className="text-base font-bold text-[#37474F] flex items-center gap-2">
              <Settings2 size={18} /> 节点配置
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">节点名称</label>
                <input 
                  type="text" 
                  value={nodeData.name}
                  onChange={(e) => setNodeData({...nodeData, name: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">输入字段 (Inputs)</label>
                <button 
                  onClick={() => setNodeData({...nodeData, inputs: [...nodeData.inputs, '新输入']})}
                  className="text-primary hover:bg-primary/10 p-1 rounded transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {nodeData.inputs.map((input, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => {
                        const newInputs = [...nodeData.inputs];
                        newInputs[idx] = e.target.value;
                        setNodeData({...nodeData, inputs: newInputs});
                      }}
                      className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm py-1.5 px-2 focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                    <button 
                      onClick={() => {
                        const newInputs = nodeData.inputs.filter((_, i) => i !== idx);
                        setNodeData({...nodeData, inputs: newInputs});
                      }}
                      className="text-slate-400 hover:text-error transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">输出字段 (Outputs)</label>
                <button 
                  onClick={() => setNodeData({...nodeData, outputs: [...nodeData.outputs, '新输出']})}
                  className="text-primary hover:bg-primary/10 p-1 rounded transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {nodeData.outputs.map((output, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={output}
                      onChange={(e) => {
                        const newOutputs = [...nodeData.outputs];
                        newOutputs[idx] = e.target.value;
                        setNodeData({...nodeData, outputs: newOutputs});
                      }}
                      className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm py-1.5 px-2 focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                    <button 
                      onClick={() => {
                        const newOutputs = nodeData.outputs.filter((_, i) => i !== idx);
                        setNodeData({...nodeData, outputs: newOutputs});
                      }}
                      className="text-slate-400 hover:text-error transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">计算逻辑 (JavaScript)</label>
              <div className="bg-slate-900 rounded-lg p-3 shadow-inner">
                <textarea 
                  value={nodeData.logic}
                  onChange={(e) => setNodeData({...nodeData, logic: e.target.value})}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-mono text-sm text-emerald-400 leading-relaxed resize-none h-40 scrollbar-hide outline-none" 
                  spellCheck="false"
                />
              </div>
            </div>
          </div>
        </ResizableSidebar>
      </div>
      </div>
    </div>
  );
}
