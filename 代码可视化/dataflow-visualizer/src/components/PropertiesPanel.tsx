import React, { useState } from 'react';
import { useAppStore } from '../store';
import { X, Save, Play, AlertCircle, CheckCircle } from 'lucide-react';

interface PropertiesPanelProps {
  nodeId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ nodeId, isOpen, onClose }) => {
  const { currentProject, modules, updateNode, executeFlow } = useAppStore();
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen || !nodeId || !currentProject) return null;

  const node = currentProject.nodes.find(n => n.id === nodeId);
  if (!node) return null;

  const module = modules.find(m => m.id === node.data.moduleId);
  if (!module) return null;

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const handleSaveConfig = () => {
    updateNode(nodeId, {
      data: { ...node.data, config }
    });
    onClose();
  };

  const handleExecuteNode = async () => {
    setIsExecuting(true);
    try {
      // 更新节点配置后执行
      updateNode(nodeId, {
        data: { ...node.data, config }
      });
      await executeFlow();
    } finally {
      setIsExecuting(false);
    }
  };

  const renderConfigInput = (key: string, value: any, type: string) => {
    switch (type) {
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value ?? false}
            onChange={(e) => handleConfigChange(key, e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value ?? 0}
            onChange={(e) => handleConfigChange(key, Number(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入数字"
          />
        );
      
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">请选择...</option>
            {Array.isArray(module.config[key]) ? (
              module.config[key].map((option: any, index: number) => (
                <option key={index} value={option.value || option}>
                  {option.label || option}
                </option>
              ))
            ) : (
              <option value="option1">选项1</option>
            )}
          </select>
        );
      
      default:
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="输入文本..."
          />
        );
    }
  };

  const getConfigFieldType = (key: string, value: any): string => {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (Array.isArray(value)) return 'select';
    return 'text';
  };

  return (
    <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
      {/* 面板头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-white">{module.name}</h2>
          <p className="text-sm text-gray-400">{module.description}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 基本信息 */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">基本信息</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">版本:</span>
              <span className="text-white">v{module.version}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">类别:</span>
              <span className="text-white capitalize">{module.category}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">输入端口:</span>
              <span className="text-white">{module.inputs.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">输出端口:</span>
              <span className="text-white">{module.outputs.length}</span>
            </div>
            {module.author && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">作者:</span>
                <span className="text-white">{module.author}</span>
              </div>
            )}
          </div>
        </div>

        {/* 输入端口详情 */}
        {module.inputs.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">输入端口</h3>
            <div className="space-y-3">
              {module.inputs.map((input) => (
                <div key={input.id} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{input.name}</h4>
                    <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                      {input.type}
                    </span>
                  </div>
                  {input.description && (
                    <p className="text-xs text-gray-400">{input.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 配置参数 */}
        {Object.keys(module.config).length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">配置参数</h3>
            <div className="space-y-4">
              {Object.entries(module.config).map(([key, defaultValue]) => (
                <div key={key}>
                  <label className="block text-sm text-gray-300 mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                  {renderConfigInput(key, config[key] ?? defaultValue, getConfigFieldType(key, defaultValue))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 输出端口详情 */}
        {module.outputs.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">输出端口</h3>
            <div className="space-y-3">
              {module.outputs.map((output) => (
                <div key={output.id} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{output.name}</h4>
                    <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                      {output.type}
                    </span>
                  </div>
                  {output.description && (
                    <p className="text-xs text-gray-400">{output.description}</p>
                  )}
                  {/* 显示当前输出值 */}
                  {node.data.preview && node.data.preview[output.id] !== undefined && (
                    <div className="mt-2 p-2 bg-gray-600 rounded text-xs">
                      <span className="text-gray-300">当前值: </span>
                      <span className="text-green-400">
                        {typeof node.data.preview[output.id] === 'object' 
                          ? JSON.stringify(node.data.preview[output.id])
                          : String(node.data.preview[output.id])
                        }
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 执行历史 */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">执行状态</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">状态:</span>
              <div className="flex items-center space-x-1">
                {node.data.status === 'success' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">成功</span>
                  </>
                )}
                {node.data.status === 'error' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">错误</span>
                  </>
                )}
                {node.data.status === 'running' && (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-blue-400">运行中</span>
                  </>
                )}
                {node.data.status === 'idle' && (
                  <span className="text-gray-400">空闲</span>
                )}
              </div>
            </div>
            {node.data.status === 'error' && node.data.preview?.error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-2">
                <p className="text-xs text-red-400">{node.data.preview.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 面板底部操作按钮 */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <button
          onClick={handleExecuteNode}
          disabled={isExecuting}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>{isExecuting ? '执行中...' : '执行节点'}</span>
        </button>
        <button
          onClick={handleSaveConfig}
          className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>保存配置</span>
        </button>
      </div>
    </div>
  );
};