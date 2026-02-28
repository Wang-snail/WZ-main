import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const scenes: Record<string, any> = {
    sourcing: {
      id: 1,
      name: '选品分析',
      slug: 'sourcing',
      description: '市场调研、竞品分析、关键词挖掘',
      tools: [
        {
          id: 1,
          name: '关键词挖掘器',
          slug: 'keyword-miner',
          description: '挖掘高搜索量、低竞争的关键词',
          rating: 4.9,
          reviewCount: 1892,
          reason: '选品必备工具'
        },
        {
          id: 2,
          name: '竞品分析工具',
          slug: 'competitor-analyzer',
          description: '分析竞品定价、评价、销量',
          rating: 4.8,
          reviewCount: 1567,
          reason: '了解市场竞争'
        },
        {
          id: 3,
          name: '市场趋势工具',
          slug: 'market-trends',
          description: '追踪市场趋势和季节性波动',
          rating: 4.7,
          reviewCount: 1234,
          reason: '把握市场机会'
        }
      ]
    },
    operations: {
      id: 2,
      name: '运营工具',
      slug: 'operations',
      tools: [
        {
          id: 4,
          name: 'Listing 优化工具',
          slug: 'listing-optimizer',
          description: '优化产品标题、描述、图片',
          rating: 4.8,
          reviewCount: 2341,
          reason: '提升转化率'
        },
        {
          id: 5,
          name: 'PPC 管理工具',
          slug: 'ppc-manager',
          description: '管理广告活动和关键词',
          rating: 4.6,
          reviewCount: 987,
          reason: '优化广告 ROI'
        }
      ]
    },
    monitoring: {
      id: 3,
      name: '市场监控',
      slug: 'monitoring',
      tools: [
        {
          id: 6,
          name: '竞品价格监控',
          slug: 'price-monitor',
          description: '实时监控竞品价格变化',
          rating: 4.9,
          reviewCount: 2341,
          reason: '及时调整策略'
        }
      ]
    },
    knowledge: {
      id: 4,
      name: '知识管理',
      slug: 'knowledge',
      tools: []
    }
  };

  const scene = scenes[slug];

  if (!scene) {
    return NextResponse.json({
      success: false,
      error: 'Scene not found'
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: scene
  });
}
