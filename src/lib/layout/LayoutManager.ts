/**
 * 布局管理器
 * 处理导航栏状态变化和页面布局适应
 */

export interface Viewport {
  width: number;
  height: number;
}

export interface LayoutState {
  headerVisible: boolean;
  headerHeight: number;
  lastScrollY: number;
  scrollDirection: 'up' | 'down' | 'none';
  contentPadding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  viewport: Viewport;
  isFullscreen: boolean;
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface LayoutChangeListener {
  (state: LayoutState): void;
}

export class LayoutManager {
  private state: LayoutState = {
    headerVisible: true,
    headerHeight: 64, // 默认导航栏高度
    lastScrollY: 0,
    scrollDirection: 'none',
    contentPadding: {
      top: 64,
      bottom: 0,
      left: 0,
      right: 0
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    isFullscreen: false
  };

  private listeners: Set<LayoutChangeListener> = new Set();
  private scrollThreshold = 100; // 滚动阈值
  private scrollTimeout: number | null = null;

  constructor() {
    this.setupEventListeners();
    this.updateViewport();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // 监听滚动事件
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    
    // 监听全屏状态变化
    document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
    
    // 监听路由变化
    window.addEventListener('popstate', this.handleRouteChange.bind(this));
  }

  /**
   * 设置导航栏可见性
   */
  setHeaderVisible(visible: boolean, animated: boolean = true): void {
    if (this.state.headerVisible === visible) return;

    console.log('LayoutManager: Setting header visible:', visible);
    
    this.state.headerVisible = visible;
    this.updateContentPadding();
    
    // 更新DOM
    this.updateHeaderDOM(visible, animated);
    
    // 通知监听器
    this.notifyListeners();
  }

  /**
   * 获取内容区域内边距
   */
  getContentPadding(): { top: number; bottom: number } {
    return {
      top: this.state.contentPadding.top,
      bottom: this.state.contentPadding.bottom
    };
  }

  /**
   * 更新布局
   */
  updateLayout(animated: boolean = true): void {
    this.updateContentPadding();
    this.updateContentDOM(animated);
    this.notifyListeners();
  }

  /**
   * 处理视口变化
   */
  handleViewportChange(viewport: Viewport): void {
    this.state.viewport = viewport;
    this.updateLayout();
  }

  /**
   * 针对设备类型优化
   */
  optimizeForDevice(device: DeviceType): void {
    switch (device) {
      case 'mobile':
        this.state.headerHeight = 56; // 移动端较小的导航栏
        break;
      case 'tablet':
        this.state.headerHeight = 60;
        break;
      case 'desktop':
        this.state.headerHeight = 64;
        break;
    }
    
    this.updateContentPadding();
    this.updateLayout();
  }

  /**
   * 处理滚动事件（公共方法）
   */
  handleScrollEvent(scrollY: number, direction: 'up' | 'down'): void {
    const currentScrollY = scrollY || window.scrollY;
    const scrollDirection = direction || (currentScrollY > this.state.lastScrollY ? 'down' : 'up');
    
    this.state.lastScrollY = currentScrollY;
    this.state.scrollDirection = scrollDirection;

    // 清除之前的超时
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // 设置新的超时来处理滚动停止
    this.scrollTimeout = window.setTimeout(() => {
      this.state.scrollDirection = 'none';
    }, 150);

    // 根据滚动方向和位置决定导航栏显示
    if (currentScrollY > this.scrollThreshold) {
      if (scrollDirection === 'down' && this.state.headerVisible) {
        this.setHeaderVisible(false);
      } else if (scrollDirection === 'up' && !this.state.headerVisible) {
        this.setHeaderVisible(true);
      }
    } else if (currentScrollY <= this.scrollThreshold && !this.state.headerVisible) {
      this.setHeaderVisible(true);
    }
  }

  /**
   * 获取导航栏可见性
   */
  getHeaderVisibility(): boolean {
    return this.state.headerVisible;
  }

  /**
   * 检查是否应该隐藏导航栏
   */
  shouldHideHeader(pathname: string): boolean {
    const fullScreenPaths = [
      '/lab',
      '/experiment',
      '/workflows',
      '/tools/fba-calculator',
      '/processes',
      '/test-ui'
    ];
    
    return fullScreenPaths.some(path => pathname.startsWith(path));
  }

  /**
   * 添加布局变化监听器
   */
  addListener(listener: LayoutChangeListener): void {
    this.listeners.add(listener);
  }

  /**
   * 移除布局变化监听器
   */
  removeListener(listener: LayoutChangeListener): void {
    this.listeners.delete(listener);
  }

  /**
   * 获取当前布局状态
   */
  getState(): Readonly<LayoutState> {
    return { ...this.state };
  }

  /**
   * 更新内容区域内边距
   */
  private updateContentPadding(): void {
    this.state.contentPadding.top = this.state.headerVisible ? this.state.headerHeight : 0;
  }

  /**
   * 更新导航栏DOM
   */
  private updateHeaderDOM(visible: boolean, animated: boolean): void {
    const header = document.querySelector('header');
    if (!header) return;

    if (animated) {
      header.style.transition = 'transform 0.3s ease';
    } else {
      header.style.transition = 'none';
    }

    header.style.transform = visible ? 'translateY(0)' : 'translateY(-100%)';
    
    // 更新z-index确保正确的层级
    header.style.zIndex = '50';
  }

  /**
   * 更新内容区域DOM
   */
  private updateContentDOM(animated: boolean): void {
    const main = document.querySelector('main');
    if (!main) return;

    if (animated) {
      main.style.transition = 'padding-top 0.3s ease';
    } else {
      main.style.transition = 'none';
    }

    main.style.paddingTop = `${this.state.contentPadding.top}px`;
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('LayoutManager: Error in listener:', error);
      }
    });
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    this.updateViewport();
    
    // 根据新的视口大小优化设备类型
    const device = this.getDeviceType();
    this.optimizeForDevice(device);
  }

  /**
   * 处理滚动事件（内部）
   */
  private handleScroll(): void {
    const currentScrollY = window.scrollY;
    const direction = currentScrollY > this.state.lastScrollY ? 'down' : 'up';
    this.handleScrollEvent(currentScrollY, direction);
  }

  /**
   * 处理全屏状态变化
   */
  private handleFullscreenChange(): void {
    this.state.isFullscreen = !!document.fullscreenElement;
    
    if (this.state.isFullscreen) {
      this.setHeaderVisible(false, false);
    } else {
      this.setHeaderVisible(true, true);
    }
  }

  /**
   * 处理路由变化
   */
  private handleRouteChange(): void {
    const pathname = window.location.pathname;
    const shouldHide = this.shouldHideHeader(pathname);
    
    if (shouldHide !== !this.state.headerVisible) {
      this.setHeaderVisible(!shouldHide);
    }
  }

  /**
   * 更新视口信息
   */
  private updateViewport(): void {
    this.state.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  /**
   * 获取设备类型
   */
  private getDeviceType(): DeviceType {
    const width = this.state.viewport.width;
    
    if (width < 768) {
      return 'mobile';
    } else if (width < 1024) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('scroll', this.handleScroll.bind(this));
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
    window.removeEventListener('popstate', this.handleRouteChange.bind(this));
    
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    this.listeners.clear();
  }
}

// 全局布局管理器实例
export const globalLayoutManager = new LayoutManager();