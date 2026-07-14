import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-background px-4 py-12">
      <Link href="/" className="mb-8">
        <Logo showTagline className="items-center" />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
