import React, { useState } from 'react';
import { useAppStore } from '../store';
import { 
  Play, 
  Square, 
  Save, 
  FolderOpen, 
  Download, 
  Upload, 
  Undo, 
  Redo, 
  Plus, 
  Settings,
  Maximize2,
  Zap,
} from 'lucide-react';

interface ToolbarProps {
  onFullscreen?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onFullscreen }) => {
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

  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleCreateProject = () => {
    if (projectName.trim()) {
      createProject(projectName.trim(), projectDescription.trim());
      setShowNewProjectDialog(false);
      setProjectName('');
      setProjectDescription('');
    }
  };

  const handleSaveProject = () => {
    saveProject();
    // 显示保存成功提示
    const event = new CustomEvent('show-toast', {
      detail: { message: '项目保存成功', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  const handleExecuteFlow = async () => {
    await executeFlow();
  };

  const handleExportProject = () => {
    if (!currentProject) return;
    
    const dataStr = JSON.stringify(currentProject, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProject.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
            // 显示错误提示
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
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* 左侧：项目信息 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">DataFlow Visualizer</span>
          </div>
          
          {currentProject && (
            <div className="text-sm text-gray-300">
              <span className="font-medium">{currentProject.name}</span>
              {currentProject.description && (
                <span className="text-gray-400 ml-2">- {currentProject.description}</span>
              )}
            </div>
          )}
        </div>

        {/* 中间：主要操作按钮 */}
        <div className="flex items-center space-x-2">
          {/* 新建项目 */}
          <button
            onClick={() => setShowNewProjectDialog(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            title="新建项目"
          >
            <Plus className="w-4 h-4" />
            <span>新建</span>
          </button>

          {/* 打开项目 */}
          <button
            onClick={handleImportProject}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            title="打开项目"
          >
            <FolderOpen className="w-4 h-4" />
            <span>打开</span>
          </button>

          {/* 保存项目 */}
          <button
            onClick={handleSaveProject}
            disabled={!currentProject}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
            title="保存项目"
          >
            <Save className="w-4 h-4" />
            <span>保存</span>
          </button>

          {/* 导出项目 */}
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

        {/* 右侧：执行和编辑操作 */}
        <div className="flex items-center space-x-2">
          {/* 撤销/重做 */}
          <div className="flex items-center border border-gray-600 rounded-lg">
            <button
              onClick={undo}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="撤销"
            >
              <Undo className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-600" />
            <button
              onClick={redo}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="重做"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* 执行流程 */}
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

          {/* 设置 */}
          <button
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="设置"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* 全屏 */}
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

      {/* 新建项目对话框 */}
      {showNewProjectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold text-white mb-4">新建项目</h3>
            
            <div className="space-y-4">
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

            <div className="flex justify-end space-x-3 mt-6">
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