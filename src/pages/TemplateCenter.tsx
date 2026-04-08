import TopNavBar from '../components/TopNavBar';
import { Search, Grid, FileText, Bell, Settings, ArrowRight, Database, Shield, BarChart2, Plus } from 'lucide-react';
import ResizableSidebar from '../components/ResizableSidebar';

export default function TemplateCenter({ currentPath, onNavigate }: { currentPath: string, onNavigate: (path: string) => void }) {
  return (
    <div className="h-screen bg-surface text-on-surface font-body overflow-hidden flex flex-col">
      <TopNavBar currentPath={currentPath} onNavigate={onNavigate} />
      
      <div className="flex pt-14 flex-1 overflow-hidden">
        {/* Sidebar */}
        <ResizableSidebar side="left" initialWidth={256} minWidth={200} maxWidth={400} className="h-full bg-[#f8fafb] border-r border-surface-container py-6 px-4">
          <div className="mb-6 px-2">
            <p className="text-xs font-bold text-outline uppercase tracking-widest">模板目录</p>
          </div>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-white text-primary shadow-sm rounded-lg font-medium">
              <Grid size={18} /> 全部模板
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-100 hover:text-primary rounded-lg font-medium transition-all">
              <FileText size={18} /> 信息收集
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-100 hover:text-primary rounded-lg font-medium transition-all">
              <BarChart2 size={18} /> 分析报告
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-100 hover:text-primary rounded-lg font-medium transition-all">
              <Shield size={18} /> 监控报警
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-100 hover:text-primary rounded-lg font-medium transition-all">
              <Settings size={18} /> 自动化运维
            </button>
          </div>
        </ResizableSidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <header className="mb-12">
              <h1 className="text-2xl font-headline font-extrabold text-primary mb-4 tracking-tight">模板中心</h1>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                  通过预设的工业级工作流模板，快速启动您的自动化业务。从简单的数据采集到复杂的跨系统协同，都能在几分钟内完成部署。
                </p>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                  <input type="text" placeholder="搜索模板..." className="pl-10 pr-4 py-2.5 w-64 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-outline transition-all outline-none" />
                </div>
              </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Template Card 1 */}
              <div onClick={() => onNavigate('flow')} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col">
                <div className="w-full h-32 bg-surface-container-low rounded-lg mb-4 flex items-center justify-center relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                  <div className="flex gap-2 items-center scale-90">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary"><Database size={20} /></div>
                    <ArrowRight size={16} className="text-outline" />
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-tertiary"><BarChart2 size={20} /></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-primary-container text-on-primary-container uppercase tracking-wider">信息收集</span>
                  <span className="text-xs text-outline">2天前</span>
                </div>
                <h3 className="text-base font-semibold text-primary mb-1.5 line-clamp-1">多渠道客户反馈聚合</h3>
                <p className="text-sm text-on-surface-variant mb-4 line-clamp-2 leading-relaxed flex-1">自动从邮件、官网表单和社交媒体收集用户反馈，并使用 AI 进行情感分析，生成结构化周报。</p>
                <button className="w-full py-2 bg-primary text-on-primary rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 mt-auto">
                  <span>使用</span> <ArrowRight size={14} />
                </button>
              </div>

              {/* Template Card 2 */}
              <div onClick={() => onNavigate('flow')} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col">
                <div className="w-full h-32 bg-surface-container-low rounded-lg mb-4 flex items-center justify-center relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent"></div>
                  <div className="flex gap-2 items-center scale-90">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-tertiary"><Shield size={20} /></div>
                    <ArrowRight size={16} className="text-outline" />
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-error"><Bell size={20} /></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-tertiary-container text-on-tertiary-container uppercase tracking-wider">监控报警</span>
                  <span className="text-xs text-outline">热门</span>
                </div>
                <h3 className="text-base font-semibold text-primary mb-1.5 line-clamp-1">实时异常流量监测</h3>
                <p className="text-sm text-on-surface-variant mb-4 line-clamp-2 leading-relaxed flex-1">监控 API 访问频率，当检测到潜在的 DDoS 或恶意爬虫行为时，自动在 Slack 或钉钉触发警报。</p>
                <button className="w-full py-2 bg-primary text-on-primary rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 mt-auto">
                  <span>使用</span> <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <button onClick={() => onNavigate('flow')} className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl shadow-primary/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
}
