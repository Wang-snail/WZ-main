const https = require('https');

function testWebsite(url) {
  console.log(`🔍 正在测试网站: ${url}`);
  
  const req = https.get(url, (res) => {
    console.log(`✅ 状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      // 检查关键内容
      const checks = [
        { name: 'DataFlow Visualizer 标题', pattern: /DataFlow Visualizer/i },
        { name: 'React Flow 画布', pattern: /react-flow/i },
        { name: '工具栏', pattern: /toolbar|新建|保存/i },
        { name: '侧边栏', pattern: /sidebar|模块库/i },
        { name: '利润计算器', pattern: /利润计算器/i },
        { name: '定价预测', pattern: /定价预测/i },
        { name: 'ROI计算', pattern: /ROI计算/i },
      ];
      
      console.log('\n📋 内容检查:');
      checks.forEach(check => {
        const found = check.pattern.test(data);
        console.log(`${found ? '✅' : '❌'} ${check.name}: ${found ? '存在' : '未找到'}`);
      });
      
      console.log('\n🎉 网站测试完成！');
    });
  });
  
  req.on('error', (err) => {
    console.error('❌ 请求失败:', err.message);
  });
  
  req.setTimeout(10000, () => {
    console.error('❌ 请求超时');
    req.destroy();
  });
}

// 测试部署的网站
testWebsite('https://oqtpcq00fb9s.space.minimax.io');