import { useState } from 'react';
import { Calculator, Play, ChevronRight, Search } from 'lucide-react';
import TopNavBar from '../components/TopNavBar';
import { useNodes } from '../hooks/useNodes';
import { AppNode } from '../data/nodes';

function ResultCard({ label, value, unit }: { label: string; value: number | null; unit?: string }) {
  const display =
    value === null || value === undefined
      ? '—'
      : value.toLocaleString('zh-CN', { maximumFractionDigits: 4 });

  return (
    <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
      <p className="text-xs text-on-surface-variant mb-1">{label}</p>
      <p className="text-2xl font-bold text-primary">
        {display}
        {unit && <span className="text-sm font-normal text-on-surface-variant ml-1.5">{unit}</span>}
      </p>
    </div>
  );
}

function NodeCalculatorPanel({ node }: { node: AppNode }) {
  const [values, setValues] = useState<Record<string, number>>(
    () => Object.fromEntries(node.inputs.map(i => [i.key, i.defaultValue ?? 0]))
  );
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true); setError(''); setResults(null);
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
      setResults(json.data!.outputs);
    } catch (e) {
      setError(e instanceof Error ? e.message : '计算失败，请检查输入值');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 节点说明 */}
      <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Calculator size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-on-surface text-lg">{node.name}</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">{node.description}</p>
            {node.source && (
              <span className="inline-block mt-2 text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">
                来源：{node.source}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 输入表单 */}
      <div>
        <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
          输入参数
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {node.inputs.map(inp => (
            <div key={inp.key} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4">
              <label className="block text-sm font-medium text-on-surface mb-1">
                {inp.label}
                {inp.unit && <span className="ml-1 text-xs text-on-surface-variant">({inp.unit})</span>}
              </label>
              <input
                type="number"
                value={values[inp.key] ?? 0}
                onChange={e =>
                  setValues(prev => ({ ...prev, [inp.key]: parseFloat(e.target.value) || 0 }))
                }
                className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 运行按钮 */}
      <button
        onClick={run}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all"
      >
        <Play size={16} fill="currentColor" />
        {loading ? '计算中...' : '立即计算'}
      </button>

      {/* 错误 */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4 text-sm text-error">
          {error}
        </div>
      )}

      {/* 结果 */}
      {results && (
        <div>
          <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
            计算结果
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {node.outputs.map(o => (
              <ResultCard
                key={o.key}
                label={o.label}
                value={results[o.key] ?? null}
                unit={o.unit}
              />
            ))}
          </div>

          {/* 逻辑展示 */}
          <details className="mt-4">
            <summary className="text-xs text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors select-none">
              查看计算逻辑
            </summary>
            <pre className="mt-2 bg-slate-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto">
              {node.logic}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

export default function NodeCalculator({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  const { publishedNodes } = useNodes();
  const [selectedId, setSelectedId] = useState<string | null>(
    publishedNodes[0]?.id ?? null
  );
  const [search, setSearch] = useState('');

  const categories: string[] = Array.from(new Set<string>(publishedNodes.map(n => n.category)));

  const filtered = publishedNodes.filter(
    n => !search || n.name.includes(search) || n.category.includes(search)
  );

  const selected = publishedNodes.find(n => n.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">
      <TopNavBar currentPath={currentPath} onNavigate={onNavigate} />

      <div className="pt-14 flex h-[calc(100vh-56px)]">
        {/* 左侧节点列表 */}
        <aside className="w-72 shrink-0 border-r border-outline-variant/15 bg-surface-container-lowest flex flex-col">
          <div className="p-4 border-b border-outline-variant/10">
            <h2 className="font-bold text-on-surface mb-3 flex items-center gap-2">
              <Calculator size={18} className="text-primary" />
              节点计算器
            </h2>
            <div className="flex items-center bg-surface-container rounded-lg px-3 py-2 gap-2">
              <Search size={14} className="text-outline" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索节点..."
                className="bg-transparent text-sm w-full outline-none text-on-surface placeholder-outline"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {categories.map(cat => {
              const catNodes = filtered.filter(n => n.category === cat);
              if (catNodes.length === 0) return null;
              return (
                <div key={cat}>
                  <p className="px-4 py-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {cat}
                  </p>
                  {catNodes.map(node => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedId(node.id)}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between group transition-colors ${
                        selectedId === node.id
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{node.name}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                          {node.inputs.map(i => i.label).join(' · ')}
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        className={`shrink-0 transition-transform ${
                          selectedId === node.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <p className="px-4 py-8 text-sm text-center text-on-surface-variant">
                没有找到节点
              </p>
            )}
          </div>
        </aside>

        {/* 右侧计算面板 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-8">
            {selected ? (
              <NodeCalculatorPanel key={selected.id} node={selected} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
                <Calculator size={40} className="opacity-20 mb-4" />
                <p className="text-sm">从左侧选择一个节点开始计算</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
