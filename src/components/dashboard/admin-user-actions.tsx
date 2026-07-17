"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import {
  updateAdmin,
  resetAdminPassword,
  changeAdminRole,
} from "@/lib/actions/admin-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminRow = {
  id: string;
  name: string | null;
  phone: string | null;
  whatsapp: string | null;
  isActive: boolean;
};

export function AdminUserActions({ admin }: { admin: AdminRow }) {
  const t = useTranslations("Admins");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isRunning, startTransition] = useTransition();

  const [name, setName] = useState(admin.name ?? "");
  const [phone, setPhone] = useState(admin.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(admin.whatsapp ?? "");
  const [isActive, setIsActive] = useState(admin.isActive);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "CLIENT" | "REALTOR">("ADMIN");

  function refreshOk(message: string) {
    toast.success(message);
    router.refresh();
  }

  function saveProfile() {
    startTransition(async () => {
      const res = await updateAdmin({
        id: admin.id,
        name,
        phone,
        whatsapp,
        isActive,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      refreshOk(t("updated"));
      setOpen(false);
    });
  }

  function doResetPassword() {
    if (password.length < 8) {
      toast.error(t("passwordMin"));
      return;
    }
    startTransition(async () => {
      const res = await resetAdminPassword({ id: admin.id, password });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setPassword("");
      refreshOk(t("passwordReset"));
    });
  }

  function doChangeRole() {
    startTransition(async () => {
      const res = await changeAdminRole({ id: admin.id, role });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      refreshOk(t("roleChanged"));
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="size-4" />
          {t("manage")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("manageTitle")}</DialogTitle>
          <DialogDescription>{t("manageDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor={`name-${admin.id}`}>{t("name")}</Label>
            <Input
              id={`name-${admin.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`phone-${admin.id}`}>{t("phone")}</Label>
              <Input
                id={`phone-${admin.id}`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`wa-${admin.id}`}>{t("whatsapp")}</Label>
              <Input
                id={`wa-${admin.id}`}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <Label htmlFor={`active-${admin.id}`}>{t("active")}</Label>
            <Switch
              id={`active-${admin.id}`}
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter>
            <Button onClick={saveProfile} disabled={isRunning}>
              {isRunning ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("save")}
            </Button>
          </DialogFooter>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor={`pwd-${admin.id}`}>{t("newPassword")}</Label>
            <div className="flex gap-2">
              <Input
                id={`pwd-${admin.id}`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={isRunning}
                onClick={doResetPassword}
              >
                {t("resetPassword")}
              </Button>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label>{t("changeRole")}</Label>
            <div className="flex gap-2">
              <Select
                value={role}
                onValueChange={(v) =>
                  setRole(v as "ADMIN" | "CLIENT" | "REALTOR")
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">{t("roles.ADMIN")}</SelectItem>
                  <SelectItem value="CLIENT">{t("roles.CLIENT")}</SelectItem>
                  <SelectItem value="REALTOR">{t("roles.REALTOR")}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="secondary"
                disabled={isRunning}
                onClick={doChangeRole}
              >
                {t("applyRole")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
