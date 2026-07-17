"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type GalleryImage = { id: string; url: string; alt: string | null };

export function PropertyGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border bg-muted text-muted-foreground">
        <ImageOff className="size-10" />
      </div>
    );
  }

  const go = (dir: number) =>
    setActive((prev) => (prev + dir + images.length) % images.length);

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="relative block aspect-video w-full overflow-hidden rounded-xl border bg-muted"
        >
          <Image
            src={images[active].url}
            alt={images[active].alt ?? title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
          />
        </button>

        {images.length > 1 ? (
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md border bg-muted",
                  i === active && "ring-2 ring-primary"
                )}
              >
                <Image
                  src={img.url}
                  alt={img.alt ?? `${title} ${i + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent
          showCloseButton
          className="max-w-5xl border-0 bg-transparent p-0 shadow-none"
        >
          <div className="relative aspect-video w-full">
            <Image
              src={images[active].url}
              alt={images[active].alt ?? title}
              fill
              sizes="90vw"
              className="rounded-lg object-contain"
            />
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
