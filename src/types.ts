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
