// src/types.ts

export interface DivinationResult {
  id: string;
  service: string;
  input: any;
  result: string;
  timestamp: Date;
  type: string;
}

export interface UserState {
  freeUsed: boolean;
  totalUsage: number;
  lastUsageDate: string;
}

export interface AITool {
  id: number | string;
  name: string;
  description: string;
  link: string;
  category: string;
  vpn_required?: boolean;
  hot_score?: number;
  hot?: boolean;
  popularity: {
    views: number;
    favorites: number;
  };
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  count: number;
  tools?: string[];
}

export interface KajianFinancialData {
  investment: number;
  revenue: number;
  profit: number;
  roi: number;
}

export interface KajianLink {
  title: string;
  url: string;
}

export interface KajianLesson {
  id: string;
  title: string;
  category: string;
  tags: string[];
  importance: number;
  date: string;
  summary: string;
  background?: string;
  process?: string;
  result?: string;
  lesson?: string;
  keyPoints?: string[];
  financialData?: KajianFinancialData;
  relatedProducts?: string[];
  relatedLinks?: KajianLink[];
  createdAt?: string;
  updatedAt?: string;
}

export interface KajianCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface KajianStats {
  totalLessons: number;
  successCount: number;
  failureCount: number;
  totalInvestment: number;
  totalRevenue: number;
  totalProfit: number;
  avgROI: number;
}
