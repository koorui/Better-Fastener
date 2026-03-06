import { NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    let products;
    let total: number;

    if (categorySlug) {
      const category = await db
        .select({ id: schema.categories.id })
        .from(schema.categories)
        .where(eq(schema.categories.slug, categorySlug))
        .limit(1);

      if (category.length === 0) {
        return Response.json({ products: [], total: 0, limit, offset });
      }

      const categoryId = category[0].id;
      [products, total] = await Promise.all([
        db
          .select()
          .from(schema.products)
          .where(eq(schema.products.categoryId, categoryId))
          .orderBy(desc(schema.products.updatedAt))
          .limit(limit)
          .offset(offset),
        db
          .select()
          .from(schema.products)
          .where(eq(schema.products.categoryId, categoryId))
          .then((r) => r.length),
      ]);
    } else {
      const all = await db
        .select()
        .from(schema.products)
        .orderBy(desc(schema.products.updatedAt));
      total = all.length;
      products = all.slice(offset, offset + limit);
    }

    return Response.json({ products, total, limit, offset });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
