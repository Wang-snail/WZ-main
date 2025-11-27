import { FeeCategory, FeePeriod, SizeTier, Language } from './types';

// Labels for UI
export const FEE_PERIOD_LABELS: Record<FeePeriod, Record<Language, string>> = {
  [FeePeriod.STANDARD_2024]: {
    en: '2024 Standard (Feb 5 - Sep 30)',
    zh: '2024 标准费率 (2月5日 - 9月30日)',
    ja: '2024 通常期 (2/5 - 9/30)',
    ru: '2024 Стандарт (5 фев - 30 сен)',
    fr: '2024 Standard (5 Fév - 30 Sep)'
  },
  [FeePeriod.HOLIDAY_2024]: {
    en: '2024 Holiday (Oct 1 - Jan 14)',
    zh: '2024 旺季费率 (10月1日 - 1月14日)',
    ja: '2024 繁忙期 (10/1 - 1/14)',
    ru: '2024 Праздничный (1 окт - 14 янв)',
    fr: '2024 Fêtes (1 Oct - 14 Jan)'
  },
  [FeePeriod.STANDARD_2025]: {
    en: '2025 Standard (Jan 15+ Est.)',
    zh: '2025 预估标准费率 (1月15日后)',
    ja: '2025 通常期予想 (1/15以降)',
    ru: '2025 Оценка (после 15 янв)',
    fr: '2025 Standard (15 Jan+ Est.)'
  }
};

export const CATEGORY_LABELS: Record<FeeCategory, Record<Language, string>> = {
  [FeeCategory.AMAZON_DEVICE_ACCESSORIES]: {
    en: 'Amazon Device Accessories',
    zh: '亚马逊设备配件',
    ja: 'Amazonデバイスアクセサリ',
    ru: 'Аксессуары для устройств Amazon',
    fr: 'Accessoires pour appareils Amazon'
  },
  [FeeCategory.BABY_PRODUCTS]: {
    en: 'Baby Products',
    zh: '母婴用品',
    ja: 'ベビー用品',
    ru: 'Товары для малышей',
    fr: 'Produits pour bébés'
  },
  [FeeCategory.BOOKS]: {
    en: 'Books',
    zh: '书籍',
    ja: '本',
    ru: 'Книги',
    fr: 'Livres'
  },
  [FeeCategory.CAMERA_PHOTO]: {
    en: 'Camera and Photo',
    zh: '相机与摄影',
    ja: 'カメラ・写真',
    ru: 'Камеры и фото',
    fr: 'Appareils photo et vidéo'
  },
  [FeeCategory.CLOTHING]: {
    en: 'Clothing & Accessories',
    zh: '服装与配饰',
    ja: '服＆ファッション小物',
    ru: 'Одежда и аксессуары',
    fr: 'Vêtements et accessoires'
  },
  [FeeCategory.CONSUMER_ELECTRONICS]: {
    en: 'Consumer Electronics',
    zh: '消费电子',
    ja: '家電・カメラ',
    ru: 'Бытовая электроника',
    fr: 'Électronique grand public'
  },
  [FeeCategory.HOME_GARDEN]: {
    en: 'Home & Garden',
    zh: '家居与园艺',
    ja: 'ホーム＆キッチン',
    ru: 'Дом и сад',
    fr: 'Maison et jardin'
  },
  [FeeCategory.KITCHEN]: {
    en: 'Kitchen',
    zh: '厨房用品',
    ja: 'キッチン用品',
    ru: 'Кухня',
    fr: 'Cuisine'
  },
  [FeeCategory.TOYS_GAMES]: {
    en: 'Toys & Games',
    zh: '玩具与游戏',
    ja: 'おもちゃ・ゲーム',
    ru: 'Игрушки и игры',
    fr: 'Jouets et jeux'
  },
  [FeeCategory.OTHER]: {
    en: 'Everything Else',
    zh: '其他',
    ja: 'その他',
    ru: 'Все остальное',
    fr: 'Tout le reste'
  }
};

export const REFERRAL_FEE_RATES: Record<FeeCategory, number> = {
  [FeeCategory.AMAZON_DEVICE_ACCESSORIES]: 0.45,
  [FeeCategory.BABY_PRODUCTS]: 0.15,
  [FeeCategory.BOOKS]: 0.15,
  [FeeCategory.CAMERA_PHOTO]: 0.08,
  [FeeCategory.CLOTHING]: 0.17,
  [FeeCategory.CONSUMER_ELECTRONICS]: 0.08,
  [FeeCategory.HOME_GARDEN]: 0.15,
  [FeeCategory.KITCHEN]: 0.15,
  [FeeCategory.TOYS_GAMES]: 0.15,
  [FeeCategory.OTHER]: 0.15
};

export const MIN_REFERRAL_FEE = 0.30;

// FBA Fulfillment Fees
// Structure: [MaxWeight(lb), Fee($)]
export const FBA_FEES_2024: Record<SizeTier, Array<[number, number]>> = {
  [SizeTier.SMALL_STANDARD]: [[0.25, 3.22], [0.50, 3.40], [0.75, 3.58], [1.0, 3.77]],
  [SizeTier.LARGE_STANDARD]: [[0.25, 3.86], [0.50, 4.08], [0.75, 4.34], [1.0, 4.71], [1.5, 5.17], [2.0, 5.57], [3.0, 6.44]],
  [SizeTier.SMALL_OVERSIZE]: [[70, 9.73]], 
  [SizeTier.MEDIUM_OVERSIZE]: [[150, 19.05]],
  [SizeTier.LARGE_OVERSIZE]: [[150, 89.98]],
  [SizeTier.SPECIAL_OVERSIZE]: [[150, 158.49]]
};

// Storage Fees per cubic foot
export const STORAGE_FEES: Record<FeePeriod, number> = {
  [FeePeriod.STANDARD_2024]: 0.78,
  [FeePeriod.HOLIDAY_2024]: 2.40,
  [FeePeriod.STANDARD_2025]: 0.83 
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Profit': '#10b981',        // Emerald
  'Product Cost': '#3b82f6',  // Blue
  'Headhaul': '#6366f1',      // Indigo
  'Tailhaul': '#f59e0b',      // Amber
  'Commission': '#8b5cf6',    // Violet
  'Ads': '#ec4899',           // Pink
  'Other Costs': '#94a3b8'    // Slate
};