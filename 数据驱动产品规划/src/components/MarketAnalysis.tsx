import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download,
  BarChart3,
  Globe,
  Clock
} from 'lucide-react';

interface MarketOpportunity {
  id: string;
  title: string;
  category: string;
  marketSize: number; // 亿元
  growthRate: number; // %
  competitionLevel: 'low' | 'medium' | 'high';
  entryBarriers: 'low' | 'medium' | 'high';
  potentialROI: number; // %
  timeToMarket: number; // 月
  dataSource: string;
  confidence: number; // %
  description: string;
  trends: string[];
  risks: string[];
}

const MarketAnalysis: React.FC = () => {
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([
    {
      id: '1',
      title: '智能语音助手市场',
      category: '人工智能',
      marketSize: 1200,
      growthRate: 35.8,
      competitionLevel: 'high',
      entryBarriers: 'high',
      potentialROI: 180,
      timeToMarket: 18,
      dataSource: 'Google Trends + 百度指数',
      confidence: 94,
      description: '基于自然语言处理的智能语音助手市场快速增长，特别是在智能家居、车载系统和企业服务领域',
      trends: ['语音识别准确率提升', '多语言支持', '情感计算', '个性化服务'],
      risks: ['技术壁垒高', '大厂垄断', '隐私安全担忧']
    },
    {
      id: '2',
      title: '健康监测可穿戴设备',
      category: '健康科技',
      marketSize: 800,
      growthRate: 28.5,
      competitionLevel: 'medium',
      entryBarriers: 'medium',
      potentialROI: 150,
      timeToMarket: 12,
      dataSource: 'Statista + 社交媒体分析',
      confidence: 87,
      description: '消费者对健康监测和预防医学的需求持续增长，可穿戴设备市场呈现多元化发展',
      trends: ['医疗级认证', '多参数监测', 'AI健康分析', '远程医疗集成'],
      risks: ['监管要求严格', '技术门槛', '用户接受度']
    },
    {
      id: '3',
      title: '可持续发展产品',
      category: '环保科技',
      marketSize: 600,
      growthRate: 42.1,
      competitionLevel: 'low',
      entryBarriers: 'low',
      potentialROI: 220,
      timeToMarket: 8,
      dataSource: '世界银行 + 政策分析',
      confidence: 91,
      description: '随着环保意识提升和政策法规推动，绿色环保产品市场迎来爆发式增长',
      trends: ['碳中和产品', '循环经济', '绿色包装', '清洁能源'],
      risks: ['成本控制', '供应链稳定性', '标准不统一']
    },
    {
      id: '4',
      title: '远程教育和培训',
      category: '在线教育',
      marketSize: 950,
      growthRate: 31.2,
      competitionLevel: 'high',
      entryBarriers: 'medium',
      potentialROI: 160,
      timeToMarket: 6,
      dataSource: '国家统计局 + 行业报告',
      confidence: 88,
      description: '疫情加速了在线教育普及，职业技能培训和个性化学习需求持续增长',
      trends: ['VR/AR教学', 'AI个性化学习', '微证书体系', '企业培训'],
      risks: ['竞争激烈', '用户粘性', '内容质量']
    },
    {
      id: '5',
      title: '智能农业解决方案',
      category: '农业科技',
      marketSize: 450,
      growthRate: 38.7,
      competitionLevel: 'low',
      entryBarriers: 'medium',
      potentialROI: 190,
      timeToMarket: 15,
      dataSource: '世界银行 + 农业数据',
      confidence: 85,
      description: '精准农业和智慧农业技术发展，物联网、大数据和AI在农业领域应用前景广阔',
      trends: ['精准灌溉', '病虫害AI识别', '无人机植保', '区块链溯源'],
      risks: ['技术推广难度', '农民接受度', '基础设施限制']
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesCategory = selectedCategory === 'all' || opp.category === selectedCategory;
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...Array.from(new Set(opportunities.map(opp => opp.category)))];

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBarriersColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBubbleChartConfig = () => {
    const data = filteredOpportunities.map(opp => ({
      name: opp.title,
      value: [opp.marketSize, opp.growthRate, opp.potentialROI],
      itemStyle: {
        color: opp.competitionLevel === 'low' ? '#10B981' : 
               opp.competitionLevel === 'medium' ? '#F59E0B' : '#EF4444'
      },
      symbolSize: opp.potentialROI / 5
    }));

    return {
      title: {
        text: '市场机会矩阵',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        formatter: (params: any) => {
          const opp = opportunities.find(o => o.title === params.name);
          return `
            <div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; font-weight: bold;">${params.name}</h4>
              <p><strong>市场规模:</strong> ¥${opp?.marketSize}亿</p>
              <p><strong>增长率:</strong> ${opp?.growthRate}%</p>
              <p><strong>潜在ROI:</strong> ${opp?.potentialROI}%</p>
              <p><strong>竞争强度:</strong> ${opp?.competitionLevel === 'low' ? '低' : opp?.competitionLevel === 'medium' ? '中' : '高'}</p>
              <p><strong>置信度:</strong> ${opp?.confidence}%</p>
            </div>
          `;
        }
      },
      xAxis: {
        name: '市场规模 (亿元)',
        type: 'value',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      yAxis: {
        name: '增长率 (%)',
        type: 'value',
        nameLocation: 'middle',
        nameGap: 50,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          type: 'scatter',
          data: data,
          symbolSize: (data: number[]) => {
            return Math.sqrt(data[2]) * 2;
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{a}',
            fontSize: 10
          },
          emphasis: {
            focus: 'series',
            scale: 1.2
          }
        }
      ]
    };
  };

  const getMarketOverview = () => {
    const totalMarketSize = opportunities.reduce((sum, opp) => sum + opp.marketSize, 0);
    const avgGrowthRate = opportunities.reduce((sum, opp) => sum + opp.growthRate, 0) / opportunities.length;
    const avgROI = opportunities.reduce((sum, opp) => sum + opp.potentialROI, 0) / opportunities.length;
    const highOpportunities = opportunities.filter(opp => opp.potentialROI > 150).length;

    return {
      totalMarketSize,
      avgGrowthRate: avgGrowthRate.toFixed(1),
      avgROI: avgROI.toFixed(0),
      highOpportunities
    };
  };

  const overview = getMarketOverview();

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">市场机会分析</h1>
          <p className="text-gray-600 mt-1">基于多维度数据的市场机会识别和评估</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>导出分析</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Filter className="w-4 h-4" />
            <span>高级筛选</span>
          </button>
        </div>
      </div>

      {/* 市场概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">总市场规模</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">¥{overview.totalMarketSize}</p>
          <p className="text-sm text-gray-500 mt-1">亿元</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">平均增长率</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{overview.avgGrowthRate}%</p>
          <p className="text-sm text-gray-500 mt-1">年复合增长率</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">平均ROI</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{overview.avgROI}%</p>
          <p className="text-sm text-gray-500 mt-1">投资回报率</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">高价值机会</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{overview.highOpportunities}</p>
          <p className="text-sm text-gray-500 mt-1">个机会 (ROI&gt;150%)</p>
        </motion.div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索市场机会..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? '全部分类' : category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>显示 {filteredOpportunities.length} 个机会</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 市场机会矩阵 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">机会分布矩阵</h2>
          </div>
          <div className="h-96">
            <ReactECharts
              option={getBubbleChartConfig()}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>低竞争</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>中等竞争</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>高竞争</span>
            </div>
          </div>
        </div>

        {/* 快速洞察 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">最佳机会TOP3</h3>
            <div className="space-y-3">
              {filteredOpportunities
                .sort((a, b) => b.potentialROI - a.potentialROI)
                .slice(0, 3)
                .map((opp, index) => (
                  <div key={opp.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{opp.title}</h4>
                      <p className="text-xs text-gray-600">ROI: {opp.potentialROI}%</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">市场趋势</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">AI技术快速普及</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">健康意识提升</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">可持续发展需求</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">数字化转型加速</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">风险提醒</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-700">技术更新速度快</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-700">监管政策变化</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-700">市场竞争加剧</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-700">用户需求变化</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 机会详情列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">机会详情</h2>
        <div className="space-y-6">
          {filteredOpportunities.map((opp, index) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{opp.title}</h3>
                  <p className="text-gray-600 mt-1">{opp.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">{opp.confidence}% 置信度</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">市场规模</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">¥{opp.marketSize}亿</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">增长率</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">{opp.growthRate}%</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">潜在ROI</span>
                  </div>
                  <p className="text-lg font-bold text-purple-900">{opp.potentialROI}%</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">上市时间</span>
                  </div>
                  <p className="text-lg font-bold text-yellow-900">{opp.timeToMarket}个月</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">市场趋势</h4>
                  <div className="space-y-1">
                    {opp.trends.map((trend, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-sm text-gray-700">{trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">主要风险</h4>
                  <div className="space-y-1">
                    {opp.risks.map((risk, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-sm text-gray-700">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">数据源:</span>
                  <span className="text-sm font-medium text-gray-900">{opp.dataSource}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">竞争强度:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCompetitionColor(opp.competitionLevel)}`}>
                      {opp.competitionLevel === 'low' ? '低' : opp.competitionLevel === 'medium' ? '中' : '高'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">进入壁垒:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBarriersColor(opp.entryBarriers)}`}>
                      {opp.entryBarriers === 'low' ? '低' : opp.entryBarriers === 'medium' ? '中' : '高'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;