import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Download, Upload, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProcurementQuotation, ViewConfig } from '@/types/procurementTypes';
import { ProcurementService } from '@/services/procurementService';
import { ProcurementForm } from '@/components/features/ProcurementForm';
import SEOHead from '@/components/common/SEOHead';
import toast from 'react-hot-toast';

const ProcurementTablePage: React.FC = () => {
    const [quotations, setQuotations] = useState<ProcurementQuotation[]>([]);
    const [views, setViews] = useState<ViewConfig[]>([]);
    const [currentViewId, setCurrentViewId] = useState('default');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            const data = ProcurementService.loadAll();
            setQuotations(data.quotations);
            setViews(data.views);
            setCurrentViewId(data.currentViewId);
        } catch (error) {
            console.error('加载数据失败:', error);
            toast.error('加载数据失败');
        } finally {
            setLoading(false);
        }
    };

    const currentView = useMemo(() => {
        return views.find(v => v.id === currentViewId) || views[0];
    }, [views, currentViewId]);

    const filteredQuotations = useMemo(() => {
        let filtered = [...quotations];

        // 搜索筛选
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(q =>
                q.productName.toLowerCase().includes(query) ||
                q.supplierName.toLowerCase().includes(query) ||
                q.brand.toLowerCase().includes(query)
            );
        }

        // 应用视图筛选
        if (currentView?.filters) {
            filtered = filtered.filter(q => {
                return currentView.filters!.every(filter => {
                    const value = (q as any)[filter.field];
                    switch (filter.operator) {
                        case 'equals':
                            return value === filter.value;
                        case 'contains':
                            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                        case 'greaterThan':
                            return Number(value) > Number(filter.value);
                        case 'lessThan':
                            return Number(value) < Number(filter.value);
                        default:
                            return true;
                    }
                });
            });
        }

        return filtered;
    }, [quotations, searchQuery, currentView]);

    const groupedData = useMemo(() => {
        if (!currentView?.groupBy || currentView.groupBy === 'none') {
            return { ungrouped: filteredQuotations };
        }

        const groups: Record<string, ProcurementQuotation[]> = {};

        filteredQuotations.forEach(q => {
            let key = '';
            switch (currentView.groupBy) {
                case 'product':
                    key = q.productName;
                    break;
                case 'supplier':
                    key = q.supplierName;
                    break;
                case 'category':
                    key = q.category;
                    break;
                default:
                    key = 'ungrouped';
            }

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(q);
        });

        return groups;
    }, [filteredQuotations, currentView]);

    const handleDelete = (id: string) => {
        if (window.confirm('确定要删除这条报价单吗？')) {
            try {
                ProcurementService.deleteQuotation(id);
                loadData();
                toast.success('删除成功');
            } catch (error) {
                toast.error('删除失败');
            }
        }
    };

    const handleExport = () => {
        try {
            const dataStr = JSON.stringify(quotations, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `procurement-quotations-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('导出成功');
        } catch (error) {
            toast.error('导出失败');
        }
    };

    const handleAddQuotation = (data: Omit<ProcurementQuotation, 'id' | 'calculated' | 'createdAt' | 'updatedAt'>) => {
        try {
            ProcurementService.addQuotation(data);
            loadData();
            setShowAddForm(false);
            toast.success('添加成功！');
        } catch (error) {
            toast.error('添加失败，请重试');
            console.error('添加报价失败:', error);
        }
    };

    const formatCurrency = (value: number, currency: 'CNY' | 'USD' = 'CNY') => {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
        }).format(value);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEOHead
                title="采购寻源报价单 - 多维表格 | wsnail.com"
                description="智能采购寻源报价单管理系统，支持多维度数据分组、自动计算成本利润、供应商比价分析"
                keywords="采购报价单,供应商管理,成本计算,利润分析,多维表格"
                url="https://wsnail.com/procurement-quotation"
            />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* 头部 */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">采购寻源报价单 <span className="text-sm font-normal opacity-70">v1.1</span></h1>
                                <p className="text-blue-100">智能多维表格 · 自动计算 · 供应商比价</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        console.log('Clicked Add Quotation');
                                        setShowAddForm(true);
                                    }}
                                    className="bg-white text-primary hover:bg-blue-50"
                                >
                                    <Plus size={20} className="mr-2" />
                                    添加报价
                                </Button>
                                <Button
                                    onClick={handleExport}
                                    variant="outline"
                                    className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                                >
                                    <Download size={20} className="mr-2" />
                                    导出
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* 工具栏 */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                {/* 搜索 */}
                                <div className="flex-1 relative w-full">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <Input
                                        placeholder="搜索产品名称、供应商、品牌..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* 视图切换 */}
                                <div className="flex gap-2 flex-wrap">
                                    {views.map(view => (
                                        <Button
                                            key={view.id}
                                            variant={currentViewId === view.id ? 'default' : 'outline'}
                                            onClick={() => setCurrentViewId(view.id)}
                                            size="sm"
                                        >
                                            {view.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 统计卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">总报价数</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{quotations.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">供应商数量</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">
                                    {new Set(quotations.map(q => q.supplierName)).size}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">平均利润率</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">
                                    {quotations.length > 0
                                        ? (quotations.reduce((sum, q) => sum + q.calculated.profitMargin, 0) / quotations.length).toFixed(1)
                                        : 0}%
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">筛选结果</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-600">{filteredQuotations.length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 数据表格 */}
                    {Object.entries(groupedData).map(([groupName, items]) => (
                        <Card key={groupName} className="mb-6">
                            {groupName !== 'ungrouped' && (
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {groupName}
                                        <Badge variant="secondary">{items.length} 条</Badge>
                                    </CardTitle>
                                </CardHeader>
                            )}
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="px-4 py-3 text-left text-sm font-semibold">产品名称</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">供应商</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">报价(¥)</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">售价($)</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">利润($)</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">利润率</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">MOQ</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">交期</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(quotation => (
                                                <tr key={quotation.id} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium">{quotation.productName}</td>
                                                    <td className="px-4 py-3 text-sm">{quotation.supplierName}</td>
                                                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(quotation.quotePriceRMB, 'CNY')}</td>
                                                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(quotation.salePrice, 'USD')}</td>
                                                    <td className={`px-4 py-3 text-sm text-right font-semibold ${quotation.calculated.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatCurrency(quotation.calculated.profit, 'USD')}
                                                    </td>
                                                    <td className={`px-4 py-3 text-sm text-right font-semibold ${quotation.calculated.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {quotation.calculated.profitMargin.toFixed(1)}%
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-center">{quotation.moq}</td>
                                                    <td className="px-4 py-3 text-sm text-center">{quotation.leadTime}</td>
                                                    <td className="px-4 py-3 text-sm text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(quotation.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            删除
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredQuotations.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-gray-600">暂无数据，点击"添加报价"开始使用</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* 添加报价表单 */}
            {showAddForm && (
                <ProcurementForm
                    onSave={handleAddQuotation}
                    onCancel={() => setShowAddForm(false)}
                />
            )}
        </>
    );
};

export default ProcurementTablePage;
