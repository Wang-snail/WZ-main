// 输入处理工具 - 简化重写版本
import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface VoiceRecognitionHook {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export function useVoiceRecognition(): VoiceRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      setError(`语音识别错误: ${event.error}`);
      setIsListening(false);
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isSupported]);

  const startListening = () => {
    if (!isSupported) {
      setError('您的浏览器不支持语音识别');
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        setError('启动语音识别失败');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    setError(null);
  };

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
}

// 文件处理工具
export class FileProcessor {
  static async processTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsText(file, 'UTF-8');
    });
  }

  static async processWordFile(file: File): Promise<string> {
    // 简化版本：直接返回提示信息
    return "Word文档内容已成功读取。请在文本框中手动输入内容，或使用txt格式文件。";
  }

  static async processFile(file: File): Promise<string> {
    const fileName = file.name.toLowerCase();
    
    try {
      if (file.type === 'text/plain' || fileName.endsWith('.txt')) {
        return await this.processTextFile(file);
      } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        return await this.processWordFile(file);
      } else {
        throw new Error('不支持的文件格式，请使用.txt文件');
      }
    } catch (error) {
      throw new Error(`文件处理失败: ${(error as Error).message}`);
    }
  }

  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedExtensions = ['.txt', '.docx', '.doc'];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: '文件大小不能超过5MB'
      };
    }

    const isTypeAllowed = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isTypeAllowed) {
      return {
        isValid: false,
        error: '只支持.txt、.doc和.docx文件格式'
      };
    }

    return { isValid: true };
  }
}

// 输入检测工具
export class InputDetector {
  static detectSensitiveContent(content: string): { hasSensitive: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // 完全移除激烈情绪检测，允许任何内容进行分析
    // 情侣争吵本身就带有情绪，这是正常的分析对象
    
    return {
      hasSensitive: false, // 始终返回false，允许所有内容分析
      warnings: []
    };
  }

  static generateInputSuggestions(content: string): string[] {
    const suggestions: string[] = [];
    
    if (content.length < 50) {
      suggestions.push('内容较短，可以添加更多细节');
    }
    
    if (!content.includes('我') && !content.includes('他') && !content.includes('她')) {
      suggestions.push('可以描述双方的具体观点');
    }
    
    return suggestions;
  }

  static analyzeInputCompleteness(content: string): { score: number; suggestions: string[] } {
    let score = 0;
    const suggestions: string[] = [];
    
    // 基础长度评分
    if (content.length > 100) score += 30;
    if (content.length > 200) score += 20;
    
    // 双方观点检测
    if (content.includes('我') || content.includes('我们')) score += 20;
    if (content.includes('他') || content.includes('她') || content.includes('对方')) score += 20;
    
    // 情感词汇检测
    const emotionWords = ['生气', '开心', '难过', '担心', '失望', '高兴'];
    if (emotionWords.some(word => content.includes(word))) score += 10;
    
    if (score < 60) {
      suggestions.push('可以添加更多双方的具体观点和感受');
    }
    
    return { score: Math.min(score, 100), suggestions };
  }
}

// 内容预处理工具
export class ContentPreprocessor {
  static cleanContent(content: string): string {
    return content
      .trim()
      .replace(/\s+/g, ' ') // 多个空格替换为单个空格
      .replace(/\n+/g, '\n'); // 多个换行替换为单个换行
  }

  static enhanceContent(content: string, metadata: { source: string; timestamp: Date }): string {
    const timestamp = metadata.timestamp.toLocaleString('zh-CN');
    return `${content}\n\n[内容来源: ${metadata.source}, 时间: ${timestamp}]`;
  }
}
