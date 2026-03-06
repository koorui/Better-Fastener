import type { Metadata } from "next";
import { createPageMetadata } from "./metadata";

/**
 * 商品页 Metadata 生成
 */
export function generateProductMetadata(params: {
  name: string;
  nameEn?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDesc?: string | null;
  slug: string;
}): Metadata {
  const title = params.seoTitle || params.name;
  const description =
    params.seoDesc || params.description || `${params.name} - Better Fasteners 专业紧固件产品`;
  const path = `/products/${params.slug}`;

  return createPageMetadata({
    title,
    description,
    path,
    keywords: [params.name, params.nameEn || "", "紧固件", "fasteners"].filter(Boolean),
  });
}

/**
 * 分类页 Metadata 生成
 */
export function generateCategoryMetadata(params: {
  name: string;
  nameEn?: string | null;
  slug: string;
}): Metadata {
  const title = params.name;
  const description = `${params.name} - Better Fasteners 商品分类`;
  const path = `/products/category/${params.slug}`;

  return createPageMetadata({
    title,
    description,
    path,
    keywords: [params.name, params.nameEn || "", "紧固件分类"].filter(Boolean),
  });
}

/**
 * 搜索页 Metadata 生成
 */
export function generateSearchMetadata(query?: string): Metadata {
  const title = query ? `搜索: ${query}` : "商品搜索";
  const description = query
    ? `搜索「${query}」相关紧固件产品`
    : "搜索 Better Fasteners 商品";

  return createPageMetadata({
    title,
    description,
    path: "/search",
    noIndex: true, // 搜索页通常不索引
  });
}
