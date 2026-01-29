# UI Information Architecture

## 概述

本应用采用基于角色的信息架构设计，根据用户的权限（user/premium/admin）提供不同的功能层级和导航体验。

## 导航结构

### 主导航 (底部标签栏)
- 🏠 **Home** - 欢迎页面和概览
- 📝 **Todos** - 任务管理（所有用户）
- 📁 **Files** - 文件管理（Premium+）
- 🤖 **AI Assistant** - AI助手（Premium+）
- ⚙️ **Settings** - 设置（所有用户）

### 侧边导航 (抽屉菜单)
- **Profile** - 个人资料
- **Stats** - 数据统计（Premium+）
- **Notifications** - 通知设置
- **Help** - 帮助中心
- **Sign Out** - 退出登录

## 功能层级

### 核心功能 (所有用户)
- 用户认证
- Todo基本CRUD
- 文件查看
- AI助手查询

### 高级功能 (Premium+)
- 文件上传
- AI助手执行操作
- 高级搜索
- 数据导出

### 管理功能 (Admin)
- 用户管理
- 系统设置
- 数据分析
- 审计日志

## 视觉设计原则

### 色彩系统
- **主色调**: #8CD98C (健康绿)
- **背景色**: #0B0F14 (深蓝灰)
- **文字色**: #F5F7FA (浅灰白)
- **次要色**: #16261F (深绿灰)

### 状态指示
- Todo状态:
  - 🟡 Todo (待办)
  - 🔵 Doing (进行中)
  - 🟢 Done (已完成)

### 交互模式
- 点击：简单交互
- 长按：高级操作
- 滑动：列表操作

## 响应式设计

### 移动优先
- 适配iOS/Android
- 横竖屏支持
- 可访问性优化

## 数据流

```
认证 → 权限检查 → 功能展示 → 用户操作 → 实时更新
```

## 组件库

### 基础组件
- Button (按钮)
- Input (输入框)
- Card (卡片)
- Modal (模态框)

### 业务组件
- TodoItem (待办事项)
- FileItem (文件项)
- StatusIndicator (状态指示器)
- RoleBadge (权限徽章)