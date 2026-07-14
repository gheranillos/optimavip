import { getTranslations } from "next-intl/server";
import { Clock } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function RealtorPendingCard() {
  const t = await getTranslations("Dashboard.pending");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-lg text-center">
        <CardHeader className="items-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Clock className="size-7" />
          </div>
          <CardTitle className="mt-2 text-xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">{t("description")}</p>
          <Button asChild variant="outline">
            <Link href="/">{t("back")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
