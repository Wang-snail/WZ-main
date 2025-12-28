import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Users, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import ChartCard from './ChartCard';

const Dashboard: React.FC = () => {
  const kpiCards = [
    {
      title: '市场增长指数',
      value: '156.7',
      unit: '%',
      change: '+12.5%',
      trend: 'up',
      description: '基于搜索趋势和销量数据'
    },
    {
      title: '竞争强度指数',
      value: '78.3',
      unit: '/100',
      change: '-5.2%',
      trend: 'down',
      description: '竞品分析和市场集中度'
    },
    {
      title: '用户需求指数',
      value: '89.4',
      unit: '/100',
      change: '+8.1%',
      trend: 'up',
      description: '基于用户反馈和搜索热度'
    },
    {
      title: '产品机会评分',
      value: '92.1',
      unit: '/100',
      change: '+15.7%',
      trend: 'up',
      description: '综合算法模型计算'
    }
  ];

  const insights = [
    {
      type: 'opportunity',
      title: '市场机会发现',
      description: '检测到AI智能音箱市场增长趋势，建议重点投入语音识别技术升级',
      confidence: '94%',
      priority: '高'
    },
    {
      type: 'warning',
      title: '竞争风险提醒',
      description: '竞品在智能家居领域推出新功能，建议加快产品迭代速度',
      confidence: '87%',
      priority: '中'
    },
    {
      type: 'success',
      title: '产品验证成功',
      description: '基于数据分析的产品定位策略验证成功，用户满意度提升25%',
      confidence: '96%',
      priority: '持续'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">数据驱动产品战略仪表盘</h1>
          <p className="text-gray-600 mt-1">基于权威数据源的智能产品规划决策支持</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">最后更新</p>
          <p className="text-lg font-semibold text-gray-900">2025-12-24 23:47</p>
        </div>
      </div>

      {/* KPI卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{kpi.change}</span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-600">{kpi.title}</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-bold text-gray-900">{kpi.value}</span>
                <span className="text-sm text-gray-500">{kpi.unit}</span>
              </div>
              <p className="text-xs text-gray-500">{kpi.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="市场趋势分析"
          description="基于Google Trends和百度指数的市场热度变化"
          chartType="trend"
        />
        <ChartCard 
          title="竞争态势分析"
          description="主要竞品的市场份额和增长趋势对比"
          chartType="competition"
        />
        <ChartCard 
          title="用户需求分析"
          description="基于搜索热度和用户反馈的需求变化"
          chartType="demand"
        />
        <ChartCard 
          title="产品组合分析"
          description="BCG矩阵视角的产品定位和策略建议"
          chartType="portfolio"
        />
      </div>

      {/* 智能洞察 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Target className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">智能洞察与建议</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${
                insight.type === 'opportunity' 
                  ? 'bg-green-50 border-green-200' 
                  : insight.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  insight.type === 'opportunity' 
                    ? 'bg-green-100 text-green-700' 
                    : insight.type === 'warning'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {insight.priority}优先级
                </span>
                <span className="text-xs text-gray-500">
                  置信度: {insight.confidence}
                </span>
              </div>
              <h3 className={`font-semibold mb-2 ${
                insight.type === 'opportunity' 
                  ? 'text-green-800' 
                  : insight.type === 'warning'
                  ? 'text-yellow-800'
                  : 'text-blue-800'
              }`}>
                {insight.title}
              </h3>
              <p className={`text-sm ${
                insight.type === 'opportunity' 
                  ? 'text-green-700' 
                  : insight.type === 'warning'
                  ? 'text-yellow-700'
                  : 'text-blue-700'
              }`}>
                {insight.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;