import { useState } from 'react'
import { ProblemData } from '../App'

interface ProblemDefinitionProps {
  problemData: ProblemData
  setProblemData: (data: ProblemData) => void
  fiveWhySteps?: any[]
  setFiveWhySteps?: (steps: any[]) => void
  fishboneNodes?: any[]
  setFishboneNodes?: (nodes: any[]) => void
  solutions?: any[]
  setSolutions?: (solutions: any[]) => void
  rootCause?: string
  setRootCause?: (cause: string) => void
}

const ProblemDefinition = ({
  problemData,
  setProblemData
}: ProblemDefinitionProps) => {
  const [localData, setLocalData] = useState(problemData)

  const categories = [
    '技术故障',
    '流程瓶颈',
    '人员绩效',
    '产品质量',
    '客户服务',
    '运营效率',
    '安全风险',
    '合规问题'
  ]

  const handleInputChange = (field: keyof ProblemData, value: string) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    setProblemData(updated)
  }

  const isValid = localData.title && localData.description && localData.impact

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">问题定义</h2>
        <p className="text-gray-600">请详细描述您遇到的问题，这有助于后续的根因分析</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 问题标题 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            问题标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={localData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="简要描述问题，如：服务器响应速度缓慢"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 问题分类 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            问题分类
          </label>
          <select
            value={localData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">请选择分类</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* 发生时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            发生时间
          </label>
          <input
            type="text"
            value={localData.when}
            onChange={(e) => handleInputChange('when', e.target.value)}
            placeholder="如：2024-12-20 14:30"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 发生地点 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            发生地点
          </label>
          <input
            type="text"
            value={localData.where}
            onChange={(e) => handleInputChange('where', e.target.value)}
            placeholder="如：生产环境、上海办公室"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 相关人员 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            相关人员
          </label>
          <input
            type="text"
            value={localData.who}
            onChange={(e) => handleInputChange('who', e.target.value)}
            placeholder="如：张三、技术团队"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 问题描述 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            问题描述 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={localData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            placeholder="详细描述问题的现象、具体情况等..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 影响范围 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            影响范围 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={localData.impact}
            onChange={(e) => handleInputChange('impact', e.target.value)}
            rows={3}
            placeholder="描述问题对业务、用户、运营等方面的影响..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 验证提示 */}
      {!isValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                请填写必填字段（标有 * 的字段）以继续分析
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 帮助提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">分析小贴士</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>问题描述越详细，后续分析越准确</li>
                <li>影响范围描述有助于确定解决方案的优先级</li>
                <li>提供具体的时间、地点等信息有助于定位问题</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProblemDefinition