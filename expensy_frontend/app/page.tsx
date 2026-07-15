"use client";
import Icon from "@/components/Icon";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

const PinPicker = dynamic(() => import("@/components/PinPicker"), { ssr: false });

const RECENT = ["Baku → Ganja", "Baku → Sumqayit", "Baku → Sheki", "Baku → Quba", "Baku → Qəbələ"];

const PROVERBS = [
  { az: "Yol yoldaşı can yoldaşıdır",              en: "A travel companion is a soul companion" },
  { az: "Hər şeyin bir vaxtı var",                  en: "Everything has its time" },
  { az: "Səfər insanı kamilləşdirir",               en: "Travel perfects a person" },
  { az: "Yolun başlanğıcı yarısıdır",               en: "Starting the journey is half the journey" },
  { az: "El gücü — sel gücü",                       en: "People's strength is a flood's strength" },
  { az: "Dost başın tac olar",                      en: "A true friend becomes the crown of your head" },
  { az: "Qonaq ev sahibinin güzgüsüdür",            en: "A guest is the mirror of the host" },
  { az: "Bir əl nə qədər şaqqıldasa da, səs verməz", en: "One hand alone cannot clap" },
  { az: "Oxumaq nurdur, oxumamaq kordur",           en: "Learning is light, ignorance is blindness" },
  { az: "Sabahkı işini bu günə qoyma",              en: "Don't leave tomorrow's work for today" },
  { az: "Əl əli yuyar, əl də üzü",                 en: "Hands wash each other, hands wash the face" },
  { az: "Hər quşun öz səsi xoşdur",                en: "Every bird loves its own song" },
];

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Salam! Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const POPULAR = [
  { from: "Baku", to: "Ganja",    price: 4,  duration: "3.5h" },
  { from: "Baku", to: "Sumqayit", price: 2,  duration: "45m"  },
  { from: "Baku", to: "Sheki",    price: 8,  duration: "5h"   },
  { from: "Baku", to: "Lankaran", price: 7,  duration: "4.5h" },
  { from: "Baku", to: "Quba",     price: 5,  duration: "2.5h" },
  { from: "Baku", to: "Qəbələ",   price: 10, duration: "3h"   },
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
        <div className="rounded-3xl mb-6 text-white relative overflow-hidden animate-fade-up carpet-border" style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)" }}>
          <div className="p-8 pb-4">
            <p className="text-xs font-semibold tracking-widest uppercase text-indigo-200 mb-2">{greeting}</p>
            <h1 className="text-3xl font-bold tracking-tight leading-tight">Where are you<br />headed today?</h1>

            <div className="mt-3">
              <p className="text-indigo-100 text-sm font-medium italic" suppressHydrationWarning>"{proverb.az}"</p>
              <p className="text-indigo-300 text-xs mt-0.5" suppressHydrationWarning>{proverb.en}</p>
            </div>
          </div>

          {/* Baku skyline silhouette */}
          <svg viewBox="0 0 420 80" className="w-full" aria-hidden="true" style={{ opacity: 0.18, display: "block" }}>
            {/* Background buildings left */}
            <rect x="0"   y="56" width="30" height="24" fill="white" />
            <rect x="32"  y="46" width="18" height="34" fill="white" />
            <rect x="52"  y="60" width="22" height="20" fill="white" />
            {/* Old city wall crenellations */}
            <rect x="76"  y="60" width="10" height="20" fill="white" />
            <rect x="88"  y="65" width="8"  height="15" fill="white" />
            <rect x="98"  y="60" width="10" height="20" fill="white" />
            <rect x="110" y="65" width="8"  height="15" fill="white" />
            <rect x="120" y="60" width="10" height="20" fill="white" />
            <rect x="132" y="65" width="8"  height="15" fill="white" />
            <rect x="142" y="60" width="10" height="20" fill="white" />
            {/* Maiden Tower (Qız Qalası) */}
            <rect x="158" y="38" width="16" height="42" rx="8" fill="white" />
            <rect x="167" y="44" width="8"  height="36" fill="white" />
            <ellipse cx="166" cy="38" rx="8" ry="5" fill="white" />
            {/* Heydar Aliyev Center silhouette — flowing curved form */}
            <path d="M280,80 C280,80 278,55 290,48 C302,41 318,44 330,50 C342,56 348,65 348,80 Z" fill="white" />
            <path d="M286,80 C286,70 292,58 304,54 C316,50 326,56 332,65 C338,74 338,80 338,80 Z" fill="white" opacity="0.6" />
            {/* Flame Tower Left */}
            <path d="M195,80 L195,46 Q197,30 200,20 Q203,10 205,4 Q207,10 209,20 Q212,30 215,46 L215,80 Z" fill="white" />
            {/* Flame Tower Center (tallest) */}
            <path d="M220,80 L220,40 Q223,22 226,12 Q229,4 232,0 Q235,4 238,12 Q241,22 244,40 L244,80 Z" fill="white" />
            {/* Flame Tower Right */}
            <path d="M249,80 L249,48 Q251,32 254,22 Q257,12 259,6 Q261,12 263,22 Q266,32 268,48 L268,80 Z" fill="white" />
            {/* Background buildings right */}
            <rect x="354" y="52" width="20" height="28" fill="white" />
            <rect x="376" y="44" width="26" height="36" fill="white" />
            <rect x="404" y="58" width="16" height="22" fill="white" />
            {/* Ground */}
            <rect x="0" y="78" width="420" height="2" fill="white" />
          </svg>
        </div>

        {/* Search form — Maiden Tower watermark */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 overflow-hidden relative">
          <svg viewBox="0 0 56 100" aria-hidden="true" style={{ position: "absolute", right: -8, bottom: -8, width: 100, height: 130, opacity: 0.04, pointerEvents: "none" }}>
            <rect x="14" y="10" width="28" height="90" rx="14" fill="#4338CA" />
            <rect x="28" y="22" width="14" height="78" fill="#4338CA" />
            <ellipse cx="28" cy="10" rx="14" ry="5" fill="#4338CA" />
          </svg>
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

        {/* Recent — Heydar Aliyev Center watermark */}
        <div className="mb-10 relative overflow-hidden">
          <svg viewBox="0 0 80 80" aria-hidden="true" style={{ position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)", width: 120, height: 120, opacity: 0.05, pointerEvents: "none" }}>
            <path d="M8,80 C8,80 6,52 22,42 C38,32 58,36 68,46 C78,56 76,80 76,80 Z" fill="#4338CA" />
            <path d="M16,80 C16,68 22,52 36,46 C50,40 62,48 68,60 C74,72 74,80 74,80 Z" fill="#4338CA" />
            <ellipse cx="42" cy="42" rx="10" ry="6" fill="#4338CA" />
          </svg>
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

        {/* Popular routes — Flame Towers watermark */}
        <div className="mb-10 relative overflow-hidden">
          <svg viewBox="0 0 80 80" aria-hidden="true" style={{ position: "absolute", right: -4, bottom: -4, width: 110, height: 110, opacity: 0.05, pointerEvents: "none" }}>
            <path d="M14,80 L14,48 Q16,32 19,20 Q22,10 24,4 Q26,10 28,20 Q31,32 34,48 L34,80 Z" fill="#4338CA" />
            <path d="M26,80 L26,38 Q29,20 32,10 Q35,2 38,0 Q41,2 44,10 Q47,20 50,38 L50,80 Z" fill="#4338CA" />
            <path d="M42,80 L42,50 Q44,34 47,22 Q50,12 52,6 Q54,12 56,22 Q59,34 62,50 L62,80 Z" fill="#4338CA" />
          </svg>
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
