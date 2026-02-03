# Super Body 项目启动指南

> AI-Ready 云端应用（Web + Mobile）快速启动教程

---

## 📋 **项目概述**

这是一个基于 Next.js + React Native + Supabase + LangChain 构建的 AI-Ready 云端应用，支持 Web 和移动端，具备完整的实时通信和 AI 能力。

### **核心功能**
- ✅ **认证系统** - JWT + 角色管理
- ✅ **Todo 管理** - CRUD + 实时同步
- ✅ **文件管理** - 上传/预览/批量操作
- ✅ **AI 助手** - LangChain + 流式响应
- ✅ **实时通信** - WebSocket + SSE-Signal
- ✅ **股票行情** - 实时价格推送

---

## 🚀 **快速启动**

### **步骤 1: 克隆项目并安装依赖**

```bash
# 克隆项目
git clone <your-repo-url>
cd super-body

# 安装所有依赖
npm install

# 或者使用 yarn
yarn install
```

### **步骤 2: 设置 Supabase 在线服务**

由于项目使用在线 Supabase 服务，首先需要创建 Supabase 项目并运行设置脚本：

```bash
# 1. 运行 Supabase 设置脚本（推荐）
./setup-supabase-online.sh

# 或者手动配置：
# 1. 访问 https://app.supabase.com 创建新项目
# 2. 复制 API 密钥到 .env 文件
# 3. 运行数据库迁移
```

环境变量说明：

```env
# === Supabase 核心配置（必填） ===
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# === AI 服务配置（可选） ===
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# === 股票 API 配置（可选） ===
# 新浪财经（免费，中国市场）
STOCK_API_BASE_URL=http://hq.sinajs.cn
# OR Alpha Vantage（需要 API key）
# STOCK_API_KEY=your-alphavantage-api-key
# STOCK_API_BASE_URL=https://www.alphavantage.co/query

# === AI 助手配置（可选） ===
AI_ASSISTANT_DRY_RUN=true
AI_ASSISTANT_MODEL=gpt-3.5-turbo
AI_ASSISTANT_MAX_TOKENS=2000
AI_ASSISTANT_TEMPERATURE=0.7

# === 运行环境 ===
NODE_ENV=development
```

设置脚本会自动生成以下文件：
- `.env` - 主环境变量文件
- `apps/web/.env.local` - Web 应用环境变量
- `ai/.env.local` - AI 服务环境变量

如果需要手动同步，运行：
```bash
bash scripts/sync-env.sh
```

### **步骤 3: 配置在线 API**

在设置脚本运行后，您需要在 `.env` 文件中配置提供的在线 API：

```env
# === 在线 API 配置（由您提供） ===
# 文件管理 API
FILE_API_URL=https://your-file-api.com
FILE_API_KEY=your-file-api-key

# Todo 管理 API
TODO_API_URL=https://your-todo-api.com
TODO_API_KEY=your-todo-api-key

# 其他只读功能 API
READONLY_API_URL=https://your-readonly-api.com
READONLY_API_KEY=your-readonly-api-key
```

### **步骤 4: 运行数据库迁移**

在使用应用之前，需要将数据库结构部署到在线 Supabase：

```bash
# 运行数据库迁移
./scripts/deploy-database.sh

# 或者直接使用 Supabase CLI
supabase db push
```

#### **步骤 5: 启动应用**

注意：无需启动本地 Supabase 服务，所有功能都使用在线服务。

#### **Web 应用启动**
```bash
# 启动 Web 开发服务器
npm run dev:web

# 或者使用 yarn
yarn dev:web
```
访问：http://localhost:3000

#### **移动应用启动**
```bash
# 启动移动开发服务器
npm run dev:mobile

# 或者使用 yarn
yarn dev:mobile
```
将使用 Expo Go 应用扫描二维码运行。

---

## 🔧 **详细配置指南**

### **Supabase 数据库配置**

#### **1. Supabase 架构说明**
本项目架构中：
- ✅ **Supabase** - 仅作为远程数据库使用
- ✅ **文件存储** - 通过您提供的 API 在线实现
- ✅ **Todo管理** - 通过您提供的 API 在线实现
- ✅ **其他功能** - 均为只读的在线功能

#### **2. Supabase 项目配置**
如果使用设置脚本，此步骤会自动完成。如果手动配置：

```bash
# 1. 访问 https://app.supabase.com
# 2. 创建新项目或使用现有项目
# 3. 记录以下信息：
#    - Project URL → SUPABASE_URL
#    - anon/public key → SUPABASE_ANON_KEY
#    - service_role key → SUPABASE_SERVICE_ROLE_KEY

# 4. 更新 .env 文件中的对应变量
```

### **AI 服务配置**

#### **OpenAI 配置**
```bash
# 安装 OpenAI 依赖
npm install openai

# 配置环境变量
OPENAI_API_KEY=sk-your-openai-key
```

#### **Anthropic Claude 配置**
```bash
# 安装 Anthropic 依赖
npm install @anthropic-ai/sdk

# 配置环境变量
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

### **实时通信配置**

#### **SSE-Signal 配置**
SSE-Signal 已经集成在项目中，无需额外配置。自动使用：
- 端口：54321 (Supabase Edge Functions)
- 路径：/functions/v1/sse-signal

#### **WebSocket 配置**
WebSocket 服务已配置，用于股票行情实时推送。

---

## 📱 **平台特定配置**

### **Web 应用配置**

#### **Tailwind CSS**
```bash
# 如果需要自定义样式，编辑：
apps/web/tailwind.config.ts
```

#### **Shadcn/ui 组件**
```bash
# 添加新组件
npx shadcn-ui@latest add [component-name]

# 常用组件：
npx shadcn-ui@latest add button card input dialog
```

### **移动应用配置**

#### **Expo 配置**
```bash
# 安装 Expo CLI
npm install -g @expo/cli

# 安装移动端依赖
npm install @react-navigation/native @react-navigation/bottom-tabs
```

#### **权限配置**
在 `apps/mobile/app.json` 中添加必要权限：
```json
"ios": {
  "usesNonExemptEncryption": true
},
"android": {
  "permissions": [
    "INTERNET",
    "CAMERA",
    "READ_EXTERNAL_STORAGE",
    "WRITE_EXTERNAL_STORAGE"
  ]
}
```

---

## 🧪 **运行测试**

### **Web 应用测试**
```bash
# 运行 Web 应用测试
npm test:web

# 生成测试覆盖率报告
npm run test:web -- --coverage
```

### **移动应用测试**
```bash
# 运行移动应用测试
npm test:mobile

# 使用 Detox 进行端到端测试
npm run test:e2e
```

### **AI 模块测试**
```bash
# 运行 AI 模块测试
npm test:ai

# 测试 LangChain 集成
npm run test:langchain
```

### **API 集成测试**
```bash
# 测试在线 API 连接
npm run test:api

# 测试文件管理 API
npm run test:file-api

# 测试 Todo 管理 API
npm run test:todo-api
```

---

## 🔍 **验证功能**

### **1. 认证系统验证**
```bash
# 启动应用后：
1. 访问 http://localhost:3000
2. 点击 "Sign In"
3. 使用邮箱注册/登录
4. 查看用户角色权限
```

### **2. Todo 功能验证**
```bash
1. 登录后点击 "Todo" 标签
2. 查看只读的 Todo 列表（从您的在线 API 获取）
3. 测试搜索和筛选功能
4. 验证数据正确显示
```

### **3. 文件管理验证**
```bash
1. 点击 "Files" 标签
2. 查看只读的文件列表（从您的在线 API 获取）
3. 测试文件预览功能
4. 验证文件信息正确显示
```

### **4. AI 助手验证**
```bash
1. 点击 "AI" 标签
2. 发送消息分析数据
3. 查看基于只读数据的 AI 建议
4. 测试文档搜索功能（基于在线数据）
```

### **5. 实时通信验证**
```bash
1. 测试 SSE-Signal 连接（如果您的在线 API 支持）
2. 验证数据更新通知
3. 测试跨设备同步（如果支持）
4. 检查连接状态指示器
```

---

## ❓ **常见问题解答**

### **Q1: 如何获取 Supabase 项目的 API 密钥？**

推荐使用设置脚本自动完成：

```bash
# 1. 运行设置脚本（推荐）
./setup-supabase-online.sh
# 脚本会引导你完成配置

# 或者手动获取：
# 1. 访问 https://app.supabase.com
# 2. 登录并选择你的项目
# 3. 进入 Settings > API
# 4. 复制以下值：
#    - Project URL → SUPABASE_URL
#    - anon/public key → SUPABASE_ANON_KEY
#    - service_role key → SUPABASE_SERVICE_ROLE_KEY
```

### **Q2: 运行 sync-env.sh 脚本失败？**

```bash
# 检查脚本是否存在
ls scripts/sync-env.sh

# 如果脚本不存在，创建它
touch scripts/sync-env.sh
chmod +x scripts/sync-env.sh

# 或者手动同步环境变量
# 见 .env.example 文件中的详细说明
```

### **Q3: Web 应用启动失败？**

```bash
# 1. 检查端口是否被占用
lsof -i :3000

# 2. 清理 node_modules 并重装
cd apps/web
rm -rf node_modules
npm install

# 3. 检查 TypeScript 配置
npm run type-check
```

### **Q4: 移动应用启动失败？**

```bash
# 1. 确保 Expo CLI 已安装
npm install -g @expo/cli

# 2. 检查 Expo Go 版本
expo -v

# 3. 清理缓存并重装
cd apps/mobile
expo start --clear
```

### **Q5: AI 功能无法使用？**

```bash
# 1. 检查 API 密钥配置
cat .env | grep OPENAI_API_KEY
cat .env | grep ANTHROPIC_API_KEY

# 2. 测试 API 连通性
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# 3. 查看 AI 服务日志
cd ai && npm run dev
```

### **Q6: 实时功能不工作？**

```bash
# 1. 检查您的在线 API 是否支持实时推送
# 如果支持，查看 API 文档了解推送格式

# 2. 检查 SSE-Signal 连接（如果您的 API 支持）
# 打开浏览器开发者工具，查看 Network 标签

# 3. 验证 API 认证是否正确
console.log('API Key:', process.env.TODO_API_KEY)
```

### **Q7: 数据无法加载？**

```bash
# 1. 检查在线 API 配置
cat .env | grep API

# 2. 测试 API 连通性
curl -H "Authorization: Bearer $TODO_API_KEY" \
  $TODO_API_URL/todos

# 3. 查看 API 响应日志
# 在浏览器开发者工具的 Console 标签中
```

### **Q8: Supabase 连接失败怎么办？**

```bash
# 1. 检查设置是否正确运行
./setup-supabase-online.sh

# 2. 验证 API 密钥
cat .env | grep SUPABASE

# 3. 检查网络连接
curl -I $SUPABASE_URL

# 4. 确保数据库迁移已运行
./scripts/deploy-database.sh

# 5. 查看数据库表是否存在（在 Supabase Dashboard 中）
```

### **Q8: 如何重置开发环境？**

```bash
# 1. 停止所有服务
npm run supabase:stop
pkill -f "next dev" || true
pkill -f "expo" || true

# 2. 清理缓存
rm -rf apps/web/.next
rm -rf apps/mobile/dist
rm -rf ai/dist

# 3. 重新启动
npm install
npm run dev:web
```

### **Q9: 性能问题怎么办？**

```bash
# 1. 检查内存使用
top -pid $(pgrep -f "next dev")

# 2. 监控网络请求
# 在浏览器开发者工具的 Network 标签中

# 3. 优化构建
npm run build:web
```

### **Q10: 生产环境部署步骤？**

```bash
# 1. 构建生产版本
npm run build

# 2. 部署 Supabase
supabase db push
supabase functions deploy

# 3. 部署 Web 应用
vercel --prod

# 4. 部署移动应用
expo build:ios --release
expo build:android --release
```

---

## 📚 **开发指南**

### **添加新功能**
1. **Web 应用**: 在 `apps/web/src/` 下添加组件
2. **移动应用**: 在 `apps/mobile/src/` 下添加组件
3. **API**: 在 `supabase/functions/` 下添加 Edge Function
4. **AI**: 在 `ai/` 下添加新的工具或代理

### **代码规范**
```bash
# 运行代码检查
npm run lint

# 格式化代码
npm run format

# 类型检查
npm run type-check
```

### **提交代码**
```bash
# 创建新分支
git checkout -b feature/new-feature

# 提交更改
git add .
git commit -m "feat: add new feature"

# 推送分支
git push origin feature/new-feature
```

---

## 🎯 **项目架构**

### **目录结构**
```
super-body/
├── apps/
│   ├── web/          # Next.js Web 应用
│   └── mobile/       # React Native 移动应用
├── ai/              # LangChain AI 集成
├── supabase/        # Supabase 配置和函数
├── docs/            # 文档
└── scripts/         # 构建和部署脚本
```

### **技术栈**
- **前端**: Next.js 14 + React 18 + TypeScript
- **移动端**: React Native + Expo + TypeScript
- **后端**: Supabase (PostgreSQL + Edge Functions)
- **AI**: LangChain + OpenAI/Anthropic
- **实时**: WebSocket + SSE-Signal

---

## 📈 **生产部署**

### **Supabase 部署**
```bash
# 部署 Supabase 项目
supabase db push
supabase functions deploy
supabase gen types typescript --local > types.ts
```

### **Web 应用部署**
```bash
# 构建生产版本
npm run build:web

# 部署到 Vercel
vercel --prod
```

### **移动应用部署**
```bash
# 构建移动应用
npm run build:mobile

# 发布到 App Store/Google Play
expo build:ios
expo build:android
```

---

## 🤝 **社区支持**

### **获取帮助**
- 📧 **邮件**: your-email@example.com
- 💬 **群组**: [加入我们的 Discord](https://discord.gg/your-server)
- 📖 **文档**: [查看完整文档](https://docs.your-app.com)
- 🐛 **问题报告**: [GitHub Issues](https://github.com/your-repo/issues)

### **贡献指南**
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request
5. 等待审核和合并

---

## 📝 **更新日志**

### **v1.0.0** (当前版本)
- ✅ 完整的 Web 应用实现
- ✅ 基础移动端功能
- ✅ AI 助手集成
- ✅ SSE-Signal 实时通信
- ✅ 完整的认证系统

### **下一步计划**
- 🔄 完善移动端文件管理
- 🔄 移动端 AI 助手界面
- 🔄 性能优化
- 🔄 离线功能支持

---

---

## 🎉 **开始使用吧！**

恭喜！您已经完成了 Super Body 项目的配置。现在可以开始探索这个 AI-Ready 的云端应用了。

### **下一步建议**

1. **基础功能测试**
   - 登录系统，验证用户认证
   - 创建和管理 Todo 任务
   - 上传和查看文件
   - 与 AI 助手对话

2. **高级功能探索**
   - 测试实时同步功能
   - 使用股票行情功能
   - 尝试 AI 创建任务
   - 探索高级搜索和筛选

3. **开发者资源**
   - 阅读 [架构文档](plan.md) 了解设计理念
   - 查看 [任务分解](tasks.md) 了解开发计划
   - 浏览 [API 文档](supabase.config.md) 了解后端接口

### **社区支持**

📧 **邮件支持**: your-email@example.com
💬 **Discord 社区**: [加入我们的 Discord](https://discord.gg/super-body)
🐛 **问题反馈**: [GitHub Issues](https://github.com/your-repo/issues)
📖 **在线文档**: [完整文档](https://docs.super-body.com)

---

## 🚀 **快速命令参考**

| 操作 | 命令 |
|------|------|
| 设置 Supabase | `./setup-supabase-online.sh` |
| 部署数据库 | `./scripts/deploy-database.sh` |
| 启动 Web 应用 | `npm run dev:web` |
| 启动移动应用 | `npm run dev:mobile` |
| 启动 AI 服务 | `npm run dev:ai` |
| 运行测试 | `npm test` |
| 代码检查 | `npm run lint` |
| 构建项目 | `npm run build` |

---

**祝您使用愉快！** 🎉

如果您在使用过程中遇到任何问题，请参考上面的常见问题解答，或联系我们的支持团队。