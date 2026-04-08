import { Search, MoreVertical } from 'lucide-react';
import TopNavBar from '../../components/TopNavBar';
import AdminSidebar from '../../components/AdminSidebar';
import ResizableSidebar from '../../components/ResizableSidebar';

export default function AdminUsers({ currentPath, onNavigate }: { currentPath: string, onNavigate: (path: string) => void }) {
  const users = [
    { id: 'U-1001', name: 'Admin User', email: 'admin@flowcraft.com', role: 'Super Admin', status: 'Active', lastLogin: '2026-04-07 10:00' },
    { id: 'U-1002', name: 'Design Lead', email: 'designer@flowcraft.com', role: 'Editor', status: 'Active', lastLogin: '2026-04-06 15:30' },
    { id: 'U-1003', name: 'Test User', email: 'test@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '2026-03-20 09:12' },
  ];

  return (
    <div className="h-screen bg-surface-container-lowest font-body flex flex-col overflow-hidden">
      <TopNavBar currentPath={currentPath} onNavigate={onNavigate} />
      <div className="flex flex-1 pt-14 overflow-hidden">
        <ResizableSidebar side="left" initialWidth={256} minWidth={200} maxWidth={400} className="h-full">
          <AdminSidebar currentPath={currentPath} onNavigate={onNavigate} />
        </ResizableSidebar>
        <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-8 border-b border-outline-variant/10 shrink-0">
          <h1 className="text-2xl font-bold text-on-surface">用户信息管理</h1>
          <div className="flex items-center bg-surface-container rounded-lg px-3 py-1.5">
            <Search size={16} className="text-outline" />
            <input type="text" placeholder="搜索用户..." className="bg-transparent border-none focus:ring-0 text-sm w-48 text-on-surface placeholder-outline ml-2 outline-none" />
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-white border border-outline-variant/10 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">用户ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">邮箱</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">角色</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">最后登录</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{user.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${user.role === 'Super Admin' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{user.lastLogin}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <MoreVertical size={18} />
                      </button>
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
