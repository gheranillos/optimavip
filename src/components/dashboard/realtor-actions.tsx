"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { approveRealtor, rejectRealtor } from "@/lib/actions/realtor";
import { RealtorStatus } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";

export function RealtorActions({
  id,
  status,
}: {
  id: string;
  status: RealtorStatus | null;
}) {
  const t = useTranslations("Realtors");
  const router = useRouter();
  const [isRunning, startTransition] = useTransition();

  function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    startTransition(async () => {
      const res = await fn();
      if (!res.success) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success(t("done"));
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end gap-2">
      {status !== RealtorStatus.APPROVED ? (
        <Button
          size="sm"
          disabled={isRunning}
          onClick={() => run(() => approveRealtor(id))}
        >
          <Check className="size-4" />
          {t("approve")}
        </Button>
      ) : null}
      {status !== RealtorStatus.REJECTED ? (
        <Button
          size="sm"
          variant="outline"
          disabled={isRunning}
          onClick={() => run(() => rejectRealtor(id))}
        >
          <X className="size-4" />
          {t("reject")}
        </Button>
      ) : null}
    </div>
  );
}
