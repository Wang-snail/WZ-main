/**
 * 导航错误处理系统
 * 处理404重定向、断链检测和导航失败的回退方案
 */

import { errorHandler, ErrorCategory, ErrorSeverity } from '@/lib/lab/ErrorHandler';

export interface NavigationError {
  type: 'not_found' | 'broken_link' | 'redirect_failed' | 'navigation_timeout';
  originalUrl: string;
  targetUrl?: string;
  timestamp: Date;
  userAgent?: string;
  referrer?: string;
}

export interface RedirectMapping {
  from: string;
  to: string;
  permanent: boolean;
  reason: string;
}

export interface NavigationFallback {
  condition: (error: NavigationError) => boolean;
  action: () => void | Promise<void>;
  description: string;
}

/**
 * 导航错误处理器类
 */
export class NavigationErrorHandler {
  private static instance: NavigationErrorHandler;
  private redirectMappings: Map<string, RedirectMapping> = new Map();
  private fallbackStrategies: NavigationFallback[] = [];
  private brokenLinks: Set<string> = new Set();
  private navigationHistory: NavigationError[] = [];

  private constructor() {
    this.initializeDefaultRedirects();
    this.initializeDefaultFallbacks();
    this.setupGlobalErrorHandling();
  }

  static getInstance(): NavigationErrorHandler {
    if (!NavigationErrorHandler.instance) {
      NavigationErrorHandler.instance = new NavigationErrorHandler();
    }
    return NavigationErrorHandler.instance;
  }

  /**
   * 初始化默认重定向规则
   */
  private initializeDefaultRedirects(): void {
    const defaultRedirects: RedirectMapping[] = [
      // 实战指南重定向到数据实验室
      {
        from: '/workflows',
        to: '/lab',
        permanent: true,
        reason: 'Tutorial section replaced with data lab'
      },
      {
        from: '/guides',
        to: '/lab',
        permanent: true,
        reason: 'Guides section replaced with data lab'
      },
      {
        from: '/tutorials',
        to: '/lab',
        permanent: true,
        reason: 'Tutorials section replaced with data lab'
      },
      {
        from: '/实战指南',
        to: '/lab',
        permanent: true,
        reason: 'Chinese tutorial section replaced with data lab'
      },
      
      // 具体实战指南重定向到相应的数据实验室应用
      {
        from: '/workflows/product-listing',
        to: '/lab?app=market-analysis',
        permanent: true,
        reason: 'Product listing workflow moved to data lab'
      },
      {
        from: '/workflows/competitor-analysis',
        to: '/lab?app=brand-ranking',
        permanent: true,
        reason: 'Competitor analysis workflow moved to data lab'
      },
      {
        from: '/workflows/content-generation',
        to: '/lab?app=pricing-calculator',
        permanent: true,
        reason: 'Content generation workflow moved to data lab'
      },
      {
        from: '/workflows/supplier-evaluation',
        to: '/lab?app=supplier-evaluation',
        permanent: true,
        reason: 'Supplier evaluation workflow moved to data lab'
      },
      {
        from: '/workflows/sales-forecast',
        to: '/lab?app=sales-forecast',
        permanent: true,
        reason: 'Sales forecast workflow moved to data lab'
      },
      {
        from: '/workflows/inventory-optimization',
        to: '/lab?app=inventory-optimization',
        permanent: true,
        reason: 'Inventory optimization workflow moved to data lab'
      }
    ];

    // 添加多语言版本的重定向
    const languages = ['en', 'jp', 'kr', 'es', 'fr', 'ru', 'pt'];
    languages.forEach(lang => {
      defaultRedirects.forEach(redirect => {
        this.redirectMappings.set(`/${lang}${redirect.from}`, {
          ...redirect,
          to: `/${lang}${redirect.to}`
        });
      });
    });

    // 添加基础重定向
    defaultRedirects.forEach(redirect => {
      this.redirectMappings.set(redirect.from, redirect);
    });
  }

  /**
   * 初始化默认回退策略
   */
  private initializeDefaultFallbacks(): void {
    this.fallbackStrategies = [
      // 404页面回退到首页
      {
        condition: (error) => error.type === 'not_found',
        action: () => {
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        },
        description: '页面未找到，返回首页'
      },
      
      // 断链回退到相关页面
      {
        condition: (error) => error.type === 'broken_link' && error.originalUrl.includes('/tools'),
        action: () => {
          if (typeof window !== 'undefined') {
            window.location.href = '/tools';
          }
        },
        description: '工具页面链接失效，返回工具主页'
      },
      
      // 数据实验室相关链接回退
      {
        condition: (error) => error.type === 'broken_link' && 
          (error.originalUrl.includes('/lab') || error.originalUrl.includes('/experiment')),
        action: () => {
          if (typeof window !== 'undefined') {
            window.location.href = '/lab';
          }
        },
        description: '数据实验室链接失效，返回数据实验室主页'
      },
      
      // 重定向失败的回退
      {
        condition: (error) => error.type === 'redirect_failed',
        action: async () => {
          // 尝试清除缓存后重新导航
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('navigation_cache');
          }
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        },
        description: '重定向失败，清除缓存并刷新页面'
      },
      
      // 导航超时的回退
      {
        condition: (error) => error.type === 'navigation_timeout',
        action: () => {
          if (typeof window !== 'undefined') {
            const confirmReload = confirm('页面加载超时，是否刷新页面？');
            if (confirmReload) {
              window.location.reload();
            }
          }
        },
        description: '导航超时，提示用户刷新页面'
      }
    ];
  }

  /**
   * 设置全局错误处理
   */
  private setupGlobalErrorHandling(): void {
    if (typeof window === 'undefined') return;

    // 监听未处理的导航错误
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && 
          event.reason.message.includes('navigation')) {
        this.handleNavigationError({
          type: 'navigation_timeout',
          originalUrl: window.location.href,
          timestamp: new Date(),
          userAgent: navigator.userAgent
        });
      }
    });

    // 监听页面加载错误
    window.addEventListener('error', (event) => {
      if (event.target && (event.target as any).tagName === 'A') {
        const link = event.target as HTMLAnchorElement;
        this.handleBrokenLink(link.href);
      }
    });
  }

  /**
   * 处理导航错误
   */
  handleNavigationError(error: NavigationError): void {
    // 记录错误
    this.navigationHistory.push(error);
    
    // 限制历史记录大小
    if (this.navigationHistory.length > 100) {
      this.navigationHistory = this.navigationHistory.slice(-50);
    }

    // 报告错误到统一错误处理系统
    errorHandler.handleError(new Error(`Navigation error: ${error.type} at ${error.originalUrl}`), {
      additionalData: {
        navigationType: error.type,
        originalUrl: error.originalUrl,
        targetUrl: error.targetUrl,
        userAgent: error.userAgent,
        referrer: error.referrer
      }
    });

    // 执行回退策略
    this.executeFailoverStrategy(error);
  }

  /**
   * 处理404错误
   */
  handle404(url: string): boolean {
    // 检查是否有重定向规则
    const redirect = this.findRedirectMapping(url);
    if (redirect) {
      return this.executeRedirect(url, redirect);
    }

    // 记录404错误
    this.handleNavigationError({
      type: 'not_found',
      originalUrl: url,
      timestamp: new Date(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined
    });

    return false;
  }

  /**
   * 处理断链
   */
  handleBrokenLink(url: string): void {
    this.brokenLinks.add(url);
    
    this.handleNavigationError({
      type: 'broken_link',
      originalUrl: url,
      timestamp: new Date(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    });
  }

  /**
   * 查找重定向映射
   */
  private findRedirectMapping(url: string): RedirectMapping | null {
    // 直接匹配
    if (this.redirectMappings.has(url)) {
      return this.redirectMappings.get(url)!;
    }

    // 去除查询参数和哈希后匹配
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (this.redirectMappings.has(cleanUrl)) {
      return this.redirectMappings.get(cleanUrl)!;
    }

    // 模糊匹配（处理语言前缀）
    for (const [pattern, mapping] of this.redirectMappings.entries()) {
      if (this.urlMatches(cleanUrl, pattern)) {
        return mapping;
      }
    }

    return null;
  }

  /**
   * URL匹配逻辑
   */
  private urlMatches(url: string, pattern: string): boolean {
    // 精确匹配
    if (url === pattern) return true;

    // 语言前缀匹配
    const languagePattern = /^\/([a-z]{2})(\/.*)?$/;
    const urlMatch = url.match(languagePattern);
    const patternMatch = pattern.match(languagePattern);

    if (urlMatch && !patternMatch) {
      // URL有语言前缀，pattern没有
      const basePath = urlMatch[2] || '/';
      return basePath === pattern;
    }

    return false;
  }

  /**
   * 执行重定向
   */
  private executeRedirect(originalUrl: string, redirect: RedirectMapping): boolean {
    try {
      if (typeof window === 'undefined') return false;

      // 保留查询参数和哈希
      const urlParts = originalUrl.split('?');
      const queryAndHash = urlParts.length > 1 ? '?' + urlParts.slice(1).join('?') : '';
      
      const targetUrl = redirect.to + queryAndHash;

      // 记录重定向事件
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'navigation_redirect', {
          event_category: 'navigation',
          event_label: `${originalUrl} -> ${targetUrl}`,
          custom_parameter_1: redirect.reason
        });
      }

      // 执行重定向
      if (redirect.permanent) {
        window.location.replace(targetUrl);
      } else {
        window.location.href = targetUrl;
      }

      return true;
    } catch (error) {
      // 重定向失败
      this.handleNavigationError({
        type: 'redirect_failed',
        originalUrl,
        targetUrl: redirect.to,
        timestamp: new Date()
      });
      return false;
    }
  }

  /**
   * 执行回退策略
   */
  private executeFailoverStrategy(error: NavigationError): void {
    const applicableStrategies = this.fallbackStrategies.filter(
      strategy => strategy.condition(error)
    );

    if (applicableStrategies.length > 0) {
      const strategy = applicableStrategies[0]; // 使用第一个匹配的策略
      
      try {
        strategy.action();
        
        // 显示用户友好的提示
        this.showUserNotification(strategy.description);
      } catch (fallbackError) {
        console.error('Fallback strategy failed:', fallbackError);
        
        // 最后的回退：返回首页
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }
  }

  /**
   * 显示用户通知
   */
  private showUserNotification(message: string): void {
    if (typeof window === 'undefined') return;

    // 尝试使用toast通知（如果可用）
    if ((window as any).toast) {
      (window as any).toast.info(message);
      return;
    }

    // 回退到浏览器原生通知
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * 添加自定义重定向规则
   */
  addRedirectMapping(mapping: RedirectMapping): void {
    this.redirectMappings.set(mapping.from, mapping);
  }

  /**
   * 添加自定义回退策略
   */
  addFallbackStrategy(strategy: NavigationFallback): void {
    this.fallbackStrategies.push(strategy);
  }

  /**
   * 检测断链
   */
  async detectBrokenLinks(urls: string[]): Promise<string[]> {
    const brokenLinks: string[] = [];
    
    for (const url of urls) {
      try {
        // 只检测内部链接
        if (!url.startsWith('/')) continue;
        
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
          brokenLinks.push(url);
          this.handleBrokenLink(url);
        }
      } catch (error) {
        brokenLinks.push(url);
        this.handleBrokenLink(url);
      }
    }
    
    return brokenLinks;
  }

  /**
   * 获取导航统计
   */
  getNavigationStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    brokenLinksCount: number;
    recentErrors: NavigationError[];
  } {
    const errorsByType: Record<string, number> = {};
    
    this.navigationHistory.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
    });

    return {
      totalErrors: this.navigationHistory.length,
      errorsByType,
      brokenLinksCount: this.brokenLinks.size,
      recentErrors: this.navigationHistory.slice(-10)
    };
  }

  /**
   * 清除错误历史
   */
  clearErrorHistory(): void {
    this.navigationHistory = [];
    this.brokenLinks.clear();
  }

  /**
   * 验证URL有效性
   */
  async validateUrl(url: string): Promise<boolean> {
    try {
      if (!url.startsWith('/')) return true; // 外部链接不验证
      
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

/**
 * 全局导航错误处理器实例
 */
export const navigationErrorHandler = NavigationErrorHandler.getInstance();

/**
 * React Hook for navigation error handling
 */
export function useNavigationErrorHandler() {
  const handleNavigationError = (error: NavigationError) => {
    navigationErrorHandler.handleNavigationError(error);
  };

  const handle404 = (url: string) => {
    return navigationErrorHandler.handle404(url);
  };

  const validateUrl = async (url: string) => {
    return navigationErrorHandler.validateUrl(url);
  };

  return {
    handleNavigationError,
    handle404,
    validateUrl,
    stats: navigationErrorHandler.getNavigationStats()
  };
}

export default NavigationErrorHandler;