// src/components/DivinationHistory.tsx
import React from 'react';
import { History } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { DivinationResult } from '../types';

interface Props {
  results: DivinationResult[];
  onResultClick: (result: DivinationResult) => void;
}

export default function DivinationHistory({ results, onResultClick }: Props) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无历史记录</h3>
        <p className="text-gray-500">开始您的第一次占卜吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card 
          key={result.id} 
          className="cursor-pointer hover:shadow-lg transition-all duration-300"
          onClick={() => onResultClick(result)}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">{result.service}</h3>
              <span className="text-sm text-gray-500">
                {new Date(result.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-600 line-clamp-2">{result.result.substring(0, 100)}...</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
