export enum FeeCategory {
  AMAZON_DEVICE_ACCESSORIES = 'Amazon Device Accessories',
  BABY_PRODUCTS = 'Baby Products',
  BOOKS = 'Books',
  CAMERA_PHOTO = 'Camera and Photo',
  CLOTHING = 'Clothing & Accessories',
  CONSUMER_ELECTRONICS = 'Consumer Electronics',
  HOME_GARDEN = 'Home & Garden',
  KITCHEN = 'Kitchen',
  TOYS_GAMES = 'Toys & Games',
  OTHER = 'Everything Else'
}

export enum SizeTier {
  SMALL_STANDARD = 'Small Standard',
  LARGE_STANDARD = 'Large Standard',
  SMALL_OVERSIZE = 'Small Oversize',
  MEDIUM_OVERSIZE = 'Medium Oversize',
  LARGE_OVERSIZE = 'Large Oversize',
  SPECIAL_OVERSIZE = 'Special Oversize'
}

export enum FeePeriod {
  STANDARD_2024 = '2024_STANDARD', // Feb 5 - Sep 30
  HOLIDAY_2024 = '2024_HOLIDAY',   // Oct 1 - Jan 14
  STANDARD_2025 = '2025_STANDARD'  // Est. Jan 15+
}

export enum Language {
  EN = 'en',
  ZH = 'zh',
  JA = 'ja',
  RU = 'ru',
  FR = 'fr'
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface ProductInput {
  name: string;
  price: number;
  cost: number; // COGS
  category: FeeCategory;
  dimensions: ProductDimensions;
  shippingCost: number; // Headhaul / Inbound shipping
  advertisingCost: number; // Ad spend per unit
  miscCost: number; // Prep, labeling, etc.
  feePeriod: FeePeriod;
}

export interface FeeBreakdown {
  referralFee: number;
  fulfillmentFee: number;
  storageFee: number;
  closingFee: number;
  totalFees: number;
}

export interface CalculationStep {
  label: string;
  formula: string;
  result: string;
  note?: string;
}

export interface ProfitResult {
  revenue: number;
  totalCost: number; // COGS + Shipping + Misc + Ads
  netProfit: number;
  margin: number; // Percentage
  roi: number; // Return on Investment %
  breakdown: FeeBreakdown;
  sizeTier: SizeTier;
  calculationTrace: CalculationStep[]; // The theoretical steps
}