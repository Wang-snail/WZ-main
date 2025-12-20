import React from 'react';
import { WorkflowStep } from '../store/kanoToolStore';
import { ImportStep } from './steps/ImportStep';
import { ConversionStep } from './steps/ConversionStep';
import { OrganizeStep } from './steps/OrganizeStep';
import { ExtractStep } from './steps/ExtractStep';
import { ScoreStep } from './steps/ScoreStep';
import { OutputStep } from './steps/OutputStep';

interface StepContentProps {
  step: WorkflowStep;
}

export function StepContent({ step }: StepContentProps) {
  switch (step) {
    case WorkflowStep.IMPORT:
      return <ImportStep />;
    case WorkflowStep.CONVERT:
      return <ConversionStep />;
    case WorkflowStep.ORGANIZE:
      return <OrganizeStep />;
    case WorkflowStep.EXTRACT:
      return <ExtractStep />;
    case WorkflowStep.SCORE:
      return <ScoreStep />;
    case WorkflowStep.OUTPUT:
      return <OutputStep />;
    default:
      return <div>未知步骤</div>;
  }
}