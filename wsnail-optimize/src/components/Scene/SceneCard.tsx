'use client';

import { useState } from 'react';

interface SceneCardProps {
  scene: {
    id: number;
    name: string;
    slug: string;
    icon: string;
    toolCount: number;
  };
}

export function SceneCard({ scene }: SceneCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a href={`/scenes/${scene.slug}`} className="block">
      <div
        className="group bg-white rounded-[20px] p-8 transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 图标 */}
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto">
          {scene.icon}
        </div>

        {/* 标题 */}
        <h3 className="text-[32px] leading-[1.15] font-semibold text-center text-gray-900 mb-2">
          {scene.name}
        </h3>

        {/* 描述 */}
        <p className="text-[17px] leading-[1.5] text-center text-gray-600 mb-4">
          {scene.toolCount} 个工具
        </p>

        {/* 按钮（悬停显示） */}
        <div className={`text-center transition-opacity duration-600 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-[17px] font-semibold text-blue-600">
            查看工具 →
          </span>
        </div>
      </div>
    </a>
  );
}
