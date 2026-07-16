"use client";
import { use, Suspense, useState, useRef } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { DRIVER_PROFILES, RIDES } from "@/lib/data";

function StarBar({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Icon
          key={i}
          name={i < Math.floor(rating) ? "star" : i < rating ? "star-half-outline" : "star-outline"}
          style={{ fontSize: "14px", color: "#FBBF24" }}
        />
      ))}
    </div>
  );
}

function CarCarousel({ driver }: { driver: NonNullable<ReturnType<typeof DRIVER_PROFILES.find>> }) {
  const slides: { photo?: string; bg?: string; emoji?: string; label: string }[] =
    driver.carPhotos
      ? driver.carPhotos.map((photo, i) => ({ photo, label: ["Exterior", "Interior", "Wheels"][i] ?? `Photo ${i + 1}` }))
      : [
          { bg: driver.carBgColor, emoji: "🚗", label: "Exterior" },
          { bg: "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)", emoji: "🛞", label: "Wheels" },
          { bg: "linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)", emoji: "💺", label: "Interior" },
        ];
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) setIdx(i => (i + (dx < 0 ? 1 : -1) + slides.length) % slides.length);
    touchX.current = null;
  }

  return (
    <div>
      {/* Swipeable photo */}
      <div
        className="h-52 rounded-2xl mx-4 flex items-center justify-center relative overflow-hidden select-none"
        style={{ background: slides[idx].bg }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides[idx].photo ? (
          <img src={slides[idx].photo} alt={slides[idx].label} className="w-full h-full object-cover" />
        ) : (
          <span style={{ fontSize: "80px", filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.2))", userSelect: "none" }}>
            {slides[idx].emoji}
          </span>
        )}
        {/* dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-4" : "bg-white/50"}`}
            />
          ))}
        </div>
        {/* arrow hints */}
        {idx > 0 && (
          <button onClick={() => setIdx(i => i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 flex items-center justify-center">
            <Icon name="chevron-back-outline" style={{ fontSize: "16px", color: "#fff" }} />
          </button>
        )}
        {idx < slides.length - 1 && (
          <button onClick={() => setIdx(i => i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 flex items-center justify-center">
            <Icon name="chevron-forward-outline" style={{ fontSize: "16px", color: "#fff" }} />
          </button>
        )}
      </div>

      {/* Car info below image */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-slate-900">{driver.carYear} {driver.car}</p>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block border border-slate-200" style={{ background: driver.carColor.toLowerCase() }} />
            {driver.carColor}
          </p>
        </div>
        <span className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
          <Icon name="shield-checkmark-outline" style={{ fontSize: "12px" }} />
          Verified
        </span>
      </div>

    </div>
  );
}

function DriverPage({ id }: { id: string }) {
  const driver = DRIVER_PROFILES.find(d => d.id === id);

  if (!driver) return (
    <div className="min-h-screen bg-[#F5F5FF] flex items-center justify-center">
      <p className="text-slate-400">Driver not found</p>
    </div>
  );

  const driverRides = RIDES.filter(r => r.driverId === id);

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: driver.reviews.filter(r => r.rating === star).length,
    pct: driver.reviews.length
      ? Math.round((driver.reviews.filter(r => r.rating === star).length / driver.reviews.length) * 100)
      : 0,
  }));

  return (
    <div className="min-h-screen bg-[#F5F5FF]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => history.back()} className="text-slate-400 hover:text-slate-700 transition-colors">
            <Icon name="arrow-back-outline" style={{ fontSize: "22px" }} />
          </button>
          <h1 className="text-base font-bold text-slate-900">Driver Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-4">

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md"
              style={{ background: driver.avatarColor }}
            >
              {driver.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{driver.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <Icon name="calendar-outline" style={{ fontSize: "12px" }} />
                    Member since {driver.joined}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <Icon name="star" style={{ fontSize: "16px", color: "#FBBF24" }} />
                    <span className="text-lg font-bold text-slate-900">{driver.rating}</span>
                  </div>
                  <p className="text-xs text-slate-400">{driver.trips} trips</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">{driver.bio}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-50">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-700">{driver.trips}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Trips</p>
            </div>
            <div className="text-center border-x border-slate-50">
              <p className="text-2xl font-bold text-indigo-700">{driver.rating}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-700">{driver.fiveStarPct}%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">5-star rides</p>
            </div>
          </div>
        </div>

        {/* Car photos */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Car photos</p>
          </div>
          <CarCarousel driver={driver} />
        </div>

        {/* Rating breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Rating breakdown</p>
          <div className="flex gap-6 items-center">
            <div className="text-center flex-shrink-0">
              <p className="text-5xl font-black text-slate-900">{driver.rating}</p>
              <StarBar rating={driver.rating} />
              <p className="text-xs text-slate-400 mt-1">{driver.reviews.length} reviews</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {ratingBreakdown.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 w-3 text-right">{star}</span>
                  <Icon name="star" style={{ fontSize: "11px", color: "#FBBF24" }} />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-5">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            Reviews ({driver.reviews.length})
          </p>
          <div className="space-y-4">
            {driver.reviews.map(review => (
              <div key={review.id} className="pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="flex items-start gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: `hsl(${review.author.charCodeAt(0) * 7 % 360}, 60%, 50%)` }}
                  >
                    {review.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{review.author}</p>
                      <p className="text-xs text-slate-400">{review.date}</p>
                    </div>
                    <StarBar rating={review.rating} />
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed ml-12">{review.text}</p>
                {review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-12">
                    {review.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming rides by driver */}
        {driverRides.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Upcoming rides</p>
            <div className="space-y-3">
              {driverRides.map(ride => (
                <Link
                  key={ride.id}
                  href={`/ride/${ride.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="car-outline" style={{ fontSize: "18px", color: "#4338CA" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {ride.waypoints[0].city} → {ride.waypoints[ride.waypoints.length - 1].city}
                    </p>
                    <p className="text-xs text-slate-400">{ride.date} · {ride.departureTime}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-indigo-700">&#x20BC;{ride.price}</p>
                    <p className="text-xs text-slate-400">{ride.seats} seats</p>
                  </div>
                  <Icon name="chevron-forward-outline" style={{ fontSize: "16px", color: "#94A3B8" }} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DriverProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense><DriverPage id={id} /></Suspense>;
}
