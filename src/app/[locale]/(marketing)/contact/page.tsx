import { setRequestLocale, getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/property/contact-form";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [tNav, tHome] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Home.interest"),
  ]);

  const items = [
    { icon: MapPin, text: "Lechería · El Tigre, Anzoátegui, Venezuela" },
    { icon: Phone, text: "+58 000 000 0000" },
    { icon: Mail, text: "contacto@optimavip.com" },
  ];

  return (
    <PageShell title={tNav("contact")}>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 py-6">
            <p className="text-sm text-muted-foreground">{tHome("subtitle")}</p>
            {items.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm">
                <Icon className="size-5 text-primary" />
                <span>{text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <ContactForm defaultMessage={tHome("defaultMessage")} />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
