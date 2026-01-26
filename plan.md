# PLAN.md

> AI Vibe Coding 执行计划（参考 OpenSec 思路）  
> 项目目标：构建一个 **AI‑Ready 的云端 App（Android APK）**，基于 **React Native + Supabase + LangChain**，当前可用、未来可进化为 AI 原生系统。

---

## 0. 设计原则（OpenSec 风格约束）

- **Secure by Design**：所有数据访问必须经过 Supabase RLS
- **AI as Plugin**：AI 能力永远是可插拔模块，不侵入核心业务
- **Single Source of Truth**：Supabase Postgres 为唯一事实数据源
- **Least Privilege**：AI / Edge Function / Client 都使用最小权限
- **Composable**：功能模块、AI Tools、Agent 可组合
- **Auditable**：AI 行为、数据变更可追踪

---

## 1. 系统范围（Scope）

### 1.1 客户端（APK）
- 用户登录 / 登出
- 权限感知 UI
- 股票行情（只读）
- Todo（CRUD + 状态）
- 文本 / 图片 / 视频上传与浏览
- AI 助手入口（只读 → 可执行）

### 1.2 后端（Supabase）
- Auth（JWT / SSO 预留）
- Postgres（结构化数据 + 向量）
- Storage（对象存储）
- Realtime（订阅）
- Edge Functions（BFF + AI 执行层）

### 1.3 AI 层（LangChain）
- Retrieval（pgvector）
- Tools（Supabase / 股票 / Todo）
- Agent（可控执行）

---

## 2. 技术栈锁定（Tech Lock）

### Client
- React Native + Expo
- TypeScript
- Zustand / Redux Toolkit

### Backend
- Supabase
  - Auth
  - Postgres + pgvector
  - Storage
  - Realtime
  - Edge Functions (Deno)

### AI
- LangChain (Node.js)
- OpenAI / Claude（可替换）
- Supabase Vector Store

---

## 3. 数据模型（AI‑Friendly）

### 3.1 用户 & 权限

```
users
- id (uuid)
- email
- role            // user | premium | admin
- created_at
```

```
roles
- id
- name
```

---

### 3.2 Todo

```
todos
- id
- user_id
- title
- description
- status          // todo | doing | done
- due_at
- embedding       // vector
- created_at
```

RLS：
- 用户只能访问自己的 todos

---

### 3.3 文本内容（AI 主要知识源）

```
documents
- id
- user_id
- content
- embedding
- created_at
```

---

### 3.4 文件索引（指向 Storage）

```
files
- id
- user_id
- type            // image | video | other
- storage_path
- created_at
```

---

## 4. 安全模型（OpenSec 核心）

### 4.1 身份
- 所有请求必须携带 Supabase JWT
- Edge Function 作为唯一可信执行入口

### 4.2 行级安全（RLS）
- 所有业务表启用 RLS
- AI 永远使用 Service Role + user_id 注入

### 4.3 AI 权限分级

| Role | AI 能力 |
|----|--------|
| user | 查询 / 总结 |
| premium | 创建 / 修改 |
| admin | 分析 / 批量 |

---

## 5. API / BFF 设计（Edge Functions）

### 5.1 标准业务 API
- POST /auth/login
- GET /todos
- POST /todos
- GET /stocks
- POST /files/upload

### 5.2 AI API（唯一入口）

```
POST /ai/assistant
```

输入：
- user_query
- context (optional)

输出：
- structured_result
- optional_actions (dry‑run)

---

## 6. LangChain 集成规划

### 6.1 Vector Store
- Supabase pgvector
- documents / todos

### 6.2 Tools 定义

- getTodos(user_id)
- createTodo(user_id, payload)
- searchDocuments(user_id, query)
- getStockPrice(symbol)

### 6.3 Agent 模式（阶段性）

Phase 1：
- Retrieval + Summary

Phase 2：
- Tool Calling（需确认）

Phase 3：
- Semi‑Autonomous Agent（审计 + 限权）

---

## 7. 功能交付阶段（Execution Phases）

### Phase 0 – 基础设施
- Supabase 项目初始化
- Auth + RLS
- 基础表结构

### Phase 1 – 核心业务
- 登录
- Todo
- 文件存储
- 股票行情（只读）

### Phase 2 – AI Read‑Only
- 文本 / Todo 向量化
- AI 总结 / 搜索

### Phase 3 – AI Execute（受控）
- AI 创建 Todo
- AI 规划任务

### Phase 4 – AI Native
- Agent Workflow
- 自动化任务

---

## 8. AI Vibe Coding 指南

- 每个模块独立生成、独立验证
- 禁止 AI 绕过 RLS
- 所有 AI 写操作默认 dry‑run
- 代码优先可读、可审计

---

## 9. 成功标准（Definition of Done）

- App 可独立运行
- Supabase 为唯一数据源
- AI 不破坏权限模型
- 新模型可无痛替换

---

## 10. 一句话愿景

> 这是一个 **可以逐步把“操作权”交给 AI，但永远不会失控的云端 App 平台**。

