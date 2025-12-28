/**
 * 设置定时任务脚本
 * 使用node-cron来调度wiki-updater.js
 *
 * 安装依赖: npm install node-cron
 * 运行: node scripts/setup-cron.js
 */

const cron = require('node-cron');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_PATH = path.join(__dirname, 'wiki-updater.js');
const CRON_EXPRESSION = '0 2 * * *'; // 每天凌晨2点执行

function setupCronJob() {
  console.log('🚀 设置Wiki内容自动更新定时任务\n');

  // 检查是否安装了node-cron
  try {
    require.resolve('node-cron');
    console.log('✅ node-cron 已安装');
  } catch (e) {
    console.log('📦 正在安装 node-cron...');
    try {
      execSync('npm install node-cron --save', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
      console.log('✅ node-cron 安装完成\n');
    } catch (error) {
      console.error('❌ node-cron 安装失败:', error.message);
      console.log('\n请手动运行: npm install node-cron');
      return;
    }
  }

  // 创建定时任务
  const cronTask = cron.schedule(CRON_EXPRESSION, () => {
    console.log('\n⏰ 定时任务触发，开始更新...');
    try {
      const updater = require('./wiki-updater.js');
      updater.updateWikiContent();
    } catch (error) {
      console.error('❌ 定时任务执行失败:', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Shanghai'
  });

  console.log('✅ 定时任务已设置');
  console.log(`📅 执行时间: 每天凌晨 2:00`);
  console.log(`📝 脚本路径: ${SCRIPT_PATH}`);
  console.log('\n💡 提示:');
  console.log('   - 程序会每天自动抓取最新资讯');
  console.log('   - 资讯会叠加存储，不会覆盖旧内容');
  console.log('   - AI新闻会单独存储在 aiNews 分类中');
  console.log('   - 备份文件保存在 data/wiki/backups/ 目录');

  console.log('\n🎉 设置完成！定时任务正在运行。');

  return cronTask;
}

// 如果直接运行
if (require.main === module) {
  setupCronJob();

  // 保持进程运行
  console.log('\n🔄 定时任务守护进程已启动，按 Ctrl+C 退出');

  // 处理退出信号
  process.on('SIGINT', () => {
    console.log('\n👋 退出定时任务');
    process.exit(0);
  });

  // 防止进程退出
  setInterval(() => {}, 1000 * 60 * 60); // 每小时唤醒一次
}

module.exports = { setupCronJob };
