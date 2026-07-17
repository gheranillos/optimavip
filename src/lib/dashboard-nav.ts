import { UserRole } from "@/generated/prisma/enums";
import type { NavItem } from "@/components/dashboard/dashboard-nav";
import { isDeveloper, isStaff } from "@/lib/roles";

type Translator = (key: string) => string;

export function getDashboardNav(role: UserRole, t: Translator): NavItem[] {
  const overview: NavItem = {
    key: "overview",
    href: "/dashboard",
    label: t("overview"),
  };
  const notifications: NavItem = {
    key: "notifications",
    href: "/dashboard/notifications",
    label: t("notifications"),
  };
  const settings: NavItem = {
    key: "settings",
    href: "/dashboard/settings",
    label: t("settings"),
  };

  if (isStaff(role)) {
    const items: NavItem[] = [
      overview,
      { key: "properties", href: "/dashboard/properties", label: t("properties") },
      { key: "realtors", href: "/dashboard/realtors", label: t("realtors") },
      { key: "users", href: "/dashboard/users", label: t("users") },
      { key: "inquiries", href: "/dashboard/inquiries", label: t("inquiries") },
      { key: "closures", href: "/dashboard/closures", label: t("closures") },
    ];
    if (isDeveloper(role)) {
      items.splice(3, 0, {
        key: "admins",
        href: "/dashboard/admins",
        label: t("admins"),
      });
    }
    items.push(notifications, settings);
    return items;
  }

  if (role === UserRole.REALTOR) {
    return [
      overview,
      { key: "properties", href: "/dashboard/properties", label: t("properties") },
      { key: "inquiries", href: "/dashboard/inquiries", label: t("inquiries") },
      { key: "closures", href: "/dashboard/closures", label: t("closures") },
      notifications,
      settings,
    ];
  }

  // CLIENT
  return [
    overview,
    { key: "favorites", href: "/dashboard/favorites", label: t("favorites") },
    {
      key: "savedSearches",
      href: "/dashboard/saved-searches",
      label: t("savedSearches"),
    },
    notifications,
    settings,
  ];
}
