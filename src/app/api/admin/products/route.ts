import { NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { getAdminAuthContext } from "@/lib/auth/api-key";
import { logAdminAction } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const context = await getAdminAuthContext(request);
  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }
  const products = await db
    .select()
    .from(schema.products)
    .orderBy(desc(schema.products.updatedAt));
  return Response.json({ products });
}

export async function POST(request: NextRequest) {
  const context = await getAdminAuthContext(request);
  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }
  const body = await request.json();
  const { name, slug, nameEn, description, categoryId, specs, images, seoTitle, seoDesc } = body;
  if (!name || !slug) {
    return Response.json({ error: "名称和 slug 必填" }, { status: 400 });
  }
  const safeSlug = String(slug).toLowerCase().replace(/\s+/g, "-");
  const [product] = await db
    .insert(schema.products)
    .values({
      name: String(name),
      slug: safeSlug,
      nameEn: nameEn || null,
      description: description || null,
      categoryId: categoryId || null,
      specs: specs || null,
      images: images || null,
      seoTitle: seoTitle || null,
      seoDesc: seoDesc || null,
    })
    .returning();
  await logAdminAction({
    request,
    context,
    action: "create",
    resource: "product",
    payload: { id: product.id, slug: product.slug },
  });

  return Response.json({ product });
}
