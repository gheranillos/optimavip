"use client";

import { useState } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { MapPinned } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";

export type MapMarker = {
  id: string;
  slug: string;
  title: string;
  lat: number;
  lng: number;
  price: number;
  currency: string;
  isOpportunityPrice?: boolean;
};

export function MapView({
  markers,
  zoom = 12,
  className = "h-[60vh] w-full",
}: {
  markers: MapMarker[];
  zoom?: number;
  className?: string;
}) {
  const t = useTranslations("Nav");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selected, setSelected] = useState<MapMarker | null>(null);

  const center =
    markers.length > 0
      ? { lat: markers[0].lat, lng: markers[0].lng }
      : { lat: 10.1833, lng: -64.6833 }; // Lechería, Venezuela

  if (!apiKey) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border bg-muted/40 text-center text-muted-foreground ${className}`}
      >
        <MapPinned className="size-8" />
        <p className="max-w-xs text-sm">
          {t("map")} — Google Maps API key no configurada
          (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border ${className}`}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
        >
          {markers.map((m) => (
            <Marker
              key={m.id}
              position={{ lat: m.lat, lng: m.lng }}
              onClick={() => setSelected(m)}
            />
          ))}

          {selected ? (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div className="space-y-1 p-1">
                <p className="font-semibold text-primary">
                  {formatPrice(selected.price, selected.currency)}
                </p>
                <p className="max-w-[180px] text-sm text-foreground">
                  {selected.title}
                </p>
                <Link
                  href={`/properties/${selected.slug}`}
                  className="text-sm font-medium text-primary underline"
                >
                  Ver detalle
                </Link>
              </div>
            </InfoWindow>
          ) : null}
        </Map>
      </APIProvider>
    </div>
  );
}
