"use client";
import Icon from "@/components/Icon";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState } from "react";

type Trip = { id: string; type: string; status: string; from: string; to: string; date: string; time: string; driver: string; price: number };

const INITIAL_TRIPS: Trip[] = [
  { id: "1",  type: "passenger", status: "upcoming",  from: "Baku", to: "Ganja",    date: "Jul 15", time: "09:00", driver: "John D.",  price: 5 },
  { id: "t2", type: "driver",    status: "upcoming",  from: "Baku", to: "Sumqayit", date: "Jul 16", time: "08:30", driver: "You",       price: 3 },
  { id: "t3", type: "passenger", status: "completed", from: "Baku", to: "Sheki",    date: "Jul 1",  time: "07:00", driver: "Nigar R.", price: 8 },
];

const STATUS_COLOR: Record<string, { dot: string; text: string }> = {
  upcoming:  { dot: "bg-indigo-600",  text: "text-indigo-700" },
  completed: { dot: "bg-green-500", text: "text-green-600" },
  cancelled: { dot: "bg-slate-300", text: "text-slate-400" },
};

export default function TripsPage() {
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function cancel(id: string) {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: "cancelled" } : t));
    setConfirmId(null);
  }

  return (
    <div className="min-h-screen bg-[#F5F5FF]">
      <Navbar />

      {/* Cancel modal */}
      {confirmId && (
        <div className="fixed inset-0 z-[2000] bg-black/40 flex items-end justify-center px-4 pb-8">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-base font-bold text-slate-900 text-center mb-1">Cancel this booking?</h2>
            <p className="text-xs text-slate-400 text-center mb-6">The seat will be released back to the driver.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmId(null)} className="flex-1 bg-slate-100 text-slate-600 font-semibold py-3.5 rounded-2xl text-sm">Keep it</button>
              <button onClick={() => cancel(confirmId)} className="flex-1 bg-red-500 text-white font-bold py-3.5 rounded-2xl text-sm">Cancel booking</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-8 pb-28 md:pb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My trips</h1>

        {trips.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="map-outline" style={{ fontSize: "48px", color: "#CBD5E1", display: "block", margin: "0 auto 12px" }} />
            <p className="font-semibold text-slate-500">No trips yet</p>
            <Link href="/" className="text-sm text-indigo-700 font-semibold mt-2 inline-block">Find a ride →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {trips.map(trip => {
              const s = STATUS_COLOR[trip.status];
              const cancelled = trip.status === "cancelled";
              return (
                <div key={trip.id} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 ${cancelled ? "opacity-50" : ""}`}>
                  {/* Route + status */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{trip.from} → {trip.to}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{trip.date} · {trip.time}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {trip.status}
                    </div>
                  </div>

                  {/* Driver + price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center">
                        <Icon name={trip.type === "driver" ? "car-outline" : "person-outline"} style={{ fontSize: "14px", color: "#4338CA" }} />
                      </div>
                      <span className="text-sm text-slate-500 font-medium">
                        {trip.type === "driver" ? "You're driving" : trip.driver}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-indigo-700">&#x20BC;{trip.price}</span>
                  </div>

                  {/* Actions */}
                  {!cancelled && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                      {trip.status === "upcoming" && trip.type === "passenger" && (
                        <Link href={`/tracking/${trip.id}`} className="flex-1 bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 hover:bg-indigo-800 transition-colors">
                          <Icon name="navigate-outline" style={{ fontSize: "13px" }} />
                          Track ride
                        </Link>
                      )}
                      {trip.status === "completed" && trip.type === "passenger" && (
                        <Link href={`/rate/${trip.id}`} className="flex-1 bg-yellow-400 text-white font-bold py-2.5 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 hover:bg-yellow-500 transition-colors">
                          <Icon name="star-outline" style={{ fontSize: "13px" }} />
                          Rate driver
                        </Link>
                      )}
                      {trip.status === "upcoming" && (
                        <button onClick={() => setConfirmId(trip.id)} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-slate-100">
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
