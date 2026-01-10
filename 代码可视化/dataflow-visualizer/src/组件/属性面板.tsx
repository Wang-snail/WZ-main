/**
 * ============================================================================
 * 文件名：属性面板.tsx
 * 功能描述：属性面板组件，显示和编辑节点的配置信息
 *
 * 本组件是节点的属性编辑面板，提供以下功能：
 * 1. 显示模块的基本信息（名称、描述、版本等）
 * 2. 显示输入输出端口详情
 * 3. 编辑配置参数
 * 4. 执行节点
 * 5. 查看执行状态
 *
 * 面板结构：
 * - 头部：模块名称和关闭按钮
 * - 基本信息：版本、类别、端口数量、作者
 * - 输入端口：显示输入端口列表
 * - 配置参数：编辑模块配置
 * - 输出端口：显示输出端口和当前值
 * - 执行状态：显示执行结果
 * - 底部：执行和保存按钮
 * ============================================================================
 */

// 导入 React 核心库和 useState Hook
import React, { useState } from 'react';

// 从状态管理导入全局状态和操作方法
import { useAppStore } from '@/store/index';

// 从 lucide-react 导入图标组件
import { X, Save, Play, AlertCircle, CheckCircle } from 'lucide-react';

// ============================================================================
// 第一部分：属性面板组件属性接口
// ============================================================================

/**
 * 属性面板组件属性接口
 */
interface 属性面板Props {
  nodeId: string | null;   // 当前选中的节点 ID
  isOpen: boolean;         // 是否展开
  onClose: () => void;     // 关闭回调
}

// ============================================================================
// 第二部分：属性面板主组件
// ============================================================================

/**
 * 属性面板组件
 *
 * @param nodeId - 当前选中的节点 ID
 * @param isOpen - 是否展开
 * @param onClose - 关闭回调
 */
export const 属性面板: React.FC<属性面板Props> = ({ nodeId, isOpen, onClose }) => {
  // 从全局状态获取状态和方法
  const { currentProject, modules, updateNode, executeFlow } = useAppStore();

  // 配置状态
  const [config, setConfig] = useState<Record<string, any>>({});
  // 执行中状态
  const [isExecuting, setIsExecuting] = useState(false);

  // 如果不展开或没有选中节点，返回 null
  if (!isOpen || !nodeId || !currentProject) return null;

  // 查找当前节点
  const node = currentProject.nodes.find(n => n.id === nodeId);
  if (!node) return null;

  // 查找模块定义
  const module = modules.find(m => m.id === node.data.moduleId);
  if (!module) return null;

  /**
   * 处理配置变化
   *
   * @param key - 配置键名
   * @param value - 新值
   */
  const handleConfigChange = (key: string, value: any) => {
    // 更新配置状态
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  /**
   * 保存配置
   *
   * 触发时机：用户点击保存按钮
   */
  const handleSaveConfig = () => {
    // 更新节点配置
    updateNode(nodeId, {
      data: { ...node.data, config }
    });
    // 关闭面板
    onClose();
  };

  /**
   * 执行节点
   *
   * 触发时机：用户点击执行按钮
   */
  const handleExecuteNode = async () => {
    // 设置执行中状态
    setIsExecuting(true);
    try {
      // 先更新节点配置
      updateNode(nodeId, {
        data: { ...node.data, config }
      });
      // 执行流程
      await executeFlow();
    } finally {
      // 清除执行中状态
      setIsExecuting(false);
    }
  };

  /**
   * 渲染配置输入控件
   *
   * 根据配置类型渲染不同的输入控件
   *
   * @param key - 配置键名
   * @param value - 默认值
   * @param type - 值类型
   * @returns React 节点
   */
  const renderConfigInput = (key: string, value: any, type: string) => {
    switch (type) {
      case 'boolean':
        // 复选框
        return (
          <input
            type="checkbox"
            checked={value ?? false}
            onChange={(e) => handleConfigChange(key, e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
          />
        );

      case 'number':
        // 数字输入框
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
        // 下拉选择框
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
        // 文本输入框
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

  /**
   * 获取配置字段类型
   *
   * 根据值判断字段类型
   *
   * @param key - 配置键名
   * @param value - 值
   * @returns 类型字符串
   */
  const getConfigFieldType = (key: string, value: any): string => {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (Array.isArray(value)) return 'select';
    return 'text';
  };

  // 渲染属性面板
  return (
    // 面板容器：固定宽度、深色背景、左侧边框
    <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
      {/* ==================== 面板头部 ==================== */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {/* 标题区域 */}
        <div>
          <h2 className="text-lg font-semibold text-white">{module.name}</h2>
          <p className="text-sm text-gray-400">{module.description}</p>
        </div>
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ==================== 滚动内容区域 ==================== */}
      <div className="flex-1 overflow-y-auto">
        {/* ==================== 基本信息 ==================== */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">基本信息</h3>
          <div className="space-y-2">
            {/* 版本 */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">版本:</span>
              <span className="text-white">v{module.version}</span>
            </div>
            {/* 类别 */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">类别:</span>
              <span className="text-white capitalize">{module.category}</span>
            </div>
            {/* 输入端口数量 */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">输入端口:</span>
              <span className="text-white">{module.inputs.length}</span>
            </div>
            {/* 输出端口数量 */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">输出端口:</span>
              <span className="text-white">{module.outputs.length}</span>
            </div>
            {/* 作者（如果有） */}
            {module.author && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">作者:</span>
                <span className="text-white">{module.author}</span>
              </div>
            )}
          </div>
        </div>

        {/* ==================== 输入端口详情 ==================== */}
        {module.inputs.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">输入端口</h3>
            <div className="space-y-3">
              {module.inputs.map((input) => (
                <div key={input.id} className="bg-gray-700 rounded-lg p-3">
                  {/* 输入端口头部：名称和类型 */}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{input.name}</h4>
                    <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                      {input.type}
                    </span>
                  </div>
                  {/* 描述（如果有） */}
                  {input.description && (
                    <p className="text-xs text-gray-400">{input.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 配置参数 ==================== */}
        {Object.keys(module.config).length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">配置参数</h3>
            <div className="space-y-4">
              {Object.entries(module.config).map(([key, defaultValue]) => (
                <div key={key}>
                  {/* 标签 */}
                  <label className="block text-sm text-gray-300 mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                  {/* 输入控件 */}
                  {renderConfigInput(key, config[key] ?? defaultValue, getConfigFieldType(key, defaultValue))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 输出端口详情 ==================== */}
        {module.outputs.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">输出端口</h3>
            <div className="space-y-3">
              {module.outputs.map((output) => (
                <div key={output.id} className="bg-gray-700 rounded-lg p-3">
                  {/* 输出端口头部：名称和类型 */}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{output.name}</h4>
                    <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                      {output.type}
                    </span>
                  </div>
                  {/* 描述（如果有） */}
                  {output.description && (
                    <p className="text-xs text-gray-400">{output.description}</p>
                  )}
                  {/* 显示当前输出值（如果有） */}
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

        {/* ==================== 执行状态 ==================== */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">执行状态</h3>
          <div className="space-y-2">
            {/* 状态显示 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">状态:</span>
              <div className="flex items-center space-x-1">
                {/* 成功状态 */}
                {node.data.status === 'success' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">成功</span>
                  </>
                )}
                {/* 错误状态 */}
                {node.data.status === 'error' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">错误</span>
                  </>
                )}
                {/* 运行中状态 */}
                {node.data.status === 'running' && (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-blue-400">运行中</span>
                  </>
                )}
                {/* 空闲状态 */}
                {node.data.status === 'idle' && (
                  <span className="text-gray-400">空闲</span>
                )}
              </div>
            </div>
            {/* 错误信息（如果有） */}
            {node.data.status === 'error' && node.data.preview?.error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-2">
                <p className="text-xs text-red-400">{node.data.preview.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== 底部操作按钮 ==================== */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        {/* 执行节点按钮 */}
        <button
          onClick={handleExecuteNode}
          disabled={isExecuting}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>{isExecuting ? '执行中...' : '执行节点'}</span>
        </button>
        {/* 保存配置按钮 */}
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
