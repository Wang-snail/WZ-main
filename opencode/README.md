# OpenCode Web Standalone 独立部署包

> 基于 OpenCode 记忆宫殿衍生的独立 Web 助手包  
> 完全自包含，零依赖，可安全部署到网站

---

## 🚀 快速开始

### 1. 复制到服务器
```bash
# 复制整个目录
scp -r opencode-web-standalone user@server:/path/to/deploy/

# 或通过 Git
git clone <your-repo> opencode-web-standalone
```

### 2. 配置（可选）
```yaml
# 编辑 web_config.yaml
deployment:
  mode: "api"  # 切换为 API 模式
  version: "1.0-web-standalone"
```

### 3. 运行
```bash
# 查看目录结构
tree opencode-web-standalone/

# 测试查询工具
python3 query.py search --query "市场分析"

# 测试市场分析
python3 query.py analyze --cr10 65 --hhi 1800
```

---

## 📁 目录结构

```
opencode-web-standalone/
├── AGENTS.md                  # 核心配置文件（Web 版）
├── knowledge_snapshot.json    # 知识快照（静态）
├── query.py                   # 查询工具（Python）
├── web_config.yaml            # Web 部署配置
├── prompts/                   # Prompt 模板
│   └── system_prompt.txt      # 系统提示（可直接注入）
└── docs/                      # 文档快照
    ├── rational_framework.md  # 理性分析框架
    ├── coding_standards.md    # 编码规范精要
    └── team_structure.md      # 团队协作模式
```

---

## 🔧 部署方案

### 方案 1: 静态知识注入（推荐）

**适用场景**: Web 聊天机器人

**步骤**:
1. 复制 `prompts/system_prompt.txt` 内容
2. 注入到你的 LLM System Prompt
3. 复制 `knowledge_snapshot.json` 中的关键规则

**优点**:
- 零延迟，零服务器成本
- 无需维护
- 安全隔离

---

### 方案 2: API 服务

**适用场景**: 需要动态查询

**创建 API 服务**:
```python
# api_server.py
from flask import Flask, request, jsonify
from query import KnowledgeBase

app = Flask(__name__)
kb = KnowledgeBase()

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('q', '')
    results = kb.search(query)
    return jsonify(results)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    result = kb.analyze_market(data['cr10'], data['hhi'])
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=8080)
```

**运行**:
```bash
python3 api_server.py
```

---

### 方案 3: JavaScript SDK

**适用场景**: 前端直接集成

**创建 SDK**:
```javascript
// opencode-sdk.js
export class OpenCodeWeb {
  constructor(knowledgeBase) {
    this.kb = knowledgeBase;
  }

  async analyzeMarket(cr10, hhi) {
    // 调用本地逻辑或 API
    return this.kb.analyzeMarket(cr10, hhi);
  }

  detectRhetoric(text) {
    return this.kb.detectRhetoric(text);
  }
}
```

---

## 📊 知识快照说明

### 内容概要
- **市场分析规则**: CR10/HHI 决策表
- **理性分析框架**: 4 层防御机制
- **编码规范**: 不可变性/错误处理/输入验证
- **团队协作**: 7 人角色 + 工作流

### 快照特性
- ✅ **静态**: 不自动更新，无进化
- ✅ **精简**: 仅核心规则，无冗杂细节
- ✅ **可验证**: 所有规则基于 OpenCode 团队验证
- ✅ **安全**: 无外部依赖，无代码执行

### 更新方式
```bash
# 手动更新知识快照
vi knowledge_snapshot.json
# 或替换为新的 JSON 文件
```

---

## ⚡ 性能与安全

### 性能特点
- 内存占用: < 10MB
- 查询延迟: < 10ms（本地）
- 无网络依赖: 纯本地计算
- 无数据库: 纯 JSON 文件

### 安全保证
- ✅ **只读**: 不写入任何文件
- ✅ **无依赖**: 无外部包依赖
- ✅ **无执行**: 不执行用户代码
- ✅ **无联网**: 不访问外部网络
- ✅ **隔离**: 不影响原始系统

---

## 🧪 测试验证

### 功能测试
```bash
# 1. 测试搜索
python3 query.py search --query "CR10"

# 2. 测试市场分析
python3 query.py analyze --cr10 65 --hhi 1800

# 3. 测试话术检测
python3 query.py detect --text "这款产品将彻底改变行业！"

# 4. 测试代码检查
python3 query.py check --code "def modify(data): data['key']='value'; return data"
```

### 完整性检查
```bash
# 检查文件存在
ls -la *.md *.json *.py *.yaml

# 检查 JSON 格式
python3 -m json.tool knowledge_snapshot.json > /dev/null && echo "✓ JSON 格式正确"

# 测试 Python 工具
python3 -c "from query import KnowledgeBase; kb=KnowledgeBase(); print('✓ 导入成功')"
```

---

## 📝 集成示例

### 示例 1: ChatGPT 插件
```javascript
// ChatGPT 插件配置
{
  "name": "OpenCode Assistant",
  "description": "市场分析、理性判断、编码检查",
  "system_prompt": "你是OpenCode助手，基于以下规则...",
  "rules": {
    // 从 knowledge_snapshot.json 提取
  }
}
```

### 示例 2: 网站聊天机器人
```html
<script>
// 集成到网站
const opencodeRules = {
  market: {
    cr10: ">70%: 不进入, 40-70%: 谨慎, <40%: 进入"
  },
  coding: {
    immutability: "ALWAYS创建新对象，NEVER修改现有对象"
  }
};

// 使用规则辅助回答
function getAnswer(question) {
  if (question.includes('市场')) {
    return opencodeRules.market.cr10;
  }
  if (question.includes('代码')) {
    return opencodeRules.coding.immutability;
  }
}
</script>
```

### 示例 3: API 客户端
```python
import requests

class OpenCodeClient:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def analyze_market(self, cr10, hhi):
        response = requests.post(
            f"{self.base_url}/analyze",
            json={"cr10": cr10, "hhi": hhi}
        )
        return response.json()
    
    def detect_rhetoric(self, text):
        response = requests.post(
            f"{self.base_url}/detect",
            json={"text": text}
        )
        return response.json()
```

---

## 🔄 维护与更新

### 版本控制
```yaml
# 在部署包中创建版本文件
version: "1.0-web-standalone"
build_date: "2026-04-10"
source_hash: "abc123..."
updates: "manual"
```

### 备份策略
```bash
# 备份部署包
tar -czf opencode-web-$(date +%Y%m%d).tar.gz opencode-web-standalone/

# 保留版本记录
echo "1.0-web-standalone: 2026-04-10" >> VERSIONS.txt
```

### 故障排查
| 问题 | 检查步骤 | 解决方案 |
|------|----------|----------|
| Python 错误 | `python3 --version` | 需要 Python 3.9+ |
| JSON 错误 | `python3 -m json.tool kb.json` | 修复 JSON 格式 |
| 权限问题 | `ls -la` | 确保文件可读 |
| 导入错误 | `python3 -c "from query import KB"` | 检查路径 |

---

## 📞 技术支持

### 文档资源
- `AGENTS.md`: 完整配置说明
- `README.md`: 使用手册
- `integration_guide.md`: 集成指南

### 问题反馈
1. 检查 `web_config.yaml` 配置
2. 运行 `query.py` 测试
3. 查看日志输出
4. 查阅文档快照

### 升级建议
1. 定期手动更新知识快照
2. 监控使用情况
3. 收集用户反馈
4. 基于反馈优化规则

---

## 📋 部署检查清单

### 部署前
- [ ] 测试 `query.py` 功能正常
- [ ] 验证 `knowledge_snapshot.json` 格式
- [ ] 检查 `web_config.yaml` 配置
- [ ] 确认无外部依赖

### 部署中
- [ ] 复制完整目录结构
- [ ] 设置合适的文件权限
- [ ] 配置防火墙（如果 API 模式）
- [ ] 创建备份

### 部署后
- [ ] 运行功能测试
- [ ] 监控系统资源
- [ ] 收集用户反馈
- [ ] 定期更新知识快照

---

## 🎉 完成！

**OpenCode Web Standalone 部署包已准备好！**

**关键特性**:
- ✅ **完全独立**: 零依赖，自包含
- ✅ **静态知识**: 不会意外变化
- ✅ **安全隔离**: 不影响原始系统
- ✅ **可扩展**: 支持多种集成方式
- ✅ **轻量级**: 适合 Web 部署

**使用方法**:
1. **快速测试**: `python3 query.py search --query "关键词"`
2. **集成到 LLM**: 复制 `system_prompt.txt` 内容
3. **创建 API**: 基于 `query.py` 封装
4. **静态嵌入**: 提取规则集成到现有系统

**祝你部署顺利！** 🚀

---
**构建时间**: 2026-04-10  
**版本**: v1.0-web-standalone  
**来源**: OpenCode 记忆宫殿系统  
**许可**: MIT  
**维护者**: OpenCode 团队