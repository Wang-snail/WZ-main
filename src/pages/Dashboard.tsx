import { Sparkles, Zap, Mail, BarChart2, Shield, MoreVertical, Receipt, ArrowRight, Plus, Network, Bot } from 'lucide-react';
import TopNavBar from '../components/TopNavBar';

export default function Dashboard({ currentPath, onNavigate, onOpenAIAssistant }: { currentPath: string, onNavigate: (path: string) => void, onOpenAIAssistant?: () => void }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body pb-24">
      <TopNavBar currentPath={currentPath} onNavigate={onNavigate} />
      <main className="pt-24 px-6 max-w-6xl mx-auto space-y-16">
        <section className="relative">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-primary font-headline mb-2">欢迎回来，设计师</h1>
            <p className="text-on-surface-variant text-sm">今天想开启什么样的自动化流程？</p>
          </div>
          
          <div className="bg-surface-container-low rounded-2xl p-8 lg:p-12 relative overflow-hidden group shadow-sm border border-outline-variant/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-base font-semibold text-primary mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-tertiary" />
                快速开始
              </h2>
              <div className="relative">
                <textarea 
                  className="w-full bg-surface-container-lowest border-none rounded-xl p-6 text-sm text-on-surface placeholder:text-outline shadow-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[160px] outline-none" 
                  placeholder="告诉我你想自动化什么..."
                ></textarea>
                <div className="absolute bottom-4 right-4 flex items-center gap-4">
                  <span className="text-xs text-outline font-medium">支持自然语言描述逻辑</span>
                  <button onClick={() => onNavigate('flow')} className="bg-primary text-on-primary text-sm px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98] shadow-sm">
                    <span>生成流程</span>
                    <Zap size={16} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-xl font-bold text-primary font-headline">最近流程</h2>
            <button onClick={() => onNavigate('flow')} className="text-sm font-semibold text-secondary hover:underline">查看全部流程</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div onClick={() => onNavigate('flow')} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-primary-container rounded-lg text-on-primary-container">
                  <Mail size={20} />
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  Active
                </span>
              </div>
              <h3 className="text-base font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">客户邮件自动化分类</h3>
              <p className="text-sm text-on-surface-variant mb-6">分类收到的询价邮件并同步至 CRM</p>
              <div className="flex items-center justify-between pt-4 border-t border-surface-container-high">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-outline font-bold">运行频率</span>
                  <span className="text-sm font-medium text-on-surface">12 次 / 小时</span>
                </div>
                <button className="text-outline hover:text-primary transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            <div onClick={() => onNavigate('flow')} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-secondary-container rounded-lg text-on-secondary-container">
                  <BarChart2 size={20} />
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                  Idle
                </span>
              </div>
              <h3 className="text-base font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">周报数据聚合统计</h3>
              <p className="text-sm text-on-surface-variant mb-6">每周五自动从飞书多维表格提取数据</p>
              <div className="flex items-center justify-between pt-4 border-t border-surface-container-high">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-outline font-bold">运行频率</span>
                  <span className="text-sm font-medium text-on-surface">1 次 / 周</span>
                </div>
                <button className="text-outline hover:text-primary transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            <div onClick={() => onNavigate('flow')} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-tertiary-container rounded-lg text-on-tertiary-container">
                  <Shield size={20} />
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  Active
                </span>
              </div>
              <h3 className="text-base font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">异常登录实时报警</h3>
              <p className="text-sm text-on-surface-variant mb-6">检测服务器异常登录并推送钉钉</p>
              <div className="flex items-center justify-between pt-4 border-t border-surface-container-high">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-outline font-bold">运行频率</span>
                  <span className="text-sm font-medium text-on-surface">24/7 监控</span>
                </div>
                <button className="text-outline hover:text-primary transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <h2 className="text-xl font-bold text-primary font-headline mr-4">热门模板</h2>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-medium shadow-sm">全部</button>
              <button className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high transition-colors">信息收集</button>
              <button className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high transition-colors">分析报告</button>
              <button className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high transition-colors">监控报警</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div onClick={() => onNavigate('template')} className="md:col-span-2 bg-primary rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[320px] shadow-md group cursor-pointer">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPYBYtYjHIH2d7v-qe_-sNKI36WlWbHhn4i8o3RpQspzY-91gvPYyXE3KkexxptU0NLKg1SyYuaK6buTzWz_pnAUWYDG2lVAZGaMWmCYOIXUJK33Mvi1Mt87DepsNUm5ju7xypmAW4QPq3p6jSecpiEOpMZyFbM9n8Mp_jT_Ic_TUHbjMrUSOm7LguQgzg7USNB8iT-B1eGzcznKaA1GeLvNlTUi74jJV9KLRx67sENn1o0SlxWR2H5gx4jnL9VfOvE6BVyU0TmLTK" 
                alt="Abstract Background" 
                className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="relative z-10">
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded backdrop-blur uppercase tracking-widest font-bold mb-5 inline-block">Pro 模板</span>
                <h3 className="text-xl font-bold mb-4 leading-tight font-headline">企业级销售漏斗<br/>智能同步系统</h3>
                <p className="text-white/80 max-w-md text-sm leading-relaxed">连接 Salesforce, Slack 与数据仓库，实现销售数据的零延迟感知。</p>
              </div>
              <div className="relative z-10 mt-8">
                <button className="bg-white text-primary text-sm px-6 py-2.5 rounded-lg font-bold hover:bg-white/90 transition-colors shadow-sm active:scale-95">
                  立即使用
                </button>
              </div>
            </div>
            
            <div onClick={() => onNavigate('template')} className="bg-surface-container-low rounded-2xl p-6 flex flex-col border border-outline-variant/10 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-5">
                <Network size={24} />
              </div>
              <h4 className="font-bold text-base mb-2 text-primary font-headline">社群运营助手</h4>
              <p className="text-sm text-on-surface-variant flex-grow leading-relaxed">自动欢迎新成员，定时发布内容，管理违规关键词。</p>
              <div className="mt-6 text-primary font-semibold text-sm flex items-center gap-1">
                查看详情 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            <div onClick={() => onNavigate('template')} className="bg-surface-container-low rounded-2xl p-6 flex flex-col border border-outline-variant/10 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-5">
                <Receipt size={24} />
              </div>
              <h4 className="font-bold text-base mb-2 text-primary font-headline">财务报销流</h4>
              <p className="text-sm text-on-surface-variant flex-grow leading-relaxed">OCR 识别发票并自动填报，同步至企业微信审批流程。</p>
              <div className="mt-6 text-primary font-semibold text-sm flex items-center gap-1">
                查看详情 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>
      </main>

<button onClick={() => onNavigate('flow')} className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl shadow-primary/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
<Plus size={24} strokeWidth={2.5} />
</button>

{onOpenAIAssistant && (
<button
onClick={onOpenAIAssistant}
className="fixed bottom-8 right-24 w-14 h-14 rounded-full bg-tertiary text-on-tertiary shadow-xl shadow-tertiary/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"
>
<Bot size={24} strokeWidth={2.5} />
</button>
)}
</div>
);
}
