"use client";

import { useTransition } from "react";
import { Check, Archive, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { setInquiryStatus } from "@/lib/actions/inquiry";
import { InquiryStatus } from "@/generated/prisma/enums";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

export function InquiryActions({
  id,
  phone,
  status,
}: {
  id: string;
  phone: string;
  status: InquiryStatus;
}) {
  const t = useTranslations("Inquiries");
  const router = useRouter();
  const [isRunning, startTransition] = useTransition();

  function update(next: InquiryStatus) {
    startTransition(async () => {
      const res = await setInquiryStatus(id, next);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button asChild size="sm" variant="outline">
        <a
          href={buildWhatsAppLink(phone)}
          target="_blank"
          rel="noreferrer"
        >
          <MessageSquare className="size-4" />
          WhatsApp
        </a>
      </Button>
      {status !== InquiryStatus.READ ? (
        <Button
          size="sm"
          variant="ghost"
          disabled={isRunning}
          onClick={() => update(InquiryStatus.READ)}
        >
          <Check className="size-4" />
          {t("markRead")}
        </Button>
      ) : null}
      {status !== InquiryStatus.ARCHIVED ? (
        <Button
          size="sm"
          variant="ghost"
          disabled={isRunning}
          onClick={() => update(InquiryStatus.ARCHIVED)}
        >
          <Archive className="size-4" />
          {t("archive")}
        </Button>
      ) : null}
    </div>
  );
}
