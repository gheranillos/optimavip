import { setRequestLocale, getTranslations } from "next-intl/server";

import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { UserRole } from "@/generated/prisma/enums";
import { isStaff } from "@/lib/roles";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sessionUser = await requireUser();
  const t = await getTranslations("Settings");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      phone: true,
      whatsapp: true,
      agency: true,
      bio: true,
      role: true,
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <ProfileForm
        showAgency={
          user.role === UserRole.REALTOR || isStaff(user.role)
        }
        defaults={{
          name: user.name ?? "",
          phone: user.phone ?? "",
          whatsapp: user.whatsapp ?? "",
          agency: user.agency ?? "",
          bio: user.bio ?? "",
        }}
      />
    </div>
  );
}
