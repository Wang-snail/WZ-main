import React from 'react';
import { motion } from 'framer-motion';
import { Target, Calculator, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

export default function CoreToolsPage() {
  const tools = [
    {
      id: 1,
      title: '销售额目标追踪系统',
      description: '专业的销售目标管理工具，支持币种自动换算、成本结构分析和多品线业绩追踪。',
      icon: <Target className="w-8 h-8 text-blue-600" />,
      link: '/sales-target',
      color: 'bg-blue-50'
    },
    {
      id: 2,
      title: '亚马逊 FBA 费用计算器',
      description: '精确计算亚马逊 FBA 各项费用，帮助您制定合理的定价策略和利润预期。',
      icon: <Calculator className="w-8 h-8 text-green-600" />,
      link: '/tools/fba-calculator',
      color: 'bg-green-50'
    },
    {
      id: 3,
      title: '亚马逊新品导入流程 SOP',
      description: '标准化的新品导入流程文档，涵盖从产品规划到上架销售的全过程。',
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      link: '/processes/amazon-new-product-import',
      color: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 核心工具页面头部 */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              核心工具
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              为电商从业者精心打造的三大核心工具，覆盖销售追踪、成本计算和流程管理
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className={`${tool.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                {tool.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.title}</h3>
              <p className="text-gray-600 mb-4">{tool.description}</p>
              <Link to={tool.link}>
                <Button className="w-full">
                  立即使用
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">为什么选择我们的核心工具？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-100 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">精准追踪</h3>
              <p className="text-gray-600 text-sm">实时追踪销售目标达成情况，数据驱动业务决策</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Calculator className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">精确计算</h3>
              <p className="text-gray-600 text-sm">准确计算各项费用，优化利润结构</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">规范流程</h3>
              <p className="text-gray-600 text-sm">标准化操作流程，提高工作效率和一致性</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}