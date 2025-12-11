import React from 'react';
import { motion } from 'framer-motion';
import { Target, Wrench, TestTube, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

export default function ExperimentPage() {
  const experiments = [
    {
      id: 1,
      title: '测试计算机调研逻辑',
      description: '基于多维变量的定性转定量策略推演系统',
      icon: <Target className="w-8 h-8 text-blue-600" />,
      link: '/experiment/strategy-simulator',
      color: 'bg-blue-50'
    },
    {
      id: 2,
      title: 'AI策略模拟器',
      description: '利用AI模型进行商业策略模拟和预测',
      icon: <Wrench className="w-8 h-8 text-green-600" />,
      link: '/experiment/ai-simulator',
      color: 'bg-green-50'
    },
    {
      id: 3,
      title: '数据可视化实验',
      description: '新型数据可视化方法和交互设计实验',
      icon: <TestTube className="w-8 h-8 text-purple-600" />,
      link: '/experiment/data-viz',
      color: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 试验田页面头部 */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              试验田
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              这里是我们的创新实验室，包含各种前沿功能的测试与实验
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiments.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className={`${exp.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                {exp.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{exp.title}</h3>
              <p className="text-gray-600 mb-4">{exp.description}</p>
              <Link to={exp.link}>
                <Button className="w-full">
                  立即体验
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">关于试验田</h2>
          <p className="text-gray-600 mb-4">
            试验田是我们探索新功能和创新想法的专属空间。在这里，您可以体验到最新的AI算法、
            交互设计和商业策略模型。这些功能都处于测试阶段，欢迎您提供反馈和建议。
          </p>
          <p className="text-gray-600">
            我们会根据用户反馈不断优化这些实验项目，部分优秀项目将正式集成到产品主流程中。
          </p>
        </div>
      </div>
    </div>
  );
}