"use client";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const BAKU: [number, number] = [40.4093, 49.8671];

const KNOWN_CITIES: Record<string, string> = {
  baku: "Baku", bakı: "Baku", "baku city": "Baku",
  sumqayit: "Sumqayit", sumgait: "Sumqayit", sumgayit: "Sumqayit",
  ganja: "Ganja", gäncä: "Ganja", gence: "Ganja",
  sheki: "Sheki", şəki: "Sheki", shaki: "Sheki",
  lankaran: "Lankaran", lənkəran: "Lankaran",
  mingachevir: "Mingachevir", mingəçevir: "Mingachevir",
};

function resolveCity(raw: string): string {
  const lower = raw.toLowerCase();
  for (const [key, canonical] of Object.entries(KNOWN_CITIES)) {
    if (lower.includes(key)) return canonical;
  }
  return raw;
}

function CenterTracker({ onMove, onMoving }: { onMove: (lat: number, lng: number) => void; onMoving: (v: boolean) => void }) {
  useMapEvents({
    movestart() { onMoving(true); },
    moveend(e)  { onMoving(false); const c = e.target.getCenter(); onMove(c.lat, c.lng); },
  });
  return null;
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 15, { duration: 1.2 });
  }, [target]);
  return null;
}

type Props = {
  label: string;
  onConfirm: (city: string) => void;
  onClose: () => void;
};

export default function PinPicker({ label, onConfirm, onClose }: Props) {
  const [lat, setLat] = useState(BAKU[0]);
  const [lng, setLng] = useState(BAKU[1]);
  const [place, setPlace] = useState("Baku");
  const [loading, setLoading] = useState(false);
  const [moving, setMoving] = useState(false);
  const [query, setQuery] = useState("");
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // reverse geocode when map stops
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`)
        .then(r => r.json())
        .then(d => {
          if (cancelled) return;
          const a = d.address || {};
          const raw = a.city || a.town || a.village || a.county || a.state || "Unknown";
          setPlace(resolveCity(raw));
        })
        .catch(() => { if (!cancelled) setPlace("Unknown location"); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [lat, lng]);

  // fly to user location on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setFlyTarget([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  function searchAddress() {
    if (!query.trim()) return;
    setSearching(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=en`)
      .then(r => r.json())
      .then(results => {
        if (results[0]) setFlyTarget([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
      })
      .finally(() => setSearching(false));
  }

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors w-8 flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="text-sm font-bold text-slate-900 truncate">{loading ? "Locating…" : place}</p>
        </div>
        <button
          onClick={() => onConfirm(place)}
          disabled={loading || place === "Unknown location"}
          className="bg-indigo-700 hover:bg-indigo-800 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex-shrink-0"
        >
          Confirm
        </button>
      </div>

      {/* Address search bar */}
      <div className="bg-white px-4 py-2 border-b border-slate-50 flex gap-2">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 px-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-sm text-slate-900 outline-none py-2.5 placeholder:text-slate-400"
            placeholder="Search address or place…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchAddress()}
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-300 hover:text-slate-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={searchAddress}
          disabled={!query.trim() || searching}
          className="bg-indigo-700 hover:bg-indigo-800 disabled:opacity-40 text-white text-xs font-bold px-4 rounded-xl transition-colors flex-shrink-0"
        >
          {searching ? "…" : "Go"}
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={BAKU}
          zoom={11}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <CenterTracker onMove={(la, ln) => { setLat(la); setLng(ln); }} onMoving={setMoving} />
          <FlyTo target={flyTarget} />
        </MapContainer>

        {/* Fixed center pin */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
          <div
            className="flex flex-col items-center"
            style={{
              marginTop: "-28px",
              transform: moving ? "translateY(-10px)" : "translateY(0)",
              transition: "transform 0.15s ease",
            }}
          >
            <div
              className="w-8 h-8 rounded-full bg-indigo-700 border-4 border-white flex items-center justify-center"
              style={{
                boxShadow: moving ? "none" : "0 4px 16px rgba(37,99,235,0.5)",
                transition: "box-shadow 0.15s ease",
              }}
            >
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <div className="w-0.5 h-5 bg-indigo-700 rounded-full" />
            <div
              className="bg-black/20 rounded-full mt-0.5"
              style={{ width: moving ? "6px" : "12px", height: "4px", transition: "width 0.15s ease" }}
            />
          </div>
        </div>

        {/* Hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-slate-100 pointer-events-none">
          <p className="text-xs font-semibold text-slate-600 text-center">Move map to place pin</p>
        </div>
      </div>
    </div>
  );
}
