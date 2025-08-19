// SEO优化工具
interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  url: string;
  image?: string;
  locale?: string;
  type?: string;
}

export class SEOManager {
  // 生成多语言SEO配置
  static generateLocalizedSEO(config: SEOConfig, lang: string): SEOConfig {
    // 这里可以添加多语言翻译逻辑
    // 目前返回原始配置，后续可以集成翻译API
    return {
      ...config,
      locale: this.getLocaleForLanguage(lang),
    };
  }
  
  // 获取语言对应的locale
  static getLocaleForLanguage(lang: string): string {
    const localeMap: Record<string, string> = {
      'zh': 'zh_CN',
      'en': 'en_US',
      'ja': 'ja_JP',
      'ko': 'ko_KR',
      'es': 'es_ES',
    };
    return localeMap[lang] || 'zh_CN';
  }
  
  // 生成结构化数据
  static generateStructuredData(data: any): string {
    return JSON.stringify(data, null, 2);
  }
  
  // 更新页面SEO元数据
  static updatePageSEO(config: SEOConfig): void {
    // 更新标题
    if (config.title) {
      document.title = config.title;
    }
    
    // 更新meta标签
    this.updateMetaTag('description', config.description);
    this.updateMetaTag('keywords', config.keywords);
    
    // 更新Open Graph标签
    this.updateMetaTag('og:title', config.title);
    this.updateMetaTag('og:description', config.description);
    this.updateMetaTag('og:url', config.url);
    this.updateMetaTag('og:locale', config.locale || 'zh_CN');
    this.updateMetaTag('og:type', config.type || 'website');
    
    if (config.image) {
      this.updateMetaTag('og:image', config.image);
    }
    
    // 更新Twitter标签
    this.updateMetaTag('twitter:title', config.title);
    this.updateMetaTag('twitter:description', config.description);
    if (config.image) {
      this.updateMetaTag('twitter:image', config.image);
    }
  }
  
  // 更新meta标签的辅助方法
  private static updateMetaTag(name: string, content: string | undefined): void {
    if (!content) return;
    
    let metaTag = document.querySelector(`meta[name="${name}"]`) || 
                  document.querySelector(`meta[property="${name}"]`);
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      if (name.startsWith('og:') || name.startsWith('twitter:')) {
        metaTag.setAttribute('property', name);
      } else {
        metaTag.setAttribute('name', name);
      }
      document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', content);
  }
}