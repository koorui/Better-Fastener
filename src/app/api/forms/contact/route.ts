import { NextRequest } from "next/server";
import { db, schema } from "@/lib/db";

function getIp(request: NextRequest): string | null {
  // @ts-expect-error: ip 仅在部分环境存在
  const direct: string | undefined = request.ip;
  if (direct) return direct;
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || null;
  const real = request.headers.get("x-real-ip");
  return real ?? null;
}

export async function POST(request: NextRequest) {
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message && !email && !phone) {
    return Response.json(
      { error: "至少需要填写联系方式或留言内容" },
      { status: 400 }
    );
  }

  const formType =
    typeof body.formType === "string" && body.formType.trim().length > 0
      ? body.formType.trim()
      : "contact";

  const utmSource =
    typeof body.utmSource === "string" ? body.utmSource.trim() : null;
  const utmMedium =
    typeof body.utmMedium === "string" ? body.utmMedium.trim() : null;
  const utmCampaign =
    typeof body.utmCampaign === "string" ? body.utmCampaign.trim() : null;
  const utmContent =
    typeof body.utmContent === "string" ? body.utmContent.trim() : null;
  const utmTerm =
    typeof body.utmTerm === "string" ? body.utmTerm.trim() : null;

  const referrer =
    typeof body.referrer === "string" && body.referrer
      ? body.referrer
      : request.headers.get("referer");
  const landingPage =
    typeof body.landingPage === "string" && body.landingPage
      ? body.landingPage
      : null;

  const ip = getIp(request);
  const userAgent = request.headers.get("user-agent");

  await db.insert(schema.formSubmissions).values({
    formType,
    name: name || null,
    email: email || null,
    phone: phone || null,
    company: company || null,
    message: message || null,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    referrer: referrer || null,
    landingPage,
    ip,
    userAgent,
  });

  return Response.json({ ok: true });
}

