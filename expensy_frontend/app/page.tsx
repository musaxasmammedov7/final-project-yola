"use client";
import Icon from "@/components/Icon";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

const PinPicker = dynamic(() => import("@/components/PinPicker"), { ssr: false });

const RECENT = ["Baku → Ganja", "Baku → Sumqayit", "Baku → Sheki"];

const PROVERBS = [
  { az: "Yol yoldaşı can yoldaşıdır", en: "A travel companion is a soul companion" },
  { az: "Hər şeyin bir vaxtı var",     en: "Everything has its time" },
  { az: "Səfər insanı kamilləşdirir",  en: "Travel perfects a person" },
  { az: "Yolun başlanğıcı yarısıdır",  en: "Starting the journey is half the journey" },
];

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const POPULAR = [
  { from: "Baku", to: "Ganja",    price: 4, duration: "3.5h" },
  { from: "Baku", to: "Sumqayit", price: 2, duration: "45m"  },
  { from: "Baku", to: "Sheki",    price: 8, duration: "5h"   },
  { from: "Baku", to: "Lankaran", price: 7, duration: "4.5h" },
];

export default function Home() {
  const router = useRouter();
  const greeting = timeGreeting();

  const [proverb] = useState(() => PROVERBS[Math.floor(Math.random() * PROVERBS.length)]);
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
    <div className="min-h-screen bg-[#EEF2FF]">
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
        <div className="rounded-3xl p-8 mb-6 text-white relative overflow-hidden animate-fade-up carpet-border" style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)" }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-indigo-200 mb-2">{greeting}</p>
          <h1 className="text-3xl font-bold tracking-tight leading-tight">Where are you<br />headed today?</h1>

          <div className="mt-3">
            <p className="text-indigo-100 text-sm font-medium italic">"{proverb.az}"</p>
            <p className="text-indigo-300 text-xs mt-0.5">{proverb.en}</p>
          </div>

          {/* Baku skyline silhouette */}
          <svg viewBox="0 0 420 72" className="absolute bottom-0 left-0 right-0 w-full" aria-hidden="true" style={{ opacity: 0.12 }}>
            {/* Background buildings */}
            <rect x="0"   y="52" width="30" height="20" fill="white" />
            <rect x="32"  y="44" width="18" height="28" fill="white" />
            <rect x="52"  y="56" width="22" height="16" fill="white" />
            <rect x="300" y="48" width="24" height="24" fill="white" />
            <rect x="326" y="54" width="18" height="18" fill="white" />
            <rect x="346" y="42" width="26" height="30" fill="white" />
            <rect x="374" y="50" width="20" height="22" fill="white" />
            <rect x="396" y="56" width="24" height="16" fill="white" />
            {/* Old city wall crenellations */}
            <rect x="76"  y="58" width="10" height="14" fill="white" />
            <rect x="88"  y="62" width="8"  height="10" fill="white" />
            <rect x="98"  y="58" width="10" height="14" fill="white" />
            <rect x="110" y="62" width="8"  height="10" fill="white" />
            <rect x="120" y="58" width="10" height="14" fill="white" />
            <rect x="132" y="62" width="8"  height="10" fill="white" />
            <rect x="142" y="58" width="10" height="14" fill="white" />
            {/* Flame Tower Left */}
            <path d="M200,72 L200,42 Q202,28 205,18 Q208,8 210,2 Q212,8 214,18 Q217,28 220,42 L220,72 Z" fill="white" />
            {/* Flame Tower Center (tallest) */}
            <path d="M225,72 L225,36 Q228,20 231,10 Q234,2 237,0 Q240,2 243,10 Q246,20 249,36 L249,72 Z" fill="white" />
            {/* Flame Tower Right */}
            <path d="M254,72 L254,44 Q256,30 259,20 Q262,10 264,5 Q266,10 268,20 Q271,30 273,44 L273,72 Z" fill="white" />
            {/* Ground */}
            <rect x="0" y="70" width="420" height="2" fill="white" />
          </svg>
        </div>

        {/* Search form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
            <Icon name="location-outline" style={{ fontSize: "20px", color: "#4338CA", flexShrink: 0 }} />
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">From</p>
              <input
                className="w-full text-sm font-medium text-slate-900 outline-none mt-0.5 bg-transparent"
                value={from}
                onChange={e => setFrom(e.target.value)}
                placeholder="Departure city"
              />
            </div>
            <button onClick={swap} className="text-slate-300 hover:text-indigo-600 transition-colors px-1">
              <Icon name="swap-vertical-outline" style={{ fontSize: "20px" }} />
            </button>
            <button
              onClick={() => setPicker("from")}
              className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition-colors flex-shrink-0"
            >
              <Icon name="map-outline" style={{ fontSize: "16px", color: "#4338CA" }} />
            </button>
          </div>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
            <Icon name="flag-outline" style={{ fontSize: "20px", color: "#4338CA", flexShrink: 0 }} />
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
              className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition-colors flex-shrink-0"
            >
              <Icon name="map-outline" style={{ fontSize: "16px", color: "#4338CA" }} />
            </button>
          </div>
          <div className="flex">
            <div className="flex items-center gap-3 px-5 py-4 flex-1 border-r border-slate-50">
              <Icon name="calendar-outline" style={{ fontSize: "20px", color: "#4338CA", flexShrink: 0 }} />
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
              <Icon name="person-outline" style={{ fontSize: "20px", color: "#4338CA", flexShrink: 0 }} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Seats</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <button onClick={() => setSeats(Math.max(1, seats - 1))} className="text-indigo-700 font-bold w-5 text-center">−</button>
                  <span className="text-sm font-semibold text-slate-900 w-4 text-center">{seats}</span>
                  <button onClick={() => setSeats(Math.min(4, seats + 1))} className="text-indigo-700 font-bold w-5 text-center">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={search}
          className="w-full bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-sm tracking-wide transition-all mb-8 disabled:opacity-40 disabled:cursor-not-allowed"
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
                className="flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 text-sm text-slate-600 font-medium shadow-sm hover:border-indigo-300 hover:text-indigo-700 transition-colors"
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
            {POPULAR.map(r => (
              <button
                key={r.to}
                onClick={() => quickSearch(`${r.from} → ${r.to}`)}
                className="bg-white rounded-2xl p-4 text-left border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all"
              >
                <div className="text-xs text-slate-400 font-medium">{r.from} →</div>
                <div className="text-base font-bold text-slate-900 mb-2">{r.to}</div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-600 font-bold text-sm">from ₼{r.price}</span>
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
