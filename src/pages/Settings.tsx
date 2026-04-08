import TopNavBar from '../components/TopNavBar';
import { User, CreditCard, Code, Palette, HelpCircle, Edit2, MessageSquare, Mail, Bell, Shield, ShieldCheck } from 'lucide-react';

export default function Settings({ currentPath, onNavigate }: { currentPath: string, onNavigate: (path: string) => void }) {
  return (
    <div className="h-screen bg-surface text-on-surface font-body overflow-hidden flex flex-col">
      <TopNavBar currentPath={currentPath} onNavigate={onNavigate} />
      
      <div className="flex pt-14 flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-48 h-full bg-[#f8fafb] border-r border-surface-container flex flex-col py-6 px-3 shrink-0">
          <div className="mb-8 px-3">
            <h2 className="text-lg font-semibold text-primary">系统设置</h2>
            <p className="text-xs text-on-surface-variant">管理您的偏好与安全</p>
          </div>
          <nav className="flex-1 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-white text-primary shadow-sm rounded-lg font-medium text-sm">
              <User size={16} /> 账号信息
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-100 hover:text-primary rounded-lg transition-colors text-sm">
              <CreditCard size={16} /> 订阅信息
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-100 hover:text-primary rounded-lg transition-colors text-sm">
              <Code size={16} /> API设置
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-100 hover:text-primary rounded-lg transition-colors text-sm">
              <Palette size={16} /> 界面设置
            </button>
          </nav>
          <div className="mt-auto border-t border-surface-container pt-4">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors text-sm">
              <HelpCircle size={16} /> 帮助中心
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12">
              <h1 className="text-2xl font-bold text-primary tracking-tight mb-2">账号信息</h1>
              <p className="text-sm text-on-surface-variant">配置您的个人资料与连接偏好，以便在 FlowCraft 中获得更佳体验。</p>
            </header>

            <div className="space-y-8">
              <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center relative group cursor-pointer">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGs0lyd1vo6e8klmbPQp9l0kdSLDHcMtpXNwjj83E7ghm5w5KHOE1yeBHHzDHiAKqGoi1bVq09DPByoX_vhRVZzdORdS_2TVKinEZwyKGrvsnwhdaBfUC4rvFHr2CxjufJhWjHBPf0w7YL4C8QcOupMAANA2tSfzQ33pHy_9afi4GvwCT8pwUZZDLQ0vuknsbW6-m5OgmxmMrDdKIYyG0rozmP54V70e_7ZZTJgVRRqZNBC62xw4dhqYpD9ByKhORuNbDMjI8s8jqC" alt="Profile" className="rounded-full w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 size={16} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary">个人资料</h3>
                    <p className="text-sm text-on-surface-variant">公开显示的身份信息</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">用户名</label>
                    <input type="text" defaultValue="织流官方" className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">职业角色</label>
                    <input type="text" defaultValue="系统架构师" className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">个人简介</label>
                    <textarea rows={3} defaultValue="专注于自动化流程编排与数字化转型方案的资深专家。" className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none resize-none"></textarea>
                  </div>
                </div>
              </section>

              <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-primary">快速连接</h3>
                  <p className="text-sm text-on-surface-variant">连接第三方服务以启用自动化通知</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg group hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#07c160]/10 flex items-center justify-center text-[#07c160]"><MessageSquare size={20} /></div>
                      <div>
                        <h4 className="text-base font-semibold text-on-surface">微信推送接口</h4>
                        <p className="text-sm text-on-surface-variant">wx_fc_9928374xxxxxx</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium bg-white text-primary border border-outline-variant/20 rounded-lg hover:shadow-sm transition-all">更新配置</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg group hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Mail size={20} /></div>
                      <div>
                        <h4 className="text-base font-semibold text-on-surface">SMTP 服务</h4>
                        <p className="text-sm text-on-surface-variant">smtp.flowcraft.io (已启用)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                      <span className="text-sm font-medium text-tertiary">运行中</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
                  <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2"><Bell size={18} /> 通知偏好</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface">流程成功提醒</span>
                      <div className="w-10 h-5 bg-tertiary/20 rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-tertiary rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between opacity-60">
                      <span className="text-sm text-on-surface">周度效率报告</span>
                      <div className="w-10 h-5 bg-surface-variant rounded-full relative cursor-pointer">
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
                  <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2"><Shield size={18} /> 安全状态</h3>
                  <div className="flex items-center gap-3 p-3 bg-tertiary-container/30 rounded-lg">
                    <ShieldCheck size={20} className="text-on-tertiary-container" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-on-tertiary-container">两步验证已开启</p>
                      <p className="text-xs text-on-tertiary-container/70">上次登录: 2小时前 (上海, 中国)</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex items-center justify-end gap-4 pt-8">
                <button className="px-6 py-2.5 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">取消修改</button>
                <button className="px-8 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold shadow-md shadow-primary/20 hover:opacity-90 transition-all active:scale-95">保存更改</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
