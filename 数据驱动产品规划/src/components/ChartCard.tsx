import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react';

interface ChartCardProps {
  title: string;
  description: string;
  chartType: 'trend' | 'competition' | 'demand' | 'portfolio';
}

const ChartCard: React.FC<ChartCardProps> = ({ title, description, chartType }) => {
  const getChartConfig = () => {
    switch (chartType) {
      case 'trend':
        return {
          title: {
            text: '市场趋势分析',
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            data: ['搜索热度', '销量指数'],
            bottom: 0
          },
          xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
          },
          yAxis: [
            {
              type: 'value',
              name: '搜索热度',
              position: 'left'
            },
            {
              type: 'value',
              name: '销量指数',
              position: 'right'
            }
          ],
          series: [
            {
              name: '搜索热度',
              type: 'line',
              smooth: true,
              data: [120, 132, 101, 134, 90, 230, 210, 245, 289, 310, 350, 380],
              lineStyle: {
                color: '#3B82F6'
              }
            },
            {
              name: '销量指数',
              type: 'line',
              smooth: true,
              yAxisIndex: 1,
              data: [100, 115, 105, 125, 110, 180, 170, 200, 230, 250, 280, 300],
              lineStyle: {
                color: '#10B981'
              }
            }
          ]
        };
      
      case 'competition':
        return {
          title: {
            text: '竞争态势分析',
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c}% ({d}%)'
          },
          series: [
            {
              name: '市场份额',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '18',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: 35, name: '竞品A', itemStyle: { color: '#3B82F6' } },
                { value: 28, name: '竞品B', itemStyle: { color: '#10B981' } },
                { value: 20, name: '竞品C', itemStyle: { color: '#F59E0B' } },
                { value: 17, name: '其他', itemStyle: { color: '#6B7280' } }
              ]
            }
          ]
        };
      
      case 'demand':
        return {
          title: {
            text: '用户需求分析',
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          xAxis: {
            type: 'category',
            data: ['智能交互', '语音控制', '多设备联动', '安全隐私', '节能优化', '设计美学']
          },
          yAxis: {
            type: 'value',
            name: '需求指数'
          },
          series: [
            {
              name: '需求热度',
              type: 'bar',
              data: [92, 85, 78, 88, 75, 82],
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#3B82F6' },
                  { offset: 1, color: '#93C5FD' }
                ])
              }
            }
          ]
        };
      
      case 'portfolio':
        return {
          title: {
            text: '产品组合分析',
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          tooltip: {
            formatter: (params: any) => {
              return `${params.data.name}<br/>市场份额: ${params.data.value[0]}%<br/>增长指数: ${params.data.value[1]}%`;
            }
          },
          xAxis: {
            name: '市场份额 (%)',
            type: 'value',
            max: 100
          },
          yAxis: {
            name: '增长指数 (%)',
            type: 'value',
            max: 100
          },
          series: [
            {
              name: '产品组合',
              type: 'scatter',
              symbolSize: (data: number[]) => {
                return Math.sqrt(data[0] * data[1]) * 2;
              },
              data: [
                { name: '明星产品', value: [85, 90], itemStyle: { color: '#10B981' } },
                { name: '金牛产品', value: [75, 25], itemStyle: { color: '#3B82F6' } },
                { name: '问题产品', value: [35, 85], itemStyle: { color: '#F59E0B' } },
                { name: '瘦狗产品', value: [25, 15], itemStyle: { color: '#EF4444' } }
              ],
              label: {
                show: true,
                position: 'top',
                formatter: '{a}'
              }
            }
          ]
        };
      
      default:
        return {};
    }
  };

  const getIcon = () => {
    switch (chartType) {
      case 'trend': return TrendingUp;
      case 'competition': return Users;
      case 'demand': return Target;
      case 'portfolio': return BarChart3;
      default: return TrendingUp;
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      
      <div className="h-80">
        <ReactECharts
          option={getChartConfig()}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </motion.div>
  );
};

export default ChartCard;