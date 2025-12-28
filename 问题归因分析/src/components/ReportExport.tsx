import { useState } from 'react'
import { Download, FileText, Calendar, User, Target, Lightbulb, CheckCircle } from 'lucide-react'
import { ProblemData, Solution } from '../App'

interface ReportExportProps {
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

const ReportExport = ({
  problemData,
  fiveWhySteps,
  fishboneNodes,
  solutions,
  rootCause
}: ReportExportProps) => {
  const [exportFormat, setExportFormat] = useState<'markdown' | 'pdf'>('markdown')
  const [isExporting, setIsExporting] = useState(false)
  const [selectedSolutions, setSelectedSolutions] = useState<string[]>(solutions.map(s => s.id))

  const generateMarkdownReport = () => {
    const currentDate = new Date().toLocaleDateString('zh-CN')
    
    let report = `# 根因分析报告

**生成时间：** ${currentDate}  
**分析师：** ${problemData.who || '未指定'}  

---

## 1. 问题概述

### 问题基本信息
- **问题标题：** ${problemData.title}
- **问题分类：** ${problemData.category || '未分类'}
- **发生时间：** ${problemData.when || '未指定'}
- **发生地点：** ${problemData.where || '未指定'}
- **相关人员：** ${problemData.who || '未指定'}

### 问题描述
${problemData.description}

### 影响范围
${problemData.impact}

---

## 2. 根因分析过程

### 2.1 5 Why 分析

${fiveWhySteps.length > 0 ? 
  fiveWhySteps.map((step, index) => 
    `#### 第 ${step.level} 个为什么
**问题：** ${step.question}  
**答案：** ${step.answer}

`
  ).join('') : '未进行5 Why分析'}

${rootCause ? `
**识别的根因：** ${rootCause}
` : ''}

### 2.2 鱼骨图分析

#### 分析维度及原因
${fishboneNodes.length > 0 ? 
  fishboneNodes.map(node => 
    `**${node.category}：** ${node.cause} (置信度: ${node.confidence}%)`
  ).join('\n') : '未进行鱼骨图分析'}

---

## 3. 解决方案

${solutions.length > 0 ? 
  solutions.map((solution, index) => `
### 3.${index + 1} ${solution.title}

**优先级：** ${solution.priority === 'high' ? '高' : solution.priority === 'medium' ? '中' : '低'}  
**投入成本：** ${solution.effort === 'high' ? '高' : solution.effort === 'medium' ? '中' : '低'}  
**分类：** ${solution.category}  

**解决方案：**  
${solution.description}

`).join('') : '未生成解决方案'}

---

## 4. 实施建议

### 4.1 优先级排序
${solutions.length > 0 ? 
  solutions
    .filter(solution => selectedSolutions.includes(solution.id))
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const effortOrder = { low: 1, medium: 2, high: 3 }
      const scoreA = priorityOrder[a.priority] * effortOrder[a.effort]
      const scoreB = priorityOrder[b.priority] * effortOrder[b.effort]
      return scoreB - scoreA
    })
    .map((solution, index) => 
      `${index + 1}. **${solution.title}** (${solution.priority}优先级, ${solution.effort}投入)`
    ).join('\n') : '无已选择的解决方案'}

### 4.2 实施步骤
1. **立即执行** (1-2天)：处理高优先级、低投入的解决方案
2. **短期规划** (1-4周)：实施高优先级、中高投入的解决方案
3. **长期规划** (1-6个月)：处理中低优先级、长期投入的解决方案

### 4.3 风险控制
- 制定详细的实施计划和时间表
- 建立监控机制，定期评估实施效果
- 准备应急方案，应对实施过程中的风险

---

## 5. 结论

${rootCause ? 
  `通过系统性的根因分析，我们确定了问题的根本原因是"${rootCause}"。` : 
  '通过根因分析，我们对问题有了更深入的理解。'}  
针对已识别的根因和影响因素，我们制定了${solutions.length}项解决方案，其中${selectedSolutions.length}项已被选中作为重点实施对象。

建议按照优先级排序和实施建议逐步推进，并建立长期的监控和改进机制，确保问题得到根本性解决。

---

*报告生成时间：${currentDate}*  
*RootCause AI 智能归因分析平台*
`

    return report
  }

  const downloadMarkdown = () => {
    const report = generateMarkdownReport()
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `根因分析报告_${problemData.title}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportReport = async () => {
    setIsExporting(true)
    
    try {
      if (exportFormat === 'markdown') {
        downloadMarkdown()
      } else if (exportFormat === 'pdf') {
        // 在实际应用中，这里会调用PDF生成API
        alert('PDF导出功能开发中，请使用Markdown格式导出')
      }
    } catch (error) {
      console.error('导出失败:', error)
      alert('导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  const toggleSolutionSelection = (solutionId: string) => {
    setSelectedSolutions(prev => 
      prev.includes(solutionId) 
        ? prev.filter(id => id !== solutionId)
        : [...prev, solutionId]
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">导出报告</h2>
        <p className="text-gray-600">生成并下载完整的根因分析报告</p>
      </div>

      {/* 报告摘要 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">报告摘要</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 问题信息 */}
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Target className="h-4 w-4 text-gray-500 mr-2" />
              <span className="font-medium text-gray-700">问题：</span>
              <span className="ml-2 text-gray-600">{problemData.title}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span className="font-medium text-gray-700">时间：</span>
              <span className="ml-2 text-gray-600">{problemData.when || '未指定'}</span>
            </div>
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 text-gray-500 mr-2" />
              <span className="font-medium text-gray-700">负责人：</span>
              <span className="ml-2 text-gray-600">{problemData.who || '未指定'}</span>
            </div>
          </div>

          {/* 分析结果 */}
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="font-medium text-gray-700">根因：</span>
              <span className="ml-2 text-gray-600">{rootCause ? '已识别' : '未识别'}</span>
            </div>
            <div className="flex items-center text-sm">
              <Lightbulb className="h-4 w-4 text-blue-500 mr-2" />
              <span className="font-medium text-gray-700">解决方案：</span>
              <span className="ml-2 text-gray-600">{solutions.length} 项</span>
            </div>
            <div className="flex items-center text-sm">
              <FileText className="h-4 w-4 text-purple-500 mr-2" />
              <span className="font-medium text-gray-700">5 Why分析：</span>
              <span className="ml-2 text-gray-600">{fiveWhySteps.length} 步骤</span>
            </div>
          </div>
        </div>

        {/* 根因详情 */}
        {rootCause && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              <strong>已识别的根因：</strong> {rootCause}
            </p>
          </div>
        )}
      </div>

      {/* 解决方案选择 */}
      {solutions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            选择要包含在报告中的解决方案 ({selectedSolutions.length}/{solutions.length})
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {solutions.map((solution) => (
              <div
                key={solution.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                  selectedSolutions.includes(solution.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleSolutionSelection(solution.id)}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                  selectedSolutions.includes(solution.id)
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedSolutions.includes(solution.id) && (
                    <CheckCircle className="h-3 w-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{solution.title}</h4>
                  <p className="text-sm text-gray-600">{solution.description.substring(0, 80)}...</p>
                </div>
                <div className="text-xs text-gray-500">
                  {solution.priority}优先级
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 导出选项 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">导出设置</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              导出格式
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="markdown"
                  checked={exportFormat === 'markdown'}
                  onChange={(e) => setExportFormat(e.target.value as 'markdown' | 'pdf')}
                  className="mr-2"
                />
                <span className="text-sm">Markdown (.md)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value as 'markdown' | 'pdf')}
                  className="mr-2"
                />
                <span className="text-sm">PDF (.pdf) - 开发中</span>
              </label>
            </div>
          </div>

          <button
            onClick={exportReport}
            disabled={isExporting || selectedSolutions.length === 0}
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                正在导出...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                下载报告
              </>
            )}
          </button>

          {selectedSolutions.length === 0 && (
            <p className="text-sm text-red-600 text-center">
              请至少选择一个解决方案
            </p>
          )}
        </div>
      </div>

      {/* 报告内容预览 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">报告内容预览</h3>
        <div className="bg-white border border-gray-200 rounded p-4 max-h-64 overflow-y-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {generateMarkdownReport().substring(0, 1000)}...
          </pre>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          预览显示报告的前1000字符，完整内容将在导出文件中显示
        </p>
      </div>
    </div>
  )
}

export default ReportExport