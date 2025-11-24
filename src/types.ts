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
