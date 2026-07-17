"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { updateProfile, type ProfileInput } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProfileForm({
  defaults,
  showAgency,
}: {
  defaults: ProfileInput;
  showAgency: boolean;
}) {
  const t = useTranslations("Settings");
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit } = useForm<ProfileInput>({
    defaultValues: defaults,
  });

  async function onSubmit(values: ProfileInput) {
    setIsSaving(true);
    const res = await updateProfile(values);
    setIsSaving(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(t("saved"));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profileTitle")}</CardTitle>
        <CardDescription>{t("profileDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" type="tel" {...register("phone")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsapp">{t("whatsapp")}</Label>
              <Input id="whatsapp" type="tel" {...register("whatsapp")} />
            </div>
          </div>
          {showAgency ? (
            <div className="grid gap-2">
              <Label htmlFor="agency">{t("agency")}</Label>
              <Input id="agency" {...register("agency")} />
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="bio">{t("bio")}</Label>
            <Textarea id="bio" rows={4} {...register("bio")} />
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
