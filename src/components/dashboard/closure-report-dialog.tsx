"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { reportClosure } from "@/lib/actions/closure";
import type { ClosureInput } from "@/lib/validations/closure";
import { ClosureType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ClosureReportDialog({
  propertyId,
  open,
  onOpenChange,
}: {
  propertyId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations("Closures");
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<ClosureType>(ClosureType.SOLD);
  const [finalPrice, setFinalPrice] = useState("");
  const [clientName, setClientName] = useState("");
  const [notes, setNotes] = useState("");
  const [useAsTestimonial, setUseAsTestimonial] = useState(false);
  const [testimonialText, setTestimonialText] = useState("");

  async function submit() {
    setSaving(true);
    const payload: ClosureInput = {
      propertyId,
      type,
      finalPrice: finalPrice as unknown as number,
      clientName,
      notes,
      useAsTestimonial,
      testimonialText,
    };
    const res = await reportClosure(payload);
    setSaving(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(t("reported"));
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("reportTitle")}</DialogTitle>
          <DialogDescription>{t("reportDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>{t("type")}</Label>
            <Select value={type} onValueChange={(v) => setType(v as ClosureType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ClosureType.RESERVED}>
                  {t("types.RESERVED")}
                </SelectItem>
                <SelectItem value={ClosureType.SOLD}>
                  {t("types.SOLD")}
                </SelectItem>
                <SelectItem value={ClosureType.RENTED}>
                  {t("types.RENTED")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="finalPrice">{t("finalPrice")}</Label>
              <Input
                id="finalPrice"
                type="number"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientName">{t("clientName")}</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={useAsTestimonial}
              onCheckedChange={setUseAsTestimonial}
            />
            {t("useAsTestimonial")}
          </label>

          {useAsTestimonial ? (
            <div className="grid gap-2">
              <Label htmlFor="testimonialText">{t("testimonialText")}</Label>
              <Textarea
                id="testimonialText"
                rows={3}
                value={testimonialText}
                onChange={(e) => setTestimonialText(e.target.value)}
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("report")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
