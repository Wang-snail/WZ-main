import { Network, Bell, HelpCircle } from 'lucide-react';

export default function TopNavBar({ 
  currentPath, 
  onNavigate,
  className = "fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/15 shadow-sm",
  rightContent
}: { 
  currentPath: string, 
  onNavigate: (path: string) => void,
  className?: string,
  rightContent?: React.ReactNode
}) {
  return (
    <header className={className}>
      <div className="flex justify-between items-center h-14 px-6 w-full max-w-[1600px] mx-auto">
        <div className="flex items-center gap-8 h-full">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary">
              <Network size={18} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-primary tracking-tight font-headline">织流 FlowCraft</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-2 h-full">
            <button onClick={() => onNavigate('dashboard')} className={`px-4 h-full flex items-center text-sm tracking-wide transition-colors ${currentPath === 'dashboard' ? 'text-primary font-semibold border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}`}>工作台</button>
            <button onClick={() => onNavigate('flow')} className={`px-4 h-full flex items-center text-sm tracking-wide transition-colors ${currentPath === 'flow' ? 'text-primary font-semibold border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}`}>流程</button>
            <button onClick={() => onNavigate('template')} className={`px-4 h-full flex items-center text-sm tracking-wide transition-colors ${currentPath === 'template' ? 'text-primary font-semibold border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}`}>模板</button>
            <button onClick={() => onNavigate('report')} className={`px-4 h-full flex items-center text-sm tracking-wide transition-colors ${currentPath === 'report' ? 'text-primary font-semibold border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}`}>报告</button>
            <button onClick={() => onNavigate('settings')} className={`px-4 h-full flex items-center text-sm tracking-wide transition-colors ${currentPath === 'settings' ? 'text-primary font-semibold border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}`}>设置</button>
          </nav>
        </div>
        
        {rightContent || (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate('admin/nodes')} className="text-sm font-medium text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-full mr-2">
                后台管理
              </button>
              <button className="text-primary p-2 rounded-full hover:bg-surface-container-high transition-colors">
                <Bell size={20} />
              </button>
              <button className="text-primary p-2 rounded-full hover:bg-surface-container-high transition-colors">
                <HelpCircle size={20} />
              </button>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary-container overflow-hidden ring-2 ring-primary/10 cursor-pointer" onClick={() => onNavigate('settings')}>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGs0lyd1vo6e8klmbPQp9l0kdSLDHcMtpXNwjj83E7ghm5w5KHOE1yeBHHzDHiAKqGoi1bVq09DPByoX_vhRVZzdORdS_2TVKinEZwyKGrvsnwhdaBfUC4rvFHr2CxjufJhWjHBPf0w7YL4C8QcOupMAANA2tSfzQ33pHy_9afi4GvwCT8pwUZZDLQ0vuknsbW6-m5OgmxmMrDdKIYyG0rozmP54V70e_7ZZTJgVRRqZNBC62xw4dhqYpD9ByKhORuNbDMjI8s8jqC" 
                alt="User Avatar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
