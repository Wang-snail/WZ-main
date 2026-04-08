import { useState } from 'react';
import { Plus, Search, CheckCircle } from 'lucide-react';
import TopNavBar from '../../components/TopNavBar';
import AdminSidebar from '../../components/AdminSidebar';
import ResizableSidebar from '../../components/ResizableSidebar';

export default function AdminNodes({ currentPath, onNavigate }: { currentPath: string, onNavigate: (path: string) => void }) {
  const [nodes, setNodes] = useState([
    { id: 'N-001', name: '利润计算器', categoryId: '供应链与成本', inputs: ['成本', '售价', '销量'], logic: '利润 = (售价 - 成本) * 销售量', outputs: ['利润', '利润率'], status: 'published' },
    { id: 'N-002', name: '数据持久化', categoryId: '财务与售后', inputs: ['输入数据'], logic: 'return 利润;', outputs: ['成功状态'], status: 'draft' },
    { id: 'N-003', name: '关键词热度抓取', categoryId: '选品与市场调研', inputs: ['关键词', '平台'], logic: 'fetch(api_url)', outputs: ['搜索量', '趋势'], status: 'published' },
  ]);

  const handlePublish = (id: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, status: 'published' } : n));
  };

  return (
    <div className="h-screen bg-surface-container-lowest font-body flex flex-col overflow-hidden">
      <TopNavBar currentPath={currentPath} onNavigate={onNavigate} />
      <div className="flex flex-1 pt-14 overflow-hidden">
        <ResizableSidebar side="left" initialWidth={256} minWidth={200} maxWidth={400} className="h-full">
          <AdminSidebar currentPath={currentPath} onNavigate={onNavigate} />
        </ResizableSidebar>
        <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-8 border-b border-outline-variant/10 shrink-0">
          <h1 className="text-2xl font-bold text-on-surface">节点管理</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-surface-container rounded-lg px-3 py-1.5">
              <Search size={16} className="text-outline" />
              <input type="text" placeholder="搜索节点..." className="bg-transparent border-none focus:ring-0 text-sm w-48 text-on-surface placeholder-outline ml-2 outline-none" />
            </div>
            <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus size={16} /> 新建节点
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-white border border-outline-variant/10 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">节点ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">节点名称</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">父级分类</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">输入</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">计算逻辑</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">输出</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {nodes.map(node => (
                  <tr key={node.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => onNavigate('admin/nodes/edit')} className="text-primary font-mono text-sm font-medium hover:underline">
                        {node.id}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">{node.name}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{node.categoryId}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{node.inputs.join(' / ')}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500 truncate max-w-[150px]">{node.logic}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{node.outputs.join(' / ')}</td>
                    <td className="px-6 py-4">
                      {node.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-tertiary/10 text-tertiary">
                          <CheckCircle size={12} /> 已发布
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          草稿
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => onNavigate('admin/nodes/edit')} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">测试</button>
                      {node.status !== 'published' && (
                        <button onClick={() => handlePublish(node.id)} className="text-sm font-medium text-tertiary hover:text-tertiary-dim transition-colors">发布</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
