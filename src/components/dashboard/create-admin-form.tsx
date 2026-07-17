"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { createAdmin } from "@/lib/actions/admin-user";
import type { CreateAdminInput } from "@/lib/validations/admin-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CreateAdminForm() {
  const t = useTranslations("Admins");
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm<CreateAdminInput>({
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  async function onSubmit(values: CreateAdminInput) {
    setIsSaving(true);
    const res = await createAdmin(values);
    setIsSaving(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(t("created"));
    reset();
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("createTitle")}</CardTitle>
        <CardDescription>{t("createDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="admin-name">{t("name")}</Label>
              <Input
                id="admin-name"
                {...register("name", { required: true })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-email">{t("email")}</Label>
              <Input
                id="admin-email"
                type="email"
                {...register("email", { required: true })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="admin-phone">{t("phone")}</Label>
              <Input id="admin-phone" type="tel" {...register("phone")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-password">{t("password")}</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="new-password"
                {...register("password", { required: true, minLength: 8 })}
              />
            </div>
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("create")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
