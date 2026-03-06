import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { defaultMetadata } from "@/lib/seo/metadata";
import { getBaseUrl } from "@/lib/seo/metadata";
import { OrganizationJsonLd } from "@/components/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = getBaseUrl();
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OrganizationJsonLd
          name="Better Fasteners Co., Ltd."
          url={baseUrl}
          description="专业汽车紧固件、CNC零件、螺丝制造商"
          address="Shanghai, Shanghai Shi 200434, China"
          telephone="+86 21-52049658"
          email="info@betterfastener.com"
        />
        {children}
      </body>
    </html>
  );
}
