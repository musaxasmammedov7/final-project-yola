"use client";
import Icon from "@/components/Icon";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import DriverAvatar from "@/components/DriverAvatar";
import { RIDES, rideServesRoute, segmentPrice } from "@/lib/data";

function Results() {
  const params = useSearchParams();
  const router = useRouter();
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const date = params.get("date") || "";
  const seats = Number(params.get("seats") || 1);

  const [sort, setSort] = useState<"price" | "time" | "rating">("price");
  const [maxPrice, setMaxPrice] = useState(20);

  const filtered = RIDES
    .filter(r =>
      rideServesRoute(r, from, to) &&
      r.seats >= seats &&
      segmentPrice(r, from, to) <= maxPrice
    )
    .sort((a, b) => {
      if (sort === "price") return segmentPrice(a, from, to) - segmentPrice(b, from, to);
      if (sort === "rating") return b.driver.rating - a.driver.rating;
      return a.departureTime.localeCompare(b.departureTime);
    });

  // pickup/dropoff waypoints for each ride
  const getPickup = (ride: typeof RIDES[0]) =>
    ride.waypoints.find(w => w.city.toLowerCase() === from.toLowerCase());
  const getDropoff = (ride: typeof RIDES[0]) =>
    ride.waypoints.find(w => w.city.toLowerCase() === to.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F5F5FF]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{from} → {to}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {date} · {seats} seat{seats > 1 ? "s" : ""} · {filtered.length} ride{filtered.length !== 1 ? "s" : ""} found
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
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
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

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Icon name="car-outline" style={{ fontSize: "48px", color: "#CBD5E1", display: "block", margin: "0 auto 12px" }} />
            <p className="font-semibold text-slate-600 text-lg">Hər şeyin bir vaxtı var</p>
            <p className="text-xs text-slate-400 mt-1 mb-4 italic">Everything has its time</p>
            <p className="text-sm text-slate-400">Try a different date or adjust the price filter</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(ride => {
              const pickup  = getPickup(ride);
              const dropoff = getDropoff(ride);
              const price   = segmentPrice(ride, from, to);
              // show via stops between from and to
              const cities  = ride.waypoints.map(w => w.city.toLowerCase());
              const fi = cities.indexOf(from.toLowerCase());
              const ti = cities.indexOf(to.toLowerCase());
              const via = ride.waypoints.slice(fi + 1, ti).map(w => w.city);

              return (
                <div
                  key={ride.id}
                  onClick={() => router.push(`/ride/${ride.id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&seats=${seats}`)}
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    {/* Driver — separate link, stops card click */}
                    <Link
                      href={`/driver/${ride.driverId}`}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-3 group"
                    >
                      <DriverAvatar name={ride.driver.name} size={40} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{ride.driver.name}</p>
                        <p className="text-xs text-indigo-700 font-semibold mt-0.5 flex items-center gap-0.5">
                          <Icon name="star" style={{ fontSize: "11px" }} />
                          {ride.driver.rating} · {ride.driver.trips} trips
                        </p>
                      </div>
                    </Link>
                    <div className="text-right">
                      <p className="text-xl font-bold text-amber-600">&#x20BC;{price}</p>
                      <p className="text-xs text-slate-400 font-medium">per seat</p>
                    </div>
                  </div>

                  {/* Route timeline */}
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

                  {/* Pickup / dropoff detail */}
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
