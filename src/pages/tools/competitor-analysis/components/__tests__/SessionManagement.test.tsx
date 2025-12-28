/**
 * 会话管理组件测试
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SessionManagement from '../SessionManagement';
import { useCompetitorAnalysisStore, selectSessionState, selectAnalysisData } from '../../store/competitorAnalysisStore';
import type { AnalysisSession, BaseProduct, CompetitorData, AnalysisResult } from '../../types';

// Mock the store
vi.mock('../../store/competitorAnalysisStore', () => ({
  useCompetitorAnalysisStore: vi.fn(),
  selectSessionState: vi.fn(),
  selectAnalysisData: vi.fn()
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Bookmark: () => <div data-testid="bookmark-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  X: () => <div data-testid="x-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  Search: () => <div data-testid="search-icon" />
}));

// Mock SessionHistoryManager
vi.mock('../SessionHistoryManager', () => ({
  default: () => <div data-testid="session-history-manager">Session History Manager</div>
}));

describe('SessionManagement', () => {
  const mockStore = {
    saveCurrentSession: vi.fn(),
    loadSession: vi.fn(),
    deleteSession: vi.fn(),
    updateSession: vi.fn(),
    toggleHistory: vi.fn(),
    ui: {
      showHistory: false
    }
  };

  const mockSessionState = {
    currentSessionId: 'session-1',
    sessions: [],
    hasActiveSessions: false
  };

  const mockAnalysisData = {
    hasCompleteData: true
  };

  const mockBaseProduct: BaseProduct = {
    id: 'product-1',
    name: 'Test Product',
    cost: 100,
    weight: 500,
    dimensions: { length: 10, width: 5, height: 3 },
    fixedInvestment: 10000,
    estimatedMonthlySales: 1000,
    features: ['feature1', 'feature2'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockCompetitorData: CompetitorData = {
    price: 150,
    weight: 600,
    dimensions: { length: 12, width: 6, height: 4 },
    features: ['competitor-feature1'],
    extractionConfidence: {
      price: 0.9,
      weight: 0.8,
      dimensions: 0.7,
      features: 0.85
    },
    rawText: 'Test competitor text',
    extractedAt: new Date()
  };

  const mockAnalysisResult: AnalysisResult = {
    profitAnalysis: {
      margin: 50,
      marginRate: 0.33,
      roiMonths: 12
    },
    radarScores: {
      profitability: 8,
      roiSpeed: 7,
      portability: 6,
      features: 7,
      priceAdvantage: 8
    },
    insights: {
      advantages: ['Good profit margin'],
      risks: ['High competition'],
      recommendations: ['Consider pricing strategy']
    },
    timestamp: new Date(),
    sessionId: 'session-1'
  };

  const mockSession: AnalysisSession = {
    id: 'session-1',
    name: 'Test Session',
    description: 'Test session description',
    baseProduct: mockBaseProduct,
    competitorData: mockCompetitorData,
    analysisResult: mockAnalysisResult,
    roleView: 'retail',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the main store with selectors
    vi.mocked(useCompetitorAnalysisStore).mockImplementation((selector) => {
      if (selector === selectSessionState) {
        return mockSessionState;
      }
      if (selector === selectAnalysisData) {
        return mockAnalysisData;
      }
      return mockStore;
    });
  });

  it('renders session management buttons when has complete data', () => {
    render(<SessionManagement />);
    
    expect(screen.getByText('保存会话')).toBeInTheDocument();
    expect(screen.getByText(/历史记录/)).toBeInTheDocument();
  });

  it('shows save session button when no current session', () => {
    vi.mocked(useCompetitorAnalysisStore).mockImplementation((selector) => {
      if (selector === selectSessionState) {
        return {
          ...mockSessionState,
          currentSessionId: null
        };
      }
      if (selector === selectAnalysisData) {
        return mockAnalysisData;
      }
      return mockStore;
    });

    render(<SessionManagement />);
    
    expect(screen.getByText('保存会话')).toBeInTheDocument();
  });

  it('does not show save button when no complete data', () => {
    vi.mocked(useCompetitorAnalysisStore).mockImplementation((selector) => {
      if (selector === selectSessionState) {
        return mockSessionState;
      }
      if (selector === selectAnalysisData) {
        return {
          hasCompleteData: false
        };
      }
      return mockStore;
    });

    render(<SessionManagement />);
    
    expect(screen.queryByText('保存会话')).not.toBeInTheDocument();
    expect(screen.queryByText('更新会话')).not.toBeInTheDocument();
  });

  it('opens save dialog when save button is clicked', () => {
    render(<SessionManagement />);
    
    const saveButton = screen.getByRole('button', { name: /保存会话/ });
    fireEvent.click(saveButton);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('会话名称 *')).toBeInTheDocument();
  });

  it('opens history panel when history button is clicked', () => {
    render(<SessionManagement />);
    
    const historyButton = screen.getByText(/历史记录/);
    fireEvent.click(historyButton);
    
    expect(mockStore.toggleHistory).toHaveBeenCalled();
  });

  it('shows history panel when showHistory is true', () => {
    mockStore.ui.showHistory = true;
    
    render(<SessionManagement />);
    
    expect(screen.getByText('历史会话 (0)')).toBeInTheDocument();
    expect(screen.getByTestId('session-history-manager')).toBeInTheDocument();
  });

  it('saves session with name and description', async () => {
    mockStore.saveCurrentSession.mockResolvedValue(undefined);
    
    render(<SessionManagement />);
    
    // Open save dialog
    const saveButton = screen.getByText('保存会话');
    fireEvent.click(saveButton);
    
    // Fill form
    const nameInput = screen.getByLabelText('会话名称 *');
    const descriptionInput = screen.getByLabelText('会话描述');
    
    fireEvent.change(nameInput, { target: { value: 'New Session Name' } });
    fireEvent.change(descriptionInput, { target: { value: 'New session description' } });
    
    // Submit form
    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockStore.saveCurrentSession).toHaveBeenCalledWith(
        'New Session Name',
        'New session description'
      );
    });
  });

  it('validates required session name', () => {
    render(<SessionManagement />);
    
    // Open save dialog
    const saveButton = screen.getByText('保存会话');
    fireEvent.click(saveButton);
    
    // Try to submit without name
    const submitButton = screen.getByText('保存');
    expect(submitButton).toBeDisabled();
    
    // Add name
    const nameInput = screen.getByLabelText('会话名称 *');
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });
    
    expect(submitButton).not.toBeDisabled();
  });

  it('closes save dialog when cancel is clicked', () => {
    render(<SessionManagement />);
    
    // Open save dialog
    const saveButton = screen.getByRole('button', { name: /保存会话/ });
    fireEvent.click(saveButton);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Click cancel
    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByLabelText('会话名称 *')).not.toBeInTheDocument();
  });

  it('shows session count in history button', () => {
    vi.mocked(useCompetitorAnalysisStore).mockImplementation((selector) => {
      if (selector === selectSessionState) {
        return {
          ...mockSessionState,
          sessions: [mockSession, { ...mockSession, id: 'session-2' }]
        };
      }
      if (selector === selectAnalysisData) {
        return mockAnalysisData;
      }
      return mockStore;
    });

    render(<SessionManagement />);
    
    expect(screen.getByText('历史记录 (2)')).toBeInTheDocument();
  });

  it('handles save session error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockStore.saveCurrentSession.mockRejectedValue(new Error('Save failed'));
    
    render(<SessionManagement />);
    
    // Open save dialog and submit
    const saveButton = screen.getByText('保存会话');
    fireEvent.click(saveButton);
    
    const nameInput = screen.getByLabelText('会话名称 *');
    fireEvent.change(nameInput, { target: { value: 'Test Session' } });
    
    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save session:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });
});