import { cn } from "@/lib/utils";

/**
 * OPTIMA VIP wordmark. "OPTIMA" in brand blue, "VIP" in a silver pill.
 * No closed visual identity yet — this is a clean, modern placeholder mark.
 */
export function Logo({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <div className={cn("flex flex-col leading-none", className)}>
      <span className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
        <span className="text-primary">OPTIMA</span>
        <span className="rounded-md bg-gradient-to-br from-slate-400 to-slate-600 px-1.5 py-0.5 text-xs font-extrabold text-white shadow-sm">
          VIP
        </span>
      </span>
      {showTagline ? (
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Bienes Raíces
        </span>
      ) : null}
    </div>
  );
}
