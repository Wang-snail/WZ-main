export function HotTools() {
  // 临时模拟数据
  const tools = [
    {
      id: 1,
      name: '竞品价格监控',
      slug: 'competitor-price-monitor',
      description: '实时监控竞品价格变化',
      icon: '/tools/price-monitor-icon.png',
      category: 'sourcing',
      rating: 4.8,
      reviewCount: 2341
    },
    {
      id: 2,
      name: '关键词挖掘器',
      slug: 'keyword-miner',
      description: '挖掘高搜索量、低竞争的关键词',
      icon: '/tools/keyword-icon.png',
      category: 'sourcing',
      rating: 4.9,
      reviewCount: 1892
    },
    {
      id: 3,
      name: '利润计算器',
      slug: 'profit-calculator',
      description: '计算产品利润和 FBA 费用',
      icon: '/tools/profit-icon.png',
      category: 'analytics',
      rating: 4.7,
      reviewCount: 1567
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tools.map((tool: any) => (
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
  );
}
