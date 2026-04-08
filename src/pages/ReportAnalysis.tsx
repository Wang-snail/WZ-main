import TopNavBar from '../components/TopNavBar';
import { Calendar, Download, Verified, Zap, Clock, Search, Filter, Activity } from 'lucide-react';

export default function ReportAnalysis({ currentPath, onNavigate }: { currentPath: string, onNavigate: (path: string) => void }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">
      <TopNavBar currentPath={currentPath} onNavigate={onNavigate} />
      
      <main className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">运行报告分析</h1>
            <p className="text-on-surface-variant mt-2 text-sm">基于过去 30 天的全量流程执行深度洞察</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-lg font-medium text-sm hover:bg-surface-variant transition-colors">
              <Calendar size={18} /> <span>近 30 天</span>
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium text-sm hover:opacity-90 transition-opacity shadow-sm">
              <Download size={18} /> <span>导出报告</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-tertiary-container/30 rounded-lg text-tertiary"><Verified size={24} /></div>
              <span className="text-xs font-semibold text-tertiary bg-tertiary-container/20 px-2 py-1 rounded-full">+2.4% vs 上月</span>
            </div>
            <p className="text-on-surface-variant text-sm font-medium">成功率</p>
            <h3 className="text-3xl font-extrabold text-primary font-headline tracking-tight mt-1">98.6<span className="text-lg font-medium ml-1">%</span></h3>
            <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-tertiary h-full w-[98.6%] rounded-full"></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary-container/30 rounded-lg text-primary"><Zap size={24} /></div>
              <span className="text-xs font-semibold text-primary bg-primary-container/20 px-2 py-1 rounded-full">+12k 活跃</span>
            </div>
            <p className="text-on-surface-variant text-sm font-medium">总执行量</p>
            <h3 className="text-3xl font-extrabold text-primary font-headline tracking-tight mt-1">1,284,092</h3>
            <div className="mt-4 h-8 flex items-end gap-1">
              <div className="flex-1 bg-primary-container h-1/2 rounded-sm"></div>
              <div className="flex-1 bg-primary-container h-2/3 rounded-sm"></div>
              <div className="flex-1 bg-primary-container h-3/4 rounded-sm"></div>
              <div className="flex-1 bg-primary-container h-1/2 rounded-sm"></div>
              <div className="flex-1 bg-primary h-full rounded-sm"></div>
              <div className="flex-1 bg-primary-container h-5/6 rounded-sm"></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary-container/30 rounded-lg text-secondary"><Clock size={24} /></div>
              <span className="text-xs font-semibold text-error bg-error-container/10 px-2 py-1 rounded-full">-120ms 优化</span>
            </div>
            <p className="text-on-surface-variant text-sm font-medium">平均耗时</p>
            <h3 className="text-3xl font-extrabold text-primary font-headline tracking-tight mt-1">342<span className="text-lg font-medium ml-1">ms</span></h3>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium tracking-wide">3 节点参与处理</span>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface font-headline">最近执行日志</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="搜索流程名或 ID..." className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 outline-none" />
              </div>
              <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                <Filter size={20} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">流程名称</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">数据吞吐量</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">执行耗时</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">时间戳</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onNavigate('flow')}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center text-primary"><Activity size={18} /></div>
                      <div>
                        <p className="text-base font-semibold text-on-surface">DataSync_ERP_Global</p>
                        <p className="text-xs text-slate-400">ID: workflow_77210</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> 成功
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant font-medium">12,402 Rows</td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">420ms</td>
                  <td className="px-6 py-5 text-sm text-slate-400 text-right">2023-10-24 14:20:11</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
