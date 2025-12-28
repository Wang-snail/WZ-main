/**
 * RoleViewSwitcher 组件测试
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoleViewSwitcher from '../RoleViewSwitcher';

// Mock store
const mockSwitchRoleView = vi.fn();
const mockUpdatePreferences = vi.fn();

vi.mock('../../store/competitorAnalysisStore', () => ({
  useCompetitorAnalysisStore: () => ({
    roleView: 'retail',
    switchRoleView: mockSwitchRoleView,
    updatePreferences: mockUpdatePreferences
  })
}));

describe('RoleViewSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders role switcher with both role options', () => {
    render(<RoleViewSwitcher />);
    
    expect(screen.getByText('选择分析视角')).toBeInTheDocument();
    expect(screen.getAllByText('线上零售PM')).toHaveLength(2); // One in card, one in current selection
    expect(screen.getByText('生产工厂PM')).toBeInTheDocument();
    expect(screen.getByText('专注于市场定价和利润优化')).toBeInTheDocument();
    expect(screen.getByText('专注于成本控制和工艺对比')).toBeInTheDocument();
  });

  it('shows current role selection', () => {
    render(<RoleViewSwitcher />);
    
    expect(screen.getByText('当前视角：')).toBeInTheDocument();
    // Check that retail PM is shown as current selection
    const currentSelection = screen.getByText('当前视角：').parentElement;
    expect(currentSelection).toHaveTextContent('线上零售PM');
  });

  it('displays focus areas for each role', () => {
    render(<RoleViewSwitcher />);
    
    // Retail PM focus areas
    expect(screen.getByText('利润空间')).toBeInTheDocument();
    expect(screen.getByText('ROI速度')).toBeInTheDocument();
    expect(screen.getByText('价格竞争力')).toBeInTheDocument();
    
    // Manufacturing PM focus areas
    expect(screen.getByText('便携指数')).toBeInTheDocument();
    expect(screen.getByText('成本控制')).toBeInTheDocument();
    expect(screen.getByText('功能丰富度')).toBeInTheDocument();
  });

  it('calls switchRoleView and updatePreferences when role is changed', () => {
    render(<RoleViewSwitcher />);
    
    const manufacturingRole = screen.getByLabelText('切换到生产工厂PM视角');
    fireEvent.click(manufacturingRole);
    
    expect(mockSwitchRoleView).toHaveBeenCalledWith('manufacturing');
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ defaultRoleView: 'manufacturing' });
  });

  it('supports keyboard navigation', () => {
    render(<RoleViewSwitcher />);
    
    const manufacturingRole = screen.getByLabelText('切换到生产工厂PM视角');
    fireEvent.keyDown(manufacturingRole, { key: 'Enter' });
    
    expect(mockSwitchRoleView).toHaveBeenCalledWith('manufacturing');
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ defaultRoleView: 'manufacturing' });
  });

  it('does not call functions when clicking the same role', () => {
    render(<RoleViewSwitcher />);
    
    const retailRole = screen.getByLabelText('切换到线上零售PM视角');
    fireEvent.click(retailRole);
    
    expect(mockSwitchRoleView).not.toHaveBeenCalled();
    expect(mockUpdatePreferences).not.toHaveBeenCalled();
  });
});