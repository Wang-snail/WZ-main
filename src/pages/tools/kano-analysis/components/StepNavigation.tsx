import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { WorkflowStep, useKanoToolStore } from '../store/kanoToolStore';

const stepOrder = [
  WorkflowStep.IMPORT,
  WorkflowStep.ORGANIZE,
  WorkflowStep.EXTRACT,
  WorkflowStep.SCORE,
  WorkflowStep.OUTPUT,
];

export function StepNavigation() {
  const { 
    currentStep, 
    stepStatus, 
    nextStep, 
    previousStep, 
    resetFromStep 
  } = useKanoToolStore();

  const currentIndex = stepOrder.indexOf(currentStep);
  const canGoNext = currentIndex < stepOrder.length - 1 && stepStatus[currentStep] === 'completed';
  const canGoPrevious = currentIndex > 0;
  const canReset = currentIndex > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {canGoPrevious && (
          <Button
            variant="outline"
            onClick={previousStep}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            上一步
          </Button>
        )}
        
        {canReset && (
          <Button
            variant="ghost"
            onClick={() => resetFromStep(currentStep)}
            className="flex items-center text-gray-600"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            重新处理此步骤
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {canGoNext && (
          <Button
            onClick={nextStep}
            className="flex items-center"
          >
            下一步
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
        
        {currentStep === WorkflowStep.OUTPUT && stepStatus[currentStep] === 'completed' && (
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            开始新分析
          </Button>
        )}
      </div>
    </div>
  );
}