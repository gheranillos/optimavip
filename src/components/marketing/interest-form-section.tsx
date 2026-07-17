"use client";

import { useTranslations } from "next-intl";

import { ContactForm } from "@/components/property/contact-form";

export function InterestFormSection() {
  const t = useTranslations("Home.interest");

  return (
    <section className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• {t("point1")}</li>
              <li>• {t("point2")}</li>
              <li>• {t("point3")}</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
            <ContactForm defaultMessage={t("defaultMessage")} />
          </div>
        </div>
      </div>
    </section>
  );
}
