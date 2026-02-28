import {
  calculateFBAFees,
  formatCurrency,
  formatPercentage,
  EXCHANGE_RATE,
  COMMISSION_RATES,
  type ProductInput,
} from '../fbaFeeCalculator';

describe('FBA Fee Calculator', () => {
  describe('calculateFBAFees', () => {
    const mockInput: ProductInput = {
      productName: 'Test Product',
      asin: 'B0123456789',
      productCost: 50,
      sellingPrice: 25,
      shippingCost: 15,
      dimensions: {
        length: 15,
        width: 10,
        height: 5,
        weight: 300,
      },
      category: 'standard',
    };

    it('should calculate all fees correctly', () => {
      const result = calculateFBAFees(mockInput);

      expect(result).toBeDefined();
      expect(result.fulfillmentFee).toBeGreaterThan(0);
      expect(result.storageFee).toBeGreaterThanOrEqual(0);
      expect(result.commission).toBeGreaterThan(0);
      expect(result.shippingCostUSD).toBeGreaterThan(0);
      expect(result.productCostUSD).toBeGreaterThan(0);
    });

    it('should calculate commission based on category', () => {
      const standardResult = calculateFBAFees({ ...mockInput, category: 'standard' });
      const clothingResult = calculateFBAFees({ ...mockInput, category: 'clothing' });
      const jewelryResult = calculateFBAFees({ ...mockInput, category: 'jewelry' });

      expect(standardResult.commission).toBe(mockInput.sellingPrice * COMMISSION_RATES.STANDARD);
      expect(clothingResult.commission).toBe(mockInput.sellingPrice * COMMISSION_RATES.CLOTHING);
      expect(jewelryResult.commission).toBe(mockInput.sellingPrice * COMMISSION_RATES.JEWELRY);
    });

    it('should convert CNY to USD correctly', () => {
      const result = calculateFBAFees(mockInput);

      expect(result.shippingCostUSD).toBe(mockInput.shippingCost / EXCHANGE_RATE);
      expect(result.productCostUSD).toBe(mockInput.productCost / EXCHANGE_RATE);
    });

    it('should calculate profit metrics correctly', () => {
      const result = calculateFBAFees(mockInput);

      expect(result.revenue).toBe(mockInput.sellingPrice);
      expect(result.totalCost).toBe(
        result.fulfillmentFee +
          result.storageFee +
          result.commission +
          result.shippingCostUSD +
          result.productCostUSD
      );
      expect(result.netProfitUSD).toBe(result.revenue - result.totalCost);
      expect(result.netProfitCNY).toBe(result.netProfitUSD * EXCHANGE_RATE);
    });

    it('should calculate profit margin correctly', () => {
      const result = calculateFBAFees(mockInput);
      const expectedMargin = (result.netProfitUSD / result.revenue) * 100;

      expect(result.profitMargin).toBeCloseTo(expectedMargin, 2);
    });

    it('should calculate ROI correctly', () => {
      const result = calculateFBAFees(mockInput);
      const totalInvestmentCNY = mockInput.productCost + mockInput.shippingCost;
      const expectedRoi = (result.netProfitCNY / totalInvestmentCNY) * 100;

      expect(result.roi).toBeCloseTo(expectedRoi, 2);
    });

    it('should return fee breakdown with correct structure', () => {
      const result = calculateFBAFees(mockInput);

      expect(result.feeBreakdown).toHaveLength(5);
      expect(result.feeBreakdown[0]).toMatchObject({
        name: 'FBA 配送费',
        value: result.fulfillmentFee,
        color: '#0071E3',
      });
    });

    it('should handle zero values', () => {
      const zeroInput: ProductInput = {
        ...mockInput,
        productCost: 0,
        sellingPrice: 0,
        shippingCost: 0,
      };

      const result = calculateFBAFees(zeroInput);

      expect(result.netProfitUSD).toBeLessThanOrEqual(0);
      expect(result.profitMargin).toBe(0);
    });

    it('should handle negative profit scenarios', () => {
      const lossInput: ProductInput = {
        ...mockInput,
        productCost: 100,
        sellingPrice: 10,
      };

      const result = calculateFBAFees(lossInput);

      expect(result.netProfitUSD).toBeLessThan(0);
      expect(result.profitMargin).toBeLessThan(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
      expect(formatCurrency(-10.5, 'USD')).toBe('-$10.50');
    });

    it('should format CNY correctly', () => {
      expect(formatCurrency(1234.56, 'CNY')).toBe('¥1,234.56');
      expect(formatCurrency(0, 'CNY')).toBe('¥0.00');
      expect(formatCurrency(-10.5, 'CNY')).toBe('-¥10.50');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(12.345)).toBe('12.35%');
      expect(formatPercentage(0)).toBe('0.00%');
      expect(formatPercentage(-5.678)).toBe('-5.68%');
    });

    it('should round to 2 decimal places', () => {
      expect(formatPercentage(12.3456)).toBe('12.35%');
      expect(formatPercentage(99.999)).toBe('100.00%');
    });
  });
});
