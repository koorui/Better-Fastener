import { NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { slug } = await params;
  if (!slug) {
    return Response.json({ error: "Slug required" }, { status: 400 });
  }

  try {
    const result = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.slug, slug))
      .limit(1);

    if (result.length === 0) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const product = result[0];

    // 若有分类，加载分类信息
    let category = null;
    if (product.categoryId) {
      const cat = await db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.id, product.categoryId))
        .limit(1);
      category = cat[0] ?? null;
    }

    return Response.json({ product, category });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
