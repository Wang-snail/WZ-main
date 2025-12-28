import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { 
  Map, 
  Calendar, 
  Target, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Download,
  TrendingUp
} from 'lucide-react';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  quarter: string;
  year: number;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  effort: number; // 人天
  impact: number; // 1-10 scale
  category: 'feature' | 'improvement' | 'bugfix' | 'research';
}

const Roadmap: React.FC = () => {
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([
    {
      id: '1',
      title: 'AI语音识别升级',
      description: '升级语音识别模型，提高准确率和响应速度',
      quarter: 'Q1',
      year: 2025,
      status: 'in-progress',
      priority: 'high',
      dependencies: ['数据集准备', '模型训练'],
      effort: 45,
      impact: 9,
      category: 'feature'
    },
    {
      id: '2',
      title: '多设备联动优化',
      description: '优化智能家居设备间的联动逻辑和响应时间',
      quarter: 'Q2',
      year: 2025,
      status: 'planned',
      priority: 'high',
      dependencies: ['设备兼容性测试'],
      effort: 30,
      impact: 8,
      category: 'feature'
    },
    {
      id: '3',
      title: '用户界面重构',
      description: '重新设计移动端和Web端用户界面',
      quarter: 'Q2',
      year: 2025,
      status: 'planned',
      priority: 'medium',
      dependencies: ['用户体验调研'],
      effort: 60,
      impact: 7,
      category: 'improvement'
    },
    {
      id: '4',
      title: '数据安全增强',
      description: '实施端到端加密和隐私保护机制',
      quarter: 'Q3',
      year: 2025,
      status: 'planned',
      priority: 'high',
      dependencies: ['安全审计', '合规检查'],
      effort: 40,
      impact: 8,
      category: 'improvement'
    },
    {
      id: '5',
      title: '性能监控系统',
      description: '建立全面的性能监控和告警系统',
      quarter: 'Q3',
      year: 2025,
      status: 'planned',
      priority: 'medium',
      dependencies: ['基础设施准备'],
      effort: 35,
      impact: 6,
      category: 'improvement'
    },
    {
      id: '6',
      title: '下一代产品预研',
      description: '研究新兴技术趋势和用户需求变化',
      quarter: 'Q4',
      year: 2025,
      status: 'planned',
      priority: 'low',
      dependencies: [],
      effort: 25,
      impact: 5,
      category: 'research'
    }
  ]);

  const [selectedQuarter, setSelectedQuarter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    quarter: 'Q1',
    year: 2025,
    priority: 'medium' as 'high' | 'medium' | 'low',
    effort: 0,
    impact: 5,
    category: 'feature' as 'feature' | 'improvement' | 'bugfix' | 'research'
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'delayed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Calendar className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'feature': return <Target className="w-4 h-4" />;
      case 'improvement': return <TrendingUp className="w-4 h-4" />;
      case 'bugfix': return <AlertCircle className="w-4 h-4" />;
      case 'research': return <Calendar className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      case 'bugfix': return 'bg-red-100 text-red-800';
      case 'research': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = selectedQuarter === 'all' 
    ? roadmapItems 
    : roadmapItems.filter(item => item.quarter === selectedQuarter);

  const getGanttChartConfig = () => {
    const quarters = ['2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4'];
    const items = filteredItems.map((item, index) => ({
      name: item.title,
      value: [
        index,
        item.year,
        item.quarter === 'Q1' ? 0 : item.quarter === 'Q2' ? 1 : item.quarter === 'Q3' ? 2 : 3,
        item.quarter === 'Q1' ? 1 : item.quarter === 'Q2' ? 1 : item.quarter === 'Q3' ? 1 : 1,
        item.effort
      ],
      itemStyle: {
        color: item.status === 'completed' ? '#10B981' : 
               item.status === 'in-progress' ? '#3B82F6' :
               item.status === 'delayed' ? '#EF4444' : '#6B7280'
      }
    }));

    return {
      title: {
        text: '产品路线图时间轴',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        formatter: (params: any) => {
          const item = filteredItems.find(i => i.title === params.name);
          return `
            <div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; font-weight: bold;">${params.name}</h4>
              <p><strong>状态:</strong> ${item?.status === 'completed' ? '已完成' : 
                                       item?.status === 'in-progress' ? '进行中' :
                                       item?.status === 'delayed' ? '延迟' : '计划中'}</p>
              <p><strong>优先级:</strong> ${item?.priority === 'high' ? '高' : 
                                          item?.priority === 'medium' ? '中' : '低'}</p>
              <p><strong>工作量:</strong> ${item?.effort}人天</p>
              <p><strong>影响力:</strong> ${item?.impact}/10</p>
            </div>
          `;
        }
      },
      grid: {
        left: '15%',
        right: '5%',
        top: '15%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: quarters,
        axisLabel: {
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          show: false
        },
        splitLine: {
          show: false
        }
      },
      series: [
        {
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const categoryIndex = api.value(0);
            const start = api.coord([api.value(2), categoryIndex]);
            const end = api.coord([api.value(2) + api.value(3), categoryIndex]);
            const height = api.size([0, 1])[1] * 0.6;

            const rectShape = {
              x: start[0],
              y: start[1] - height / 2,
              width: end[0] - start[0],
              height: height
            };

            return {
              type: 'rect',
              shape: rectShape,
              style: api.style(),
              emphasis: {
                style: {
                  opacity: 0.8
                }
              }
            };
          },
          encode: {
            x: [2, 3],
            y: 0
          },
          data: items
        }
      ]
    };
  };

  const getQuarterlyStats = () => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return quarters.map(quarter => {
      const items = roadmapItems.filter(item => item.quarter === quarter);
      const totalEffort = items.reduce((sum, item) => sum + item.effort, 0);
      const avgImpact = items.length > 0 ? items.reduce((sum, item) => sum + item.impact, 0) / items.length : 0;
      const highPriority = items.filter(item => item.priority === 'high').length;
      
      return {
        quarter,
        count: items.length,
        totalEffort,
        avgImpact: avgImpact.toFixed(1),
        highPriority
      };
    });
  };

  const handleAddItem = () => {
    if (newItem.title && newItem.description) {
      const item: RoadmapItem = {
        id: Date.now().toString(),
        ...newItem,
        status: 'planned',
        dependencies: []
      };
      setRoadmapItems([...roadmapItems, item]);
      setNewItem({
        title: '',
        description: '',
        quarter: 'Q1',
        year: 2025,
        priority: 'medium',
        effort: 0,
        impact: 5,
        category: 'feature'
      });
      setShowAddForm(false);
    }
  };

  const deleteItem = (id: string) => {
    setRoadmapItems(roadmapItems.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">产品路线图规划</h1>
          <p className="text-gray-600 mt-1">基于数据驱动的产品开发时间轴和优先级规划</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部季度</option>
            <option value="Q1">2025 Q1</option>
            <option value="Q2">2025 Q2</option>
            <option value="Q3">2025 Q3</option>
            <option value="Q4">2025 Q4</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>导出</span>
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>添加项目</span>
          </button>
        </div>
      </div>

      {/* 季度统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {getQuarterlyStats().map(stat => (
          <motion.div
            key={stat.quarter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900">{stat.quarter} 2025</h3>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">项目数量</span>
                <span className="font-medium">{stat.count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">总工作量</span>
                <span className="font-medium">{stat.totalEffort}人天</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">平均影响</span>
                <span className="font-medium">{stat.avgImpact}/10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">高优先级</span>
                <span className="font-medium text-red-600">{stat.highPriority}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 甘特图 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Map className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">项目时间轴</h2>
          </div>
          <div className="h-96">
            <ReactECharts
              option={getGanttChartConfig()}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        {/* 优先级分布 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">优先级分布</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">高优先级</span>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  {roadmapItems.filter(item => item.priority === 'high').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">中优先级</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  {roadmapItems.filter(item => item.priority === 'medium').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">低优先级</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                  {roadmapItems.filter(item => item.priority === 'low').length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">状态分布</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">已完成</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {roadmapItems.filter(item => item.status === 'completed').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">进行中</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {roadmapItems.filter(item => item.status === 'in-progress').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">计划中</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                  {roadmapItems.filter(item => item.status === 'planned').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">延迟</span>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  {roadmapItems.filter(item => item.status === 'delayed').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">项目详情</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(item.category)}
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                </div>
                <div className="flex space-x-1">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">状态</span>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(item.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status === 'completed' ? '已完成' : 
                       item.status === 'in-progress' ? '进行中' :
                       item.status === 'delayed' ? '延迟' : '计划中'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">优先级</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                    {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">工作量</span>
                  <span className="text-xs font-medium">{item.effort}人天</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">影响力</span>
                  <span className="text-xs font-medium">{item.impact}/10</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">类别</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category === 'feature' ? '功能' : 
                     item.category === 'improvement' ? '改进' :
                     item.category === 'bugfix' ? '修复' : '研究'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 添加项目模态框 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">添加新项目</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入项目名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="输入项目描述"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">季度</label>
                  <select
                    value={newItem.quarter}
                    onChange={(e) => setNewItem({...newItem, quarter: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
                  <input
                    type="number"
                    value={newItem.year}
                    onChange={(e) => setNewItem({...newItem, year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="2024"
                    max="2030"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                  <select
                    value={newItem.priority}
                    onChange={(e) => setNewItem({...newItem, priority: e.target.value as 'high' | 'medium' | 'low'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类别</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value as 'feature' | 'improvement' | 'bugfix' | 'research'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="feature">功能</option>
                    <option value="improvement">改进</option>
                    <option value="bugfix">修复</option>
                    <option value="research">研究</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">工作量(人天)</label>
                  <input
                    type="number"
                    value={newItem.effort}
                    onChange={(e) => setNewItem({...newItem, effort: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">影响力(1-10)</label>
                  <input
                    type="number"
                    value={newItem.impact}
                    onChange={(e) => setNewItem({...newItem, impact: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                添加
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;