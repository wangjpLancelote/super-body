# REPO_STRUCTURE.md

> AI Coding 统一代码仓库结构规范  
> 目标：**让多个 AI / 人类并行开发，代码永不混乱**  
> 原则：结构即约束（Structure is Policy）

---

## 1. 仓库总览

```
root/
├─ apps/
│  └─ mobile/                # React Native (Expo)
│
├─ supabase/
│  ├─ functions/             # Edge Functions（BFF + AI）
│  │  ├─ _shared/
│  │  │  ├─ auth.ts
│  │  │  └─ context.ts
│  │  ├─ todos/
│  │  ├─ files/
│  │  └─ ai-assistant/
│  │
│  ├─ migrations/
│  │  ├─ schema.sql
│  │  └─ rls.sql
│  │
│  └─ seed.sql
│
├─ ai/
│  ├─ runtime.md
│  ├─ vector.ts
│  ├─ tools.ts
│  ├─ agent.ts
│  └─ prompts/
│     └─ system.md
│
├─ ui/
│  ├─ ia.md
│  └─ wireframes.md
│
├─ docs/
│  ├─ PLAN.md
│  ├─ TASKS.md
│  ├─ REPO_STRUCTURE.md
│  └─ SECURITY.md
│
└─ README.md
```

---

## 2. 各目录职责（AI 必须遵守）

### `/apps/mobile`
- 只允许前端代码
- 不得包含密钥
- 只通过 Supabase Client / API 调用后端

---

### `/supabase/functions`
- 所有后端逻辑唯一入口
- 必须经过 `_shared/auth.ts`
- 严禁直连数据库绕过 RLS

---

### `/supabase/migrations`
- 只允许 SQL
- 所有表 / RLS 修改必须在此

---

### `/ai`
- 只允许 **LangChain / LLM 相关逻辑**
- 不允许直接写数据库
- 所有写操作通过 Tools

---

### `/ui`
- 只存原型 / 结构说明
- 不放真实代码

---

## 3. AI Coding 强制规则

- ❌ 禁止 AI 新建未声明目录
- ❌ 禁止跨目录写文件
- ✅ 每个 Task 只能修改对应目录
- ✅ 所有写操作必须可审计

---

## 4. 推荐 AI 执行顺序（与 TASKS.md 对齐）

1. supabase/migrations
2. supabase/functions/_shared
3. supabase/functions/*
4. apps/mobile
5. ai/*
6. ui/*

---

## 5. 一句话约束（给 AI）

> **如果你不知道代码该放哪，说明你不该写这段代码。**
