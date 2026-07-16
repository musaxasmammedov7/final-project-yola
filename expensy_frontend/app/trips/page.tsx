"use client";
import Icon from "@/components/Icon";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { storedBookingIds, fetchBooking, type ApiBooking } from "@/lib/api";

const STATUS_COLOR: Record<string, { dot: string; text: string }> = {
  confirmed: { dot: "bg-indigo-600",  text: "text-indigo-700" },
  cancelled: { dot: "bg-slate-300",   text: "text-slate-400" },
};

type BookingState = ApiBooking & { _cancelled?: boolean };

export default function TripsPage() {
  const [bookings, setBookings] = useState<BookingState[]>([]);
  const [loading, setLoading]   = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const ids = storedBookingIds();
    if (ids.length === 0) return;
    Promise.all(ids.map(id => fetchBooking(id).catch(() => null)))
      .then(results => {
        setBookings(results.filter(Boolean) as BookingState[]);
        setLoading(false);
      });
  }, []);

  function cancelLocally(id: string) {
    setBookings(prev => prev.map(b => b._id === id ? { ...b, _cancelled: true, status: "cancelled" } : b));
    setConfirmId(null);
  }

  const display = bookings.filter(b => b.status !== "cancelled" || b._cancelled);

  return (
    <div className="min-h-screen bg-[#F5F5FF]">
      <Navbar />

      {confirmId && (
        <div className="fixed inset-0 z-[2000] bg-black/40 flex items-end justify-center px-4 pb-8">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-base font-bold text-slate-900 text-center mb-1">Cancel this booking?</h2>
            <p className="text-xs text-slate-400 text-center mb-6">The seat will be released back to the driver.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmId(null)} className="flex-1 bg-slate-100 text-slate-600 font-semibold py-3.5 rounded-2xl text-sm">Keep it</button>
              <button onClick={() => cancelLocally(confirmId)} className="flex-1 bg-red-500 text-white font-bold py-3.5 rounded-2xl text-sm">Cancel booking</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-8 pb-28 md:pb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My trips</h1>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-skeleton">
                <div className="w-40 h-5 bg-slate-200 rounded mb-2" />
                <div className="w-28 h-3 bg-slate-100 rounded mb-4" />
                <div className="w-24 h-3 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && display.length === 0 && (
          <div className="text-center py-20">
            <Icon name="map-outline" style={{ fontSize: "48px", color: "#CBD5E1", display: "block", margin: "0 auto 12px" }} />
            <p className="font-semibold text-slate-500">No trips yet</p>
            <Link href="/" className="text-sm text-indigo-700 font-semibold mt-2 inline-block">Find a ride →</Link>
          </div>
        )}

        {!loading && display.length > 0 && (
          <div className="flex flex-col gap-3">
            {display.map(booking => {
              const cancelled = booking.status === "cancelled";
              const s = STATUS_COLOR[booking.status] ?? STATUS_COLOR.confirmed;
              const dateLabel = booking.date;

              return (
                <div key={booking._id} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 ${cancelled ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{booking.fromCity} → {booking.toCity}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{dateLabel}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {booking.status}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center">
                        <Icon name="person-outline" style={{ fontSize: "14px", color: "#4338CA" }} />
                      </div>
                      <span className="text-sm text-slate-500 font-medium">{booking.passengerName}</span>
                    </div>
                    <span className="text-sm font-bold text-indigo-700">&#x20BC;{booking.totalPrice}</span>
                  </div>

                  {!cancelled && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                      <Link href={`/tracking/${booking._id}`} className="flex-1 bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 hover:bg-indigo-800 transition-colors">
                        <Icon name="navigate-outline" style={{ fontSize: "13px" }} />
                        Track ride
                      </Link>
                      <Link href={`/ride/${booking.rideId}`} className="flex-1 bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors border border-slate-100">
                        <Icon name="person-circle-outline" style={{ fontSize: "13px" }} />
                        Driver
                      </Link>
                      <button onClick={() => setConfirmId(booking._id)} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-slate-100">
                        Cancel
                      </button>
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
