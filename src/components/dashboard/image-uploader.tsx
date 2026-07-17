"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type UploadedImage = {
  url: string;
  blobKey?: string;
  alt?: string;
};

export function ImageUploader({
  value,
  onChange,
  max = 20,
}: {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const remaining = max - value.length;
    if (remaining <= 0) {
      toast.error(`Máximo ${max} imágenes`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    setIsUploading(true);

    const uploaded: UploadedImage[] = [];
    for (const file of selected) {
      try {
        const result = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
        });
        uploaded.push({ url: result.url, blobKey: result.pathname });
      } catch (error) {
        toast.error(
          `No se pudo subir ${file.name}: ${(error as Error).message}`
        );
      }
    }

    setIsUploading(false);
    if (uploaded.length > 0) {
      onChange([...value, ...uploaded]);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((img, index) => (
          <div
            key={img.url}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
              index === 0 && "ring-2 ring-primary"
            )}
          >
            <Image
              src={img.url}
              alt={img.alt ?? `Imagen ${index + 1}`}
              fill
              sizes="200px"
              className="object-cover"
            />
            {index === 0 ? (
              <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                Portada
              </span>
            ) : null}
            <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
              {index !== 0 ? (
                <Button
                  type="button"
                  size="icon-xs"
                  variant="secondary"
                  onClick={() => makeCover(index)}
                  title="Marcar como portada"
                >
                  <Star className="size-3" />
                </Button>
              ) : (
                <span />
              )}
              <Button
                type="button"
                size="icon-xs"
                variant="destructive"
                onClick={() => removeAt(index)}
                title="Quitar"
              >
                <X className="size-3" />
              </Button>
            </div>
          </div>
        ))}

        {value.length < max ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <ImagePlus className="size-6" />
            )}
            <span className="text-xs">
              {isUploading ? "Subiendo..." : "Agregar"}
            </span>
          </button>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        {value.length}/{max} imágenes · La primera es la portada.
      </p>
    </div>
  );
}
