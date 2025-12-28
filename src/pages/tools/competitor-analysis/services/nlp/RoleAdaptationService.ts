/**
 * 角色适配服务
 * 为不同角色提供特定的视图配置和内容适配
 */

import type { RadarScores, RoleViewType } from '../types';

/**
 * 雷达图维度权重配置
 */
export interface DimensionWeight {
  /** 维度名称 */
  dimension: string;
  /** 权重 (0-1) */
  weight: number;
  /** 是否突出显示 */
  emphasized: boolean;
  /** 角色特定描述 */
  roleDescription: string;
}

/**
 * 角色特定配置
 */
export interface RoleConfig {
  /** 角色ID */
  roleId: RoleViewType;
  /** 角色名称 */
  roleName: string;
  /** 角色描述 */
  description: string;
  /** 关注重点 */
  focusAreas: string[];
  /** 维度权重配置 */
  dimensionWeights: DimensionWeight[];
  /** 主题色彩 */
  themeColor: string;
  /** 强调色彩 */
  emphasisColor: string;
}

/**
 * 角色适配服务
 */
export class RoleAdaptationService {
  /**
   * 获取角色配置
   */
  static getRoleConfig(role: RoleViewType): RoleConfig {
    const configs: Record<RoleViewType, RoleConfig> = {
      retail: {
        roleId: 'retail',
        roleName: '线上零售PM',
        description: '专注于市场定价和利润优化',
        focusAreas: ['利润空间', 'ROI速度', '价格竞争力', '市场定位'],
        themeColor: '#3B82F6', // blue-500
        emphasisColor: '#1D4ED8', // blue-700
        dimensionWeights: [
          {
            dimension: 'profitability',
            weight: 1.0,
            emphasized: true,
            roleDescription: '毛利率直接影响零售盈利能力'
          },
          {
            dimension: 'roiSpeed',
            weight: 1.0,
            emphasized: true,
            roleDescription: '快速回本降低市场风险'
          },
          {
            dimension: 'priceAdvantage',
            weight: 0.9,
            emphasized: true,
            roleDescription: '价格竞争力决定市场份额'
          },
          {
            dimension: 'features',
            weight: 0.7,
            emphasized: false,
            roleDescription: '功能特性影响用户选择'
          },
          {
            dimension: 'portability',
            weight: 0.6,
            emphasized: false,
            roleDescription: '便携性影响用户体验'
          }
        ]
      },
      manufacturing: {
        roleId: 'manufacturing',
        roleName: '生产工厂PM',
        description: '专注于成本控制和工艺对比',
        focusAreas: ['便携指数', '成本控制', '功能丰富度', '工艺对比'],
        themeColor: '#10B981', // green-500
        emphasisColor: '#047857', // green-700
        dimensionWeights: [
          {
            dimension: 'portability',
            weight: 1.0,
            emphasized: true,
            roleDescription: '轻量化设计体现工艺水平'
          },
          {
            dimension: 'profitability',
            weight: 1.0,
            emphasized: true,
            roleDescription: '成本控制直接影响利润'
          },
          {
            dimension: 'features',
            weight: 0.9,
            emphasized: true,
            roleDescription: '功能实现体现技术能力'
          },
          {
            dimension: 'roiSpeed',
            weight: 0.7,
            emphasized: false,
            roleDescription: 'ROI影响投资决策'
          },
          {
            dimension: 'priceAdvantage',
            weight: 0.6,
            emphasized: false,
            roleDescription: '价格反映成本控制能力'
          }
        ]
      }
    };

    return configs[role];
  }

  /**
   * 获取角色特定的雷达图配置
   */
  static getRadarChartConfig(role: RoleViewType, scores: RadarScores) {
    const roleConfig = this.getRoleConfig(role);
    
    // 基础雷达图维度定义
    const baseDimensions = [
      { key: 'profitability', name: '利润空间', description: '毛利率越高得分越高' },
      { key: 'roiSpeed', name: 'ROI速度', description: '回本周期越短得分越高' },
      { key: 'portability', name: '便携指数', description: '重量和体积优势' },
      { key: 'features', name: '功能丰富度', description: '功能特性对比' },
      { key: 'priceAdvantage', name: '价格竞争力', description: '价格优势和溢价能力' }
    ];

    // 根据角色配置调整维度显示
    const indicators = baseDimensions.map(dim => {
      const weightConfig = roleConfig.dimensionWeights.find(w => w.dimension === dim.key);
      const isEmphasized = weightConfig?.emphasized || false;
      
      return {
        name: dim.name,
        max: 10,
        nameTextStyle: isEmphasized ? {
          color: roleConfig.emphasisColor,
          fontWeight: 'bold',
          fontSize: 14
        } : {
          color: '#6B7280',
          fontSize: 12
        }
      };
    });

    // 数据值数组
    const dataValues = [
      scores.profitability,
      scores.roiSpeed,
      scores.portability,
      scores.features,
      scores.priceAdvantage
    ];

    return {
      title: {
        text: `产品竞争力分析 - ${roleConfig.roleName}视角`,
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1F2937'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const dimension = baseDimensions[params.dataIndex];
          const weightConfig = roleConfig.dimensionWeights.find(w => w.dimension === dimension.key);
          const value = params.value;
          
          return `
            <div style="padding: 12px; max-width: 300px;">
              <div style="font-weight: bold; margin-bottom: 8px; color: ${roleConfig.themeColor};">
                ${dimension.name}
              </div>
              <div style="margin-bottom: 4px;">
                得分: <span style="color: ${roleConfig.themeColor}; font-weight: bold;">${value.toFixed(1)}/10</span>
              </div>
              <div style="font-size: 12px; color: #6B7280; margin-bottom: 6px;">
                ${dimension.description}
              </div>
              ${weightConfig ? `
                <div style="font-size: 11px; color: ${roleConfig.emphasisColor}; border-top: 1px solid #E5E7EB; padding-top: 6px;">
                  <strong>${roleConfig.roleName}视角:</strong><br/>
                  ${weightConfig.roleDescription}
                </div>
              ` : ''}
            </div>
          `;
        }
      },
      radar: {
        indicator: indicators,
        center: ['50%', '55%'],
        radius: '65%',
        startAngle: 90,
        splitNumber: 5,
        shape: 'polygon',
        axisName: {
          color: '#374151',
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: '#E5E7EB',
            width: 1
          }
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: [
              `rgba(${this.hexToRgb(roleConfig.themeColor)}, 0.05)`,
              `rgba(${this.hexToRgb(roleConfig.themeColor)}, 0.02)`
            ]
          }
        },
        axisLine: {
          lineStyle: {
            color: '#D1D5DB'
          }
        }
      },
      series: [
        {
          name: '竞争力评分',
          type: 'radar',
          data: [
            {
              value: dataValues,
              name: '我方产品',
              areaStyle: {
                color: `rgba(${this.hexToRgb(roleConfig.themeColor)}, 0.2)`
              },
              lineStyle: {
                color: roleConfig.themeColor,
                width: 3
              },
              itemStyle: {
                color: roleConfig.themeColor,
                borderColor: '#ffffff',
                borderWidth: 2
              }
            }
          ]
        }
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut' as const
    };
  }

  /**
   * 获取角色特定的维度重要性排序
   */
  static getDimensionPriority(role: RoleViewType): Array<{
    dimension: string;
    name: string;
    priority: number;
    description: string;
  }> {
    const roleConfig = this.getRoleConfig(role);
    
    const dimensionNames = {
      profitability: '利润空间',
      roiSpeed: 'ROI速度',
      portability: '便携指数',
      features: '功能丰富度',
      priceAdvantage: '价格竞争力'
    };

    return roleConfig.dimensionWeights
      .sort((a, b) => b.weight - a.weight)
      .map((weight, index) => ({
        dimension: weight.dimension,
        name: dimensionNames[weight.dimension as keyof typeof dimensionNames],
        priority: index + 1,
        description: weight.roleDescription
      }));
  }

  /**
   * 获取角色特定的分析重点提示
   */
  static getRoleAnalysisHints(role: RoleViewType, scores: RadarScores): string[] {
    const roleConfig = this.getRoleConfig(role);
    const hints: string[] = [];

    if (role === 'retail') {
      // 零售PM关注点
      if (scores.profitability >= 8) {
        hints.push('💰 利润空间充足，可考虑积极的市场推广策略');
      } else if (scores.profitability < 6) {
        hints.push('⚠️ 利润空间偏低，建议重新评估定价策略或成本结构');
      }

      if (scores.roiSpeed >= 8) {
        hints.push('🚀 投资回报快速，适合快速扩张市场');
      } else if (scores.roiSpeed < 6) {
        hints.push('⏰ 回本周期较长，建议分阶段投入降低风险');
      }

      if (scores.priceAdvantage >= 7) {
        hints.push('🎯 价格竞争力强，可考虑价值定价策略');
      }
    } else {
      // 制造PM关注点
      if (scores.portability >= 8) {
        hints.push('🏆 产品轻量化设计优秀，体现了先进的工艺水平');
      } else if (scores.portability < 6) {
        hints.push('🔧 产品便携性有待提升，建议优化结构设计和材料选择');
      }

      if (scores.features >= 8) {
        hints.push('⚙️ 功能实现完善，技术集成度高');
      } else if (scores.features < 6) {
        hints.push('🛠️ 功能特性相对简单，可考虑增加差异化功能');
      }

      if (scores.profitability >= 8) {
        hints.push('💡 成本控制优秀，生产效率高');
      } else if (scores.profitability < 6) {
        hints.push('📊 需要优化生产成本，考虑工艺改进或供应链优化');
      }
    }

    return hints;
  }

  /**
   * 辅助方法：将十六进制颜色转换为RGB
   */
  private static hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '59, 130, 246'; // 默认蓝色
    
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ].join(', ');
  }
}