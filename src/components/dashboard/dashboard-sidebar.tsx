"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DashboardNav, type NavItem } from "@/components/dashboard/dashboard-nav";
import { Badge } from "@/components/ui/badge";

export function DashboardSidebar({
  items,
  roleLabel,
}: {
  items: NavItem[];
  roleLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <Badge variant="secondary">{roleLabel}</Badge>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <DashboardNav items={items} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex h-14 items-center gap-2 border-b bg-background px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menú">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b">
              <SheetTitle asChild>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <Badge variant="secondary" className="mb-3">
                {roleLabel}
              </Badge>
              <DashboardNav items={items} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/">
          <Logo />
        </Link>
      </div>
    </>
  );
}
