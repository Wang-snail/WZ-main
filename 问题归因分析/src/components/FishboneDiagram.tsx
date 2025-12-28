import { useState } from 'react'
import { Plus, Trash2, Users, Settings, Package, FileText, Globe, Shield } from 'lucide-react'
import { ProblemData, FishboneNode } from '../App'

interface FishboneDiagramProps {
  problemData: ProblemData
  setProblemData: (data: ProblemData) => void
  fiveWhySteps: any[]
  setFiveWhySteps: (steps: any[]) => void
  fishboneNodes: FishboneNode[]
  setFishboneNodes: (nodes: FishboneNode[]) => void
  solutions: any[]
  setSolutions: (solutions: any[]) => void
  rootCause: string
  setRootCause: (cause: string) => void
}

const FishboneDiagram = ({
  problemData,
  fishboneNodes,
  setFishboneNodes,
  rootCause,
  setRootCause
}: FishboneDiagramProps) => {
  const [selectedCategory, setSelectedCategory] = useState<FishboneNode['category']>('人')
  const [newCause, setNewCause] = useState('')
  const [newConfidence, setNewConfidence] = useState(80)

  const categories = [
    { id: '人', name: '人 (Man)', icon: Users, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: '机', name: '机 (Machine)', icon: Settings, color: 'bg-green-100 text-green-800 border-green-200' },
    { id: '料', name: '料 (Material)', icon: Package, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: '法', name: '法 (Method)', icon: FileText, color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { id: '环', name: '环 (Environment)', icon: Globe, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { id: '测', name: '测 (Measurement)', icon: Shield, color: 'bg-pink-100 text-pink-800 border-pink-200' }
  ]

  const addCause = () => {
    if (!newCause.trim()) return

    const category = categories.find(c => c.id === selectedCategory)
    if (!category) return

    // 计算位置
    const nodesInCategory = fishboneNodes.filter(node => node.category === selectedCategory)
    const x = 200 + (nodesInCategory.length % 3) * 150
    const y = 200 + Math.floor(nodesInCategory.length / 3) * 60

    const newNode: FishboneNode = {
      id: Date.now().toString(),
      category: selectedCategory,
      cause: newCause,
      confidence: newConfidence,
      x,
      y
    }

    setFishboneNodes([...fishboneNodes, newNode])
    setNewCause('')
    setNewConfidence(80)
  }

  const removeCause = (id: string) => {
    setFishboneNodes(fishboneNodes.filter(node => node.id !== id))
  }

  const markAsRootCause = (id: string) => {
    const node = fishboneNodes.find(n => n.id === id)
    if (node) {
      setRootCause(node.cause)
    }
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.icon : Settings
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.color : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const renderFishboneSVG = () => {
    const centerX = 400
    const centerY = 300
    const categoriesPerSide = categories.slice(0, 3)
    const categoriesBottom = categories.slice(3)

    return (
      <svg width="800" height="600" className="border border-gray-200 rounded-lg bg-white">
        {/* 主干线 */}
        <line x1="50" y1={centerY} x2="750" y2={centerY} stroke="#4B5563" strokeWidth="3"/>
        
        {/* 问题框 */}
        <rect x="720" y={centerY - 25} width="80" height="50" fill="#EF4444" rx="5"/>
        <text x="760" y={centerY + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
          问题
        </text>

        {/* 上方分支 */}
        {categoriesPerSide.map((category, index) => {
          const y = centerY - 100 - index * 60
          const categoryNodes = fishboneNodes.filter(node => node.category === category.id)
          
          return (
            <g key={category.id}>
              {/* 主分支线 */}
              <line x1={centerX} y1={centerY} x2={centerX - 100} y2={y} stroke="#6B7280" strokeWidth="2"/>
              
              {/* 分类标签 */}
              <rect x={centerX - 180} y={y - 15} width="60" height="30" fill="#F3F4F6" stroke="#D1D5DB" rx="5"/>
              <text x={centerX - 150} y={y + 5} textAnchor="middle" fontSize="10" fontWeight="bold">
                {category.name.split(' ')[0]}
              </text>

              {/* 具体原因节点 */}
              {categoryNodes.map((node, nodeIndex) => (
                <g key={node.id}>
                  <line 
                    x1={centerX - 100} 
                    y1={y} 
                    x2={centerX - 100 + (nodeIndex * 40)} 
                    y2={y - 30 - nodeIndex * 25} 
                    stroke="#9CA3AF" 
                    strokeWidth="1"
                  />
                  <rect 
                    x={centerX - 100 + (nodeIndex * 40) - 25} 
                    y={y - 45 - nodeIndex * 25} 
                    width="50" 
                    height="20" 
                    fill="white" 
                    stroke="#D1D5DB" 
                    rx="3"
                  />
                  <text 
                    x={centerX - 100 + (nodeIndex * 40)} 
                    y={y - 32 - nodeIndex * 25} 
                    textAnchor="middle" 
                    fontSize="8"
                  >
                    {node.cause.length > 6 ? node.cause.substring(0, 6) + '...' : node.cause}
                  </text>
                </g>
              ))}
            </g>
          )
        })}

        {/* 下方分支 */}
        {categoriesBottom.map((category, index) => {
          const y = centerY + 100 + index * 60
          const categoryNodes = fishboneNodes.filter(node => node.category === category.id)
          
          return (
            <g key={category.id}>
              {/* 主分支线 */}
              <line x1={centerX} y1={centerY} x2={centerX - 100} y2={y} stroke="#6B7280" strokeWidth="2"/>
              
              {/* 分类标签 */}
              <rect x={centerX - 180} y={y - 15} width="60" height="30" fill="#F3F4F6" stroke="#D1D5DB" rx="5"/>
              <text x={centerX - 150} y={y + 5} textAnchor="middle" fontSize="10" fontWeight="bold">
                {category.name.split(' ')[0]}
              </text>

              {/* 具体原因节点 */}
              {categoryNodes.map((node, nodeIndex) => (
                <g key={node.id}>
                  <line 
                    x1={centerX - 100} 
                    y1={y} 
                    x2={centerX - 100 + (nodeIndex * 40)} 
                    y2={y + 30 + nodeIndex * 25} 
                    stroke="#9CA3AF" 
                    strokeWidth="1"
                  />
                  <rect 
                    x={centerX - 100 + (nodeIndex * 40) - 25} 
                    y={y + 35 + nodeIndex * 25} 
                    width="50" 
                    height="20" 
                    fill="white" 
                    stroke="#D1D5DB" 
                    rx="3"
                  />
                  <text 
                    x={centerX - 100 + (nodeIndex * 40)} 
                    y={y + 47 + nodeIndex * 25} 
                    textAnchor="middle" 
                    fontSize="8"
                  >
                    {node.cause.length > 6 ? node.cause.substring(0, 6) + '...' : node.cause}
                  </text>
                </g>
              ))}
            </g>
          )
        })}
      </svg>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">鱼骨图分析</h2>
        <p className="text-gray-600">从多个维度系统性分析问题原因，找到根本原因</p>
      </div>

      {/* 当前根因 */}
      {rootCause && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-medium text-green-900">已识别的根因</h3>
          </div>
          <p className="text-green-800 mt-2">{rootCause}</p>
          <p className="text-sm text-green-700 mt-1">
            这是通过鱼骨图分析确定的重要原因，可以在下一步生成解决方案
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 鱼骨图可视化 */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">鱼骨图</h3>
            <div className="overflow-x-auto">
              {renderFishboneSVG()}
            </div>
          </div>
        </div>

        {/* 控制面板 */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">添加原因</h3>
            
            {/* 分类选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择分类
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as FishboneNode['category'])}
                    className={`p-2 text-xs border rounded-md ${
                      selectedCategory === category.id 
                        ? category.color 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <category.icon className="h-4 w-4 mx-auto mb-1" />
                    {category.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* 原因输入 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                原因描述
              </label>
              <input
                type="text"
                value={newCause}
                onChange={(e) => setNewCause(e.target.value)}
                placeholder="输入具体原因..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 置信度 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                置信度: {newConfidence}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={newConfidence}
                onChange={(e) => setNewConfidence(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={addCause}
              disabled={!newCause.trim()}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加原因
            </button>
          </div>

          {/* 已添加的原因 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">原因列表</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fishboneNodes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  还没有添加任何原因
                </p>
              ) : (
                fishboneNodes.map((node) => {
                  const category = categories.find(c => c.id === node.category)
                  const IconComponent = getCategoryIcon(node.category)
                  return (
                    <div key={node.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <IconComponent className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {node.cause}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {category?.name} • 置信度: {node.confidence}%
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {!rootCause && (
                          <button
                            onClick={() => markAsRootCause(node.id)}
                            className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            根因
                          </button>
                        )}
                        <button
                          onClick={() => removeCause(node.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 分析指导 */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">鱼骨图使用指导</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>人</strong>：操作人员、技能水平、团队协作等</li>
                <li><strong>机</strong>：设备状态、维护情况、技术系统等</li>
                <li><strong>料</strong>：原材料、信息资源、工具等</li>
                <li><strong>法</strong>：工作流程、标准规范、制度等</li>
                <li><strong>环</strong>：环境条件、地理位置、组织文化等</li>
                <li><strong>测</strong>：测量方法、数据质量、监控体系等</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FishboneDiagram