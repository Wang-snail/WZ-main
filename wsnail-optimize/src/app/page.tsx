import { SceneCards } from '@/components/Scene/SceneCards';
import { MarketUpdates } from '@/components/Market/MarketUpdates';
import { HotTools } from '@/components/Tools/HotTools';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F5F5F7]">
      {/* Hero Section - Apple 风格 */}
      <section className="bg-white text-black py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-[56px] md:text-[64px] leading-[1.05] font-bold text-gray-900 mb-6">
            wsnail.com
          </h1>
          <p className="text-[24px] md:text-[28px] leading-[1.1] text-gray-600 mb-4">
            跨境电商 AI 工具平台
          </p>
          <p className="text-[17px] leading-[1.5] text-gray-500 mb-12">
            106+ 工具，助你轻松运营
          </p>
          <button className="bg-[#0071E3] hover:bg-[#0077ED] text-white text-[17px] font-semibold rounded-full px-8 py-4 transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-lg">
            立即开始
          </button>
        </div>
      </section>

      {/* Scene Selection - Apple 风格 */}
      <section className="bg-[#F5F5F7] py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-[40px] md:text-[48px] leading-[[1.1] font-semibold text-gray-900 mb-4">
            你想做什么？
          </h2>
          <p className="text-[17px] text-gray-600 mb-12">
            选择场景，我们为你推荐最佳工具组合
          </p>
          <SceneCards />
        </div>
      </section>

      {/* Market Updates - Apple 风格 */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-[32px] md:text-[40px] leading-[[1.1] font-semibold text-gray-900 mb-4">
            今日市场动态
          </h2>
          <p className="text-[17px] text-gray-600 mb-8">
            实时市场资讯，不错过任何机会
          </p>
          <MarketUpdates />
        </div>
      </section>

      {/* Hot Tools - Apple 风格 */}
      <section className="bg-[#F5F5F7] py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-[32px] md:text-[40px]] leading-[1.1] font-semibold text-gray-900 mb-4">
            热门工具
          </h2>
          <p className="text-[17px] text-gray-600 mb-8">
            最受用户欢迎的工具
          </p>
          <HotTools />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-600 py-12 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[17px]">
            &copy; 2026 wsnail.com. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
