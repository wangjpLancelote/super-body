# TASKS.md

> 基于 PLAN.md 的 **AI Coding 可执行任务拆解**  
> 目标：将系统拆解为 **可并行、可审计、可回滚** 的 AI 编码任务单元  
> 原则：**一个 Task = 一个明确产出**

---

## Task Group A – 基础设施 / Supabase

### A1. Supabase 项目初始化
- 创建 Supabase 项目
- 开启 Auth / Storage / Realtime
- 记录 project_url / anon_key / service_role_key

**产出**：
- supabase.config.md

---

### A2. 数据库表结构（Schema）
- 创建 users / todos / documents / files 表
- 启用 pgvector
- embedding 字段预留

**产出**：
- schema.sql

---

### A3. Row Level Security（RLS）
- 为 todos / documents / files 启用 RLS
- 用户只能访问自己的数据
- Service Role + user_id 注入策略

**产出**：
- rls.sql

---

## Task Group B – 后端 / Edge Functions（BFF）

### B1. Edge Function 项目骨架
- 初始化 Supabase Edge Functions
- 统一鉴权中间件
- user_id 注入上下文

**产出**：
- /supabase/functions/_shared/auth.ts

---

### B2. Todo API
- GET /todos
- POST /todos
- PATCH /todos/:id

**约束**：
- 必须通过 JWT
- 不允许绕过 RLS

**产出**：
- functions/todos/index.ts

---

### B3. 文件上传 API
- 获取 signed upload URL
- 写入 files 表索引

**产出**：
- functions/files/index.ts

---

## Task Group C – LangChain / AI 接入

### C1. LangChain 运行环境
- Node.js / Deno 运行方案选型
- 环境变量管理（LLM Key）

**产出**：
- ai/runtime.md

---

### C2. Vector Store 接入（Supabase）
- documents / todos 向量化
- SupabaseVectorStore 初始化

**产出**：
- ai/vector.ts

---

### C3. AI Tools 定义

Tools：
- getTodos(user_id)
- createTodo(user_id, payload)
- searchDocuments(user_id, query)
- getStockPrice(symbol)

**约束**：
- 所有写操作默认 dry-run

**产出**：
- ai/tools.ts

---

### C4. AI Assistant API

```
POST /ai/assistant
```

- JWT 校验
- 注入 user_id / role
- LangChain Agent 调用

**产出**：
- functions/ai-assistant/index.ts

---

## Task Group D – 前端 / React Native

### D1. 项目初始化
- Expo + React Native
- Supabase Client 初始化

**产出**：
- App.tsx
- src/lib/supabase.ts

---

### D2. 登录 & 权限状态
- 登录 / 登出
- Token 存储
- Role 感知

**产出**：
- src/auth/*

---

### D3. Todo 模块
- Todo 列表
- 创建 / 完成
- Realtime 订阅

**产出**：
- src/todos/*

---

### D4. 文件模块
- 图片 / 视频上传
- 预览

**产出**：
- src/files/*

---

## Task Group E – Socket / Realtime

### E1. Supabase Realtime 接入
- Todo 变更订阅
- 状态同步

**产出**：
- realtime.ts

---

### E2. 股票行情 Socket（只读）
- WebSocket 客户端
- 自动重连

**产出**：
- src/stocks/socket.ts

---

## Task Group F – UI / 原型

### F1. 信息架构（IA）
- 页面结构定义
- 模块导航

**产出**：
- ui/ia.md

---

### F2. 核心页面 Wireframe
- 登录页
- Todo 页
- AI Assistant 页

**产出**：
- ui/wireframes.md

---

## Task Group G – AI Coding 规则（给 Agent）

### G1. 编码约束
- 不得硬编码密钥
- 不得绕过 RLS
- 写操作必须支持 dry-run

---

### G2. 验证规则
- 每个 Task 可独立运行
- 输出必须可审计

---

## 执行建议（非常重要）

1. **先 A → B → D → C**
2. AI Task 并行执行，人工 Review 合并
3. 所有 AI 写操作走 dry-run

---

## 终极目标

> 让 AI **按 Task 执行，而不是自由发挥**。
