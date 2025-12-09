
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TargetOverviewProps {
    cnyTargetSales: number;
    cnyTargetProfit: number;
    usdTargetSales: number;
    usdTargetProfit: number;
    exchangeRate: number;
    successRate: number;
    profitRate: number;
    onCnyTargetSalesChange: (value: number) => void;
    onCnyTargetProfitChange: (value: number) => void;
    onUsdTargetSalesChange: (value: number) => void;
    onUsdTargetProfitChange: (value: number) => void;
    onExchangeRateChange: (value: number) => void;
    onSuccessRateChange: (value: number) => void;
}

const TargetOverview: React.FC<TargetOverviewProps> = ({
    cnyTargetSales,
    cnyTargetProfit,
    usdTargetSales,
    usdTargetProfit,
    exchangeRate,
    successRate,
    profitRate,
    onCnyTargetSalesChange,
    onCnyTargetProfitChange,
    onUsdTargetSalesChange,
    onUsdTargetProfitChange,
    onExchangeRateChange,
    onSuccessRateChange,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* CNY Area */}
            <Card className="bg-gradient-to-br from-red-50 to-white border-red-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-red-800 flex items-center gap-2">
                        🇨🇳 人民币区域
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cnyTargetSales" className="text-red-700">目标销售额 (万元)</Label>
                        <Input
                            id="cnyTargetSales"
                            type="number"
                            value={cnyTargetSales}
                            onChange={(e) => onCnyTargetSalesChange(parseFloat(e.target.value) || 0)}
                            className="border-red-200 focus:ring-red-500 bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cnyTargetProfit" className="text-red-700">目标利润 (万元)</Label>
                        <Input
                            id="cnyTargetProfit"
                            type="number"
                            value={cnyTargetProfit}
                            onChange={(e) => onCnyTargetProfitChange(parseFloat(e.target.value) || 0)}
                            className="border-red-200 focus:ring-red-500 bg-white"
                        />
                    </div>
                    <div className="pt-2 border-t border-red-100 flex justify-between items-center">
                        <span className="text-sm text-red-600 font-medium">利润率</span>
                        <span className="text-xl font-bold text-red-700">{profitRate.toFixed(2)}%</span>
                    </div>
                </CardContent>
            </Card>

            {/* USD Area */}
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                        🇺🇸 美元区域
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="usdTargetSales" className="text-blue-700">目标销售额 (万美元)</Label>
                        <Input
                            id="usdTargetSales"
                            type="number"
                            value={usdTargetSales}
                            onChange={(e) => onUsdTargetSalesChange(parseFloat(e.target.value) || 0)}
                            className="border-blue-200 focus:ring-blue-500 bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="usdTargetProfit" className="text-blue-700">目标利润 (万美元)</Label>
                        <Input
                            id="usdTargetProfit"
                            type="number"
                            value={usdTargetProfit}
                            onChange={(e) => onUsdTargetProfitChange(parseFloat(e.target.value) || 0)}
                            className="border-blue-200 focus:ring-blue-500 bg-white"
                        />
                    </div>
                    <div className="pt-2 border-t border-blue-100 flex justify-between items-center">
                        <span className="text-sm text-blue-600 font-medium">利润率</span>
                        <span className="text-xl font-bold text-blue-700">{profitRate.toFixed(2)}%</span>
                    </div>
                </CardContent>
            </Card>

            {/* Parameters Area */}
            <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        ⚙️ 关键参数
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="exchangeRate" className="text-gray-700">汇率</Label>
                        <Input
                            id="exchangeRate"
                            type="number"
                            step="0.01"
                            value={exchangeRate}
                            onChange={(e) => onExchangeRateChange(parseFloat(e.target.value) || 0)}
                            className="border-gray-200 focus:ring-gray-500 bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="successRate" className="text-gray-700">成功率 (%)</Label>
                        <Input
                            id="successRate"
                            type="number"
                            step="0.1"
                            value={successRate}
                            onChange={(e) => onSuccessRateChange(parseFloat(e.target.value) || 0)}
                            className="border-gray-200 focus:ring-gray-500 bg-white"
                        />
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">实际利润率</span>
                        <span className="text-xl font-bold text-gray-700">{profitRate.toFixed(2)}%</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TargetOverview;
