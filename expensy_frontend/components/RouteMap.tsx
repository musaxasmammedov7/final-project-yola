"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Waypoint } from "@/lib/data";

const makeIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);">
    </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const startIcon = makeIcon("#22C55E");
const endIcon   = makeIcon("#EF4444");
const viaIcon   = makeIcon("#2563EB");

function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length < 2) return;
    map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
  }, [map, coords]);
  return null;
}

async function fetchOsrmRoute(waypoints: Waypoint[]): Promise<[number, number][]> {
  // OSRM public demo server — no API key needed
  const coords = waypoints.map(w => `${w.lng},${w.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("OSRM fetch failed");
  const data = await res.json();
  // GeoJSON coords are [lng, lat], Leaflet wants [lat, lng]
  return (data.routes[0].geometry.coordinates as [number, number][]).map(
    ([lng, lat]) => [lat, lng]
  );
}

type Props = {
  waypoints: Waypoint[];
  fromCity: string;
  toCity: string;
};

export default function RouteMap({ waypoints, fromCity, toCity }: Props) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);

  // Only show waypoints between from and to (inclusive)
  const cities = waypoints.map(w => w.city.toLowerCase());
  const fi = cities.indexOf(fromCity.toLowerCase());
  const ti = cities.indexOf(toCity.toLowerCase());
  const segment = fi !== -1 && ti !== -1 ? waypoints.slice(fi, ti + 1) : waypoints;

  useEffect(() => {
    fetchOsrmRoute(segment)
      .then(setRouteCoords)
      .catch(() => {
        // fallback to straight line if OSRM fails
        setRouteCoords(segment.map(w => [w.lat, w.lng]));
      })
      .finally(() => setLoading(false));
  }, [fromCity, toCity]);

  const center: [number, number] = [segment[0]?.lat ?? 40.4, segment[0]?.lng ?? 49.8];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 1000,
          background: "#EFF6FF", display: "flex",
          alignItems: "center", justifyContent: "center",
          borderRadius: "inherit",
        }}>
          <span style={{ fontSize: "13px", color: "#2563EB", fontWeight: 600 }}>Loading map…</span>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={7}
        style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {routeCoords.length > 1 && (
          <>
            <FitBounds coords={routeCoords} />
            {/* Road shadow */}
            <Polyline
              positions={routeCoords}
              pathOptions={{ color: "#1d4ed8", weight: 7, opacity: 0.15 }}
            />
            {/* Road line */}
            <Polyline
              positions={routeCoords}
              pathOptions={{ color: "#2563EB", weight: 4, opacity: 0.9 }}
            />
          </>
        )}

        {/* Waypoint markers */}
        {segment.map((w, i) => {
          const icon = i === 0 ? startIcon : i === segment.length - 1 ? endIcon : viaIcon;
          return (
            <Marker key={w.city} position={[w.lat, w.lng]} icon={icon}>
              <Popup>
                <div style={{ fontWeight: 600, fontSize: "12px" }}>{w.city}</div>
                {w.detail && <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{w.detail}</div>}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
