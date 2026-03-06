import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/search"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
