"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map, Marker } from "leaflet";
import { Search } from "lucide-react";
import { searchAreas } from "@/lib/api/location.api";
import { MAP_DEFAULT_CENTER, DISTRICT_MAP_CENTERS } from "@/types/location.types";
import type { ApiAreaSearchResult } from "@/types/location.types";
import "leaflet/dist/leaflet.css";

interface DeliveryMapPickerProps {
  lat: number | null;
  lng: number | null;
  countryId?: string;
  districtId?: string;
  districtName?: string;
  onPick: (lat: number, lng: number) => void;
}

export default function DeliveryMapPicker({
  lat,
  lng,
  countryId,
  districtId,
  districtName,
  onPick,
}: DeliveryMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onPickRef = useRef(onPick);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const mapReadyRef = useRef(false);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const pendingPosRef = useRef<{ lat: number; lng: number; zoom: number } | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiAreaSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [openResults, setOpenResults] = useState(false);

  onPickRef.current = onPick;

  const canSearch = !!(districtId || countryId);

  const syncPosition = useCallback((pickedLat: number, pickedLng: number, zoom = 15) => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !mapReadyRef.current) {
      pendingPosRef.current = { lat: pickedLat, lng: pickedLng, zoom };
      return;
    }

    pendingPosRef.current = null;
    const pos: [number, number] = [pickedLat, pickedLng];

    try {
      if (markerRef.current) {
        markerRef.current.setLatLng(pos);
      } else {
        markerRef.current = L.marker(pos).addTo(map);
      }
      map.setView(pos, zoom, { animate: false });
    } catch {
      pendingPosRef.current = { lat: pickedLat, lng: pickedLng, zoom };
    }
  }, []);

  const flushPendingPosition = useCallback(() => {
    const pending = pendingPosRef.current;
    if (pending) syncPosition(pending.lat, pending.lng, pending.zoom);
  }, [syncPosition]);

  useEffect(() => {
    let cancelled = false;
    mapReadyRef.current = false;
    pendingPosRef.current = null;

    void import("leaflet").then((leaflet) => {
      if (cancelled || !containerRef.current) return;

      leafletRef.current = leaflet;

      if (mapRef.current) {
        markerRef.current?.remove();
        markerRef.current = null;
        mapRef.current.remove();
        mapRef.current = null;
      }

      const center =
        districtId && DISTRICT_MAP_CENTERS[districtId]
          ? DISTRICT_MAP_CENTERS[districtId]
          : { ...MAP_DEFAULT_CENTER, zoom: 11 };
      const map = leaflet.map(containerRef.current, { preferCanvas: true }).setView(
        [center.lat, center.lng],
        center.zoom
      );

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        })
        .addTo(map);

      map.on("click", (e) => {
        const { lat: pickedLat, lng: pickedLng } = e.latlng;
        syncPosition(pickedLat, pickedLng, 15);
        onPickRef.current(pickedLat, pickedLng);
      });

      mapRef.current = map;

      map.whenReady(() => {
        if (cancelled || mapRef.current !== map) return;
        requestAnimationFrame(() => {
          if (cancelled || mapRef.current !== map) return;
          map.invalidateSize();
          mapReadyRef.current = true;
          flushPendingPosition();
        });
      });
    });

    return () => {
      cancelled = true;
      mapReadyRef.current = false;
      pendingPosRef.current = null;
      leafletRef.current = null;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [districtId, flushPendingPosition, syncPosition]);

  useEffect(() => {
    if (lat == null || lng == null) return;
    syncPosition(lat, lng, 14);
  }, [lat, lng, syncPosition]);

  useEffect(() => {
    const term = query.trim();
    if (!canSearch || term.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = window.setTimeout(() => {
      void searchAreas({
        ...(countryId ? { countryId } : districtId ? { districtId } : {}),
        q: term,
      })
        .then((areas) => {
          setResults(areas);
          setOpenResults(true);
        })
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [canSearch, countryId, districtId, query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setOpenResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (area: ApiAreaSearchResult) => {
    setQuery(area.districtName ? `${area.name}, ${area.districtName}` : area.name);
    setOpenResults(false);
    syncPosition(area.lat, area.lng, 15);
    onPick(area.lat, area.lng);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) handleSelectResult(results[0]);
  };

  return (
    <div className="flex flex-col gap-2">
      {canSearch ? (
        <div ref={searchWrapRef} className="relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenResults(true);
              }}
              onFocus={() => results.length > 0 && setOpenResults(true)}
              placeholder={
                districtName
                  ? `Search area in ${districtName}...`
                  : "Search deliverable area..."
              }
              className="w-full rounded-xl border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-primary outline-none focus:border-accent"
            />
          </form>
          {openResults && query.trim().length >= 2 ? (
            <div className="absolute z-[1000] mt-1 max-h-44 w-full overflow-y-auto rounded-xl border border-border bg-white shadow-lg">
              {searching ? (
                <p className="px-3 py-2.5 text-sm text-muted">Searching...</p>
              ) : results.length === 0 ? (
                <p className="px-3 py-2.5 text-sm text-muted">No areas found</p>
              ) : (
                results.map((area) => (
                  <button
                    key={area._id}
                    type="button"
                    onClick={() => handleSelectResult(area)}
                    className="flex w-full px-3 py-2.5 text-left text-sm text-primary hover:bg-gray-50"
                  >
                    {area.districtName ? `${area.name}, ${area.districtName}` : area.name}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="h-64 w-full overflow-hidden rounded-xl border border-border sm:h-72"
      />
    </div>
  );
}
