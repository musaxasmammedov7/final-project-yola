"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import DriverAvatar from "@/components/DriverAvatar";
import { searchRides, type ApiRide } from "@/lib/api";
import { CITIES, DRIVER_PROFILES } from "@/lib/data";
import Link from "next/link";

const KNOWN_CITIES = Object.keys(CITIES);

type ChatMsg  = { role: "user" | "bot"; text: string };
type RidesMsg = { role: "rides"; from: string; to: string; date: string; seats: number; rides: ApiRide[] };
type Msg = ChatMsg | RidesMsg;

type HistoryMsg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Baku to Ganja tomorrow",
  "Baku to Sheki this weekend",
  "Sumqayit to Baku today",
];

export default function ChatBot() {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState("");
  const [msgs, setMsgs]       = useState<Msg[]>([
    { role: "bot", text: "Salam! Where are you headed? Tell me your route and date." },
  ]);
  const [history, setHistory] = useState<HistoryMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const router    = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  function resetChat() {
    setMsgs([{ role: "bot", text: "Salam! Where are you headed? Tell me your route and date." }]);
    setHistory([]);
  }

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    setInput("");

    const newHistory: HistoryMsg[] = [...history, { role: "user", content: userText }];
    setMsgs(m => [...m, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res  = await fetch("/api/parse-ride", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setMsgs(m => [...m, { role: "bot", text: "Something went wrong. Try again." }]);
        setLoading(false);
        return;
      }

      if (data.type === "chat") {
        setMsgs(m => [...m, { role: "bot", text: data.reply }]);
        setHistory([...newHistory, { role: "assistant", content: data.reply }]);
        setLoading(false);
        return;
      }

      if (data.type === "unavailable") {
        const reply = `No rides to/from ${data.city} right now. We serve: ${KNOWN_CITIES.join(", ")}.`;
        setMsgs(m => [...m, { role: "bot", text: reply }]);
        setHistory([...newHistory, { role: "assistant", content: reply }]);
        setLoading(false);
        return;
      }

      // type === "search"
      const { from, to, date, seats } = data;
      const dateStr = date || new Date().toISOString().split("T")[0];

      try {
        const found = (await searchRides(from, to, dateStr, seats ?? 1)).slice(0, 4);
        if (found.length === 0) {
          const reply = `No rides from ${from} to ${to}${date ? ` on ${date}` : ""} right now. Try a different date?`;
          setMsgs(m => [...m, { role: "bot", text: reply }]);
          setHistory([...newHistory, { role: "assistant", content: reply }]);
        } else {
          const reply = `Found ${found.length} ride${found.length > 1 ? "s" : ""} from ${from} to ${to}:`;
          setMsgs(m => [
            ...m,
            { role: "bot", text: reply },
            { role: "rides", from, to, date: dateStr, seats: seats ?? 1, rides: found },
          ]);
          setHistory([...newHistory, { role: "assistant", content: reply }]);
        }
      } catch {
        const reply = `No rides from ${from} to ${to} right now.`;
        setMsgs(m => [...m, { role: "bot", text: reply }]);
        setHistory([...newHistory, { role: "assistant", content: reply }]);
      }
      setLoading(false);
    } catch {
      setMsgs(m => [...m, { role: "bot", text: "Network error. Please try again." }]);
      setLoading(false);
    }
  }

  function book(ride: ApiRide, from: string, to: string, date: string, seats: number) {
    const p = new URLSearchParams({ from, to, date, seats: String(seats) });
    router.push(`/booking/${ride._id}?${p}`);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-20 right-4 z-[900] w-14 h-14 bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-800 transition-colors md:bottom-6"
        aria-label="Open chat assistant"
      >
        <Icon name={open ? "close" : "chatbubbles-outline"} style={{ fontSize: "24px" }} />
      </button>

      {open && (
        <div className="fixed bottom-36 right-4 z-[800] w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden md:bottom-20">
          <div className="bg-indigo-700 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="navigate-outline" style={{ fontSize: "18px", color: "white" }} />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Yola Assistant</p>
              <p className="text-indigo-200 text-xs">Tell me where you want to go</p>
            </div>
            <button onClick={resetChat} className="text-indigo-200 hover:text-white transition-colors" title="New search">
              <Icon name="refresh-outline" style={{ fontSize: "18px" }} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-96">
            {msgs.map((m, i) => {
              if (m.role === "rides") {
                return (
                  <div key={i} className="flex flex-col gap-2">
                    {m.rides.map(ride => {
                      const price = ride.segmentPrice ?? ride.price;
                      return (
                        <div key={ride._id} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 animate-pop-in">
                          <div className="flex items-center gap-2 mb-2">
                            <DriverAvatar name={ride.driverName} size={32} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{ride.driverName}</p>
                              <p className="text-[10px] text-slate-400">{ride.car} · {ride.departureTime}</p>
                            </div>
                            <p className="text-sm font-bold text-amber-600 flex-shrink-0">₼{price}</p>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2.5">
                            <span className="font-semibold text-slate-700">{m.from}</span>
                            <Icon name="arrow-forward-outline" style={{ fontSize: "10px" }} />
                            <span className="font-semibold text-slate-700">{m.to}</span>
                            <span className="ml-auto">{ride.seats} seat{ride.seats !== 1 ? "s" : ""} left</span>
                          </div>
                          <div className="flex gap-2">
                            {(() => {
                              const driverId = DRIVER_PROFILES.find(d => d.name === ride.driverName)?.id;
                              return driverId ? (
                                <Link
                                  href={`/driver/${driverId}`}
                                  onClick={() => setOpen(false)}
                                  className="flex-1 bg-slate-100 text-slate-700 text-xs font-bold py-2 rounded-xl hover:bg-slate-200 active:scale-95 transition-all text-center"
                                >
                                  See profile
                                </Link>
                              ) : null;
                            })()}
                            <button
                              onClick={() => book(ride, m.from, m.to, m.date, m.seats)}
                              className="flex-1 bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl hover:bg-indigo-800 active:scale-95 transition-all"
                            >
                              Book ₼{price}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              return (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end animate-slide-right" : "justify-start animate-slide-left"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-indigo-700 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {msgs.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium hover:bg-indigo-100 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-slate-100 p-3 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send(input)}
              placeholder="e.g. Baku to Ganja tomorrow"
              className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 transition-colors"
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-indigo-700 text-white rounded-xl flex items-center justify-center hover:bg-indigo-800 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              <Icon name="send" style={{ fontSize: "16px" }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
