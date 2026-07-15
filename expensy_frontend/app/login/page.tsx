"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("aga@ridelink.az");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login({ name: "Aga Haciyev", email });
      router.push("/");
    }, 800);
  }

  return (
    <div className="min-h-screen bg-[#EFF6FF] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Ride<span className="text-blue-600">Link</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Intercity ride sharing</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Welcome back</h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Email</label>
              <input
                type="email"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 transition-colors"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Password</label>
              <input
                type="password"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 transition-colors"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end">
              <button type="button" className="text-xs text-blue-600 font-semibold hover:underline">Forgot password?</button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <button
            onClick={() => { setLoading(true); setTimeout(() => { login({ name: "Aga Haciyev", email: "aga@gmail.com" }); router.push("/"); }, 800); }}
            className="w-full border border-slate-200 rounded-2xl py-3.5 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          No account?{" "}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
