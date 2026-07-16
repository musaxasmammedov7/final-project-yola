"use client";
import { use, Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { RIDES } from "@/lib/data";

type Message = { id: number; from: "me" | "driver"; text: string; time: string };

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const INITIAL: Message[] = [
  { id: 1, from: "driver", text: "Hello! I'm on my way to pick you up 👋", time: "08:45" },
  { id: 2, from: "driver", text: "I'll be at 28 May Metro in about 10 minutes", time: "08:46" },
];

const AUTO_REPLIES = [
  "Sure, no problem!",
  "I'm just around the corner.",
  "Got it, I'll wait for you there.",
  "We should arrive on time.",
  "Yes, the traffic is clear today.",
  "Ok, see you soon!",
];

function Chat({ id }: { id: string }) {
  const ride = RIDES.find(r => r.id === id) ?? RIDES[0];
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const msg: Message = { id: Date.now(), from: "me", text, time: now() };
    setMessages(prev => [...prev, msg]);
    setInput("");

    // simulate driver typing then replying
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply: Message = {
        id: Date.now() + 1,
        from: "driver",
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        time: now(),
      };
      setMessages(prev => [...prev, reply]);
    }, 1200 + Math.random() * 800);
  }

  return (
    <div className="min-h-screen bg-[#F5F5FF] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/tracking/${id}`} className="text-slate-400 hover:text-slate-700 transition-colors">
            <Icon name="arrow-back-outline" style={{ fontSize: "22px" }} />
          </Link>
          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Icon name="person-circle-outline" style={{ fontSize: "28px", color: "#4338CA" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">{ride.driver.name}</p>
            <p className="text-xs text-green-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
              Online · {ride.car}
            </p>
          </div>
          <a href="tel:+994501234567" className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors">
            <Icon name="call-outline" style={{ fontSize: "18px", color: "#22C55E" }} />
          </a>
        </div>
      </div>

      {/* Route banner */}
      <div className="bg-indigo-700 text-white text-xs font-semibold text-center py-2 flex items-center justify-center gap-2">
        <Icon name="location-outline" style={{ fontSize: "13px" }} />
        {ride.waypoints[0].city} → {ride.waypoints[ride.waypoints.length - 1].city} · {ride.date} {ride.departureTime}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl w-full mx-auto space-y-3 pb-32 md:pb-6">
        {/* Ride summary card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mx-auto max-w-xs text-center mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Your trip</p>
          <p className="text-sm font-bold text-slate-900">
            {ride.waypoints[0].city} → {ride.waypoints[ride.waypoints.length - 1].city}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{ride.date} · {ride.departureTime} · {ride.car}</p>
          {ride.waypoints.length > 2 && (
            <p className="text-[10px] text-slate-400 mt-1">
              via {ride.waypoints.slice(1, -1).map(w => w.city).join(", ")}
            </p>
          )}
        </div>

        {/* Date separator */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400 font-medium">Today</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
            {msg.from === "driver" && (
              <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
                <Icon name="person-circle-outline" style={{ fontSize: "20px", color: "#4338CA" }} />
              </div>
            )}
            <div className={`max-w-[75%] ${msg.from === "me" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                msg.from === "me"
                  ? "bg-indigo-700 text-white rounded-br-sm"
                  : "bg-white text-slate-900 border border-slate-100 shadow-sm rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
              <Icon name="person-circle-outline" style={{ fontSize: "20px", color: "#4338CA" }} />
            </div>
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-gradient-to-t from-[#F5F5FF] to-transparent pt-4 pb-2 px-4">
        <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["I'm here 👋", "On my way", "5 min late", "Where are you?", "Thanks!"].map(q => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              className="flex-shrink-0 bg-white border border-slate-200 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 pb-safe md:pb-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <input
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 transition-colors"
            placeholder="Message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-full bg-indigo-700 hover:bg-indigo-800 transition-colors flex items-center justify-center disabled:opacity-40 flex-shrink-0"
          >
            <Icon name="send" style={{ fontSize: "18px", color: "#fff" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense><Chat id={id} /></Suspense>;
}
