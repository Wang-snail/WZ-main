import { useState, useEffect } from 'react'
import { Lightbulb, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { ProblemData, Solution } from '../App'

interface SolutionRecommendationProps {
  problemData: ProblemData
  setProblemData: (data: ProblemData) => void
  fiveWhySteps: any[]
  setFiveWhySteps: (steps: any[]) => void
  fishboneNodes: any[]
  setFishboneNodes: (nodes: any[]) => void
  solutions: Solution[]
  setSolutions: (solutions: Solution[]) => void
  rootCause: string
  setRootCause: (cause: string) => void
}

const SolutionRecommendation = ({
  problemData,
  solutions,
  setSolutions,
  rootCause
}: SolutionRecommendationProps) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedSolutions, setSelectedSolutions] = useState<string[]>([])

  // 预定义解决方案模板
  const solutionTemplates = {
    '技术故障': [
      {
        title: '系统监控与告警',
        description: '建立完善的系统监控体系，实时监控关键指标，及时发现和预警潜在问题',
        priority: 'high' as const,
        effort: 'medium' as const,
        category: '预防措施'
      },
      {
        title: '故障恢复流程',
        description: '制定标准化的故障响应和恢复流程，明确责任人，确保快速恢复',
        priority: 'high' as const,
        effort: 'low' as const,
        category: '应急处理'
      },
      {
        title: '性能优化',
        description: '分析系统瓶颈，优化代码逻辑和数据库查询，提升系统性能',
        priority: 'medium' as const,
        effort: 'high' as const,
        category: '技术改进'
      }
    ],
    '流程瓶颈': [
      {
        title: '流程再造',
        description: '重新设计工作流程，消除不必要的步骤，提高流程效率',
        priority: 'high' as const,
        effort: 'high' as const,
        category: '流程优化'
      },
      {
        title: '自动化实施',
        description: '将重复性工作自动化，减少人工干预，提升处理速度',
        priority: 'high' as const,
        effort: 'high' as const,
        category: '技术改进'
      },
      {
        title: '培训与赋能',
        description: '加强员工技能培训，提升团队整体执行能力',
        priority: 'medium' as const,
        effort: 'medium' as const,
        category: '能力建设'
      }
    ],
    '人员绩效': [
      {
        title: '绩效考核体系',
        description: '建立科学合理的绩效考核体系，明确目标导向',
        priority: 'high' as const,
        effort: 'medium' as const,
        category: '制度建设'
      },
      {
        title: '培训发展计划',
        description: '制定针对性的培训计划，提升员工专业技能',
        priority: 'medium' as const,
        effort: 'medium' as const,
        category: '能力建设'
      },
      {
        title: '激励机制优化',
        description: '优化薪酬激励和晋升机制，提高员工积极性',
        priority: 'medium' as const,
        effort: 'high' as const,
        category: '制度建设'
      }
    ],
    '产品质量': [
      {
        title: '质量管理体系',
        description: '建立完善的质量管理体系，从设计到交付全程质量控制',
        priority: 'high' as const,
        effort: 'high' as const,
        category: '制度建设'
      },
      {
        title: '测试流程强化',
        description: '完善测试流程，增加测试覆盖率和测试深度',
        priority: 'high' as const,
        effort: 'medium' as const,
        category: '流程优化'
      },
      {
        title: '客户反馈机制',
        description: '建立客户反馈收集和处理机制，持续改进产品质量',
        priority: 'medium' as const,
        effort: 'low' as const,
        category: '持续改进'
      }
    ]
  }

  const generateSolutions = async () => {
    setIsGenerating(true)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    let generatedSolutions: Solution[] = []
    
    if (problemData.category && solutionTemplates[problemData.category as keyof typeof solutionTemplates]) {
      generatedSolutions = solutionTemplates[problemData.category as keyof typeof solutionTemplates].map((template, index) => ({
        id: `generated-${index}`,
        ...template
      }))
    } else {
      // 默认解决方案
      generatedSolutions = [
        {
          id: 'default-1',
          title: '问题分析',
          description: '深入分析问题根本原因，制定针对性解决方案',
          priority: 'high',
          effort: 'medium',
          category: '问题分析'
        },
        {
          id: 'default-2',
          title: '预防措施',
          description: '建立预防机制，避免问题再次发生',
          priority: 'medium',
          effort: 'low',
          category: '预防措施'
        },
        {
          id: 'default-3',
          title: '持续监控',
          description: '建立监控体系，持续跟踪改进效果',
          priority: 'medium',
          effort: 'low',
          category: '持续改进'
        }
      ]
    }

    // 添加基于根因的定制化解决方案
    if (rootCause) {
      const customSolution: Solution = {
        id: 'custom-rootcause',
        title: `针对根因的专项解决`,
        description: `针对已识别的根因"${rootCause}"，制定专门的处理方案和长期预防措施`,
        priority: 'high',
        effort: 'high',
        category: '专项解决'
      }
      generatedSolutions.unshift(customSolution)
    }

    setSolutions(generatedSolutions)
    setIsGenerating(false)
  }

  useEffect(() => {
    if (solutions.length === 0 && rootCause) {
      generateSolutions()
    }
  }, [rootCause])

  const toggleSolutionSelection = (solutionId: string) => {
    setSelectedSolutions(prev => 
      prev.includes(solutionId) 
        ? prev.filter(id => id !== solutionId)
        : [...prev, solutionId]
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />
      case 'medium': return <Clock className="h-4 w-4" />
      case 'low': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">解决方案推荐</h2>
        <p className="text-gray-600">基于根因分析，为您推荐针对性的解决方案</p>
      </div>

      {/* 根因回顾 */}
      {rootCause && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-blue-900">基于已识别的根因</h3>
          </div>
          <p className="text-blue-800 mt-2">{rootCause}</p>
          <p className="text-sm text-blue-700 mt-1">
            系统将基于此根因生成定制化解决方案
          </p>
        </div>
      )}

      {/* 生成解决方案按钮 */}
      {solutions.length === 0 && (
        <div className="text-center">
          <button
            onClick={generateSolutions}
            disabled={isGenerating || !rootCause}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                正在生成解决方案...
              </>
            ) : (
              <>
                <Lightbulb className="h-5 w-5 mr-2" />
                生成解决方案
              </>
            )}
          </button>
          {!rootCause && (
            <p className="text-sm text-gray-500 mt-2">
              请先在前面步骤中识别并标记根因
            </p>
          )}
        </div>
      )}

      {/* 解决方案列表 */}
      {solutions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              推荐解决方案 ({solutions.length})
            </h3>
            <div className="text-sm text-gray-500">
              已选择 {selectedSolutions.length} 个方案
            </div>
          </div>

          <div className="grid gap-4">
            {solutions.map((solution) => (
              <div
                key={solution.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedSolutions.includes(solution.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleSolutionSelection(solution.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-medium text-gray-900 mr-3">{solution.title}</h4>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(solution.priority)}`}>
                        {getPriorityIcon(solution.priority)}
                        <span className="ml-1">
                          {solution.priority === 'high' ? '高优先级' : 
                           solution.priority === 'medium' ? '中优先级' : '低优先级'}
                        </span>
                      </span>
                      <span className={`ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getEffortColor(solution.effort)}`}>
                        {solution.effort === 'high' ? '高投入' : 
                         solution.effort === 'medium' ? '中投入' : '低投入'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{solution.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {solution.category}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedSolutions.includes(solution.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedSolutions.includes(solution.id) && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 选择摘要 */}
          {selectedSolutions.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">已选择的解决方案</h4>
              <div className="space-y-1">
                {selectedSolutions.map(id => {
                  const solution = solutions.find(s => s.id === id)
                  if (!solution) return null
                  return (
                    <div key={id} className="text-sm text-green-800 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {solution.title}
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-green-700 mt-2">
                可以在下一步导出包含这些解决方案的详细报告
              </p>
            </div>
          )}
        </div>
      )}

      {/* 解决方案指导 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">解决方案实施指导</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>高优先级方案</strong>：优先实施，影响大且紧急</li>
                <li><strong>中优先级方案</strong>：中期规划，影响中等且不紧急</li>
                <li><strong>低优先级方案</strong>：长期优化，影响小且不紧急</li>
                <li><strong>实施顺序</strong>：建议先实施高优先级、低投入的方案</li>
                <li><strong>效果监控</strong>：定期评估解决方案的实际效果</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SolutionRecommendation