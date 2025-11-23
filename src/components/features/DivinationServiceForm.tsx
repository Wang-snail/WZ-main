// src/components/features/DivinationServiceForm.tsx
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { DivinationResult, DivinationService } from '@/types';
import { aiServiceManager } from '@/services/aiServiceManager';
import PaymentModal from './PaymentModal';

interface Props {
  service: DivinationService;
  onBack: () => void;
  onComplete: (result: DivinationResult) => void;
  canUseFree: boolean;
}

export default function DivinationServiceForm({ service, onBack, onComplete, canUseFree }: Props) {
  const [formData, setFormData] = useState<any>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = generateDivinationPrompt(service, formData);
      const analysis = await aiServiceManager.generateResponse(prompt);

      const result: DivinationResult = {
        id: Date.now().toString(),
        service: service.title,
        input: formData,
        result: analysis,
        timestamp: new Date(),
        type: service.id
      };

      onComplete(result);
    } catch (error) {
      console.error('占卜分析失败:', error);
      // You might want to show an error toast to the user here
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (canUseFree) {
      await performAnalysis();
    } else {
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    await performAnalysis();
  };

  if (showPayment) {
    return <PaymentModal
      onClose={() => setShowPayment(false)}
      onSuccess={handlePaymentSuccess}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center shadow-lg`}>
              {service.icon}
            </div>
            <CardTitle className="text-2xl font-bold">{service.title}</CardTitle>
            <p className="text-gray-600">{service.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {renderServiceForm(service, formData, setFormData)}

              <Button
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className={`w-full bg-gradient-to-r ${service.color} text-white py-3 text-lg`}
              >
                {isAnalyzing ? '正在分析...' : canUseFree ? '免费开始占卜' : '支付 ¥9.9 开始占卜'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper functions
function generateDivinationPrompt(service: DivinationService, formData: any): string {
  const basePrompt = `作为专业的${service.title}师，请根据以下信息进行详细分析：\n\n`;
  const dataStr = Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join('\n');

  return basePrompt + dataStr + '\n\n请提供专业、详细的分析结果，包括具体的建议和指导。';
}

function renderServiceForm(service: any, formData: any, setFormData: any) {
  const updateFormData = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  switch (service.id) {
    case 'tarot':
      return (
        <>
          <div>
            <Label htmlFor="question">占卜问题</Label>
            <Textarea
              id="question"
              placeholder="请输入您想要占卜的问题..."
              value={formData.question || ''}
              onChange={(e) => updateFormData('question', e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="focus">关注领域</Label>
            <select
              id="focus"
              value={formData.focus || ''}
              onChange={(e) => updateFormData('focus', e.target.value)}
              className="mt-2 w-full p-2 border rounded-md"
            >
              <option value="">请选择</option>
              <option value="love">爱情</option>
              <option value="career">事业</option>
              <option value="health">健康</option>
              <option value="finance">财运</option>
              <option value="general">综合运势</option>
            </select>
          </div>
        </>
      );

    case 'constellation':
      return (
        <>
          <div>
            <Label htmlFor="birthday">出生日期</Label>
            <Input
              type="date"
              id="birthday"
              value={formData.birthday || ''}
              onChange={(e) => updateFormData('birthday', e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="birthTime">出生时间（可选）</Label>
            <Input
              type="time"
              id="birthTime"
              value={formData.birthTime || ''}
              onChange={(e) => updateFormData('birthTime', e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="birthPlace">出生地点（可选）</Label>
            <Input
              id="birthPlace"
              placeholder="请输入出生城市"
              value={formData.birthPlace || ''}
              onChange={(e) => updateFormData('birthPlace', e.target.value)}
              className="mt-2"
            />
          </div>
        </>
      );

    case 'palmistry':
      return (
        <>
          <div>
            <Label htmlFor="hand">惯用手</Label>
            <select
              id="hand"
              value={formData.hand || ''}
              onChange={(e) => updateFormData('hand', e.target.value)}
              className="mt-2 w-full p-2 border rounded-md"
            >
              <option value="">请选择</option>
              <option value="left">左手</option>
              <option value="right">右手</option>
            </select>
          </div>
          <div>
            <Label htmlFor="palmDescription">手相描述</Label>
            <Textarea
              id="palmDescription"
              placeholder="请描述您的手相特征，如手掌大小、线条清晰度等..."
              value={formData.palmDescription || ''}
              onChange={(e) => updateFormData('palmDescription', e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
        </>
      );

    case 'nameanalysis':
      return (
        <>
          <div>
            <Label htmlFor="fullName">姓名</Label>
            <Input
              id="fullName"
              placeholder="请输入您的姓名"
              value={formData.fullName || ''}
              onChange={(e) => updateFormData('fullName', e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="birthDate">出生日期</Label>
            <Input
              type="date"
              id="birthDate"
              value={formData.birthDate || ''}
              onChange={(e) => updateFormData('birthDate', e.target.value)}
              className="mt-2"
            />
          </div>
        </>
      );

    default:
      return (
        <div>
          <Label htmlFor="query">请描述您的问题</Label>
          <Textarea
            id="query"
            placeholder="请详细描述您想要咨询的问题..."
            value={formData.query || ''}
            onChange={(e) => updateFormData('query', e.target.value)}
            className="mt-2"
            rows={4}
          />
        </div>
      );
  }
}
