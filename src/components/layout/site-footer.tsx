import { getTranslations } from "next-intl/server";
import { MapPin } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";

export async function SiteFooter() {
  const [tFooter, tNav] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Nav"),
  ]);

  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo showTagline />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {tFooter("locations")}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              Lechería · El Tigre, Venezuela
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{tFooter("company")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link href="/success-cases" className="hover:text-foreground">
                  {tNav("successCases")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  {tNav("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{tFooter("legal")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  {tFooter("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  {tFooter("terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          © {year} OPTIMA VIP. {tFooter("rights")}
        </div>
      </div>
    </footer>
  );
}
