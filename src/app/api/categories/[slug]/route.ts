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
      .from(schema.categories)
      .where(eq(schema.categories.slug, slug))
      .limit(1);

    if (result.length === 0) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    const category = result[0];

    const products = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.categoryId, category.id));

    return Response.json({ category, products });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
