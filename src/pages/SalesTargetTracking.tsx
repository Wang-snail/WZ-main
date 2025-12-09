
import React, { useState, useEffect } from 'react';
import TargetOverview from '@/components/sales/TargetOverview';
import CostAnalysis, { CostStructure } from '@/components/sales/CostAnalysis';
import ProductLineAnalysis, { ProductLineData } from '@/components/sales/ProductLineAnalysis';
import { useTranslation } from 'react-i18next';

const SalesTargetTracking: React.FC = () => {
    const { t } = useTranslation();
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

    // 3. Product Line State
    const [productLines, setProductLines] = useState<ProductLineData[]>([
        {
            id: 'steel',
            name: '🏗️ 钢木品线',
            forecast: { price: 65, spu: 8, monthlySales: 500 },
            actual: { price: 60, spu: 5, monthlySales: 350 },
        },
        {
            id: 'bracket',
            name: '📺 支架品线',
            forecast: { price: 35, spu: 12, monthlySales: 800 },
            actual: { price: 32, spu: 9, monthlySales: 650 },
        },
        {
            id: 'plastic',
            name: '🔧 注塑品线',
            forecast: { price: 25, spu: 15, monthlySales: 1200 },
            actual: { price: 23, spu: 11, monthlySales: 900 },
        },
        {
            id: 'plant',
            name: '🌿 仿真植物品线',
            forecast: { price: 18, spu: 20, monthlySales: 1500 },
            actual: { price: 16, spu: 15, monthlySales: 1100 },
        },
    ]);

    // --- Calculations & Event Handlers ---

    // Sync Direction Logic - similar to original JS
    // Instead of complex cycle detection, we use specific setters that trigger downstream updates
    // But React state updates are scheduled, so we need to be careful.
    // We will perform calculations immediately in handlers.

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
        // When rate changes, generally we keep CNY stable and update USD, or vice versa?
        // Project rule: "Re-calculate all from CNY" usually.
        if (val > 0) {
            setUsdTargetSales(parseFloat((cnyTargetSales / val).toFixed(2)));
            setUsdTargetProfit(parseFloat((cnyTargetProfit / val).toFixed(2)));
        }
    };

    const handleCostStructureChange = (newCosts: CostStructure) => {
        setCostStructure(newCosts);

        // Profit Rate changed, so Profit Amount should change (Sales stays constant)
        // Rule from JS: "Profit Rate Change -> Adjust Profit"
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

    return (
        <div className="container mx-auto p-4 max-w-7xl animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                {t('salesTarget.title')}
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
                <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-500 pl-4">{t('salesTarget.productLine.title')}</h2>
                <ProductLineAnalysis
                    productLines={productLines}
                    onProductLineChange={handleProductLineChange}
                    targetSalesUsd={usdTargetSales}
                />
            </div>
        </div>
    );
};

export default SalesTargetTracking;
