import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOEnhancerProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  structuredData?: any;
  alternateLanguages?: {
    lang: string;
    url: string;
  }[];
  breadcrumbs?: {
    name: string;
    url: string;
  }[];
}

export default function SEOEnhancer({
  title = "AI工具集合站 - 106+精选AI工具库 | WSNAIL.COM",
  description = "WSNAIL.COM - 精选106+优质AI工具，包含AI聊天机器人、AI搜索引擎、AI图像设计、AI视频制作等。免费AI工具推荐，AI游戏娱乐，让AI为生活增添更多精彩。",
  keywords = "AI工具,AI工具库,AI工具集合,人工智能工具,AI聊天机器人,AI搜索引擎,AI图像设计,AI视频制作,AI游戏,免费AI工具,ChatGPT,AI绘画,AI写作,WSNAIL",
  image = "https://wsnail.com/images/logo.svg",
  url,
  structuredData,
  alternateLanguages = [],
  breadcrumbs = []
}: SEOEnhancerProps) {
  const location = useLocation();

  // 自动生成当前页面URL
  const currentUrl = url || `https://wsnail.com${location.pathname}`;

  // 生成面包屑结构化数据
  const breadcrumbStructuredData = breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  } : null;

  // 根据页面类型生成特定的结构化数据
  const getPageSpecificStructuredData = () => {
    const pathname = location.pathname;

    if (pathname === '/') {
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "WSNAIL.COM - AI工具集合站",
        "url": "https://wsnail.com",
        "description": description,
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://wsnail.com/ai-tools?q={search_term_string}",
          "query-input": "required name=search_term_string"
        },
        "publisher": {
          "@type": "Organization",
          "name": "WSNAIL",
          "url": "https://wsnail.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://wsnail.com/images/logo.svg"
          }
        }
      };
    }

    if (pathname === '/ai-tools') {
      return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "AI工具库 - 精选AI工具集合",
        "description": "收录106+种精选AI工具，覆盖AI聊天、AI绘画、AI视频、AI编程等多个领域",
        "url": currentUrl,
        "mainEntity": {
          "@type": "ItemList",
          "name": "AI工具集合",
          "numberOfItems": "106+"
        }
      };
    }

    if (pathname === '/games') {
      return {
        "@context": "https://schema.org",
        "@type": "GameServer",
        "name": "AI游戏中心 - 智能游戏体验",
        "description": "提供多种AI驱动的智能游戏，包括策略游戏、益智游戏、棋类游戏等",
        "url": currentUrl,
        "gameItem": [
          {
            "@type": "VideoGame",
            "name": "AI井字游戏",
            "genre": "策略游戏",
            "playMode": "SinglePlayer"
          },
          {
            "@type": "VideoGame",
            "name": "AI记忆游戏",
            "genre": "益智游戏",
            "playMode": "SinglePlayer"
          }
        ]
      };
    }



    if (pathname === '/analyzer') {
      return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "AI情感分析器 - 智能关系分析",
        "description": "基于AI技术的情感分析工具，提供专业的人际关系分析和建议",
        "url": currentUrl,
        "applicationCategory": "AnalysisApplication",
        "operatingSystem": "Web Browser"
      };
    }

    return structuredData;
  };

  // 性能优化的关键词生成
  const generateOptimizedKeywords = () => {
    const baseKeywords = keywords.split(',');
    const pageSpecificKeywords = [];

    const pathname = location.pathname;

    if (pathname === '/games') {
      pageSpecificKeywords.push('AI游戏', 'AI小游戏', '在线AI游戏', '智能游戏');
    } else if (pathname === '/analyzer') {
      pageSpecificKeywords.push('情感分析', '关系分析', 'AI心理分析', '情感咨询');
    } else if (pathname === '/ai-tools') {
      pageSpecificKeywords.push('AI工具导航', 'AI工具推荐', '人工智能工具', 'AI软件');
    }

    return [...baseKeywords, ...pageSpecificKeywords].join(',');
  };

  // 生成优化的页面标题
  const getOptimizedTitle = () => {
    const pathname = location.pathname;
    const siteName = "WSNAIL.COM";

    if (pathname === '/') {
      return title;
    } else if (pathname === '/ai-tools') {
      return `AI工具库 - 106+精选AI工具集合 | ${siteName}`;
    } else if (pathname === '/games') {
      return `AI游戏中心 - 10+智能游戏在线体验 | ${siteName}`;
    } else if (pathname === '/analyzer') {
      return `AI情感分析器 - 智能关系分析工具 | ${siteName}`;
    }

    return title;
  };

  // 页面加载性能优化
  useEffect(() => {
    // 预加载关键资源
    const preloadLinks = [
      '/images/logo.svg',
      '/images/backgrounds/ai-tools-bg.jpg'
    ];

    preloadLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = href.endsWith('.svg') ? 'image' : 'image';
      link.href = href;
      document.head.appendChild(link);
    });

    // 设置页面语言
    document.documentElement.lang = 'zh-CN';

    // 添加页面特定的类名用于样式优化
    const bodyClass = `page-${location.pathname.replace('/', '') || 'home'}`;
    document.body.classList.add(bodyClass);

    return () => {
      document.body.classList.remove(bodyClass);
    };
  }, [location.pathname]);

  const pageStructuredData = getPageSpecificStructuredData();

  return (
    <Helmet>
      {/* 基础SEO标签 */}
      <title>{getOptimizedTitle()}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={generateOptimizedKeywords()} />

      {/* Open Graph标签 */}
      <meta property="og:title" content={getOptimizedTitle()} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="WSNAIL.COM" />
      <meta property="og:locale" content="zh_CN" />

      {/* Twitter Card标签 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={getOptimizedTitle()} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* 技术SEO标签 */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />

      {/* 网站验证和分析 */}
      <meta name="google-site-verification" content="your-verification-code" />
      <meta name="msvalidate.01" content="your-bing-verification-code" />

      {/* 移动端优化 */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* 性能优化 */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* 多语言支持 */}
      {alternateLanguages.map(alt => (
        <link
          key={alt.lang}
          rel="alternate"
          hrefLang={alt.lang}
          href={alt.url}
        />
      ))}

      {/* 图标和manifest */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* DNS预解析 - 已移除fonts.googleapis.com，因为使用系统字体 */}
      <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
      <link rel="dns-prefetch" href="//vercel.com" />

      {/* 结构化数据 */}
      {pageStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(pageStructuredData)}
        </script>
      )}

      {/* 面包屑结构化数据 */}
      {breadcrumbStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      )}

      {/* 网站整体结构化数据 */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "WSNAIL",
          "url": "https://wsnail.com",
          "logo": "https://wsnail.com/images/logo.svg",
          "sameAs": [
            "https://github.com/wsnail",
            "https://twitter.com/wsnail"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": ["Chinese", "English"]
          }
        })}
      </script>

      {/* 实时聊天和客服 */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "WSNAIL AI工具集合站",
          "url": "https://wsnail.com",
          "applicationCategory": "WebApplication",
          "operatingSystem": "All",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "CNY"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "1200",
            "bestRating": "5",
            "worstRating": "1"
          }
        })}
      </script>
    </Helmet>
  );
}