#!/usr/bin/env node

/**
 * 完整Vercel部署自动化脚本
 * 包含环境变量配置和部署触发
 */

import https from 'https';
import { execSync } from 'child_process';

// 配置信息
const CONFIG = {
  VERCEL_TOKEN: "MzeyH2VWRFHGVv45XiI31ior",
  PROJECT_ID: "prj_OXALain1SCUD0EJtGviaB4yHNZMz",
  GITHUB_TOKEN: "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",
  REPO_OWNER: "Wang-snail",
  REPO_NAME: "WZ-main",
  SILICONFLOW_API_KEY: "sk-hwbvirmjuviwfyqbjqpmlebxetsdechtbyxmflziefipkbht",
  SILICONFLOW_API_URL: "https://api.siliconflow.cn/v1"
};

// HTTP请求辅助函数
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// 步骤1：检查项目状态
async function checkProject() {
  console.log('🔍 检查项目状态...');
  
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${CONFIG.PROJECT_ID}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${CONFIG.VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log(`项目状态: ${response.status}`);
    if (response.status === 200) {
      console.log(`✅ 项目 "${response.data.name}" 存在`);
      return response.data;
    } else {
      console.error('❌ 项目不存在或无权限访问');
      return null;
    }
  } catch (error) {
    console.error('❌ 检查项目失败:', error.message);
    return null;
  }
}

// 步骤2：配置环境变量
async function setupEnvironmentVariables() {
  console.log('📝 配置环境变量...');
  
  const envVars = [
    { key: 'SILICONFLOW_API_KEY', value: CONFIG.SILICONFLOW_API_KEY },
    { key: 'SILICONFLOW_API_URL', value: CONFIG.SILICONFLOW_API_URL }
  ];

  for (const envVar of envVars) {
    console.log(`添加环境变量: ${envVar.key}`);
    
    const options = {
      hostname: 'api.vercel.com',
      path: `/v10/projects/${CONFIG.PROJECT_ID}/env`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const data = {
      key: envVar.key,
      value: envVar.value,
      type: 'encrypted',
      target: ['production']
    };

    try {
      const response = await makeRequest(options, data);
      if (response.status === 200 || response.status === 201) {
        console.log(`✅ ${envVar.key} 配置成功`);
      } else if (response.status === 409) {
        console.log(`ℹ️  ${envVar.key} 已存在，跳过`);
      } else {
        console.error(`❌ ${envVar.key} 配置失败:`, response.data);
      }
    } catch (error) {
      console.error(`❌ 配置 ${envVar.key} 失败:`, error.message);
    }
  }
}

// 步骤3：推送到GitHub（如果需要）
async function pushToGitHub() {
  console.log('🔄 检查Git状态并推送...');
  
  try {
    // 检查是否有未提交的更改
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (status.trim()) {
      console.log('发现未提交的更改，执行提交和推送...');
      
      // 添加所有文件
      execSync('git add .', { stdio: 'inherit' });
      
      // 提交更改
      const commitMessage = `部署更新: AI市场调研系统 - ${new Date().toLocaleString('zh-CN')}`;
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      
      // 推送到远程仓库
      execSync('git push origin main', { stdio: 'inherit' });
      
      console.log('✅ 代码已推送到GitHub');
      
      // 等待GitHub同步
      console.log('⏱️  等待GitHub同步...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } else {
      console.log('ℹ️  没有未提交的更改');
    }
  } catch (error) {
    console.error('❌ Git操作失败:', error.message);
    throw error;
  }
}

// 步骤4：触发Vercel部署
async function triggerDeployment() {
  console.log('🚀 触发Vercel部署...');
  
  const options = {
    hostname: 'api.vercel.com',
    path: '/v13/deployments',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  const data = {
    name: 'wz-main',
    gitSource: {
      type: 'github',
      ref: 'main',
      repoId: `${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}`
    },
    projectSettings: {
      framework: null,
      buildCommand: null,
      outputDirectory: null
    }
  };

  try {
    const response = await makeRequest(options, data);
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ 部署已启动!');
      console.log(`🌐 部署URL: https://${response.data.url}`);
      console.log(`🎯 市场调研系统: https://${response.data.url}/market-research`);
      console.log('📋 可以访问 https://vercel.com/dashboard 查看部署进度');
      return response.data;
    } else {
      console.error('❌ 部署启动失败:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ 触发部署失败:', error.message);
    return null;
  }
}

// 步骤5：等待部署完成
async function waitForDeployment(deploymentUrl) {
  console.log('⏱️  等待部署完成...');
  
  const maxAttempts = 20; // 最大等待10分钟
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const options = {
        hostname: 'api.vercel.com',
        path: `/v13/deployments/${deploymentUrl.split('.')[0]}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CONFIG.VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await makeRequest(options);
      
      if (response.status === 200) {
        const state = response.data.readyState;
        console.log(`部署状态: ${state}`);
        
        if (state === 'READY') {
          console.log('🎉 部署完成!');
          return true;
        } else if (state === 'ERROR' || state === 'CANCELED') {
          console.error('❌ 部署失败');
          return false;
        }
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 30000)); // 等待30秒
      
    } catch (error) {
      console.error('检查部署状态失败:', error.message);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
  
  console.log('⚠️  部署超时，请手动检查状态');
  return false;
}

// 主函数
async function main() {
  console.log('🚀 开始Vercel自动化部署...\n');
  
  try {
    // 步骤1：检查项目
    const project = await checkProject();
    if (!project) {
      throw new Error('项目检查失败');
    }
    
    // 步骤2：配置环境变量
    await setupEnvironmentVariables();
    
    // 步骤3：推送代码到GitHub
    await pushToGitHub();
    
    // 步骤4：触发部署
    const deployment = await triggerDeployment();
    if (!deployment) {
      throw new Error('部署启动失败');
    }
    
    // 步骤5：等待部署完成
    await waitForDeployment(deployment.url);
    
    console.log('\n🎯 部署完成！');
    console.log(`✅ 网站地址: https://${deployment.url}`);
    console.log(`🔍 市场调研系统: https://${deployment.url}/market-research`);
    
  } catch (error) {
    console.error('\n❌ 部署过程中出现错误:');
    console.error(error.message);
    console.error('\n请检查配置信息或手动完成部署');
    process.exit(1);
  }
}

// 运行主函数
main();