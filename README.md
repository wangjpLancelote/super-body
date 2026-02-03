# Super Body (LifeByte) Monorepo

AI-ready cloud application built with **Next.js (Web)**, **React Native (Expo/Mobile)**, **Supabase (DB/Auth/Storage/Functions)**, and **LangChain (AI)**.

## 🚀 Quick Start

### 1. 克隆和安装
```bash
git clone <your-repo-url>
cd super-body

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 Supabase 配置
```

### 2. 启动应用
```bash
# 启动 Web 应用 (推荐先启动)
npm run dev:web

# 启动移动应用
npm run dev:mobile

# 启动 AI 服务
npm run dev:ai

# 启动 Supabase 本地服务
npm run supabase:dev
```

### 3. 访问应用
- **Web**: http://localhost:3000
- **移动**: 使用 Expo Go 扫描二维码

## 📖 详细文档

### 🎯 入门指南
- **[完整启动指南](GETTING_STARTED.md)** - 详细的启动和配置教程
- **[项目实施状态](IMPLEMENTATION_STATUS.md)** - 当前项目进度和待完成任务

### 🏗️ 架构和规划
- **[项目计划](plan.md)** - 架构设计、技术栈和数据模型
- **[任务分解](tasks.md)** - 可执行任务列表和进度跟踪
- **[仓库结构](repo_structure.md)** - 目录规范和 AI 编码规则
- **[代理指南](AGENTS.md)** - 多代理协作指南和环境映射

### ⚙️ 配置文档
- **[Supabase 配置](supabase.config.md)** - 数据库配置和非密钥信息
- **[Web 集成计划](.claude/plans/web-integration.md)** - Web 端集成详情

## 🚀 Quick Start (local dev) - 简化版

## Notes

- Do **not** commit secrets. Real keys belong in root `.env` (local) or Supabase secrets (hosted).
- Use `bash scripts/sync-supabase-secrets.sh [project_ref]` to sync Edge Function secrets to hosted Supabase.
