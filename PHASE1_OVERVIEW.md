# Better Fastener - 第一阶段功能与测试总览

> 本文档总结第一阶段已经落地的功能、接口、数据结构以及推荐的测试用例，供后续开发和联调参考。

---

## 一、阶段目标与范围

- **目标网站**: Better Fasteners 官方站（紧固件 / 汽车紧固件 / CNC 零件等）
- **阶段目标（Phase 1）**：
  - 完整的 **SEO / GEO 基础设施**
  - 商品数据模型、列表、详情页与搜索
  - 管理后台（登录、商品管理、站点设置、表单记录）
  - **API Key + 审计日志**，支持程序化管理站点内容
  - 联系表单 + UTM 归因
  - 可在本地 / Vercel 等环境稳定构建与运行

---

## 二、运行与环境配置

### 2.1 安装与命令

```bash
cd e:\homework\betterfastener

# 安装依赖
npm install

# 开发环境
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查与格式化
npm run lint
npm run format
```

### 2.2 环境变量

参考 `.env.example`：

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
NEXT_PUBLIC_SITE_URL="https://www.betterfastener.com"

# 管理员种子（仅 db:seed:admin 使用）
# ADMIN_EMAIL=admin@betterfastener.com
# ADMIN_PASSWORD=your_secure_password
```

本地开发 `.env.local` 示例：

```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/betterfastener"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 2.3 数据库初始化与种子

```bash
# 1. 按 schema 创建表（Drizzle 迁移）
npm run db:migrate:run

# 2. 插入基础站点设置（联系方式等）
npm run db:seed

# 3. （可选）插入示例分类与商品，方便开发调试
npm run db:seed:sample

# 4. 创建后台管理员账号
npm run db:seed:admin
# 默认：admin@betterfastener.com / admin123456
```

---

## 三、功能概览（前台）

### 3.1 首页 `/`

- 品牌名称与简介
- CTA：「浏览产品」「联系我们」
- 顶部导航：
  - `产品` → `/products`
  - `搜索` → `/search`
  - `联系我们` → `/contact`

### 3.2 产品列表 `/products`

- 展示所有产品（来自 `products` 表）
- 顶部分类导航：
  - `汽车紧固件`、`CNC 零件` 等（来自 `categories` 表）
- 每个卡片显示：
  - 名称、描述摘要（前几行）、图片（若有）
- 点击卡片跳转到 `/products/[slug]`

### 3.3 产品详情 `/products/[slug]`

- 信息结构：
  - 名称（中文 + 英文）
  - 主图 + 若干缩略图
  - 产品描述（支持多行）
  - 规格参数（`specs` JSON 字段，展示为 key-value 列表）
  - CTA 按钮：「询价 / 联系我们」 → 跳转 `/contact`
- SEO：
  - `generateMetadata` 使用 `generateProductMetadata`（标题、描述、canonical）
  - `ProductJsonLd` + `BreadcrumbJsonLd` 生成 Product + 面包屑 JSON-LD

### 3.4 分类页 `/products/category/[slug]`

- 显示某分类下的所有产品
- 面包屑：首页 / 产品 / 分类名
- SEO：`generateCategoryMetadata` + `BreadcrumbJsonLd`

### 3.5 搜索页 `/search`

- 搜索表单 + 结果列表
- 查询参数：`?q=keyword`
- 使用 `searchProducts`（服务端）在 `name / nameEn / description` 上做 ILIKE 搜索
- SEO：
  - `noIndex: true`，避免搜索结果页被索引

### 3.6 联系我们 `/contact`

结构：

- 左侧：固定联系方式
  - 电话、邮箱、地址
  - 简要说明「请留下需求，我们会尽快联系」
- 右侧：表单 `ContactForm`
  - 字段：
    - 姓名（可选）
    - 邮箱（必填）
    - 电话（可选）
    - 公司（可选）
    - 留言内容（必填）
  - 前端自动采集：
    - 当前 URL 中的 UTM 参数：
      - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
    - `landingPage = window.location.href`
    - `referrer = document.referrer`
  - 提交到 `POST /api/forms/contact`
  - 提交成功后清空表单并提示「提交成功，我们会尽快与您联系」

---

## 四、功能概览（后台）

### 4.1 登录与布局

- 登录页 `/admin/login`
  - 邮箱 + 密码（`bcrypt` 验证）
  - 登录成功后写入 `admin_session` Cookie
- 中间件保护：
  - `middleware.ts` 拦截 `/admin/*`：
    - 未登录跳转 `/admin/login?redirect=/admin/...`

- 后台根布局：
  - `/admin` 使用 `(dashboard)` 分组布局：
    - 左侧侧边栏（统一导航）
    - 右侧内容区域
  - 侧边栏入口：
    - 概览 `/admin`
    - 商品管理 `/admin/products`
    - 站点设置 `/admin/settings`
    - 表单记录 `/admin/forms`
    - API Key 管理 `/admin/api-keys`
    - 退出登录（调用 `/api/admin/logout`）

### 4.2 商品管理

- 列表页 `/admin/products`
  - 使用 `GET /api/admin/products`
  - 显示：名称、slug
  - 操作：
    - 编辑 → `/admin/products/[id]`
    - 删除 → `DELETE /api/admin/products/[id]`

- 新建页 `/admin/products/new`
  - 表单字段：
    - 名称（必填）
    - slug（必填，可由名称自动生成）
    - 英文名
    - 分类（下拉，来自 `GET /api/categories`）
    - 描述
    - SEO 标题 / 描述
  - 提交至 `POST /api/admin/products`

- 编辑页 `/admin/products/[id]`
  - 初始数据：`GET /api/admin/products/[id]`
  - 更新：`PUT /api/admin/products/[id]`
  - 字段与新建页基本一致

### 4.3 站点设置 `/admin/settings`

- 通过 `GET /api/admin/settings` 读取 `site_settings` 表
- 可编辑：
  - `contact_phone`
  - `contact_email`
  - `address`
  - `site_name`
  - `site_name_en`
- 保存：`PUT /api/admin/settings`
  - 后端使用 `INSERT ... ON CONFLICT DO UPDATE` 写入

> 后续可扩展：前台 `/contact` / 页脚 等从 `site_settings` 读取，而不是写死。

### 4.4 表单记录 `/admin/forms`

- 调用 `GET /api/admin/forms?limit=&offset=`
- 列表字段：
  - 类型（`formType`，目前主要是 `contact`）
  - 姓名 / 邮箱 / 电话
  - 来源（优先显示 `utm_source`，否则 `referrer`）
  - 提交时间 `createdAt`
- 用于运营方分析不同来源（广告、自然、社交等）的询盘效果。

### 4.5 API Key 管理 `/admin/api-keys`

- 列表：
  - 名称
  - 权限（当前为字符串数组，可用于后续粒度控制）
  - 创建时间
- 创建：
  - 表单输入备注名称 → `POST /api/admin/api-keys`
  - 后端生成：
    - 明文 Key：`bfk_<随机>`（只返回一次）
    - 哈希：`SHA-512` 存入 `api_keys.key_hash`
  - 页面展示一次性 Key，提示用户妥善保存
- 删除：
  - `DELETE /api/admin/api-keys/[id]`

---

## 五、认证与鉴权模型

### 5.1 Session（用户登录）

- 存储在：
  - `users`（管理员账号）
  - `sessions`（`admin_session` Cookie 对应记录，含过期时间）
- 使用场景：
  - 后台页面（/admin 前端 UI）
  - 通过浏览器操作的管理行为（手动管理商品、设置等）

### 5.2 API Key（程序化访问）

- 表：`api_keys`
  - `id, key_hash, name, permissions, created_at`
  - 明文 Key 仅在创建时返回
- 获取方式：
  - 头部：
    - `Authorization: Bearer <API_KEY>` 或
    - `X-API-Key: <API_KEY>`
- 认证顺序（`getAdminAuthContext`）：
  1. 优先检测 `admin_session`（后端 `getSession()`）
  2. 若无 Session，则查找 API Key 哈希
  3. 返回：
     - `{ type: "user", userId, email }`
     - `{ type: "apiKey", apiKeyId, permissions }`
     - 或 `null`（未认证）

### 5.3 哪些接口支持 API Key

目前支持 Session + API Key 双模式的管理接口：

- `GET/PUT /api/admin/settings`
- `GET/POST /api/admin/products`
- `GET/PUT/DELETE /api/admin/products/[id]`
- `GET /api/admin/forms`
- `GET/POST /api/admin/api-keys`
- `DELETE /api/admin/api-keys/[id]`

仅 Session（用户登录）可用的接口：

- `POST /api/admin/login`
- `POST /api/admin/logout`

---

## 六、审计日志（Admin Audit Logs）

### 6.1 数据结构

表：`admin_audit_logs`：

- `id` (uuid)
- `api_key_id` (uuid, 可空) — 若由 API Key 发起
- `user_id` (uuid, 可空) — 若由登录用户发起
- `action` (string) — `"create" | "update" | "delete" | ...`
- `resource` (string) — `"product"`, `"site_settings"`, `"api_key"` 等
- `payload` (jsonb) — 记录对象的 `id/slug` 或修改的 key 列表
- `ip` (string) — 来源 IP
- `created_at` (timestamp)

### 6.2 已接入的审计点

- 站点设置：
  - `PUT /api/admin/settings`
  - `action: "update"`, `resource: "site_settings"`
  - `payload: { keys: [更新的键数组] }`

- 商品：
  - `POST /api/admin/products`
    - `action: "create"`, `resource: "product"`, `payload: { id, slug }`
  - `PUT /api/admin/products/[id]`
    - `action: "update"`, `resource: "product"`, `payload: { id, slug }`
  - `DELETE /api/admin/products/[id]`
    - `action: "delete"`, `resource: "product"`, `payload: { id }`

- API Key：
  - `POST /api/admin/api-keys`
    - `action: "create"`, `resource: "api_key"`, `payload: { id, name, permissions }`
  - `DELETE /api/admin/api-keys/[id]`
    - `action: "delete"`, `resource: "api_key"`, `payload: { id }`

> 后续如需对分类管理、页面内容管理等做审计，只需在对应 API 中调用 `logAdminAction`。

---

## 七、表单与归因（Form & Attribution）

### 7.1 提交入口

- 前台联系表单：`/contact` → `ContactForm`
- 调用 API：`POST /api/forms/contact`

### 7.2 归因字段

写入 `form_submissions` 表的主要字段：

- 拟合需求信息：
  - `formType`: `"contact"`（也支持未来扩展 `"inquiry"`, `"quote"`）
  - `name, email, phone, company, message`
- 归因信息：
  - `utmSource, utmMedium, utmCampaign, utmContent, utmTerm`
  - `referrer`: 前端传入或 HTTP Referer 头
  - `landingPage`: 前端传入的落地页 URL
  - `ip`: 从 `request.ip` 或 `x-forwarded-for` / `x-real-ip`
  - `userAgent`: User-Agent 头

### 7.3 后台查看

- `/admin/forms`：
  - 来源列优先展示 UTM Source，否则回退显示 `referrer`
  - 时间列展示 `createdAt` 的本地化字符串

---

## 八、推荐测试清单

### 8.1 初始化与构建

- [ ] `npm install` 正常完成，无致命错误
- [ ] `npm run db:migrate:run` 正常执行
- [ ] `npm run db:seed`、`npm run db:seed:sample`、`npm run db:seed:admin` 全部成功
- [ ] `npm run build` 能通过（使用 Webpack）

### 8.2 前台功能

- [ ] `/` 页面正常渲染，导航链接可用
- [ ] `/products` 能看到示例商品，点击进入详情
- [ ] `/products/[slug]` 显示描述与规格，SEO 元数据符合预期（可在浏览器 DevTools 里检查 `<head>`）
- [ ] `/products/category/[slug]` 正确筛选该分类下商品
- [ ] `/search?q=bolt` 能返回匹配商品
- [ ] `/contact` 表单：
  - 不填邮箱与电话且留言为空 → 返回错误（400）
  - 填写邮箱 + 留言 → 返回成功，表单重置

### 8.3 后台（Session）

- [ ] `/admin/login` 使用 `db:seed:admin` 创建的账户可成功登录
- [ ] 侧边栏显示当前用户邮箱
- [ ] `/admin/products` 列表中可以新建 / 编辑 / 删除商品
- [ ] `/admin/settings` 修改联系人信息并保存成功
- [ ] `/admin/forms` 能看到前台提交的表单记录

### 8.4 API Key + 审计

- [ ] `/admin/api-keys` 可创建 Key，能看到一次性明文 key
- [ ] 使用该 Key 调用：
  - `POST /api/admin/products`
  - `PUT /api/admin/products/[id]`
  - `DELETE /api/admin/products/[id]`
  均能成功，不依赖 Cookie
- [ ] 在数据库中查询 `admin_audit_logs`，能看到上述操作对应记录，包含：
  - `api_key_id` / `user_id`
  - `action` / `resource`
  - `payload`
  - `ip` / `created_at`

---

## 九、后续开发建议（进入二阶段前的准备）

- 确认数据库 Schema 是否满足后续：
  - Blog（`posts` 表）
  - 多域名内容（如在 products / site_settings 中增加 `domain` 字段）
- 将前台 `/contact` 和页头 / 页脚中的联系方式替换为从 `site_settings` 读取，避免硬编码
- 为 `admin_audit_logs` 增加后台查看页面（例如 `/admin/logs`）以便非技术人员直接查看操作轨迹
- 为 `/api/admin/*` 编写简单的 OpenAPI/接口文档，方便后续接入外部系统或 Agent

以上即为第一阶段的整体说明与测试建议，可以配合 `IMPLEMENTATION_PLAN.md` 一起使用：  
- `IMPLEMENTATION_PLAN.md` 更偏 **设计与分步实施**  
- `PHASE1_OVERVIEW.md` 更偏 **现状总览与测试清单**。

