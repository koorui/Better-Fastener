interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * 注入 JSON-LD 结构化数据到页面
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}

/**
 * Organization 结构化数据
 */
export function OrganizationJsonLd(params: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  address?: string;
  telephone?: string;
  email?: string;
}) {
  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: params.name,
    url: params.url,
  };
  if (params.logo) org.logo = params.logo;
  if (params.description) org.description = params.description;
  if (params.telephone || params.email || params.address) {
    org.contactPoint = {
      "@type": "ContactPoint",
      ...(params.telephone && { telephone: params.telephone }),
      ...(params.email && { email: params.email }),
      ...(params.address && { address: params.address }),
      contactType: "customer service",
      areaServed: "CN",
    };
  }
  if (params.address) {
    org.address = {
      "@type": "PostalAddress",
      addressLocality: params.address,
    };
  }
  return <JsonLd data={org} />;
}

/**
 * Product 结构化数据
 */
export function ProductJsonLd(params: {
  name: string;
  description?: string;
  image?: string | string[];
  url: string;
  sku?: string;
  offers?: {
    price?: number;
    priceCurrency?: string;
    availability?: string;
  };
}) {
  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: params.name,
    url: params.url,
  };
  if (params.description) product.description = params.description;
  if (params.image) {
    product.image = Array.isArray(params.image) ? params.image : [params.image];
  }
  if (params.sku) product.sku = params.sku;
  if (params.offers) {
    product.offers = {
      "@type": "Offer",
      url: params.url,
      price: params.offers.price,
      priceCurrency: params.offers.priceCurrency || "CNY",
      availability:
        params.offers.availability || "https://schema.org/InStock",
    };
  }
  return <JsonLd data={product} />;
}

/**
 * BreadcrumbList 结构化数据
 */
export function BreadcrumbJsonLd(props: {
  items: Array<{ name: string; url: string }>;
}) {
  const { items } = props;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <JsonLd data={breadcrumb} />;
}

/**
 * ContactPage 结构化数据
 */
export function ContactPageJsonLd(params: {
  name: string;
  url: string;
  description?: string;
  telephone?: string;
  email?: string;
  address?: string;
}) {
  const page: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: params.name,
    url: params.url,
  };
  if (params.description) page.description = params.description;
  if (params.telephone || params.email || params.address) {
    page.mainEntity = {
      "@type": "Organization",
      name: params.name,
      ...(params.telephone && { telephone: params.telephone }),
      ...(params.email && { email: params.email }),
      ...(params.address && {
        address: {
          "@type": "PostalAddress",
          addressLocality: params.address,
        },
      }),
    };
  }
  return <JsonLd data={page} />;
}
