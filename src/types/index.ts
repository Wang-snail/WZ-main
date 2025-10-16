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

// 电商经验教训相关类型定义
export interface KajianLesson {
  id: string;
  title: string;
  category: 'success' | 'failure' | 'operation' | 'product' | 'marketing' | 'other';
  tags: string[];
  importance: 1 | 2 | 3 | 4 | 5; // 1-5星重要程度
  date: string; // 日期 YYYY-MM-DD
  summary: string; // 简短摘要
  background: string; // 背景描述
  process: string; // 过程描述
  result: string; // 结果
  lesson: string; // 教训/经验总结
  keyPoints: string[]; // 关键要点
  financialData?: {
    investment?: number; // 投入成本
    revenue?: number; // 产出收益
    profit?: number; // 利润
    roi?: number; // ROI（投资回报率）
  };
  relatedProducts?: string[]; // 相关产品
  relatedLinks?: Array<{
    title: string;
    url: string;
  }>;
  images?: string[]; // 相关图片
  createdAt: string;
  updatedAt: string;
}

export interface KajianCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
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

// 电商社区问答相关类型定义
export interface CommunityUser {
  id: string;
  name: string;
  avatar?: string;
  role?: 'expert' | 'user' | 'admin';
  reputation?: number; // 声望值
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  author: CommunityUser;
  upvotes: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  author: CommunityUser;
  category: 'operation' | 'product' | 'marketing' | 'tools' | 'strategy' | 'other';
  tags: string[];
  views: number;
  answers: Answer[];
  upvotes: number;
  hasAcceptedAnswer: boolean;
  createdAt: string;
  updatedAt: string;
  isSolved: boolean;
}

export interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  count: number;
}