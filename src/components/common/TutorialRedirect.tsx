import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * 实战指南重定向组件
 * 将旧的实战指南URL重定向到数据实验室相应功能
 */
const TutorialRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // 提取语言前缀和基础路径
    const languageMatch = currentPath.match(/^\/([a-z]{2})(\/.*)?$/);
    const language = languageMatch ? languageMatch[1] : '';
    const basePath = languageMatch ? (languageMatch[2] || '/') : currentPath;
    
    // 构建重定向目标的辅助函数
    const buildRedirectTarget = (targetPath: string) => {
      if (language && ['en', 'jp', 'kr', 'es', 'fr', 'ru', 'pt'].includes(language)) {
        return `/${language}${targetPath}`;
      }
      return targetPath;
    };

    // 重定向映射配置
    const redirectMappings: Record<string, string> = {
      // 基础路径重定向
      '/workflows': '/lab',
      '/guides': '/lab',
      '/tutorials': '/lab',
      '/实战指南': '/lab',
      
      // 具体实战指南重定向到相应的数据实验室应用
      '/workflows/product-listing': '/lab?app=market-analysis',
      '/workflows/competitor-analysis': '/lab?app=brand-ranking',
      '/workflows/content-generation': '/lab?app=pricing-calculator',
      '/workflows/supplier-evaluation': '/lab?app=supplier-evaluation',
      '/workflows/sales-forecast': '/lab?app=sales-forecast',
      '/workflows/inventory-optimization': '/lab?app=inventory-optimization'
    };

    // 检查是否需要重定向
    let redirectTarget: string | null = null;
    
    // 首先检查完整路径的精确匹配
    if (redirectMappings[currentPath]) {
      redirectTarget = redirectMappings[currentPath];
    }
    // 然后检查基础路径匹配（用于多语言支持）
    else if (redirectMappings[basePath]) {
      redirectTarget = buildRedirectTarget(redirectMappings[basePath]);
    }
    
    if (redirectTarget) {
      // 执行重定向
      navigate(redirectTarget, { replace: true });
      
      // 记录重定向事件（用于分析）
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'tutorial_redirect', {
          event_category: 'navigation',
          event_label: `${currentPath} -> ${redirectTarget}`,
          value: 1
        });
      }
    }
  }, [location.pathname, navigate]);

  // 这个组件不渲染任何内容
  return null;
};

export default TutorialRedirect;