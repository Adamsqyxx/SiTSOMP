"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createClient } from "@/lib/supabase-client";
import { Crosshair, Layers, Minus, Plus } from "lucide-react";

// Pusat wilayah Kel. Tiro Sompe, Kec. Bacukiki Barat, Kota Parepare, Sulawesi Selatan.
const CENTER: [number, number] = [-4.0250427, 119.6291098];
const DEFAULT_ZOOM = 14;

export interface MapFeature {
  id: string;
  category: string;
  name: string;
  address: string;
  detail: string;
  latitude: number;
  longitude: number;
}

interface LeafletMapProps {
  onSelect?: (feature: MapFeature | null) => void;
  /** Fitur yang diminta fokus (mis. dari hasil pencarian) — peta di-zoom ke sini. */
  focusFeature?: MapFeature | null;
  /** Filter kategori aktif ("all" = tampil semua). */
  filterCategory?: string;
}

// Marker tunggal dengan styling Material 3 (pin primary).
function makeIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div class="flex items-center justify-center w-8 h-8 bg-primary text-on-primary rounded-full border-2 border-surface-container-lowest shadow-lg" style="transform:translate(-50%,-100%)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

export default function LeafletMap({
  onSelect,
  focusFeature,
  filterCategory = "all",
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);

  // Inisialisasi peta sekali.
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
      markersRef.current = [];
      boundaryLayerRef.current = null;
    };
  }, []);

  // Muat + render batas wilayah (highlight area kelurahan).
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    let active = true;

    async function loadBoundary() {
      try {
        const res = await fetch("/api/peta/batas");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!active || !mapInstance.current) return;

        if (boundaryLayerRef.current) {
          boundaryLayerRef.current.remove();
          boundaryLayerRef.current = null;
        }

        const fc = json.data as GeoJSON.FeatureCollection | undefined;
        if (!fc || !fc.features?.length) return;

        const current = mapInstance.current;
        if (!current) return;
        const layer = L.geoJSON(fc, {
          style: () => ({
            // Batas kelurahan: garis tegas tapi halus, isian tipis.
            color: "#0059a8",
            weight: 2.5,
            opacity: 0.8,
            fillColor: "#0059a8",
            fillOpacity: 0.04,
          }),
          onEachFeature: (feature, layer) => {
            const nama = feature?.properties?.nama as string | undefined;
            if (nama) {
              layer.bindTooltip(nama, { sticky: true, direction: "top" });
            }
          },
        }).addTo(current);

        boundaryLayerRef.current = layer;

        // Fit peta ke batas kelurahan sekali (agar highlight langsung terlihat).
        const b = layer.getBounds();
        if (b.isValid() && !current.getBounds().contains(b)) {
          current.fitBounds(b.pad(0.15));
        }
      } catch (err) {
        console.error("Gagal memuat batas wilayah:", err);
      }
    }

    loadBoundary();

    return () => {
      active = false;
    };
  }, []);

  // Muat + render marker dari data, hormati filter kategori, dan pasang Realtime.
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    let active = true;

    function renderFeatures(list: MapFeature[]) {
      if (!active || !mapInstance.current) return;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = list
        .filter((f) => filterCategory === "all" || f.category === filterCategory)
        .map((f) => {
          const marker = L.marker([f.latitude, f.longitude], { icon: makeIcon() })
            .addTo(mapInstance.current!)
            .on("click", () => onSelect?.(f));
          return marker;
        });
    }

    async function load() {
      try {
        const res = await fetch("/api/fasilitas");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        renderFeatures(json.data ?? []);
      } catch (err) {
        console.error("Gagal memuat fasilitas:", err);
      }
    }

    load();

    const supabase = createClient();
    const channel = supabase
      .channel("lokasi-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "lokasi" }, () => load())
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [onSelect, filterCategory]);

  // Fokus ke fitur hasil pencarian (zoom + buka popup info).
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !focusFeature) return;
    map.flyTo([focusFeature.latitude, focusFeature.longitude], Math.max(map.getZoom(), 16), {
      duration: 0.7,
    });
  }, [focusFeature]);

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