
import { CalculationResult, ProductCategory, ProductInput, SizeTier, TierAnalysis, BoundaryDiff, DimensionUnit, WeightUnit, WeightBracketAnalysis } from '../types';
import { toInches, toPounds, fromInches, fromPounds } from '../utils/conversions';

// Constants for Size Tiers (based on standard US FBA logic)
// Updated XL tiers to have null dimension limits as they are the ceiling
const TIER_LIMITS = {
  [SizeTier.SMALL_STANDARD]: {
    weight: 16 / 16, // 16 oz = 1 lb
    longest: 15,
    median: 6,
    shortest: 0.75,
    girthLen: null
  },
  [SizeTier.LARGE_STANDARD]: {
    weight: 20,
    longest: 18,
    median: 14,
    shortest: 8,
    girthLen: null
  },
  [SizeTier.LARGE_BULKY]: {
    weight: 50,
    longest: 59,
    median: 33,
    shortest: null, // No specific shortest side limit usually for bulky, just girth
    girthLen: 130 // Length + Girth
  },
  // Extra large tiers: No dimension ceiling (as they are the max tiers), only weight brackets
  [SizeTier.EXTRA_LARGE_0_50]: { weight: 50, longest: null, median: null, shortest: null, girthLen: null }, 
  [SizeTier.EXTRA_LARGE_50_70]: { weight: 70, longest: null, median: null, shortest: null, girthLen: null },
  [SizeTier.EXTRA_LARGE_70_PLUS]: { weight: 99999, longest: null, median: null, shortest: null, girthLen: null },
};

interface FeeBracket {
  maxWeight: number;
  standard: number;
  apparel: number;
  perInterval?: number;
}

// 2024 Low-Price FBA Rates (Simplified Reference)
// Effective Feb 5, 2024.
// Source: https://sellercentral.amazon.com/help/hub/reference/external/G8CXLSH94WNPB9R4
const LOW_PRICE_RATES: Partial<Record<SizeTier, FeeBracket[]>> = {
  [SizeTier.SMALL_STANDARD]: [
    { maxWeight: 0.25, standard: 2.05, apparel: 2.27 },
    { maxWeight: 0.50, standard: 2.22, apparel: 2.48 },
    { maxWeight: 0.75, standard: 2.39, apparel: 2.69 },
    { maxWeight: 1.00, standard: 2.56, apparel: 2.91 } // Max for Small Std is 16oz (1lb)
  ],
  [SizeTier.LARGE_STANDARD]: [
    { maxWeight: 0.25, standard: 2.70, apparel: 3.16 },
    { maxWeight: 0.50, standard: 2.90, apparel: 3.38 },
    { maxWeight: 0.75, standard: 3.11, apparel: 3.75 },
    { maxWeight: 1.00, standard: 3.28, apparel: 4.30 },
    { maxWeight: 1.50, standard: 3.86, apparel: 4.96 },
    { maxWeight: 2.00, standard: 4.19, apparel: 5.38 },
    { maxWeight: 2.50, standard: 4.49, apparel: 5.95 },
    { maxWeight: 3.00, standard: 4.75, apparel: 6.31 },
    // >3lb logic: Base + 0.16 per 0.5lb
    { maxWeight: 999,  standard: 4.75, apparel: 6.31, perInterval: 0.16 } 
  ]
};

const getLowPriceFee = (tier: SizeTier, shippingWeight: number, category: ProductCategory): number | null => {
  const isApparel = category === ProductCategory.APPAREL;
  const rates = LOW_PRICE_RATES[tier];
  
  if (!rates) return null; // Low price only for standard tiers

  for (const bracket of rates) {
    if (shippingWeight <= bracket.maxWeight) {
       // If it's the catch-all >3lb bracket
       if (bracket.maxWeight === 999 && bracket.perInterval) {
          const weightAbove = Math.ceil((shippingWeight - 3) * 2) / 2;
          const intervals = weightAbove / 0.5;
          const base = isApparel ? bracket.apparel : bracket.standard;
          return base + (intervals * bracket.perInterval);
       }
       return isApparel ? bracket.apparel : bracket.standard;
    }
  }
  return null;
}

// Simplified Fee Helper (Standard FBA)
const getFee = (tier: SizeTier, shippingWeight: number, category: ProductCategory): number => {
  const isApparel = category === ProductCategory.APPAREL;
  const isDangerous = category === ProductCategory.DANGEROUS_GOODS;
  const dgMultiplier = isDangerous ? 1.5 : 1.0; 

  switch (tier) {
    case SizeTier.SMALL_STANDARD:
      if (shippingWeight <= 0.25) return (isApparel ? 3.43 : 3.22) * dgMultiplier;
      if (shippingWeight <= 0.50) return (isApparel ? 3.65 : 3.40) * dgMultiplier;
      if (shippingWeight <= 0.75) return (isApparel ? 3.86 : 3.58) * dgMultiplier;
      return (isApparel ? 4.08 : 3.77) * dgMultiplier;

    case SizeTier.LARGE_STANDARD: {
      let fee = 0;
      if (shippingWeight <= 0.25) fee = isApparel ? 4.49 : 3.86;
      else if (shippingWeight <= 0.5) fee = isApparel ? 4.70 : 4.08;
      else if (shippingWeight <= 0.75) fee = isApparel ? 5.07 : 4.42;
      else if (shippingWeight <= 1.0) fee = isApparel ? 5.61 : 4.75;
      else if (shippingWeight <= 1.5) fee = isApparel ? 6.27 : 5.40;
      else if (shippingWeight <= 2.0) fee = isApparel ? 6.69 : 5.76;
      else if (shippingWeight <= 2.5) fee = isApparel ? 7.27 : 6.13;
      else if (shippingWeight <= 3.0) fee = isApparel ? 7.63 : 6.44;
      else {
        const base = isApparel ? 7.63 : 6.44;
        // Approx logic for >3lb
        const weightAbove = Math.ceil((shippingWeight - 3) * 2) / 2;
        const intervals = weightAbove / 0.5;
        fee = base + (intervals * 0.16); 
      }
      return fee * dgMultiplier;
    }

    case SizeTier.LARGE_BULKY: {
      const lbBase = isApparel ? 10.73 : 9.73;
      const lbExcess = Math.ceil(shippingWeight - 1);
      return (lbBase + (Math.max(0, lbExcess) * 0.42)) * dgMultiplier;
    }

    case SizeTier.EXTRA_LARGE_0_50:
      return (26.33 + (Math.max(0, Math.ceil(shippingWeight - 1)) * 0.38)) * dgMultiplier;

    case SizeTier.EXTRA_LARGE_50_70:
      return (40.12 + (Math.max(0, Math.ceil(shippingWeight - 51)) * 0.38)) * dgMultiplier;

    case SizeTier.EXTRA_LARGE_70_PLUS:
      return (54.81 + (Math.max(0, Math.ceil(shippingWeight - 71)) * 0.38)) * dgMultiplier;
    
    default:
      return 0;
  }
};

const analyzeWeightSteps = (
  tier: SizeTier, 
  shippingWeight: number, 
  displayWeightUnit: WeightUnit
): WeightBracketAnalysis | undefined => {
  let steps: number[] = [];

  // Define weight steps (in lbs) where price changes
  if (tier === SizeTier.SMALL_STANDARD) {
    steps = [0.25, 0.50, 0.75, 1.0];
  } else if (tier === SizeTier.LARGE_STANDARD) {
    // 0-1lb steps: 0.25, 0.5, 0.75, 1.0
    steps = [0.25, 0.5, 0.75, 1.0];
    // 1-3lb steps: 1.5, 2.0, 2.5, 3.0
    steps.push(1.5, 2.0, 2.5, 3.0);
    // Above 3lb: every 0.5lb
    if (shippingWeight > 3.0) {
      // Find the next few 0.5 boundaries
      const base = Math.floor(shippingWeight * 2) / 2;
      // Add a few surrounding steps for calculation
      for (let i = -2; i <= 2; i++) {
        const s = base + (i * 0.5);
        if (s > 3.0) steps.push(s);
      }
    }
  } else {
    // Bulky and XL are usually per lb or first lb
    // Meaning every integer is a step: 1.0, 2.0, 3.0...
    const floor = Math.floor(shippingWeight);
    steps = [floor, floor + 1, floor + 2];
  }

  // Filter and Sort unique positive steps
  steps = Array.from(new Set(steps)).filter(s => s > 0).sort((a, b) => a - b);
  
  // Find current bracket
  let ceiling = steps.find(s => s >= shippingWeight);
  
  // Handling >3lb dynamic generation
  if (!ceiling && tier === SizeTier.LARGE_STANDARD) {
     ceiling = Math.ceil(shippingWeight * 2) / 2; 
  } else if (!ceiling) {
     ceiling = Math.ceil(shippingWeight);
  }

  const ceilingIdx = steps.indexOf(ceiling);
  const prevCeiling = ceilingIdx > 0 ? steps[ceilingIdx - 1] : undefined;

  // Calculate values in display units
  const buffer = fromPounds(ceiling - shippingWeight, displayWeightUnit);
  const reduction = prevCeiling !== undefined ? fromPounds(shippingWeight - prevCeiling, displayWeightUnit) : undefined;

  return {
    currentBracketCeiling: fromPounds(ceiling, displayWeightUnit),
    prevBracketCeiling: prevCeiling ? fromPounds(prevCeiling, displayWeightUnit) : undefined,
    bufferToNextTier: buffer,
    reductionToPrevTier: reduction,
    displayUnit: displayWeightUnit
  };
};

const calculateAnalysis = (
  currentTier: SizeTier,
  longest: number,
  median: number,
  shortest: number,
  weight: number,
  shippingWeight: number,
  girthLen: number,
  displayDimUnit: DimensionUnit,
  displayWeightUnit: WeightUnit
): TierAnalysis => {
  const analysis: TierAnalysis = {};
  
  const getDimDiff = (label: string, val: number, limit: number) => ({
    label,
    current: fromInches(val, displayDimUnit),
    limit: fromInches(limit, displayDimUnit),
    diff: fromInches(val - limit, displayDimUnit),
    unit: displayDimUnit
  });

  const getWeightDiff = (label: string, val: number, limit: number) => ({
    label,
    current: fromPounds(val, displayWeightUnit),
    limit: fromPounds(limit, displayWeightUnit),
    diff: fromPounds(val - limit, displayWeightUnit),
    unit: displayWeightUnit
  });

  const hierarchy = [
    SizeTier.SMALL_STANDARD,
    SizeTier.LARGE_STANDARD,
    SizeTier.LARGE_BULKY,
    SizeTier.EXTRA_LARGE_0_50
  ];

  const currentIndex = hierarchy.indexOf(currentTier);

  // 1. Analyze Cheaper Tier (Downgrade opportunities)
  if (currentIndex > 0) {
    const targetTierName = hierarchy[currentIndex - 1];
    const limits = TIER_LIMITS[targetTierName];
    
    if (limits) {
      const diffs: BoundaryDiff[] = [];
      
      if (weight > limits.weight) diffs.push(getWeightDiff('重量', weight, limits.weight));
      if (limits.longest && longest > limits.longest) diffs.push(getDimDiff('最长边', longest, limits.longest));
      if (limits.median && median > limits.median) diffs.push(getDimDiff('次长边', median, limits.median));
      if (limits.shortest && shortest > limits.shortest) diffs.push(getDimDiff('最短边', shortest, limits.shortest));
      if (limits.girthLen && girthLen > limits.girthLen) diffs.push(getDimDiff('长+围', girthLen, limits.girthLen));

      analysis.cheaperTier = {
        name: targetTierName,
        diffs: diffs,
        canQualify: diffs.length > 0
      };
    }
  }

  // 2. Analyze Current Tier Limit (Buffer)
  const currentLimits = TIER_LIMITS[currentTier];
  // If we are in XL tiers, the limits defined in TIER_LIMITS are mostly null (no ceiling), so skip dim checks
  if (currentLimits) {
    const buffers: BoundaryDiff[] = [];
    
    if (currentLimits.weight < 90000) { // arbitrary high number check
        buffers.push({
          label: '重量',
          current: fromPounds(weight, displayWeightUnit),
          limit: fromPounds(currentLimits.weight, displayWeightUnit),
          diff: fromPounds(currentLimits.weight - weight, displayWeightUnit),
          unit: displayWeightUnit
        });
    }

    if (currentLimits.longest) {
      buffers.push({
        label: '最长边',
        current: fromInches(longest, displayDimUnit),
        limit: fromInches(currentLimits.longest, displayDimUnit),
        diff: fromInches(currentLimits.longest - longest, displayDimUnit),
        unit: displayDimUnit
      });
    }

    if (currentLimits.median) {
      buffers.push({
        label: '次长边',
        current: fromInches(median, displayDimUnit),
        limit: fromInches(currentLimits.median, displayDimUnit),
        diff: fromInches(currentLimits.median - median, displayDimUnit),
        unit: displayDimUnit
      });
    }
    if (currentLimits.shortest) {
      buffers.push({
        label: '最短边',
        current: fromInches(shortest, displayDimUnit),
        limit: fromInches(currentLimits.shortest, displayDimUnit),
        diff: fromInches(currentLimits.shortest - shortest, displayDimUnit),
        unit: displayDimUnit
      });
    }
    if (currentLimits.girthLen) {
      buffers.push({
        label: '长+围',
        current: fromInches(girthLen, displayDimUnit),
        limit: fromInches(currentLimits.girthLen, displayDimUnit),
        diff: fromInches(currentLimits.girthLen - girthLen, displayDimUnit),
        unit: displayDimUnit
      });
    }

    if (buffers.length > 0) {
        analysis.currentTierLimit = {
          name: currentTier,
          diffs: buffers
        };
    }
  }

  // 3. Analyze Fee Weight Brackets
  analysis.shippingWeightAnalysis = analyzeWeightSteps(currentTier, shippingWeight, displayWeightUnit);

  return analysis;
};

export const calculateFBA = (input: ProductInput): CalculationResult => {
  // 1. Normalize Units
  const l = toInches(input.length, input.dimUnit);
  const w = toInches(input.width, input.dimUnit);
  const h = toInches(input.height, input.dimUnit);
  const unitWeight = toPounds(input.weight, input.weightUnit);

  // 2. Sort Dimensions
  const sortedDims = [l, w, h].sort((a, b) => a - b);
  const [shortest, median, longest] = sortedDims;
  const girth = (shortest + median) * 2;
  const lengthPlusGirth = longest + girth;

  // 3. Determine Tier
  let tier = SizeTier.SPECIAL_OVERSIZE;
  const limits = TIER_LIMITS;

  if (
    unitWeight <= limits[SizeTier.SMALL_STANDARD].weight &&
    longest <= limits[SizeTier.SMALL_STANDARD].longest! &&
    median <= limits[SizeTier.SMALL_STANDARD].median! &&
    shortest <= limits[SizeTier.SMALL_STANDARD].shortest!
  ) {
    tier = SizeTier.SMALL_STANDARD;
  }
  else if (
    unitWeight <= limits[SizeTier.LARGE_STANDARD].weight &&
    longest <= limits[SizeTier.LARGE_STANDARD].longest! &&
    median <= limits[SizeTier.LARGE_STANDARD].median! &&
    shortest <= limits[SizeTier.LARGE_STANDARD].shortest!
  ) {
    tier = SizeTier.LARGE_STANDARD;
  }
  else if (
    unitWeight <= limits[SizeTier.LARGE_BULKY].weight &&
    longest <= limits[SizeTier.LARGE_BULKY].longest! &&
    median <= limits[SizeTier.LARGE_BULKY].median! &&
    lengthPlusGirth <= limits[SizeTier.LARGE_BULKY].girthLen!
  ) {
    tier = SizeTier.LARGE_BULKY;
  }
  else {
    if (unitWeight < 50) tier = SizeTier.EXTRA_LARGE_0_50;
    else if (unitWeight < 70) tier = SizeTier.EXTRA_LARGE_50_70;
    else tier = SizeTier.EXTRA_LARGE_70_PLUS;
  }

  // 4. Low-Price FBA Check
  // Effective 2024: Price < $10 and is Standard Size (Small or Large)
  // Low-Price FBA replaces Small and Light
  let program: 'Standard FBA' | 'Low-Price FBA' = 'Standard FBA';
  let estimatedFee = 0;
  
  const isStandardSize = (tier === SizeTier.SMALL_STANDARD || tier === SizeTier.LARGE_STANDARD);
  
  // Use price from input (default to 0 if not provided)
  const price = input.price || 0;

  if (price > 0 && price < 10 && isStandardSize) {
     const lowPriceFee = getLowPriceFee(tier, Math.max(unitWeight, (l*w*h)/139), input.category);
     if (lowPriceFee !== null) {
        program = 'Low-Price FBA';
        estimatedFee = lowPriceFee;
     } else {
        // Fallback to standard if something fails
        estimatedFee = getFee(tier, Math.max(unitWeight, (l*w*h)/139), input.category);
     }
  } else {
    // 5. Calculate Dim Weight (Divisor 139) & Shipping Weight for Standard
    const dimWeight = (l * w * h) / 139;
    let shippingWeight = unitWeight;
    
    // For Standard FBA:
    // Small Standard: Unit Weight
    // Large Standard: Max(Unit, Dim)
    // Oversize: Max(Unit, Dim)
    
    // As of 2024, Small Standard also uses Dim Weight if > Unit Weight? 
    // Actually, Low-Price uses Dim Weight for Large Std.
    // Standard FBA Small Standard: usually unit weight, but let's stick to reliable Max(Unit, Dim) for general safety or check exact policy.
    // Current policy: All size tiers (except really small ones previously) apply dim weight.
    // Let's use Max(Unit, Dim) generally for Large Std and Oversize.
    // Small Standard is often exempt or uses unit weight if < 0.75lb? 
    // Simplified: Large Std+ always uses greater. Small Std uses Unit Weight.
    
    if (tier === SizeTier.SMALL_STANDARD) {
      shippingWeight = unitWeight;
    } else {
      shippingWeight = Math.max(unitWeight, dimWeight);
    }
    
    estimatedFee = getFee(tier, shippingWeight, input.category);
  }

  // Re-calc shipping weight for final display logic (unified)
  const dimWeight = (l * w * h) / 139;
  let finalShippingWeight = unitWeight;
  if (tier === SizeTier.SMALL_STANDARD && program === 'Standard FBA') {
     finalShippingWeight = unitWeight;
  } else {
     finalShippingWeight = Math.max(unitWeight, dimWeight);
  }

  // 6. Analysis
  const analysis = calculateAnalysis(
    tier, 
    longest, 
    median, 
    shortest, 
    unitWeight,
    finalShippingWeight,
    lengthPlusGirth,
    input.dimUnit,
    input.weightUnit
  );

  return {
    tier,
    program,
    shippingWeightLbs: finalShippingWeight,
    dimensionalWeightLbs: dimWeight,
    unitWeightLbs: unitWeight,
    estimatedFee,
    dimensionsInches: { l, w, h },
    sortedDimensions: { longest, median, shortest },
    lengthPlusGirthInches: lengthPlusGirth,
    isOversize: tier !== SizeTier.SMALL_STANDARD && tier !== SizeTier.LARGE_STANDARD,
    analysis,
    dimUnit: input.dimUnit,
    weightUnit: input.weightUnit
  };
};
