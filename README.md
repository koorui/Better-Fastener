# Better Fastener - 网站重构项目

Better Fasteners Co., Ltd. 官网重构项目，基于 Next.js 14+ 构建的现代化 CPL 型网站。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **代码规范**: ESLint + Prettier

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 数据库

使用 Drizzle ORM + PostgreSQL，支持 Vercel Postgres、Supabase、Neon 等。

```bash
# 1. 复制环境变量
cp .env.local.example .env.local

# 2. 在 .env.local 中填写 DATABASE_URL

# 3. 执行迁移（创建表）
npm run db:migrate:run
# 若上述失败，可尝试：npm run db:push

# 4. 可选：插入默认站点设置
npm run db:seed

# 5. 可选：打开 Drizzle Studio 可视化管理
npm run db:studio

# 6. 创建管理员（首次使用）
npm run db:seed:admin
# 默认: admin@betterfastener.com / admin123456
# 可通过 ADMIN_EMAIL、ADMIN_PASSWORD 环境变量自定义
```

## Vercel 部署

### 方式一：通过 Vercel 控制台

1. 将代码推送到 GitHub
2. 登录 [Vercel](https://vercel.com)
3. 点击 "Add New Project"，选择该仓库
4. Vercel 会自动识别 Next.js 项目，无需额外配置
5. 点击 Deploy

### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目目录下执行
vercel

# 首次会提示登录并关联项目
```

### 环境变量

部署时在 Vercel 项目设置中添加：

- `DATABASE_URL` - 数据库连接（后续 Step 2 配置）
- `NEXTAUTH_SECRET` - 认证密钥（后续 Step 5 配置）
- `NEXT_PUBLIC_SITE_URL` - 站点 URL，如 `https://www.betterfastener.com`

## 项目结构

详见 [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) 完整实现方案。
