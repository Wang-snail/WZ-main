import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Eye,
  Play,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Filter,
  Trash2,
  Copy
} from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { useKanoToolStore, WorkflowStep, ProcessedComment, OrganizeStepResult } from '../../store/kanoToolStore';
import { DataCleaningService } from '../../services/DataCleaningService';

export function OrganizeStep() {
  const {
    data,
    ui,
    config,
    stepResults,
    setProcessedComments,
    setLoading,
    setError,
    setProgress,
    setStepStatus,
    setOrganizeResult,
    updateProcessingOptions
  } = useKanoToolStore();

  const [processing, setProcessing] = useState(false);
  
  // 使用保存的结果或当前状态
  const preview = stepResults.organize;

  // 处理数据整理
  const handleProcessData = async () => {
    if (data.rawComments.length === 0) {
      setError('没有可处理的数据，请先导入评论');
      return;
    }

    setProcessing(true);
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const { processingOptions } = config;

      // Use DataCleaningService
      const result = await DataCleaningService.clean(
        data.rawComments,
        processingOptions,
        (progress) => setProgress(progress)
      );

      const cleanedComments = result.cleaned;
      const stats = result.stats;

      const beforeSamples = data.rawComments.slice(0, 3).map(c => c.content);
      const afterSamples = cleanedComments.slice(0, 3).map(c => c.cleanedContent);

      const organizeResult: OrganizeStepResult = {
        beforeSamples,
        afterSamples,
        stats
      };

      setOrganizeResult(organizeResult);
      setProcessedComments(cleanedComments);
      setProgress(100);
      setStepStatus(WorkflowStep.ORGANIZE, 'completed');

    } catch (error) {
      setError(error instanceof Error ? error.message : '数据处理失败');
      setStepStatus(WorkflowStep.ORGANIZE, 'error');
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 步骤标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">数据整理</h2>
        <p className="text-gray-600">
          清洗和标准化评论数据，去除无效内容和重复项
        </p>
      </div>

      {/* 处理选项配置 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          处理选项
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基础清洗选项 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">基础清洗</h4>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={config.processingOptions.removeEmpty}
                onChange={(e) => updateProcessingOptions({ removeEmpty: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">去除空评论</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={config.processingOptions.removeDuplicates}
                onChange={(e) => updateProcessingOptions({ removeDuplicates: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">去除重复评论</span>
            </label>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                最小长度（字符）
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={config.processingOptions.minLength}
                onChange={(e) => updateProcessingOptions({ minLength: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 高级过滤 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">高级过滤</h4>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                过滤模式（正则表达式，每行一个）
              </label>
              <textarea
                value={config.processingOptions.filterPatterns.join('\n')}
                onChange={(e) => updateProcessingOptions({
                  filterPatterns: e.target.value.split('\n').filter(p => p.trim())
                })}
                placeholder="例如：&#10;[广告].*&#10;联系方式.*&#10;QQ:\d+"
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              />
              <p className="text-xs text-gray-500">
                用于过滤广告、联系方式等无关内容
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 数据统计 */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-center mb-3">
          <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
          <h4 className="font-medium text-blue-800">当前数据统计</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700">原始评论：</span>
            <span className="font-medium text-blue-900">{data.rawComments.length} 条</span>
          </div>
          <div>
            <span className="text-blue-700">已处理：</span>
            <span className="font-medium text-blue-900">{data.cleanedComments.length} 条</span>
          </div>
          <div>
            <span className="text-blue-700">平均长度：</span>
            <span className="font-medium text-blue-900">
              {data.rawComments.length > 0
                ? Math.round(data.rawComments.reduce((sum, c) => sum + c.content.length, 0) / data.rawComments.length)
                : 0
              } 字符
            </span>
          </div>
          <div>
            <span className="text-blue-700">状态：</span>
            <span className="font-medium text-blue-900">
              {data.cleanedComments.length > 0 ? '已处理' : '待处理'}
            </span>
          </div>
        </div>
      </div>

      {/* 处理按钮 */}
      <div className="flex justify-center">
        <Button
          onClick={handleProcessData}
          disabled={processing || data.rawComments.length === 0}
          className="px-8 py-3 text-lg"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              处理中...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              开始处理
            </>
          )}
        </Button>
      </div>

      {/* 进度条 */}
      {processing && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">处理进度</span>
            <span className="text-sm text-gray-500">{ui.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${ui.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {ui.error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start"
        >
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-medium">处理失败</h4>
            <p className="text-red-700 text-sm mt-1">{ui.error}</p>
          </div>
        </motion.div>
      )}

      {/* 处理结果预览 */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-6"
        >
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-green-800 font-medium mb-4 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                处理结果预览
              </h4>

              {/* 统计信息 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded p-3 border">
                  <div className="flex items-center">
                    <Trash2 className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm font-medium">已移除</span>
                  </div>
                  <p className="text-lg font-bold text-red-600">{preview.stats.removed} 条</p>
                  <p className="text-xs text-gray-500">空评论和短评论</p>
                </div>
                <div className="bg-white rounded p-3 border">
                  <div className="flex items-center">
                    <Copy className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="text-sm font-medium">去重</span>
                  </div>
                  <p className="text-lg font-bold text-orange-600">{preview.stats.duplicates} 条</p>
                  <p className="text-xs text-gray-500">重复评论</p>
                </div>
                <div className="bg-white rounded p-3 border">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium">已清洗</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">{preview.stats.cleaned} 条</p>
                  <p className="text-xs text-gray-500">标准化处理</p>
                </div>
              </div>

              {/* 对比示例 */}
              <div className="space-y-4">
                <h5 className="text-green-700 font-medium">处理对比示例：</h5>
                {preview.beforeSamples.map((before, index) => (
                  <div key={index} className="bg-white rounded border">
                    <div className="p-3 border-b bg-red-50">
                      <span className="text-xs font-medium text-red-700">处理前：</span>
                      <p className="text-sm text-gray-700 mt-1">{before}</p>
                    </div>
                    <div className="p-3 bg-green-50">
                      <span className="text-xs font-medium text-green-700">处理后：</span>
                      <p className="text-sm text-gray-700 mt-1">{preview.afterSamples[index]}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 下一步提示 */}
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-blue-800 text-sm">
                  ✅ 数据整理完成！共处理 {data.cleanedComments.length} 条评论，点击右下角的"下一步"按钮继续进行功能提取。
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}