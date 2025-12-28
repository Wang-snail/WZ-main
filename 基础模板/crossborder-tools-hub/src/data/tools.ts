export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  isNew?: boolean;
  isHot?: boolean;
  color: string;
}

export const tools: Tool[] = [
  {
    id: '1',
    name: '关键词挖掘助手',
    description: '基于竞品评论挖掘长尾关键词，弥补传统工具只关注高流量词的不足',
    category: '广告优化',
    icon: 'Search',
    isHot: true,
    color: 'bg-blue-500'
  },
  {
    id: '2',
    name: '库存预警计算器',
    description: '智能预测断货时间，考虑补货周期、运输延迟等现实因素',
    category: '库存管理',
    icon: 'Package',
    color: 'bg-green-500'
  },
  {
    id: '3',
    name: '评论情感分析器',
    description: '深度分析产品评论的情感倾向，识别真实用户痛点',
    category: '评论分析',
    icon: 'MessageSquare',
    isNew: true,
    color: 'bg-purple-500'
  },
  {
    id: '4',
    name: '竞品定价监控',
    description: '实时追踪竞品价格变动，智能预警价格战风险',
    category: '竞品分析',
    icon: 'TrendingUp',
    color: 'bg-orange-500'
  },
  {
    id: '5',
    name: '物流成本优化',
    description: '计算最优发货策略，比较FBA、海外仓、直接发货的成本差异',
    category: '物流优化',
    icon: 'Truck',
    color: 'bg-indigo-500'
  },
  {
    id: '6',
    name: '退货原因分析',
    description: '统计退货原因占比，识别产品质量和描述问题',
    category: '数据分析',
    icon: 'BarChart3',
    color: 'bg-pink-500'
  },
  {
    id: '7',
    name: '广告词频统计',
    description: '分析竞品广告文案高频词汇，优化广告创意策略',
    category: '广告优化',
    icon: 'Edit3',
    color: 'bg-cyan-500'
  },
  {
    id: '8',
    name: '季节性预测器',
    description: '基于历史数据预测产品季节性需求，提前规划库存',
    category: '选品分析',
    icon: 'Calendar',
    isNew: true,
    color: 'bg-yellow-500'
  },
  {
    id: '9',
    name: '转化率优化器',
    description: '分析Listing各要素对转化率的影响，提供具体优化建议',
    category: '转化优化',
    icon: 'Target',
    color: 'bg-red-500'
  },
  {
    id: '10',
    name: '税务合规检查',
    description: '自动检测跨境销售税务风险，确保合规运营',
    category: '合规管理',
    icon: 'Shield',
    color: 'bg-gray-500'
  },
  {
    id: '11',
    name: '汇率波动预警',
    description: '实时监控主要货币汇率变化，预警利润风险',
    category: '风险管理',
    icon: 'DollarSign',
    color: 'bg-emerald-500'
  },
  {
    id: '12',
    name: '产品生命周期分析',
    description: '判断产品所处生命周期阶段，制定对应营销策略',
    category: '产品分析',
    icon: 'Zap',
    isHot: true,
    color: 'bg-violet-500'
  }
];

export const categories = ['全部', '广告优化', '库存管理', '评论分析', '竞品分析', '物流优化', '数据分析', '选品分析', '转化优化', '合规管理', '风险管理', '产品分析'];