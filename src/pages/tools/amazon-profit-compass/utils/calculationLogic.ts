import { ProductInput, ProfitResult, SizeTier, CalculationStep, Language } from '../types';
import { REFERRAL_FEE_RATES, MIN_REFERRAL_FEE, FBA_FEES_2024, STORAGE_FEES } from '../constants';
import { TRANSLATIONS } from './locales';

const determineSizeTier = (l: number, w: number, h: number, weight: number): SizeTier => {
  const dims = [l, w, h].sort((a, b) => b - a);
  const [longest, median, shortest] = dims;

  // Standard Size: Max 18 x 14 x 8 inches, 20 lbs
  if (longest <= 18 && median <= 14 && shortest <= 8 && weight <= 20) {
    // Small Standard: 15 x 12 x 0.75, 16oz (1lb)
    if (longest <= 15 && median <= 12 && shortest <= 0.75 && weight <= 1) {
      return SizeTier.SMALL_STANDARD;
    }
    return SizeTier.LARGE_STANDARD;
  }
  
  // Oversize
  if (longest <= 60 && median <= 30 && weight <= 70) return SizeTier.SMALL_OVERSIZE;
  if (longest <= 108 && weight <= 150) return SizeTier.MEDIUM_OVERSIZE;
  
  return SizeTier.LARGE_OVERSIZE;
};

const getWeightForFee = (tier: SizeTier, unitWeight: number, dimWeight: number): number => {
  // Small standard uses unit weight generally (simplified for theoretical tool)
  if (tier === SizeTier.SMALL_STANDARD) return unitWeight;
  // Large Standard and Oversize use greater of unit or dim weight
  return Math.max(unitWeight, dimWeight);
};

const calculateFBAFee = (tier: SizeTier, weight: number, t: any): { fee: number, surchargeNote?: string } => {
  const feeTable = FBA_FEES_2024[tier];
  if (!feeTable) return { fee: 10.00, surchargeNote: 'Fallback rate' };

  for (const [maxWeight, fee] of feeTable) {
    if (weight <= maxWeight) return { fee };
  }
  
  const lastBracket = feeTable[feeTable.length - 1];
  const extraWeight = weight - lastBracket[0];
  const surcharge = Math.ceil(extraWeight) * 0.38; 
  return { 
    fee: lastBracket[1] + surcharge, 
    surchargeNote: `${t.calc_base} $${lastBracket[1].toFixed(2)} + $0.38 * ${Math.ceil(extraWeight)}lb ${t.calc_excess}`
  };
};

export const calculateProfit = (input: ProductInput, lang: Language = Language.EN): ProfitResult => {
  const { price, cost, category, dimensions, shippingCost, miscCost, advertisingCost, feePeriod } = input;
  const trace: CalculationStep[] = [];
  const t = TRANSLATIONS[lang];

  // 1. Dimensions & Volume
  const volume = dimensions.length * dimensions.width * dimensions.height;
  const cubicFeet = volume / 1728;
  // US Dim Weight divisor is 139
  const dimWeight = volume / 139; 

  trace.push({
    label: t.calc_dimAnalysis,
    formula: `(${dimensions.length}" × ${dimensions.width}" × ${dimensions.height}") / 139`,
    result: `${dimWeight.toFixed(2)} lb`,
    note: `${t.calc_vol}: ${volume.toFixed(2)} in³, ${cubicFeet.toFixed(3)} ft³`
  });

  // 2. Size Tier Determination
  const sizeTier = determineSizeTier(dimensions.length, dimensions.width, dimensions.height, dimensions.weight);
  trace.push({
    label: t.calc_sizeTier,
    formula: "Compare dims against Amazon Tiers",
    result: sizeTier,
    note: sizeTier === SizeTier.SMALL_STANDARD ? t.calc_matchSmall : t.calc_defaultStandard
  });

  // 3. Shipping Weight (Billable)
  // Packaging weight logic (Simplified for theory: +0.25lb for small, +0.5-1.0 for large)
  // We will assume 'dimensions.weight' IS the unit weight.
  // We add estimated packaging weight.
  let packagingWeight = 0;
  if (sizeTier === SizeTier.SMALL_STANDARD) packagingWeight = 0.25;
  else if (sizeTier === SizeTier.LARGE_STANDARD) packagingWeight = 0.25; // typically less for <1lb, but general rule
  else packagingWeight = 1.0;

  const finalWeight = getWeightForFee(sizeTier, dimensions.weight + packagingWeight, dimWeight);
  
  trace.push({
    label: t.calc_billableWeight,
    formula: `MAX(Unit ${dimensions.weight} + Pkg ${packagingWeight}, Dim ${dimWeight.toFixed(2)})`,
    result: `${finalWeight.toFixed(2)} lb`,
    note: t.calc_usedForFba
  });

  // 4. FBA Fee Lookup
  const { fee: fulfillmentFee, surchargeNote } = calculateFBAFee(sizeTier, finalWeight, t);
  trace.push({
    label: t.calc_fbaFee,
    formula: `Lookup ${sizeTier} table for ${finalWeight.toFixed(2)} lb`,
    result: `$${fulfillmentFee.toFixed(2)}`,
    note: surchargeNote || "Standard bracket match"
  });

  // 5. Storage Fee
  const storageRate = STORAGE_FEES[feePeriod] || 0.78;
  const storageFee = cubicFeet * storageRate;
  trace.push({
    label: t.calc_storageFee,
    formula: `${cubicFeet.toFixed(3)} ft³ × $${storageRate}/ft³`,
    result: `$${storageFee.toFixed(2)}`,
    note: `${t.calc_rateBasedOn} ${feePeriod}`
  });

  // 6. Referral Fee
  const rate = REFERRAL_FEE_RATES[category] || 0.15;
  let referralFee = price * rate;
  if (referralFee < MIN_REFERRAL_FEE) referralFee = MIN_REFERRAL_FEE;
  
  trace.push({
    label: t.calc_referralFee,
    formula: `MAX($${price} × ${(rate * 100)}%, $${MIN_REFERRAL_FEE})`,
    result: `$${referralFee.toFixed(2)}`,
    note: `${t.category}: ${category}`
  });

  // 7. Closing Fee
  const isMedia = category === 'Books'; 
  const closingFee = isMedia ? 1.80 : 0;

  const totalFees = referralFee + fulfillmentFee + storageFee + closingFee;
  const totalOtherCosts = cost + shippingCost + miscCost + advertisingCost;
  
  const netProfit = price - totalFees - totalOtherCosts;
  const revenue = price;
  
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const roi = totalOtherCosts > 0 ? (netProfit / totalOtherCosts) * 100 : 0;

  return {
    revenue,
    totalCost: totalOtherCosts, // This now encompasses all costs except Amz fees, but we might want to clarify logic if asked
    netProfit,
    margin,
    roi,
    sizeTier,
    breakdown: {
      referralFee,
      fulfillmentFee,
      storageFee,
      closingFee,
      totalFees
    },
    calculationTrace: trace
  };
};