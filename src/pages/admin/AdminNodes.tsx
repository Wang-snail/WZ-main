import { useState } from 'react';
import { Plus, Search, CheckCircle, ChevronDown, ChevronUp, Trash2, Play, X, RotateCcw } from 'lucide-react';
import TopNavBar from '../../components/TopNavBar';
import AdminSidebar from '../../components/AdminSidebar';
import ResizableSidebar from '../../components/ResizableSidebar';
import { useNodes } from '../../hooks/useNodes';
import { AppNode, NodeInput, NodeOutput } from '../../data/nodes';

// ─── 行内编辑子组件 ───────────────────────────────────────────────────────────

function InputsEditor({
  inputs,
  onChange,
}: {
  inputs: NodeInput[];
  onChange: (v: NodeInput[]) => void;
}) {
  const add = () =>
    onChange([...inputs, { key: '', label: '', unit: '', defaultValue: 0 }]);
  const remove = (i: number) => onChange(inputs.filter((_, idx) => idx !== i));
  const set = (i: number, field: keyof NodeInput, val: string | number) =>
    onChange(inputs.map((inp, idx) => (idx === i ? { ...inp, [field]: val } : inp)));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2 text-xs font-bold text-slate-400 uppercase px-1">
        <span>变量名</span><span>展示名</span><span>单位</span><span>默认值</span>
      </div>
      {inputs.map((inp, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 items-center">
          <input
            className="input-cell font-mono"
            placeholder="变量名"
            value={inp.key}
            onChange={e => set(i, 'key', e.target.value)}
          />
          <input
            className="input-cell"
            placeholder="展示名"
            value={inp.label}
            onChange={e => set(i, 'label', e.target.value)}
          />
          <input
            className="input-cell"
            placeholder="单位"
            value={inp.unit ?? ''}
            onChange={e => set(i, 'unit', e.target.value)}
          />
          <div className="flex gap-1">
            <input
              className="input-cell flex-1"
              type="number"
              placeholder="默认值"
              value={inp.defaultValue ?? ''}
              onChange={e => set(i, 'defaultValue', parseFloat(e.target.value) || 0)}
            />
            <button onClick={() => remove(i)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
      <button onClick={add} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
        <Plus size={12} /> 添加输入
      </button>
    </div>
  );
}

function OutputsEditor({
  outputs,
  onChange,
}: {
  outputs: NodeOutput[];
  onChange: (v: NodeOutput[]) => void;
}) {
  const add = () => onChange([...outputs, { key: '', label: '', unit: '' }]);
  const remove = (i: number) => onChange(outputs.filter((_, idx) => idx !== i));
  const set = (i: number, field: keyof NodeOutput, val: string) =>
    onChange(outputs.map((o, idx) => (idx === i ? { ...o, [field]: val } : o)));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-400 uppercase px-1">
        <span>变量名</span><span>展示名</span><span>单位</span>
      </div>
      {outputs.map((o, i) => (
        <div key={i} className="grid grid-cols-3 gap-2 items-center">
          <input className="input-cell font-mono" placeholder="变量名" value={o.key} onChange={e => set(i, 'key', e.target.value)} />
          <input className="input-cell" placeholder="展示名" value={o.label} onChange={e => set(i, 'label', e.target.value)} />
          <div className="flex gap-1">
            <input className="input-cell flex-1" placeholder="单位" value={o.unit ?? ''} onChange={e => set(i, 'unit', e.target.value)} />
            <button onClick={() => remove(i)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
      <button onClick={add} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
        <Plus size={12} /> 添加输出
      </button>
    </div>
  );
}

// ─── 行内测试面板 ─────────────────────────────────────────────────────────────

function TestPanel({ node }: { node: AppNode }) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(node.inputs.map(i => [i.key, i.defaultValue ?? 0]))
  );
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: node.id,
          inputs: values,
          logic: node.logic,
          outputKeys: node.outputs.map(o => o.key),
        }),
      });
      const json = await res.json() as { success: boolean; data?: { outputs: Record<string, number> }; error?: string };
      if (!json.success) throw new Error(json.error);
      setResult(json.data!.outputs);
    } catch (e) {
      setError(e instanceof Error ? e.message : '计算失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <p className="text-xs font-bold text-slate-500 uppercase mb-3">测试运行</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        {node.inputs.map(inp => (
          <div key={inp.key}>
            <label className="text-xs text-slate-500 mb-1 block">{inp.label} {inp.unit ? `(${inp.unit})` : ''}</label>
            <input
              type="number"
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
              value={values[inp.key] ?? 0}
              onChange={e => setValues(prev => ({ ...prev, [inp.key]: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        ))}
      </div>
      <button
        onClick={run}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        <Play size={14} fill="currentColor" />
        {loading ? '计算中...' : '运行'}
      </button>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {result && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
          {node.outputs.map(o => (
            <div key={o.key} className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">{o.label}</p>
              <p className="text-lg font-bold text-primary">
                {typeof result[o.key] === 'number'
                  ? result[o.key].toLocaleString('zh-CN', { maximumFractionDigits: 4 })
                  : '—'}
                {o.unit ? <span className="text-xs font-normal text-slate-400 ml-1">{o.unit}</span> : null}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 可展开编辑行 ─────────────────────────────────────────────────────────────

function NodeRow({
  node,
  onUpdate,
  onDelete,
  onPublish,
  onUnpublish,
}: {
  node: AppNode;
  onUpdate: (changes: Partial<AppNode>) => void;
  onDelete: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<AppNode>({ ...node });
  const [showTest, setShowTest] = useState(false);

  const saveChanges = () => {
    onUpdate(editing);
    setExpanded(false);
  };

  const cancelEdit = () => {
    setEditing({ ...node });
    setExpanded(false);
  };

  return (
    <>
      {/* 主行 */}
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-5 py-3">
          <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{node.id}</span>
        </td>
        <td className="px-5 py-3 font-medium text-sm text-slate-800">{node.name}</td>
        <td className="px-5 py-3 text-xs text-slate-500">{node.category}</td>
        <td className="px-5 py-3 text-xs text-slate-400 max-w-[120px] truncate">
          {node.inputs.map(i => i.label).join(' · ')}
        </td>
        <td className="px-5 py-3 max-w-[160px]">
          <code className="text-xs text-slate-400 truncate block">{node.logic.split('\n')[0]}</code>
        </td>
        <td className="px-5 py-3 text-xs text-slate-400">
          {node.outputs.map(o => o.label).join(' · ')}
        </td>
        <td className="px-5 py-3">
          {node.status === 'published' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
              <CheckCircle size={10} /> 已发布
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
              草稿
            </span>
          )}
        </td>
        <td className="px-5 py-3">
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={() => { setShowTest(!showTest); setExpanded(false); }}
              className="text-xs text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              <Play size={12} /> 测试
            </button>
            {node.status === 'published' ? (
              <button onClick={onUnpublish} className="text-xs text-orange-500 hover:text-orange-700 transition-colors">撤回</button>
            ) : (
              <button onClick={onPublish} className="text-xs text-green-600 hover:text-green-800 transition-colors">发布</button>
            )}
            <button
              onClick={() => { setExpanded(!expanded); setShowTest(false); }}
              className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              编辑 {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-600 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>

      {/* 测试面板行 */}
      {showTest && (
        <tr>
          <td colSpan={8} className="px-5 py-2 bg-slate-50 border-b border-slate-100">
            <TestPanel node={node} />
          </td>
        </tr>
      )}

      {/* 展开编辑行 */}
      {expanded && (
        <tr>
          <td colSpan={8} className="px-5 py-4 bg-violet-50/50 border-b border-violet-100">
            <div className="space-y-5 max-w-5xl">
              {/* 基本信息 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="field-label">节点名称</label>
                  <input className="input-field" value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label">分类</label>
                  <input className="input-field" value={editing.category} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label">来源步骤</label>
                  <input className="input-field" value={editing.source ?? ''} onChange={e => setEditing(p => ({ ...p, source: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="field-label">描述</label>
                <input className="input-field" value={editing.description} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} />
              </div>

              {/* 输入字段 */}
              <div>
                <label className="field-label">输入字段</label>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <InputsEditor inputs={editing.inputs} onChange={v => setEditing(p => ({ ...p, inputs: v }))} />
                </div>
              </div>

              {/* 计算逻辑 */}
              <div>
                <label className="field-label">计算逻辑（JavaScript）</label>
                <textarea
                  className="w-full font-mono text-sm border border-slate-200 rounded-xl p-3 h-32 resize-y bg-slate-900 text-green-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={editing.logic}
                  onChange={e => setEditing(p => ({ ...p, logic: e.target.value }))}
                  spellCheck={false}
                />
                <p className="text-xs text-slate-400 mt-1">变量名须与输入字段的「变量名」一致；输出字段的变量名须在逻辑中被赋值</p>
              </div>

              {/* 输出字段 */}
              <div>
                <label className="field-label">输出字段</label>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <OutputsEditor outputs={editing.outputs} onChange={v => setEditing(p => ({ ...p, outputs: v }))} />
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={saveChanges} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  保存
                </button>
                <button onClick={cancelEdit} className="px-5 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                  取消
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── 新建节点弹窗 ─────────────────────────────────────────────────────────────

const DEFAULT_INPUTS: NodeInput[] = [{ key: 'x', label: '输入1', unit: '', defaultValue: 0 }];
const DEFAULT_LOGIC = 'result = x;';
const DEFAULT_OUTPUTS: NodeOutput[] = [{ key: 'result', label: '输出1', unit: '' }];

function NewNodeModal({
  categories,
  onConfirm,
  onClose,
}: {
  categories: string[];
  onConfirm: (partial: Omit<AppNode, 'id' | 'status'>) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ROI模块');
  const [description, setDescription] = useState('');
  const [inputs, setInputs] = useState<NodeInput[]>(DEFAULT_INPUTS);
  const [logic, setLogic] = useState(DEFAULT_LOGIC);
  const [outputs, setOutputs] = useState<NodeOutput[]>(DEFAULT_OUTPUTS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!name.trim()) {
      setError('节点名称不能为空');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onConfirm({ name: name.trim(), category, description, inputs, logic, outputs });
    } catch (e) {
      setError(e instanceof Error ? e.message : '创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg text-slate-800 mb-4">新建节点</h3>

        <div className="space-y-4 mb-5">
          {/* 节点名称 */}
          <div>
            <label className="field-label">节点名称 <span className="text-red-400">*</span></label>
            <input
              className="input-field"
              placeholder="例：利润计算器"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* 所属分类 */}
          <div>
            <label className="field-label">所属分类 <span className="text-red-400">*</span></label>
            <input
              className="input-field"
              list="category-suggestions"
              placeholder="ROI模块 / 市场潜力 / ..."
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
            <datalist id="category-suggestions">
              {categories.filter(c => c !== '全部').map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* 描述 */}
          <div>
            <label className="field-label">描述</label>
            <textarea
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="简短描述该节点的用途（可选）"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* 输入字段 */}
          <div>
            <label className="field-label">输入字段</label>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <InputsEditor inputs={inputs} onChange={setInputs} />
            </div>
          </div>

          {/* 计算逻辑 */}
          <div>
            <label className="field-label">计算逻辑（JavaScript）</label>
            <textarea
              className="w-full font-mono text-sm border border-slate-200 rounded-xl p-3 h-28 resize-y bg-slate-900 text-green-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={logic}
              onChange={e => setLogic(e.target.value)}
              spellCheck={false}
            />
            <p className="text-xs text-slate-400 mt-1">变量名须与输入字段的「变量名」一致；输出字段的变量名须在逻辑中被赋值</p>
          </div>

          {/* 输出字段 */}
          <div>
            <label className="field-label">输出字段</label>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <OutputsEditor outputs={outputs} onChange={setOutputs} />
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <p className="mb-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            {submitting && (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {submitting ? '创建中...' : '创建'}
          </button>
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

export default function AdminNodes({ currentPath, onNavigate }: { currentPath: string; onNavigate: (path: string) => void }) {
  const { nodes, loading, error, addNode, updateNode, deleteNode, publishNode, unpublishNode, resetToDefault } = useNodes();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('全部');
  const [showNewModal, setShowNewModal] = useState(false);

  const categories: string[] = ['全部', ...Array.from(new Set<string>(nodes.map(n => n.category)))];

  const filtered = nodes.filter(n => {
    const matchSearch = !search || n.name.includes(search) || n.id.includes(search) || n.category.includes(search);
    const matchCat = filterCat === '全部' || n.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleNew = async (partial: Omit<AppNode, 'id' | 'status'>) => {
    try {
      await addNode(partial);
      setShowNewModal(false);
    } catch (e) {
      console.error('创建节点失败', e);
      // Re-throw so the modal can display the error inline
      throw e;
    }
  };

  return (
    <div className="h-screen bg-surface-container-lowest font-body flex flex-col overflow-hidden">
      <style>{`
        .input-cell { width:100%; border:1px solid #e2e8f0; border-radius:8px; padding:4px 8px; font-size:13px; outline:none; }
        .input-cell:focus { border-color:#7c3aed; box-shadow:0 0 0 2px rgba(124,58,237,.15); }
        .input-field { width:100%; border:1px solid #e2e8f0; border-radius:10px; padding:7px 12px; font-size:13px; outline:none; }
        .input-field:focus { border-color:#7c3aed; box-shadow:0 0 0 2px rgba(124,58,237,.15); }
        .field-label { display:block; font-size:12px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em; margin-bottom:6px; }
      `}</style>

      <TopNavBar currentPath={currentPath} onNavigate={onNavigate} />
      <div className="flex flex-1 pt-14 overflow-hidden">
        <ResizableSidebar side="left" initialWidth={256} minWidth={200} maxWidth={360} className="h-full">
          <AdminSidebar currentPath={currentPath} onNavigate={onNavigate} />
        </ResizableSidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-14 flex items-center justify-between px-6 border-b border-outline-variant/10 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800">节点管理</h1>
              <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{nodes.length} 个节点</span>
            </div>
            <div className="flex items-center gap-3">
              {/* 分类过滤 */}
              <div className="flex gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      filterCat === cat ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* 搜索 */}
              <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 gap-2">
                <Search size={14} className="text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索节点..."
                  className="bg-transparent text-sm w-36 outline-none text-slate-700 placeholder-slate-400"
                />
              </div>
              <button
                onClick={resetToDefault}
                title="重置为默认数据"
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus size={15} /> 新建节点
              </button>
            </div>
          </header>

          {/* Loading / Error */}
          {loading && (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-slate-300 border-t-primary rounded-full" />
              加载节点数据…
            </div>
          )}
          {error && !loading && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              加载失败：{error}（请确认 API 服务运行在 localhost:3002）
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                <tr>
                  {['ID', '节点名称', '分类', '输入', '计算逻辑', '输出', '状态', '操作'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(node => (
                  <NodeRow
                    key={node.id}
                    node={node}
                    onUpdate={changes => updateNode(node.id, changes)}
                    onDelete={() => deleteNode(node.id)}
                    onPublish={() => publishNode(node.id)}
                    onUnpublish={() => unpublishNode(node.id)}
                  />
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400 text-sm">
                      没有找到匹配的节点
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </main>
      </div>

      {showNewModal && (
        <NewNodeModal
          categories={categories}
          onConfirm={handleNew}
          onClose={() => setShowNewModal(false)}
        />
      )}
    </div>
  );
}
