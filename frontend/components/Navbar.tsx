"use client";
import Icon from "@/components/Icon";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isHome = path === "/";
  const isAuth = path === "/login" || path === "/register";

  if (isAuth) return null;

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-slate-900">
          Yo<span className="text-indigo-700">la</span>
        </Link>
        <div className="flex items-center gap-3">
          {!isHome && (
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1">
              <Icon name="arrow-back-outline" style={{ fontSize: "16px" }} />
              Home
            </Link>
          )}
          {user ? (
            <>
              <Link
                href="/offer"
                className="bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors flex items-center gap-1.5"
              >
                <Icon name="add-outline" style={{ fontSize: "16px" }} />
                Offer a ride
              </Link>
              <Link href="/trips" className="text-slate-400 hover:text-indigo-700 transition-colors">
                <Icon name="map-outline" style={{ fontSize: "22px" }} />
              </Link>
              <button
                onClick={() => { logout(); router.push("/login"); }}
                className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold text-white hover:bg-indigo-800 transition-colors"
                title="Sign out"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-700 transition-colors">Sign in</Link>
              <Link href="/register" className="bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-800 transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
