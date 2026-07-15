"use client";
import Icon from "@/components/Icon";
import { use, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import DriverAvatar from "@/components/DriverAvatar";
import { RIDES, segmentPrice } from "@/lib/data";
import "leaflet/dist/leaflet.css";

// SSR disabled — Leaflet needs window
const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

function RideDetail({ id }: { id: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const ride = RIDES.find(r => r.id === id);

  if (!ride) return (
    <div className="min-h-screen bg-[#F5F5FF]"><Navbar /><div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-400">Ride not found</div></div>
  );

  const from  = params.get("from") || ride.waypoints[0].city;
  const to    = params.get("to")   || ride.waypoints[ride.waypoints.length - 1].city;
  const date  = params.get("date") || ride.date;
  const seats = params.get("seats") || "1";

  const pickup  = ride.waypoints.find(w => w.city.toLowerCase() === from.toLowerCase());
  const dropoff = ride.waypoints.find(w => w.city.toLowerCase() === to.toLowerCase());
  const price   = segmentPrice(ride, from, to);

  // via stops between from and to
  const cities = ride.waypoints.map(w => w.city.toLowerCase());
  const fi = cities.indexOf(from.toLowerCase());
  const ti = cities.indexOf(to.toLowerCase());
  const via = ride.waypoints.slice(fi + 1, ti);

  return (
    <div className="min-h-screen bg-[#F5F5FF]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/results?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&seats=${seats}`}
          className="text-sm text-slate-400 hover:text-slate-700 font-medium mb-6 inline-flex items-center gap-1"
        >
          <Icon name="arrow-back-outline" style={{ fontSize: "16px" }} />
          Results
        </Link>

        {/* Real map */}
        <div className="rounded-3xl overflow-hidden border border-indigo-100 mb-6" style={{ height: "320px" }}>
          <RouteMap waypoints={ride.waypoints} fromCity={from} toCity={to} />
        </div>

        {/* Route stops */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden">
          {/* Pickup */}
          <div className="flex items-start gap-4 px-5 py-4 border-b border-slate-50">
            <Icon name="ellipse" style={{ fontSize: "16px", color: "#22C55E", marginTop: "2px", flexShrink: 0 }} />
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 tabular-nums">{ride.departureTime} · {from}</p>
              <p className="text-xs text-slate-400 mt-0.5">{pickup?.detail}</p>
            </div>
          </div>
          {/* Via stops */}
          {via.map(w => (
            <div key={w.city} className="flex items-start gap-4 px-5 py-3 border-b border-slate-50 bg-slate-50/50">
              <Icon name="ellipse" style={{ fontSize: "12px", color: "#4338CA", marginTop: "3px", flexShrink: 0, marginLeft: "2px" }} />
              <div>
                <p className="text-xs font-semibold text-slate-600">{w.city}</p>
                {w.detail && <p className="text-xs text-slate-400 mt-0.5">{w.detail}</p>}
              </div>
            </div>
          ))}
          {/* Dropoff */}
          <div className="flex items-start gap-4 px-5 py-4">
            <Icon name="ellipse" style={{ fontSize: "16px", color: "#EF4444", marginTop: "2px", flexShrink: 0 }} />
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 tabular-nums">{ride.arrivalTime} · {to}</p>
              <p className="text-xs text-slate-400 mt-0.5">{dropoff?.detail}</p>
            </div>
          </div>
        </div>

        {/* Driver */}
        <Link href={`/driver/${ride.driverId}`} className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 p-5 flex items-center gap-4 hover:border-indigo-200 transition-colors block">
          <DriverAvatar name={ride.driver.name} size={56} />
          <div className="flex-1">
            <p className="text-base font-bold text-slate-900">{ride.driver.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{ride.car} · {ride.carColor} · {ride.carYear}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-indigo-700 flex items-center gap-0.5 justify-end">
              <Icon name="star" style={{ fontSize: "13px" }} />
              {ride.driver.rating}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{ride.driver.trips} trips</p>
            <p className="text-[10px] text-indigo-600 mt-1 font-semibold">View profile →</p>
          </div>
        </Link>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { icon: "people-outline",   label: `${ride.seats} seats left` },
            { icon: "calendar-outline", label: date },
            { icon: "car-outline",      label: ride.car },
          ].map(chip => (
            <span key={chip.label} className="text-xs bg-white border border-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-1.5">
              <Icon name={chip.icon} style={{ fontSize: "13px", color: "#4338CA" }} />
              {chip.label}
            </span>
          ))}
        </div>

        {/* Book bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Price per seat</p>
            <p className="text-3xl font-bold text-amber-600 tabular-nums mt-1">&#x20BC;{price}</p>
          </div>
          <button
            onClick={() => router.push(`/booking/${ride.id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&seats=${seats}`)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-4 rounded-2xl text-sm transition-colors"
          >
            Book Seat
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
          <Icon name="shield-checkmark-outline" style={{ fontSize: "14px", color: "#22C55E" }} />
          Free cancellation up to 1h before departure
        </p>
      </div>
    </div>
  );
}

export default function RidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense><RideDetail id={id} /></Suspense>;
}
