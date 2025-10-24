#!/usr/bin/env node

/**
 * 部署验证脚本
 * 用途：自动检查部署是否成功生效
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class DeploymentVerifier {
  constructor() {
    this.siteUrl = 'https://www.wsnail.com/';
    this.distPath = path.join(__dirname, '../dist');
  }

  // 获取本地构建的JS文件名
  getLocalJSFileName() {
    try {
      const distIndexPath = path.join(this.distPath, 'index.html');
      const indexContent = fs.readFileSync(distIndexPath, 'utf8');
      const match = indexContent.match(/\/assets\/(index-[^.]+\.js)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error('❌ 无法读取本地构建文件:', error.message);
      return null;
    }
  }

  // 获取线上的JS文件名
  async getOnlineJSFileName() {
    return new Promise((resolve, reject) => {
      https.get(this.siteUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const match = data.match(/\/assets\/(index-[^.]+\.js)/);
          resolve(match ? match[1] : null);
        });
      }).on('error', reject);
    });
  }

  // 检查特定内容是否存在
  async checkContent(searchText) {
    return new Promise((resolve, reject) => {
      const url = `${this.siteUrl}?v=${Date.now()}`;
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve(data.includes(searchText));
        });
      }).on('error', reject);
    });
  }

  // 主验证流程
  async verify() {
    console.log('🔍 开始部署验证...\n');

    // 1. 检查本地构建
    console.log('1️⃣ 检查本地构建...');
    const localJS = this.getLocalJSFileName();
    if (!localJS) {
      console.log('❌ 本地构建文件不存在，请先运行 npm run build');
      return false;
    }
    console.log(`✅ 本地构建：${localJS}\n`);

    // 2. 检查线上版本
    console.log('2️⃣ 检查线上版本...');
    try {
      const onlineJS = await this.getOnlineJSFileName();
      if (!onlineJS) {
        console.log('❌ 无法获取线上JS文件名');
        return false;
      }
      console.log(`📡 线上版本：${onlineJS}\n`);

      // 3. 对比版本
      console.log('3️⃣ 版本对比...');
      if (localJS === onlineJS) {
        console.log('✅ 版本匹配！部署成功！');

        // 4. 内容验证
        console.log('\n4️⃣ 内容验证...');
        const hasUpdateText = await this.checkContent('新版本已部署');
        if (hasUpdateText) {
          console.log('✅ 更新内容已生效！');
          console.log('\n🎉 部署验证完全成功！');
          return true;
        } else {
          console.log('⚠️  JS版本已更新，但特定内容可能需要时间生效');
          return true;
        }
      } else {
        console.log('❌ 版本不匹配，部署可能失败');
        console.log(`   本地：${localJS}`);
        console.log(`   线上：${onlineJS}`);
        console.log('\n💡 建议解决方案：');
        console.log('   1. 等待3-5分钟后重新检查');
        console.log('   2. 检查Vercel部署状态');
        console.log('   3. 使用GitHub网页编辑触发部署');
        return false;
      }
    } catch (error) {
      console.error('❌ 验证过程出错:', error.message);
      return false;
    }
  }
}

// 执行验证
if (require.main === module) {
  const verifier = new DeploymentVerifier();
  verifier.verify().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = DeploymentVerifier;