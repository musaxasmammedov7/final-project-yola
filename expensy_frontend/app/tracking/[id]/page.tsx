"use client";
import { use, Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Icon from "@/components/Icon";
import { RIDES } from "@/lib/data";
import "leaflet/dist/leaflet.css";

const TrackingMap = dynamic(() => import("@/components/TrackingMap"), { ssr: false });

const STATUSES = [
  { key: "waiting",    label: "Driver is on the way",  icon: "time-outline" },
  { key: "pickup",     label: "Arriving at pickup",    icon: "location-outline" },
  { key: "onroute",   label: "On the way",             icon: "car-outline" },
  { key: "arriving",  label: "Almost there",           icon: "flag-outline" },
  { key: "arrived",   label: "You have arrived!",      icon: "checkmark-circle-outline" },
];

function Tracking({ id }: { id: string }) {
  const ride = RIDES.find(r => r.id === id) ?? RIDES[0];
  const [progress, setProgress] = useState(0);       // 0–1 along route
  const [statusIdx, setStatusIdx] = useState(0);
  const [eta, setEta] = useState(42);               // minutes

  // Simulate car moving
  useEffect(() => {
    if (progress >= 1) return;
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 0.003, 1));
    }, 200);
    return () => clearInterval(interval);
  }, [progress >= 1]);

  // Update status and ETA when progress changes
  useEffect(() => {
    setEta(Math.round((1 - progress) * 42));
    if (progress >= 1   && statusIdx < 4) { setStatusIdx(4); return; }
    if (progress > 0.85 && statusIdx < 3) { setStatusIdx(3); return; }
    if (progress > 0.2  && statusIdx < 2) { setStatusIdx(2); return; }
    if (progress > 0.08 && statusIdx < 1) { setStatusIdx(1); }
  }, [progress]);

  const status = STATUSES[statusIdx];
  const from = ride.waypoints[0];
  const to   = ride.waypoints[ride.waypoints.length - 1];
  const arrived = progress >= 1;

  return (
    <div className="min-h-screen bg-[#F5F5FF] flex flex-col">
      <Navbar />

      {/* Full-height map */}
      <div className="flex-1 relative" style={{ minHeight: "55vh" }}>
        <TrackingMap waypoints={ride.waypoints} progress={progress} />

        {/* Floating status pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-2xl shadow-lg border border-slate-100 px-5 py-3 flex items-center gap-3 whitespace-nowrap">
          <Icon name={status.icon} style={{ fontSize: "20px", color: arrived ? "#22C55E" : "#4338CA" }} />
          <span className="text-sm font-bold text-slate-900">{status.label}</span>
        </div>

        {/* ETA badge */}
        {!arrived && (
          <div className="absolute top-4 right-4 z-[1000] bg-indigo-700 text-white rounded-2xl px-4 py-2 text-center shadow-lg">
            <p className="text-xs font-semibold opacity-80">ETA</p>
            <p className="text-lg font-bold tabular-nums">{eta} min</p>
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      <div className="bg-white rounded-t-3xl border-t border-slate-100 shadow-2xl p-6 pb-24 md:pb-6">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-700 rounded-full transition-all duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
        </div>

        <div className="flex justify-between text-xs text-slate-400 font-medium mb-6 -mt-3">
          <span>{from.city}</span>
          <span>{to.city}</span>
        </div>

        {/* Driver row */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
            <Icon name="person-circle-outline" style={{ fontSize: "34px", color: "#4338CA" }} />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-slate-900">{ride.driver.name}</p>
            <p className="text-xs text-slate-400">{ride.car} · {ride.carColor}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/chat/${ride.id}`}
              className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition-colors"
            >
              <Icon name="chatbubble-outline" style={{ fontSize: "18px", color: "#4338CA" }} />
            </Link>
            <a
              href="tel:+994501234567"
              className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors"
            >
              <Icon name="call-outline" style={{ fontSize: "18px", color: "#22C55E" }} />
            </a>
          </div>
        </div>

        {/* Steps */}
        <div className="flex justify-between mb-6">
          {STATUSES.map((s, i) => (
            <div key={s.key} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                i <= statusIdx ? "bg-indigo-700" : "bg-slate-100"
              }`}>
                <Icon name={s.icon} style={{ fontSize: "13px", color: i <= statusIdx ? "#fff" : "#94A3B8" }} />
              </div>
              {i < STATUSES.length - 1 && (
                <div className={`absolute`} />
              )}
            </div>
          ))}
        </div>

        {arrived ? (
          <div className="flex flex-col gap-3">
            <Link href={`/rate/${ride.id}`} className="w-full bg-indigo-700 text-white font-bold py-4 rounded-2xl text-sm text-center hover:bg-indigo-800 transition-colors block">
              Rate your trip
            </Link>
          </div>
        ) : (
          <button className="w-full border border-red-200 text-red-500 font-semibold py-3.5 rounded-2xl text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
            <Icon name="close-circle-outline" style={{ fontSize: "16px" }} />
            Emergency — Cancel trip
          </button>
        )}
      </div>
    </div>
  );
}

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense><Tracking id={id} /></Suspense>;
}
