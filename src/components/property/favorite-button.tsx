"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { toggleFavorite } from "@/lib/actions/favorite";
import { Button } from "@/components/ui/button";

export function FavoriteButton({
  propertyId,
  initialFavorite = false,
  isAuthenticated,
  variant = "overlay",
}: {
  propertyId: string;
  initialFavorite?: boolean;
  isAuthenticated: boolean;
  variant?: "overlay" | "full";
}) {
  const t = useTranslations("Property");
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorite);
  const [isPending, startTransition] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // optimistic
    setFavorited((v) => !v);
    startTransition(async () => {
      const res = await toggleFavorite(propertyId);
      if (!res.success) {
        setFavorited((v) => !v); // revert
        if (res.error === "auth") router.push("/login");
        else toast.error(res.error);
        return;
      }
      setFavorited(res.favorited);
    });
  }

  if (variant === "full") {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onClick}
        disabled={isPending}
      >
        <Heart
          className={cn("size-4", favorited && "fill-red-500 text-red-500")}
        />
        {favorited ? t("removeFavorite") : t("addFavorite")}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-label={favorited ? t("removeFavorite") : t("addFavorite")}
      className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
    >
      <Heart
        className={cn("size-5", favorited && "fill-red-500 text-red-500")}
      />
    </button>
  );
}
