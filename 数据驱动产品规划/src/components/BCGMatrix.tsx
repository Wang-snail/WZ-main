import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Download,
  BarChart3
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  marketShare: number;
  growthRate: number;
  category: '明星产品' | '金牛产品' | '问题产品' | '瘦狗产品';
  investment: number;
  revenue: number;
  priority: '高' | '中' | '低';
}

const BCGMatrix: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: '智能音箱Pro',
      marketShare: 85,
      growthRate: 90,
      category: '明星产品',
      investment: 500,
      revenue: 1200,
      priority: '高'
    },
    {
      id: '2',
      name: '智能灯泡',
      marketShare: 75,
      growthRate: 25,
      category: '金牛产品',
      investment: 200,
      revenue: 800,
      priority: '中'
    },
    {
      id: '3',
      name: '智能门锁',
      marketShare: 35,
      growthRate: 85,
      category: '问题产品',
      investment: 300,
      revenue: 150,
      priority: '高'
    },
    {
      id: '4',
      name: '传统开关',
      marketShare: 25,
      growthRate: 15,
      category: '瘦狗产品',
      investment: 100,
      revenue: 50,
      priority: '低'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    marketShare: 0,
    growthRate: 0,
    investment: 0,
    revenue: 0
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '明星产品': return '#10B981';
      case '金牛产品': return '#3B82F6';
      case '问题产品': return '#F59E0B';
      case '瘦狗产品': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case '明星产品': 
        return '高市场份额、高增长率 - 投资维持地位重点';
      case '金牛产品':
        return '高市场份额、低增长率 - 稳定现金流来源';
      case '问题产品':
        return '低市场份额、高增长率 - 需要决策投资或退出';
      case '瘦狗产品':
        return '低市场份额、低增长率 - 考虑收缩或退出';
      default:
        return '';
    }
  };

  const calculateCategory = (marketShare: number, growthRate: number): string => {
    if (marketShare >= 70 && growthRate >= 50) return '明星产品';
    if (marketShare >= 70 && growthRate < 50) return '金牛产品';
    if (marketShare < 70 && growthRate >= 50) return '问题产品';
    return '瘦狗产品';
  };

  const getBCGChartConfig = () => {
    const scatterData = products.map(product => ({
      name: product.name,
      value: [product.marketShare, product.growthRate],
      itemStyle: { color: getCategoryColor(product.category) },
      symbolSize: Math.sqrt(product.revenue) * 2
    }));

    return {
      title: {
        text: 'BCG产品组合矩阵',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        formatter: (params: any) => {
          const product = products.find(p => p.name === params.data.name);
          return `
            <div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; font-weight: bold;">${params.data.name}</h4>
              <p><strong>市场份额:</strong> ${params.data.value[0]}%</p>
              <p><strong>增长率:</strong> ${params.data.value[1]}%</p>
              <p><strong>收入:</strong> ¥${params.data.value[0] * 10}万</p>
              <p><strong>类别:</strong> ${product?.category}</p>
            </div>
          `;
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '15%'
      },
      xAxis: {
        name: '市场份额 (%)',
        type: 'value',
        min: 0,
        max: 100,
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e5e7eb'
          }
        }
      },
      yAxis: {
        name: '增长率 (%)',
        type: 'value',
        min: 0,
        max: 100,
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e5e7eb'
          }
        }
      },
      series: [
        {
          name: '产品组合',
          type: 'scatter',
          data: scatterData,
          label: {
            show: true,
            position: 'top',
            formatter: '{a}',
            fontSize: 12
          },
          emphasis: {
            scale: 1.2
          }
        }
      ],
      graphic: [
        // 添加象限标签
        {
          type: 'text',
          left: '15%',
          top: '20%',
          style: {
            text: '问题产品',
            fontSize: 14,
            fontWeight: 'bold',
            fill: '#F59E0B'
          }
        },
        {
          type: 'text',
          left: '75%',
          top: '20%',
          style: {
            text: '明星产品',
            fontSize: 14,
            fontWeight: 'bold',
            fill: '#10B981'
          }
        },
        {
          type: 'text',
          left: '15%',
          bottom: '20%',
          style: {
            text: '瘦狗产品',
            fontSize: 14,
            fontWeight: 'bold',
            fill: '#EF4444'
          }
        },
        {
          type: 'text',
          left: '75%',
          bottom: '20%',
          style: {
            text: '金牛产品',
            fontSize: 14,
            fontWeight: 'bold',
            fill: '#3B82F6'
          }
        }
      ]
    };
  };

  const getCategorySummary = (category: string) => {
    const categoryProducts = products.filter(p => p.category === category);
    const totalInvestment = categoryProducts.reduce((sum, p) => sum + p.investment, 0);
    const totalRevenue = categoryProducts.reduce((sum, p) => sum + p.revenue, 0);
    
    return {
      count: categoryProducts.length,
      investment: totalInvestment,
      revenue: totalRevenue,
      roi: totalInvestment > 0 ? ((totalRevenue - totalInvestment) / totalInvestment * 100).toFixed(1) : '0'
    };
  };

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.marketShare > 0) {
      const category = calculateCategory(newProduct.marketShare, newProduct.growthRate);
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        marketShare: newProduct.marketShare,
        growthRate: newProduct.growthRate,
        category: category as any,
        investment: newProduct.investment,
        revenue: newProduct.revenue,
        priority: newProduct.marketShare > 50 ? '高' : newProduct.growthRate > 50 ? '中' : '低'
      };
      setProducts([...products, product]);
      setNewProduct({ name: '', marketShare: 0, growthRate: 0, investment: 0, revenue: 0 });
      setShowAddForm(false);
    }
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BCG产品组合矩阵分析</h1>
          <p className="text-gray-600 mt-1">基于市场份额和增长率的产品战略分析工具</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>导出报告</span>
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>添加产品</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BCG矩阵图表 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">产品组合矩阵</h2>
          </div>
          <div className="h-96">
            <ReactECharts
              option={getBCGChartConfig()}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        {/* 类别汇总 */}
        <div className="space-y-4">
          {['明星产品', '金牛产品', '问题产品', '瘦狗产品'].map(category => {
            const summary = getCategorySummary(category);
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-4"
                style={{ borderLeftColor: getCategoryColor(category), borderLeftWidth: '4px' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{category}</h3>
                  <span className="text-sm text-gray-500">{summary.count}个产品</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">投资总额</span>
                    <span className="font-medium">¥{summary.investment}万</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">收入总额</span>
                    <span className="font-medium">¥{summary.revenue}万</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">投资回报率</span>
                    <span className={`font-medium ${parseFloat(summary.roi) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.roi}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {getCategoryDescription(category)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 产品列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">产品详情列表</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">产品名称</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">类别</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">市场份额</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">增长率</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">投资</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">收入</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">优先级</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: getCategoryColor(product.category) + '20',
                        color: getCategoryColor(product.category)
                      }}
                    >
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{product.marketShare}%</td>
                  <td className="py-3 px-4 text-gray-900">{product.growthRate}%</td>
                  <td className="py-3 px-4 text-gray-900">¥{product.investment}万</td>
                  <td className="py-3 px-4 text-gray-900">¥{product.revenue}万</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.priority === '高' ? 'bg-red-100 text-red-700' :
                      product.priority === '中' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {product.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 添加产品模态框 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">添加新产品</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">产品名称</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入产品名称"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">市场份额 (%)</label>
                  <input
                    type="number"
                    value={newProduct.marketShare}
                    onChange={(e) => setNewProduct({...newProduct, marketShare: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">增长率 (%)</label>
                  <input
                    type="number"
                    value={newProduct.growthRate}
                    onChange={(e) => setNewProduct({...newProduct, growthRate: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">投资 (万元)</label>
                  <input
                    type="number"
                    value={newProduct.investment}
                    onChange={(e) => setNewProduct({...newProduct, investment: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">收入 (万元)</label>
                  <input
                    type="number"
                    value={newProduct.revenue}
                    onChange={(e) => setNewProduct({...newProduct, revenue: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
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
                onClick={handleAddProduct}
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

export default BCGMatrix;