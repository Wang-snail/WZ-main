/**
 * RadarChartComponent 测试
 * 测试雷达图组件的基本功能和交互特性
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RadarChartComponent from '../RadarChartComponent';
import { useCompetitorAnalysisStore } from '../../store/competitorAnalysisStore';

// Mock ECharts
vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    on: vi.fn(),
    dispose: vi.fn(),
    resize: vi.fn(),
    getDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data')
  }))
}));

// Mock jsPDF
vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    addImage: vi.fn(),
    save: vi.fn()
  }))
}));

// Mock store
vi.mock('../../store/competitorAnalysisStore', () => ({
  useCompetitorAnalysisStore: vi.fn()
}));

const mockAnalysisResult = {
  profitAnalysis: {
    margin: 50,
    marginRate: 0.25,
    roiMonths: 12
  },
  radarScores: {
    profitability: 8.5,
    roiSpeed: 7.2,
    portability: 6.8,
    features: 9.1,
    priceAdvantage: 7.5
  },
  insights: {
    advantages: ['高利润空间', '功能丰富'],
    risks: ['便携性一般'],
    recommendations: ['优化产品尺寸']
  },
  timestamp: new Date(),
  sessionId: 'test-session'
};

describe('RadarChartComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCompetitorAnalysisStore as any).mockReturnValue({
      analysisResult: mockAnalysisResult,
      roleView: 'retail'
    });
  });

  it('应该正确渲染雷达图组件', () => {
    render(<RadarChartComponent />);
    
    expect(screen.getByText('竞争力雷达图')).toBeInTheDocument();
    expect(screen.getByText(/五维度产品竞争力评估/)).toBeInTheDocument();
  });

  it('应该显示导出按钮', () => {
    render(<RadarChartComponent showExportButton={true} />);
    
    expect(screen.getByText('导出图表')).toBeInTheDocument();
  });

  it('应该在点击导出按钮时显示格式选项', async () => {
    render(<RadarChartComponent showExportButton={true} />);
    
    const exportButton = screen.getByText('导出图表');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText('PNG 图片')).toBeInTheDocument();
      expect(screen.getByText('SVG 矢量图')).toBeInTheDocument();
      expect(screen.getByText('PDF 文档')).toBeInTheDocument();
    });
  });

  it('应该显示所有五个维度的详细信息', () => {
    render(<RadarChartComponent showDetails={true} />);
    
    expect(screen.getByText('利润空间')).toBeInTheDocument();
    expect(screen.getByText('ROI速度')).toBeInTheDocument();
    expect(screen.getByText('便携指数')).toBeInTheDocument();
    expect(screen.getByText('功能丰富度')).toBeInTheDocument();
    expect(screen.getByText('价格竞争力')).toBeInTheDocument();
  });

  it('应该显示综合评分', () => {
    render(<RadarChartComponent />);
    
    expect(screen.getByText('综合竞争力评分')).toBeInTheDocument();
    
    // 计算平均分: (8.5 + 7.2 + 6.8 + 9.1 + 7.5) / 5 = 7.82
    expect(screen.getByText('7.8')).toBeInTheDocument();
  });

  it('应该根据角色视图显示不同的标题', () => {
    // 测试零售PM视图
    render(<RadarChartComponent />);
    expect(screen.getByText('五维度产品竞争力评估（零售PM视角）')).toBeInTheDocument();

    // 测试制造PM视图
    (useCompetitorAnalysisStore as any).mockReturnValue({
      analysisResult: mockAnalysisResult,
      roleView: 'manufacturing'
    });
    
    render(<RadarChartComponent />);
    expect(screen.getByText('五维度产品竞争力评估（制造PM视角）')).toBeInTheDocument();
  });

  it('应该在没有分析结果时显示空状态', () => {
    (useCompetitorAnalysisStore as any).mockReturnValue({
      analysisResult: null,
      roleView: 'retail'
    });

    render(<RadarChartComponent />);
    
    expect(screen.getByText('暂无分析数据')).toBeInTheDocument();
    expect(screen.getByText('请先完成竞品分析流程')).toBeInTheDocument();
  });

  it('应该正确显示评分等级', () => {
    render(<RadarChartComponent showDetails={true} />);
    
    // 功能丰富度得分 9.1 应该显示为"优秀"
    const featureCards = screen.getAllByText('优秀');
    expect(featureCards.length).toBeGreaterThan(0);
  });
});