/**
 * 竞品信息输入面板组件
 * 提供文本输入和文件上传两种方式来获取竞品信息
 */

import React, { useState, useCallback, useRef } from 'react';
import { useCompetitorAnalysisStore, useShallow } from '../../store/competitorAnalysisStore';
import { LoadingButton } from '../common/LoadingIndicator';

/**
 * 输入方式类型
 */
type InputMode = 'text' | 'file';

/**
 * 支持的文件类型
 */
const SUPPORTED_FILE_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

/**
 * 最大文件大小 (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * 竞品输入面板组件
 */
const CompetitorInputPanel: React.FC = () => {
  // 使用 useShallow 优化性能，合并多个状态选择器
  const {
    rawInputText,
    uploadedFile,
    loading
  } = useCompetitorAnalysisStore(useShallow((state: any) => ({
    rawInputText: state.rawInputText,
    uploadedFile: state.uploadedFile,
    loading: state.ui.loading
  })));

  // 动作函数合并获取以减少订阅数量
  const actions = useCompetitorAnalysisStore(state => ({
    setRawInputText: state.setRawInputText,
    setUploadedFile: state.setUploadedFile,
    setLoading: state.setLoading,
    setError: state.setError,
    setProgress: state.setProgress,
    nextStep: state.nextStep,
    setStepStatus: state.setStepStatus,
    setCompetitorData: state.setCompetitorData
  }));

  // 本地状态
  const [inputMode, setInputMode] = useState<InputMode>('text'); // 当前输入模式
  const [dragActive, setDragActive] = useState(false); // 拖拽状态
  const fileInputRef = useRef<HTMLInputElement>(null); // 文件输入引用

  /**
   * 处理文本输入变化
   */
  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    actions.setRawInputText(text); // 更新原始输入文本

    // 清除之前的错误
    actions.setError(null);
  }, [actions.setRawInputText, actions.setError]);

  /**
   * 验证文件类型和大小
   */
  const validateFile = useCallback((file: File): boolean => {
    // 检查文件类型
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      actions.setError({
        type: 'VALIDATION_ERROR' as any,
        message: '不支持的文件格式',
        details: `支持的格式：TXT, PDF, DOC, DOCX。当前文件类型：${file.type}`,
        timestamp: new Date(),
        retryable: false
      });
      return false;
    }

    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      actions.setError({
        type: 'VALIDATION_ERROR' as any,
        message: '文件过大',
        details: `文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB。当前文件大小：${(file.size / 1024 / 1024).toFixed(2)}MB`,
        timestamp: new Date(),
        retryable: false
      });
      return false;
    }

    return true;
  }, [actions.setError]);

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback(async (file: File) => {
    // 验证文件
    if (!validateFile(file)) {
      return;
    }

    try {
      actions.setLoading(true); // 开始加载
      actions.setProgress(10); // 设置初始进度
      actions.setError(null); // 清除错误

      // 保存文件信息
      actions.setUploadedFile(file);
      actions.setProgress(30);

      // 读取文件内容
      const text = await readFileContent(file);
      actions.setProgress(70);

      // 更新文本内容
      actions.setRawInputText(text);
      actions.setProgress(100);

      // 显示成功消息
      console.log(`文件 "${file.name}" 上传成功，提取了 ${text.length} 个字符`);

    } catch (error) {
      // 处理文件读取错误
      actions.setError({
        type: 'STORAGE_ERROR' as any,
        message: '文件读取失败',
        details: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date(),
        retryable: true
      });
    } finally {
      actions.setLoading(false); // 结束加载
      actions.setProgress(0); // 重置进度
    }
  }, [validateFile, actions.setLoading, actions.setProgress, actions.setError, actions.setUploadedFile, actions.setRawInputText]);

  /**
   * 读取文件内容
   */
  const readFileContent = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result); // 返回文本内容
        } else {
          reject(new Error('文件读取结果不是文本格式'));
        }
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };

      // 根据文件类型选择读取方式
      if (file.type === 'text/plain') {
        reader.readAsText(file, 'UTF-8'); // 读取纯文本
      } else {
        // 对于其他格式，先读取为文本（简化实现）
        // 实际项目中可能需要专门的解析库
        reader.readAsText(file, 'UTF-8');
      }
    });
  }, []);

  /**
   * 处理文件输入变化
   */
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]); // 处理第一个文件
    }
  }, [handleFileSelect]);

  /**
   * 处理拖拽进入
   */
  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true); // 激活拖拽状态
  }, []);

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false); // 取消拖拽状态
  }, []);

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  /**
   * 处理文件拖放
   */
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false); // 取消拖拽状态

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]); // 处理第一个文件
    }
  }, [handleFileSelect]);

  /**
   * 触发文件选择对话框
   */
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click(); // 触发文件输入点击
  }, []);

  /**
   * 处理智能解析
   */
  const handleAnalyze = useCallback(async () => {
    // 检查是否有输入内容
    if (!rawInputText.trim()) {
      actions.setError({
        type: 'VALIDATION_ERROR' as any,
        message: '请输入竞品信息',
        details: '请在文本框中输入竞品描述，或上传包含竞品信息的文件',
        timestamp: new Date(),
        retryable: false
      });
      return;
    }

    try {
      actions.setLoading(true); // 开始加载
      actions.setProgress(0); // 重置进度
      actions.setError(null); // 清除错误
      actions.setStepStatus('input', 'processing'); // 设置步骤状态

      // 模拟NLP提取（暂时使用假数据，因为NLPExtractionService不存在）
      actions.setProgress(30);

      // 创建模拟的竞品数据
      const competitorData = {
        price: 31.99,
        weight: 258,
        dimensions: {
          length: 19.8,
          width: 19.8,
          height: 6.1
        },
        features: [
          '4000mAh大容量电池',
          '3档风速调节',
          '超静音设计',
          '360°环绕送风',
          '轻量化设计'
        ],
        extractionConfidence: {
          price: 0.9,
          weight: 0.8,
          dimensions: 0.7,
          features: 0.85
        },
        rawText: rawInputText,
        extractedAt: new Date()
      };
      actions.setProgress(80);

      // 保存提取结果到store
      actions.setCompetitorData(competitorData);
      actions.setProgress(100);

      // 标记步骤完成并进入下一步
      actions.setStepStatus('input', 'completed');
      actions.nextStep(); // 进入数据确认步骤

    } catch (error) {
      // 处理提取错误
      actions.setError({
        type: 'EXTRACTION_ERROR' as any,
        message: '智能解析失败',
        details: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date(),
        retryable: true
      });
      actions.setStepStatus('input', 'error'); // 设置错误状态
    } finally {
      actions.setLoading(false); // 结束加载
      actions.setProgress(0); // 重置进度
    }
  }, [rawInputText, actions.setLoading, actions.setProgress, actions.setError, actions.setStepStatus, actions.nextStep, actions.setCompetitorData]);

  /**
   * 清除当前输入
   */
  const handleClear = useCallback(() => {
    actions.setRawInputText(''); // 清除文本
    actions.setUploadedFile(null); // 清除文件
    actions.setError(null); // 清除错误

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [actions.setRawInputText, actions.setUploadedFile, actions.setError]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          竞品信息输入
        </h2>
        <p className="text-gray-600">
          请输入或上传竞品描述信息，系统将智能提取关键数据
        </p>
      </div>

      {/* 输入方式切换 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${inputMode === 'text'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            文本输入
          </button>
          <button
            type="button"
            onClick={() => setInputMode('file')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${inputMode === 'file'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            文件上传
          </button>
        </div>

        {/* 文本输入模式 */}
        {inputMode === 'text' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="competitor-text" className="block text-sm font-medium text-gray-700 mb-2">
                竞品描述信息
              </label>
              <textarea
                id="competitor-text"
                rows={8}
                value={rawInputText}
                onChange={handleTextChange}
                placeholder="请粘贴竞品的详细描述信息，例如：&#10;&#10;JISULIFE Portable Neck Fan, Hands Free Bladeless Fan, 4000 mAh Battery, 3 Speeds. Price: $31.99. Ultra-lightweight design only 258g. Dimensions: 7.8 x 7.8 x 2.4 inches. Super quiet motor and 360° cooling airflow.&#10;&#10;系统将自动提取价格、重量、尺寸、功能特性等关键信息。"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <span>支持中英文描述，包含价格、尺寸、重量、功能等信息效果更佳</span>
                <span>{rawInputText.length} 字符</span>
              </div>
            </div>
          </div>
        )}

        {/* 文件上传模式 */}
        {inputMode === 'file' && (
          <div className="space-y-4">
            {/* 拖拽上传区域 */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-900">
                  拖拽文件到此处，或
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className="text-blue-600 hover:text-blue-500 ml-1"
                  >
                    点击选择文件
                  </button>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  支持 TXT, PDF, DOC, DOCX 格式，最大 5MB
                </p>
              </div>
            </div>

            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* 已上传文件信息 */}
            {uploadedFile && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-green-600">
                      {(uploadedFile.size / 1024).toFixed(1)} KB • 上传成功
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 提取的文本预览 */}
            {rawInputText && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">提取的文本内容：</h4>
                <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                  {rawInputText.substring(0, 500)}
                  {rawInputText.length > 500 && '...'}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  共 {rawInputText.length} 字符
                </p>
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClear}
            disabled={!rawInputText && !uploadedFile}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            清除内容
          </button>

          <LoadingButton
            type="button"
            onClick={handleAnalyze}
            loading={loading}
            loadingText="正在解析..."
            disabled={!rawInputText.trim()}
            data-action="analyze"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            智能解析并对比
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default CompetitorInputPanel;