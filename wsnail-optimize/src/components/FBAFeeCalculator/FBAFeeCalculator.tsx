'use client';

import React, { useState } from 'react';
import {
  calculateFBAFees,
  formatCurrency,
  formatPercentage,
  type ProductInput,
  type CalculationResult,
} from '@/lib/calculators/fbaFeeCalculator';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function FBAFeeCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const [formData, setFormData] = useState<ProductInput>({
    productName: '',
    asin: '',
    productCost: 0,
    sellingPrice: 0,
    shippingCost: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
    },
    category: 'standard',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;

    if (name.startsWith('dim_')) {
      const dimKey = name.replace('dim_', '') as keyof typeof formData.dimensions;
      setFormData({
        ...formData,
        dimensions: {
          ...formData.dimensions,
          [dimKey]: numValue,
        },
      });
    } else if (name === 'category') {
      setFormData({
        ...formData,
        category: value as ProductInput['category'],
      });
    } else if (name === 'productName' || name === 'asin') {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: numValue,
      });
    }
  };

  const handleCalculate = () => {
    const calculation = calculateFBAFees(formData);
    setResult(calculation);
  };

  const handleCopy = () => {
    if (!result) return;

    const text = `
FBA 费用计算结果
================================

产品信息
--------
产品名称: ${formData.productName || '未填写'}
ASIN: ${formData.asin || '未填写'}

费用明细 (USD)
------------
FBA 配送费: ${formatCurrency(result.fulfillmentFee, 'USD')}
仓储费: ${formatCurrency(result.storageFee, 'USD')}
销售佣金: ${formatCurrency(result.commission, 'USD')}
头程运费: ${formatCurrency(result.shippingCostUSD, 'USD')}
产品成本: ${formatCurrency(result.productCostUSD, 'USD')}

利润分析
--------
总收入: ${formatCurrency(result.revenue, 'USD')}
总成本: ${formatCurrency(result.totalCost, 'USD')}
净利润 (USD): ${formatCurrency(result.netProfitUSD, 'USD')}
净利润 (CNY): ${formatCurrency(result.netProfitCNY, 'CNY')}
利润率: ${formatPercentage(result.profitMargin)}
ROI: ${formatPercentage(result.roi)}
    `.trim();

    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板！');
  };

  const handleExportPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 标题
    doc.setFontSize(20);
    doc.text('FBA Fee Calculator Report', pageWidth / 2, 20, { align: 'center' });

    // 产品信息
    doc.setFontSize(14);
    doc.text('Product Information', 20, 40);
    doc.setFontSize(11);
    doc.text(`Product Name: ${formData.productName || 'N/A'}`, 20, 50);
    doc.text(`ASIN: ${formData.asin || 'N/A'}`, 20, 58);
    doc.text(`Category: ${formData.category}`, 20, 66);

    // 费用明细表格
    doc.setFontSize(14);
    doc.text('Fee Breakdown', 20, 85);

    autoTable(doc, {
      startY: 90,
      head: [['Fee Type', 'Amount (USD)']],
      body: [
        ['FBA Fulfillment Fee', formatCurrency(result.fulfillmentFee, 'USD')],
        ['Storage Fee', formatCurrency(result.storageFee, 'USD')],
        ['Sales Commission', formatCurrency(result.commission, 'USD')],
        ['Shipping Cost', formatCurrency(result.shippingCostUSD, 'USD')],
        ['Product Cost', formatCurrency(result.productCostUSD, 'USD')],
      ],
      theme: 'striped',
      headStyles: { fillColor: [0, 113, 227] },
    });

    // 利润分析
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Profit Analysis', 20, finalY);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Metric', 'Value']],
      body: [
        ['Revenue', formatCurrency(result.revenue, 'USD')],
        ['Total Cost', formatCurrency(result.totalCost, 'USD')],
        ['Net Profit (USD)', formatCurrency(result.netProfitUSD, 'USD')],
        ['Net Profit (CNY)', formatCurrency(result.netProfitCNY, 'CNY')],
        ['Profit Margin', formatPercentage(result.profitMargin)],
        ['ROI', formatPercentage(result.roi)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [0, 113, 227] },
    });

    // 保存 PDF
    doc.save('fba-fee-calculator-report.pdf');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 输入表单 */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">输入参数</h2>

        {/* 产品信息 */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-medium text-gray-800">产品信息</h3>

          <div>
            <label className="block text-sm text-gray-600 mb-1">产品名称（可选）</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              placeholder="例如：无线蓝牙耳机"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">ASIN（可选）</label>
            <input
              type="text"
              name="asin"
              value={formData.asin}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              placeholder="B0XXXXXXXX"
            />
          </div>
        </div>

        {/* 成本与定价 */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-medium text-gray-800">成本与定价</h3>

          <div>
            <label className="block text-sm text-gray-600 mb-1">产品成本 (CNY)</label>
            <input
              type="number"
              name="productCost"
              value={formData.productCost || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">亚马逊售价 (USD)</label>
            <input
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">头程运费 (CNY)</label>
            <input
              type="number"
              name="shippingCost"
              value={formData.shippingCost || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* 尺寸与重量 */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-medium text-gray-800">尺寸与重量</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">长度 (cm)</label>
              <input
                type="number"
                name="dim_length"
                value={formData.dimensions.length || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
                placeholder="0"
                min="0"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">宽度 (cm)</label>
              <input
                type="number"
                name="dim_width"
                value={formData.dimensions.width || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
                placeholder="0"
                min="0"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">高度 (cm)</label>
              <input
                type="number"
                name="dim_height"
                value={formData.dimensions.height || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
                placeholder="0"
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">重量 (g)</label>
            <input
              type="number"
              name="dim_weight"
              value={formData.dimensions.weight || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              placeholder="0"
              min="0"
              step="1"
              required
            />
          </div>
        </div>

        {/* 类目选择 */}
        <div className="mb-8">
          <label className="block text-sm text-gray-600 mb-2">类目</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
          >
            <option value="standard">标准类目 (15% 佣金)</option>
            <option value="clothing">服装配饰 (17% 佣金)</option>
            <option value="jewelry">珠宝手表 (20% 佣金)</option>
          </select>
        </div>

        {/* 计算按钮 */}
        <button
          onClick={handleCalculate}
          className="w-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[17px] font-semibold rounded-full px-8 py-4 transition-all duration-300"
        >
          计算费用
        </button>
      </div>

      {/* 计算结果 */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">计算结果</h2>

        {!result ? (
          <div className="flex items-center justify-center h-96 text-gray-400">
            <p>请输入参数并点击"计算费用"</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 饼图 */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">费用占比</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={result.feeBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {result.feeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value, 'USD')} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 费用明细 */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">费用明细 (USD)</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">FBA 配送费</span>
                  <span className="font-medium">{formatCurrency(result.fulfillmentFee, 'USD')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">仓储费（月度）</span>
                  <span className="font-medium">{formatCurrency(result.storageFee, 'USD')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">销售佣金</span>
                  <span className="font-medium">{formatCurrency(result.commission, 'USD')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">头程运费</span>
                  <span className="font-medium">{formatCurrency(result.shippingCostUSD, 'USD')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">产品成本</span>
                  <span className="font-medium">{formatCurrency(result.productCostUSD, 'USD')}</span>
                </div>
              </div>
            </div>

            {/* 利润分析 */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">利润分析</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">总收入</span>
                  <span className="font-medium">{formatCurrency(result.revenue, 'USD')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">总成本</span>
                  <span className="font-medium text-red-500">
                    -{formatCurrency(result.totalCost, 'USD')}
                  </span>
                </div>
                <div className="flex justify-between py-3 bg-gray-50 rounded-lg px-4">
                  <span className="font-semibold text-gray-800">净利润 (USD)</span>
                  <span
                    className={`font-bold text-lg ${
                      result.netProfitUSD >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(result.netProfitUSD, 'USD')}
                  </span>
                </div>
                <div className="flex justify-between py-2 bg-gray-50 rounded-lg px-4">
                  <span className="font-semibold text-gray-800">净利润 (CNY)</span>
                  <span
                    className={`font-bold ${
                      result.netProfitCNY >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(result.netProfitCNY, 'CNY')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">利润率</span>
                  <span
                    className={`font-medium ${
                      result.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatPercentage(result.profitMargin)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">ROI</span>
                  <span
                    className={`font-medium ${
                      result.roi >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatPercentage(result.roi)}
                  </span>
                </div>
              </div>
            </div>

            {/* 导出按钮 */}
            <div className="flex gap-4">
              <button
                onClick={handleCopy}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[15px] font-medium rounded-full px-6 py-3 transition-all duration-300"
              >
                复制结果
              </button>
              <button
                onClick={handleExportPDF}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[15px] font-medium rounded-full px-6 py-3 transition-all duration-300"
              >
                导出 PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
