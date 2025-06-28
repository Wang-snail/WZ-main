import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
  canonical?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "AI工具集合站 - 106+精选AI工具库 | AI聊天机器人、AI绘画、AI视频 | WSNAIL.COM",
  description = "WSNAIL.COM - 精选106+优质AI工具，包含AI聊天机器人、AI搜索引擎、AI图像设计、AI视频制作等6大分类。免费AI工具推荐，AI占卜服务，让AI为生活增添更多精彩。",
  keywords = "AI工具,AI工具库,AI工具集合,人工智能工具,AI聊天机器人,AI搜索引擎,AI图像设计,AI视频制作,AI智能抠图,AI占卜,免费AI工具,ChatGPT,AI绘画,AI写作,WSNAIL",
  image = "https://wsnail.com/images/og-image.jpg",
  url = "https://wsnail.com/",
  type = "website",
  structuredData,
  canonical
}) => {
  return (
    <Helmet>
      {/* 基础标签 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph 标签 */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="WSNAIL.COM - AI工具集合站" />
      <meta property="og:locale" content="zh_CN" />
      
      {/* Twitter Card 标签 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@wsnail" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* 结构化数据 */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;