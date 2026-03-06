import { eq, desc, asc, or, ilike } from "drizzle-orm";
import { db, schema } from "./index";

export async function getProducts(options?: {
  categorySlug?: string;
  limit?: number;
  offset?: number;
}) {
  if (!db) return { products: [], total: 0 };

  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  if (options?.categorySlug) {
    const cat = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, options.categorySlug))
      .limit(1);
    if (cat.length === 0) return { products: [], total: 0 };
    const products = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.categoryId, cat[0].id))
      .orderBy(desc(schema.products.updatedAt))
      .limit(limit)
      .offset(offset);
    const all = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.categoryId, cat[0].id));
    return { products, total: all.length };
  }

  const products = await db
    .select()
    .from(schema.products)
    .orderBy(desc(schema.products.updatedAt))
    .limit(limit)
    .offset(offset);
  const all = await db.select().from(schema.products);
  return { products, total: all.length };
}

export async function getProductBySlug(slug: string) {
  if (!db) return null;
  const result = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, slug))
    .limit(1);
  if (result.length === 0) return null;
  const product = result[0];
  let category = null;
  if (product.categoryId) {
    const cat = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, product.categoryId))
      .limit(1);
    category = cat[0] ?? null;
  }
  return { product, category };
}

export async function getCategories() {
  if (!db) return [];
  return db
    .select()
    .from(schema.categories)
    .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name));
}

export async function getCategoryBySlug(slug: string) {
  if (!db) return null;
  const cat = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.slug, slug))
    .limit(1);
  if (cat.length === 0) return null;
  const products = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.categoryId, cat[0].id));
  return { category: cat[0], products };
}

export async function searchProducts(q: string, limit = 20) {
  if (!db || !q || q.trim().length < 2) return [];
  const pattern = `%${q.trim()}%`;
  return db
    .select()
    .from(schema.products)
    .where(ilike(schema.products.name, pattern))
    .orderBy(desc(schema.products.updatedAt))
    .limit(limit);
}
