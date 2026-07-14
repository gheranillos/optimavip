import { setRequestLocale, getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Nav");

  const items = [
    { icon: MapPin, text: "Lechería · El Tigre, Anzoátegui, Venezuela" },
    { icon: Phone, text: "+58 000 000 0000" },
    { icon: Mail, text: "contacto@optimavip.com" },
  ];

  return (
    <PageShell title={t("contact")}>
      <Card className="max-w-lg">
        <CardContent className="space-y-4 py-6">
          {items.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm">
              <Icon className="size-5 text-primary" />
              <span>{text}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageShell>
  );
}
