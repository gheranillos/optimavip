"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { setTestimonialApproved } from "@/lib/actions/closure";
import { Button } from "@/components/ui/button";

export function TestimonialApprove({
  id,
  approved,
}: {
  id: string;
  approved: boolean;
}) {
  const t = useTranslations("Closures");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const res = await setTestimonialApproved(id, !approved);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(t("done"));
      router.refresh();
    });
  }

  return (
    <Button
      size="sm"
      variant={approved ? "default" : "outline"}
      onClick={toggle}
      disabled={isPending}
    >
      <Star className={approved ? "size-4 fill-current" : "size-4"} />
      {approved ? t("testimonialPublished") : t("publishTestimonial")}
    </Button>
  );
}
