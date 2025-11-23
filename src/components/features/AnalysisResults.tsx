import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Thermometer, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  Shield, 
  Users, 
  Zap,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { SmartAnalysisResult } from '@/utils/smartAnalyzer';
import { 
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface AnalysisResultsProps {
  result: SmartAnalysisResult;
  onReset: () => void;
  onExport?: () => void;
}

export function AnalysisResults({ result, onReset, onExport }: AnalysisResultsProps) {
  // 雷达图数据
  const radarData = {
    labels: ['理解需求', '尊重需求', '安全需求', '自由需求', '连接需求'],
    datasets: [
      {
        label: '核心需求满足度',
        data: [
          result.analysis.coreNeeds.understanding,
          result.analysis.coreNeeds.respect,
          result.analysis.coreNeeds.security,
          result.analysis.coreNeeds.freedom,
          result.analysis.coreNeeds.connection,
        ],
        backgroundColor: 'rgba(255, 154, 139, 0.2)',
        borderColor: 'rgba(255, 154, 139, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 154, 139, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 154, 139, 1)',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // 情感图标组件
  const EmotionIcon = ({ emotion, isActive }: { emotion: string; isActive: boolean }) => {
    const iconMap: Record<string, string> = {
      anger: '😠',
      sadness: '😢',
      fear: '😰',
      disappointment: '😞',
      loneliness: '😔',
      guilt: '😣',
      joy: '😊',
      love: '🥰',
    };

    return (
      <motion.div
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.5 }}
        className={`text-2xl ${isActive ? 'opacity-100' : 'opacity-50'}`}
      >
        {iconMap[emotion] || '😐'}
      </motion.div>
    );
  };

  // 温度计组件
  const EmotionalThermometer = ({ 
    temperature1, 
    temperature2, 
    label1 = '第一方', 
    label2 = '第二方' 
  }: { 
    temperature1: number; 
    temperature2: number; 
    label1?: string; 
    label2?: string; 
  }) => {
    const getTemperatureColor = (temp: number) => {
      if (temp >= 80) return 'from-red-500 to-red-600';
      if (temp >= 60) return 'from-orange-500 to-orange-600';
      if (temp >= 40) return 'from-yellow-500 to-yellow-600';
      return 'from-blue-500 to-blue-600';
    };

    const getTemperatureLabel = (temp: number) => {
      if (temp >= 80) return '高度激动';
      if (temp >= 60) return '情绪较强';
      if (temp >= 40) return '轻度情绪';
      return '平静状态';
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">{label1}</span>
              <Badge variant="outline" className="text-xs">
                {temperature1}°
              </Badge>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${temperature1}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className={`h-full bg-gradient-to-r ${getTemperatureColor(temperature1)}`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{getTemperatureLabel(temperature1)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">{label2}</span>
              <Badge variant="outline" className="text-xs">
                {temperature2}°
              </Badge>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${temperature2}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full bg-gradient-to-r ${getTemperatureColor(temperature2)}`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{getTemperatureLabel(temperature2)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 标题和操作 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
          智能分析结果
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-1" />
            重新分析
          </Button>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-1" />
              导出报告
            </Button>
          )}
        </div>
      </div>

      {/* 主题识别 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="font-semibold text-blue-900">争议主题</h3>
                <p className="text-blue-700">{result.topic.description}</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  识别置信度: {result.topic.confidence}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 情感温度计 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Thermometer className="w-5 h-5" />
                情感温度
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmotionalThermometer
                temperature1={result.analysis.emotionalTemperature.party1}
                temperature2={result.analysis.emotionalTemperature.party2}
                label1="观点一"
                label2="观点二"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* 共情指数 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Users className="w-5 h-5" />
                共情指数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="relative"
                >
                  <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br ${
                    result.analysis.empathyLevel >= 80 ? 'from-green-500 to-green-600' :
                    result.analysis.empathyLevel >= 60 ? 'from-yellow-500 to-yellow-600' :
                    'from-red-500 to-red-600'
                  }`}>
                    {result.analysis.empathyLevel}
                  </div>
                </motion.div>
                <div>
                  <p className="text-sm text-gray-600">
                    {result.analysis.empathyLevel >= 80 ? '双方表现出很好的相互理解' :
                     result.analysis.empathyLevel >= 60 ? '存在一定程度的相互理解' :
                     '需要增强相互理解和同理心'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 需求雷达图 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Zap className="w-5 h-5" />
              核心需求分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Radar data={radarData} options={radarOptions} />
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium">理解</div>
                <div className={`${result.analysis.coreNeeds.understanding >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.analysis.coreNeeds.understanding}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">尊重</div>
                <div className={`${result.analysis.coreNeeds.respect >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.analysis.coreNeeds.respect}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">安全</div>
                <div className={`${result.analysis.coreNeeds.security >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.analysis.coreNeeds.security}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">自由</div>
                <div className={`${result.analysis.coreNeeds.freedom >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.analysis.coreNeeds.freedom}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">连接</div>
                <div className={`${result.analysis.coreNeeds.connection >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.analysis.coreNeeds.connection}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 情感洞察 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 观点一情感 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-700">观点一 - 情感分析</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.parties.viewpoint1.emotions.length > 0 ? (
                <div className="space-y-3">
                  {result.parties.viewpoint1.emotions.slice(0, 3).map((emotion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <EmotionIcon emotion={emotion.type} isActive={emotion.intensity > 50} />
                        <div>
                          <div className="text-sm font-medium capitalize">{emotion.expression}</div>
                          <div className="text-xs text-gray-600">{emotion.underlying}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{emotion.intensity}%</div>
                        <Progress value={emotion.intensity} className="w-16 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">未检测到明显情感表达</p>
              )}
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2">沟通风格</h4>
                <Badge variant="outline" className="capitalize">
                  {result.parties.viewpoint1.communicationStyle === 'aggressive' ? '攻击性' :
                   result.parties.viewpoint1.communicationStyle === 'defensive' ? '防御性' :
                   result.parties.viewpoint1.communicationStyle === 'passive' ? '被动性' :
                   result.parties.viewpoint1.communicationStyle === 'assertive' ? '建设性' : '中性'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 观点二情感 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700">观点二 - 情感分析</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.parties.viewpoint2.emotions.length > 0 ? (
                <div className="space-y-3">
                  {result.parties.viewpoint2.emotions.slice(0, 3).map((emotion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <EmotionIcon emotion={emotion.type} isActive={emotion.intensity > 50} />
                        <div>
                          <div className="text-sm font-medium capitalize">{emotion.expression}</div>
                          <div className="text-xs text-gray-600">{emotion.underlying}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{emotion.intensity}%</div>
                        <Progress value={emotion.intensity} className="w-16 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">未检测到明显情感表达</p>
              )}
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2">沟通风格</h4>
                <Badge variant="outline" className="capitalize">
                  {result.parties.viewpoint2.communicationStyle === 'aggressive' ? '攻击性' :
                   result.parties.viewpoint2.communicationStyle === 'defensive' ? '防御性' :
                   result.parties.viewpoint2.communicationStyle === 'passive' ? '被动性' :
                   result.parties.viewpoint2.communicationStyle === 'assertive' ? '建设性' : '中性'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 修复路径和建议 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 修复路径 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-5 h-5" />
                修复路径
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.analysis.repairPath.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-white/50 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm">{step}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 改善建议 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Lightbulb className="w-5 h-5" />
                改善建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.analysis.suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-start gap-2 p-2 bg-white/50 rounded-lg"
                  >
                    <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{suggestion}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 综合洞察 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Shield className="w-5 h-5" />
              综合洞察
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white/50 rounded-lg">
              <h4 className="font-medium text-indigo-800 mb-2">总结</h4>
              <p className="text-sm text-gray-700">{result.insights.summary}</p>
            </div>

            {result.insights.strengths.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    关系优势
                  </h4>
                  <div className="space-y-1">
                    {result.insights.strengths.map((strength, index) => (
                      <div key={index} className="text-xs bg-green-100 text-green-800 p-2 rounded">
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    改进方向
                  </h4>
                  <div className="space-y-1">
                    {result.insights.improvements.map((improvement, index) => (
                      <div key={index} className="text-xs bg-orange-100 text-orange-800 p-2 rounded">
                        {improvement}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
