"use client";
import Icon from "@/components/Icon";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/auth";

const PinPicker = dynamic(() => import("@/components/PinPicker"), { ssr: false });

type PickerTarget = { kind: "from" | "to" | "stop"; index?: number };

const Field = ({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3 px-5 py-4">
    <Icon name={icon} style={{ fontSize: "20px", color: "#2563EB", flexShrink: 0 }} />
    <div className="flex-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      {children}
    </div>
  </div>
);

export default function OfferPage() {
  const router = useRouter();
  const { user } = useAuth();
  const savedCars = user?.cars.filter(c => c.name) || [];
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stops, setStops] = useState<string[]>([]);
  const [date, setDate] = useState("2026-07-15");
  const [time, setTime] = useState("09:00");
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState(5);
  const [car, setCar] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [picker, setPicker] = useState<PickerTarget | null>(null);

  function addStop() { if (stops.length < 3) setStops(s => [...s, ""]); }
  function removeStop(i: number) { setStops(s => s.filter((_, idx) => idx !== i)); }
  function setStop(i: number, v: string) { setStops(s => s.map((x, idx) => idx === i ? v : x)); }

  function confirmPick(city: string) {
    if (!picker) return;
    if (picker.kind === "from") setFrom(city);
    else if (picker.kind === "to") setTo(city);
    else if (picker.kind === "stop" && picker.index !== undefined) setStop(picker.index, city);
    setPicker(null);
  }

  const fullRoute = [from, ...stops.filter(Boolean), to].filter(Boolean).join(" → ");

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFF]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-100">
            <Icon name="car-sport-outline" style={{ fontSize: "40px", color: "#2563EB" }} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Ride published!</h1>
          <p className="text-slate-400 text-sm mb-8">Passengers can now find and book your ride.</p>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-left mb-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Your ride</p>
            {[
              { label: "Route", value: fullRoute },
              { label: "Date & time", value: `${date} · ${time}` },
              { label: "Seats offered", value: String(seats) },
              { label: "Price per seat", value: `₼${price}` },
              ...(description ? [{ label: "Description", value: description }] : []),
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm mb-3 last:mb-0 gap-4">
                <span className="text-slate-500 flex-shrink-0">{row.label}</span>
                <span className="font-semibold text-slate-900 text-right">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push("/trips")} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-sm hover:bg-blue-700 transition-colors">View my trips</button>
            <button onClick={() => { setSubmitted(false); setFrom(""); setTo(""); setStops([]); setCar(""); setDescription(""); }} className="w-full bg-white border border-slate-100 text-slate-600 font-semibold py-4 rounded-2xl text-sm hover:border-blue-200 transition-colors">Offer another ride</button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <Navbar />

      {picker && (
        <PinPicker
          label={picker.kind === "from" ? "Pick departure" : picker.kind === "to" ? "Pick destination" : "Pick mid-stop"}
          onConfirm={confirmPick}
          onClose={() => setPicker(null)}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Offer a ride</h1>
        <p className="text-sm text-slate-400 mb-8">Share your journey and split the cost</p>

        {/* Route section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden">
          {/* From */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white ring-2 ring-green-200" />
              <div className="w-px h-4 bg-slate-200" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">From</p>
              <input className="w-full text-sm font-medium text-slate-900 outline-none mt-0.5 bg-transparent" value={from} onChange={e => setFrom(e.target.value)} placeholder="Departure city" />
            </div>
            <button onClick={() => setPicker({ kind: "from" })} className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors flex-shrink-0">
              <Icon name="map-outline" style={{ fontSize: "15px", color: "#2563EB" }} />
            </button>
          </div>

          {/* Mid-stops */}
          {stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4 border-b border-slate-50 bg-blue-50/30">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-px h-2 bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 border-2 border-white ring-1 ring-blue-200" />
                <div className="w-px h-2 bg-slate-200" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stop {i + 1}</p>
                <input
                  className="w-full text-sm font-medium text-slate-900 outline-none mt-0.5 bg-transparent"
                  value={stop}
                  onChange={e => setStop(i, e.target.value)}
                  placeholder="Mid-stop city"
                  autoFocus
                />
              </div>
              <button onClick={() => setPicker({ kind: "stop", index: i })} className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors flex-shrink-0">
                <Icon name="map-outline" style={{ fontSize: "15px", color: "#2563EB" }} />
              </button>
              <button onClick={() => removeStop(i)} className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors flex-shrink-0">
                <Icon name="close-outline" style={{ fontSize: "16px", color: "#EF4444" }} />
              </button>
            </div>
          ))}

          {/* Add stop */}
          {stops.length < 3 && (
            <button
              onClick={addStop}
              className="w-full flex items-center gap-3 px-5 py-3 border-b border-slate-50 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Icon name="add-outline" style={{ fontSize: "14px", color: "#2563EB" }} />
              </div>
              <span className="text-xs font-bold">Add a mid-stop</span>
            </button>
          )}

          {/* To */}
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-px h-4 bg-slate-200" />
              <div className="w-3 h-3 rounded-full bg-red-400 border-2 border-white ring-2 ring-red-100" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">To</p>
              <input className="w-full text-sm font-medium text-slate-900 outline-none mt-0.5 bg-transparent" value={to} onChange={e => setTo(e.target.value)} placeholder="Destination city" />
            </div>
            <button onClick={() => setPicker({ kind: "to" })} className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors flex-shrink-0">
              <Icon name="map-outline" style={{ fontSize: "15px", color: "#2563EB" }} />
            </button>
          </div>
        </div>

        {/* Date & time */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden divide-y divide-slate-50">
          <div className="flex divide-x divide-slate-50">
            <div className="flex-1">
              <Field icon="calendar-outline" label="Date">
                <input type="date" className="w-full text-sm font-medium text-slate-900 outline-none mt-0.5 bg-transparent" value={date} onChange={e => setDate(e.target.value)} />
              </Field>
            </div>
            <div className="flex-1">
              <Field icon="time-outline" label="Time">
                <input type="time" className="w-full text-sm font-medium text-slate-900 outline-none mt-0.5 bg-transparent" value={time} onChange={e => setTime(e.target.value)} />
              </Field>
            </div>
          </div>
        </div>

        {/* Car & seats */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden divide-y divide-slate-50">
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Car</p>
            {savedCars.length > 0 ? (
              <div className="space-y-2">
                {savedCars.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCar(c.name)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${car === c.name ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-300"}`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 flex items-center justify-center">
                      {c.photo
                        ? <img src={c.photo} alt="car" className="w-full h-full object-cover" />
                        : <span style={{ fontSize: "20px" }}>🚗</span>
                      }
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.year} · {c.color}</p>
                    </div>
                    {car === c.name && <Icon name="checkmark-circle" style={{ fontSize: "20px", color: "#2563EB" }} />}
                  </button>
                ))}
                <button
                  onClick={() => setCar("")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${!savedCars.find(c => c.name === car) && car !== "" ? "border-blue-500 bg-blue-50" : "border-dashed border-slate-200 hover:border-blue-300"}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="add-outline" style={{ fontSize: "18px", color: "#94A3B8" }} />
                  </div>
                  <span className="text-sm font-medium text-slate-500">Use a different car</span>
                </button>
                {(!savedCars.find(c => c.name === car)) && (
                  <input className="w-full text-sm font-medium text-slate-900 outline-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-400" value={car} onChange={e => setCar(e.target.value)} placeholder="e.g. Toyota Camry 2021" />
                )}
              </div>
            ) : (
              <div>
                <input className="w-full text-sm font-medium text-slate-900 outline-none bg-transparent" value={car} onChange={e => setCar(e.target.value)} placeholder="e.g. Toyota Camry 2021" />
                <Link href="/edit-profile" className="text-xs text-blue-500 font-semibold mt-2 inline-flex items-center gap-1 hover:text-blue-700">
                  <Icon name="add-circle-outline" style={{ fontSize: "13px" }} />
                  Save cars to your profile for quick selection
                </Link>
              </div>
            )}
          </div>
          <div className="flex divide-x divide-slate-50">
            <div className="flex-1">
              <Field icon="people-outline" label="Seats">
                <div className="flex items-center gap-2 mt-0.5">
                  <button onClick={() => setSeats(Math.max(1, seats - 1))} className="text-blue-600 font-bold w-5">−</button>
                  <span className="text-sm font-semibold text-slate-900 w-4 text-center">{seats}</span>
                  <button onClick={() => setSeats(Math.min(6, seats + 1))} className="text-blue-600 font-bold w-5">+</button>
                </div>
              </Field>
            </div>
            <div className="flex-1">
              <Field icon="cash-outline" label="Price / seat">
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm font-bold text-slate-400">₼</span>
                  <input type="number" className="w-16 text-sm font-semibold text-slate-900 outline-none bg-transparent" value={price} onChange={e => setPrice(Number(e.target.value))} min={1} max={50} />
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden">
          <div className="flex items-start gap-3 px-5 py-4">
            <Icon name="document-text-outline" style={{ fontSize: "20px", color: "#2563EB", flexShrink: 0, marginTop: "2px" }} />
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Trip description</p>
              <textarea
                className="w-full text-sm text-slate-900 outline-none bg-transparent resize-none"
                rows={3}
                placeholder="Tell passengers about your trip — stops, luggage, music, pets…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={300}
              />
              <p className="text-[10px] text-slate-300 text-right">{description.length}/300</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 mb-6 flex items-start gap-3">
          <Icon name="bulb-outline" style={{ fontSize: "18px", color: "#2563EB", flexShrink: 0, marginTop: "1px" }} />
          <p className="text-xs text-blue-700 font-medium leading-relaxed">Fair price for Baku → Ganja is typically ₼4–7. Lower prices fill seats faster.</p>
        </div>

        <button
          onClick={() => { if (from && to && car) setSubmitted(true); }}
          disabled={!from || !to || !car}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Publish ride
        </button>
      </div>
    </div>
  );
}
