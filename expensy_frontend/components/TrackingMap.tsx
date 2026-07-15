"use client";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { Waypoint } from "@/lib/data";

function makeCarIcon(heading: number) {
  return L.divIcon({
    className: "",
    html: `<div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;transform:rotate(${heading}deg);transition:transform 0.4s ease;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.35));font-size:30px;line-height:1;">🚗</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

const pinIcon = (color: string) => L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const startPin = pinIcon("#22C55E");
const endPin   = pinIcon("#EF4444");

function PanTo({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.panTo(pos, { animate: true, duration: 1 }); }, [pos]);
  return null;
}

function bearing(a: [number, number], b: [number, number]): number {
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dLng) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360;
}

type Props = { waypoints: Waypoint[]; progress: number };

export default function TrackingMap({ waypoints, progress }: Props) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  useEffect(() => {
    const coords = waypoints.map(w => `${w.lng},${w.lat}`).join(";");
    fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(d => setRouteCoords(
        (d.routes[0].geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng])
      ))
      .catch(() => setRouteCoords(waypoints.map(w => [w.lat, w.lng])));
  }, []);

  const carIdx = Math.min(Math.floor(progress * (routeCoords.length - 1)), routeCoords.length - 2);
  const carFrac = (progress * (routeCoords.length - 1)) - carIdx;

  const carPos: [number, number] = routeCoords.length < 2
    ? [waypoints[0].lat, waypoints[0].lng]
    : (() => {
        const [lat1, lng1] = routeCoords[carIdx];
        const [lat2, lng2] = routeCoords[carIdx + 1];
        return [lat1 + (lat2 - lat1) * carFrac, lng1 + (lng2 - lng1) * carFrac];
      })();

  // heading: angle toward next point
  const heading = routeCoords.length >= 2
    ? bearing(routeCoords[Math.max(carIdx, 0)], routeCoords[Math.min(carIdx + 1, routeCoords.length - 1)])
    : 0;

  const splitAt = Math.floor(progress * routeCoords.length) + 1;
  const traveled  = routeCoords.slice(0, splitAt);
  const remaining = routeCoords.slice(splitAt - 1);
  const center: [number, number] = [waypoints[0].lat, waypoints[0].lng];

  return (
    <MapContainer center={center} zoom={8} style={{ width: "100%", height: "100%" }} zoomControl={false} attributionControl={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <PanTo pos={carPos} />

      {traveled.length > 1 && <Polyline positions={traveled} pathOptions={{ color: "#4338CA", weight: 5, opacity: 0.9 }} />}
      {remaining.length > 1 && <Polyline positions={remaining} pathOptions={{ color: "#94A3B8", weight: 3, opacity: 0.5, dashArray: "8 6" }} />}

      <Marker position={[waypoints[0].lat, waypoints[0].lng]} icon={startPin}>
        <Popup><div style={{ fontSize: "12px", fontWeight: 600 }}>{waypoints[0].city}</div></Popup>
      </Marker>
      <Marker position={[waypoints[waypoints.length - 1].lat, waypoints[waypoints.length - 1].lng]} icon={endPin}>
        <Popup><div style={{ fontSize: "12px", fontWeight: 600 }}>{waypoints[waypoints.length - 1].city}</div></Popup>
      </Marker>

      <Marker position={carPos} icon={makeCarIcon(heading)} zIndexOffset={1000} />
    </MapContainer>
  );
}
