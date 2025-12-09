
import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface CostStructure {
    product: number;
    logistics: number;
    advertising: number;
    shipping: number;
    commission: number;
    returns: number;
    other: number;
    profit: number;
}

interface CostAnalysisProps {
    costStructure: CostStructure;
    onCostChange: (newCosts: CostStructure) => void;
}

const CostAnalysis: React.FC<CostAnalysisProps> = ({ costStructure, onCostChange }) => {
    const { t } = useTranslation();

    const chartData: ChartData<'pie'> = useMemo(() => {
        return {
            labels: [
                t('salesTarget.costAnalysis.productCost'),
                t('salesTarget.costAnalysis.logisticsCost'),
                t('salesTarget.costAnalysis.adCost'),
                t('salesTarget.costAnalysis.shippingCost'),
                t('salesTarget.costAnalysis.commission'),
                t('salesTarget.costAnalysis.returns'),
                t('salesTarget.costAnalysis.otherCost'),
                t('salesTarget.costAnalysis.profit'),
            ],
            datasets: [
                {
                    data: [
                        costStructure.product,
                        costStructure.logistics,
                        costStructure.advertising,
                        costStructure.shipping,
                        costStructure.commission,
                        costStructure.returns,
                        costStructure.other,
                        costStructure.profit,
                    ],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 105, 180, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(201, 203, 207, 0.8)',
                        'rgba(50, 205, 50, 0.8)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 105, 180, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(201, 203, 207, 1)',
                        'rgba(50, 205, 50, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [costStructure, t]);

    const handleInputChange = (field: keyof CostStructure, value: number) => {
        // Ensure value is non-negative
        const newValue = Math.max(0, value);

        // Calculate new total costs excluding profit
        const currentCostsMinusProfit =
            (field === 'product' ? newValue : costStructure.product) +
            (field === 'logistics' ? newValue : costStructure.logistics) +
            (field === 'advertising' ? newValue : costStructure.advertising) +
            (field === 'shipping' ? newValue : costStructure.shipping) +
            (field === 'commission' ? newValue : costStructure.commission) +
            (field === 'returns' ? newValue : costStructure.returns) +
            (field === 'other' ? newValue : costStructure.other);

        // Calculate new profit (100 - costs)
        const newProfit = Math.max(0, 100 - currentCostsMinusProfit);

        onCostChange({
            ...costStructure,
            [field]: newValue,
            profit: newProfit,
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Chart Area */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('salesTarget.costAnalysis.title')}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center h-[400px]">
                    <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                </CardContent>
            </Card>

            {/* Inputs Area */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('salesTarget.costAnalysis.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('salesTarget.costAnalysis.productCost')} (%)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={costStructure.product}
                                onChange={(e) => handleInputChange('product', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('salesTarget.costAnalysis.logisticsCost')} (%)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={costStructure.logistics}
                                onChange={(e) => handleInputChange('logistics', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('salesTarget.costAnalysis.adCost')} (%)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={costStructure.advertising}
                                onChange={(e) => handleInputChange('advertising', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('salesTarget.costAnalysis.shippingCost')} (%)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={costStructure.shipping}
                                onChange={(e) => handleInputChange('shipping', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('salesTarget.costAnalysis.commission')} (%)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={costStructure.commission}
                                onChange={(e) => handleInputChange('commission', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('salesTarget.costAnalysis.returns')} (%)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={costStructure.returns}
                                onChange={(e) => handleInputChange('returns', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('salesTarget.costAnalysis.otherCost')} (%)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={costStructure.other}
                                onChange={(e) => handleInputChange('other', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-green-600 font-bold">{t('salesTarget.costAnalysis.profit')} (%)</Label>
                            <Input
                                type="number"
                                readOnly
                                value={costStructure.profit.toFixed(2)}
                                className="bg-green-50 font-bold text-green-700"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-between font-bold">
                        <span>{t('salesTarget.costAnalysis.totalCheck')}</span>
                        <span>100%</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CostAnalysis;
