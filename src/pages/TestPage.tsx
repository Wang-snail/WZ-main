import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6B7280',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          margin: '0 0 2rem 0'
        }}>
          12345，上山大老虎
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#e5e7eb',
          margin: '0'
        }}>
          部署测试页面 - {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default TestPage;