#!/usr/bin/env node

// 触发Vercel部署的脚本
const https = require('https');

// 尝试通过API触发部署
function triggerDeploy() {
  const options = {
    hostname: 'api.vercel.com',
    port: 443,
    path: '/v1/integrations/deploy/prj_OXALain1SCUD0EJtGviaB4yHNZMz/github',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer MzeyH2VWRFHGVv45XiI31ior',
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Vercel API响应:', res.statusCode);
      console.log('响应数据:', data);
    });
  });

  req.on('error', (error) => {
    console.error('请求错误:', error);
  });

  // 发送空的POST请求触发部署
  req.write('{}');
  req.end();
}

console.log('正在尝试触发Vercel部署...');
triggerDeploy();