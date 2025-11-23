import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Mic, MicOff, FileText, Upload, Send, Heart, MessageCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { 
  useVoiceRecognition, 
  FileProcessor, 
  InputDetector, 
  ContentPreprocessor 
} from '@/utils/inputHandlers';
import { ExampleSelector } from './ExampleSelector';

interface SmartInputAreaProps {
  onContentSubmit: (content: string) => void;
  isAnalyzing: boolean;
}

export function SmartInputArea({ onContentSubmit, isAnalyzing }: SmartInputAreaProps) {
  const [content, setContent] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'voice' | 'file'>('text');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  
  const {
    isListening,
    transcript,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: voiceError
  } = useVoiceRecognition();

  // 处理语音输入
  React.useEffect(() => {
    if (transcript) {
      setContent(prev => prev + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // 文件拖拽处理
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validation = FileProcessor.validateFile(file);
    if (!validation.isValid) {
      toast.error(validation.error!);
      return;
    }

    setIsProcessingFile(true);
    try {
      const fileContent = await FileProcessor.processFile(file);
      const enhancedContent = ContentPreprocessor.enhanceContent(fileContent, {
        source: 'file',
        timestamp: new Date()
      });
      setContent(prev => prev + '\n\n' + enhancedContent);
      setInputMode('text');
      toast.success(`文件 "${file.name}" 上传成功！`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsProcessingFile(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false
  });

  // 处理提交
  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('请先输入内容');
      return;
    }

    const sensitivity = InputDetector.detectSensitiveContent(content);
    if (sensitivity.hasSensitive) {
      sensitivity.warnings.forEach(warning => toast.error(warning));
      return;
    }

    const cleanedContent = ContentPreprocessor.cleanContent(content);
    onContentSubmit(cleanedContent);
  };

  // 处理示例选择
  const handleExampleSelect = (exampleContent: string) => {
    setContent(exampleContent);
    setInputMode('text');
    toast.success('示例加载成功！可以直接分析或进行修改');
  };

  // 获取输入建议
  const inputSuggestions = InputDetector.generateInputSuggestions(content);
  const completeness = InputDetector.analyzeInputCompleteness(content);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200 shadow-lg">
      <CardContent className="p-6">
        {/* 温暖的标题 */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-6 h-6 text-pink-500" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              告诉我们发生了什么
            </h2>
            <Heart className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-gray-600 text-sm">
            我们会用心聆听，并帮助你们理解彼此的感受 💝
          </p>
        </div>

        {/* 输入方式切换 */}
        <div className="flex justify-center gap-2 mb-4">
          <Button
            variant={inputMode === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('text')}
            className="rounded-full"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            文字输入
          </Button>
          <Button
            variant={inputMode === 'voice' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('voice')}
            disabled={!voiceSupported}
            className="rounded-full"
          >
            <Mic className="w-4 h-4 mr-1" />
            语音输入
            {!voiceSupported && <span className="text-xs ml-1">(不支持)</span>}
          </Button>
          <Button
            variant={inputMode === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('file')}
            className="rounded-full"
          >
            <FileText className="w-4 h-4 mr-1" />
            文件上传
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExamples(true)}
            className="rounded-full border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <BookOpen className="w-4 h-4 mr-1" />
            示例场景
          </Button>
        </div>

        {/* 输入区域 */}
        <div className="space-y-4">
          {inputMode === 'text' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在这里分享你们的情况吧... 比如：&#10;&#10;今天我们因为时间安排产生了分歧。我觉得...&#10;但是他/她认为...&#10;&#10;💡 提示：详细描述双方的观点和感受，有助于获得更准确的分析"
                className="min-h-[120px] text-base leading-relaxed border-orange-200 focus:border-orange-400 focus:ring-orange-200 bg-white/70 backdrop-blur-sm rounded-xl"
                style={{ resize: 'vertical' }}
              />
              
              {/* 输入建议 */}
              {inputSuggestions.length > 0 && content.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-2"
                >
                  {inputSuggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-orange-100 text-orange-700 border-orange-200 text-xs py-1"
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {inputMode === 'voice' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center py-8 bg-white/50 rounded-xl border-2 border-dashed border-orange-300">
                <motion.div
                  animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
                  className="mb-4"
                >
                  {isListening ? (
                    <div className="relative">
                      <Mic className="w-16 h-16 text-red-500 mx-auto" />
                      <motion.div
                        className="absolute inset-0 border-4 border-red-300 rounded-full"
                        animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    </div>
                  ) : (
                    <MicOff className="w-16 h-16 text-gray-400 mx-auto" />
                  )}
                </motion.div>
                
                <div className="space-y-2">
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    variant={isListening ? 'destructive' : 'default'}
                    size="lg"
                    className="rounded-full px-8"
                    disabled={!voiceSupported}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-5 h-5 mr-2" />
                        停止录音
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 mr-2" />
                        开始录音
                      </>
                    )}
                  </Button>
                  
                  {voiceError && (
                    <p className="text-red-500 text-sm">{voiceError}</p>
                  )}
                  
                  {isListening && (
                    <p className="text-orange-600 text-sm animate-pulse">
                      正在聆听中... 请自然地说出你们的情况
                    </p>
                  )}
                </div>
              </div>
              
              {content && (
                <div className="bg-white/70 p-4 rounded-xl border border-orange-200">
                  <p className="text-sm text-gray-600 mb-2">已录制内容：</p>
                  <p className="text-gray-800">{content}</p>
                </div>
              )}
            </motion.div>
          )}

          {inputMode === 'file' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                {...getRootProps()}
                className={`
                  p-8 text-center border-2 border-dashed rounded-xl cursor-pointer transition-all
                  ${isDragActive 
                    ? 'border-orange-400 bg-orange-50' 
                    : 'border-orange-300 bg-white/50 hover:bg-orange-50'
                  }
                `}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={isDragActive ? { scale: 1.05 } : {}}
                  className="space-y-4"
                >
                  <Upload className="w-16 h-16 text-orange-400 mx-auto" />
                  
                  {isProcessingFile ? (
                    <div className="space-y-2">
                      <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-orange-600">正在处理文件...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-700">
                        {isDragActive ? '松开鼠标上传文件' : '拖拽文件到这里，或点击选择'}
                      </p>
                      <p className="text-sm text-gray-500">
                        支持 .txt 和 .docx 文件，最大 5MB
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 内容完整性指示器 */}
        {content.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>内容完整度</span>
              <span>{completeness.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completeness.score}%` }}
                transition={{ duration: 0.5 }}
                className={`h-2 rounded-full ${
                  completeness.score >= 80 ? 'bg-green-500' :
                  completeness.score >= 60 ? 'bg-yellow-500' :
                  'bg-orange-500'
                }`}
              />
            </div>
            
            {completeness.suggestions.length > 0 && (
              <div className="text-xs text-gray-500">
                💡 {completeness.suggestions[0]}
              </div>
            )}
          </motion.div>
        )}

        {/* 提交按钮 */}
        <div className="mt-6 text-center">
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isAnalyzing}
            size="lg"
            className="rounded-full px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                AI正在分析中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                开始智能分析
              </>
            )}
          </Button>
        </div>

        {/* 温馨提示 */}
        <div className="mt-4 text-center text-xs text-gray-500 space-y-1">
          <p>🔒 您的隐私受到保护，所有内容仅在本地处理</p>
          <p>💝 我们致力于帮助每一对伴侣建立更好的关系</p>
        </div>
      </CardContent>

      {/* 示例选择器 */}
      <ExampleSelector
        isVisible={showExamples}
        onSelectExample={handleExampleSelect}
        onClose={() => setShowExamples(false)}
      />
    </Card>
  );
}
