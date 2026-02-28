import { SceneCard } from './SceneCard';

// 临时模拟数据
const scenes = [
  {
    id: 1,
    name: '选品分析',
    slug: 'sourcing',
    icon: '📊',
    toolCount: 18
  },
  {
    id: 2,
    name: '运营工具',
    slug: 'operations',
    icon: '🛠️',
    toolCount: 42
  },
  {
    id: 3,
    name: '市场监控',
    slug: 'monitoring',
    icon: '📈',
    toolCount: 28
  },
  {
    id: 4,
    'name': '知识管理',
    slug: 'knowledge',
    icon: '📚',
    toolCount: 18
  }
];

export function SceneCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {scenes.map((scene: any) => (
        <SceneCard key={scene.id} scene={scene} />
      ))}
    </div>
  );
}
