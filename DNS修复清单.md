# wsnail.com DNS修复清单

## 🔍 问题诊断
- [x] 确认域名解析指向 `domainexpired.domain-expired.com`
- [x] 确认SSL证书为 `*.dnspod.cn`（不匹配）
- [x] 确认Vercel项目配置正常

## 🛠 修复步骤

### 1. 域名管理
- [ ] 登录域名注册商管理面板
- [ ] 检查域名到期时间
- [ ] 如果过期，完成续费
- [ ] 检查域名锁定状态

### 2. DNS解析配置
- [ ] 删除指向 `domainexpired.domain-expired.com` 的所有记录
- [ ] 添加以下CNAME记录：
  ```
  @ → cname.vercel-dns.com
  www → cname.vercel-dns.com
  ```
- [ ] 或者添加A记录：
  ```
  @ → 76.76.21.22
  www → 76.76.21.22
  ```

### 3. 验证修复
- [ ] 运行DNS检查脚本：`./scripts/check-dns.sh`
- [ ] 等待DNS传播（5分钟-48小时）
- [ ] 访问 https://wsnail.com 确认SSL证书正常
- [ ] 访问 https://www.wsnail.com 确认重定向正常

## 🚀 临时访问地址
- https://wz-main.vercel.app （主要）
- https://temp.wsnail.com （备用）

## 📞 联系信息
如遇问题，可以：
1. 联系域名注册商客服
2. 检查域名注册邮箱是否有续费通知
3. 确认付款方式是否正常

## 🕐 预计修复时间
- 域名续费：立即生效
- DNS修改：5-30分钟
- 全球传播：最多48小时
- SSL证书更新：DNS生效后24小时内自动更新

## ✅ 修复完成标志
- [ ] `nslookup wsnail.com` 返回Vercel IP地址
- [ ] https://wsnail.com 显示网站内容
- [ ] SSL证书显示为Vercel签发
- [ ] 浏览器不再显示"连接不安全"警告