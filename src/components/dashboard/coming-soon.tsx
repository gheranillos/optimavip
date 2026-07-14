import { getTranslations } from "next-intl/server";
import { Hammer } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export async function ComingSoon({ title }: { title: string }) {
  const t = await getTranslations("Dashboard");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Hammer className="size-8" />
          <p>{t("comingSoon")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
