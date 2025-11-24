// src/components/features/DivinationResultDisplay.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { DivinationResult } from '@/types';

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
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 lg:p-8">
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="mb-8 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              下载
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#FDFBF7] border-b border-gray-100 p-8 text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-white border border-gray-200 text-gray-600 font-light tracking-wider"
            >
              {result.service}
            </Badge>
            <h2 className="text-3xl font-serif-display font-medium text-gray-800 mb-2">
              指引与启示
            </h2>
            <p className="text-sm text-gray-400 font-light">
              {new Date(result.timestamp).toLocaleString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <div className="font-serif-display text-gray-700 leading-loose whitespace-pre-wrap">
                {result.result}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-50 text-center">
              <p className="text-sm text-gray-400 font-light italic">
                "愿这份指引能为您带来内心的平静与力量"
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}