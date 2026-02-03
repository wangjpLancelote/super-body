#!/bin/bash

# 在线 Supabase 设置脚本
# 使用方法: ./setup-supabase-online.sh

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."

    # 检查 curl
    if ! command -v curl &> /dev/null; then
        print_error "curl 未安装，请先安装 curl"
        exit 1
    fi

    # 检查 jq (JSON 处理)
    if ! command -v jq &> /dev/null; then
        print_warning "jq 未安装，建议安装以支持 JSON 处理"
        print_info "macOS: brew install jq"
        print_info "Ubuntu: sudo apt-get install jq"
    fi

    print_success "依赖检查完成"
}

# 检查 Supabase CLI
check_supabase_cli() {
    print_info "检查 Supabase CLI..."

    if command -v supabase &> /dev/null; then
        print_success "Supabase CLI 已安装: $(supabase --version)"
    else
        print_error "Supabase CLI 未安装"
        echo ""
        echo "请安装 Supabase CLI:"
        echo "  macOS: brew install supabase/tap/supabase"
        echo "  或使用 npm: npm install -g supabase"
        echo ""
        echo "安装完成后，请重新运行此脚本"
        exit 1
    fi
}

# 初始化配置
init_config() {
    print_info "初始化配置..."

    if [ ! -f "supabase/config.toml" ]; then
        print_error "supabase/config.toml 文件不存在"
        exit 1
    fi

    # 检查迁移文件
    if [ ! -f "supabase/migrations/001_schema.sql" ]; then
        print_error "迁移文件 supabase/migrations/001_schema.sql 不存在"
        exit 1
    fi

    if [ ! -f "supabase/migrations/002_rls.sql" ]; then
        print_error "迁移文件 supabase/migrations/002_rls.sql 不存在"
        exit 1
    fi

    print_success "配置文件检查完成"
}

# 创建环境变量文件
create_env_file() {
    print_info "创建环境变量文件..."

    if [ ! -f ".env" ]; then
        # 创建示例环境变量文件
        cat > .env << EOF
# Supabase 配置
# 从 Supabase 项目设置页获取以下值
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI API 配置
OPENAI_API_KEY=your-openai-api-key

# AI 助手配置
AI_ASSISTANT_DRY_RUN=true
AI_ASSISTANT_MODEL=gpt-3.5-turbo
AI_ASSISTANT_MAX_TOKENS=2000
AI_ASSISTANT_TEMPERATURE=0.7

# 环境配置
NODE_ENV=development
EOF
        print_success "已创建 .env.example 文件"
    fi

    # 创建不同模块的环境变量文件
    create_module_env_files
}

create_module_env_files() {
    print_info "创建模块环境变量文件..."

    # Web 应用
    if [ -d "apps/web" ]; then
        mkdir -p apps/web
        cat > apps/web/.env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=\${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
NEXT_PUBLIC_OPENAI_API_KEY=\${OPENAI_API_KEY}
EOF
        print_success "已创建 apps/web/.env.local"
    fi

    # AI 服务
    if [ -d "ai" ]; then
        mkdir -p ai
        cat > ai/.env.local << EOF
SUPABASE_URL=\${SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}
OPENAI_API_KEY=\${OPENAI_API_KEY}
AI_ASSISTANT_DRY_RUN=\${AI_ASSISTANT_DRY_RUN}
AI_ASSISTANT_MODEL=\${AI_ASSISTANT_MODEL}
AI_ASSISTANT_MAX_TOKENS=\${AI_ASSISTANT_MAX_TOKENS}
AI_ASSISTANT_TEMPERATURE=\${AI_ASSISTANT_TEMPERATURE}
EOF
        print_success "已创建 ai/.env.local"
    fi
}

# 提示用户获取 Supabase 项目信息
prompt_project_info() {
    print_info "请提供您的 Supabase 项目信息："
    echo ""
    echo "1. 访问 https://supabase.com/"
    echo "2. 登录并创建新项目"
    echo "3. 进入项目设置 (Settings)"
    echo "4. 在 'API' 部分找到以下信息："
    echo "   - Project URL"
    echo "   -anon public role key"
    echo "   -service_role key"
    echo ""
    read -p "是否已经创建好 Supabase 项目？(y/n): " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        print_warning "请先创建 Supabase 项目，然后再继续"
        exit 1
    fi

    read -p "请输入 Project URL: " supabase_url
    read -p "请输入 Public anon key: " supabase_anon_key
    read -p "请输入 Service role key: " supabase_service_role_key

    # 更新环境变量文件
    update_env_file "$supabase_url" "$supabase_anon_key" "$supabase_service_role_key"
}

update_env_file() {
    local url=$1
    local anon_key=$2
    local service_key=$3

    # 使用 sed 更新 .env 文件
    if [ -f ".env" ]; then
        sed -i.tmp "s|SUPABASE_URL=.*|SUPABASE_URL=$url|" .env
        sed -i.tmp "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=$anon_key|" .env
        sed -i.tmp "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$service_key|" .env
        rm .env.tmp

        # 更新模块环境变量文件
        update_module_env_files
    fi
}

update_module_env_files() {
    # 更新 web 应用环境变量
    if [ -f "apps/web/.env.local" ]; then
        sed -i.tmp "s|SUPABASE_URL=.*|SUPABASE_URL=\${SUPABASE_URL}|" apps/web/.env.local
        sed -i.tmp "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}|" apps/web/.env.local
        rm apps/web/.env.local.tmp
    fi

    # 更新 AI 服务环境变量
    if [ -f "ai/.env.local" ]; then
        sed -i.tmp "s|SUPABASE_URL=.*|SUPABASE_URL=\${SUPABASE_URL}|" ai/.env.local
        sed -i.tmp "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}|" ai/.env.local
        rm ai/.env.local.tmp
    fi
}

# 验证配置
validate_config() {
    print_info "验证配置..."

    if [ ! -f ".env" ]; then
        print_error ".env 文件不存在"
        exit 1
    fi

    # 检查必需的环境变量
    source .env

    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_error "请确保 .env 文件中包含所有必需的 Supabase 配置"
        exit 1
    fi

    # 测试连接
    if command -v supabase &> /dev/null; then
        print_info "测试 Supabase 连接..."
        supabase status 2>/dev/null || print_warning "无法连接到本地 Supabase 服务，这是正常的，因为使用在线服务"
    fi

    print_success "配置验证完成"
}

# 创建部署脚本
create_deployment_scripts() {
    print_info "创建部署脚本..."

    # 创建数据库部署脚本
    cat > scripts/deploy-database.sh << 'EOF'
#!/bin/bash
# 数据库部署脚本

set -e

echo "开始部署数据库结构..."

# 检查 Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "错误: Supabase CLI 未安装"
    exit 1
fi

# 执行迁移
echo "执行数据库迁移..."
supabase db push

echo "数据库部署完成！"
EOF

    chmod +x scripts/deploy-database.sh

    # 创建环境变量同步脚本
    cat > scripts/sync-env.sh << 'EOF'
#!/bin/bash
# 环境变量同步脚本

set -e

echo "同步环境变量..."

# 从主 .env 文件读取环境变量
if [ -f ".env" ]; then
    source .env

    # 同步到 web 应用
    if [ -d "apps/web" ]; then
        echo "同步到 web 应用..."
        cat > apps/web/.env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
NEXT_PUBLIC_OPENAI_API_KEY=$OPENAI_API_KEY
EOL
    fi

    # 同步到 AI 服务
    if [ -d "ai" ]; then
        echo "同步到 AI 服务..."
        cat > ai/.env.local << EOL
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY=$OPENAI_API_KEY
AI_ASSISTANT_DRY_RUN=$AI_ASSISTANT_DRY_RUN
AI_ASSISTANT_MODEL=$AI_ASSISTANT_MODEL
AI_ASSISTANT_MAX_TOKENS=$AI_ASSISTANT_MAX_TOKENS
AI_ASSISTANT_TEMPERATURE=$AI_ASSISTANT_TEMPERATURE
EOL
    fi

    echo "环境变量同步完成！"
else
    echo "错误: .env 文件不存在"
    exit 1
fi
EOF

    chmod +x scripts/sync-env.sh

    print_success "部署脚本创建完成"
}

# 显示完成信息
show_completion_info() {
    print_success "在线 Supabase 设置完成！"
    echo ""
    echo "接下来的步骤："
    echo "1. 编辑 .env 文件，填入真实的 Supabase 配置信息"
    echo "2. 运行数据库迁移: ./scripts/deploy-database.sh"
    echo "3. 同步环境变量: ./scripts/sync-env.sh"
    echo "4. 启动 Web 应用: cd apps/web && npm run dev"
    echo "5. 启动 AI 服务: cd ai && python -m uvicorn main:app --reload"
    echo ""
    echo "重要提示："
    echo "- 请确保 Supabase 项目的 'Enable storage' 已启用"
    echo "- 如果使用向量搜索，请确保数据库版本支持 pgvector"
    echo "- 定期备份您的数据库"
}

# 主函数
main() {
    echo "=========================================="
    echo "     在线 Supabase 设置脚本"
    echo "=========================================="
    echo ""

    check_dependencies
    check_supabase_cli
    init_config
    create_env_file
    create_deployment_scripts
    prompt_project_info
    validate_config
    show_completion_info
}

# 运行主函数
main "$@"