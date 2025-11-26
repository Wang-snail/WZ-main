import { ProcurementQuotation, CalculatedFields } from '@/types/procurementTypes';

/**
 * 公式计算引擎
 * 根据基础数据自动计算所有派生字段
 */
export class FormulaEngine {
    // 默认配置
    private static readonly DEFAULT_CONFIG = {
        volumeWeightCoefficient: 5000, // 体积重系数
        commissionRate: 0.15, // 佣金率 15%
        exchangeRate: 7.2, // 汇率
        firstLegUnitPrice: 30, // 头程单价（元/kg）
        fbaFeeBase: 3.5, // FBA基础费用（美元）
        platformCostRate: 0.02, // 平台成本率 2%
        advertisingRate: 0.10, // 广告率 10%
        discountRate: 0.05, // 折扣率 5%
        refundRate: 0.02, // 退款率 2%
    };

    /**
     * 计算所有派生字段
     */
    static calculateAll(quotation: Partial<ProcurementQuotation>): CalculatedFields {
        const config = this.DEFAULT_CONFIG;

        // 基础数据
        const salePrice = quotation.salePrice || 0;
        const quotePriceRMB = quotation.quotePriceRMB || 0;
        const colorBoxLength = quotation.colorBoxLength || 0;
        const colorBoxWidth = quotation.colorBoxWidth || 0;
        const colorBoxHeight = quotation.colorBoxHeight || 0;
        const colorBoxWeight = quotation.colorBoxWeight || 0;

        // 1. 物流计算
        const volumeWeightKg = this.calculateVolumeWeight(
            colorBoxLength,
            colorBoxWidth,
            colorBoxHeight,
            config.volumeWeightCoefficient
        );

        const chargeableWeight = Math.max(colorBoxWeight, volumeWeightKg);

        const longestSide = Math.max(colorBoxLength, colorBoxWidth, colorBoxHeight);
        const sides = [colorBoxLength, colorBoxWidth, colorBoxHeight].sort((a, b) => b - a);
        const secondLongestSide = sides[1];
        const shortestSide = sides[2];

        const productSizeType = this.determineProductSizeType(longestSide, secondLongestSide, shortestSide);

        // 2. 成本计算
        const purchasePriceUSD = quotePriceRMB / config.exchangeRate;
        const firstLegFreight = (chargeableWeight * config.firstLegUnitPrice) / config.exchangeRate;
        const fbaFee = this.calculateFBAFee(productSizeType, chargeableWeight);
        const platformCost = salePrice * config.platformCostRate;

        // 3. 费用计算
        const commission = salePrice * config.commissionRate;
        const advertisingCost = salePrice * config.advertisingRate;
        const discount = salePrice * config.discountRate;
        const refund = salePrice * config.refundRate;

        // 4. 保本价和利润计算
        const breakEvenPrice = purchasePriceUSD + firstLegFreight + fbaFee + platformCost + commission;
        const promotionCostTotal = advertisingCost + discount + refund;
        const sellingPrice = salePrice;
        const profit = sellingPrice - breakEvenPrice - promotionCostTotal;
        const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

        // 5. 占比计算
        const purchaseRatio = sellingPrice > 0 ? (purchasePriceUSD / sellingPrice) * 100 : 0;
        const logisticsRatio = sellingPrice > 0 ? ((firstLegFreight + fbaFee) / sellingPrice) * 100 : 0;
        const profitRatio = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
        const advertisingRatio = sellingPrice > 0 ? (advertisingCost / sellingPrice) * 100 : 0;

        const unitProfitBreakEven = profit;

        return {
            competitorPrice: quotation.competitor ? 0 : undefined,
            breakEvenPrice: Number(breakEvenPrice.toFixed(2)),
            sellingPrice: Number(sellingPrice.toFixed(2)),
            profit: Number(profit.toFixed(2)),
            profitMargin: Number(profitMargin.toFixed(2)),

            commission: Number(commission.toFixed(2)),
            volumeWeightCoefficient: config.volumeWeightCoefficient,
            firstLegUnitPrice: config.firstLegUnitPrice,
            exchangeRate: config.exchangeRate,
            longestSide: Number(longestSide.toFixed(2)),
            secondLongestSide: Number(secondLongestSide.toFixed(2)),
            shortestSide: Number(shortestSide.toFixed(2)),
            productSizeType,
            chargeableWeight: Number(chargeableWeight.toFixed(2)),
            volumeWeightKg: Number(volumeWeightKg.toFixed(2)),

            purchaseRatio: Number(purchaseRatio.toFixed(2)),
            logisticsRatio: Number(logisticsRatio.toFixed(2)),
            profitRatio: Number(profitRatio.toFixed(2)),

            firstLegFreight: Number(firstLegFreight.toFixed(2)),
            fbaFee: Number(fbaFee.toFixed(2)),
            platformCost: Number(platformCost.toFixed(2)),
            advertisingCost: Number(advertisingCost.toFixed(2)),
            discount: Number(discount.toFixed(2)),
            refund: Number(refund.toFixed(2)),
            refundRate: config.refundRate * 100,
            advertisingRatio: Number(advertisingRatio.toFixed(2)),

            unitProfitBreakEven: Number(unitProfitBreakEven.toFixed(2)),
            promotionCostTotal: Number(promotionCostTotal.toFixed(2)),
            advertisingRate: config.advertisingRate * 100,
        };
    }

    /**
     * 计算体积重
     */
    private static calculateVolumeWeight(
        length: number,
        width: number,
        height: number,
        coefficient: number
    ): number {
        return (length * width * height) / coefficient;
    }

    /**
     * 判断产品尺寸类型
     */
    private static determineProductSizeType(
        longestSide: number,
        secondLongestSide: number,
        shortestSide: number
    ): string {
        // 简化的尺寸分类逻辑
        if (longestSide <= 38 && secondLongestSide <= 30 && shortestSide <= 2) {
            return '小号标准尺寸';
        } else if (longestSide <= 46 && secondLongestSide <= 36 && shortestSide <= 20) {
            return '大号标准尺寸';
        } else if (longestSide <= 150 && secondLongestSide <= 84 && shortestSide <= 84) {
            return '大号大件';
        } else {
            return '超大尺寸';
        }
    }

    /**
     * 计算FBA费用
     */
    private static calculateFBAFee(sizeType: string, weight: number): number {
        // 简化的FBA费用计算
        const baseFees: Record<string, number> = {
            '小号标准尺寸': 3.06,
            '大号标准尺寸': 4.75,
            '大号大件': 8.26,
            '超大尺寸': 15.0,
        };

        const baseFee = baseFees[sizeType] || 5.0;

        // 超重附加费（简化）
        const overweightFee = weight > 1 ? (weight - 1) * 0.5 : 0;

        return baseFee + overweightFee;
    }
}
