/**
 * ============================================================================
 * 文件名：应用.tsx
 * 功能描述：应用根组件
 *
 * 本组件是整个应用的入口组件，负责：
 * 1. 初始化预设模块
 * 2. 渲染工具栏、侧边栏、画布、属性面板
 * 3. 处理全屏切换
 * 4. 显示状态栏信息
 *
 * 布局结构：
 * ┌─────────────────────────────────────────────────────┐
 * │  导航栏（新增）                                     │ <-- 顶部：导航栏
 * ├─────────────────────────────────────────────────────┤
 * │  工具栏                                             │ <-- 工具栏
 * ├─────────────────────┬───────────────────────────────┤
 * │  侧边栏             │  画布区域                     │ <-- 中间：主要内容
 * │  (可收起)           │  ┌─────────────────────────┐  │
 * │                     │  │  流程画布               │  │
 * │                     │  └─────────────────────────┘  │
 * │                     │  ┌─────────────────────────┐  │
 * │                     │  │  属性面板（右侧）        │  │
 * │                     │  └─────────────────────────┘  │
 * ├─────────────────────┴───────────────────────────────┤
 * │  状态栏                                           │ <-- 底部：状态栏
 * └─────────────────────────────────────────────────────┘
 * ============================================================================
 */

// 导入 React 核心库
import React, { useState, useEffect } from 'react';

// 从 lucide-react 导入图标组件
import { Menu, ArrowLeft, Home, Sparkles, Bot } from 'lucide-react';

// 导入工具栏组件
import { 工具栏 } from './组件/工具栏';

// 导入侧边栏组件
import { 侧边栏 } from './组件/侧边栏';

// 导入流程画布组件
import { 流程画布 } from './组件/流程画布';

// 导入属性面板组件
import { 属性面板 } from './组件/属性面板';

// 导入 Toast 通知组件和全局 Toast 设置函数
import { useToast, setGlobalToast } from './组件/提示';

// 从状态管理 store 导入方法
import { useAppStore } from '@/store/index';

// 从预设模块导入所有内置模块
import { presetModules } from '@/presets/index';

/**
 * 顶部导航栏组件
 */
function 导航栏() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="h-14 flex items-center justify-between px-4">
        {/* 左侧：返回链接和标题 */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回</span>
          </a>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="w-6 h-6 text-blue-600" />
              <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              数据流可视化
            </span>
          </div>
        </div>

        {/* 右侧：操作链接 */}
        <div className="flex items-center gap-4">
          <a
            href="/tools"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            工具中心
          </a>
          <a
            href="/wiki"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            行业信息
          </a>
        </div>
      </div>
    </header>
  );
}

/**
 * 应用根组件
 *
 * 功能说明：
 * 1. 设置全局 Toast 通知函数
 * 2. 初始化所有预设模块
 * 3. 渲染应用的各个部分
 * 4. 处理全屏切换
 */
function 应用() {
  // =========================================================================
  // 从 store 获取状态和方法
  // =========================================================================

  const {
    currentProject,     // 当前项目数据
    selectedNodeId,     // 当前选中的节点 ID
    sidebarOpen,        // 侧边栏是否展开
    toggleSidebar,      // 切换侧边栏方法
    registerModule,     // 注册模块方法
  } = useAppStore();

  // =========================================================================
  // 状态管理
  // =========================================================================

  // 使用 Toast Hook 获取通知相关方法和组件
  const { toast, ToastComponent } = useToast();

  // 属性面板是否展开
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(false);

  // =========================================================================
  // 效果处理（副作用）
  // =========================================================================

  // 设置全局 Toast 函数
  // 这样在其他组件中可以调用 toast() 显示通知
  useEffect(() => {
    // 设置全局 toast 函数
    setGlobalToast((message, type, duration) => {
      return toast(message, type, duration);
    });
  }, [toast]);

  // 初始化预设模块
  // 在组件挂载时注册所有内置模块
  useEffect(() => {
    // 遍历预设模块数组，注册每个模块
    presetModules.forEach(module => {
      registerModule(module);
    });
  }, [registerModule]);

  // 当选中节点时打开属性面板
  useEffect(() => {
    // 如果有选中的节点，打开属性面板
    setPropertiesPanelOpen(!!selectedNodeId);
  }, [selectedNodeId]);

  // =========================================================================
  // 事件处理函数
  // =========================================================================

  /**
   * 处理全屏切换
   *
   * 功能：
   * 切换页面的全屏显示模式
   */
  const handleFullscreen = () => {
    // 如果已经全屏，退出全屏
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      // 否则进入全屏
      document.documentElement.requestFullscreen();
    }
  };

  // =========================================================================
  // 渲染
  // =========================================================================

  return (
    // 整个应用容器：flex 布局
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* 导航栏 */}
      <导航栏 />

      {/* Toast 通知组件（全局显示） */}
      <ToastComponent />

      {/* 工作流内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* 工具栏 */}
        <工具栏 onFullscreen={handleFullscreen} />

        {/* 主要内容区域：占据剩余空间，flex 布局 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧侧边栏：根据 sidebarOpen 状态显示/隐藏 */}
          <侧边栏 isOpen={sidebarOpen} />

          {/* 画布区域 */}
          <div className="flex-1 flex">
            {/* 画布容器 */}
            <div className="flex-1 relative">
              {/* 侧边栏切换按钮：当侧边栏收起时显示 */}
              {!sidebarOpen && (
                <button
                  onClick={toggleSidebar}
                  className="absolute top-4 left-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow-lg transition-colors"
                  title="打开侧边栏"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {/* 主画布：显示流程图 */}
              <流程画布 />
            </div>

            {/* 右侧属性面板：显示选中节点的详细信息 */}
            <属性面板
              nodeId={selectedNodeId}                    // 选中节点 ID
              isOpen={propertiesPanelOpen}               // 是否展开
              onClose={() => setPropertiesPanelOpen(false)}  // 关闭回调
            />
          </div>
        </div>

        {/* 底部状态栏：显示项目信息 */}
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
          {/* 内容容器：flex 布局，两端对齐 */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            {/* 左侧：项目统计信息 */}
            <div className="flex items-center space-x-4">
              {/* 节点数量 */}
              <span>
                {currentProject ? `${currentProject.nodes.length} 个节点` : '未创建项目'}
              </span>
              {/* 连线数量（如果有项目） */}
              {currentProject && (
                <span>
                  {currentProject.edges.length} 个连接
                </span>
              )}
            </div>

            {/* 右侧：状态信息 */}
            <div className="flex items-center space-x-4">
              {/* 最后保存时间 */}
              <span>
                最后保存: {currentProject ? new Date(currentProject.updatedAt).toLocaleTimeString() : '无'}
              </span>
              {/* 就绪状态指示器 */}
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>就绪</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 导出应用组件
export { 应用 };
