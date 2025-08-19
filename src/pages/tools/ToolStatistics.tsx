import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SEOHead from '../../components/SEOHead';
import { ToolCrawler, ToolCategory } from '../../utils/toolCrawler';

export default function ToolStatistics() {
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // 获取工具数据
  const fetchToolData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 安全检查，确保在浏览器环境中不执行爬虫
      if (typeof window !== 'undefined') {
        // 在浏览器环境中，我们不执行实际的爬虫，而是显示提示信息
        setError('此功能仅在服务器环境中可用');
        setLoading(false);
        return;
      }
      
      const crawler = new ToolCrawler();
      const data = await crawler.getAllTools();
      setCategories(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching tool data:', err);
      setError('获取工具数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 组件挂载时获取数据
  useEffect(() => {
    // 在浏览器环境中不自动执行爬虫
    if (typeof window === 'undefined') {
      fetchToolData();
    } else {
      // 在浏览器环境中，设置一个友好的提示
      setLoading(false);
      setError('此功能需要在服务器环境中运行');
    }
  }, []);
  
  // 计算统计数据
  const totalCategories = categories.length;
  const totalTools = categories.reduce((sum, category) => sum + category.count, 0);
  
  // 按工具数量排序的分类
  const sortedCategories = [...categories].sort((a, b) => b.count - a.count);
  
  // 热门分类（前5个）
  const popularCategories = sortedCategories.slice(0, 5);
  
  // 工具数量分布
  const toolDistribution = categories.map(category => ({
    name: category.name,
    count: category.count,
    percentage: totalTools > 0 ? Math.round((category.count / totalTools) * 100) : 0
  }));
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载工具数据...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                功能提示
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">{error}</p>
              <p className="text-gray-500 text-sm mb-4">
                此功能用于统计和分析工具猫网站的工具分类数据，需要在服务器环境中运行。
              </p>
              {typeof window === 'undefined' && (
                <Button onClick={fetchToolData} className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新加载
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <SEOHead 
        title="工具猫数据统计 - 工具分类与数量分析 | WSNAIL.COM"
        description="工具猫网站工具数据统计，包含各类工具的数量分布、热门分类排行等详细分析。了解最新最全的工具分类信息。"
        keywords="工具猫,工具统计,数据分析,分类统计,热门工具,WSNAIL"
        url="https://wsnail.com/tools/statistics"
        canonical="https://wsnail.com/tools/statistics"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 标题区域 */}
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              工具猫数据统计
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              实时分析工具猫网站的工具分类与数量分布
            </motion.p>
          </div>
          
          {/* 统计概览 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">工具分类总数</p>
                      <p className="text-3xl font-bold">{totalCategories}</p>
                    </div>
                    <BarChart3 className="w-12 h-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">工具总数</p>
                      <p className="text-3xl font-bold">{totalTools}</p>
                    </div>
                    <PieChart className="w-12 h-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">最后更新</p>
                      <p className="text-xl font-bold">
                        {lastUpdated.toLocaleTimeString()}
                      </p>
                      <p className="text-green-100 text-xs">
                        {lastUpdated.toLocaleDateString()}
                      </p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* 操作栏 */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">数据概览</h2>
            {typeof window === 'undefined' && (
              <Button onClick={fetchToolData} variant="outline" className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新数据
              </Button>
            )}
          </div>
          
          {/* 热门分类排行 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  热门分类排行
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-500">{category.count} 个工具</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {Math.round((category.count / totalTools) * 100)}%
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* 分类统计图表 */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  分类数量分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {toolDistribution.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-900">{category.name}</span>
                        <span className="text-gray-500">{category.count} ({category.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${category.percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 详细分类列表 */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-12">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                <Info className="w-5 h-5 mr-2 text-green-600" />
                详细分类列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {category.count}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      工具数量占比: {Math.round((category.count / totalTools) * 100)}%
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* 数据说明 */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">数据说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">实时数据</h3>
                    <p className="text-gray-600 text-sm">
                      所有数据均从工具猫网站实时抓取，确保准确性。
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">分类统计</h3>
                    <p className="text-gray-600 text-sm">
                      按照网站原生分类进行统计，展示各分类工具数量分布。
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <RefreshCw className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">定期更新</h3>
                    <p className="text-gray-600 text-sm">
                      数据会定期刷新，确保您获取最新的工具分类信息。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}