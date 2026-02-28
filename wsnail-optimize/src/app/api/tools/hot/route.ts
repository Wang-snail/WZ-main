import { NextResponse } from 'next/server';

export async function GET() {
  const hotTools = [
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

  return NextResponse.json({
    success: true,
    data: hotTools
  });
}
