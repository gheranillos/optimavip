import { setRequestLocale, getTranslations } from "next-intl/server";

import { PageShell } from "@/components/layout/page-shell";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Common");

  return (
    <PageShell title="OPTIMA VIP" description={t("tagline")}>
      <div className="prose prose-slate max-w-2xl text-muted-foreground">
        <p>
          OPTIMA VIP es una empresa inmobiliaria con presencia en Lechería y El
          Tigre, Venezuela, enfocada en conectar propiedades premium con clientes
          de todo el mundo.
        </p>
      </div>
    </PageShell>
  );
}
