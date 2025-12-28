import { useState } from 'react'
import { Plus, Minus, AlertTriangle } from 'lucide-react'
import { ProblemData, FiveWhyStep } from '../App'

interface FiveWhyAnalysisProps {
  problemData: ProblemData
  setProblemData: (data: ProblemData) => void
  fiveWhySteps: FiveWhyStep[]
  setFiveWhySteps: (steps: FiveWhyStep[]) => void
  fishboneNodes: any[]
  setFishboneNodes: (nodes: any[]) => void
  solutions: any[]
  setSolutions: (solutions: any[]) => void
  rootCause: string
  setRootCause: (cause: string) => void
}

const FiveWhyAnalysis = ({
  problemData,
  fiveWhySteps,
  setFiveWhySteps,
  rootCause,
  setRootCause
}: FiveWhyAnalysisProps) => {
  const [currentWhy, setCurrentWhy] = useState('')
  const [isAddingNew, setIsAddingNew] = useState(false)

  // 预定义的问题模板
  const problemTemplates = {
    '技术故障': '为什么系统出现故障？',
    '流程瓶颈': '为什么流程效率低下？',
    '人员绩效': '为什么绩效不达标？',
    '产品质量': '为什么产品质量问题？',
    '客户服务': '为什么客户满意度低？',
    '运营效率': '为什么运营成本高？',
    '安全风险': '为什么存在安全漏洞？',
    '合规问题': '为什么不符合规范？'
  }

  const getFirstQuestion = () => {
    if (problemData.category && problemTemplates[problemData.category as keyof typeof problemTemplates]) {
      return problemTemplates[problemData.category as keyof typeof problemTemplates]
    }
    return '为什么会出现这个问题？'
  }

  const addWhyStep = () => {
    if (!currentWhy.trim()) return

    const lastLevel = fiveWhySteps.length > 0 ? fiveWhySteps[fiveWhySteps.length - 1].level : 0
    const newStep: FiveWhyStep = {
      level: lastLevel + 1,
      question: fiveWhySteps.length === 0 ? getFirstQuestion() : `为什么${fiveWhySteps[fiveWhySteps.length - 1].answer}？`,
      answer: currentWhy
    }

    setFiveWhySteps([...fiveWhySteps, newStep])
    setCurrentWhy('')
    setIsAddingNew(false)
  }

  const removeWhyStep = (index: number) => {
    const updated = fiveWhySteps.filter((_, i) => i !== index)
    setFiveWhySteps(updated)
  }

  const markAsRootCause = (index: number) => {
    const step = fiveWhySteps[index]
    setRootCause(step.answer)
  }

  const generateSuggestions = () => {
    const suggestions = []
    
    if (problemData.category === '技术故障') {
      suggestions.push('服务器配置问题', '网络连接异常', '代码逻辑错误', '数据库性能问题')
    } else if (problemData.category === '流程瓶颈') {
      suggestions.push('流程设计不合理', '人员技能不足', '工具效率低', '沟通机制缺失')
    } else if (problemData.category === '人员绩效') {
      suggestions.push('培训不充分', '激励机制不当', '工作负荷过重', '目标不明确')
    }

    return suggestions
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">5 Why 根因分析</h2>
        <p className="text-gray-600">通过连续追问"为什么"，深入挖掘问题的根本原因</p>
      </div>

      {/* 问题回顾 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">问题回顾</h3>
        <p className="text-blue-800">{problemData.title}</p>
        <p className="text-sm text-blue-700 mt-1">{problemData.description}</p>
      </div>

      {/* 当前根因 */}
      {rootCause && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-medium text-green-900">已识别的根因</h3>
          </div>
          <p className="text-green-800 mt-2">{rootCause}</p>
          <p className="text-sm text-green-700 mt-1">
            这是通过5 Why分析确定的根本原因，可以在下一步生成解决方案
          </p>
        </div>
      )}

      {/* Why分析步骤 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">分析步骤</h3>
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            添加分析
          </button>
        </div>

        {fiveWhySteps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>还没有开始分析，点击"添加分析"开始第一个"为什么"</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fiveWhySteps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mr-3">
                        {step.level}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        第 {step.level} 个为什么
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{step.question}</p>
                    <p className="text-blue-700 font-medium">{step.answer}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!rootCause && (
                      <button
                        onClick={() => markAsRootCause(index)}
                        className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                      >
                        标记为根因
                      </button>
                    )}
                    <button
                      onClick={() => removeWhyStep(index)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 添加新的Why步骤 */}
        {isAddingNew && (
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h4 className="font-medium text-blue-900 mb-3">
              {fiveWhySteps.length === 0 ? getFirstQuestion() : `为什么${fiveWhySteps[fiveWhySteps.length - 1].answer}？`}
            </h4>
            <div className="space-y-3">
              <textarea
                value={currentWhy}
                onChange={(e) => setCurrentWhy(e.target.value)}
                placeholder="请回答这个问题..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              
              {/* 智能建议 */}
              {generateSuggestions().length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">建议的回答：</p>
                  <div className="flex flex-wrap gap-2">
                    {generateSuggestions().map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentWhy(suggestion)}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsAddingNew(false)
                    setCurrentWhy('')
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  onClick={addWhyStep}
                  disabled={!currentWhy.trim()}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加步骤
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 分析提示 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">分析指导</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>每个"为什么"都应该基于事实，而不是猜测</li>
                <li>如果回答仍然可以继续追问"为什么"，就继续深入</li>
                <li>当无法再进一步回答"为什么"时，通常就找到了根因</li>
                <li>标记根因后，可以在下一步生成针对性的解决方案</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FiveWhyAnalysis