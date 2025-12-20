import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Eye, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Tag,
  Split,
  Merge,
  Edit3
} from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { useKanoToolStore, WorkflowStep, OpinionFragment, ExtractStepResult } from '../../store/kanoToolStore';
import { AIService, AIConfig } from '../../services/AIService';

export function ExtractStep() {
  const { 
    data, 
    ui, 
    config,
    stepResults,
    setFragments,
    setLoading, 
    setError, 
    setProgress,
    setStepStatus,
    setExtractResult
  } = useKanoToolStore();

  const [extracting, setExtracting] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(AIService.getDefaultConfig());
  
  // 使用保存的结果
  const extractResults = stepResults.extract;

  // AI功能提取
  const handleExtractFeatures = async () => {
    if (data.cleanedComments.length === 0) {
      setError('没有可处理的数据，请先完成数据整理');
      return;
    }

    // 验证AI配置
    const configErrors = AIService.validateConfig(aiConfig);
    if (configErrors.length > 0) {
      setError(`配置错误: ${configErrors.join(', ')}`);
      return;
    }

    setExtracting(true);
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const comments = data.cleanedComments.map(c => ({
        id: c.id,
        content: c.cleanedContent
      }));

      // 使用AI服务批量提取观点片段
      const fragments = await AIService.batchExtractFragments(
        comments,
        aiConfig,
        (progress) => setProgress(progress * 0.9) // 保留10%用于后处理
      );

      setProgress(95);

      // 统计结果
      const featureCounts: Record<string, number> = {};
      fragments.forEach(fragment => {
        featureCounts[fragment.feature] = (featureCounts[fragment.feature] || 0) + 1;
      });

      const topFeatures = Object.entries(featureCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      const results = {
        totalFragments: fragments.length,
        avgFragmentsPerComment: fragments.length / data.cleanedComments.length,
        topFeatures,
        sampleFragments: fragments.slice(0, 5)
      };

      setExtractResult(results);
      setFragments(fragments);
      setProgress(100);
      setStepStatus(WorkflowStep.EXTRACT, 'completed');

    } catch (error) {
      setError(error instanceof Error ? error.message : '功能提取失败');
      setStepStatus(WorkflowStep.EXTRACT, 'error');
    } finally {
      setExtracting(false);
      setLoading(false);
    }
  };

  // 模拟AI提取功能（实际应该调用真实的AI接口）
  const simulateAIExtraction = async (content: string, commentId: string): Promise<OpinionFragment[]> => {
    // 模拟的功能词典
    const features = [
      '电池', '屏幕', '外观', '手感', '价格', '性能', '摄像头', '音质', 
      '续航', '充电', '系统', '操作', '重量', '尺寸', '材质', '颜色'
    ];
    
    const sentiments = [
      'strong_praise', 'weak_praise', 'neutral', 'weak_complaint', 'strong_complaint', 'suggestion'
    ];

    const fragments: OpinionFragment[] = [];
    const words = content.split(/[，。！？；、\s]+/).filter(w => w.length > 0);
    
    // 随机生成1-3个观点片段
    const fragmentCount = Math.min(Math.floor(Math.random() * 3) + 1, aiConfig.maxFragmentsPerComment);
    
    for (let i = 0; i < fragmentCount; i++) {
      const feature = features[Math.floor(Math.random() * features.length)];
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      const startPos = Math.floor(Math.random() * Math.max(1, words.length - 3));
      const endPos = Math.min(startPos + 3, words.length);
      const rawText = words.slice(startPos, endPos).join('');
      
      if (rawText.length > 2) {
        fragments.push({
          id: `fragment_${commentId}_${i}`,
          commentId,
          feature,
          rawText,
          sentimentType: sentiment,
          confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0
          position: [startPos, endPos],
          context: content.substring(Math.max(0, startPos - 10), Math.min(content.length, endPos + 10))
        });
      }
    }

    return fragments;
  };

  return (
    <div className="space-y-6">
      {/* 步骤标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">功能提取</h2>
        <p className="text-gray-600">
          使用AI技术从评论中提取观点片段，识别功能点和情感倾向
        </p>
      </div>

      {/* AI配置 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          AI提取配置
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每条评论最大片段数
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={aiConfig.maxFragmentsPerComment}
                onChange={(e) => setAiConfig(prev => ({ 
                  ...prev, 
                  maxFragmentsPerComment: parseInt(e.target.value) || 10 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                置信度阈值
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={aiConfig.confidenceThreshold}
                onChange={(e) => setAiConfig(prev => ({ 
                  ...prev, 
                  confidenceThreshold: parseFloat(e.target.value) 
                }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1 (宽松)</span>
                <span>{aiConfig.confidenceThreshold}</span>
                <span>1.0 (严格)</span>
              </div>
            </div>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={aiConfig.enableContextAnalysis}
                onChange={(e) => setAiConfig(prev => ({ 
                  ...prev, 
                  enableContextAnalysis: e.target.checked 
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">启用上下文分析</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自定义提示词（可选）
              </label>
              <textarea
                value={aiConfig.customPrompt || ''}
                onChange={(e) => setAiConfig(prev => ({ ...prev, customPrompt: e.target.value }))}
                placeholder="输入自定义的AI提示词来优化提取效果..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 数据统计 */}
      <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
        <div className="flex items-center mb-3">
          <Brain className="w-5 h-5 text-purple-600 mr-2" />
          <h4 className="font-medium text-purple-800">待处理数据</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-purple-700">清洗后评论：</span>
            <span className="font-medium text-purple-900">{data.cleanedComments.length} 条</span>
          </div>
          <div>
            <span className="text-purple-700">已提取片段：</span>
            <span className="font-medium text-purple-900">{data.fragments.length} 个</span>
          </div>
          <div>
            <span className="text-purple-700">预计片段：</span>
            <span className="font-medium text-purple-900">
              {Math.round(data.cleanedComments.length * 2.5)} 个
            </span>
          </div>
          <div>
            <span className="text-purple-700">状态：</span>
            <span className="font-medium text-purple-900">
              {data.fragments.length > 0 ? '已提取' : '待提取'}
            </span>
          </div>
        </div>
      </div>

      {/* 提取按钮 */}
      <div className="flex justify-center">
        <Button
          onClick={handleExtractFeatures}
          disabled={extracting || data.cleanedComments.length === 0}
          className="px-8 py-3 text-lg"
        >
          {extracting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              AI提取中...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              开始AI提取
            </>
          )}
        </Button>
      </div>

      {/* 进度条 */}
      {extracting && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">AI提取进度</span>
            <span className="text-sm text-gray-500">{ui.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${ui.progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            正在分析评论内容，提取观点片段和功能标签...
          </p>
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
            <h4 className="text-red-800 font-medium">提取失败</h4>
            <p className="text-red-700 text-sm mt-1">{ui.error}</p>
          </div>
        </motion.div>
      )}

      {/* 提取结果 */}
      {extractResults && (
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
                提取结果统计
              </h4>

              {/* 统计信息 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded p-3 border">
                  <div className="flex items-center">
                    <Split className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">观点片段</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{extractResults.totalFragments} 个</p>
                  <p className="text-xs text-gray-500">从评论中提取</p>
                </div>
                <div className="bg-white rounded p-3 border">
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-purple-500 mr-2" />
                    <span className="text-sm font-medium">功能类别</span>
                  </div>
                  <p className="text-lg font-bold text-purple-600">{extractResults.topFeatures.length} 种</p>
                  <p className="text-xs text-gray-500">识别的功能点</p>
                </div>
                <div className="bg-white rounded p-3 border">
                  <div className="flex items-center">
                    <Merge className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium">平均密度</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {extractResults.avgFragmentsPerComment.toFixed(1)} 个/条
                  </p>
                  <p className="text-xs text-gray-500">每条评论的片段数</p>
                </div>
              </div>

              {/* 热门功能 */}
              <div className="mb-6">
                <h5 className="text-green-700 font-medium mb-3">热门功能排行：</h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {extractResults.topFeatures.map((feature, index) => (
                    <div key={feature.name} className="bg-white rounded border p-2 text-center">
                      <div className="text-xs text-gray-500">#{index + 1}</div>
                      <div className="font-medium text-gray-900">{feature.name}</div>
                      <div className="text-xs text-blue-600">{feature.count} 次</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 示例片段 */}
              <div className="space-y-3">
                <h5 className="text-green-700 font-medium">示例观点片段：</h5>
                {extractResults.sampleFragments.map((fragment, index) => (
                  <div key={fragment.id} className="bg-white rounded border p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {fragment.feature}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {fragment.sentimentType}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        置信度: {(fragment.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>原文：</strong>"{fragment.rawText}"
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>上下文：</strong>...{fragment.context}...
                    </p>
                  </div>
                ))}
              </div>

              {/* 下一步提示 */}
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-blue-800 text-sm">
                  ✅ 功能提取完成！共提取 {extractResults.totalFragments} 个观点片段，识别 {extractResults.topFeatures.length} 种功能类别。点击右下角的"下一步"按钮继续进行情感积分。
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}