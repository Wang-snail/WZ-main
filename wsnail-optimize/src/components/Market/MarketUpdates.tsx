export function MarketUpdates() {
  // 临时模拟数据
  const updates = [
    {
      id: 1,
      title: 'Amazon 政策更新',
      content: '新的 Listing 规范将于 3 月 1 日生效',
      type: 'policy',
      isUrgent: true
    },
    {
      id: 2,
      title: '爆款关键词',
      content: '#eco-friendly  #sustainable  #biodegradable 搜索量增长 234%',
      type: 'keyword',
      isUrgent: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {updates.map((update: any) => (
        <div
          key={update.id}
          className={`bg-[#F5F5F7] rounded-[20px] p-8 transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            update.isUordent ? 'border-l-4 border-red-500' : ''
          }`}
        >
          {update.isUrgent && <span className="text-red-500 text-[17px] font-semibold mr-2">⚠️</span>}
          <h4 className="text-[17px] font-semibold text-gray-900">{update.title}</h4>
          <p className="text-[17px] text-gray-600 mt-2">{update.content}</p>
        </div>
      ))}
    </div>
  );
}
