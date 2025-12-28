import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Globe,
  TrendingUp,
  BarChart3,
  Users,
  Download
} from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  type: 'trend' | 'market' | 'economic' | 'social';
  provider: string;
  status: 'active' | 'inactive' | 'updating';
  description: string;
  coverage: string;
  lastUpdate: string;
  apiAvailable: boolean;
  freeTier: boolean;
  url: string;
  icon: React.ComponentType<any>;
}

const DataSourceConfig: React.FC = () => {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const dataSources: DataSource[] = [
    {
      id: 'google-trends',
      name: 'Google Trends',
      type: 'trend',
      provider: 'Google',
      status: 'active',
      description: '全球搜索趋势数据，覆盖180多个国家和地区，提供5年历史数据',
      coverage: '全球搜索行为数据',
      lastUpdate: '2025-12-24 23:30',
      apiAvailable: true,
      freeTier: true,
      url: 'https://trends.google.com/',
      icon: TrendingUp
    },
    {
      id: 'baidu-index',
      name: '百度指数',
      type: 'trend',
      provider: '百度',
      status: 'active',
      description: '中国最大的中文搜索指数平台，提供实时和历史搜索热度数据',
      coverage: '中文搜索行为数据',
      lastUpdate: '2025-12-24 23:25',
      apiAvailable: true,
      freeTier: true,
      url: 'https://index.baidu.com/',
      icon: TrendingUp
    },
    {
      id: 'worldbank-data',
      name: '世界银行开放数据',
      type: 'economic',
      provider: '世界银行',
      status: 'active',
      description: '全球经济发展指标和统计数据，涵盖1960年至今的完整数据',
      coverage: '全球宏观经济数据',
      lastUpdate: '2025-12-24 22:00',
      apiAvailable: true,
      freeTier: true,
      url: 'https://data.worldbank.org/',
      icon: BarChart3
    },
    {
      id: 'stats-gov-cn',
      name: '国家统计局',
      type: 'economic',
      provider: '中华人民共和国国家统计局',
      status: 'active',
      description: '中国官方统计数据，包括GDP、CPI、就业等核心经济指标',
      coverage: '中国宏观经济数据',
      lastUpdate: '2025-12-24 21:30',
      apiAvailable: true,
      freeTier: true,
      url: 'http://www.stats.gov.cn/',
      icon: BarChart3
    },
    {
      id: 'statista',
      name: 'Statista数据库',
      type: 'market',
      provider: 'Statista GmbH',
      status: 'updating',
      description: '全球最大的统计数据平台，提供22,500+来源的行业报告',
      coverage: '全球行业市场数据',
      lastUpdate: '2025-12-24 20:15',
      apiAvailable: true,
      freeTier: false,
      url: 'https://www.statista.com/',
      icon: Database
    },
    {
      id: 'social-mention',
      name: '社交媒体监测',
      type: 'social',
      provider: '综合平台',
      status: 'active',
      description: '基于Twitter、微博、知乎等平台的社交媒体情感分析数据',
      coverage: '社交媒体情绪和话题趋势',
      lastUpdate: '2025-12-24 23:45',
      apiAvailable: true,
      freeTier: true,
      url: 'https://www.socialmention.com/',
      icon: Users
    }
  ];

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'updating':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'inactive':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trend': return 'bg-blue-100 text-blue-800';
      case 'market': return 'bg-green-100 text-green-800';
      case 'economic': return 'bg-purple-100 text-purple-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">数据源配置管理</h1>
          <p className="text-gray-600 mt-1">配置和管理权威数据源，确保数据的可靠性和时效性</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">已选择数据源</p>
          <p className="text-2xl font-bold text-blue-600">{selectedSources.length}</p>
        </div>
      </div>

      {/* 数据源统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">趋势数据</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {dataSources.filter(s => s.type === 'trend').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">市场数据</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {dataSources.filter(s => s.type === 'market').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">经济数据</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {dataSources.filter(s => s.type === 'economic').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-pink-500" />
            <span className="text-sm font-medium text-gray-700">社交数据</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {dataSources.filter(s => s.type === 'social').length}
          </p>
        </div>
      </div>

      {/* 数据源列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dataSources.map((source, index) => {
          const Icon = source.icon;
          const isSelected = selectedSources.includes(source.id);
          
          return (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl border-2 p-6 transition-all cursor-pointer ${
                isSelected 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleSource(source.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${
                    isSelected ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      isSelected ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{source.name}</h3>
                    <p className="text-sm text-gray-600">{source.provider}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(source.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(source.type)}`}>
                    {source.type === 'trend' ? '趋势' : 
                     source.type === 'market' ? '市场' :
                     source.type === 'economic' ? '经济' : '社交'}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{source.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">数据覆盖范围</span>
                  <span className="font-medium text-gray-900">{source.coverage}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">最后更新</span>
                  <span className="font-medium text-gray-900">{source.lastUpdate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">API可用性</span>
                  <span className="flex items-center space-x-1">
                    {source.apiAvailable ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">可用</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-600">不可用</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">免费额度</span>
                  <span className={`font-medium ${source.freeTier ? 'text-green-600' : 'text-gray-600'}`}>
                    {source.freeTier ? '有限免费' : '付费使用'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">访问官网</span>
                </button>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-700">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">下载样本数据</span>
                  </button>
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelected 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                    {isSelected ? '已选择' : '选择数据源'}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 配置确认 */}
      {selectedSources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">数据源配置确认</h3>
              <p className="text-blue-700 mt-1">
                已选择 {selectedSources.length} 个数据源，系统将开始同步和分析数据
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
                预览配置
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                开始同步数据
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DataSourceConfig;