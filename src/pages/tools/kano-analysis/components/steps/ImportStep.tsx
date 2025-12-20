import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  File,
  Table,
  Eye,
  AlertCircle,
  CheckCircle,
  X,
  Trash2,
  Zap
} from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { useKanoToolStore, CommentData, WorkflowStep } from '../../store/kanoToolStore';
import { FileParserService } from '../../services/FileParserService';

export function ImportStep() {
  const {
    data,
    ui,
    setRawComments,
    setLoading,
    setError,
    setStepStatus,
    setCurrentFile,
    nextStep,
    startAutoAnalysis
  } = useKanoToolStore();

  const { isAutoRunning } = ui;

  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste'>('file');
  const [textInput, setTextInput] = useState('');
  const [preview, setPreview] = useState<{
    totalComments: number;
    sampleComments: string[];
    detectedFormat: string;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 文件上传处理
  const handleFileUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const comments = await FileParserService.parseFile(file);

      if (comments.length === 0) {
        throw new Error('文件中没有找到有效的评论数据');
      }

      // 验证解析结果
      const { valid, invalid } = FileParserService.validateComments(comments);

      if (valid.length === 0) {
        throw new Error('文件中没有找到有效的评论数据');
      }

      // 如果有无效数据，给出警告但继续处理
      if (invalid.length > 0) {
        console.warn(`发现 ${invalid.length} 条无效评论，已自动过滤`);
      }


      setRawComments(valid);
      setCurrentFile(file);
      generatePreview(valid, file.name.split('.').pop() || 'unknown');
      setStepStatus(WorkflowStep.IMPORT, 'completed');
    } catch (error) {
      setError(error instanceof Error ? error.message : '文件处理失败');
      setStepStatus(WorkflowStep.IMPORT, 'error');
    } finally {
      setLoading(false);
    }
  }, [setRawComments, setLoading, setError, setStepStatus]);

  // 文本粘贴处理
  const handleTextPaste = useCallback(() => {
    if (!textInput.trim()) {
      setError('请输入评论文本');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const comments = FileParserService.parseTextContent(textInput);

      if (comments.length === 0) {
        throw new Error('没有找到有效的评论数据');
      }

      // 验证解析结果
      const { valid, invalid } = FileParserService.validateComments(comments);

      if (valid.length === 0) {
        throw new Error('没有找到有效的评论数据');
      }

      setRawComments(valid);
      generatePreview(valid, 'text');
      setStepStatus(WorkflowStep.IMPORT, 'completed');
    } catch (error) {
      setError(error instanceof Error ? error.message : '文本处理失败');
      setStepStatus(WorkflowStep.IMPORT, 'error');
    } finally {
      setLoading(false);
    }
  }, [textInput, setRawComments, setLoading, setError, setStepStatus]);

  // 加载演示数据
  const handleLoadDemoData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/demo-data/kano-analysis-sample.csv');
      if (!response.ok) {
        throw new Error('演示数据加载失败');
      }

      const csvText = await response.text();
      const comments = FileParserService.parseCSVContent(csvText);

      if (comments.length === 0) {
        throw new Error('演示数据解析失败');
      }

      setRawComments(comments);
      generatePreview(comments, 'csv');
      setStepStatus(WorkflowStep.IMPORT, 'completed');
    } catch (error) {
      setError(error instanceof Error ? error.message : '演示数据加载失败');
      setStepStatus(WorkflowStep.IMPORT, 'error');
    } finally {
      setLoading(false);
    }
  }, [setRawComments, setLoading, setError, setStepStatus]);

  // 生成预览
  const generatePreview = (comments: CommentData[], format: string) => {
    setPreview({
      totalComments: comments.length,
      sampleComments: comments.slice(0, 3).map(c => c.content),
      detectedFormat: format,
    });
  };

  // 清除数据
  const handleClearData = useCallback(() => {
    setRawComments([]);
    setStepStatus(WorkflowStep.IMPORT, 'pending');
    setPreview(null);
    setTextInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setRawComments, setStepStatus]);

  // 文件拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 步骤标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">导入数据</h2>
        <p className="text-gray-600">
          上传评论文件或直接粘贴文本，支持 CSV、Excel、TXT、Word 等格式
        </p>
      </div>

      {/* 上传方式选择 */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={uploadMethod === 'file' ? 'default' : 'outline'}
          onClick={() => setUploadMethod('file')}
          className="flex items-center"
        >
          <Upload className="w-4 h-4 mr-2" />
          文件上传
        </Button>
        <Button
          variant={uploadMethod === 'paste' ? 'default' : 'outline'}
          onClick={() => setUploadMethod('paste')}
          className="flex items-center"
        >
          <FileText className="w-4 h-4 mr-2" />
          文本粘贴
        </Button>
      </div>

      {/* 文件上传区域 */}
      {uploadMethod === 'file' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            拖拽文件到此处或点击上传
          </h3>
          <p className="text-gray-600 mb-4">
            支持 CSV、Excel、TXT、Word 格式，最大 10MB
          </p>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,.xlsx,.xls,.txt,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              // 重置value，允许重复选择同一文件
              e.target.value = '';
            }}
            className="hidden"
          />
          <Button
            className="cursor-pointer mb-2"
            onClick={() => fileInputRef.current?.click()}
          >
            选择文件
          </Button>
          <div className="mt-2">
            <Button
              onClick={handleLoadDemoData}
              variant="outline"
              size="sm"
              disabled={ui.loading}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              加载演示数据
            </Button>
          </div>

          {/* 支持的格式说明 */}
          <div className="flex justify-center space-x-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Table className="w-4 h-4 mr-1" />
              CSV/Excel
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              TXT
            </div>
            <div className="flex items-center">
              <File className="w-4 h-4 mr-1" />
              Word
            </div>
          </div>
        </motion.div>
      )}

      {/* 文本粘贴区域 */}
      {uploadMethod === 'paste' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              评论文本（每行一条评论）
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="请粘贴评论文本，每行一条评论，例如：&#10;这个产品很好用，电池续航不错&#10;屏幕显示效果很棒，但是有点重&#10;价格合理，性价比很高"
              className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <Button
            onClick={handleTextPaste}
            disabled={!textInput.trim() || ui.loading}
            className="w-full"
          >
            {ui.loading ? '处理中...' : '解析文本'}
          </Button>
        </motion.div>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* 内容预览 */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-6 relative"
        >
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-green-800 font-medium mb-2 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                数据预览
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearData}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                删除文件
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-700 font-medium">总评论数：</span>
                  <span className="text-green-800">{preview.totalComments} 条</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">检测格式：</span>
                  <span className="text-green-800">{preview.detectedFormat.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">状态：</span>
                  <span className="text-green-800">导入成功</span>
                </div>
              </div>

              {/* 示例评论 */}
              <div className="mt-4">
                <h5 className="text-green-700 font-medium mb-2">示例评论：</h5>
                <div className="space-y-2">
                  {preview.sampleComments.map((comment, index) => (
                    <div key={index} className="bg-white rounded p-2 text-gray-700 text-sm border">
                      {comment.length > 100 ? `${comment.substring(0, 100)}...` : comment}
                    </div>
                  ))}
                </div>
              </div>

              {/* 下一步提示 */}
              <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-blue-900 font-semibold text-lg mb-2 flex items-center">
                      ✅ 数据导入完成！
                    </h4>
                    <p className="text-blue-700 text-sm">
                      您可以点击下方按钮开始自动分析，系统将自动完成所有分析步骤
                    </p>
                  </div>
                </div>
                
                {/* 自动分析按钮 */}
                <div className="flex flex-col space-y-3">
                  <Button
                    onClick={startAutoAnalysis}
                    disabled={isAutoRunning}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    size="lg"
                  >
                    {isAutoRunning ? (
                      <>
                        <motion.div 
                          className="rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        正在自动分析...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-3" />
                        🚀 一键自动分析
                      </>
                    )}
                  </Button>
                  
                  {/* 进度条 */}
                  {isAutoRunning && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-sm text-blue-600">
                        <span>分析进度</span>
                        <span>{Math.round(ui.progress)}%</span>
                      </div>
                      <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${ui.progress}%` }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  )}
                  
                  {/* 或者手动进行 */}
                  <div className="text-center">
                    <span className="text-gray-500 text-sm">或者</span>
                    <Button
                      onClick={nextStep}
                      variant="outline"
                      disabled={isAutoRunning}
                      className="ml-2 text-sm"
                    >
                      手动逐步进行
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}