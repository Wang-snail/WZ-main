# 🚨 应急部署方案

当正常部署流程失效时的紧急解决方案

## 🎯 快速诊断（30秒内）

### 检查清单
```bash
# 1. 检查本地构建
npm run build && ls dist/assets/index-*.js

# 2. 检查Git状态
git status && git log --oneline -1

# 3. 检查网络连接
ping github.com

# 4. 检查线上版本
curl -s "https://www.wsnail.com/" | grep "index-"
```

## 🔧 应急方案（按优先级）

### 方案1: GitHub网页编辑 ⭐⭐⭐⭐⭐
**适用场景**: 本地推送失败，需要立即更新
**成功率**: 95%
**执行时间**: 2-3分钟

1. 访问：https://github.com/Wang-snail/WZ-main/blob/main/src/pages/HomePage.tsx
2. 点击编辑按钮（铅笔图标）
3. 修改任意时间戳或注释
4. 提交：`🚨 紧急更新 - GitHub直接编辑 $(date)`
5. 等待3-5分钟验证

### 方案2: GitHub Actions手动触发 ⭐⭐⭐⭐
**适用场景**: webhook失效，需要强制部署
**成功率**: 80%
**执行时间**: 5-10分钟

1. 访问：https://github.com/Wang-snail/WZ-main/actions
2. 点击"Deploy and Verify"工作流
3. 点击"Run workflow"
4. 选择main分支并确认
5. 监控执行状态

### 方案3: 本地网络切换 ⭐⭐⭐
**适用场景**: 本地网络问题
**成功率**: 70%
**执行时间**: 5分钟

```bash
# 切换网络（WiFi <-> 手机热点）
git push origin main

# 如果仍失败，清除代理
git config --global --unset http.proxy
git config --global --unset https.proxy
git push origin main
```

### 方案4: SSH推送 ⭐⭐
**适用场景**: HTTPS推送失败
**成功率**: 60%
**执行时间**: 10分钟

```bash
# 切换到SSH URL
git remote set-url origin git@github.com:Wang-snail/WZ-main.git
git push origin main

# 推送后切回HTTPS
git remote set-url origin https://github.com/Wang-snail/WZ-main.git
```

### 方案5: Vercel CLI部署 ⭐
**适用场景**: 最后手段
**成功率**: 40%
**执行时间**: 15分钟

```bash
# 需要先配置Vercel CLI登录
vercel --prod
```

## 📱 监控告警

### 自动检查脚本
创建定时任务每小时检查一次：

```bash
# 添加到crontab
0 * * * * cd /path/to/project && npm run verify:deployment
```

### 关键指标监控
- JS文件哈希值变化
- 部署时间戳更新
- 关键内容是否生效
- 响应时间和可用性

## 🔄 故障恢复检查

部署成功后必须验证：

1. **版本确认**: `npm run verify:deployment`
2. **功能测试**: 测试关键功能正常
3. **性能检查**: 页面加载速度正常
4. **缓存清理**: 确保CDN缓存已更新

## 📞 紧急联系

- **GitHub Issues**: https://github.com/Wang-snail/WZ-main/issues
- **Vercel Support**: https://vercel.com/support
- **备用域名**: wz-main.vercel.app

---
**重要**: 每次使用应急方案后，必须分析根本原因并改进正常流程！