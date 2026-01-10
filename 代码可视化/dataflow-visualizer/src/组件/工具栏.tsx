/**
 * ============================================================================
 * 文件名：工具栏.tsx
 * 功能描述：应用工具栏组件
 *
 * 本组件是应用的顶部工具栏，包含：
 * 1. 项目名称显示
 * 2. 新建/打开/保存/导出项目按钮
 * 3. 撤销/重做按钮
 * 4. 执行/停止流程按钮
 * 5. 设置和全屏按钮
 * ============================================================================
 */

import React, { useState } from 'react';
import { useAppStore } from '@/store/index';
import {
  Play,
  Square,
  Save,
  FolderOpen,
  Download,
  Undo,
  Redo,
  Plus,
  Settings,
  Maximize2,
  Zap,
} from 'lucide-react';

/**
 * 工具栏属性接口
 */
interface 工具栏属性 {
  onFullscreen?: () => void;
}

/**
 * 工具栏组件
 *
 * 功能说明：
 * 提供应用的主要操作按钮和状态显示
 */
export const 工具栏: React.FC<工具栏属性> = ({ onFullscreen }) => {
  // 从 store 获取状态和方法
  const {
    currentProject,
    createProject,
    loadProject,
    saveProject,
    isExecuting,
    executeFlow,
    stopExecution,
    pushToHistory,
    undo,
    redo,
  } = useAppStore();

  // 对话框状态
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  /**
   * 创建项目
   */
  const handleCreateProject = () => {
    if (projectName.trim()) {
      createProject(projectName.trim(), projectDescription.trim());
      setShowNewProjectDialog(false);
      setProjectName('');
      setProjectDescription('');
    }
  };

  /**
   * 保存项目
   */
  const handleSaveProject = () => {
    saveProject();
    // 发送保存成功提示事件
    const event = new CustomEvent('show-toast', {
      detail: { message: '项目保存成功', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  /**
   * 执行流程
   */
  const handleExecuteFlow = async () => {
    await executeFlow();
  };

  /**
   * 导出项目
   */
  const handleExportProject = () => {
    if (!currentProject) return;

    // 将项目数据转换为 JSON 字符串
    const dataStr = JSON.stringify(currentProject, null, 2);
    // 创建 Blob 对象
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    // 创建临时下载链接
    const url = URL.createObjectURL(dataBlob);

    // 创建下载链接并触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProject.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * 导入项目
   */
  const handleImportProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const project = JSON.parse(e.target?.result as string);
            loadProject(project);
            pushToHistory();
          } catch (error) {
            console.error('Failed to import project:', error);
            // 发送错误提示事件
            const event = new CustomEvent('show-toast', {
              detail: { message: '导入项目失败，请检查文件格式', type: 'error' }
            });
            window.dispatchEvent(event);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    // 工具栏容器
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
      {/* 主内容区域：flex 布局，两端对齐 */}
      <div className="flex items-center justify-between">
        {/* ==================== 左侧：项目信息 ==================== */}
        <div className="flex items-center space-x-4">
          {/* 应用 Logo 和名称 */}
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">DataFlow Visualizer</span>
          </div>

          {/* 当前项目信息 */}
          {currentProject && (
            <div className="text-sm text-gray-300">
              <span className="font-medium">{currentProject.name}</span>
              {currentProject.description && (
                <span className="text-gray-400 ml-2">- {currentProject.description}</span>
              )}
            </div>
          )}
        </div>

        {/* ==================== 中间：主要操作按钮 ==================== */}
        <div className="flex items-center space-x-2">
          {/* 新建项目按钮 */}
          <button
            onClick={() => setShowNewProjectDialog(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            title="新建项目"
          >
            <Plus className="w-4 h-4" />
            <span>新建</span>
          </button>

          {/* 打开项目按钮 */}
          <button
            onClick={handleImportProject}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            title="打开项目"
          >
            <FolderOpen className="w-4 h-4" />
            <span>打开</span>
          </button>

          {/* 保存项目按钮 */}
          <button
            onClick={handleSaveProject}
            disabled={!currentProject}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
            title="保存项目"
          >
            <Save className="w-4 h-4" />
            <span>保存</span>
          </button>

          {/* 导出项目按钮 */}
          <button
            onClick={handleExportProject}
            disabled={!currentProject}
            className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
            title="导出项目"
          >
            <Download className="w-4 h-4" />
            <span>导出</span>
          </button>
        </div>

        {/* ==================== 右侧：执行和编辑操作 ==================== */}
        <div className="flex items-center space-x-2">
          {/* 撤销/重做按钮组 */}
          <div className="flex items-center border border-gray-600 rounded-lg">
            {/* 撤销按钮 */}
            <button
              onClick={undo}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="撤销"
            >
              <Undo className="w-4 h-4" />
            </button>
            {/* 分隔线 */}
            <div className="w-px h-6 bg-gray-600" />
            {/* 重做按钮 */}
            <button
              onClick={redo}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="重做"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* 执行/停止按钮 */}
          <button
            onClick={isExecuting ? stopExecution : handleExecuteFlow}
            disabled={!currentProject}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg transition-colors text-sm font-medium ${
              isExecuting
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed'
            }`}
            title={isExecuting ? '停止执行' : '执行流程'}
          >
            {isExecuting ? (
              <>
                <Square className="w-4 h-4" />
                <span>停止</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>执行</span>
              </>
            )}
          </button>

          {/* 设置按钮 */}
          <button
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="设置"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* 全屏按钮 */}
          {onFullscreen && (
            <button
              onClick={onFullscreen}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="全屏"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ==================== 新建项目对话框 ==================== */}
      {showNewProjectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
            {/* 对话框标题 */}
            <h3 className="text-lg font-semibold text-white mb-4">新建项目</h3>

            {/* 表单内容 */}
            <div className="space-y-4">
              {/* 项目名称 */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">项目名称</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入项目名称"
                  autoFocus
                />
              </div>

              {/* 项目描述 */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">项目描述 (可选)</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="输入项目描述"
                />
              </div>
            </div>

            {/* 对话框按钮 */}
            <div className="flex justify-end space-x-3 mt-6">
              {/* 取消按钮 */}
              <button
                onClick={() => {
                  setShowNewProjectDialog(false);
                  setProjectName('');
                  setProjectDescription('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                取消
              </button>
              {/* 创建按钮 */}
              <button
                onClick={handleCreateProject}
                disabled={!projectName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
