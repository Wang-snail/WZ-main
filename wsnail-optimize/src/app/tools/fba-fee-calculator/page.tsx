import { FBAFeeCalculator } from '@/components/FBAFeeCalculator/FBAFeeCalculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FBA 费用计算器 | wsnail.com',
  description: '快速计算亚马逊 FBA 费用，包括配送费、仓储费、销售佣金等，帮助卖家评估产品盈利能力。',
  keywords: 'FBA费用计算器,亚马逊FBA,费用估算,跨境电商,利润计算',
  openGraph: {
    title: 'FBA 费用计算器 | wsnail.com',
    description: '快速计算亚马逊 FBA 费用，帮助卖家评估产品盈利能力',
    type: 'website',
  },
};

export default function FBAFeeCalculatorPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="text-[20px] font-semibold text-gray-900 hover:text-[#0071E3] transition-colors"
            >
              wsnail.com
            </a>
            <nav className="flex gap-6">
              <a href="/" className="text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
                首页
              </a>
              <a href="/tools" className="text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
                工具
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-[40px] md:text-[48px] leading-[1.1] font-semibold text-gray-900 mb-4">
            FBA 费用计算器
          </h1>
          <p className="text-[17px] text-gray-600 mb-4 max-w-2xl mx-auto">
            快速计算亚马逊 FBA 各项费用，准确评估产品盈利能力
          </p>
          <p className="text-[15px] text-gray-500 max-w-2xl mx-auto">
            包括配送费、仓储费、销售佣金等，支持 PDF 导出和结果复制
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <FBAFeeCalculator />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-[32px] font-semibold text-gray-900 mb-12 text-center">功能特点</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0071E3] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">准确计算</h3>
              <p className="text-gray-600">
                基于亚马逊 2024 最新 FBA 费用标准，计算结果准确可靠
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#5856D6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">可视化分析</h3>
              <p className="text-gray-600">
                饼图展示费用占比，清晰了解成本构成
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#34C759] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">导出功能</h3>
              <p className="text-gray-600">
                支持 PDF 报告导出和结果复制，方便保存和分享
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-600 py-8 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[15px]">
            &copy; 2026 wsnail.com. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
