# 编码规范精要（Web 精简版）

## 核心原则

---

### 原则 1: 不可变性（CRITICAL）

**铁律**: ALWAYS 创建新对象，NEVER 修改现有对象

**示例**:
```python
# ❌ WRONG
def modify_data(data, key, value):
    data[key] = value
    return data

# ✅ CORRECT
def update_data(data, key, value):
    return {**data, key: value}
```

**原理**: 
- 防止隐藏副作用
- 简化调试
- 启用安全并发

---

### 原则 2: 错误处理

**铁律**: 永不静默吞掉错误

**示例**:
```python
# ❌ WRONG
try:
    result = risky_operation()
except:
    pass  # 静默吞掉

# ✅ CORRECT
try:
    result = risky_operation()
except SpecificError as e:
    logger.error(f"操作失败: {e}", exc_info=True)
    raise UserFriendlyError("操作失败，请稍后重试") from e
```

**要求**:
1. 在每一层显式处理错误
2. UI 层提供用户友好消息
3. 服务器端记录详细上下文
4. 永不静默吞掉错误

---

### 原则 3: 输入验证

**铁律**: 在系统边界验证所有用户输入

**示例**:
```javascript
// ❌ WRONG
function processUserInput(input) {
    return riskyOperation(input);
}

// ✅ CORRECT
function processUserInput(input) {
    const schema = z.string().max(1000).regex(/^[a-zA-Z0-9]+$/);
    const validated = schema.parse(input);
    return riskyOperation(validated);
}
```

**要求**:
1. 使用 schema-based 验证（如 Zod、Pydantic）
2. 快速失败，清晰错误消息
3. 永不信任外部数据（API、用户输入、文件）

---

## 代码质量检查清单

### 基本要求
- [ ] 代码可读且命名良好
- [ ] 函数小（< 50 行）
- [ ] 文件聚焦（< 800 行）
- [ ] 无深层嵌套（> 4 层）

### 错误处理
- [ ] 正确的错误处理
- [ ] 无静默吞掉错误
- [ ] 用户友好的错误消息

### 数据处理
- [ ] 无硬编码值（使用常量或配置）
- [ ] 无原地修改（使用不可变模式）
- [ ] 边界验证所有输入

---

## 实战示例

### 示例 1: 不可变性

**问题代码**:
```python
users = ["Alice", "Bob", "Charlie"]

def add_user(user_list, new_user):
    user_list.append(new_user)  # 原地修改
    return user_list

new_users = add_user(users, "David")
print(users)  # ["Alice", "Bob", "Charlie", "David"] ← 意外修改
```

**修复后**:
```python
users = ["Alice", "Bob", "Charlie"]

def add_user(user_list, new_user):
    return user_list + [new_user]  # 创建新列表

new_users = add_user(users, "David")
print(users)  # ["Alice", "Bob", "Charlie"] ← 原列表不变
print(new_users)  # ["Alice", "Bob", "Charlie", "David"]
```

---

### 示例 2: 错误处理

**问题代码**:
```python
def fetch_user(user_id):
    try:
        response = requests.get(f"/api/users/{user_id}")
        return response.json()
    except:
        return None  # 静默失败
```

**修复后**:
```python
def fetch_user(user_id):
    try:
        response = requests.get(f"/api/users/{user_id}")
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as e:
        logger.error(f"获取用户失败: user_id={user_id}, status={e.response.status_code}")
        raise UserNotFoundError(f"用户 {user_id} 不存在") from e
    except requests.RequestException as e:
        logger.error(f"网络错误: user_id={user_id}", exc_info=True)
        raise NetworkError("网络异常，请稍后重试") from e
```

---

### 示例 3: 输入验证

**问题代码**:
```python
def process_payment(amount, currency):
    # 直接使用用户输入
    return charge_card(amount, currency)
```

**修复后**:
```python
from pydantic import BaseModel, validator

class PaymentRequest(BaseModel):
    amount: float
    currency: str
    
    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('金额必须大于 0')
        if v > 10000:
            raise ValueError('单次支付金额不能超过 10000')
        return v
    
    @validator('currency')
    def validate_currency(cls, v):
        if v not in ['USD', 'EUR', 'CNY']:
            raise ValueError('不支持的货币类型')
        return v

def process_payment(amount, currency):
    # 在边界验证
    request = PaymentRequest(amount=amount, currency=currency)
    return charge_card(request.amount, request.currency)
```

---

## Web 版规范检查工具

### 使用方法

```bash
# 检查代码片段
python3 query.py check --code "def func(): ..."

# 结果示例
⚠️ 发现编码问题:
  [HIGH] immutability: 检测到原地修改，违反不可变性原则
  [MEDIUM] function_length: 函数过长（60行），建议拆分
```

---

## 关键提醒

1. **优先级**: 不可变性 > 错误处理 > 输入验证 > 代码组织
2. **简洁性**: 宁可多写几个小函数，不要一个大函数
3. **安全性**: 永不信任外部数据
4. **可维护性**: 代码是写给人看的，顺便让机器执行

---

**版本**: v1.0-web-standalone  
**来源**: OpenCode 团队编码规范  
**适用**: Web 服务、API 开发、数据处理