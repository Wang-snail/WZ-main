import { LayoutGrid, Users, LogOut } from 'lucide-react';

export default function AdminSidebar({ currentPath, onNavigate }: { currentPath: string, onNavigate: (path: string) => void }) {
  return (
    <aside className="w-full h-full bg-[#1e293b] text-slate-300 flex flex-col shrink-0">
      <nav className="flex-1 py-6 px-4 space-y-2">
        <button 
          onClick={() => onNavigate('admin/nodes')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentPath.startsWith('admin/node') ? 'bg-primary text-white' : 'hover:bg-slate-800 hover:text-white'}`}
        >
          <LayoutGrid size={18} />
          <span className="font-medium">节点管理</span>
        </button>
        <button 
          onClick={() => onNavigate('admin/users')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentPath === 'admin/users' ? 'bg-primary text-white' : 'hover:bg-slate-800 hover:text-white'}`}
        >
          <Users size={18} />
          <span className="font-medium">用户管理</span>
        </button>
      </nav>
      <div className="p-4 border-t border-slate-700/50">
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">返回前台</span>
        </button>
      </div>
    </aside>
  );
}
