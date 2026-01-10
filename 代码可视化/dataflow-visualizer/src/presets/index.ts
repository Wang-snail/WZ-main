/**
 * ============================================================================
 * 文件名：预设模块.ts
 * 功能描述：定义系统内置的所有预设模块
 *
 * 本文件包含以下预设模块：
 * 1. 利润计算器 - 计算产品利润、利润率、收入
 * 2. 数据输入 - 手动输入数据或从文件导入
 * 3. 数据过滤 - 根据条件过滤数据
 * 4. 数据聚合 - 对数据进行聚合计算（求和、平均值、最大值等）
 * 5. 全局变量 - 读取全局变量值
 * 6. 条件判断 - 根据条件分支处理数据
 * 7. 图表输出 - 生成图表可视化结果
 * 8. 定价预测 - 基于成本和市场因素预测最优定价
 * 9. ROI计算 - 计算投资回报率和回报周期
 *
 * 模块结构说明：
 * - id: 模块唯一标识符
 * - name: 模块显示名称
 * - category: 模块分类（input/processing/calculation/output）
 * - description: 模块描述
 * - inputs/outputs: 输入输出端口定义
 * - config: 模块配置参数
 * - code: 模块执行代码
 * - isBuiltIn: 是否为内置模块
 * - lastModified: 最后修改时间
 * ============================================================================
 */

// 从类型定义文件导入模块定义类型
import type { ModuleDefinition } from '../类型/索引';

// ============================================================================
// 第一部分：利润计算器模块
// ============================================================================

/**
 * 利润计算器模块
 *
 * 功能说明：
 * 计算产品利润，支持成本、售价、销售量、税率等参数
 *
 * 输入端口：
 * - cost: 单位产品成本
 * - price: 单位产品售价
 * - quantity: 销售数量
 * - tax_rate: 税率百分比
 *
 * 输出端口：
 * - profit: 计算得出的利润
 * - profitMargin: 利润率百分比
 * - revenue: 总收入
 *
 * 计算公式：
 * - 税额 = 售价 × 销售量 × 税率 / 100
 * - 总成本 = 成本 × 销售量 + 税额
 * - 收入 = 售价 × 销售量
 * - 利润 = 收入 - 总成本
 * - 利润率 = 利润 / 收入 × 100
 */
export const profitCalculatorModule: ModuleDefinition = {
  // 模块唯一标识符
  id: 'profit_calculator',

  // 模块显示名称
  name: '利润计算器',

  // 模块分类（calculation = 计算类模块）
  category: 'calculation',

  // 模块描述
  description: '计算产品利润，支持成本、售价、销售量计算',

  // 模块版本号
  version: '1.0.0',

  // 模块作者
  author: 'MiniMax Agent',

  // 输入端口定义
  inputs: [
    {
      id: 'cost',          // 端口 ID
      name: '成本',        // 显示名称
      type: 'number',      // 数据类型：数字
      description: '单位产品成本',  // 描述
    },
    {
      id: 'price',
      name: '售价',
      type: 'number',
      description: '单位产品售价',
    },
    {
      id: 'quantity',
      name: '销售量',
      type: 'number',
      description: '销售数量',
    },
    {
      id: 'tax_rate',
      name: '税率',
      type: 'number',
      description: '税率百分比',
    },
  ],

  // 输出端口定义
  outputs: [
    {
      id: 'profit',
      name: '利润',
      type: 'number',
      description: '计算得出的利润',
    },
    {
      id: 'profit_margin',
      name: '利润率',
      type: 'number',
      description: '利润率百分比',
    },
    {
      id: 'revenue',
      name: '收入',
      type: 'number',
      description: '总收入',
    },
  ],

  // 模块默认配置
  config: {
    currency: 'CNY',       // 货币单位：人民币
    decimals: 2,           // 小数位数
  },

  // 模块执行代码
  code: `
    // 执行函数：计算利润
    // 参数说明：
    // - inputs: 输入值对象，包含 cost、price、quantity、tax_rate
    // - config: 模块配置，包含 currency 和 decimals
    // - globals: 全局变量
    function execute(inputs, config, globals) {
      // 从 inputs 中解构输入值
      const { cost, price, quantity, tax_rate } = inputs;

      // 计算税额：售价 × 销售量 × 税率 / 100
      const tax = (price * quantity * tax_rate) / 100;

      // 计算总收入：售价 × 销售量
      const revenue = price * quantity;

      // 计算总成本：成本 × 销售量 + 税额
      const totalCost = cost * quantity + tax;

      // 计算利润：收入 - 总成本
      const profit = revenue - totalCost;

      // 计算利润率：利润 / 收入 × 100
      const profitMargin = (profit / revenue) * 100;

      // 返回输出对象
      return {
        profit: Number(profit.toFixed(config.decimals || 2)),           // 利润（保留指定小数位）
        profitMargin: Number(profitMargin.toFixed(2)),                  // 利润率（保留2位小数）
        revenue: Number(revenue.toFixed(config.decimals || 2)),         // 收入（保留指定小数位）
      };
    }
  `,

  // 是否为内置模块（true = 是，不能删除）
  isBuiltIn: true,

  // 最后修改时间
  lastModified: new Date().toISOString(),
};

// ============================================================================
// 第二部分：数据输入模块
// ============================================================================

/**
 * 数据输入模块
 *
 * 功能说明：
 * 手动输入数据或从文件中导入 JSON 数据
 *
 * 特点：
 * - 无输入端口（数据来源为手动输入或文件）
 * - 一个输出端口，输出 JSON 数据
 * - 用户可以在节点上直接编辑 JSON 数据
 * - 支持拖拽 JSON 文件到节点上
 *
 * 使用场景：
 * - 作为数据流的起点
 * - 提供测试数据
 * - 从外部文件导入数据
 */
export const dataInputModule: ModuleDefinition = {
  // 模块唯一标识符
  id: 'data_input',

  // 模块显示名称
  name: '数据输入',

  // 模块分类（input = 输入类模块）
  category: 'input',

  // 模块描述
  description: '手动输入数据或从文件中导入数据',

  // 模块版本号
  version: '1.0.0',

  // 模块作者
  author: 'MiniMax Agent',

  // 输入端口定义（空数组，无输入端口）
  inputs: [],

  // 输出端口定义
  outputs: [
    {
      id: 'output',
      name: '数据输出',
      type: 'json',         // 数据类型：JSON
      description: '输出的数据',
    },
  ],

  // 模块默认配置
  config: {
    dataType: 'manual',     // 数据类型：手动输入
    sampleData: '',         // 示例数据（JSON 字符串）
  },

  // 模块执行代码
  code: `
    // 执行函数：输出数据
    // 参数说明：
    // - inputs: 空对象（无输入）
    // - config: 模块配置，包含 sampleData
    // - globals: 全局变量
    function execute(inputs, config, globals) {
      // 解析配置中的示例数据为 JSON 对象
      // 如果 sampleData 为空，则返回空对象 {}
      const data = JSON.parse(config.sampleData || '{}');

      // 返回输出对象
      return {
        output: data,  // 输出解析后的数据
      };
    }
  `,

  // 是否为内置模块
  isBuiltIn: true,

  // 最后修改时间
  lastModified: new Date().toISOString(),
};

// ============================================================================
// 第三部分：数据过滤模块
// ============================================================================

/**
 * 数据过滤模块
 *
 * 功能说明：
 * 根据条件过滤数组数据
 *
 * 输入端口：
 * - data: 要过滤的数据（数组）
 *
 * 输出端口：
 * - filtered_data: 过滤后的数据
 *
 * 过滤条件（配置）：
 * - filterField: 要过滤的字段名
 * - filterOperator: 过滤运算符（equals/not_equals/greater_than/less_than/contains）
 * - filterValue: 过滤值
 *
 * 使用场景：
 * - 筛选满足条件的数据
 * - 从大数据集中提取子集
 * - 数据预处理
 */
export const dataFilterModule: ModuleDefinition = {
  // 模块唯一标识符
  id: 'data_filter',

  // 模块显示名称
  name: '数据过滤',

  // 模块分类（processing = 处理类模块）
  category: 'processing',

  // 模块描述
  description: '根据条件过滤数据',

  // 模块版本号
  version: '1.0.0',

  // 模块作者
  author: 'MiniMax Agent',

  // 输入端口定义
  inputs: [
    {
      id: 'data',
      name: '输入数据',
      type: 'json',
      description: '要过滤的数据',
    },
  ],

  // 输出端口定义
  outputs: [
    {
      id: 'filtered_data',
      name: '过滤后数据',
      type: 'json',
      description: '过滤后的数据',
    },
  ],

  // 模块默认配置
  config: {
    filterField: '',        // 要过滤的字段名
    filterOperator: 'equals',  // 过滤运算符
    filterValue: '',        // 过滤值
  },

  // 模块执行代码
  code: `
    // 执行函数：过滤数据
    function execute(inputs, config, globals) {
      // 从 inputs 中解构输入数据
      const { data } = inputs;

      // 从 config 中解构过滤条件
      const { filterField, filterOperator, filterValue } = config;

      // 如果输入数据不是数组，直接返回原数据
      if (!Array.isArray(data)) {
        return { filtered_data: data };
      }

      // 初始化过滤后的数据为原数据
      let filteredData = data;

      // 如果有设置过滤条件
      if (filterField && filterValue) {
        // 过滤数据
        filteredData = data.filter(item => {
          // 获取字段值
          const fieldValue = item[filterField];

          // 将过滤值转换为数字（如果是数字）
          const compareValue = isNaN(filterValue) ? filterValue : Number(filterValue);

          // 根据运算符进行过滤
          switch (filterOperator) {
            case 'equals':            // 等于
              return fieldValue == compareValue;
            case 'not_equals':        // 不等于
              return fieldValue != compareValue;
            case 'greater_than':      // 大于
              return Number(fieldValue) > Number(compareValue);
            case 'less_than':         // 小于
              return Number(fieldValue) < Number(compareValue);
            case 'contains':          // 包含
              return String(fieldValue).includes(String(compareValue));
            default:                  // 默认不过滤
              return true;
          }
        });
      }

      // 返回过滤后的数据
      return {
        filtered_data: filteredData,
      };
    }
  `,

  // 是否为内置模块
  isBuiltIn: true,

  // 最后修改时间
  lastModified: new Date().toISOString(),
};

// ============================================================================
// 第四部分：数据聚合模块
// ============================================================================

/**
 * 数据聚合模块
 *
 * 功能说明：
 * 对数据进行聚合计算，支持分组聚合和整体聚合
 *
 * 输入端口：
 * - data: 要聚合的数据（数组）
 *
 * 输出端口：
 * - aggregated_data: 聚合计算结果
 *
 * 聚合操作：
 * - sum: 求和
 * - avg: 平均值
 * - max: 最大值
 * - min: 最小值
 * - count: 计数
 *
 * 使用场景：
 * - 统计汇总
 * - 数据分析
 * - 生成报表数据
 */
export const dataAggregatorModule: ModuleDefinition = {
  // 模块唯一标识符
  id: 'data_aggregator',

  // 模块显示名称
  name: '数据聚合',

  // 模块分类（processing = 处理类模块）
  category: 'processing',

  // 模块描述
  description: '对数据进行聚合计算（求和、平均值、最大值等）',

  // 模块版本号
  version: '1.0.0',

  // 模块作者
  author: 'MiniMax Agent',

  // 输入端口定义
  inputs: [
    {
      id: 'data',
      name: '输入数据',
      type: 'json',
      description: '要聚合的数据',
    },
  ],

  // 输出端口定义
  outputs: [
    {
      id: 'aggregated_data',
      name: '聚合结果',
      type: 'json',
      description: '聚合计算结果',
    },
  ],

  // 模块默认配置
  config: {
    groupBy: '',            // 分组字段（为空则整体聚合）
    aggregations: [         // 聚合操作列表
      { field: '', operation: 'sum', alias: 'total' },
    ],
  },

  // 模块执行代码
  code: `
    // 执行函数：聚合数据
    function execute(inputs, config, globals) {
      // 从 inputs 中解构输入数据
      const { data } = inputs;

      // 从 config 中解构配置
      const { groupBy, aggregations } = config;

      // 如果数据不是数组或为空数组，返回空对象
      if (!Array.isArray(data) || data.length === 0) {
        return { aggregated_data: {} };
      }

      // 初始化结果
      let result = {};

      // 如果有分组字段，执行分组聚合
      if (groupBy) {
        // 按分组字段分组
        const groups = {};

        // 遍历数据，将数据按分组字段分组
        data.forEach(item => {
          // 获取分组键值
          const key = item[groupBy];

          // 如果该分组不存在，创建新分组
          if (!groups[key]) {
            groups[key] = [];
          }

          // 将数据项添加到对应分组
          groups[key].push(item);
        });

        // 遍历每个分组，计算聚合值
        result = Object.keys(groups).map(groupKey => {
          // 获取该分组的全部数据
          const groupData = groups[groupKey];

          // 初始化分组结果，包含分组字段
          const groupResult = { [groupBy]: groupKey };

          // 遍历每个聚合操作
          aggregations.forEach(agg => {
            // 提取该分组中指定字段的所有值
            const values = groupData.map(item => Number(item[agg.field] || 0));

            // 根据聚合操作类型计算结果
            switch (agg.operation) {
              case 'sum':   // 求和
                groupResult[agg.alias] = values.reduce((sum, val) => sum + val, 0);
                break;
              case 'avg':   // 平均值
                groupResult[agg.alias] = values.reduce((sum, val) => sum + val, 0) / values.length;
                break;
              case 'max':   // 最大值
                groupResult[agg.alias] = Math.max(...values);
                break;
              case 'min':   // 最小值
                groupResult[agg.alias] = Math.min(...values);
                break;
              case 'count': // 计数
                groupResult[agg.alias] = values.length;
                break;
            }
          });

          // 返回该分组的结果
          return groupResult;
        });
      } else {
        // 没有分组字段，执行整体聚合
        aggregations.forEach(agg => {
          // 提取指定字段的所有值
          const values = data.map(item => Number(item[agg.field] || 0));

          // 根据聚合操作类型计算结果
          switch (agg.operation) {
            case 'sum':   // 求和
              result[agg.alias] = values.reduce((sum, val) => sum + val, 0);
              break;
            case 'avg':   // 平均值
              result[agg.alias] = values.reduce((sum, val) => sum + val, 0) / values.length;
              break;
            case 'max':   // 最大值
              result[agg.alias] = Math.max(...values);
              break;
            case 'min':   // 最小值
              result[agg.alias] = Math.min(...values);
              break;
            case 'count': // 计数
              result[agg.alias] = values.length;
              break;
          }
        });
      }

      // 返回聚合结果
      return {
        aggregated_data: result,
      };
    }
  `,

  // 是否为内置模块
  isBuiltIn: true,

  // 最后修改时间
  lastModified: new Date().toISOString(),
};

// ============================================================================
// 第五部分：全局变量模块
// ============================================================================

/**
 * 全局变量模块
 *
 * 功能说明：
 * 读取全局变量值
 *
 * 特点：
 * - 无输入端口（数据来源为全局变量）
 * - 一个输出端口，输出变量值
 *
 * 使用场景：
 * - 引用全局配置（如税率、折扣率）
 * - 在多个节点间共享数据
 * - 集中管理常量
 */
export const globalVariableModule: ModuleDefinition = {
  // 模块唯一标识符
  id: 'global_variable',

  // 模块显示名称
  name: '全局变量',

  // 模块分类（input = 输入类模块）
  category: 'input',

  // 模块描述
  description: '读取全局变量值',

  // 模块版本号
  version: '1.0.0',

  // 模块作者
  author: 'MiniMax Agent',

  // 输入端口定义（空数组，无输入端口）
  inputs: [],

  // 输出端口定义
  outputs: [
    {
      id: 'value',
      name: '变量值',
      type: 'string',
      description: '全局变量的值',
    },
  ],

  // 模块默认配置
  config: {
    variableName: '',       // 全局变量名
  },

  // 模块执行代码
  code: `
    // 执行函数：读取全局变量
    function execute(inputs, config, globals) {
      // 从 config 中获取变量名
      const { variableName } = config;

      // 从全局变量中获取值，如果没有则使用默认值
      const value = globals[variableName] || config.defaultValue || '';

      // 返回变量值
      return {
        value: value,
      };
    }
  `,

  // 是否为内置模块
  isBuiltIn: true,

  // 最后修改时间
  lastModified: new Date().toISOString(),
};

// ============================================================================
// 第六部分：条件判断模块
// ============================================================================

/**
 * 条件判断模块
 *
 * 功能说明：
 * 根据条件分支处理数据
 *
 * 输入端口：
 * - condition_value: 用于判断的值
 *
 * 输出端口：
 * - result: 条件判断结果（布尔值）
 * - true_output: 条件为真时的输出
 * - false_output: 条件为假时的输出
 *
 * 运算符：
 * - greater_than: 大于
 * - less_than: 小于
 * - equals: 等于
 * - not_equals: 不等于
 *
 * 使用场景：
 * - 数据分流
 * - 业务规则判断
 * - 条件分支处理
 */
export const conditionalModule: ModuleDefinition = {
  // 模块唯一标识符
  id: 'conditional',

  // 模块显示名称
  name: '条件判断',

  // 模块分类（processing = 处理类模块）
  category: 'processing',

  // 模块描述
  description: '根据条件分支处理数据',

  // 模块版本号
  version: '1.0.0',

  // 模块作者
  author: 'MiniMax Agent',

  // 输入端口定义
  inputs: [
    {
      id: 'condition_value',
      name: '条件值',
      type: 'number',
      description: '用于判断的值',
    },
  ],

  // 输出端口定义
  outputs: [
    {
      id: 'result',
      name: '判断结果',
      type: 'boolean',
      description: '条件判断结果',
    },
    {
      id: 'true_output',
      name: '真值输出',
      type: 'json',
      description: '条件为真时的输出',
    },
    {
      id: 'false_output',
      name: '假值输出',
      type: 'json',
      description: '条件为假时的输出',
    },
  ],

  // 模块默认配置
  config: {
    operator: 'greater_than',  // 运算符
    threshold: 0,              // 阈值
    trueValue: true,           // 真值
    falseValue: false,         // 假值
  },

  // 模块执行代码
  code: `
    // 执行函数：条件判断
    function execute(inputs, config, globals) {
      // 从 inputs 中解构条件值
      const { condition_value } = inputs;

      // 从 config 中解构配置
      const { operator, threshold, trueValue, falseValue } = config;

      // 初始化判断结果
      let result = false;

      // 根据运算符进行判断
      switch (operator) {
        case 'greater_than':  // 大于
          result = condition_value > threshold;
          break;
        case 'less_than':     // 小于
          result = condition_value < threshold;
          break;
        case 'equals':        // 等于
          result = condition_value == threshold;
          break;
        case 'not_equals':    // 不等于
          result = condition_value != threshold;
          break;
        default:              // 默认 false
          result = false;
      }

      // 返回判断结果和条件输出
      return {
        result: result,                                      // 布尔判断结果
        true_output: result ? trueValue : null,              // 条件为真时输出
        false_output: !result ? falseValue : null,           // 条件为假时输出
      };
    }
  `,

  // 是否为内置模块
  isBuiltIn: true,

  // 最后修改时间
  lastModified: new Date().toISOString(),
};

// ============================================================================
// 第七部分：图表输出模块
// ============================================================================

/**
 * 图表输出模块
 *
 * 功能说明：
 * 生成图表可视化结果
 *
 * 特点：
 * - 有输入端口，无输出端口（图表在 UI 层渲染）
 *
 * 图表类型：
 * - bar: 柱状图
 * - line: 折线图
 * - pie: 饼图
 * - scatter: 散点图
 *
 * 使用场景：
 * - 数据可视化
 * - 分析结果展示
 * - 生成报表图表
 */
export const chartOutputModule: ModuleDefinition = {
  // 模块唯一标识符
  id: 'chart_output',

  // 模块显示名称
  name: '图表输出',

  // 模块分类（output = 输出类模块）
  category: 'output',

  // 模块描述
  description: '生成图表可视化结果',

  // 模块版本号
  version: '1.0.0',

  // 模块作者
  author: 'MiniMax Agent',

  // 输入端口定义
  inputs: [
    {
      id: 'data',
      name: '图表数据',
      type: 'json',
      description: '用于生成图表的数据',
    },
  ],

  // 输出端口定义（空数组，无输出端口）
  outputs: [],

  // 模块默认配置
  config: {
    chartType: 'bar',         // 图表类型
    title: '数据分析图表',     // 图表标题
    xAxis: '',                // X 轴字段
    yAxis: '',                // Y 轴字段
  },

  // 模块执行代码
  code: `
    // 执行函数：生成图表配置
    function execute(inputs, config, globals) {
      // 从 inputs 中解构图表数据
      const { data } = inputs;

      // 从 config 中解构图表配置
      const { chartType, title, xAxis, yAxis } = config;

      // 返回图表配置对象
      // UI 层会根据 chartConfig 渲染图表
      return {
        chartConfig: {
          type: chartType,    // 图表类型
          title: title,       // 图表标题
          data: data,         // 图表数据
          xAxis: xAxis,       // X 轴字段
          yAxis: yAxis,       // Y 轴字段
        },
      };
    }
  `,

  // 是否为内置模块
  isBuiltIn: true,

  // 最后修改时间
  lastModified: new Date().toISOString(),
};

// ============================================================================
// 第八部分：定价预测模块
// ============================================================================

/**
 * 定价预测模块
 *
 * 功能说明：
 * 基于成本和市场因素预测最优定价
 *
 * 输入端口：
 * - cost: 产品成本
 * - competitor_price: 竞争对手价格
 * - demand_factor: 需求系数
 *
 * 输出端口：
 * - recommended_price: 推荐价格
 * - price_range: 可接受的价格区间
 *
 * 定价策略：
 * - 成本加成定价：基于目标利润率
 * - 市场定价：参考竞争对手价格
 * - 需求调整：根据需求系数调整
 *
 * 使用场景：
 * - 产品定价决策
 * - 价格优化分析
 * - 市场竞争力评估
 */
export const pricingModule: ModuleDefinition = {
  // 模块唯一标识符
  id: 'pricing',

  // 模块显示名称
  name: '定价预测',

  // 模块分类（calculation = 计算类模块）
  category: 'calculation',

  // 模块描述
  description: '基于成本和市场因素预测最优定价',

  // 模块版本号
  version: '1.0.0',

  // 模块作者
  author: 'MiniMax Agent',

  // 输入端口定义
  inputs: [
    {
      id: 'cost',
      name: '成本',
      type: 'number',
      description: '产品成本',
    },
    {
      id: 'competitor_price',
      name: '竞品价格',
      type: 'number',
      description: '竞争对手价格',
    },
    {
      id: 'demand_factor',
      name: '需求系数',
      type: 'number',
      description: '市场需求系数',
    },
  ],

  // 输出端口定义
  outputs: [
    {
      id: 'recommended_price',
      name: '推荐价格',
      type: 'number',
      description: '计算得出的推荐价格',
    },
    {
      id: 'price_range',
      name: '价格区间',
      type: 'json',
      description: '可接受的价格区间',
    },
  ],

  // 模块默认配置
  config: {
    profitMargin: 30,        // 目标利润率（%）
    marketPremium: 10,       // 市场溢价（%）
  },

  // 模块执行代码
  code: `
    // 执行函数：预测最优定价
    function execute(inputs, config, globals) {
      // 从 inputs 中解构输入值
      const { cost, competitor_price, demand_factor } = inputs;

      // 从 config 中解构配置
      const { profitMargin, marketPremium } = config;

      // 策略1：基于成本加成定价
      // 基础价格 = 成本 × (1 + 利润率/100)
      const basePrice = cost * (1 + profitMargin / 100);

      // 策略2：基于市场竞争定价
      // 市场参考价 = 竞品价格 × (1 + 市场溢价/100)
      const marketPrice = competitor_price * (1 + marketPremium / 100);

      // 策略3：考虑需求因素
      // 需求调整价 = 基础价格 × (1 + (需求系数 - 1) × 0.1)
      const demandAdjusted = basePrice * (1 + (demand_factor - 1) * 0.1);

      // 综合定价策略（加权平均）
      // 推荐价格 = 基础价 × 0.4 + 市场价 × 0.4 + 需求调整价 × 0.2
      const recommendedPrice = (basePrice * 0.4 + marketPrice * 0.4 + demandAdjusted * 0.2);

      // 计算价格区间（推荐价格的 ±10%）
      const priceRange = {
        min: recommendedPrice * 0.9,      // 最低价
        max: recommendedPrice * 1.1,      // 最高价
        recommended: recommendedPrice,    // 推荐价
      };

      // 返回结果
      return {
        recommended_price: Number(recommendedPrice.toFixed(2)),  // 推荐价格（保留2位小数）
        price_range: priceRange,                                // 价格区间
      };
    }
  `,

  // 是否为内置模块
  isBuiltIn: true,

  // 最后修改时间
  lastModified: new Date().toISOString(),
};

// ============================================================================
// 第九部分：ROI 计算模块
// ============================================================================

/**
 * ROI 计算模块
 *
 * 功能说明：
 * 计算投资回报率（ROI）和回报周期
 *
 * 输入端口：
 * - investment: 初始投资金额
 * - revenue: 预期年收入
 * - operating_cost: 年运营成本
 *
 * 输出端口：
 * - roi: 投资回报率（%）
 * - payback_period: 投资回报周期（年）
 * - net_profit: 年净利润
 *
 * 计算公式：
 * - 净利润 = 收入 - 运营成本
 * - ROI = 净利润 / 投资 × 100
 * - 回报周期 = 投资 / 净利润
 *
 * 使用场景：
 * - 投资决策分析
 * - 项目可行性评估
 * - 收益率计算
 */
export const roiModule: ModuleDefinition = {
  // 模块唯一标识符
  id: 'roi_calculator',

  // 模块显示名称
  name: 'ROI计算',

  // 模块分类（calculation = 计算类模块）
  category: 'calculation',

  // 模块描述
  description: '计算投资回报率和回报周期',

  // 模块版本号
  version: '1.0.0',

  // 模块作者
  author: 'MiniMax Agent',

  // 输入端口定义
  inputs: [
    {
      id: 'investment',
      name: '投资金额',
      type: 'number',
      description: '初始投资金额',
    },
    {
      id: 'revenue',
      name: '收入',
      type: 'number',
      description: '预期年收入',
    },
    {
      id: 'operating_cost',
      name: '运营成本',
      type: 'number',
      description: '年运营成本',
    },
  ],

  // 输出端口定义
  outputs: [
    {
      id: 'roi',
      name: 'ROI',
      type: 'number',
      description: '投资回报率',
    },
    {
      id: 'payback_period',
      name: '回报周期',
      type: 'number',
      description: '投资回报周期（年）',
    },
    {
      id: 'net_profit',
      name: '净利润',
      type: 'number',
      description: '年净利润',
    },
  ],

  // 模块默认配置
  config: {
    discountRate: 10,        // 折现率（%）
  },

  // 模块执行代码
  code: `
    // 执行函数：计算 ROI
    function execute(inputs, config, globals) {
      // 从 inputs 中解构输入值
      const { investment, revenue, operating_cost } = inputs;

      // 从 config 中解构折现率（当前版本未使用）
      const { discountRate } = config;

      // 计算净利润 = 收入 - 运营成本
      const netProfit = revenue - operating_cost;

      // 计算 ROI = 净利润 / 投资 × 100
      const roi = (netProfit / investment) * 100;

      // 计算回报周期 = 投资 / 净利润
      const paybackPeriod = investment / netProfit;

      // 返回结果
      return {
        roi: Number(roi.toFixed(2)),                            // ROI（保留2位小数）
        payback_period: Number(paybackPeriod.toFixed(1)),       // 回报周期（保留1位小数）
        net_profit: Number(netProfit.toFixed(2)),               // 净利润（保留2位小数）
      };
    }
  `,

  // 是否为内置模块
  isBuiltIn: true,

  // 最后修改时间
  lastModified: new Date().toISOString(),
};

// ============================================================================
// 第十部分：导出所有预设模块
// ============================================================================

/**
 * 预设模块数组
 *
 * 功能说明：
 * 导出所有内置模块，供应用初始化时注册
 *
 * 模块列表：
 * 1. profitCalculatorModule: 利润计算器
 * 2. dataInputModule: 数据输入
 * 3. dataFilterModule: 数据过滤
 * 4. dataAggregatorModule: 数据聚合
 * 5. globalVariableModule: 全局变量
 * 6. conditionalModule: 条件判断
 * 7. chartOutputModule: 图表输出
 * 8. pricingModule: 定价预测
 * 9. roiModule: ROI 计算
 */
export const presetModules: ModuleDefinition[] = [
  // 利润计算器模块
  profitCalculatorModule,

  // 数据输入模块
  dataInputModule,

  // 数据过滤模块
  dataFilterModule,

  // 数据聚合模块
  dataAggregatorModule,

  // 全局变量模块
  globalVariableModule,

  // 条件判断模块
  conditionalModule,

  // 图表输出模块
  chartOutputModule,

  // 定价预测模块
  pricingModule,

  // ROI 计算模块
  roiModule,
];
