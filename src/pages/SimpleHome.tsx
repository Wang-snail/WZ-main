import React from 'react';

export default function SimpleHome() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          🐌 WSNAIL 数据实验室
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          为产品经理和电商运营提供半自动化工具，提高 3x 效率
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2">🛠️ 工具箱</h3>
            <p className="text-gray-600">各种实用的半自动化工具</p>
            <a href="/tools" className="inline-block mt-4 text-blue-600 hover:text-blue-700">
              查看工具 →
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2">🧪 数据实验室</h3>
            <p className="text-gray-600">数据处理和分析工作流</p>
            <a href="/lab" className="inline-block mt-4 text-blue-600 hover:text-blue-700">
              进入实验室 →
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2">⚡ 工作流</h3>
            <p className="text-gray-600">自动化业务流程</p>
            <a href="/workflows" className="inline-block mt-4 text-blue-600 hover:text-blue-700">
              查看工作流 →
            </a>
          </div>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎉 Activepieces 迁移项目已完成！
          </h2>
          <p className="text-gray-700 mb-4">
            28/28 任务全部完成，包含完整的工作流引擎、数据处理组件、监控系统等。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              ✅ 桥接服务
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              ✅ 自定义 Pieces
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              ✅ 监控系统
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              ✅ 生产部署
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}