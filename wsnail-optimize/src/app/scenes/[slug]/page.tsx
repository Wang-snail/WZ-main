import Link from 'next/link';

export const metadata = {
  title: '场景详情 - wsnail.com',
  description: '查看场景推荐工具组合',
};

export default function ScenePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // 临时模拟数据
  const mockScenes: Record<string, any> = {
    sourcing: {
      id: 1,
      name: '选品分析',
      slug: 'sourcing',
      description: '市场调研、竞品分析、关键词挖掘',
      toolCount: 18,
      tools: [
        {
          id: 1,
          name: '关键词挖掘器',
          slug: 'keyword-miner',
          description: '挖掘高搜索量、低竞争的关键词',
          rating: 4.9,
          reviewCount: 1892
        },
        {
          id: 2,
          name: '竞品分析工具',
          slug: 'comparator',
          description: '分析竞品定价、评价、销量',
          rating: 4.8,
          reviewCount: 1567
        },
        {
          id: 3,
          name: '市场趋势工具',
          slug: 'trends',
          description: '追踪市场趋势和季节性波动',
          rating: 4.7,
          reviewCount: 1234
        }
      ]
    },
    operations: {
      id: 2,
      name: '运营工具',
      slug: 'operations',
      description: 'Listing 优化、PPC 管理、库存管理',
      toolCount: 42,
      tools: [
        {
          id: 4,
          name: 'Listing 优化工具',
          slug: 'listing-optimizer',
          description: '优化产品标题、描述、图片',
          rating: 4.8,
          reviewCount: 2341
        },
        {
          id: 5,
          name: 'PPC 管理工具',
          slug: 'ppc-manager',
          description: '管理广告活动和关键词',
          rating: 4.6,
          reviewCount: 987
        }
      ]
    },
    monitoring: {
      id:3,
      name: '市场监控',
      slug: 'monitoring',
      description: '价格追踪、竞品监控、趋势分析',
      toolCount: 28,
      tools: [
        {
          id: 6,
          name: '竞品价格监控',
          slug: 'price-monitor',
          description: '实时监控竞品价格变化',
          rating: 4.9,
          reviewCount: 2341
        }
      ]
    },
    knowledge: {
      id: 4,
      name: '知识管理',
      slug: 'knowledge',
      description: 'PARA 方法、笔记整理、知识库',
      toolCount: 18,
      tools: []
    }
  };

  const scene = mockScenes[slug];

  if (!scene) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="text-center">
          <p className="text-[17px] text-gray-500 mb-4">场景不存在</p>
          <Link
            href="/scenes"
            className="text-[17px] text-blue-600 hover:underline"
          >
            ← 返回场景列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F5F7]">
      {/* Hero Section - Apple 风格 */}
      <section className="bg-white text-black py-32">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/scenes"
            className="text-[17px] text-gray-500 hover:text-gray-900 mb-6 inline-block"
          >
            ← 返回
          </Link>
          <h1 className="text-[56px] md:text-[64px] leading-[1.05] font-bold text-gray-900 mb-6">
            {scene.name}
          </h1>
          <p className="text-[24px] md:text-[28px] leading-[1.1] text-gray-600 mb-4">
            {scene.description}
          </p>
          <p className="text-[17px] leading-[1.5] text-gray-500 mb-8">
            {scene.toolCount} 个工具
          </p>
        </div>
      </section>

      {/* Recommended Tools */}
      {scene.tools && scene.tools.length > 0 && (
        <section className="bg-[#F5F5F7] py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-[32px] md:text-[40px] leading-1.1 font-semibold text-gray-900 mb-4">
              推荐工具组合
            </h2>
            <p className="text-[17px] text-gray-600 mb-8">
              为你精选的最佳工具组合
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scene.tools.map((tool: any) => (
                <div
                  key={tool.id}
                  className="bg-white rounded-[20px] p-8 transition-all duration-600 ease-[cubic-bezier(0.4,0,0,2,1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-[24px] font-semibold text-gray-900">{tool.name}</h3>
                    <span className="text-yellow-500 text-2xl">⭐</span>
                  </div>
                  <p className="text-[17px] text-gray-600 mb-6">{tool.description}</p>
                  <div className="flex items-center gap-2 text-[14px] text-gray-500 mb-6">
                    <span className="font-semibold text-gray-900">{tool.rating}</span>
                    <span>({tool.reviewCount})</span>
                  </div>
                  <button className="w-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[17px] font-semibold rounded-full py-3 transition-all duration-600 ease-[cubic-bezier(0.4,0,0,0.2,1)]">
                    立即使用
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
