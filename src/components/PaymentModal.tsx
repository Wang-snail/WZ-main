// src/components/PaymentModal.tsx
import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ onClose, onSuccess }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">支付占卜服务</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-2xl font-bold text-green-600 mb-2">¥9.9</p>
            <p className="text-gray-600">专业AI占卜分析</p>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <img 
              src="/images/alipay_qr_placeholder.svg" 
              alt="支付宝收款码" 
              className="w-48 h-48 mx-auto"
            />
            <p className="text-sm text-gray-600 mt-2">使用支付宝扫码支付</p>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              取消
            </Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={onSuccess}>
              已完成支付
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
