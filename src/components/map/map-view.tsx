"use client";

import dynamic from "next/dynamic";
import { MapPinned } from "lucide-react";

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

// Leaflet touches `window`, so load it client-side only.
const LeafletMap = dynamic(() => import("@/components/map/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground">
      <MapPinned className="size-8 animate-pulse" />
    </div>
  ),
});

export function MapView({
  markers,
  zoom = 12,
  className = "h-[60vh] w-full",
}: {
  markers: MapMarker[];
  zoom?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-xl border ${className}`}>
      <LeafletMap markers={markers} zoom={zoom} />
    </div>
  );
}
