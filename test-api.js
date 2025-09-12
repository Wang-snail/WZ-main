#!/usr/bin/env node
// AI市场调研系统 - 本地API测试脚本

const handler = require('./api/market-research.js').default;

// 模拟Vercel请求/响应对象
const mockReq = {
  method: 'POST',
  body: {
    topic: '智能宠物喂食器',
    email: 'test@example.com'
  }
};

const mockRes = {
  headers: {},
  statusCode: 200,
  setHeader: function(name, value) {
    this.headers[name] = value;
  },
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('\n🎯 API响应结果:');
    console.log('状态码:', this.statusCode);
    console.log('响应头:', this.headers);
    console.log('响应数据:', JSON.stringify(data, null, 2));
    return this;
  },
  end: function() {
    console.log('✅ API测试完成');
  }
};

// 设置环境变量
process.env.SILICONFLOW_API_KEY = 'sk-hwbvirmjuviwfyqbjqpmlebxetsdechtbyxmflziefipkbht';
process.env.SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1';

console.log('🧪 开始API函数测试...');
console.log('📝 测试数据:', JSON.stringify(mockReq.body, null, 2));

// 执行测试
handler(mockReq, mockRes).catch(error => {
  console.error('❌ API测试失败:', error.message);
  process.exit(1);
});