"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import type { MapMarker } from "@/components/map/map-view";

function pinIcon(opportunity?: boolean) {
  const color = opportunity ? "#f59e0b" : "#2563eb";
  return L.divIcon({
    className: "optima-pin",
    html: `<svg width="28" height="40" viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 22 12 22s12-13.6 12-22C24 5.4 18.6 0 12 0z" fill="${color}"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -38],
  });
}

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [markers, map]);
  return null;
}

export default function LeafletMap({
  markers,
  zoom = 12,
}: {
  markers: MapMarker[];
  zoom?: number;
}) {
  const center: [number, number] =
    markers.length > 0
      ? [markers[0].lat, markers[0].lng]
      : [10.1833, -64.6833]; // Lechería, Venezuela

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={pinIcon(m.isOpportunityPrice)}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold text-primary">
                {formatPrice(m.price, m.currency)}
              </p>
              <p className="max-w-[180px] text-sm">{m.title}</p>
              <Link
                href={`/properties/${m.slug}`}
                className="text-sm font-medium text-primary underline"
              >
                Ver detalle
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      <FitBounds markers={markers} />
    </MapContainer>
  );
}
