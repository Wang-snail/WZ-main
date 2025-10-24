import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const location = useLocation();

  // 自动生成面包屑的基础函数
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [{ label: '首页', href: '/' }];

    const pathSegments = location.pathname.split('/').filter(segment => segment);

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      let label = segment;

      // 根据路径设置标签
      switch (segment) {
        case 'ai-tools':
          label = 'AI工具库';
          break;
        case 'analyzer':
          label = '关系分析器';
          break;
        case 'divination':
          label = 'AI占卜';
          break;
        case 'games':
          label = '游戏中心';
          break;
        case 'workflows':
          label = '工作流';
          break;
        case 'sales-tracking':
          label = '销售追踪';
          break;
        case 'tool-reviews':
          label = '工具评测';
          break;
        case 'platform-news':
          label = '平台资讯';
          break;
        case 'kajian-lessons':
          label = '经验库';
          break;
        default:
          // 处理下划线转为空格并首字母大写
          label = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }

      breadcrumbs.push({
        label,
        href: path,
        current: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();

  return (
    <nav aria-label="面包屑导航" className={cn('text-sm', className)}>
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            )}

            {item.current ? (
              <span
                className="font-medium text-gray-900"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                aria-label={`前往${item.label}`}
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-400">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// 自动生成面包屑的便捷组件
const AutoBreadcrumb: React.FC<{ className?: string }> = ({ className }) => {
  return <Breadcrumb items={[]} className={className} />;
};

export { Breadcrumb, AutoBreadcrumb };