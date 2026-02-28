import { NextResponse } from 'next/server';

export async function GET() {
  const updates = [
    {
      id: 1,
      title: 'Amazon 政策更新',
      content: '新的 Listing 规范将于 3 月 1 日生效',
      type: 'policy',
      isUrgent: true,
      createdAt: '2026-02-28T10:00:00Z',
      publishedAt: '2026-02-28T10:00:00Z'
    },
    {
      id: 2,
      title: '爆款关键词',
      content: '#eco-friendly  #sustainable  #biodegradable 搜索量增长 234%',
      type: 'keyword',
      isUrgent: false,
      createdAt: '2026-02-28T09:00:00Z',
      publishedAt: '2026-02-28T09:00:00Z'
    }
  ];

  return NextResponse.json({
    success: true,
    data: updates
  });
}
