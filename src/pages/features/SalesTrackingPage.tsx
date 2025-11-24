import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// 注册Chart.js组件
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartDataLabels);

interface CostData {
  product: number;
  logistics: number;
  advertising: number;
  lastmile: number;
  commission: number;
  returns: number;
  other: number;
  profit: number;
}

interface ProductLineData {
  price: number;
  spu: number;
  monthlySales: number;
  annualSales: number;
}

interface ProductLines {
  steel: { forecast: ProductLineData; actual: ProductLineData };
  bracket: { forecast: ProductLineData; actual: ProductLineData };
  plastic: { forecast: ProductLineData; actual: ProductLineData };
  plant: { forecast: ProductLineData; actual: ProductLineData };
}

const SalesTrackingPage: React.FC = () => {

  // 状态管理
  const [globalProfitRate, setGlobalProfitRate] = useState(25);
  const [exchangeRate, setExchangeRate] = useState(7.13);
  const [successRate, setSuccessRate] = useState(70);

  // 目标数据
  const [targets, setTargets] = useState({
    cny: { sales: 50000, profit: 11500 },
    usd: { sales: 7013, profit: 1613, investment: 7013 }
  });

  // 实际数据
  const [actuals] = useState({
    cny: { sales: 9043, profit: 2261 },
    usd: { sales: 1269, profit: 317 }
  });

  // 成本数据
  const [costData, setCostData] = useState<CostData>({
    product: 30,
    logistics: 20,
    advertising: 10,
    lastmile: 8,
    commission: 15,
    returns: 1,
    other: 1,
    profit: 15
  });

  // 产品线数据
  const [productLines, setProductLines] = useState<ProductLines>({
    steel: {
      forecast: { price: 65, spu: 8, monthlySales: 500, annualSales: 3120000 },
      actual: { price: 60, spu: 5, monthlySales: 350, annualSales: 1260000 }
    },
    bracket: {
      forecast: { price: 35, spu: 12, monthlySales: 800, annualSales: 4032000 },
      actual: { price: 32, spu: 8, monthlySales: 650, annualSales: 1996800 }
    },
    plastic: {
      forecast: { price: 25, spu: 15, monthlySales: 1200, annualSales: 5400000 },
      actual: { price: 22, spu: 10, monthlySales: 980, annualSales: 2587200 }
    },
    plant: {
      forecast: { price: 30, spu: 20, monthlySales: 1500, annualSales: 10800000 },
      actual: { price: 28, spu: 12, monthlySales: 1200, annualSales: 4032000 }
    }
  });

  // 计算利润率
  const calculateProfitRate = (profit: number, sales: number) => {
    return sales > 0 ? ((profit / sales) * 100).toFixed(1) : '0';
  };

  // 计算年销售额
  const calculateAnnualSales = (price: number, spu: number, monthly: number) => {
    return price * spu * monthly * 12;
  };

  // 更新成本数据
  const updateCostData = (field: keyof CostData, value: number) => {
    const newCostData = { ...costData, [field]: value };

    if (field !== 'profit') {
      // 重新计算利润率
      const totalCosts = Object.entries(newCostData)
        .filter(([key]) => key !== 'profit')
        .reduce((sum, [, val]) => sum + val, 0);
      newCostData.profit = 100 - totalCosts;
      setGlobalProfitRate(newCostData.profit);
    }

    setCostData(newCostData);
  };

  // 更新产品线数据
  const updateProductLine = (
    line: keyof ProductLines,
    type: 'forecast' | 'actual',
    field: keyof ProductLineData,
    value: number
  ) => {
    if (field === 'annualSales') return; // 年销售额自动计算

    const newProductLines = { ...productLines };
    newProductLines[line][type] = { ...newProductLines[line][type], [field]: value };

    // 重新计算年销售额
    const lineData = newProductLines[line][type];
    if (field !== 'annualSales') {
      lineData.annualSales = calculateAnnualSales(lineData.price, lineData.spu, lineData.monthlySales);
    }

    setProductLines(newProductLines);
  };

  // 准备图表数据
  const getChartData = () => ({
    labels: ['成本', '头程', '广告', '尾程', '佣金', '退货', '其他', '利润'],
    datasets: [{
      data: [
        costData.product,
        costData.logistics,
        costData.advertising,
        costData.lastmile,
        costData.commission,
        costData.returns,
        costData.other,
        costData.profit
      ],
      backgroundColor: [
        '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0',
        '#9966ff', '#ff9f40', '#ff6384', '#4bc0c0'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  });

  // 图表配置
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: { size: 12 }
        }
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' as const, size: 11 },
        formatter: (value: number) => `${value}%`
      }
    }
  };

  // 比较销售额与目标
  const compareWithTarget = (actual: number, target: number) => {
    const targetInDollars = target * 10000; // 万元转美元
    const difference = actual - targetInDollars;
    const percentage = ((difference / targetInDollars) * 100).toFixed(1);

    return {
      difference,
      percentage: parseFloat(percentage),
      isPositive: difference >= 0
    };
  };

  // 计算汇总数据
  const calculateSummary = () => {
    const forecastTotal = Object.values(productLines).reduce(
      (sum, line) => sum + line.forecast.annualSales, 0
    );
    const actualTotal = Object.values(productLines).reduce(
      (sum, line) => sum + line.actual.annualSales, 0
    );

    return { forecastTotal, actualTotal };
  };

  const { forecastTotal, actualTotal } = calculateSummary();
  const forecastComparison = compareWithTarget(forecastTotal, targets.usd.sales);
  const actualComparison = compareWithTarget(actualTotal, targets.usd.sales);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Helmet>
        <title>销售额目标追踪 | WSNAIL.COM</title>
        <meta name="description" content="产品部26年产品上架计划和销售额目标追踪系统" />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif-display font-medium text-gray-800 mb-6 tracking-wide">
            产品部26年产品上架计划
          </h1>
          <div className="w-16 h-0.5 bg-gray-300 mx-auto"></div>
        </div>

        {/* 目标计算区域 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-6 text-gray-700">目标计算</h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 人民币区域 */}
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-red-700 mb-4">人民币区域</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">目标销售额 (万元):</label>
                  <input
                    type="number"
                    value={targets.cny.sales}
                    onChange={(e) => setTargets(prev => ({
                      ...prev,
                      cny: { ...prev.cny, sales: Number(e.target.value) }
                    }))}
                    className="w-20 md:w-24 px-2 py-1 border rounded text-right text-sm"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">目标利润额 (万元):</label>
                  <input
                    type="number"
                    value={targets.cny.profit}
                    onChange={(e) => setTargets(prev => ({
                      ...prev,
                      cny: { ...prev.cny, profit: Number(e.target.value) }
                    }))}
                    className="w-20 md:w-24 px-2 py-1 border rounded text-right text-sm"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">利润率:</label>
                  <span className="font-semibold text-red-600">
                    {calculateProfitRate(targets.cny.profit, targets.cny.sales)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">实际销售额 (万元):</label>
                  <span className="font-semibold text-blue-600">
                    {actuals.cny.sales.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">实际利润额 (万元):</label>
                  <span className="font-semibold text-blue-600">
                    {actuals.cny.profit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 美元区域 */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-green-700 mb-4">美元区域</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">目标销售额 (万元):</label>
                  <input
                    type="number"
                    value={targets.usd.sales}
                    onChange={(e) => setTargets(prev => ({
                      ...prev,
                      usd: { ...prev.usd, sales: Number(e.target.value) }
                    }))}
                    className="w-20 md:w-24 px-2 py-1 border rounded text-right text-sm"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">目标利润额 (万元):</label>
                  <input
                    type="number"
                    value={targets.usd.profit}
                    onChange={(e) => setTargets(prev => ({
                      ...prev,
                      usd: { ...prev.usd, profit: Number(e.target.value) }
                    }))}
                    className="w-20 md:w-24 px-2 py-1 border rounded text-right text-sm"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">利润率:</label>
                  <span className="font-semibold text-green-600">
                    {calculateProfitRate(targets.usd.profit, targets.usd.sales)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">实际销售额 (万元):</label>
                  <span className="font-semibold text-blue-600">
                    {actuals.usd.sales.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">实际利润额 (万元):</label>
                  <span className="font-semibold text-blue-600">
                    {actuals.usd.profit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 参数设置区域 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-blue-700 mb-4">参数设置</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">汇率:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-20 md:w-24 px-2 py-1 border rounded text-right text-sm"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">成功率 (%):</label>
                  <input
                    type="number"
                    value={successRate}
                    onChange={(e) => setSuccessRate(Number(e.target.value))}
                    className="w-20 md:w-24 px-2 py-1 border rounded text-right text-sm"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">实际利润率:</label>
                  <span className="font-semibold text-blue-600">{globalProfitRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 中间两列布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 左列：成本分析 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-700">成本分析</h3>
            <div className="relative h-64 md:h-80">
              <Pie data={getChartData()} options={chartOptions} />
            </div>

            {/* 成本输入控件 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {Object.entries(costData).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <label className="text-sm text-gray-600 capitalize">
                    {key === 'product' ? '成本' :
                      key === 'logistics' ? '头程' :
                        key === 'advertising' ? '广告' :
                          key === 'lastmile' ? '尾程' :
                            key === 'commission' ? '佣金' :
                              key === 'returns' ? '退货' :
                                key === 'other' ? '其他' :
                                  key === 'profit' ? '利润' : key}:
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => updateCostData(key as keyof CostData, Number(e.target.value))}
                      className="w-16 px-2 py-1 border rounded text-right text-sm"
                      disabled={key === 'profit'}
                    />
                    <span className="ml-1 text-sm text-gray-500">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右列：业绩对比 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-700">业绩对比</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">指标</th>
                    <th className="text-right py-2">数值</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr>
                    <td>销售额完成率</td>
                    <td className="text-right">
                      <span className={actuals.cny.sales / targets.cny.sales >= 1 ? 'text-green-600' : 'text-red-600'}>
                        {((actuals.cny.sales / targets.cny.sales) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>利润额完成率</td>
                    <td className="text-right">
                      <span className={actuals.cny.profit / targets.cny.profit >= 1 ? 'text-green-600' : 'text-red-600'}>
                        {((actuals.cny.profit / targets.cny.profit) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>销售额差异 (万元)</td>
                    <td className="text-right">
                      <span className={actuals.cny.sales - targets.cny.sales >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {(actuals.cny.sales - targets.cny.sales).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>利润差异 (万元)</td>
                    <td className="text-right">
                      <span className={actuals.cny.profit - targets.cny.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {(actuals.cny.profit - targets.cny.profit).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 品线数量分析 */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-8">
          <h3 className="text-xl font-bold mb-6 text-gray-700">品线数量分析</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {Object.entries(productLines).map(([lineKey, lineData]) => {
              const lineName = lineKey === 'steel' ? '🏗️ 钢木' :
                lineKey === 'bracket' ? '📺 支架' :
                  lineKey === 'plastic' ? '🔧 塑料' :
                    '🌱 植物';
              const forecastComp = compareWithTarget(lineData.forecast.annualSales, targets.usd.sales);
              const actualComp = compareWithTarget(lineData.actual.annualSales, targets.usd.sales);

              return (
                <div key={lineKey} className="border rounded-lg p-4 bg-gray-50">
                  <div className="text-center font-bold text-lg mb-4 pb-2 border-b">
                    {lineName}
                  </div>

                  <div className="space-y-4">
                    {/* 预测数据 */}
                    <div>
                      <div className="text-sm font-semibold mb-2">预测</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                        <div>
                          <div className="text-xs text-gray-500">单价</div>
                          <input
                            type="number"
                            value={lineData.forecast.price}
                            onChange={(e) => updateProductLine(lineKey as keyof ProductLines, 'forecast', 'price', Number(e.target.value))}
                            className="w-full px-1 py-1 border rounded text-center text-sm"
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">SPU</div>
                          <input
                            type="number"
                            value={lineData.forecast.spu}
                            onChange={(e) => updateProductLine(lineKey as keyof ProductLines, 'forecast', 'spu', Number(e.target.value))}
                            className="w-full px-1 py-1 border rounded text-center text-sm"
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">月销</div>
                          <input
                            type="number"
                            value={lineData.forecast.monthlySales}
                            onChange={(e) => updateProductLine(lineKey as keyof ProductLines, 'forecast', 'monthlySales', Number(e.target.value))}
                            className="w-full px-1 py-1 border rounded text-center text-sm"
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">年销售额</div>
                          <div className="font-semibold text-center py-1">
                            ${(lineData.forecast.annualSales / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs mt-1 text-center ${forecastComp.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {forecastComp.isPositive ? '达到目标' : '低于目标'} ({forecastComp.percentage > 0 ? '+' : ''}{forecastComp.percentage}%)
                      </div>
                    </div>

                    {/* 实际数据 */}
                    <div>
                      <div className="text-sm font-semibold mb-2">实际</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                        <div>
                          <div className="text-xs text-gray-500">单价</div>
                          <input
                            type="number"
                            value={lineData.actual.price}
                            onChange={(e) => updateProductLine(lineKey as keyof ProductLines, 'actual', 'price', Number(e.target.value))}
                            className="w-full px-1 py-1 border rounded text-center text-sm"
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">SPU</div>
                          <input
                            type="number"
                            value={lineData.actual.spu}
                            onChange={(e) => updateProductLine(lineKey as keyof ProductLines, 'actual', 'spu', Number(e.target.value))}
                            className="w-full px-1 py-1 border rounded text-center text-sm"
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">月销</div>
                          <input
                            type="number"
                            value={lineData.actual.monthlySales}
                            onChange={(e) => updateProductLine(lineKey as keyof ProductLines, 'actual', 'monthlySales', Number(e.target.value))}
                            className="w-full px-1 py-1 border rounded text-center text-sm"
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">年销售额</div>
                          <div className="font-semibold text-center py-1">
                            ${(lineData.actual.annualSales / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs mt-1 text-center ${actualComp.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {actualComp.isPositive ? '达到目标' : '低于目标'} ({actualComp.percentage > 0 ? '+' : ''}{actualComp.percentage}%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 汇总统计 */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-bold mb-4">汇总统计</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">预测总销售额</div>
                <div className="text-lg font-bold">${(forecastTotal / 1000000).toFixed(1)}M</div>
                <div className={`text-sm ${forecastComparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  vs 目标: {forecastComparison.percentage > 0 ? '+' : ''}{forecastComparison.percentage}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">实际总销售额</div>
                <div className="text-lg font-bold">${(actualTotal / 1000000).toFixed(1)}M</div>
                <div className={`text-sm ${actualComparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  vs 目标: {actualComparison.percentage > 0 ? '+' : ''}{actualComparison.percentage}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTrackingPage;