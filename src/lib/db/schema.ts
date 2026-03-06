import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============ 商品分类 ============
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  parentId: uuid("parent_id"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ 商品 ============
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  name: varchar("name", { length: 300 }).notNull(),
  nameEn: varchar("name_en", { length: 300 }),
  description: text("description"),
  categoryId: uuid("category_id").references(() => categories.id),
  specs: jsonb("specs").$type<Record<string, unknown>>(),
  images: jsonb("images").$type<string[]>(),
  seoTitle: varchar("seo_title", { length: 200 }),
  seoDesc: varchar("seo_desc", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ 站点设置 ============
export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ 表单提交 ============
export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formType: varchar("form_type", { length: 50 }).notNull(), // contact | inquiry | quote
  name: varchar("name", { length: 200 }),
  email: varchar("email", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 200 }),
  message: text("message"),
  utmSource: varchar("utm_source", { length: 200 }),
  utmMedium: varchar("utm_medium", { length: 200 }),
  utmCampaign: varchar("utm_campaign", { length: 200 }),
  utmContent: varchar("utm_content", { length: 200 }),
  utmTerm: varchar("utm_term", { length: 200 }),
  referrer: varchar("referrer", { length: 500 }),
  landingPage: varchar("landing_page", { length: 500 }),
  ip: varchar("ip", { length: 50 }),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ API Keys ============
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  keyHash: varchar("key_hash", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  permissions: jsonb("permissions").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ 管理审计日志 ============
export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  apiKeyId: uuid("api_key_id").references(() => apiKeys.id),
  userId: uuid("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  resource: varchar("resource", { length: 100 }),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  ip: varchar("ip", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ 用户（管理后台） ============
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ 会话 ============
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ 关联 ============
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryHierarchy",
  }),
  children: many(categories, { relationName: "categoryHierarchy" }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [adminAuditLogs.apiKeyId],
    references: [apiKeys.id],
  }),
  user: one(users, {
    fields: [adminAuditLogs.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
