// 用户行为追踪服务
export interface UserEvent {
  type: 'page_view' | 'tool_click' | 'workflow_view' | 'search' | 'category_filter' | 'user_action' | 'social_share' | 'user_registration' | 'user_login' | 'conversion';
  data: {
    page?: string;
    tool?: string;
    workflow?: string;
    category?: string;
    query?: string;
    action?: string;
    metadata?: Record<string, any>;
    socialPlatform?: string;
    conversionType?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  timestamp: number;
  sessionId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserPreferences {
  visitedCategories: string[];
  usedTools: string[];
  searchKeywords: string[];
  visitDuration: number;
  returnFrequency: number;
  preferredWorkflows: string[];
  lastVisit: number;
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private events: UserEvent[] = [];
  private preferences: UserPreferences;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.preferences = this.loadPreferences();
    this.startSession();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getUserId(): string | undefined {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('user_id', userId);
    }
    return userId;
  }

  private loadPreferences(): UserPreferences {
    const stored = localStorage.getItem('user_preferences');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      visitedCategories: [],
      usedTools: [],
      searchKeywords: [],
      visitDuration: 0,
      returnFrequency: 0,
      preferredWorkflows: [],
      lastVisit: Date.now()
    };
  }

  private savePreferences(): void {
    localStorage.setItem('user_preferences', JSON.stringify(this.preferences));
  }

  private startSession(): void {
    this.trackEvent('page_view', { page: window.location.pathname });
    
    // 记录访问频率
    const lastVisit = this.preferences.lastVisit;
    const daysSinceLastVisit = (Date.now() - lastVisit) / (1000 * 60 * 60 * 24);
    if (daysSinceLastVisit < 7) {
      this.preferences.returnFrequency += 1;
    }
    this.preferences.lastVisit = Date.now();
    this.savePreferences();
  }

  // 追踪事件
  trackEvent(type: UserEvent['type'], data: UserEvent['data']): void {
    const event: UserEvent = {
      type,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.events.push(event);
    this.updatePreferences(event);
    
    // 发送到分析服务器（如果需要）
    this.sendToAnalytics(event);
  }

  // 更新用户偏好
  private updatePreferences(event: UserEvent): void {
    switch (event.type) {
      case 'tool_click':
        if (event.data.tool && !this.preferences.usedTools.includes(event.data.tool)) {
          this.preferences.usedTools.push(event.data.tool);
        }
        break;
        
      case 'category_filter':
        if (event.data.category && !this.preferences.visitedCategories.includes(event.data.category)) {
          this.preferences.visitedCategories.push(event.data.category);
        }
        break;
        
      case 'search':
        if (event.data.query && !this.preferences.searchKeywords.includes(event.data.query)) {
          this.preferences.searchKeywords.push(event.data.query);
        }
        break;
        
      case 'workflow_view':
        if (event.data.workflow && !this.preferences.preferredWorkflows.includes(event.data.workflow)) {
          this.preferences.preferredWorkflows.push(event.data.workflow);
        }
        break;
    }
    
    this.savePreferences();
  }

  // 发送数据到分析服务器
  private async sendToAnalytics(event: UserEvent): Promise<void> {
    try {
      // 这里可以发送到Google Analytics, 自建服务器等
      if (typeof gtag !== 'undefined') {
        gtag('event', event.type, {
          event_category: 'user_interaction',
          event_label: JSON.stringify(event.data),
          session_id: event.sessionId,
          user_id: event.userId
        });
      }
      
      // 发送到自建API
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  // 获取推荐工具
  getRecommendedTools(): string[] {
    const { visitedCategories, usedTools } = this.preferences;
    
    // 基于用户偏好的简单推荐算法
    const recommendations: string[] = [];
    
    // 基于访问过的分类推荐相关工具
    visitedCategories.forEach(category => {
      // 这里应该有一个分类到工具的映射
      // recommendations.push(...getToolsByCategory(category));
    });
    
    return recommendations.slice(0, 10); // 返回前10个推荐
  }

  // 获取推荐工作流
  getRecommendedWorkflows(): string[] {
    const { preferredWorkflows, visitedCategories } = this.preferences;
    
    // 基于用户历史行为推荐工作流
    const recommendations: string[] = [];
    
    if (visitedCategories.includes('AI写作')) {
      recommendations.push('wechat-marketing', 'video-creator');
    }
    
    if (visitedCategories.includes('AI设计')) {
      recommendations.push('ecommerce-launch', 'video-creator');
    }
    
    return recommendations;
  }

  // 获取用户画像
  getUserProfile() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      preferences: this.preferences,
      totalEvents: this.events.length,
      sessionDuration: this.getSessionDuration(),
      mostUsedCategory: this.getMostUsedCategory(),
      activityLevel: this.getActivityLevel()
    };
  }

  private getSessionDuration(): number {
    if (this.events.length < 2) return 0;
    const firstEvent = this.events[0];
    const lastEvent = this.events[this.events.length - 1];
    return lastEvent.timestamp - firstEvent.timestamp;
  }

  private getMostUsedCategory(): string | null {
    const categories = this.preferences.visitedCategories;
    if (categories.length === 0) return null;
    
    // 简单返回第一个，实际应该统计频次
    return categories[0];
  }

  private getActivityLevel(): 'low' | 'medium' | 'high' {
    const eventCount = this.events.length;
    if (eventCount < 5) return 'low';
    if (eventCount < 20) return 'medium';
    return 'high';
  }

  // 清除用户数据
  clearUserData(): void {
    localStorage.removeItem('user_preferences');
    localStorage.removeItem('user_id');
    this.events = [];
    this.preferences = {
      visitedCategories: [],
      usedTools: [],
      searchKeywords: [],
      visitDuration: 0,
      returnFrequency: 0,
      preferredWorkflows: [],
      lastVisit: Date.now()
    };
  }
}

// 创建全局实例
export const analytics = new AnalyticsService();

// React Hook for analytics
export function useAnalytics() {
  const trackToolClick = (toolName: string, category: string) => {
    analytics.trackEvent('tool_click', { tool: toolName, category });
  };

  const trackWorkflowView = (workflowId: string) => {
    analytics.trackEvent('workflow_view', { workflow: workflowId });
  };

  const trackSearch = (query: string) => {
    analytics.trackEvent('search', { query });
  };

  const trackCategoryFilter = (category: string) => {
    analytics.trackEvent('category_filter', { category });
  };

  const trackUserAction = (action: string, metadata?: Record<string, any>) => {
    analytics.trackEvent('user_action', { action, metadata });
  };

  const getRecommendations = () => {
    return {
      tools: analytics.getRecommendedTools(),
      workflows: analytics.getRecommendedWorkflows()
    };
  };

  const getUserProfile = () => {
    return analytics.getUserProfile();
  };

  return {
    trackToolClick,
    trackWorkflowView,
    trackSearch,
    trackCategoryFilter,
    trackUserAction,
    getRecommendations,
    getUserProfile
  };
}