import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo/metadata";
import { db, schema } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // 动态添加商品和分类页面
  let dynamicPages: MetadataRoute.Sitemap = [];
  if (db) {
    try {
      const [productList, categoryList] = await Promise.all([
        db.select({ slug: schema.products.slug, updatedAt: schema.products.updatedAt }).from(schema.products),
        db.select({ slug: schema.categories.slug, updatedAt: schema.categories.updatedAt }).from(schema.categories),
      ]);

      dynamicPages = [
        ...productList.map((p) => ({
          url: `${baseUrl}/products/${p.slug}`,
          lastModified: p.updatedAt || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })),
        ...categoryList.map((c) => ({
          url: `${baseUrl}/products/category/${c.slug}`,
          lastModified: c.updatedAt || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
      ];
    } catch {
      // 数据库不可用时仅返回静态页面
    }
  }

  return [...staticPages, ...dynamicPages];
}
