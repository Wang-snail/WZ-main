import React from 'react';

export default function MinimalTest() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '1rem' }}>
          ✅ React 应用正常运行
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '2rem' }}>
          如果您能看到这个页面，说明基础设置没有问题
        </p>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '1rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>调试信息</h2>
          <p><strong>当前时间:</strong> {new Date().toLocaleString()}</p>
          <p><strong>当前路径:</strong> {window.location.pathname}</p>
          <p><strong>端口:</strong> {window.location.port}</p>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <a 
            href="/test" 
            style={{ 
              color: '#3b82f6', 
              textDecoration: 'none',
              marginRight: '1rem'
            }}
          >
            → 测试页面
          </a>
          <a
            href="/lab"
            style={{
              color: '#3b82f6',
              textDecoration: 'none'
            }}
          >
            → 数据实验室
          </a>
        </div>
      </div>
    </div>
  );
}