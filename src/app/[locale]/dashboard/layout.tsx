import { setRequestLocale, getTranslations } from "next-intl/server";

import { requireUser } from "@/lib/auth-guard";
import { getDashboardNav } from "@/lib/dashboard-nav";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { UserMenu } from "@/components/layout/user-menu";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireUser();
  const t = await getTranslations("Dashboard");

  const items = getDashboardNav(user.role, t);
  const roleLabel = t(`roles.${user.role}`);

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <DashboardSidebar items={items} roleLabel={roleLabel} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden h-16 items-center justify-end gap-2 border-b bg-background px-6 md:flex">
          <LocaleSwitcher />
          <UserMenu name={user.name} email={user.email} />
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
