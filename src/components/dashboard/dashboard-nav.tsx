"use client";

import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  MessageSquare,
  Heart,
  Bell,
  Settings,
  Handshake,
  Bookmark,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  properties: Building2,
  users: Users,
  realtors: UserCheck,
  inquiries: MessageSquare,
  favorites: Heart,
  savedSearches: Bookmark,
  notifications: Bell,
  closures: Handshake,
  settings: Settings,
};

export type NavItem = { key: string; href: string; label: string };

export function DashboardNav({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.key] ?? LayoutDashboard;
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
