"use client";
import Icon from "@/components/Icon";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import DriverAvatar from "@/components/DriverAvatar";
import { searchRides, type ApiRide } from "@/lib/api";
import { DRIVER_PROFILES } from "@/lib/data";

const PROVERBS = [
  { az: "Hər şeyin bir vaxtı var",    en: "Everything has its time" },
  { az: "Yol yoldaşı can yoldaşıdır", en: "A travel companion is a soul companion" },
  { az: "Səfər insanı kamilləşdirir", en: "Travel perfects a person" },
  { az: "Yolun başlanğıcı yarısıdır", en: "Starting the journey is half the journey" },
];

function driverIdByName(name: string) {
  return DRIVER_PROFILES.find(d => d.name === name)?.id ?? "d1";
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-skeleton">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200" />
          <div>
            <div className="w-24 h-3.5 bg-slate-200 rounded mb-2" />
            <div className="w-16 h-2.5 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="w-10 h-6 bg-slate-200 rounded" />
      </div>
      <div className="h-2 bg-slate-100 rounded mb-3" />
      <div className="h-2 bg-slate-100 rounded w-3/4" />
    </div>
  );
}

function Results() {
  const params = useSearchParams();
  const router = useRouter();
  const [proverb] = useState(() => PROVERBS[Math.floor(Math.random() * PROVERBS.length)]);
  const from  = params.get("from") || "";
  const to    = params.get("to") || "";
  const date  = params.get("date") || "";
  const seats = Number(params.get("seats") || 1);

  const [sort, setSort]       = useState<"price" | "time" | "rating">("price");
  const [maxPrice, setMaxPrice] = useState(20);
  const [rides, setRides]     = useState<ApiRide[]>([]);
  const [loading, setLoading] = useState(() => !!(from && to));
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to) return;
    searchRides(from, to, date, seats)
      .then(r => { setRides(r); setLoading(false); })
      .catch(() => { setError("Could not load rides. Check your connection."); setLoading(false); });
  }, [from, to, date, seats]);

  const filtered = rides
    .filter(r => (r.segmentPrice ?? r.price) <= maxPrice)
    .sort((a, b) => {
      if (sort === "price")  return (a.segmentPrice ?? a.price) - (b.segmentPrice ?? b.price);
      if (sort === "rating") return b.driverRating - a.driverRating;
      return a.departureTime.localeCompare(b.departureTime);
    });

  const getPickup  = (r: ApiRide) => r.waypoints.find(w => w.city.toLowerCase() === from.toLowerCase());
  const getDropoff = (r: ApiRide) => r.waypoints.find(w => w.city.toLowerCase() === to.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F5F5FF]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-up">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{from} → {to}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {date} · {seats} seat{seats > 1 ? "s" : ""} · {loading ? "…" : `${filtered.length} ride${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sort by</p>
            <div className="flex gap-2">
              {(["price", "time", "rating"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                    sort === s ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Max price</p>
            <input type="range" min={1} max={20} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="flex-1 accent-indigo-700" />
            <span className="text-sm font-bold text-amber-600 w-8 text-right">&#x20BC;{maxPrice}</span>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-slate-400">
            <Icon name="cloud-offline-outline" style={{ fontSize: "48px", color: "#CBD5E1", display: "block", margin: "0 auto 12px" }} />
            <p className="text-sm font-medium text-slate-500">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 animate-fade-up">
            <Icon name="car-outline" style={{ fontSize: "48px", color: "#CBD5E1", display: "block", margin: "0 auto 16px" }} />
            <div className="mb-1">
              <p className="font-semibold text-slate-600 text-base italic">{'\u201C'}{proverb.az}{'\u201D'}</p>
              <p className="text-xs text-slate-400 mt-0.5">{proverb.en}</p>
            </div>
            <p className="text-sm text-slate-400 mt-4">Try a different date or adjust the price filter</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map((ride, idx) => {
              const pickup  = getPickup(ride);
              const dropoff = getDropoff(ride);
              const price   = ride.segmentPrice ?? ride.price;
              const cities  = ride.waypoints.map(w => w.city.toLowerCase());
              const fi = cities.indexOf(from.toLowerCase());
              const ti = cities.indexOf(to.toLowerCase());
              const via = ride.waypoints.slice(fi + 1, ti).map(w => w.city);
              const driverId = driverIdByName(ride.driverName);

              return (
                <div
                  key={ride._id}
                  onClick={() => router.push(`/ride/${ride._id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&seats=${seats}`)}
                  className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer animate-fade-up stagger-${Math.min(idx + 1, 6)}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <Link
                      href={`/driver/${driverId}`}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-3 group"
                    >
                      <DriverAvatar name={ride.driverName} size={40} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{ride.driverName}</p>
                        <p className="text-xs text-indigo-700 font-semibold mt-0.5 flex items-center gap-0.5">
                          <Icon name="star" style={{ fontSize: "11px" }} />
                          {ride.driverRating} · {ride.driverTrips} trips
                        </p>
                      </div>
                    </Link>
                    <div className="text-right">
                      <p className="text-xl font-bold text-amber-600">&#x20BC;{price}</p>
                      <p className="text-xs text-slate-400 font-medium">per seat</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-right w-12">
                      <p className="text-sm font-bold text-slate-900 tabular-nums">{ride.departureTime}</p>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                      <div className="flex-1 h-px bg-slate-200 relative">
                        {via.length > 0 && (
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] bg-indigo-50 text-indigo-600 px-1.5 rounded font-semibold whitespace-nowrap">
                            via {via.join(", ")}
                          </span>
                        )}
                      </div>
                      <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></div>
                    </div>
                    <div className="w-12">
                      <p className="text-sm font-bold text-slate-900 tabular-nums">{ride.arrivalTime}</p>
                    </div>
                  </div>

                  {(pickup?.detail || dropoff?.detail) && (
                    <div className="flex justify-between text-xs text-slate-400 mb-3">
                      <span>{pickup?.detail}</span>
                      <span>{dropoff?.detail}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                        <Icon name="car-outline" style={{ fontSize: "12px" }} />
                        {ride.car}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-lg font-semibold flex items-center gap-1 ${
                        ride.seats >= 3 ? "bg-green-50 text-green-700" :
                        ride.seats === 2 ? "bg-amber-50 text-amber-700" :
                        "bg-red-50 text-red-600"
                      }`}>
                        <Icon name="person-outline" style={{ fontSize: "12px" }} />
                        {ride.seats} seat{ride.seats !== 1 ? "s" : ""} left
                      </span>
                    </div>
                    <span className="text-xs text-indigo-700 font-semibold flex items-center gap-0.5">
                      View <Icon name="chevron-forward-outline" style={{ fontSize: "12px" }} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense><Results /></Suspense>;
}
