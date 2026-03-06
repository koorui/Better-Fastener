import { NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, or, ilike } from "drizzle-orm";

export async function GET(request: NextRequest) {
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

  if (!q || q.length < 2) {
    return Response.json({ products: [], total: 0 });
  }

  const searchPattern = `%${q}%`;

  try {
    const products = await db
      .select()
      .from(schema.products)
      .where(
        or(
          ilike(schema.products.name, searchPattern),
          ilike(schema.products.nameEn, searchPattern),
          ilike(schema.products.description, searchPattern)
        )
      )
      .orderBy(desc(schema.products.updatedAt))
      .limit(limit);

    return Response.json({ products, total: products.length });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
