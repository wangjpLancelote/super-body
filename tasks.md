# TASKS.md

> 基于 PLAN.md 的 **AI Coding 可执行任务拆解**
> 目标：将系统拆解为 **可并行、可审计、可回滚** 的 AI 编码任务单元
> 原则：**一个 Task = 一个明确产出**

---

## 📊 **整体进度概览**

### **状态统计**
- ✅ **已完成**: 26/27 任务 (96%)
- ⚠️ **部分完成**: 1/27 任务 (4%)
- ❌ **未开始**: 0/27 任务 (0%)

### **完成情况概览**
- **基础设施 (A)**: ✅ 100% 完成
- **后端 API (B)**: ✅ 100% 完成
- **AI 集成 (C)**: ✅ 100% 完成
- **Web 前端 (W)**: ✅ 100% 完成
- **移动端前端 (D)**: ⚠️ 75% 完成
- **Socket/Realtime (E)**: ✅ 100% 完成
- **Socket/Realtime 增强 (H)**: ✅ 100% 完成
- **UI/原型 (F)**: ✅ 100% 完成
- **AI 规则 (G)**: ✅ 100% 完成

### **核心功能状态**
| 功能 | Web | 移动端 | 后端 | AI | SSE |
|------|-----|--------|------|----|-----|
| 认证系统 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todo 管理 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 文件管理 | ✅ | ❌ | ✅ | ✅ | ✅ |
| AI 助手 | ✅ | ❌ | ✅ | ✅ | ✅ |
| 股票行情 | ✅ | ❌ | ✅ | ✅ | ✅ |
| 实时同步 | ✅ | ✅ | ✅ | ✅ | ✅ |
| SSE-Signal | ✅ | ✅ | ✅ | ❌ | ✅ |

---

---

## Task Group A – 基础设施 / Supabase ✅ **已完成**

### A1. Supabase 项目初始化 ✅ **已完成**
- 创建 Supabase 项目
- 开启 Auth / Storage / Realtime
- 记录 project_url / anon_key / service_role_key

**产出**：
- supabase.config.md

---

### A2. 数据库表结构（Schema） ✅ **已完成**
- 创建 users / todos / documents / files 表
- 启用 pgvector
- embedding 字段预留

**产出**：
- supabase/migrations/001_schema.sql

---

### A3. Row Level Security（RLS） ✅ **已完成**
- 为 todos / documents / files 启用 RLS
- 用户只能访问自己的数据
- Service Role + user_id 注入策略

**产出**：
- supabase/migrations/002_rls.sql

---

## Task Group B – 后端 / Edge Functions（BFF） ✅ **已完成**

### B1. Edge Function 项目骨架 ✅ **已完成**
- 初始化 Supabase Edge Functions
- 统一鉴权中间件
- user_id 注入上下文

**产出**：
- /supabase/functions/_shared/auth.ts
- /supabase/functions/_shared/context.ts

---

### B2. Todo API ✅ **已完成**
- GET /todos
- POST /todos
- PATCH /todos/:id

**约束**：
- 必须通过 JWT
- 不允许绕过 RLS

**产出**：
- supabase/functions/todos/index.ts

---

### B3. 文件上传 API ✅ **已完成**
- 获取 signed upload URL
- 写入 files 表索引

**产出**：
- supabase/functions/files/index.ts

---

## Task Group C – LangChain / AI 接入 ✅ **已完成**

### C1. LangChain 运行环境 ✅ **已完成**
- Node.js / Deno 运行方案选型
- 环境变量管理（LLM Key）

**产出**：
- ai/runtime.md

---

### C2. Vector Store 接入（Supabase） ✅ **已完成**
- documents / todos 向量化
- SupabaseVectorStore 初始化

**产出**：
- ai/vector.ts

---

### C3. AI Tools 定义 ✅ **已完成**

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

### C4. AI Assistant API ✅ **已完成**

```
POST /ai/assistant
```

- JWT 校验
- 注入 user_id / role
- LangChain Agent 调用

**产出**：
- supabase/functions/ai-assistant/index.ts

---

## Task Group D – 前端 / React Native ⚠️ **部分完成**

### D1. 项目初始化 ✅ **已完成**
- Expo + React Native
- Supabase Client 初始化

**产出**：
- apps/mobile/App.tsx
- apps/mobile/src/lib/supabase.ts

---

### D2. 登录 & 权限状态 ✅ **已完成**
- 登录 / 登出
- Token 存储
- Role 感知

**产出**：
- apps/mobile/src/auth/*

---

### D3. Todo 模块 ✅ **已完成**
- Todo 列表
- 创建 / 完成
- Realtime 订阅

**产出**：
- apps/mobile/src/todos/*

---

### D4. 文件模块 ❌ **待完成**
- 图片 / 视频上传
- 预览

**产出**：
- apps/mobile/src/files/*

---

## Task Group E – Socket / Realtime ✅ **已完成**

### E1. Supabase Realtime 接入 ✅ **已完成**
- Todo 变更订阅
- 状态同步

**产出**：
- apps/mobile/src/realtime.ts

---

### E2. 股票行情 Socket（只读） ⚠️ **API已实现，UI待完成**
- WebSocket 客户端
- 自动重连

**产出**：
- apps/mobile/src/stocks/socket.ts

---

## Task Group F – UI / 原型 ✅ **已完成**

### F1. 信息架构（IA） ✅ **已完成**
- 页面结构定义
- 模块导航

**产出**：
- ui/ia.md

---

### F2. 核心页面 Wireframe ✅ **已完成**
- 登录页
- Todo 页
- AI Assistant 页

**产出**：
- ui/wireframes.md

---

## Task Group G – AI Coding 规则（给 Agent） ✅ **已完成**

### G1. 编码约束 ✅ **已完成**
- 不得硬编码密钥
- 不得绕过 RLS
- 写操作必须支持 dry-run

---

### G2. 验证规则 ✅ **已完成**
- 每个 Task 可独立运行
- 输出必须可审计

---

## Task Group W – Web 前端（Next.js + Tailwind CSS） ✅ **已完成**

### W1. Next.js 项目初始化 ✅ **已完成**
- 使用 Next.js 14+ App Router
- 配置 Tailwind CSS
- 设置 Shadcn/ui 组件库
- TypeScript 严格模式配置

**产出**：
- apps/web/next.config.mjs
- apps/web/tsconfig.json
- apps/web/tailwind.config.ts
- apps/web/components.json

---

### W2. 共享库配置 ✅ **已完成**
- 创建跨端共享的类型定义
- Supabase 客户端配置（与移动端兼容）
- API 接口类型定义
- 环境变量管理

**产出**：
- apps/web/src/lib/shared/
- apps/web/src/types/
- apps/web/src/lib/supabase.ts

---

### W3. Web 端认证 ✅ **已完成**
- 登录 / 登出页面
- 角色感知状态管理
- Token 持久化
- 会话管理

**产出**：
- apps/web/src/auth/
- apps/web/src/hooks/useAuth.ts

---

### W4. Web 端 Todo 模块 ✅ **已完成**
- Todo 列表（支持高级搜索和筛选）
- 创建 / 编辑 / 删除 Todo
- 状态管理（todo / doing / done）
- 批量操作功能
- Realtime 订阅

**产出**：
- apps/web/src/todos/
- apps/web/src/components/TodoList.tsx
- apps/web/src/components/TodoForm.tsx

---

### W5. Web 端文件管理 ✅ **已完成**
- 拖拽上传功能
- 文件预览（图片、视频、PDF）
- 文件管理界面
- 批量操作
- Realtime 同步

**产出**：
- apps/web/src/files/
- apps/web/src/components/FileUpload.tsx
- apps/web/src/components/FileGallery.tsx

---

### W6. Web 端 AI 助手 ✅ **已完成**
- AI 助手聊天界面
- 文档搜索和总结
- AI 操作建议
- 权限控制
- 响应式设计

**产出**：
- apps/web/src/ai/
- apps/web/src/components/AIAssistant.tsx

---

### W7. Web 端导航和布局 ✅ **已完成**
- 响应式导航栏
- 页面布局组件
- 权限路由保护
- 移动端适配

**产出**：
- apps/web/src/components/Layout.tsx
- apps/web/src/components/Navigation.tsx
- apps/web/src/app/(app)/

---

### W8. Web 端高级功能 ✅ **已完成**
- 高级搜索和筛选
- 数据导出功能
- 用户设置页面
- 通知管理

**产出**：
- apps/web/src/components/SearchBar.tsx
- apps/web/src/components/ExportModal.tsx
- apps/web/src/settings/

---

## 执行建议（非常重要）

1. **先 A → B → D → W → C**
2. 移动端和 Web 端并行开发，共享后端
3. 所有 AI 写操作走 dry-run
4. Web 端提供比移动端更丰富的功能

---

## 待完成任务（Pending Tasks）

### 移动端待完成
- **D4**: 文件上传和浏览界面实现
- **E2**: 股票行情 UI 实现

### 跨端优化
- 移动端 AI 助手界面实现
- 移动端高级搜索和筛选
- 统一的用户体验优化

---

## Task Group H – Socket/Realtime 增强 ✅ **已完成**

### H1. SSE-Signal 实现 ✅ **已完成**
- 创建 SSE-Signal Edge Function (`supabase/functions/sse-signal`)
- 实现 Web 端 SSE 客户端 (`apps/web/src/realtime/sse-signal.ts`)
- 实现移动端 SSE 客户端 (`apps/mobile/src/realtime/sse-signal.ts`)
- 添加自动重连机制
- 实现 JWT 认证
- 集成 Todo、文件、股票的实时推送

**产出**：
- supabase/functions/sse-signal/
- apps/web/src/realtime/sse-signal.ts
- apps/mobile/src/realtime/sse-signal.ts
- 完整的单元测试覆盖

---

## 终极目标

> 让 AI **按 Task 执行，而不是自由发挥**。
