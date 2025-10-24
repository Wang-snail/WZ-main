import React from 'react';
import {Helmet} from 'react-helmet-async';

interface EnhancedSEOProps {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
  canonical?: string;
  image?: string;
  type?: string;
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  noindex?: boolean;
  nofollow?: boolean;
  robots?: string;
}

const EnhancedSEO: React.FC<EnhancedSEOProps> = ({
  title,
  description,
  keywords = '',
  url = window.location.href,
  canonical = url,
  image = `${window.location.origin}/images/og-image.jpg`,
  type = 'website',
  siteName = 'WSNAIL.COM',
  author = 'WSNAIL Team',
  publishedTime,
  modifiedTime,
  locale = 'zh_CN',
  noindex = false,
  nofollow = false,
  robots = 'index, follow'
}) => {
  // 构建Open Graph标签
  const ogTitle = `${title} | ${siteName}`;
  const ogDescription = description;
  const ogUrl = url;
  const ogImage = image;

  // 构建Twitter Card标签
  const twitterCard = 'summary_large_image';
  const twitterSite = '@WSNAIL';
  const twitterCreator = '@WSNAIL';

  // 结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? 'Article' : 'WebSite',
    name: title,
    description: description,
    url: url,
    image: image,
    author: {
      "@type": "Organization",
      name: author,
      url: siteName
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${window.location.origin}/images/logo.png`
      }
    },
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: window.location.origin
    }
  };

  // 如果是文章，添加额外的结构化数据
  if (type === 'article' && publishedTime) {
    structuredData.datePublished = publishedTime;
    if (modifiedTime) {
      structuredData.dateModified = modifiedTime;
    }
  }

  // robots元标签
  const robotsContent = noindex || nofollow ?
    `${noindex ? 'noindex' : ''}${noindex && nofollow ? ', ' : ''}${nofollow ? 'nofollow' : ''}`.trim() || 'noindex, nofollow' :
    robots;

  return (
    <Helmet>
      {/* 基础SEO标签 */}
      <title>{ogTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content={robotsContent} />

      {/* Open Graph 标签 */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card 标签 */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />

      {/* 结构化数据 */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* 主题色 */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />

      {/* Apple设备优化 */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3B82F6" />
    </Helmet>
  );
};

export default EnhancedSEO;