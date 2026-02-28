import { NextResponse } from 'next/server';

export async function GET() {
  const scenes = [
    {
      id: 1,
      name: '选品分析',
      slug: 'sourcing',
      icon: '📊',
      description: '市场调研、竞品分析、关键词挖掘',
      toolCount: 18,
      sortOrder: 1
    },
    {
      id: 2,
      name: '运营工具',
      slug: 'operations',
      icon: '🛠️',
      description: 'Listing 优化、PPC 管理、库存管理',
      toolCount: 42,
      sortOrder: 2
    },
    {
      id: 3,
      name: '市场监控',
      slug: 'monitoring',
      icon: '📈',
      description: '价格追踪、竞品监控、趋势分析',
      toolCount: 28,
      sortOrder: 3
    },
    {
      id: 4,
      name: '知识管理',
      slug: 'knowledge',
      icon: '📚',
      description: 'PARA 方法、笔记整理、知识库',
      toolCount: 18,
      sortOrder: 4
    }
  ];

  return NextResponse.json({
    success: true,
    data: scenes
  });
}
