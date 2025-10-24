import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  Users,
  Sparkles,
} from 'lucide-react';

export default function LazyCoreFeatures() {
  const features = [
    {
      title: '智能选品',
      description: 'AI分析市场趋势，帮你找到最有潜力的产品',
      icon: <BarChart3 className="w-8 h-8" />,
      gradient: 'from-blue-400 to-cyan-400'
    },
    {
      title: '营销优化',
      description: '自动生成文案和广告素材，提升转化率',
      icon: <Sparkles className="w-8 h-8" />,
      gradient: 'from-green-400 to-emerald-400'
    },
    {
      title: '数据分析',
      description: '实时监控销售数据，智能优化运营策略',
      icon: <BookOpen className="w-8 h-8" />,
      gradient: 'from-purple-400 to-pink-400'
    },
    {
      title: '社区互助',
      description: '电商同行交流，问题快速解答',
      icon: <Users className="w-8 h-8" />,
      gradient: 'from-orange-400 to-red-400'
    },
  ];

  return (
    <section className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">
            为什么选择 WSNAIL？
          </h2>
          <p className="text-xl text-gray-600 font-light">
            专为电商人设计的智能平台
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="backdrop-blur-xl bg-white/60 border border-gray-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 hover:bg-white/80"
            >
              <div className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-gray-600 font-light">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}