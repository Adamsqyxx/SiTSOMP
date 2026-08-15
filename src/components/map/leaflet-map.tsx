"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Layers, Minus, Plus } from "lucide-react";

// Pusat wilayah Kel. Tiro Sompe, Kec. Bacukiki Barat, Kota Parepare, Sulawesi Selatan.
const CENTER: [number, number] = [-4.0250427, 119.6291098];
const DEFAULT_ZOOM = 14;

export default function LeafletMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  const zoomIn = () => mapInstance.current?.zoomIn();
  const zoomOut = () => mapInstance.current?.zoomOut();
  const locate = () => mapInstance.current?.locate({ setView: true, maxZoom: 16 });

  return (
    <>
      <div ref={mapRef} className="absolute inset-0 z-0" aria-label="Peta interaktif wilayah Tiro Sompe" />

      {/* Floating map controls */}
      <div className="absolute top-6 right-6 z-[500] flex flex-col gap-2 shadow-sm">
        <button
          type="button"
          aria-label="Lapisan"
          className="w-10 h-10 bg-surface-container-lowest text-on-surface rounded-t-lg border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors"
        >
          <Layers aria-hidden="true" className="w-5 h-5" />
        </button>
        <button
          type="button"
          aria-label="Lokasi saya"
          onClick={locate}
          className="w-10 h-10 bg-surface-container-lowest text-on-surface border-x border-b border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors"
        >
          <Crosshair aria-hidden="true" className="w-5 h-5" />
        </button>
        <button
          type="button"
          aria-label="Perbesar"
          onClick={zoomIn}
          className="w-10 h-10 bg-surface-container-lowest text-on-surface border-x border-b border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors"
        >
          <Plus aria-hidden="true" className="w-5 h-5" />
        </button>
        <button
          type="button"
          aria-label="Perkecil"
          onClick={zoomOut}
          className="w-10 h-10 bg-surface-container-lowest text-on-surface border-x border-b border-outline-variant rounded-b-lg flex items-center justify-center hover:bg-surface-container-low transition-colors"
        >
          <Minus aria-hidden="true" className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}