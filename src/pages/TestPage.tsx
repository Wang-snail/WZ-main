import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          测试页面
        </h1>
        <p className="text-lg text-gray-600">
          如果您能看到这个页面，说明 React 应用正在正常运行。
        </p>
        <div className="mt-8 space-y-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">系统信息</h2>
            <p>时间: {new Date().toLocaleString()}</p>
            <p>用户代理: {navigator.userAgent}</p>
          </div>
        </div>
      </div>
    </div>
  );
}