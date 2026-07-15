"use client";
import { use, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import { RIDES } from "@/lib/data";

const TAGS = [
  { label: "Clean car",        icon: "sparkles-outline" },
  { label: "Great driver",     icon: "thumbs-up-outline" },
  { label: "On time",          icon: "time-outline" },
  { label: "Smooth ride",      icon: "car-outline" },
  { label: "Friendly",         icon: "happy-outline" },
  { label: "Safe driving",     icon: "shield-checkmark-outline" },
  { label: "Good music",       icon: "musical-notes-outline" },
  { label: "Would ride again", icon: "heart-outline" },
];

function StarRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Icon
            name={(hover || value) >= s ? "star" : "star-outline"}
            style={{ fontSize: "40px", color: (hover || value) >= s ? "#FBBF24" : "#CBD5E1" }}
          />
        </button>
      ))}
    </div>
  );
}

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

function Rate({ id }: { id: string }) {
  const router = useRouter();
  const ride = RIDES.find(r => r.id === id) ?? RIDES[0];
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function toggleTag(label: string) {
    setTags(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]);
  }

  function submit() {
    if (!stars) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F5FF] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-yellow-100">
            <Icon name="star" style={{ fontSize: "48px", color: "#FBBF24" }} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Thanks for rating!</h1>
          <p className="text-slate-400 text-sm mb-8">Your feedback helps make Yola better for everyone.</p>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Icon name="person-circle-outline" style={{ fontSize: "28px", color: "#4338CA" }} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{ride.driver.name}</p>
                <p className="text-xs text-slate-400">{ride.car}</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Icon key={s} name="star" style={{ fontSize: "14px", color: s <= stars ? "#FBBF24" : "#E2E8F0" }} />
                ))}
              </div>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">{t}</span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/" className="w-full bg-indigo-700 text-white font-bold py-4 rounded-2xl text-sm text-center hover:bg-indigo-800 transition-colors block">
              Back to home
            </Link>
            <Link href="/trips" className="w-full bg-white border border-slate-100 text-slate-600 font-semibold py-4 rounded-2xl text-sm text-center hover:border-indigo-200 transition-colors block">
              View my trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5FF]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/tracking/${id}`} className="text-slate-400 hover:text-slate-700 transition-colors">
            <Icon name="arrow-back-outline" style={{ fontSize: "22px" }} />
          </Link>
          <h1 className="text-base font-bold text-slate-900">Rate your trip</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Trip summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Icon name="person-circle-outline" style={{ fontSize: "40px", color: "#4338CA" }} />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-slate-900">{ride.driver.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{ride.car} · {ride.carColor}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {ride.waypoints[0].city} → {ride.waypoints[ride.waypoints.length - 1].city} · {ride.date}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Previous rating</p>
            <p className="text-sm font-bold text-indigo-700 flex items-center gap-0.5 justify-end mt-0.5">
              <Icon name="star" style={{ fontSize: "13px", color: "#FBBF24" }} />
              {ride.driver.rating}
            </p>
          </div>
        </div>

        {/* Stars */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-5">How was your ride?</p>
          <StarRow value={stars} onChange={setStars} />
          <p className={`text-sm font-bold mt-3 transition-all ${stars ? "text-slate-900" : "text-transparent"}`}>
            {RATING_LABELS[stars]}
          </p>
        </div>

        {/* Tags — only show after star selected */}
        {stars > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">What went well?</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => {
                const active = tags.includes(tag.label);
                return (
                  <button
                    key={tag.label}
                    onClick={() => toggleTag(tag.label)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? "bg-indigo-700 text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 border border-slate-100 hover:border-indigo-300"
                    }`}
                  >
                    <Icon name={tag.icon} style={{ fontSize: "13px" }} />
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Comment */}
        {stars > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Leave a comment (optional)</p>
            <textarea
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 transition-colors resize-none"
              rows={3}
              placeholder="Tell us more about your experience…"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={submit}
          disabled={!stars}
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-4 rounded-2xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit rating
        </button>

        <button
          onClick={() => router.push("/")}
          className="w-full text-slate-400 font-medium py-3 text-sm hover:text-slate-600 transition-colors mt-2"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

export default function RatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense><Rate id={id} /></Suspense>;
}
