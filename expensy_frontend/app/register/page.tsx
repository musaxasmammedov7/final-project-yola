"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login({ name: name || "New User", email });
      router.push("/");
    }, 900);
  }

  return (
    <div className="min-h-screen bg-[#EFF6FF] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Ride<span className="text-blue-600">Link</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Intercity ride sharing</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Create account</h2>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {[
              { label: "Full name", type: "text", value: name, set: setName, placeholder: "Aga Haciyev" },
              { label: "Email", type: "email", value: email, set: setEmail, placeholder: "aga@example.com" },
              { label: "Phone number", type: "tel", value: phone, set: setPhone, placeholder: "+994 50 000 0000" },
              { label: "Password", type: "password", value: password, set: setPassword, placeholder: "Min. 8 characters" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 transition-colors"
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  required
                />
              </div>
            ))}

            <p className="text-xs text-slate-400 leading-relaxed">
              By signing up you agree to our{" "}
              <button type="button" className="text-blue-600 font-semibold hover:underline">Terms</button> and{" "}
              <button type="button" className="text-blue-600 font-semibold hover:underline">Privacy Policy</button>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
