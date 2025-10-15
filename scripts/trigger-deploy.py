#!/usr/bin/env python3
"""
触发 Vercel 部署脚本
使用 Vercel API 触发项目重新部署
"""

import requests
import json
import sys

# Vercel 配置
VERCEL_TOKEN = "A0PMYyd05zuzma2v25bj7kW8"
PROJECT_ID = "prj_OXALain1SCUD0EJtGviaB4yHNZMz"
TEAM_ID = "team_W4MxdTuAtOWNfVacOgrWZok5"

def get_latest_deployment():
    """获取最新的生产部署"""
    url = f"https://api.vercel.com/v6/deployments?projectId={PROJECT_ID}&limit=1&target=production"
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }

    print("📡 获取最新部署信息...")
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"❌ 获取部署失败: {response.status_code}")
        print(response.text)
        return None

    data = response.json()
    if data.get("deployments"):
        deployment = data["deployments"][0]
        print(f"✅ 找到最新部署: {deployment['url']}")
        print(f"   状态: {deployment.get('state', 'unknown')}")
        print(f"   创建时间: {deployment.get('createdAt', 'unknown')}")
        return deployment

    return None

def trigger_redeploy(deployment_url):
    """触发重新部署"""
    url = f"https://api.vercel.com/v13/deployments/{deployment_url}/redeploy"
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
        "name": "wz-main",
        "target": "production"
    }

    print(f"\n🚀 触发重新部署...")
    response = requests.post(url, headers=headers, json=data, timeout=60)

    if response.status_code in [200, 201]:
        result = response.json()
        print(f"✅ 部署已触发!")
        print(f"   部署 URL: {result.get('url', 'N/A')}")
        print(f"   状态: {result.get('readyState', result.get('state', 'QUEUED'))}")
        return True
    else:
        print(f"❌ 部署失败: {response.status_code}")
        print(response.text)
        return False

def create_hook_deployment():
    """通过 Deploy Hook 创建部署"""
    # 先尝试创建一个简单的部署请求
    url = "https://api.vercel.com/v13/deployments"
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }

    # 使用最简单的部署配置
    data = {
        "name": "wz-main",
        "project": PROJECT_ID,
        "target": "production",
        "source": "import"
    }

    print("\n🔄 尝试创建新部署...")
    try:
        response = requests.post(url, headers=headers, json=data, timeout=60)

        if response.status_code in [200, 201]:
            result = response.json()
            print(f"✅ 新部署已创建!")
            print(f"   部署 URL: {result.get('url', 'N/A')}")
            return True
        else:
            print(f"ℹ️  直接部署返回: {response.status_code}")
            print(response.text[:500])
            return False
    except Exception as e:
        print(f"ℹ️  创建部署出错: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("Vercel 部署触发工具")
    print("=" * 60)

    # 方案1: 获取最新部署并重新部署
    deployment = get_latest_deployment()
    if deployment:
        deployment_url = deployment.get('url', '').replace('https://', '')
        if deployment_url:
            if trigger_redeploy(deployment_url):
                print("\n✅ 部署已成功触发!")
                print("\n📝 后续步骤:")
                print("1. 访问 https://vercel.com 查看部署进度")
                print("2. 等待 2-3 分钟让部署完成")
                print("3. 访问 https://www.wsnail.com 验证更新")
                return 0

    # 方案2: 尝试创建新部署
    print("\n" + "=" * 60)
    print("方案1失败,尝试方案2...")
    print("=" * 60)
    if create_hook_deployment():
        print("\n✅ 部署已成功触发!")
        return 0

    # 所有方案都失败
    print("\n" + "=" * 60)
    print("❌ 自动部署失败")
    print("=" * 60)
    print("\n需要手动操作:")
    print("1. 访问 https://vercel.com/snails-projects-d6eda891/wz-main")
    print("2. 点击最新的部署")
    print("3. 点击 '...' 菜单,选择 'Redeploy'")
    print("4. 确认部署到 Production")

    return 1

if __name__ == "__main__":
    sys.exit(main())
