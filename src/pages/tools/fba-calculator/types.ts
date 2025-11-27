
export enum DimensionUnit {
  INCHES = 'in',
  CM = 'cm'
}

export enum WeightUnit {
  LB = 'lb',
  OZ = 'oz',
  KG = 'kg',
  G = 'g'
}

export enum ProductCategory {
  STANDARD = '标准件',
  APPAREL = '服装',
  DANGEROUS_GOODS = '危险品'
}

export enum SizeTier {
  SMALL_STANDARD = '小号标准尺寸',
  LARGE_STANDARD = '大号标准尺寸',
  LARGE_BULKY = '大号大件',
  EXTRA_LARGE_0_50 = '超大号 (0-50 磅)',
  EXTRA_LARGE_50_70 = '超大号 (50-70 磅)',
  EXTRA_LARGE_70_PLUS = '超大号 (70+ 磅)',
  SPECIAL_OVERSIZE = '特殊大件' // Fallback
}

export interface ProductInput {
  length: number;
  width: number;
  height: number;
  weight: number;
  price?: number;
  dimUnit: DimensionUnit;
  weightUnit: WeightUnit;
  category: ProductCategory;
}

// Analysis for a specific dimension or weight against a target limit
export interface BoundaryDiff {
  label: string;
  current: number;
  limit: number;
  diff: number; // Positive means exceeds limit (bad for downgrade), Negative means under limit (good)
  unit: string;
}

export interface WeightBracketAnalysis {
  currentBracketCeiling: number; // The upper limit of current fee bracket (lbs)
  prevBracketCeiling?: number;   // The upper limit of the cheaper bracket (lbs)
  bufferToNextTier: number;      // How much weight can be added before price goes up (lbs)
  reductionToPrevTier?: number;  // How much weight to remove to get cheaper price (lbs)
  displayUnit: WeightUnit;
}

export interface TierAnalysis {
  cheaperTier?: {
    name: SizeTier;
    diffs: BoundaryDiff[]; // Differences causing us to miss this tier
    canQualify: boolean; // true if only minor changes needed (logic dependent)
  };
  currentTierLimit?: {
    name: SizeTier; // The current tier's upper limits
    diffs: BoundaryDiff[]; // Remaining buffer before hitting next tier
  };
  shippingWeightAnalysis?: WeightBracketAnalysis; // New: Fee level weight steps
}

export interface CalculationResult {
  tier: SizeTier;
  program: 'Standard FBA' | 'Low-Price FBA';
  shippingWeightLbs: number;
  dimensionalWeightLbs: number;
  unitWeightLbs: number;
  estimatedFee: number;
  dimensionsInches: { l: number; w: number; h: number };
  sortedDimensions: { longest: number; median: number; shortest: number };
  lengthPlusGirthInches: number; // Added for verification
  isOversize: boolean;
  analysis: TierAnalysis;
  // Pass through units for display
  dimUnit: DimensionUnit;
  weightUnit: WeightUnit;
}
