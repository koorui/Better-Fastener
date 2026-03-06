# Better Fastener 网站重构 - 完整实现方案

> 本文档为 CPL 型网站重构的完整技术方案与实施指南，供 AI 辅助开发时逐步执行。

---

## 一、项目概述

### 1.1 背景
- **原网站**: http://www.betterfastener.com/
- **业务类型**: Better Fasteners Co., Ltd. - 紧固件公司（汽车紧固件、CNC 零件、螺丝等）
- **目标**: 重构为现代化 CPL（Content-Per-Lead）型网站，具备完整 SEO/GEO、商品管理、后台管理、API 控制及未来扩展能力

### 1.2 需求分层

| 阶段 | 核心需求 |
|------|----------|
| **一阶段** | SEO/GEO、商品搜索、管理后台、Vercel 部署、Agentic Page、API Key 控制、表单归因 |
| **二阶段** | WebMCP、多域名、Blog SEO、多域名 AB Testing |
| **未来** | WordPress 等建站工具生态支持 |

---

## 二、技术架构选型

### 2.1 核心技术栈

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端层 (Frontend)                          │
│  Next.js 14+ (App Router) + React 18 + TypeScript + Tailwind CSS │
│  - SSR/SSG 混合渲染  - 动态路由  - 元数据 API  - 图片优化          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API 层 (API Layer)                          │
│  Next.js API Routes / Route Handlers + tRPC 或 REST               │
│  - 公开 API (商品、搜索)  - 管理 API (需 API Key)  - 表单提交 API   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据层 (Data Layer)                          │
│  PostgreSQL (Vercel Postgres / Supabase / Neon)                  │
│  - 商品、分类、页面内容  - 联系方式  - 表单记录  - 管理日志          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 技术选型理由

| 技术 | 选择 | 理由 |
|------|------|------|
| **框架** | Next.js 14+ | 原生 SSR/SSG、优秀 SEO、Vercel 一等公民、App Router 支持动态路由 |
| **数据库** | Vercel Postgres / Supabase | 与 Vercel 集成好、支持边缘函数、免费层可用 |
| **ORM** | Drizzle / Prisma | 类型安全、迁移管理、与 Next.js 生态契合 |
| **认证** | NextAuth.js / 自定义 API Key | 管理后台登录 + API Key 程序化控制 |
| **部署** | Vercel | 零配置、自动 CI/CD、边缘网络、支持多环境 |
| **CMS** | 自建 Headless | 完全控制、与 API Key 体系统一、无第三方依赖 |

### 2.3 目录结构规划

```
betterfastener/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # 营销页面组
│   │   │   ├── page.tsx        # 首页
│   │   │   ├── products/       # 商品列表/详情
│   │   │   ├── search/         # 搜索页
│   │   │   ├── contact/        # 联系页
│   │   │   └── layout.tsx
│   │   ├── admin/              # 管理后台
│   │   │   ├── page.tsx
│   │   │   ├── products/
│   │   │   ├── settings/
│   │   │   └── logs/
│   │   ├── api/                # API 路由
│   │   │   ├── products/
│   │   │   ├── search/
│   │   │   ├── contact/        # 表单提交
│   │   │   ├── admin/          # 管理 API (需鉴权)
│   │   │   └── public/         # 公开 API (可加 API Key 限流)
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   │   ├── db/                 # 数据库
│   │   ├── auth/               # 认证
│   │   ├── seo/                # SEO 工具
│   │   └── agentic/            # Agentic Page 结构化数据
│   └── types/
├── prisma/                     # 或 drizzle
├── public/
├── vercel.json
├── next.config.js
└── package.json
```

---

## 三、一阶段详细实现方案

### 3.1 SEO / GEO 网站内容规则

**实现要点：**

1. **元数据体系**
   - 使用 Next.js `generateMetadata` 为每页生成 `title`、`description`、`keywords`、`openGraph`、`twitter`
   - 支持按路由/商品/分类动态生成
   - 配置文件：`src/lib/seo/metadata.ts`

2. **GEO（地理定向）**
   - 基于 `Accept-Language` 或 IP 地理位置（Vercel Edge）提供多语言/多地区内容
   - 支持 `hreflang` 标签
   - 可选：`/en/`, `/zh/` 等子路径或子域名

3. **结构化数据 (JSON-LD)**
   - 组织：`Organization`
   - 产品：`Product`（含 `offers`、`aggregateRating`）
   - 面包屑：`BreadcrumbList`
   - 联系：`ContactPage`

4. **Sitemap & Robots**
   - `app/sitemap.ts` 动态生成 sitemap
   - `app/robots.ts` 配置爬虫规则

5. **Agentic Page 语义化**
   - 为 AI 可读性设计：清晰的语义 HTML 结构（`<article>`、`<section>`、`<h1>`-`<h6>`）
   - 输出 JSON-LD 供 AI 理解品牌、产品、联系方式
   - 预留 `/.well-known/agentic.json` 或嵌入页面内的结构化数据

**文件清单：**
- `src/lib/seo/metadata.ts`
- `src/lib/seo/metadata-generator.ts`（商品/分类用）
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/components/JsonLd.tsx`

---

### 3.2 商品搜索与 SEO 优化

**实现要点：**

1. **商品数据模型**
   - 字段：`id`, `slug`, `name`, `nameEn`, `description`, `categoryId`, `specs`(JSON), `images`, `seoTitle`, `seoDescription`, `createdAt`, `updatedAt`

2. **搜索实现**
   - 服务端搜索：PostgreSQL `ILIKE` 或全文搜索 `tsvector`
   - 搜索页路由：`/search?q=xxx` 或 `/products?q=xxx`
   - 搜索页独立 `generateMetadata`，避免重复内容

3. **商品 SEO**
   - 动态路由：`/products/[slug]`
   - 每商品独立 meta + JSON-LD Product
   - 分类页：`/products/category/[slug]`

**文件清单：**
- `src/app/(marketing)/products/page.tsx`
- `src/app/(marketing)/products/[slug]/page.tsx`
- `src/app/(marketing)/search/page.tsx`
- `src/app/api/search/route.ts`

---

### 3.3 管理后台

**功能清单：**

| 功能 | 说明 |
|------|------|
| 登录 | 邮箱+密码 或 API Key（程序化用） |
| 联系方式 | 修改电话、邮箱、地址、地图等 |
| 商品 | 增删改查、批量导入、图片上传 |
| 分类 | 商品分类管理 |
| 页面内容 | 首页文案、关于我们等可编辑区块 |
| 表单记录 | 查看提交的询盘/联系表单 |

**技术实现：**
- 路由：`/admin/*`，中间件校验 session 或 API Key
- UI：React + shadcn/ui 或类似组件库
- 图片上传：Vercel Blob 或 Cloudinary

**文件清单：**
- `src/app/admin/layout.tsx`（带鉴权）
- `src/app/admin/page.tsx`
- `src/app/admin/products/`（列表、新建、编辑）
- `src/app/admin/settings/page.tsx`
- `src/app/admin/forms/page.tsx`
- `src/middleware.ts`（鉴权）

---

### 3.4 Vercel 部署（不限于 Vercel）

**Vercel 配置：**
- `vercel.json`：重定向、headers、环境变量
- 环境变量：`DATABASE_URL`, `NEXTAUTH_SECRET`, `ADMIN_API_KEY` 等

**通用部署支持：**
- 使用标准 Next.js 输出，可部署到 Node.js 服务器、Docker、Railway、Render 等
- 数据库使用标准 PostgreSQL 连接串，不绑定 Vercel

**CI/CD：**
- Vercel：Git 推送自动部署
- 其他：GitHub Actions 示例配置（`/.github/workflows/deploy.yml`）

---

### 3.5 Agentic Page 与流量管理体系

**Agentic Page 核心（参考 Deeplumen）：**

1. **语义化内容结构**
   - 品牌、产品、联系方式以清晰层级组织
   - 使用 `schema.org` 词汇表

2. **机器可读数据**
   - 每页输出 JSON-LD
   - 可选：`/.well-known/ai-content.json` 或类似端点，供 AI 爬虫发现

3. **流量管理**
   - UTM 参数记录：`utm_source`, `utm_medium`, `utm_campaign`
   - 表单提交时写入 `form_submissions` 表，含归因字段
   - 管理后台可查看「来源分析」

**实现文件：**
- `src/lib/agentic/schema.ts`（结构化数据生成）
- `src/app/.well-known/ai-content/route.ts`（可选）
- 表单表增加 `utm_*`、`referrer` 字段

---

### 3.6 API Key 与程序化内容控制

**设计：**

1. **API Key 管理**
   - 表：`api_keys`（`id`, `key_hash`, `name`, `permissions`, `created_at`）
   - 创建时生成随机 key，只显示一次；存储 hash

2. **管理 API 端点**
   - 前缀：`/api/admin/*`
   - Header：`Authorization: Bearer <api_key>` 或 `X-API-Key: <api_key>`
   - 权限：`products:write`, `settings:write`, `content:read` 等

3. **操作日志**
   - 表：`admin_audit_logs`（`id`, `api_key_id`, `action`, `resource`, `payload`, `ip`, `created_at`）
   - 每次写操作记录

**API 示例：**
```
POST /api/admin/products        # 创建商品
PUT  /api/admin/products/:id    # 更新商品
DELETE /api/admin/products/:id  # 删除商品
GET  /api/admin/products        # 列表（含分页）
PUT  /api/admin/settings       # 更新联系方式等
GET  /api/admin/logs            # 查询审计日志
```

---

### 3.7 表单记录与归因

**表单表结构：**
```sql
form_submissions (
  id, form_type, -- contact|inquiry|quote
  name, email, phone, company, message,
  utm_source, utm_medium, utm_campaign, utm_content, utm_term,
  referrer, landing_page,
  ip, user_agent,
  created_at
)
```

**实现：**
- 提交 API：`POST /api/contact` 或 `/api/forms/contact`
- 前端从 URL 读取 UTM，随表单一起提交
- 管理后台：`/admin/forms` 列表、筛选、导出

---

## 四、二阶段实现方案

### 4.1 WebMCP 支持

**概念：** WebMCP 让网站在浏览器中暴露结构化工具给 AI Agent 调用。

**实现思路：**
- 在页面注入 WebMCP 脚本，定义工具如：
  - `searchProducts(query: string)`
  - `getProductDetails(slug: string)`
  - `submitInquiry(data: object)`
- 参考：https://webmcp.dev/ 或 W3C 草案

**文件：**
- `public/webmcp-config.js` 或 `src/components/WebMCPProvider.tsx`

---

### 4.2 多域名与 Blog SEO

- **多域名：** 同一代码库，通过 `VERCEL_URL` 或 `NEXT_PUBLIC_SITE_URL` 区分域名，数据库可存 `domain_content` 做差异化
- **Blog：** 新增 `/blog` 路由，文章表 `posts`，支持分类、标签、RSS

---

### 4.3 多域名 AB Testing

- 不同域名对应不同「网站模态」（如 A：产品导向，B：品牌导向）
- 小量投流时使用不同 UTM，表单归因到 `landing_domain` + `utm_*`
- 分析：按域名+UTM 统计转化率

---

## 五、未来工作：WordPress 等生态

- 使用 Headless 架构，API 与前端分离
- 未来可开发 WordPress 插件，调用同一 REST/GraphQL API
- 或使用 Strapi/Payload 等 Headless CMS 作为可选后端

---

## 六、数据库 Schema 草案

```sql
-- 商品
products (id, slug, name, name_en, description, category_id, specs, images, seo_title, seo_desc, created_at, updated_at)
categories (id, slug, name, name_en, parent_id, sort_order)

-- 站点设置
site_settings (key, value) -- contact_phone, contact_email, address, etc.

-- 表单
form_submissions (id, form_type, name, email, phone, company, message, utm_*, referrer, landing_page, ip, created_at)

-- API 与审计
api_keys (id, key_hash, name, permissions, created_at)
admin_audit_logs (id, api_key_id, action, resource, payload, ip, created_at)

-- 用户（管理后台）
users (id, email, password_hash, created_at)
sessions (id, user_id, expires)
```

---

## 七、分步实施清单（供 AI 执行）

按以下顺序执行，每步可单独作为任务交付：

### Step 1：项目初始化 ✅
- [x] 创建 Next.js 14 项目（TypeScript, Tailwind, App Router）
- [x] 配置 ESLint、Prettier
- [x] 配置 Vercel 项目连接

### Step 2：数据库与 ORM ✅
- [x] 选择并配置数据库（Vercel Postgres / Supabase / Neon）
- [x] 配置 Drizzle ORM + postgres.js
- [x] 编写并执行迁移（products, categories, site_settings, form_submissions, api_keys, admin_audit_logs, users）

### Step 3：SEO 基础设施 ✅
- [x] 实现 `metadata.ts`、`generateMetadata` 工具
- [x] 实现 `sitemap.ts`、`robots.ts`
- [x] 实现 `JsonLd` 组件（Organization, Product, BreadcrumbList）

### Step 4：商品与搜索 ✅
- [x] 商品 CRUD API
- [x] 商品列表页、详情页、分类页
- [x] 搜索 API 与搜索页
- [x] 商品页 SEO（动态 meta + JSON-LD）

### Step 5：管理后台 ✅
- [x] 认证（Session + bcrypt）
- [x] 后台布局与导航
- [x] 联系方式设置页
- [x] 商品管理（列表、新建、编辑、删除）
- [x] 表单记录查看

### Step 6：API Key 与审计
- [ ] API Key 生成、存储、校验
- [ ] 管理 API 路由（/api/admin/*）
- [ ] 审计日志记录与查询

### Step 7：表单与归因
- [ ] 联系表单组件
- [ ] 提交 API（含 UTM、referrer）
- [ ] 管理后台表单列表

### Step 8：Agentic Page
- [ ] 结构化数据完善
- [ ] 可选：`/.well-known/ai-content` 端点
- [ ] 流量归因分析展示

### Step 9：部署与文档
- [ ] Vercel 部署配置
- [ ] 环境变量文档
- [ ] API 文档（管理 API 使用说明）

---

## 八、环境变量清单

```env
# 数据库
DATABASE_URL=

# 认证
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# 管理 API（可选，用于程序化）
ADMIN_API_KEY=

# 站点
NEXT_PUBLIC_SITE_URL=https://www.betterfastener.com
```

---

## 九、总结

本方案采用 **Next.js + PostgreSQL + Vercel** 作为主栈，满足：
- 完善 SEO/GEO
- 商品搜索与 SEO
- 管理后台（联系方式、商品 CRUD）
- Vercel 及通用部署
- Agentic Page 语义化与流量归因
- API Key 程序化控制与审计
- 表单归因

二阶段可扩展 WebMCP、多域名、Blog、AB Testing；未来可对接 WordPress 等生态。

**建议执行方式：** 将「分步实施清单」中的每一步作为独立任务，逐条交给 AI 生成代码并落地，每步完成后进行验证再进入下一步。
