
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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

    const calculateAnnual = (price: number, spu: number, monthly: number) => {
        return price * spu * monthly * 12;
    };

    const getStatus = (annualSales: number) => {
        // This logic might need refinement based on exact requirements, 
        // simply comparing to total target might not be right for individual lines if they aren't meant to meet the FULL target alone.
        // However, the original code compared each line to the total USD target? That seems aggressive.
        // Re-reading original `currencyCalculator.js`: 
        // `compareProductLineSalesWithTarget` compares `forecastAnnual` vs `targetSales`.

        // NOTE: The original logic compares EACH line's annual sales to the TOTAL target sales.
        // If that's the intended logic, we keep it.

        // Status display logic
        if (annualSales >= targetSalesUsd * 10000) {
            return <Badge className="bg-green-600">达到目标</Badge>;
        }
        const percentage = ((annualSales - targetSalesUsd * 10000) / (targetSalesUsd * 10000) * 100).toFixed(1);
        return <Badge variant="destructive">低于目标 {Math.abs(parseFloat(percentage))}%</Badge>;
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
                                            <TableCell className="font-medium w-16 bg-gray-50">单价</TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">预测</div>
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
                                                <div className="text-xs text-gray-500 mb-1">实际</div>
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
                                                <div className="text-xs text-gray-500 mb-1">状态</div>
                                                {getStatus(Math.max(forecastAnnual, actualAnnual))} {/* Simplified status just to show something */}
                                            </TableCell>
                                        </TableRow>

                                        {/* SPU Row */}
                                        <TableRow>
                                            <TableCell className="font-medium bg-gray-50">SPU数</TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">预测</div>
                                                <Input
                                                    type="number"
                                                    className="h-8 w-full text-center font-bold"
                                                    value={line.forecast.spu}
                                                    onChange={(e) => onProductLineChange(line.id, 'forecast', 'spu', parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">实际</div>
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
                                            <TableCell className="font-medium bg-gray-50">月销量</TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">预测</div>
                                                <Input
                                                    type="number"
                                                    className="h-8 w-full text-center font-bold"
                                                    value={line.forecast.monthlySales}
                                                    onChange={(e) => onProductLineChange(line.id, 'forecast', 'monthlySales', parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">实际</div>
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
                                            <TableCell className="font-medium bg-gray-100">年销售额</TableCell>
                                            <TableCell className="text-center font-bold text-blue-700">
                                                <div className="text-xs text-gray-500 mb-1 font-normal">预测</div>
                                                ${forecastAnnual.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-green-700">
                                                <div className="text-xs text-gray-500 mb-1 font-normal">实际</div>
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
                    <CardTitle className="text-center text-blue-800">品线汇总</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap justify-around text-center gap-4">
                        <div>
                            <div className="text-sm text-gray-500">预测总SPU</div>
                            <div className="text-xl font-bold">{totals.forecastSPU}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">实际总SPU</div>
                            <div className="text-xl font-bold">{totals.actualSPU}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">预测总月销量</div>
                            <div className="text-xl font-bold">{totals.forecastMonthly.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">实际总月销量</div>
                            <div className="text-xl font-bold">{totals.actualMonthly.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-2 rounded shadow-sm border border-blue-100">
                            <div className="text-sm text-blue-600 font-medium">预测总年销售额</div>
                            <div className="text-2xl font-bold text-blue-700">${totals.forecastAnnual.toLocaleString()}</div>
                            <div className="mt-1">{getStatus(totals.forecastAnnual)}</div>
                        </div>
                        <div className="bg-white p-2 rounded shadow-sm border border-blue-100">
                            <div className="text-sm text-green-600 font-medium">实际总年销售额</div>
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
