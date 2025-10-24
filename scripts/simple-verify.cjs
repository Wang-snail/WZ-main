#!/usr/bin/env node

/**
 * 简化的网站访问验证
 */

const https = require('https');

const checkWebsite = (url) => {
  return new Promise((resolve) => {
    const startTime = Date.now();

    https.get(url, (res) => {
      const loadTime = Date.now() - startTime;

      console.log(`🌐 ${url}`);
      console.log(`   状态码: ${res.statusCode}`);
      console.log(`   加载时间: ${loadTime}ms`);
      console.log(`   内容类型: ${res.headers['content-type']}`);

      if (res.statusCode === 200) {
        console.log('   ✅ 网站正常运行');
        resolve(true);
      } else {
        console.log('   ❌ 网站状态异常');
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`   ❌ 连接失败: ${err.message}`);
      resolve(false);
    });
  });
};

async function main() {
  console.log('🚀 验证网站访问状态...\n');

  const sites = [
    'https://wsnail.com',
    'https://wsnail.com/ai-tools',
    'https://wsnail.com/analyzer',
    'https://wsnail.com/divination',
    'https://wsnail.com/games'
  ];

  let successCount = 0;

  for (const site of sites) {
    const success = await checkWebsite(site);
    if (success) successCount++;
    console.log('');
  }

  console.log(`📊 验证结果: ${successCount}/${sites.length} 个页面正常`);

  if (successCount === sites.length) {
    console.log('🎉 所有核心页面正常运行！');
    console.log('✅ 部署验证完成，优化版本已生效');
  } else if (successCount > 0) {
    console.log('⚠️  部分页面正常，可能还在部署中');
    console.log('📝 请稍后再试或检查部署状态');
  } else {
    console.log('❌ 页面访问异常，请检查部署状态');
    console.log('🔧 可能需要重新部署');
  }
}

main();