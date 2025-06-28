// src/components/DivinationResultDisplay.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { DivinationResult } from '../types';

interface Props {
  result: DivinationResult;
  onBack: () => void;
}

export default function DivinationResultDisplay({ result, onBack }: Props) {
  const handleDownload = () => {
    const content = `
# ${result.service} 占卜结果

**时间:** ${new Date(result.timestamp).toLocaleString()}

**输入信息:**
${Object.entries(result.input).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

---

**分析结果:**
${result.result}
    `;
    const blob = new Blob([content.trim()], { type: 'text/markdown;charset=utf-8' });
    // Dynamically import file-saver to avoid SSR issues
    import('file-saver').then(fileSaver => {
      fileSaver.saveAs(blob, `占卜结果-${result.id}.md`);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${result.service} 占卜结���`,
        text: `我刚刚进行了一次${result.service}占卜，这是我的结果：\n\n${result.result.substring(0, 150)}...`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(result.result);
      alert('结果已复制到剪贴板！');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <motion.div 
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              下载
            </Button>
          </div>
        </div>

        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="bg-white/50 border-b border-gray-200 p-6">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">{result.service}</Badge>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                占卜分析结果
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
              {result.result}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}