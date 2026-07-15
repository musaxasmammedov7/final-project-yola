"use client";
import Icon from "@/components/Icon";
import { use, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import DriverAvatar from "@/components/DriverAvatar";
import { fetchRide, postBooking, calcSegmentPrice, saveBookingId, type ApiRide } from "@/lib/api";

function Booking({ id }: { id: string }) {
  const params = useSearchParams();
  const router = useRouter();

  const [ride, setRide]     = useState<ApiRide | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep]     = useState<"details" | "payment" | "paying" | "success">("details");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [payError, setPayError]   = useState<string | null>(null);

  const [name,   setName]   = useState("Aga Haciyev");
  const [phone,  setPhone]  = useState("+994 50 123 4567");
  const [card,   setCard]   = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv,    setCvv]    = useState("");

  useEffect(() => {
    fetchRide(id)
      .then(r => { setRide(r); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5FF]"><Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="h-32 bg-white rounded-2xl mb-4 animate-skeleton" />
        <div className="h-48 bg-white rounded-2xl animate-skeleton" />
      </div>
    </div>
  );

  if (!ride) return (
    <div className="min-h-screen bg-[#F5F5FF]"><Navbar /><div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-400">Ride not found</div></div>
  );

  const from  = params.get("from") || ride.waypoints[0].city;
  const to    = params.get("to")   || ride.waypoints[ride.waypoints.length - 1].city;
  const date  = params.get("date") || ride.date;
  const seats = Number(params.get("seats") || 1);
  const pricePerSeat = calcSegmentPrice(ride, from, to);
  const total = pricePerSeat * seats;

  async function pay() {
    setStep("paying");
    setPayError(null);
    try {
      const booking = await postBooking({
        rideId: ride!._id,
        passengerName: name,
        passengerPhone: phone,
        fromCity: from,
        toCity: to,
        date,
        seats,
      });
      saveBookingId(booking._id);
      setBookingId(booking._id);
      setStep("success");
    } catch (err: any) {
      setPayError(err.message ?? "Payment failed. Try again.");
      setStep("payment");
    }
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#F0FDF4]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-200">
            <Icon name="checkmark-circle" style={{ fontSize: "44px", color: "#16A34A" }} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">You're all set!</h1>
          <p className="text-slate-500 text-sm mb-8">Seat confirmed. Have a great trip!</p>

          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 text-left mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Trip summary</p>
            {[
              { label: "Route",     value: `${from} → ${to}` },
              { label: "Date",      value: date },
              { label: "Departure", value: `${ride.departureTime} · ${ride.waypoints[0].detail ?? from}` },
              { label: "Driver",    value: ride.driverName },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">{row.label}</span>
                <span className="font-semibold text-slate-900">{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-3 border-t border-slate-50 mt-2">
              <span className="text-slate-500">Total paid</span>
              <span className="font-bold text-green-600 text-base">&#x20BC;{total}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => router.push("/trips")} className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-sm hover:bg-green-700 transition-colors">
              View my trips
            </button>
            <Link href="/" className="w-full bg-white border border-slate-100 text-slate-600 font-semibold py-4 rounded-2xl text-sm text-center hover:border-slate-200 transition-colors block">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5FF]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/ride/${id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&seats=${seats}`}
          className="text-sm text-slate-400 hover:text-slate-700 font-medium mb-6 inline-flex items-center gap-1"
        >
          <Icon name="arrow-back-outline" style={{ fontSize: "16px" }} />
          Trip details
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">Book your seat</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {(["details", "payment"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s ? "bg-indigo-700 text-white" : (step === "payment" || step === "paying") && s === "details" ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400"
              }`}>
                {(step === "payment" || step === "paying") && s === "details"
                  ? <Icon name="checkmark" style={{ fontSize: "14px" }} />
                  : i + 1}
              </div>
              <span className={`text-xs font-semibold capitalize ${step === s ? "text-slate-900" : "text-slate-400"}`}>{s}</span>
              {i === 0 && <div className="flex-1 h-px bg-slate-200 mx-1"></div>}
            </div>
          ))}
        </div>

        {/* Trip summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <DriverAvatar name={ride.driverName} size={40} />
            <div>
              <p className="text-sm font-semibold text-slate-900">{ride.driverName}</p>
              <p className="text-xs text-slate-400">{ride.car}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xl font-bold text-amber-600">&#x20BC;{total}</p>
              <p className="text-xs text-slate-400">{seats} seat{seats > 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{from}</span>
            <Icon name="arrow-forward-outline" style={{ fontSize: "14px" }} />
            <span className="font-semibold text-slate-900">{to}</span>
            <span className="ml-auto tabular-nums">{ride.departureTime}</span>
          </div>
        </div>

        {step === "details" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Passenger info</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Full name</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 transition-colors" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Phone number</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 transition-colors" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {(step === "payment" || step === "paying") && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Payment</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Card number</label>
                <div className="relative">
                  <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 transition-colors pr-10" placeholder="1234 5678 9012 3456" value={card} onChange={e => setCard(e.target.value)} maxLength={19} />
                  <Icon name="card-outline" style={{ fontSize: "18px", color: "#94A3B8", position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Expiry</label>
                  <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 transition-colors" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} maxLength={5} />
                </div>
                <div className="w-28">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">CVV</label>
                  <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 transition-colors" placeholder="123" value={cvv} onChange={e => setCvv(e.target.value)} maxLength={3} type="password" />
                </div>
              </div>
            </div>
            {payError && <p className="text-xs text-red-500 mt-3 text-center">{payError}</p>}
            <p className="text-xs text-slate-400 mt-4 text-center flex items-center justify-center gap-1">
              <Icon name="lock-closed-outline" style={{ fontSize: "13px" }} />
              Demo only — no real payment processed
            </p>
          </div>
        )}

        <button
          onClick={() => step === "details" ? setStep("payment") : pay()}
          disabled={step === "paying"}
          className="w-full bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-sm transition-all disabled:opacity-60"
        >
          {step === "paying"
            ? "Confirming…"
            : step === "details"
            ? "Continue to payment →"
            : `Pay ₼${total} · Confirm booking`}
        </button>
      </div>
    </div>
  );
}

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense><Booking id={id} /></Suspense>;
}
