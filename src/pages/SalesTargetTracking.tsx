
import React, { useState } from 'react';
import TargetOverview from '@/components/sales/TargetOverview';
import CostAnalysis, { CostStructure } from '@/components/sales/CostAnalysis';
import ProductLineAnalysis, { ProductLineData } from '@/components/sales/ProductLineAnalysis';

// 生成唯一ID
const generateId = () => `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const SalesTargetTracking: React.FC = () => {
    // --- State Configuration ---

    // 1. Overview State
    const [cnyTargetSales, setCnyTargetSales] = useState(50000);
    const [cnyTargetProfit, setCnyTargetProfit] = useState(11500);
    const [usdTargetSales, setUsdTargetSales] = useState(7013);
    const [usdTargetProfit, setUsdTargetProfit] = useState(1605);
    const [exchangeRate, setExchangeRate] = useState(7.23);
    const [successRate, setSuccessRate] = useState(100);

    // 2. Cost Analysis State
    const [costStructure, setCostStructure] = useState<CostStructure>({
        product: 22,
        logistics: 20,
        advertising: 10,
        shipping: 8,
        commission: 15,
        returns: 1,
        other: 1,
        profit: 23,
    });

    // 3. Product Line State - 默认只有"宠物家具"一个品线
    const [productLines, setProductLines] = useState<ProductLineData[]>([
        {
            id: generateId(),
            name: '🐾 宠物家具',
            forecast: { price: 50, spu: 10, monthlySales: 500 },
            actual: { price: 48, spu: 8, monthlySales: 400 },
        },
    ]);

    // --- Calculations & Event Handlers ---

    const handleCnyTargetSalesChange = (val: number) => {
        setCnyTargetSales(val);
        const profit = val * (costStructure.profit / 100);
        setCnyTargetProfit(parseFloat(profit.toFixed(2)));

        // Sync USD
        setUsdTargetSales(parseFloat((val / exchangeRate).toFixed(2)));
        setUsdTargetProfit(parseFloat((profit / exchangeRate).toFixed(2)));
    };

    const handleCnyTargetProfitChange = (val: number) => {
        setCnyTargetProfit(val);
        if (costStructure.profit > 0) {
            const sales = val / (costStructure.profit / 100);
            setCnyTargetSales(parseFloat(sales.toFixed(2)));

            // Sync USD
            setUsdTargetSales(parseFloat((sales / exchangeRate).toFixed(2)));
            setUsdTargetProfit(parseFloat((val / exchangeRate).toFixed(2)));
        }
    };

    const handleUsdTargetSalesChange = (val: number) => {
        setUsdTargetSales(val);
        const cnySales = val * exchangeRate;
        setCnyTargetSales(parseFloat(cnySales.toFixed(2)));

        // Recalculate profits based on rate
        const cnyProfit = cnySales * (costStructure.profit / 100);
        setCnyTargetProfit(parseFloat(cnyProfit.toFixed(2)));
        setUsdTargetProfit(parseFloat((cnyProfit / exchangeRate).toFixed(2)));
    };

    const handleUsdTargetProfitChange = (val: number) => {
        setUsdTargetProfit(val);
        const cnyProfit = val * exchangeRate;
        setCnyTargetProfit(parseFloat(cnyProfit.toFixed(2)));

        // Recalculate sales if possible
        if (costStructure.profit > 0) {
            const cnySales = cnyProfit / (costStructure.profit / 100);
            setCnyTargetSales(parseFloat(cnySales.toFixed(2)));
            setUsdTargetSales(parseFloat((cnySales / exchangeRate).toFixed(2)));
        }
    };

    const handleExchangeRateChange = (val: number) => {
        setExchangeRate(val);
        if (val > 0) {
            setUsdTargetSales(parseFloat((cnyTargetSales / val).toFixed(2)));
            setUsdTargetProfit(parseFloat((cnyTargetProfit / val).toFixed(2)));
        }
    };

    const handleCostStructureChange = (newCosts: CostStructure) => {
        setCostStructure(newCosts);

        const newProfitRate = newCosts.profit;
        const newCnyProfit = cnyTargetSales * (newProfitRate / 100);

        setCnyTargetProfit(parseFloat(newCnyProfit.toFixed(2)));
        setUsdTargetProfit(parseFloat((newCnyProfit / exchangeRate).toFixed(2)));
    };

    const handleProductLineChange = (id: string, type: 'forecast' | 'actual', field: keyof ProductLineData['forecast'], value: number) => {
        setProductLines(prev => prev.map(line => {
            if (line.id === id) {
                return {
                    ...line,
                    [type]: {
                        ...line[type],
                        [field]: value
                    }
                };
            }
            return line;
        }));
    };

    // 添加新品线
    const handleAddProductLine = () => {
        const newLine: ProductLineData = {
            id: generateId(),
            name: '📦 新品线',
            forecast: { price: 50, spu: 5, monthlySales: 300 },
            actual: { price: 48, spu: 4, monthlySales: 250 },
        };
        setProductLines(prev => [...prev, newLine]);
    };

    // 删除品线
    const handleDeleteProductLine = (id: string) => {
        setProductLines(prev => prev.filter(line => line.id !== id));
    };

    // 修改品线名称
    const handleProductLineNameChange = (id: string, newName: string) => {
        setProductLines(prev => prev.map(line =>
            line.id === id ? { ...line, name: newName } : line
        ));
    };

    return (
        <div className="container mx-auto p-4 max-w-7xl animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                销售目标跟踪
            </h1>

            {/* 1. Overview */}
            <TargetOverview
                cnyTargetSales={cnyTargetSales}
                cnyTargetProfit={cnyTargetProfit}
                usdTargetSales={usdTargetSales}
                usdTargetProfit={usdTargetProfit}
                exchangeRate={exchangeRate}
                successRate={successRate}
                profitRate={costStructure.profit}
                onCnyTargetSalesChange={handleCnyTargetSalesChange}
                onCnyTargetProfitChange={handleCnyTargetProfitChange}
                onUsdTargetSalesChange={handleUsdTargetSalesChange}
                onUsdTargetProfitChange={handleUsdTargetProfitChange}
                onExchangeRateChange={handleExchangeRateChange}
                onSuccessRateChange={setSuccessRate}
            />

            {/* 2. Cost Analysis */}
            <CostAnalysis
                costStructure={costStructure}
                onCostChange={handleCostStructureChange}
            />

            {/* 3. Product Line Analysis */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-500 pl-4">产品线分析</h2>
                <ProductLineAnalysis
                    productLines={productLines}
                    onProductLineChange={handleProductLineChange}
                    onProductLineNameChange={handleProductLineNameChange}
                    onAddProductLine={handleAddProductLine}
                    onDeleteProductLine={handleDeleteProductLine}
                    targetSalesUsd={usdTargetSales}
                />
            </div>
        </div>
    );
};

export default SalesTargetTracking;
