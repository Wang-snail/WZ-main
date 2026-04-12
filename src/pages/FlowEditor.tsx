import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Calculator, Search, ChevronDown, ChevronRight,
  Edit2, Play, Save, X, PlusSquare, History, Share2,
} from 'lucide-react';
import TopNavBar from '../components/TopNavBar';
import { useNodes } from '../hooks/useNodes';
import { AppNode } from '../data/nodes';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CanvasNode {
  instanceId: string;
  nodeId: string;
  x: number;
  y: number;
  width: number;
  inputs: Record<string, number>;
}

interface CanvasEdge {
  id: string;
  fromInstanceId: string;
  fromPortIdx: number;
  toInstanceId: string;
  toPortIdx: number;
}

// Port position measured from DOM: { instanceId -> { out: [y0,y1,...], in: [y0,y1,...] } }
type PortPositions = Record<string, { out: number[]; in: number[] }>;

// ─── Layout constants (keep in sync with JSX below) ──────────────────────────
const PORT_R = 6;          // port circle radius (px)
const DEFAULT_NODE_W = 260;
const MIN_NODE_W = 200;

// ─── SidebarNodeCard ──────────────────────────────────────────────────────────
function SidebarNodeCard({ node }: { node: AppNode }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('nodeId', node.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing hover:bg-primary/8 group transition-colors select-none"
    >
      <Calculator size={12} className="text-primary shrink-0" />
      <span className="text-xs text-on-surface-variant group-hover:text-primary truncate">{node.name}</span>
    </div>
  );
}

// ─── CanvasNodeCard ───────────────────────────────────────────────────────────
function CanvasNodeCard({
  canvasNode,
  appNode,
  selected,
  dragging,
  onMouseDown,
  onSelectClick,
  onOutputPortMouseDown,
  onInputPortMouseUp,
  onResizeMouseDown,
}: {
  canvasNode: CanvasNode;
  appNode: AppNode;
  selected: boolean;
  dragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onSelectClick: () => void;
  onOutputPortMouseDown: (e: React.MouseEvent, idx: number) => void;
  onInputPortMouseUp: (e: React.MouseEvent, idx: number) => void;
  onResizeMouseDown: (e: React.MouseEvent) => void;
}) {
  const [logicOpen, setLogicOpen] = useState(false);
  const w = canvasNode.width;

  return (
    // px-[PORT_R] creates space so the port circles (which sit at the very edge) are not clipped
    <div
      className="node-element absolute"
      style={{
        left: canvasNode.x - PORT_R,
        top: canvasNode.y,
        width: w + PORT_R * 2,
        paddingLeft: PORT_R,
        paddingRight: PORT_R,
        zIndex: dragging ? 100 : selected ? 20 : 10,
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-lg border-2 transition-colors ${
          selected ? 'border-primary' : 'border-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-2.5 bg-[#37474F] rounded-t-xl cursor-grab active:cursor-grabbing select-none"
          style={{ height: 32 }}
          onMouseDown={onMouseDown}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Calculator size={12} className="text-white shrink-0" />
            <span className="text-white text-[11px] font-bold truncate">{appNode.name}</span>
          </div>
          <button
            className="shrink-0 p-0.5 hover:bg-white/20 rounded transition-colors"
            onMouseDown={e => e.stopPropagation()}
            onClick={onSelectClick}
          >
            <Edit2 size={11} className="text-white" />
          </button>
        </div>

        {/* Body — two columns */}
        <div className="flex">
          {/* Left: inputs */}
          <div className="flex-1 bg-slate-50/50 border-r border-slate-100">
            <div className="px-2 pt-1 pb-0.5">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">输入</span>
            </div>
            {appNode.inputs.map((inp, i) => {
              const val = canvasNode.inputs[inp.key] ?? inp.defaultValue ?? 0;
              return (
                <div key={inp.key} className="relative flex items-center" style={{ height: 24, paddingLeft: 14, paddingRight: 6 }}>
                  {/* Input port — sits at the left edge of the card (outside the border) */}
                  <div
                    data-port="in"
                    data-instance={canvasNode.instanceId}
                    data-idx={i}
                    className="absolute flex items-center justify-center cursor-crosshair"
                    style={{
                      left: -PORT_R - 1,       // -PORT_R positions centre at card's left border
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: PORT_R * 2,
                      height: PORT_R * 2,
                      zIndex: 20,
                    }}
                    onMouseUp={e => onInputPortMouseUp(e, i)}
                  >
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 bg-white hover:border-primary hover:scale-125 transition-transform" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-slate-500 leading-none truncate">{inp.label}</span>
                    <span className="text-[11px] font-bold text-slate-800 leading-none">{val}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: outputs */}
          <div className="flex-1 bg-white">
            <div className="px-2 pt-1 pb-0.5 text-right">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">输出</span>
            </div>
            {appNode.outputs.map((out, i) => (
              <div key={out.key} className="relative flex items-center justify-end" style={{ height: 24, paddingLeft: 6, paddingRight: 14 }}>
                <div className="flex flex-col items-end min-w-0">
                  <span className="text-[10px] text-slate-500 leading-none truncate">{out.label}</span>
                  <span className="text-[11px] font-bold text-emerald-600 leading-none">—</span>
                </div>
                {/* Output port — sits at the right edge of the card (outside the border) */}
                <div
                  data-port="out"
                  data-instance={canvasNode.instanceId}
                  data-idx={i}
                  className="absolute flex items-center justify-center cursor-crosshair"
                  style={{
                    right: -PORT_R - 1,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: PORT_R * 2,
                    height: PORT_R * 2,
                    zIndex: 20,
                  }}
                  onMouseDown={e => onOutputPortMouseDown(e, i)}
                >
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-white hover:border-emerald-400 hover:scale-125 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: collapsible logic */}
        <div className="bg-slate-50/80 border-t border-slate-100 rounded-b-xl">
          <details onToggle={e => setLogicOpen((e.target as HTMLDetailsElement).open)}>
            <summary className="flex items-center gap-1 px-2.5 py-1 cursor-pointer select-none list-none text-[10px] text-slate-500 hover:text-slate-700">
              <ChevronRight
                size={10}
                className={`transition-transform shrink-0 ${logicOpen ? 'rotate-90' : ''}`}
              />
              逻辑
            </summary>
            <div className="px-2 pb-2">
              <pre className="bg-slate-900 rounded-md p-2 font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
                {appNode.logic}
              </pre>
            </div>
          </details>
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="absolute cursor-nw-resize z-20"
        onMouseDown={onResizeMouseDown}
        style={{
          bottom: 0,
          right: PORT_R,   // align with card's right border (not the outer wrapper)
          width: 16,
          height: 16,
          background: 'linear-gradient(135deg, transparent 50%, #94a3b8 50%)',
          borderBottomRightRadius: 8,
        }}
      />
    </div>
  );
}

// ─── RightPanel ───────────────────────────────────────────────────────────────
function RightPanel({
  canvasNode,
  appNode,
  onClose,
  onInputChange,
  onRefresh,
  updateNode,
}: {
  canvasNode: CanvasNode;
  appNode: AppNode;
  onClose: () => void;
  onInputChange: (key: string, value: number) => void;
  onRefresh: () => void;
  updateNode: (id: string, changes: Partial<AppNode>) => Promise<AppNode>;
}) {
  const [activeTab, setActiveTab] = useState<'params' | 'logic'>('params');
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [logicText, setLogicText] = useState(appNode.logic);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const handleRun = async () => {
    setRunning(true);
    setRunError(null);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: appNode.id,
          inputs: canvasNode.inputs,
          logic: appNode.logic,
          outputKeys: appNode.outputs.map(o => o.key),
        }),
      });
      const json = await res.json() as { success: boolean; data?: { outputs: Record<string, number> }; error?: string };
      if (json.success && json.data) {
        setResult(json.data.outputs);
      } else {
        setRunError(json.error ?? '计算失败');
      }
    } catch {
      setRunError('网络错误');
    } finally { setRunning(false); }
  };
  const handleSaveLogic = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateNode(appNode.id, { logic: logicText });
      onRefresh();
      setSaveMsg('保存成功');
    } catch {
      setSaveMsg('保存失败');
    } finally { setSaving(false); }
  };

  return (
    <div className="w-72 h-full border-l border-outline-variant/10 bg-white flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#37474F] truncate">{appNode.name}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-tight truncate">{appNode.description}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded ml-2 shrink-0">
          <X size={15} className="text-slate-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/10 shrink-0">
        {(['params', 'logic'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'params' ? '参数配置' : '逻辑编辑'}
          </button>
        ))}
      </div>

      {activeTab === 'params' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">输入参数</p>
            {appNode.inputs.map(inp => (
              <div key={inp.key}>
                <label className="text-xs text-on-surface-variant mb-1 block">
                  {inp.label}{inp.unit ? ` (${inp.unit})` : ''}
                </label>
                <input
                  type="number"
                  className="w-full border border-outline-variant/30 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-surface-container-low"
                  value={canvasNode.inputs[inp.key] ?? inp.defaultValue ?? 0}
                  onChange={e => onInputChange(inp.key, parseFloat(e.target.value) || 0)}
                />
              </div>
            ))}

            {result && (
              <div className="mt-2 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">计算结果</p>
                {appNode.outputs.map(out => (
                  <div key={out.key} className="flex items-center justify-between bg-emerald-50 rounded-md px-2.5 py-1.5">
                    <span className="text-xs text-slate-500">{out.label}</span>
                    <span className="text-xs font-bold text-emerald-600 font-mono">
                      {typeof result[out.key] === 'number' ? result[out.key].toFixed(2) : '—'}
                      {out.unit ? ` ${out.unit}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {runError && (
              <p className="text-xs text-error bg-error/10 rounded-md px-2.5 py-1.5">{runError}</p>
            )}
          </div>

          <div className="p-4 border-t border-outline-variant/10">
            <button
              onClick={handleRun}
              disabled={running}
              className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Play size={14} fill="currentColor" />
              {running ? '计算中…' : '运行'}
            </button>
          </div>
        </>
      )}

      {activeTab === 'logic' && (
        <>
          <div className="flex-1 p-4 flex flex-col gap-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">逻辑脚本</p>
            <textarea
              className="flex-1 w-full bg-slate-900 text-emerald-400 font-mono text-xs rounded-md p-3 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={logicText}
              onChange={e => setLogicText(e.target.value)}
              spellCheck={false}
            />
            {saveMsg && (
              <p className={`text-xs rounded-md px-2.5 py-1.5 ${saveMsg.includes('成功') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {saveMsg}
              </p>
            )}
          </div>
          <div className="p-4 border-t border-outline-variant/10">
            <button
              onClick={handleSaveLogic}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#37474F] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? '保存中…' : '保存逻辑'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── FlowEditor (main) ────────────────────────────────────────────────────────
export default function FlowEditor({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  const { publishedNodes, loading, refresh, updateNode } = useNodes();

  // Canvas transform
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  // Canvas data
  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  // Drag to reposition
  const [draggingInstanceId, setDraggingInstanceId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const didDragRef = useRef(false);
  // Resize
  const [resizingInstanceId, setResizingInstanceId] = useState<string | null>(null);
  const resizeStartRef = useRef({ mouseX: 0, startW: 0 });
  // Edge drawing
  const [drawingEdge, setDrawingEdge] = useState<{ fromInstanceId: string; fromPortIdx: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  // Sidebar
  const [search, setSearch] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Zoom (ctrl+wheel) and pan ─────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const delta = -e.deltaY * 0.005;
        setScale(prev => {
          const next = Math.min(3, Math.max(0.2, prev + delta));
          const rect = container.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          const ratio = next / prev;
          setPosition(p => ({ x: mx - (mx - p.x) * ratio, y: my - (my - p.y) * ratio }));
          return next;
        });
      } else {
        setPosition(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);
  // ── Global mouse move / up ─────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cx = (e.clientX - rect.left - position.x) / scale;
      const cy = (e.clientY - rect.top - position.y) / scale;
      setMousePos({ x: cx, y: cy });

      if (resizingInstanceId) {
        const dx = e.clientX - resizeStartRef.current.mouseX;
        const newW = Math.max(MIN_NODE_W, resizeStartRef.current.startW + dx / scale);
        setCanvasNodes(prev =>
          prev.map(n => n.instanceId === resizingInstanceId ? { ...n, width: Math.round(newW) } : n)
        );
        return;
      }

      if (draggingInstanceId) {
        const nx = Math.round((cx - dragOffset.x) / 20) * 20;
        const ny = Math.round((cy - dragOffset.y) / 20) * 20;
        setCanvasNodes(prev =>
          prev.map(n => {
            if (n.instanceId !== draggingInstanceId) return n;
            if (n.x !== nx || n.y !== ny) didDragRef.current = true;
            return { ...n, x: nx, y: ny };
          })
        );
      } else if (isPanning) {
        setPosition({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      }
    };

    const handleMouseUp = () => {
      if (draggingInstanceId && !didDragRef.current) {
        setSelectedInstanceId(draggingInstanceId);
      }
      setIsPanning(false);
      setDraggingInstanceId(null);
      setResizingInstanceId(null);
      didDragRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, draggingInstanceId, panStart, dragOffset, scale, position, resizingInstanceId]);
  // ── Canvas mouse down ──────────────────────────────────────────────────────
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-element')) return;
    if (drawingEdge) { setDrawingEdge(null); return; }
    setSelectedInstanceId(null);
    setIsPanning(true);
    setPanStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  // ── Drop from sidebar ──────────────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const nodeId = e.dataTransfer.getData('nodeId');
    if (!nodeId) return;
    const appNode = publishedNodes.find(n => n.id === nodeId);
    if (!appNode) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.round(((e.clientX - rect.left - position.x) / scale) / 20) * 20;
    const y = Math.round(((e.clientY - rect.top - position.y) / scale) / 20) * 20;
    const defaultInputs: Record<string, number> = {};
    appNode.inputs.forEach(inp => { defaultInputs[inp.key] = inp.defaultValue ?? 0; });
    setCanvasNodes(prev => [...prev, {
      instanceId: `${nodeId}-${Date.now()}`,
      nodeId,
      x,
      y,
      width: DEFAULT_NODE_W,
      inputs: defaultInputs,
    }]);
  };

  // ── Node header / resize / port / delete / input handlers ─────────────────
  const handleNodeHeaderMouseDown = (e: React.MouseEvent, instanceId: string, nx: number, ny: number) => {
    e.stopPropagation();
    if (drawingEdge) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left - position.x) / scale;
    const cy = (e.clientY - rect.top - position.y) / scale;
    didDragRef.current = false;
    setDraggingInstanceId(instanceId);
    setDragOffset({ x: cx - nx, y: cy - ny });
  };
  const handleResizeMouseDown = (e: React.MouseEvent, instanceId: string, currentW: number) => {
    e.stopPropagation(); e.preventDefault();
    resizeStartRef.current = { mouseX: e.clientX, startW: currentW };
    setResizingInstanceId(instanceId);
  };
  const handleOutputPortMouseDown = (e: React.MouseEvent, instanceId: string, portIdx: number) => {
    e.stopPropagation();
    setDrawingEdge({ fromInstanceId: instanceId, fromPortIdx: portIdx });
  };
  const handleInputPortMouseUp = (e: React.MouseEvent, instanceId: string, portIdx: number) => {
    e.stopPropagation();
    if (!drawingEdge || drawingEdge.fromInstanceId === instanceId) { setDrawingEdge(null); return; }
    setEdges(prev => [...prev, {
      id: `e-${Date.now()}`,
      fromInstanceId: drawingEdge.fromInstanceId,
      fromPortIdx: drawingEdge.fromPortIdx,
      toInstanceId: instanceId,
      toPortIdx: portIdx,
    }]);
    setDrawingEdge(null);
  };
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedInstanceId) {
        setCanvasNodes(prev => prev.filter(n => n.instanceId !== selectedInstanceId));
        setEdges(prev => prev.filter(ed =>
          ed.fromInstanceId !== selectedInstanceId && ed.toInstanceId !== selectedInstanceId
        ));
        setSelectedInstanceId(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedInstanceId]);
  const handleInputChange = useCallback((instanceId: string, key: string, value: number) => {
    setCanvasNodes(prev =>
      prev.map(n => n.instanceId === instanceId ? { ...n, inputs: { ...n.inputs, [key]: value } } : n)
    );
  }, []);
  // ─── Port position measurement ────────────────────────────────────────────
  // We read actual DOM positions of port elements (data-port="out"/"in") and
  // convert them to canvas-space coordinates, so edge endpoints are pixel-exact.
  const [portPositions, setPortPositions] = useState<PortPositions>({});

  const measurePorts = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const result: PortPositions = {};

    const portEls = container.querySelectorAll<HTMLElement>('[data-port]');
    portEls.forEach(el => {
      const kind = el.dataset.port as 'in' | 'out';
      const instanceId = el.dataset.instance!;
      const idx = parseInt(el.dataset.idx!, 10);
      const elRect = el.getBoundingClientRect();
      // Port centre in screen coords → canvas-space coords
      const cx = (elRect.left + elRect.width / 2 - containerRect.left - position.x) / scale;
      const cy = (elRect.top + elRect.height / 2 - containerRect.top - position.y) / scale;
      if (!result[instanceId]) result[instanceId] = { out: [], in: [] };
      result[instanceId][kind][idx] = cy;  // store Y; X derived from canvasNode
    });
    setPortPositions(result);
  }, [position, scale]);

  // Re-measure whenever nodes move, resize, or the canvas transforms
  useEffect(() => {
    // rAF so the DOM has finished painting before we measure
    const id = requestAnimationFrame(measurePorts);
    return () => cancelAnimationFrame(id);
  }, [canvasNodes, measurePorts]);

  // Helper: get canvas-space port centre
  const getPortXY = useCallback((
    instanceId: string,
    kind: 'in' | 'out',
    portIdx: number
  ): { x: number; y: number } | null => {
    const cn = canvasNodes.find(n => n.instanceId === instanceId);
    if (!cn) return null;
    const py = portPositions[instanceId]?.[kind]?.[portIdx];
    if (py === undefined) {
      // Fallback: estimate from layout constants until DOM is measured
      const HEADER = 32, LABEL = 20, ROW = 24;
      return {
        x: kind === 'out' ? cn.x + cn.width : cn.x,
        y: cn.y + HEADER + LABEL + portIdx * ROW + ROW / 2,
      };
    }
    return {
      x: kind === 'out' ? cn.x + cn.width : cn.x,
      y: py,
    };
  }, [canvasNodes, portPositions]);
  const makeBezier = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.max(Math.abs(x2 - x1) / 2, 60);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };
  const drawingStart = drawingEdge
    ? getPortXY(drawingEdge.fromInstanceId, 'out', drawingEdge.fromPortIdx)
    : null;
  const categories = publishedNodes.map(n => n.category).filter((v, i, a) => a.indexOf(v) === i);
  const filteredBySearch = publishedNodes.filter(n =>
    !search || n.name.includes(search) || n.category.includes(search)
  );
  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => { const next = new Set(prev); next.has(cat) ? next.delete(cat) : next.add(cat); return next; });
  };
  const selectedCanvasNode = canvasNodes.find(n => n.instanceId === selectedInstanceId) ?? null;
  const selectedAppNode = selectedCanvasNode
    ? publishedNodes.find(n => n.id === selectedCanvasNode.nodeId) ?? null
    : null;

  return (
    <div className="h-screen flex flex-col bg-surface font-body text-on-surface overflow-hidden">
      <TopNavBar
        currentPath={currentPath}
        onNavigate={onNavigate}
        className="w-full z-50 bg-white border-b border-outline-variant/10 shadow-sm shrink-0"
        rightContent={
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-md font-medium text-xs hover:opacity-90 transition-opacity">
              <Save size={13} /> 保存
            </button>
          </div>
        }
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-56 shrink-0 h-full bg-[#f8fafb] border-r border-outline-variant/10 flex flex-col">
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center bg-white border border-outline-variant/20 rounded-lg px-2 py-1.5 gap-1.5">
              <Search size={13} className="text-outline shrink-0" />
              <input
                type="text"
                placeholder="搜索节点…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-xs w-full outline-none text-on-surface placeholder-outline"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1 scrollbar-hide">
            {loading && <p className="text-xs text-slate-400 px-2 py-4 text-center">加载中…</p>}
            {!loading && categories.map(cat => {
              const catNodes = filteredBySearch.filter(n => n.category === cat);
              if (catNodes.length === 0) return null;
              const collapsed = collapsedCategories.has(cat);
              return (
                <div key={cat}>
                  <button
                    className="w-full flex items-center justify-between px-1 py-1.5 text-xs font-bold text-slate-500 hover:text-primary uppercase tracking-wider transition-colors"
                    onClick={() => toggleCategory(cat)}
                  >
                    <span>{cat}</span>
                    <ChevronDown size={11} className={`transition-transform ${collapsed ? '-rotate-90' : ''}`} />
                  </button>
                  {!collapsed && (
                    <div className="ml-1 space-y-0.5">
                      {catNodes.map(node => <SidebarNodeCard key={node.id} node={node} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Canvas */}
        <main className="flex-1 relative bg-surface-bright overflow-hidden">
          <div
            ref={containerRef}
            className={`absolute inset-0 ${isPanning ? 'cursor-grabbing' : drawingEdge ? 'cursor-crosshair' : 'cursor-grab'}`}
            onMouseDown={handleCanvasMouseDown}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              backgroundImage: 'radial-gradient(#d9e4e8 1px, transparent 1px)',
              backgroundSize: `${20 * scale}px ${20 * scale}px`,
              backgroundPosition: `${position.x}px ${position.y}px`,
            }}
          >
            <div
              className="absolute top-0 left-0 origin-top-left"
              style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
            >
              {/* SVG edges */}
              <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ width: 1, height: 1 }}>
                <defs>
                  <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#146a65" />
                    <stop offset="100%" stopColor="#4e6073" />
                  </linearGradient>
                </defs>
                {edges.map(edge => {
                  const s = getPortXY(edge.fromInstanceId, 'out', edge.fromPortIdx);
                  const t = getPortXY(edge.toInstanceId, 'in', edge.toPortIdx);
                  if (!s || !t) return null;
                  const d = makeBezier(s.x, s.y, t.x, t.y);
                  return (
                    <g key={edge.id}>
                      <path d={d} fill="none" stroke="#146a65" strokeWidth={5} opacity={0.12} style={{ filter: 'blur(2px)' }} />
                      <path d={d} fill="none" stroke="url(#edgeGrad)" strokeWidth={2} strokeLinecap="round" />
                    </g>
                  );
                })}
                {drawingEdge && drawingStart && (
                  <path
                    d={makeBezier(drawingStart.x, drawingStart.y, mousePos.x, mousePos.y)}
                    fill="none"
                    stroke="#146a65"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    opacity={0.7}
                  />
                )}
              </svg>
              {canvasNodes.map(cn => {
                const appNode = publishedNodes.find(n => n.id === cn.nodeId);
                if (!appNode) return null;
                return (
                  <CanvasNodeCard
                    key={cn.instanceId}
                    canvasNode={cn}
                    appNode={appNode}
                    selected={selectedInstanceId === cn.instanceId}
                    dragging={draggingInstanceId === cn.instanceId}
                    onMouseDown={e => handleNodeHeaderMouseDown(e, cn.instanceId, cn.x, cn.y)}
                    onSelectClick={() => setSelectedInstanceId(cn.instanceId)}
                    onOutputPortMouseDown={(e, idx) => handleOutputPortMouseDown(e, cn.instanceId, idx)}
                    onInputPortMouseUp={(e, idx) => handleInputPortMouseUp(e, cn.instanceId, idx)}
                    onResizeMouseDown={e => handleResizeMouseDown(e, cn.instanceId, cn.width)}
                  />
                );
              })}
            </div>
          </div>
          {canvasNodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center opacity-40">
                <Calculator size={40} className="text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500">从左侧拖拽节点到画布</p>
              </div>
            </div>
          )}
          {/* Bottom floating bar */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
            <div className="flex items-center gap-3 bg-[#37474F] rounded-full text-white shadow-2xl px-6 py-2.5 text-xs font-medium">
              <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity whitespace-nowrap">
                <PlusSquare size={14} /> 添加节点
              </button>
              <span className="text-white/30">|</span>
              <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity whitespace-nowrap">
                <History size={14} /> 版本
              </button>
              <span className="text-white/30">|</span>
              <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity whitespace-nowrap">
                <Share2 size={14} /> 协作
              </button>
            </div>
          </div>
        </main>
        {selectedCanvasNode && selectedAppNode && (
          <RightPanel
            canvasNode={selectedCanvasNode}
            appNode={selectedAppNode}
            onClose={() => setSelectedInstanceId(null)}
            onInputChange={(key, value) => handleInputChange(selectedCanvasNode.instanceId, key, value)}
            onRefresh={refresh}
            updateNode={updateNode}
          />
        )}
      </div>
    </div>
  );
}
