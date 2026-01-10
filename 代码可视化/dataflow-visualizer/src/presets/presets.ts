import type { ModuleDefinition } from '../types';

// 利润计算模块
export const profitCalculatorModule: ModuleDefinition = {
  id: 'profit_calculator',
  name: '利润计算器',
  category: 'calculation',
  description: '计算产品利润，支持成本、售价、销售量计算',
  version: '1.0.0',
  author: 'MiniMax Agent',
  inputs: [
    { id: 'cost', name: '成本', type: 'number', description: '单位产品成本' },
    { id: 'price', name: '售价', type: 'number', description: '单位产品售价' },
    { id: 'quantity', name: '销售量', type: 'number', description: '销售数量' },
    { id: 'tax_rate', name: '税率', type: 'number', description: '税率百分比' },
  ],
  outputs: [
    { id: 'profit', name: '利润', type: 'number', description: '计算得出的利润' },
    { id: 'profit_margin', name: '利润率', type: 'number', description: '利润率百分比' },
    { id: 'revenue', name: '收入', type: 'number', description: '总收入' },
  ],
  config: {
    currency: 'CNY',
    decimals: 2,
  },
  code: `
    function execute(inputs, config, globals) {
      const { cost, price, quantity, tax_rate } = inputs;
      const tax = (price * quantity * tax_rate) / 100;
      const revenue = price * quantity;
      const totalCost = cost * quantity + tax;
      const profit = revenue - totalCost;
      const profitMargin = (profit / revenue) * 100;
      
      return {
        profit: Number(profit.toFixed(config.decimals || 2)),
        profitMargin: Number(profitMargin.toFixed(2)),
        revenue: Number(revenue.toFixed(config.decimals || 2)),
      };
    }
  `,
  isBuiltIn: true,
  lastModified: new Date().toISOString(),
};

// 数据输入模块
export const dataInputModule: ModuleDefinition = {
  id: 'data_input',
  name: '数据输入',
  category: 'input',
  description: '手动输入数据或从文件中导入数据',
  version: '1.0.0',
  author: 'MiniMax Agent',
  inputs: [],
  outputs: [
    { id: 'output', name: '数据输出', type: 'json', description: '输出的数据' },
  ],
  config: {
    dataType: 'manual',
    sampleData: '',
  },
  code: `
    function execute(inputs, config, globals) {
      // 支持手动输入JSON数据
      const data = JSON.parse(config.sampleData || '{}');
      return {
        output: data,
      };
    }
  `,
  isBuiltIn: true,
  lastModified: new Date().toISOString(),
};

// 数据过滤模块
export const dataFilterModule: ModuleDefinition = {
  id: 'data_filter',
  name: '数据过滤',
  category: 'processing',
  description: '根据条件过滤数据',
  version: '1.0.0',
  author: 'MiniMax Agent',
  inputs: [
    { id: 'data', name: '输入数据', type: 'json', description: '要过滤的数据' },
  ],
  outputs: [
    { id: 'filtered_data', name: '过滤后数据', type: 'json', description: '过滤后的数据' },
  ],
  config: {
    filterField: '',
    filterOperator: 'equals',
    filterValue: '',
  },
  code: `
    function execute(inputs, config, globals) {
      const { data } = inputs;
      const { filterField, filterOperator, filterValue } = config;
      
      if (!Array.isArray(data)) {
        return { filtered_data: data };
      }
      
      let filteredData = data;
      
      if (filterField && filterValue) {
        filteredData = data.filter(item => {
          const fieldValue = item[filterField];
          const compareValue = isNaN(filterValue) ? filterValue : Number(filterValue);
          
          switch (filterOperator) {
            case 'equals':
              return fieldValue == compareValue;
            case 'not_equals':
              return fieldValue != compareValue;
            case 'greater_than':
              return Number(fieldValue) > Number(compareValue);
            case 'less_than':
              return Number(fieldValue) < Number(compareValue);
            case 'contains':
              return String(fieldValue).includes(String(compareValue));
            default:
              return true;
          }
        });
      }
      
      return {
        filtered_data: filteredData,
      };
    }
  `,
  isBuiltIn: true,
  lastModified: new Date().toISOString(),
};

// 数据聚合模块
export const dataAggregatorModule: ModuleDefinition = {
  id: 'data_aggregator',
  name: '数据聚合',
  category: 'processing',
  description: '对数据进行聚合计算（求和、平均值、最大值等）',
  version: '1.0.0',
  author: 'MiniMax Agent',
  inputs: [
    { id: 'data', name: '输入数据', type: 'json', description: '要聚合的数据' },
  ],
  outputs: [
    { id: 'aggregated_data', name: '聚合结果', type: 'json', description: '聚合计算结果' },
  ],
  config: {
    groupBy: '',
    aggregations: [
      { field: '', operation: 'sum', alias: 'total' },
    ],
  },
  code: `
    function execute(inputs, config, globals) {
      const { data } = inputs;
      const { groupBy, aggregations } = config;
      
      if (!Array.isArray(data) || data.length === 0) {
        return { aggregated_data: {} };
      }
      
      let result = {};
      
      if (groupBy) {
        // 分组聚合
        const groups = {};
        
        data.forEach(item => {
          const key = item[groupBy];
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(item);
        });
        
        result = Object.keys(groups).map(groupKey => {
          const groupData = groups[groupKey];
          const groupResult = { [groupBy]: groupKey };
          
          aggregations.forEach(agg => {
            const values = groupData.map(item => Number(item[agg.field] || 0));
            
            switch (agg.operation) {
              case 'sum':
                groupResult[agg.alias] = values.reduce((sum, val) => sum + val, 0);
                break;
              case 'avg':
                groupResult[agg.alias] = values.reduce((sum, val) => sum + val, 0) / values.length;
                break;
              case 'max':
                groupResult[agg.alias] = Math.max(...values);
                break;
              case 'min':
                groupResult[agg.alias] = Math.min(...values);
                break;
              case 'count':
                groupResult[agg.alias] = values.length;
                break;
            }
          });
          
          return groupResult;
        });
      } else {
        // 整体聚合
        aggregations.forEach(agg => {
          const values = data.map(item => Number(item[agg.field] || 0));
          
          switch (agg.operation) {
            case 'sum':
              result[agg.alias] = values.reduce((sum, val) => sum + val, 0);
              break;
            case 'avg':
              result[agg.alias] = values.reduce((sum, val) => sum + val, 0) / values.length;
              break;
            case 'max':
              result[agg.alias] = Math.max(...values);
              break;
            case 'min':
              result[agg.alias] = Math.min(...values);
              break;
            case 'count':
              result[agg.alias] = values.length;
              break;
          }
        });
      }
      
      return {
        aggregated_data: result,
      };
    }
  `,
  isBuiltIn: true,
  lastModified: new Date().toISOString(),
};

// 全局变量读取模块
export const globalVariableModule: ModuleDefinition = {
  id: 'global_variable',
  name: '全局变量',
  category: 'input',
  description: '读取全局变量值',
  version: '1.0.0',
  author: 'MiniMax Agent',
  inputs: [],
  outputs: [
    { id: 'value', name: '变量值', type: 'string', description: '全局变量的值' },
  ],
  config: {
    variableName: '',
  },
  code: `
    function execute(inputs, config, globals) {
      const { variableName } = config;
      const value = globals[variableName] || config.defaultValue || '';
      
      return {
        value: value,
      };
    }
  `,
  isBuiltIn: true,
  lastModified: new Date().toISOString(),
};

// 条件判断模块
export const conditionalModule: ModuleDefinition = {
  id: 'conditional',
  name: '条件判断',
  category: 'processing',
  description: '根据条件分支处理数据',
  version: '1.0.0',
  author: 'MiniMax Agent',
  inputs: [
    { id: 'condition_value', name: '条件值', type: 'number', description: '用于判断的值' },
  ],
  outputs: [
    { id: 'result', name: '判断结果', type: 'boolean', description: '条件判断结果' },
    { id: 'true_output', name: '真值输出', type: 'json', description: '条件为真时的输出' },
    { id: 'false_output', name: '假值输出', type: 'json', description: '条件为假时的输出' },
  ],
  config: {
    operator: 'greater_than',
    threshold: 0,
    trueValue: true,
    falseValue: false,
  },
  code: `
    function execute(inputs, config, globals) {
      const { condition_value } = inputs;
      const { operator, threshold, trueValue, falseValue } = config;
      
      let result = false;
      
      switch (operator) {
        case 'greater_than':
          result = condition_value > threshold;
          break;
        case 'less_than':
          result = condition_value < threshold;
          break;
        case 'equals':
          result = condition_value == threshold;
          break;
        case 'not_equals':
          result = condition_value != threshold;
          break;
        default:
          result = false;
      }
      
      return {
        result: result,
        true_output: result ? trueValue : null,
        false_output: !result ? falseValue : null,
      };
    }
  `,
  isBuiltIn: true,
  lastModified: new Date().toISOString(),
};

// 图表输出模块
export const chartOutputModule: ModuleDefinition = {
  id: 'chart_output',
  name: '图表输出',
  category: 'output',
  description: '生成图表可视化结果',
  version: '1.0.0',
  author: 'MiniMax Agent',
  inputs: [
    { id: 'data', name: '图表数据', type: 'json', description: '用于生成图表的数据' },
  ],
  outputs: [],
  config: {
    chartType: 'bar',
    title: '数据分析图表',
    xAxis: '',
    yAxis: '',
  },
  code: `
    function execute(inputs, config, globals) {
      const { data } = inputs;
      const { chartType, title, xAxis, yAxis } = config;
      
      // 返回图表配置，UI层会处理实际渲染
      return {
        chartConfig: {
          type: chartType,
          title: title,
          data: data,
          xAxis: xAxis,
          yAxis: yAxis,
        },
      };
    }
  `,
  isBuiltIn: true,
  lastModified: new Date().toISOString(),
};

// 定价预测模块
export const pricingModule: ModuleDefinition = {
  id: 'pricing',
  name: '定价预测',
  category: 'calculation',
  description: '基于成本和市场因素预测最优定价',
  version: '1.0.0',
  author: 'MiniMax Agent',
  inputs: [
    { id: 'cost', name: '成本', type: 'number', description: '产品成本' },
    { id: 'competitor_price', name: '竞品价格', type: 'number', description: '竞争对手价格' },
    { id: 'demand_factor', name: '需求系数', type: 'number', description: '市场需求系数' },
  ],
  outputs: [
    { id: 'recommended_price', name: '推荐价格', type: 'number', description: '计算得出的推荐价格' },
    { id: 'price_range', name: '价格区间', type: 'json', description: '可接受的价格区间' },
  ],
  config: {
    profitMargin: 30,
    marketPremium: 10,
  },
  code: `
    function execute(inputs, config, globals) {
      const { cost, competitor_price, demand_factor } = inputs;
      const { profitMargin, marketPremium } = config;
      
      // 基于成本加成定价
      const basePrice = cost * (1 + profitMargin / 100);
      
      // 基于市场竞争定价
      const marketPrice = competitor_price * (1 + marketPremium / 100);
      
      // 考虑需求因素
      const demandAdjusted = basePrice * (1 + (demand_factor - 1) * 0.1);
      
      // 综合定价策略
      const recommendedPrice = (basePrice * 0.4 + marketPrice * 0.4 + demandAdjusted * 0.2);
      
      const priceRange = {
        min: recommendedPrice * 0.9,
        max: recommendedPrice * 1.1,
        recommended: recommendedPrice,
      };
      
      return {
        recommended_price: Number(recommendedPrice.toFixed(2)),
        price_range: priceRange,
      };
    }
  `,
  isBuiltIn: true,
  lastModified: new Date().toISOString(),
};

// 回报周期计算模块
export const roiModule: ModuleDefinition = {
  id: 'roi_calculator',
  name: 'ROI计算',
  category: 'calculation',
  description: '计算投资回报率和回报周期',
  version: '1.0.0',
  author: 'MiniMax Agent',
  inputs: [
    { id: 'investment', name: '投资金额', type: 'number', description: '初始投资金额' },
    { id: 'revenue', name: '收入', type: 'number', description: '预期年收入' },
    { id: 'operating_cost', name: '运营成本', type: 'number', description: '年运营成本' },
  ],
  outputs: [
    { id: 'roi', name: 'ROI', type: 'number', description: '投资回报率' },
    { id: 'payback_period', name: '回报周期', type: 'number', description: '投资回报周期（年）' },
    { id: 'net_profit', name: '净利润', type: 'number', description: '年净利润' },
  ],
  config: {
    discountRate: 10,
  },
  code: `
    function execute(inputs, config, globals) {
      const { investment, revenue, operating_cost } = inputs;
      const { discountRate } = config;
      
      const netProfit = revenue - operating_cost;
      const roi = (netProfit / investment) * 100;
      const paybackPeriod = investment / netProfit;
      
      return {
        roi: Number(roi.toFixed(2)),
        payback_period: Number(paybackPeriod.toFixed(1)),
        net_profit: Number(netProfit.toFixed(2)),
      };
    }
  `,
  isBuiltIn: true,
  lastModified: new Date().toISOString(),
};

// 导出所有预设模块
export const presetModules: ModuleDefinition[] = [
  profitCalculatorModule,
  dataInputModule,
  dataFilterModule,
  dataAggregatorModule,
  globalVariableModule,
  conditionalModule,
  chartOutputModule,
  pricingModule,
  roiModule,
];