import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';

const WorkflowsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 3秒后自动重定向到数据实验室
    const timer = setTimeout(() => {
      navigate('/lab', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleRedirectNow = () => {
    navigate('/lab', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          {/* 图标和标题 */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              功能升级通知
            </h1>
            <p className="text-lg text-gray-600">
              实战指南已升级为更强大的数据实验室
            </p>
          </div>

          {/* 升级说明 */}
          <div className="mb-8 space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">🚀 全新体验</h3>
              <p className="text-blue-800 text-sm">
                数据实验室提供更直观的应用模式和强大的工作流编辑器，让数据分析变得更简单高效。
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h3 className="font-semibold text-green-900 mb-2">📊 更多功能</h3>
              <p className="text-green-800 text-sm">
                包含市场分析、品牌排行、定价计算、供应商评估、销售预测、库存优化等6大专业应用。
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-4">
            <Button 
              onClick={handleRedirectNow}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>立即体验数据实验室</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <p className="text-sm text-gray-500">
              页面将在 3 秒后自动跳转...
            </p>
          </div>

          {/* 进度条 */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkflowsPage;