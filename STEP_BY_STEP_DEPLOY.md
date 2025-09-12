# 🎯 Vercel部署 - 详细图解步骤

## 现在你应该看到Vercel仪表板页面

### 第一步：找到你的项目 🔍

在Vercel仪表板页面，你应该看到：

**寻找项目卡片：**
- 项目名称：**wz-main** 
- 或者类似：**wang-snail/wz-main**
- 状态可能显示：Ready 或 Building

**👆 点击这个项目卡片**（整个卡片都可以点击）

---

### 第二步：进入项目设置 ⚙️

点击项目后，你会看到项目详情页面，顶部有几个标签：

```
Overview | Deployments | Analytics | Settings | ...
```

**👆 点击 "Settings" 标签**

---

### 第三步：配置环境变量 📝

在Settings页面的左侧，你会看到一个菜单列表：

```
General
Functions  
Environment Variables  ← 👆 点击这个
Domains
Git
...
```

**👆 点击 "Environment Variables"**

---

### 第四步：添加第一个环境变量 🔑

在Environment Variables页面，你会看到：

```
Environment Variables
Configure environment variables for your deployments

[Add New] 按钮  ← 👆 点击这个按钮
```

**点击 "Add New" 按钮后会弹出一个表单：**

**填写以下内容（完全复制粘贴）：**

```
Name: SILICONFLOW_API_KEY
```

```
Value: sk-hwbvirmjuviwfyqbjqpmlebxetsdechtbyxmflziefipkbht
```

**Environment 下拉菜单：**
- 选择：✅ **Production**
- 确保Preview和Development不要勾选

**👆 点击 "Save" 按钮**

---

### 第五步：添加第二个环境变量 🌐

继续点击 **"Add New"** 按钮，填写：

```
Name: SILICONFLOW_API_URL
```

```
Value: https://api.siliconflow.cn/v1
```

**Environment 下拉菜单：**
- 选择：✅ **Production**

**👆 点击 "Save" 按钮**

---

### 第六步：触发新部署 🚀

现在回到顶部，点击：

```
Overview | Deployments | Analytics | Settings
```

**👆 点击 "Deployments" 标签**

在Deployments页面，你会看到部署历史列表，最新的在最上面。

**找到最新的部署记录**（通常在第一行），在右侧你会看到：

```
[状态图标] [部署信息] [时间] [...] ← 👆 点击这三个点
```

**点击右侧的三个点 (⋯) 菜单，选择：**
- **"Redeploy"** 选项

**会弹出确认对话框：**
```
Redeploy to Production?
[Cancel] [Redeploy] ← 👆 点击 Redeploy
```

---

### 第七步：等待部署完成 ⏱️

部署开始后，你会看到状态变化：

```
🟡 Building...  (约2-3分钟)
⬇️
🟢 Ready       (部署完成)
```

**当状态变为 "Ready" 时，部署就完成了！**

---

## 🎯 部署完成！获取你的网站地址

部署完成后，在Deployments页面最新记录中，你会看到一个链接：

```
https://wz-main-wang-snails-projects.vercel.app
```

**你的AI市场调研系统地址是：**
```
https://wz-main-wang-snails-projects.vercel.app/market-research
```

---

## ❓ 如果你卡在某一步

**请告诉我：**
1. 你现在在哪一步？
2. 你看到的页面是什么样的？
3. 有什么按钮或选项找不到？

我会根据你的情况提供具体指导！

---

**现在开始第一步：在Vercel页面找到 wz-main 项目并点击！** 👆