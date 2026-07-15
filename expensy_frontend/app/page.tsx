"use client";
import Icon from "@/components/Icon";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

const PinPicker = dynamic(() => import("@/components/PinPicker"), { ssr: false });

const RECENT = ["Baku → Ganja", "Baku → Sumqayit", "Baku → Sheki"];

export default function Home() {
  const router = useRouter();
  const [from, setFrom] = useState("Baku");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("2026-07-15");
  const [seats, setSeats] = useState(1);
  const [picker, setPicker] = useState<"from" | "to" | null>(null);

  function swap() {
    const tmp = from;
    setFrom(to);
    setTo(tmp);
  }

  function search() {
    if (!to) return;
    router.push(`/results?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&seats=${seats}`);
  }

  function quickSearch(route: string) {
    const [f, t] = route.split(" → ");
    router.push(`/results?from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}&date=${date}&seats=1`);
  }

  function confirmPick(city: string) {
    if (picker === "from") setFrom(city);
    else setTo(city);
    setPicker(null);
  }

  return (
    <div className="min-h-screen bg-[#EFF6FF]">
      <Navbar />

      {picker && (
        <PinPicker
          label={picker === "from" ? "Pick departure" : "Pick destination"}
          onConfirm={confirmPick}
          onClose={() => setPicker(null)}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 pt-10 pb-20">
        {/* Hero */}
        <div className="bg-blue-600 rounded-3xl p-8 mb-6 text-white">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-200 mb-2">Good morning</p>
          <h1 className="text-3xl font-bold tracking-tight leading-tight">Where are you<br />headed today?</h1>
        </div>

        {/* Search form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
            <Icon name="location-outline" style={{ fontSize: "20px", color: "#2563EB", flexShrink: 0 }} />
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">From</p>
              <input
                className="w-full text-sm font-medium text-slate-900 outline-none mt-0.5 bg-transparent"
                value={from}
                onChange={e => setFrom(e.target.value)}
                placeholder="Departure city"
              />
            </div>
            <button onClick={swap} className="text-slate-300 hover:text-blue-500 transition-colors px-1">
              <Icon name="swap-vertical-outline" style={{ fontSize: "20px" }} />
            </button>
            <button
              onClick={() => setPicker("from")}
              className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors flex-shrink-0"
            >
              <Icon name="map-outline" style={{ fontSize: "16px", color: "#2563EB" }} />
            </button>
          </div>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
            <Icon name="flag-outline" style={{ fontSize: "20px", color: "#2563EB", flexShrink: 0 }} />
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">To</p>
              <input
                className="w-full text-sm font-medium text-slate-900 outline-none mt-0.5 bg-transparent"
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="Destination city"
              />
            </div>
            <button
              onClick={() => setPicker("to")}
              className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors flex-shrink-0"
            >
              <Icon name="map-outline" style={{ fontSize: "16px", color: "#2563EB" }} />
            </button>
          </div>
          <div className="flex">
            <div className="flex items-center gap-3 px-5 py-4 flex-1 border-r border-slate-50">
              <Icon name="calendar-outline" style={{ fontSize: "20px", color: "#2563EB", flexShrink: 0 }} />
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</p>
                <input
                  type="date"
                  className="w-full text-sm font-medium text-slate-900 outline-none mt-0.5 bg-transparent"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 w-36">
              <Icon name="person-outline" style={{ fontSize: "20px", color: "#2563EB", flexShrink: 0 }} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Seats</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <button onClick={() => setSeats(Math.max(1, seats - 1))} className="text-blue-600 font-bold w-5 text-center">−</button>
                  <span className="text-sm font-semibold text-slate-900 w-4 text-center">{seats}</span>
                  <button onClick={() => setSeats(Math.min(4, seats + 1))} className="text-blue-600 font-bold w-5 text-center">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={search}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm tracking-wide transition-colors mb-8 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={!to}
        >
          Find Rides
        </button>

        {/* Recent */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Recent searches</p>
          <div className="flex flex-wrap gap-2">
            {RECENT.map(r => (
              <button
                key={r}
                onClick={() => quickSearch(r)}
                className="flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 text-sm text-slate-600 font-medium shadow-sm hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <Icon name="car-outline" style={{ fontSize: "15px" }} />
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Popular routes */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Popular routes</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { from: "Baku", to: "Ganja", price: 4, duration: "3.5h" },
              { from: "Baku", to: "Sumqayit", price: 2, duration: "45m" },
              { from: "Baku", to: "Sheki", price: 8, duration: "5h" },
              { from: "Baku", to: "Lankaran", price: 7, duration: "4.5h" },
            ].map(r => (
              <button
                key={r.to}
                onClick={() => quickSearch(`${r.from} → ${r.to}`)}
                className="bg-white rounded-2xl p-4 text-left border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="text-xs text-slate-400 font-medium mb-1">{r.from}</div>
                <div className="text-base font-bold text-slate-900 mb-2">{r.to}</div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold text-sm">from ₼{r.price}</span>
                  <span className="text-xs text-slate-400">{r.duration}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
