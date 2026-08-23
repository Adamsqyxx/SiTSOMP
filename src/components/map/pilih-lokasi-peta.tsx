"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Peta pemilih titik lokasi pengaduan — khusus wilayah Kel. Tiro Sompe.
// Klik di dalam batas kelurahan menaruh pin; klik di luar ditolak.
const CENTER: [number, number] = [-4.0250427, 119.6291098];
const DEFAULT_ZOOM = 15;

export interface PilihLokasiPetaProps {
  value: { lat: number; lng: number } | null;
  onChange: (koordinat: { lat: number; lng: number } | null) => void;
  /** Dipanggil saat klik di luar batas kelurahan. */
  onLuarBatas?: () => void;
}

interface BatasState {
  layer: L.GeoJSON | null;
  bounds: L.LatLngBounds | null;
}

function pinIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div class="flex items-center justify-center w-8 h-8 bg-primary text-on-primary rounded-full border-2 border-surface-container-lowest shadow-lg" style="transform:translate(-50%,-100%)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

export default function PilihLokasiPeta({ value, onChange, onLuarBatas }: PilihLokasiPetaProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const batasRef = useRef<BatasState>({ layer: null, bounds: null });
  type KoordinatCb = (koordinat: { lat: number; lng: number } | null) => void;
  const cbRef = useRef<{ onChange: KoordinatCb; onLuarBatas: () => void }>({
    onChange: () => {},
    onLuarBatas: () => {},
  });

  const [batasTermuat, setBatasTermuat] = useState(false);

  // Simpan callback terbaru tanpa re-subscribe event peta.
  useEffect(() => {
    cbRef.current = {
      onChange: onChange ?? (() => {}),
      onLuarBatas: onLuarBatas ?? (() => {}),
    };
  }, [onChange, onLuarBatas]);

  // Init peta + batas + handler klik.
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    mapInstance.current = map;

    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/peta/batas");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!active || !mapInstance.current) return;
        const fc = json.data as GeoJSON.FeatureCollection | undefined;
        if (!fc?.features?.length) {
          setBatasTermuat(true); // tetap bisa dipakai walau batas gagal dimuat
          return;
        }
        const layer = L.geoJSON(fc, {
          style: () => ({
            color: "#0059a8",
            weight: 2.5,
            opacity: 0.8,
            fillColor: "#0059a8",
            fillOpacity: 0.06,
          }),
          interactive: false,
        }).addTo(mapInstance.current!);
        const b = layer.getBounds();
        batasRef.current = { layer, bounds: b.isValid() ? b : null };
        if (b.isValid()) map.fitBounds(b.pad(0.1));
        setBatasTermuat(true);
      } catch {
        setBatasTermuat(true);
      }
    })();

    function dalamBatas(latlng: L.LatLng): boolean {
      const bounds = batasRef.current.bounds;
      if (!bounds) return true; // batas gagal dimuat — jangan blokir warga
      return bounds.contains(latlng);
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      if (!dalamBatas(e.latlng)) {
        cbRef.current.onLuarBatas?.();
        return;
      }
      markerRef.current?.remove();
      markerRef.current = L.marker(e.latlng, { icon: pinIcon() })
        .addTo(map)
        .bindTooltip("Titik lokasi kejadian", { direction: "top", offset: [0, -32] });
      cbRef.current.onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      active = false;
      map.remove();
      mapInstance.current = null;
      markerRef.current = null;
      batasRef.current = { layer: null, bounds: null };
    };
  }, []);

  // Sinkron marker dari luar (mis. pilihan dropdown RT/RW).
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    const latlng = L.latLng(value.lat, value.lng);
    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.marker(latlng, { icon: pinIcon() })
        .addTo(map)
        .bindTooltip("Titik lokasi kejadian", { direction: "top", offset: [0, -32] });
    }
    map.panTo(latlng);
  }, [value]);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-[280px] md:h-[320px] rounded-lg border border-outline-variant z-0" />
      {!batasTermuat && (
        <p className="font-label-sm text-label-sm text-outline mt-1">Memuat batas wilayah…</p>
      )}
    </div>
  );
}
