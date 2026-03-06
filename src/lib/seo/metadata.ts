import type { Metadata } from "next";

const SITE_NAME = "Better Fasteners Co., Ltd.";
const SITE_NAME_EN = "Better Fasteners Co., Ltd.";
const DEFAULT_DESC =
  "Better Fasteners - 专业汽车紧固件、CNC零件、螺丝制造商。位于上海，提供高品质紧固件解决方案。";
const DEFAULT_DESC_EN =
  "Better Fasteners - Professional automotive fasteners, CNC parts, and screws manufacturer. Based in Shanghai, providing high-quality fastener solutions.";
const KEYWORDS =
  "紧固件,汽车紧固件,CNC零件,螺丝,上海紧固件,Better Fasteners";
const KEYWORDS_EN =
  "fasteners, automotive fasteners, CNC parts, screws, Shanghai fasteners";

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.betterfastener.com";
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: `${SITE_NAME} | 汽车紧固件与CNC零件`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESC,
  keywords: [KEYWORDS, KEYWORDS_EN],
  authors: [{ name: SITE_NAME, url: getBaseUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESC,
    url: getBaseUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESC,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: getBaseUrl(),
  },
};

export interface PageMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string | string[];
  path?: string;
  image?: string;
  noIndex?: boolean;
}

/**
 * 生成页面级 Metadata
 */
export function createPageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description = DEFAULT_DESC,
    keywords,
    path = "",
    image,
    noIndex = false,
  } = options;

  const baseUrl = getBaseUrl();
  const url = path ? `${baseUrl}${path.startsWith("/") ? path : `/${path}`}` : baseUrl;
  const ogImage = image ? `${baseUrl}${image.startsWith("/") ? image : `/${image}`}` : undefined;

  return {
    title: title ? `${title} | ${SITE_NAME}` : undefined,
    description,
    keywords: keywords ? (Array.isArray(keywords) ? keywords : [keywords]) : undefined,
    openGraph: {
      title: title || SITE_NAME,
      description,
      url,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      title: title || SITE_NAME,
      description,
    },
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export { getBaseUrl };
