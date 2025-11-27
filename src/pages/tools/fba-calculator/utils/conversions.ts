import { DimensionUnit, WeightUnit } from '../types';

export const toInches = (value: number, unit: DimensionUnit): number => {
  if (unit === DimensionUnit.CM) {
    return value / 2.54;
  }
  return value;
};

export const fromInches = (inches: number, targetUnit: DimensionUnit): number => {
  if (targetUnit === DimensionUnit.CM) {
    return inches * 2.54;
  }
  return inches;
};

export const toPounds = (value: number, unit: WeightUnit): number => {
  switch (unit) {
    case WeightUnit.OZ:
      return value / 16;
    case WeightUnit.KG:
      return value * 2.20462;
    case WeightUnit.G:
      return value * 0.00220462;
    default:
      return value;
  }
};

export const fromPounds = (lbs: number, targetUnit: WeightUnit): number => {
  switch (targetUnit) {
    case WeightUnit.OZ:
      return lbs * 16;
    case WeightUnit.KG:
      return lbs / 2.20462;
    case WeightUnit.G:
      return lbs / 0.00220462;
    default:
      return lbs;
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatWeight = (lbs: number): string => {
  return `${lbs.toFixed(2)} lb`;
};
