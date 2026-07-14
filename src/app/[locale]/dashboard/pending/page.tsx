import { setRequestLocale } from "next-intl/server";

import { requireUser } from "@/lib/auth-guard";
import { RealtorPendingCard } from "@/components/dashboard/realtor-pending-card";

export default async function DashboardPendingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser();

  return <RealtorPendingCard />;
}
