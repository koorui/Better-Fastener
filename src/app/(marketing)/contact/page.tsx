import { ContactPageJsonLd } from "@/components/JsonLd";
import { getBaseUrl } from "@/lib/seo/metadata";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "联系我们",
  description: "Better Fasteners 联系方式与询盘表单",
};

export default function ContactPage() {
  const baseUrl = getBaseUrl();
  return (
    <div className="min-h-screen bg-zinc-50">
      <ContactPageJsonLd
        name="Better Fasteners Co., Ltd."
        url={`${baseUrl}/contact`}
        description="联系我们获取紧固件产品咨询"
        telephone="+86 21-52049658"
        email="info@betterfastener.com"
        address="Shanghai, Shanghai Shi 200434, China"
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold text-zinc-900">联系我们</h1>
        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <div className="space-y-4 text-zinc-600">
            <p>
              <strong>电话：</strong>+86 21-52049658
            </p>
            <p>
              <strong>邮箱：</strong>info@betterfastener.com
            </p>
            <p>
              <strong>地址：</strong>Shanghai, Shanghai Shi 200434, China
            </p>
            <p className="text-sm text-zinc-500">
              请留下您的联系方式和需求，我们会尽快安排专业人员与您对接。
            </p>
          </div>
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
