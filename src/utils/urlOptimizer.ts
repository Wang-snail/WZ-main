// URL结构优化工具
export class URLStructureOptimizer {
  // 生成友好的URL slug
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // 生成工具页面URL
  static generateToolPageURL(toolName: string, category: string, language: string = 'zh'): string {
    const slug = this.generateSlug(toolName);
    const categorySlug = this.generateSlug(category);
    
    if (language === 'zh') {
      return `/ai-tools/${categorySlug}/${slug}`;
    } else {
      return `/${language}/ai-tools/${categorySlug}/${slug}`;
    }
  }
  
  // 生成分类页面URL
  static generateCategoryPageURL(category: string, language: string = 'zh'): string {
    const slug = this.generateSlug(category);
    
    if (language === 'zh') {
      return `/ai-tools?category=${encodeURIComponent(category)}`;
    } else {
      return `/${language}/ai-tools?category=${encodeURIComponent(category)}`;
    }
  }
  
  // 生成标签页面URL
  static generateTagPageURL(tag: string, language: string = 'zh'): string {
    const slug = this.generateSlug(tag);
    
    if (language === 'zh') {
      return `/ai-tools?tag=${encodeURIComponent(tag)}`;
    } else {
      return `/${language}/ai-tools?tag=${encodeURIComponent(tag)}`;
    }
  }
  
  // 生成搜索URL
  static generateSearchURL(query: string, language: string = 'zh'): string {
    if (language === 'zh') {
      return `/ai-tools?search=${encodeURIComponent(query)}`;
    } else {
      return `/${language}/ai-tools?search=${encodeURIComponent(query)}`;
    }
  }
  
  // 解析URL参数
  static parseURLParams(url: string): Record<string, string> {
    try {
      const urlObj = new URL(url, window.location.origin);
      const params: Record<string, string> = {};
      
      for (const [key, value] of urlObj.searchParams.entries()) {
        params[key] = value;
      }
      
      return params;
    } catch (error) {
      console.error('Error parsing URL params:', error);
      return {};
    }
  }
  
  // 生成多语言URL重定向规则
  static generateRedirectRules(): Array<{source: string, destination: string}> {
    return [
      // 根路径多语言重定向
      { source: '/en', destination: '/en/' },
      { source: '/ja', destination: '/ja/' },
      { source: '/ko', destination: '/ko/' },
      { source: '/es', destination: '/es/' },
      
      // 工具页面多语言重定向
      { source: '/en/ai-tools', destination: '/en/ai-tools' },
      { source: '/ja/ai-tools', destination: '/ja/ai-tools' },
      { source: '/ko/ai-tools', destination: '/ko/ai-tools' },
      { source: '/es/ai-tools', destination: '/es/ai-tools' },
      
      // 301重定向规则（避免重复内容）
      { source: '/index.html', destination: '/' },
      { source: '/home', destination: '/' },
    ];
  }
}