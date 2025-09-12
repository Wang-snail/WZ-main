#!/bin/bash

echo "🔍 检查域名DNS解析状态..."
echo "================================"

echo "1. 检查 wsnail.com A记录:"
dig wsnail.com A +short

echo -e "\n2. 检查 www.wsnail.com A记录:"
dig www.wsnail.com A +short  

echo -e "\n3. 检查 NS服务器:"
dig wsnail.com NS +short

echo -e "\n4. 测试HTTPS连接:"
curl -I https://wsnail.com 2>/dev/null | head -3

echo -e "\n5. 测试 www 子域名:"
curl -I https://www.wsnail.com 2>/dev/null | head -3

echo -e "\n✅ 如果看到 76.76.21.22 或类似Vercel IP，说明DNS修复成功！"
echo "🚀 如果仍显示 101.33.46.108，请等待DNS传播完成（最多48小时）"