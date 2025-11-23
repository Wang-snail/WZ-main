import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  MessageCircle, 
  DollarSign, 
  Home, 
  Users, 
  Heart,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { exampleCases, ExampleCase, getRandomExample } from '@/data/examples';

interface ExampleSelectorProps {
  onSelectExample: (content: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export function ExampleSelector({ onSelectExample, isVisible, onClose }: ExampleSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'time', name: '时间分配', icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { id: 'communication', name: '沟通方式', icon: MessageCircle, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { id: 'money', name: '金钱观念', icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { id: 'family', name: '家庭责任', icon: Home, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { id: 'social', name: '社交圈子', icon: Users, color: 'text-pink-500', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
    { id: 'future', name: '未来规划', icon: Heart, color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  ];

  const filteredExamples = selectedCategory 
    ? exampleCases.filter(example => example.category === selectedCategory)
    : exampleCases;

  const handleSelectExample = (example: ExampleCase) => {
    onSelectExample(example.content);
    onClose();
  };

  const handleRandomExample = () => {
    const randomExample = getRandomExample();
    onSelectExample(randomExample.content);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">选择示例场景</h2>
          </div>
          <Button
            variant="outline"
            onClick={handleRandomExample}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-none hover:from-orange-600 hover:to-pink-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            随机体验
          </Button>
        </div>

        {/* 类别选择 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">选择争议类型</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
              className="h-auto p-3 justify-start"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span>全部类型</span>
              </div>
            </Button>
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`h-auto p-3 justify-start ${
                    isSelected ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : category.color}`} />
                    <span>{category.name}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* 示例列表 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            示例场景 ({filteredExamples.length}个)
          </h3>
          
          <AnimatePresence>
            <div className="grid gap-4">
              {filteredExamples.map((example, index) => {
                const category = categories.find(cat => cat.id === example.category);
                const Icon = category?.icon || BookOpen;
                
                return (
                  <motion.div
                    key={example.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${category?.bgColor} ${category?.borderColor} border-2`}
                      onClick={() => handleSelectExample(example)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${category?.color}`} />
                            <div>
                              <CardTitle className="text-lg text-gray-900">
                                {example.title}
                              </CardTitle>
                              <p className="text-sm text-gray-600 mt-1">
                                {example.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className={`${category?.color} bg-white/50`}>
                            {category?.name}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            约 {Math.ceil(example.content.length / 100)} 分钟阅读
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {example.content.substring(0, 120)}...
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </div>

        {/* 关闭按钮 */}
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
