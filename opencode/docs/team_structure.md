# 七人协作团队模式

## 概述

基于 Anthropic 黑客马拉松获胜项目，经过 10 个月生产级使用验证的协作配置体系。这套模式使 AI 助手能够模拟人类团队的分工协作，提高复杂任务的处理质量和效率。

## 团队成员角色定义

| # | 代理角色 | 职责 | 触发场景 | 协作关系 |
|---|---------|------|----------|----------|
| 1 | **orchestrator** | 团队协调、任务分配、进度跟踪 | 复杂任务开始时 | 调度其他 6 个代理 |
| 2 | **architect** | 系统架构设计、技术选型、模块划分 | 架构决策 | 向 planner 提供架构方案 |
| 3 | **planner** | 实现规划、任务拆解、优先级排序 | 新功能、重构 | 接收 architect 方案，指导 developer |
| 4 | **developer** | 核心编码实现、代码编写 | 编写代码 | 接收 planner 规划，提交给 reviewer |
| 5 | **reviewer** | 代码审查、质量把控、最佳实践检查 | 编码完成后 | 审查 developer 代码，反馈给 tester |
| 6 | **tester** | 测试验证、用例设计、边界测试 | 提交前 | 验证 reviewer 通过的代码 |
| 7 | **doc-writer** | 文档更新、API 文档、使用说明 | 功能完成后 | 最终输出文档 |

## 团队协作工作流

### 标准开发流程

```
用户请求
  ↓
orchestrator (评估任务复杂度)
  ├─ 简单任务 → 直接执行
  └─ 复杂任务 → 触发团队协作
      ↓
  architect (架构设计)
      ↓
  planner (实现规划)
      ↓
  developer (编码实现)
      ↓
  reviewer (代码审查)
      ├─ 不通过 → 返回 developer 修改
      └─ 通过 → 继续
          ↓
  tester (测试验证)
      ├─ 不通过 → 返回 developer 修复
      └─ 通过 → 继续
          ↓
  doc-writer (文档更新)
      ↓
  orchestrator (汇总交付)
```

### 并行执行策略

- **architect + planner**：可并行（架构设计时规划初步方案）
- **reviewer + tester**：可并行审查不同模块
- **doc-writer**：可提前准备文档框架

## 代理调用规则

### 触发条件

1. **orchestrator**：用户请求涉及 3+ 文件或需要多人协作
2. **architect**：新增模块、重构、技术选型
3. **planner**：功能实现前、重构前
4. **developer**：明确编码任务时
5. **reviewer**：编码完成后立即调用
6. **tester**：reviewer 通过后调用
7. **doc-writer**：测试通过后调用

### 角色优先级

- **高优先级**：orchestrator、architect、developer
- **中优先级**：planner、reviewer
- **低优先级**：tester、doc-writer

## 子代理编排（Subagents）

### 原有代理整合

| 代理 | 整合方式 |
|------|----------|
| tdd-guide | developer 的测试驱动开发模式 |
| code-reviewer | 合并到 reviewer 角色 |
| security-reviewer | reviewer 的安全审查维度 |
| build-error-resolver | developer 的错误处理能力 |
| e2e-runner | tester 的端到端测试能力 |
| refactor-cleaner | developer 的代码清理能力 |
| doc-updater | 合并到 doc-writer 角色 |

## 性能优化策略

### 模型选择策略

- **Haiku 4.5**：轻量代理、配对编程、worker 代理（90% Sonnet 能力，3x 成本节省）
- **Sonnet 4.5**：主要开发工作、编排多代理工作流、复杂编码任务（最佳编码模型）
- **Opus 4.5**：复杂架构决策、最大推理需求、研究分析任务

### 上下文窗口管理

- **避免在上下文最后 20% 执行**：大规模重构、跨多文件的功能实现、复杂交互调试
- **低上下文敏感任务**：单文件编辑、独立工具创建、文档更新、简单 bug 修复

## 场景路由（决策树）

```
用户请求
  ├── 新功能 / 复杂重构（3+ 文件）
  │     └── → orchestrator → architect → planner → developer → reviewer → tester → doc-writer
  ├── Bug 修复
  │     └── → developer → reviewer → tester
  ├── 代码审查
  │     └── → reviewer
  ├── 维护清理
  │     └── → developer → doc-writer
  └── 简单任务（<3 文件）
        └── → 直接执行
```

## 最佳实践

### 1. 任务拆解原则
- 复杂任务必须拆解为可独立完成的子任务
- 每个子任务应有明确的验收标准
- 保持任务粒度适中（2-4 小时工作量）

### 2. 质量把关
- reviewer 重点关注：安全性、性能、可维护性
- tester 重点关注：功能正确性、边界条件、回归风险
- 必须通过所有质量关卡才能交付

### 3. 文档标准
- 所有新功能必须配有使用文档
- API 变更必须更新接口文档
- 重大重构必须更新架构文档

## 在 Web 版本中的应用

在静态知识快照中，团队协作模式作为核心配置的一部分，用于指导 AI 助手：

1. **作为系统提示**：直接注入到 LLM 的 system prompt 中
2. **作为决策框架**：指导助手如何拆分和处理复杂请求
3. **作为质量保证**：确保输出符合编码标准和最佳实践
4. **作为沟通模板**：提供标准化的任务描述和进度报告格式

## 使用示例

```python
# query.py 中的团队协作查询
result = query_knowledge("如何组织七人团队处理一个复杂的全栈项目？")

# 响应示例：
# 1. orchestrator 评估项目规模和技术栈
# 2. architect 设计系统架构和模块划分
# 3. planner 制定开发计划和里程碑
# 4. developer 实现核心功能
# 5. reviewer 进行代码审查和质量检查
# 6. tester 验证功能和性能
# 7. doc-writer 编写使用文档和 API 文档
```

## 常见问题

**Q：什么时候需要启动七人团队模式？**
A：当任务涉及 3 个以上文件、需要跨领域协作、或复杂度超过单人能力时。

**Q：如何判断任务复杂度？**
A：根据文件数量、技术栈多样性、测试难度、文档需求综合判断。

**Q：可以跳过某些代理吗？**
A：不建议，每个代理都承担特定质量把关职责。特殊情况可简化流程。

**Q：这个模式适用于所有类型的任务吗？**
A：主要适用于软件开发、系统设计、代码重构等工程任务。对于简单查询或文档工作，直接执行即可。