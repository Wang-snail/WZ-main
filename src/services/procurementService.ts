import { ProcurementQuotation, ProcurementTableData, ViewConfig } from '@/types/procurementTypes';
import { FormulaEngine } from '@/utils/formulaEngine';

const STORAGE_KEY = 'procurement_quotations';
const VIEWS_KEY = 'procurement_views';

/**
 * 采购寻源报价单服务
 */
export class ProcurementService {
    /**
     * 加载所有报价单数据
     */
    static loadAll(): ProcurementTableData {
        const quotations = this.loadQuotations();
        const views = this.loadViews();

        return {
            quotations,
            views,
            currentViewId: views[0]?.id || 'default',
        };
    }

    /**
     * 加载报价单列表
     */
    static loadQuotations(): ProcurementQuotation[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('加载报价单失败:', error);
        }
        return [];
    }

    /**
     * 保存报价单列表
     */
    static saveQuotations(quotations: ProcurementQuotation[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
        } catch (error) {
            console.error('保存报价单失败:', error);
            throw new Error('保存失败，请重试');
        }
    }

    /**
     * 添加新报价单
     */
    static addQuotation(data: Omit<ProcurementQuotation, 'id' | 'calculated' | 'createdAt' | 'updatedAt'>): ProcurementQuotation {
        const quotations = this.loadQuotations();

        const newQuotation: ProcurementQuotation = {
            ...data,
            id: `proc-${Date.now()}`,
            calculated: FormulaEngine.calculateAll(data),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        quotations.push(newQuotation);
        this.saveQuotations(quotations);

        return newQuotation;
    }

    /**
     * 更新报价单
     */
    static updateQuotation(id: string, updates: Partial<ProcurementQuotation>): ProcurementQuotation | null {
        const quotations = this.loadQuotations();
        const index = quotations.findIndex(q => q.id === id);

        if (index === -1) {
            return null;
        }

        const updated = {
            ...quotations[index],
            ...updates,
            calculated: FormulaEngine.calculateAll({ ...quotations[index], ...updates }),
            updatedAt: new Date().toISOString(),
        };

        quotations[index] = updated;
        this.saveQuotations(quotations);

        return updated;
    }

    /**
     * 删除报价单
     */
    static deleteQuotation(id: string): boolean {
        const quotations = this.loadQuotations();
        const filtered = quotations.filter(q => q.id !== id);

        if (filtered.length === quotations.length) {
            return false;
        }

        this.saveQuotations(filtered);
        return true;
    }

    /**
     * 批量导入数据
     */
    static importData(data: Partial<ProcurementQuotation>[]): number {
        const quotations = this.loadQuotations();
        let imported = 0;

        data.forEach(item => {
            try {
                const newQuotation: ProcurementQuotation = {
                    id: `proc-${Date.now()}-${imported}`,
                    brand: item.brand || '',
                    requester: item.requester || '',
                    submitDate: item.submitDate || new Date().toISOString().split('T')[0],
                    productName: item.productName || '',
                    productNameEn: item.productNameEn || '',
                    salePrice: item.salePrice || 0,
                    length: item.length || 0,
                    width: item.width || 0,
                    height: item.height || 0,
                    packagingMethod: item.packagingMethod || '',
                    expectedQuantity: item.expectedQuantity || 0,
                    category: item.category || '',
                    expectedUnitPrice: item.expectedUnitPrice || 0,
                    quoter: item.quoter || '',
                    quoteDate: item.quoteDate || new Date().toISOString().split('T')[0],
                    supplierName: item.supplierName || '',
                    quotePriceRMB: item.quotePriceRMB || 0,
                    purchasePriceUSD: item.purchasePriceUSD || 0,
                    moq: item.moq || 0,
                    leadTime: item.leadTime || '',
                    material: item.material || '',
                    colorBoxLength: item.colorBoxLength || 0,
                    colorBoxWidth: item.colorBoxWidth || 0,
                    colorBoxHeight: item.colorBoxHeight || 0,
                    colorBoxWeight: item.colorBoxWeight || 0,
                    outerBoxLength: item.outerBoxLength || 0,
                    outerBoxWidth: item.outerBoxWidth || 0,
                    outerBoxHeight: item.outerBoxHeight || 0,
                    outerBoxWeight: item.outerBoxWeight || 0,
                    packingQuantity: item.packingQuantity || 0,
                    ...item,
                    calculated: FormulaEngine.calculateAll(item),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                } as ProcurementQuotation;

                quotations.push(newQuotation);
                imported++;
            } catch (error) {
                console.error('导入数据项失败:', error);
            }
        });

        this.saveQuotations(quotations);
        return imported;
    }

    /**
     * 加载视图配置
     */
    static loadViews(): ViewConfig[] {
        try {
            const stored = localStorage.getItem(VIEWS_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('加载视图失败:', error);
        }

        // 返回默认视图
        return this.getDefaultViews();
    }

    /**
     * 获取默认视图
     */
    static getDefaultViews(): ViewConfig[] {
        return [
            {
                id: 'default',
                name: '全部数据',
                groupBy: 'none',
                visibleColumns: ['productName', 'supplierName', 'quotePriceRMB', 'salePrice', 'profit', 'profitMargin'],
            },
            {
                id: 'by-product',
                name: '按产品分组',
                groupBy: 'product',
                visibleColumns: ['productName', 'supplierName', 'quotePriceRMB', 'moq', 'leadTime'],
            },
            {
                id: 'by-supplier',
                name: '按供应商分组',
                groupBy: 'supplier',
                visibleColumns: ['supplierName', 'productName', 'quotePriceRMB', 'moq'],
            },
        ];
    }

    /**
     * 保存视图配置
     */
    static saveViews(views: ViewConfig[]): void {
        try {
            localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
        } catch (error) {
            console.error('保存视图失败:', error);
        }
    }
}
