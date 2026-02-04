# Super Body 项目设置指南

## 📋 项目概述

Super Body 是一个 AI 驱动的云应用程序，包含 Web 端和移动端，使用 Supabase 作为后端服务。

## 🚀 快速开始

### 1. 环境配置

确保 `.env` 文件已正确配置

```env
# .env 中获取


# 可选：AI 服务配置
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# 可选：AI 助手配置
AI_ASSISTANT_DRY_RUN=true
AI_ASSISTANT_MODEL=gpt-3.5-turbo
AI_ASSISTANT_MAX_TOKENS=2000
AI_ASSISTANT_TEMPERATURE=0.7
```

### 2. 同步环境变量

```bash
# 同步环境变量到各个模块
bash scripts/sync-env.sh
```

此命令会生成以下文件：
- `apps/web/.env.local`
- `apps/mobile/.env`
- `ai/.env.local`
- `supabase/functions/.env`

### 3. 设置数据库

#### 方法一：使用迁移文件（推荐）

1. 打开 Supabase Dashboard: https://opsdouiftxzoaidqcrnv.supabase.co/dashboard
2. 进入 **SQL Editor**
3. 执行以下文件：
   ```
   apps/web/supabase-migrations-export/single-migration.sql
   ```

#### 方法二：手动创建（备用）

如果自动迁移失败，可以手动创建：

1. **启用 pgvector 扩展**
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **创建表结构**
   参考 `supabase/migrations/` 下的文件

### 4. 启动项目

#### Web 应用（Next.js）

```bash
# 进入 web 目录
cd apps/web

# 安装依赖（如果尚未安装）
npm install

# 启动开发服务器
npm run dev
```

访问：http://localhost:3002

#### 其他组件

- **移动应用**：`apps/mobile/` 目录（React Native）
- **AI 服务**：`ai/` 目录

## 📊 数据库架构

### 核心表结构

| 表名 | 用途 | 关键特性 |
|------|------|----------|
| `users` | 用户管理 | 继承 auth.users，支持角色系统 |
| `roles` | 角色定义 | user/premium/admin 角色 |
| `todos` | 待办事项 | 支持向量搜索和状态管理 |
| `documents` | 文档库 | AI 助手的知识库，支持向量搜索 |
| `files` | 文件元数据 | 存储文件的元数据信息 |
| `ai_logs` | AI 日志 | 记录 AI 助手操作和结果 |

### 向量支持

- 使用 pgvector 扩展进行向量搜索
- 支持 1536 维向量（OpenAI embeddings）
- 提供相似度搜索功能

## 🛡️ 安全策略

### 行级安全（RLS）

- 所有表都启用了 RLS
- 用户只能访问自己的数据
- Service Role 可以访问所有数据

### 存储桶权限

| 存储桶 | 权限 | 描述 |
|--------|------|------|
| `avatars` | 公开 | 用户头像，可公开访问 |
| `documents` | 私有 | 用户文档，需认证 |
| `videos` | 私有 | 用户视频，需认证 |
| `files` | 私有 | 通用文件，需认证 |

## 🔧 开发工具

### Supabase CLI

```bash
# 检查安装
supabase --version

# 本地开发（需要 Docker）
supabase start

# 停止服务
supabase stop
```

### 环境管理

```bash
# 查看当前环境配置
cat .env

# 查看同步后的配置
cat apps/web/.env.local
```

## 📝 迁移管理

### 创建新的迁移

1. 在 `supabase/migrations/` 下创建新的 SQL 文件
2. 命名格式：`001_xxx.sql`, `002_yyy.sql`
3. 运行 `supabase db push` 应用迁移

### 备选方案

如果 CLI 无法连接，可以使用：
- `apps/web/supabase-migrations-export/single-migration.sql`（手动导入）
- 或直接在 Dashboard 中执行 SQL

## 🚨 常见问题

### 1. 端口冲突

如果 3000 端口被占用，Next.js 会自动尝试 3001、3002 等。

### 2. 数据库连接错误

- 检查 `.env` 文件中的 Supabase URL 和密钥
- 确认数据库迁移已完成
- 验证网络连接

### 3. 向量扩展问题

- 如果 pgvector 不可用，相关功能会被跳过
- 不影响基本功能，但会限制 AI 搜索能力

### 4. 存储访问问题

- 确保存储桶已正确创建
- 检查 RLS 策略是否正确
- 验证文件上传路径格式

## 🔄 生产环境部署

### 1. 构建应用

```bash
# Web 应用
cd apps/web
npm run build

# AI 服务
cd ../ai
npm run build
```

### 2. 部署 Supabase

```bash
# 部署数据库迁移
supabase db push

# 部署 Edge Functions
supabase functions deploy
```

### 3. 环境变量

在生产环境中设置：
- `NODE_ENV=production`
- 移除 `AI_ASSISTANT_DRY_RUN=true`
- 设置正确的 API 密钥

## 📚 相关文档

- [Supabase 文档](https://supabase.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [pgvector 文档](https://github.com/pgvector/pgvector)

## 🤝 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

---

**最后更新**: $(date)
**版本**: 1.0