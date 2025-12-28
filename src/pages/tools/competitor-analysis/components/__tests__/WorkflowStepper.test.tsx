/**
 * WorkflowStepper 组件测试
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkflowStepper from '../WorkflowStepper';
import type { WorkflowStep, StepStatus } from '../../store/competitorAnalysisStore';

// Mock store
const mockJumpToStep = vi.fn();

let mockWorkflowState = {
  currentStep: 'config' as WorkflowStep,
  stepStatus: {
    config: 'processing' as StepStatus,
    input: 'pending' as StepStatus,
    extract: 'pending' as StepStatus,
    analyze: 'pending' as StepStatus,
    result: 'pending' as StepStatus
  }
};

// Mock the store hook to return different values based on selector
vi.mock('../../store/competitorAnalysisStore', () => ({
  selectWorkflowState: vi.fn(() => mockWorkflowState),
  useCompetitorAnalysisStore: vi.fn((selector) => {
    if (selector) {
      // When called with selector, return the workflow state
      return mockWorkflowState;
    } else {
      // When called without selector, return actions
      return {
        jumpToStep: mockJumpToStep
      };
    }
  })
}));

describe('WorkflowStepper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default mock state
    mockWorkflowState = {
      currentStep: 'config',
      stepStatus: {
        config: 'processing',
        input: 'pending',
        extract: 'pending',
        analyze: 'pending',
        result: 'pending'
      }
    };
  });

  it('renders all workflow steps', () => {
    render(<WorkflowStepper />);
    
    expect(screen.getAllByText('产品配置')).toHaveLength(2); // Mobile and desktop
    expect(screen.getByText('竞品输入')).toBeInTheDocument();
    expect(screen.getByText('数据确认')).toBeInTheDocument();
    expect(screen.getByText('分析计算')).toBeInTheDocument();
    expect(screen.getByText('分析结果')).toBeInTheDocument();
  });

  it('shows progress percentage', () => {
    render(<WorkflowStepper />);
    
    expect(screen.getByText('整体进度')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument(); // No completed steps
  });

  it('displays current step information on mobile', () => {
    render(<WorkflowStepper />);
    
    // Should show current step name and description
    expect(screen.getAllByText('产品配置')).toHaveLength(2);
    expect(screen.getAllByText('设置基础产品信息')).toHaveLength(2); // Mobile and desktop
  });

  it('allows clicking on current step', () => {
    render(<WorkflowStepper />);
    
    // Find the first button with title attribute
    const configButton = screen.getByTitle('设置基础产品信息');
    fireEvent.click(configButton);
    
    expect(mockJumpToStep).toHaveBeenCalledWith('config');
  });

  it('shows completed steps with checkmark', () => {
    // Mock completed step
    mockWorkflowState = {
      currentStep: 'input',
      stepStatus: {
        config: 'completed',
        input: 'processing',
        extract: 'pending',
        analyze: 'pending',
        result: 'pending'
      }
    };

    render(<WorkflowStepper />);
    
    // Should show checkmark for completed step
    const checkmarks = screen.getAllByRole('button').filter(button => 
      button.querySelector('svg path[fill-rule="evenodd"]')
    );
    expect(checkmarks.length).toBeGreaterThan(0);
  });

  it('calculates progress correctly with completed steps', () => {
    // Mock 2 completed steps out of 5
    mockWorkflowState = {
      currentStep: 'extract',
      stepStatus: {
        config: 'completed',
        input: 'completed',
        extract: 'processing',
        analyze: 'pending',
        result: 'pending'
      }
    };

    render(<WorkflowStepper />);
    
    expect(screen.getByText('40%')).toBeInTheDocument(); // 2/5 = 40%
  });
});