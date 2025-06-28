// src/types/index.ts

export interface DivinationResult {
  id: string;
  service: string;
  input: any;
  result: string;
  timestamp: Date | string;
  type: string;
  interpretation?: string;
  advice?: string;
  metadata?: any;
}

export interface DivinationService {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}