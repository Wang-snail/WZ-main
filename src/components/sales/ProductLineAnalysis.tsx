
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export interface ProductLineData {
    id: string;
    name: string;
    forecast: {
        price: number;
        spu: number;
        monthlySales: number;
    };
    actual: {
        price: number;
        spu: number;
        monthlySales: number;
    };
}

interface ProductLineAnalysisProps {
    productLines: ProductLineData[];
    onProductLineChange: (id: string, type: 'forecast' | 'actual', field: keyof ProductLineData['forecast'], value: number) => void;
    targetSalesUsd: number;
}

const ProductLineAnalysis: React.FC<ProductLineAnalysisProps> = ({ productLines, onProductLineChange, targetSalesUsd }) => {
    const { t } = useTranslation();

    const calculateAnnual = (price: number, spu: number, monthly: number) => {
        return price * spu * monthly * 12;
    };

    const getStatus = (annualSales: number) => {
        // Status display logic
        if (annualSales >= targetSalesUsd * 10000) {
            return <Badge className="bg-green-600">{t('salesTarget.productLine.status.meet')}</Badge>;
        }
        const percentage = ((annualSales - targetSalesUsd * 10000) / (targetSalesUsd * 10000) * 100).toFixed(1);
        return <Badge variant="destructive">{t('salesTarget.productLine.status.below')} {Math.abs(parseFloat(percentage))}%</Badge>;
    };

    // Calculate totals
    const totals = productLines.reduce((acc, line) => {
        const forecastAnnual = calculateAnnual(line.forecast.price, line.forecast.spu, line.forecast.monthlySales);
        const actualAnnual = calculateAnnual(line.actual.price, line.actual.spu, line.actual.monthlySales);
        return {
            forecastSPU: acc.forecastSPU + line.forecast.spu,
            actualSPU: acc.actualSPU + line.actual.spu,
            forecastMonthly: acc.forecastMonthly + line.forecast.monthlySales,
            actualMonthly: acc.actualMonthly + line.actual.monthlySales,
            forecastAnnual: acc.forecastAnnual + forecastAnnual,
            actualAnnual: acc.actualAnnual + actualAnnual,
        };
    }, { forecastSPU: 0, actualSPU: 0, forecastMonthly: 0, actualMonthly: 0, forecastAnnual: 0, actualAnnual: 0 });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productLines.map((line) => {
                    const forecastAnnual = calculateAnnual(line.forecast.price, line.forecast.spu, line.forecast.monthlySales);
                    const actualAnnual = calculateAnnual(line.actual.price, line.actual.spu, line.actual.monthlySales);

                    return (
                        <Card key={line.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="py-3 bg-gray-50 border-b">
                                <CardTitle className="text-base font-bold text-gray-800">{line.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableBody>
                                        {/* Price Row */}
                                        <TableRow>
                                            <TableCell className="font-medium w-16 bg-gray-50">{t('salesTarget.productLine.price')}</TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">{t('salesTarget.productLine.forecast')}</div>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1.5 text-gray-500">$</span>
                                                    <Input
                                                        type="number"
                                                        className="pl-5 h-8 w-full border-blue-200 focus:ring-blue-500 text-center font-bold"
                                                        value={line.forecast.price}
                                                        onChange={(e) => onProductLineChange(line.id, 'forecast', 'price', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">{t('salesTarget.productLine.actual')}</div>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1.5 text-gray-500">$</span>
                                                    <Input
                                                        type="number"
                                                        className="pl-5 h-8 w-full border-green-200 focus:ring-green-500 text-center font-bold"
                                                        value={line.actual.price}
                                                        onChange={(e) => onProductLineChange(line.id, 'actual', 'price', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center w-24 bg-gray-50">
                                                <div className="text-xs text-gray-500 mb-1">{t('salesTarget.productLine.status.title')}</div>
                                                {getStatus(Math.max(forecastAnnual, actualAnnual))}
                                            </TableCell>
                                        </TableRow>

                                        {/* SPU Row */}
                                        <TableRow>
                                            <TableCell className="font-medium bg-gray-50">{t('salesTarget.productLine.spu')}</TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">{t('salesTarget.productLine.forecast')}</div>
                                                <Input
                                                    type="number"
                                                    className="h-8 w-full text-center font-bold"
                                                    value={line.forecast.spu}
                                                    onChange={(e) => onProductLineChange(line.id, 'forecast', 'spu', parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">{t('salesTarget.productLine.actual')}</div>
                                                <Input
                                                    type="number"
                                                    className="h-8 w-full text-center font-bold"
                                                    value={line.actual.spu}
                                                    onChange={(e) => onProductLineChange(line.id, 'actual', 'spu', parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell className="bg-gray-50"></TableCell>
                                        </TableRow>

                                        {/* Monthly Sales Row */}
                                        <TableRow>
                                            <TableCell className="font-medium bg-gray-50">{t('salesTarget.productLine.monthlySales')}</TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">{t('salesTarget.productLine.forecast')}</div>
                                                <Input
                                                    type="number"
                                                    className="h-8 w-full text-center font-bold"
                                                    value={line.forecast.monthlySales}
                                                    onChange={(e) => onProductLineChange(line.id, 'forecast', 'monthlySales', parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">{t('salesTarget.productLine.actual')}</div>
                                                <Input
                                                    type="number"
                                                    className="h-8 w-full text-center font-bold"
                                                    value={line.actual.monthlySales}
                                                    onChange={(e) => onProductLineChange(line.id, 'actual', 'monthlySales', parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell className="bg-gray-50"></TableCell>
                                        </TableRow>

                                        {/* Annual Sales Row */}
                                        <TableRow className="bg-muted/30">
                                            <TableCell className="font-medium bg-gray-100">{t('salesTarget.productLine.annualSales')}</TableCell>
                                            <TableCell className="text-center font-bold text-blue-700">
                                                <div className="text-xs text-gray-500 mb-1 font-normal">{t('salesTarget.productLine.forecast')}</div>
                                                ${forecastAnnual.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-green-700">
                                                <div className="text-xs text-gray-500 mb-1 font-normal">{t('salesTarget.productLine.actual')}</div>
                                                ${actualAnnual.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-center bg-gray-100">
                                                {getStatus(actualAnnual)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-blue-50 via-white to-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-center text-blue-800">{t('salesTarget.productLine.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap justify-around text-center gap-4">
                        <div>
                            <div className="text-sm text-gray-500">{t('salesTarget.productLine.forecast')} {t('salesTarget.productLine.spu')}</div>
                            <div className="text-xl font-bold">{totals.forecastSPU}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">{t('salesTarget.productLine.actual')} {t('salesTarget.productLine.spu')}</div>
                            <div className="text-xl font-bold">{totals.actualSPU}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">{t('salesTarget.productLine.forecast')} {t('salesTarget.productLine.monthlySales')}</div>
                            <div className="text-xl font-bold">{totals.forecastMonthly.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">{t('salesTarget.productLine.actual')} {t('salesTarget.productLine.monthlySales')}</div>
                            <div className="text-xl font-bold">{totals.actualMonthly.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-2 rounded shadow-sm border border-blue-100">
                            <div className="text-sm text-blue-600 font-medium">{t('salesTarget.productLine.forecast')} {t('salesTarget.productLine.annualSales')}</div>
                            <div className="text-2xl font-bold text-blue-700">${totals.forecastAnnual.toLocaleString()}</div>
                            <div className="mt-1">{getStatus(totals.forecastAnnual)}</div>
                        </div>
                        <div className="bg-white p-2 rounded shadow-sm border border-blue-100">
                            <div className="text-sm text-green-600 font-medium">{t('salesTarget.productLine.actual')} {t('salesTarget.productLine.annualSales')}</div>
                            <div className="text-2xl font-bold text-green-700">${totals.actualAnnual.toLocaleString()}</div>
                            <div className="mt-1">{getStatus(totals.actualAnnual)}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductLineAnalysis;
