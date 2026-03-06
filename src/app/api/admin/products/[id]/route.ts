import { NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getAdminAuthContext } from "@/lib/auth/api-key";
import { logAdminAction } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await getAdminAuthContext(request);
  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { id } = await params;
  const result = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, id))
    .limit(1);
  if (result.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(result[0]);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await getAdminAuthContext(request);
  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { id } = await params;
  const body = await request.json();
  const { name, slug, nameEn, description, categoryId, specs, images, seoTitle, seoDesc } = body;
  const [product] = await db
    .update(schema.products)
    .set({
      ...(name != null && { name: String(name) }),
      ...(slug != null && { slug: String(slug).toLowerCase().replace(/\s+/g, "-") }),
      ...(nameEn != null && { nameEn: nameEn || null }),
      ...(description != null && { description: description || null }),
      ...(categoryId != null && { categoryId: categoryId || null }),
      ...(specs != null && { specs }),
      ...(images != null && { images }),
      ...(seoTitle != null && { seoTitle: seoTitle || null }),
      ...(seoDesc != null && { seoDesc: seoDesc || null }),
      updatedAt: new Date(),
    })
    .where(eq(schema.products.id, id))
    .returning();
  if (!product) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await logAdminAction({
    request,
    context,
    action: "update",
    resource: "product",
    payload: { id: product.id, slug: product.slug },
  });

  return Response.json({ product });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await getAdminAuthContext(request);
  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { id } = await params;
  await db.delete(schema.products).where(eq(schema.products.id, id));

  await logAdminAction({
    request,
    context,
    action: "delete",
    resource: "product",
    payload: { id },
  });

  return Response.json({ ok: true });
}
