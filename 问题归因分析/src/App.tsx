import { useState } from 'react'
import { ChevronLeft, ChevronRight, FileText, Target, GitBranch, Lightbulb } from 'lucide-react'
import ProblemDefinition from './components/ProblemDefinition'
import FiveWhyAnalysis from './components/FiveWhyAnalysis'
import FishboneDiagram from './components/FishboneDiagram'
import SolutionRecommendation from './components/SolutionRecommendation'
import ReportExport from './components/ReportExport'

export interface ProblemData {
  title: string
  description: string
  when: string
  where: string
  who: string
  impact: string
  category: string
}

export interface FiveWhyStep {
  level: number
  question: string
  answer: string
}

export interface FishboneNode {
  id: string
  category: '人' | '机' | '料' | '法' | '环' | '测'
  cause: string
  confidence: number
  x: number
  y: number
}

export interface Solution {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  category: string
}

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [problemData, setProblemData] = useState<ProblemData>({
    title: '',
    description: '',
    when: '',
    where: '',
    who: '',
    impact: '',
    category: ''
  })
  const [fiveWhySteps, setFiveWhySteps] = useState<FiveWhyStep[]>([])
  const [fishboneNodes, setFishboneNodes] = useState<FishboneNode[]>([])
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [rootCause, setRootCause] = useState('')

  const steps = [
    { id: 0, name: '问题定义', icon: Target, component: ProblemDefinition },
    { id: 1, name: '5 Why分析', icon: GitBranch, component: FiveWhyAnalysis },
    { id: 2, name: '鱼骨图分析', icon: GitBranch, component: FishboneDiagram },
    { id: 3, name: '解决方案', icon: Lightbulb, component: SolutionRecommendation },
    { id: 4, name: '导出报告', icon: FileText, component: ReportExport }
  ]

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return problemData.title && problemData.description && problemData.impact
      case 1:
        return fiveWhySteps.length > 0
      case 2:
        return fishboneNodes.length > 0
      case 3:
        return solutions.length > 0
      default:
        return true
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">RootCause AI</h1>
            </div>
            <div className="text-sm text-gray-500">
              智能归因分析与解决方案平台
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <nav aria-label="Progress">
              <ol className="flex items-center justify-between">
                {steps.map((step, stepIdx) => (
                  <li key={step.id} className="flex items-center">
                    <div className="flex items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                          currentStep >= step.id
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 bg-white text-gray-500'
                        }`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`ml-4 text-sm font-medium ${
                          currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                    {stepIdx < steps.length - 1 && (
                      <div
                        className={`ml-6 h-0.5 w-16 ${
                          currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <CurrentStepComponent
              problemData={problemData}
              setProblemData={setProblemData}
              fiveWhySteps={fiveWhySteps}
              setFiveWhySteps={setFiveWhySteps}
              fishboneNodes={fishboneNodes}
              setFishboneNodes={setFishboneNodes}
              solutions={solutions}
              setSolutions={setSolutions}
              rootCause={rootCause}
              setRootCause={setRootCause}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              上一步
            </button>
            <button
              onClick={nextStep}
              disabled={!canProceed() || currentStep === steps.length - 1}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App