import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcurementQuotation } from '@/types/procurementTypes';

interface ProcurementFormProps {
    onSave: (data: Omit<ProcurementQuotation, 'id' | 'calculated' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
    initialData?: ProcurementQuotation;
}

export const ProcurementForm: React.FC<ProcurementFormProps> = ({
    onSave,
    onCancel,
    initialData,
}) => {
    const [formData, setFormData] = useState({
        // 基本信息
        brand: initialData?.brand || '',
        requester: initialData?.requester || '',
        submitDate: initialData?.submitDate || new Date().toISOString().split('T')[0],
        productName: initialData?.productName || '',
        productNameEn: initialData?.productNameEn || '',
        referenceImage: initialData?.referenceImage || '',
        adjustments: initialData?.adjustments || '',
        salePrice: initialData?.salePrice || 0,

        // 产品规格
        length: initialData?.length || 0,
        width: initialData?.width || 0,
        height: initialData?.height || 0,
        packagingMethod: initialData?.packagingMethod || '',
        certification: initialData?.certification || '',
        expectedQuantity: initialData?.expectedQuantity || 0,
        category: initialData?.category || '',
        competitor: initialData?.competitor || '',
        expectedUnitPrice: initialData?.expectedUnitPrice || 0,

        // 供应商信息
        quoter: initialData?.quoter || '',
        quoteDate: initialData?.quoteDate || new Date().toISOString().split('T')[0],
        supplierName: initialData?.supplierName || '',
        productImage: initialData?.productImage || '',
        quotePriceRMB: initialData?.quotePriceRMB || 0,
        purchasePriceUSD: initialData?.purchasePriceUSD || 0,
        moq: initialData?.moq || 0,
        leadTime: initialData?.leadTime || '',
        material: initialData?.material || '',

        // 包装尺寸 - 彩盒
        colorBoxLength: initialData?.colorBoxLength || 0,
        colorBoxWidth: initialData?.colorBoxWidth || 0,
        colorBoxHeight: initialData?.colorBoxHeight || 0,
        colorBoxWeight: initialData?.colorBoxWeight || 0,

        // 包装尺寸 - 外箱
        outerBoxLength: initialData?.outerBoxLength || 0,
        outerBoxWidth: initialData?.outerBoxWidth || 0,
        outerBoxHeight: initialData?.outerBoxHeight || 0,
        outerBoxWeight: initialData?.outerBoxWeight || 0,
        packingQuantity: initialData?.packingQuantity || 0,

        // 供应商详情
        supplierAddress: initialData?.supplierAddress || '',
        website: initialData?.website || '',
        productLink: initialData?.productLink || '',
        companyScale: initialData?.companyScale || '',
        capacity: initialData?.capacity || '',
        staffing: initialData?.staffing || '',
        intellectualProperty: initialData?.intellectualProperty || '',
        annualNewProducts: initialData?.annualNewProducts || 0,
        mainProducts: initialData?.mainProducts || '',

        // 采购意见
        purchaseOpinion: initialData?.purchaseOpinion || '',
        otherInfo: initialData?.otherInfo || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as any);
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-4xl my-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{initialData ? '编辑报价单' : '添加报价单'}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <X size={20} />
                    </Button>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 基本信息 */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-primary">基本信息</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="brand">品牌 *</Label>
                                    <Input
                                        id="brand"
                                        value={formData.brand}
                                        onChange={(e) => handleChange('brand', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="requester">需求提交人 *</Label>
                                    <Input
                                        id="requester"
                                        value={formData.requester}
                                        onChange={(e) => handleChange('requester', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="productName">产品名称 *</Label>
                                    <Input
                                        id="productName"
                                        value={formData.productName}
                                        onChange={(e) => handleChange('productName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="productNameEn">英文名称</Label>
                                    <Input
                                        id="productNameEn"
                                        value={formData.productNameEn}
                                        onChange={(e) => handleChange('productNameEn', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category">类目 *</Label>
                                    <Input
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => handleChange('category', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="salePrice">售价 ($) *</Label>
                                    <Input
                                        id="salePrice"
                                        type="number"
                                        step="0.01"
                                        value={formData.salePrice}
                                        onChange={(e) => handleChange('salePrice', parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 供应商信息 */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-primary">供应商信息</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="supplierName">供应商名称 *</Label>
                                    <Input
                                        id="supplierName"
                                        value={formData.supplierName}
                                        onChange={(e) => handleChange('supplierName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="quoter">报价人 *</Label>
                                    <Input
                                        id="quoter"
                                        value={formData.quoter}
                                        onChange={(e) => handleChange('quoter', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="quotePriceRMB">报价 (¥) *</Label>
                                    <Input
                                        id="quotePriceRMB"
                                        type="number"
                                        step="0.01"
                                        value={formData.quotePriceRMB}
                                        onChange={(e) => handleChange('quotePriceRMB', parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="moq">MOQ *</Label>
                                    <Input
                                        id="moq"
                                        type="number"
                                        value={formData.moq}
                                        onChange={(e) => handleChange('moq', parseInt(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="leadTime">交期 *</Label>
                                    <Input
                                        id="leadTime"
                                        value={formData.leadTime}
                                        onChange={(e) => handleChange('leadTime', e.target.value)}
                                        placeholder="例如: 30天"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="material">材质 *</Label>
                                    <Input
                                        id="material"
                                        value={formData.material}
                                        onChange={(e) => handleChange('material', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 包装尺寸 - 彩盒 */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-primary">包装尺寸 - 彩盒</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="colorBoxLength">长 (cm) *</Label>
                                    <Input
                                        id="colorBoxLength"
                                        type="number"
                                        step="0.1"
                                        value={formData.colorBoxLength}
                                        onChange={(e) => handleChange('colorBoxLength', parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="colorBoxWidth">宽 (cm) *</Label>
                                    <Input
                                        id="colorBoxWidth"
                                        type="number"
                                        step="0.1"
                                        value={formData.colorBoxWidth}
                                        onChange={(e) => handleChange('colorBoxWidth', parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="colorBoxHeight">高 (cm) *</Label>
                                    <Input
                                        id="colorBoxHeight"
                                        type="number"
                                        step="0.1"
                                        value={formData.colorBoxHeight}
                                        onChange={(e) => handleChange('colorBoxHeight', parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="colorBoxWeight">重量 (kg) *</Label>
                                    <Input
                                        id="colorBoxWeight"
                                        type="number"
                                        step="0.01"
                                        value={formData.colorBoxWeight}
                                        onChange={(e) => handleChange('colorBoxWeight', parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 包装尺寸 - 外箱 */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-primary">包装尺寸 - 外箱</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                    <Label htmlFor="outerBoxLength">长 (cm)</Label>
                                    <Input
                                        id="outerBoxLength"
                                        type="number"
                                        step="0.1"
                                        value={formData.outerBoxLength}
                                        onChange={(e) => handleChange('outerBoxLength', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="outerBoxWidth">宽 (cm)</Label>
                                    <Input
                                        id="outerBoxWidth"
                                        type="number"
                                        step="0.1"
                                        value={formData.outerBoxWidth}
                                        onChange={(e) => handleChange('outerBoxWidth', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="outerBoxHeight">高 (cm)</Label>
                                    <Input
                                        id="outerBoxHeight"
                                        type="number"
                                        step="0.1"
                                        value={formData.outerBoxHeight}
                                        onChange={(e) => handleChange('outerBoxHeight', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="outerBoxWeight">重量 (kg)</Label>
                                    <Input
                                        id="outerBoxWeight"
                                        type="number"
                                        step="0.01"
                                        value={formData.outerBoxWeight}
                                        onChange={(e) => handleChange('outerBoxWeight', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="packingQuantity">装箱数量</Label>
                                    <Input
                                        id="packingQuantity"
                                        type="number"
                                        value={formData.packingQuantity}
                                        onChange={(e) => handleChange('packingQuantity', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 其他信息 */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-primary">其他信息</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="expectedQuantity">预期采购量</Label>
                                    <Input
                                        id="expectedQuantity"
                                        type="number"
                                        value={formData.expectedQuantity}
                                        onChange={(e) => handleChange('expectedQuantity', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="packagingMethod">包装方式</Label>
                                    <Input
                                        id="packagingMethod"
                                        value={formData.packagingMethod}
                                        onChange={(e) => handleChange('packagingMethod', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 按钮 */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onCancel}>
                                取消
                            </Button>
                            <Button type="submit">
                                {initialData ? '保存修改' : '添加报价'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
