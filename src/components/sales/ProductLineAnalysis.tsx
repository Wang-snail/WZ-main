
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

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
    onProductLineNameChange: (id: string, newName: string) => void;
    onAddProductLine: () => void;
    onDeleteProductLine: (id: string) => void;
    targetSalesUsd: number;
}

const ProductLineAnalysis: React.FC<ProductLineAnalysisProps> = ({
    productLines,
    onProductLineChange,
    onProductLineNameChange,
    onAddProductLine,
    onDeleteProductLine,
    targetSalesUsd
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const calculateAnnual = (price: number, spu: number, monthly: number) => {
        return price * spu * monthly * 12;
    };

    const startEditing = (line: ProductLineData) => {
        setEditingId(line.id);
        setEditName(line.name);
    };

    const saveName = (id: string) => {
        if (editName.trim()) {
            onProductLineNameChange(id, editName.trim());
        }
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const getStatus = (annualSales: number) => {
        if (annualSales >= targetSalesUsd * 10000) {
            return <Badge className="bg-green-600">达标</Badge>;
        }
        const percentage = ((annualSales - targetSalesUsd * 10000) / (targetSalesUsd * 10000) * 100).toFixed(1);
        return <Badge variant="destructive">不足 {Math.abs(parseFloat(percentage))}%</Badge>;
    };

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
                                <div className="flex items-center justify-between gap-2">
                                    {editingId === line.id ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-8 text-sm flex-1"
                                                placeholder="输入品线名称"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveName(line.id);
                                                    if (e.key === 'Escape') cancelEdit();
                                                }}
                                            />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-green-600"
                                                onClick={() => saveName(line.id)}
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-red-600"
                                                onClick={cancelEdit}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <CardTitle className="text-base font-bold text-gray-800">{line.name}</CardTitle>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-gray-500"
                                                    onClick={() => startEditing(line)}
                                                    title="编辑名称"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => onDeleteProductLine(line.id)}
                                                    title="删除品线"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium w-16 bg-gray-50">价格</TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">预期</div>
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
                                                {getStatus(Math.max(forecastAnnual, actualAnnual))}
                                            </TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell className="font-medium bg-gray-50">SPU</TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">预期</div>
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

                                        <TableRow>
                                            <TableCell className="font-medium bg-gray-50">月销量</TableCell>
                                            <TableCell className="p-2">
                                                <div className="text-xs text-gray-500 mb-1">预期</div>
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

                                        <TableRow className="bg-muted/30">
                                            <TableCell className="font-medium bg-gray-100">年销售额</TableCell>
                                            <TableCell className="text-center font-bold text-blue-700">
                                                <div className="text-xs text-gray-500 mb-1 font-normal">预期</div>
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

            {/* 添加新品线按钮 */}
            <Button
                onClick={onAddProductLine}
                variant="outline"
                className="w-full py-8 border-dashed border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
            >
                <Plus className="w-5 h-5 mr-2" />
                添加新品线
            </Button>

            <Card className="bg-gradient-to-r from-blue-50 via-white to-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-center text-blue-800">产品线汇总</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap justify-around text-center gap-4">
                        <div>
                            <div className="text-sm text-gray-500">预期 SPU</div>
                            <div className="text-xl font-bold">{totals.forecastSPU}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">实际 SPU</div>
                            <div className="text-xl font-bold">{totals.actualSPU}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">预期月销</div>
                            <div className="text-xl font-bold">{totals.forecastMonthly.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">实际月销</div>
                            <div className="text-xl font-bold">{totals.actualMonthly.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-2 rounded shadow-sm border border-blue-100">
                            <div className="text-sm text-blue-600 font-medium">预期年销售额</div>
                            <div className="text-2xl font-bold text-blue-700">${totals.forecastAnnual.toLocaleString()}</div>
                            <div className="mt-1">{getStatus(totals.forecastAnnual)}</div>
                        </div>
                        <div className="bg-white p-2 rounded shadow-sm border border-blue-100">
                            <div className="text-sm text-green-600 font-medium">实际年销售额</div>
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
