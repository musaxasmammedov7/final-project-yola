"use client";
import Icon from "@/components/Icon";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";

const MENU = [
  { icon: "create-outline",       label: "Edit profile",     href: "/edit-profile" },
  { icon: "map-outline",          label: "My trips",         href: "/trips" },
  { icon: "car-sport-outline",    label: "Offer a ride",     href: "/offer" },
  { icon: "star-outline",         label: "Reviews",          href: "#" },
  { icon: "card-outline",         label: "Payment methods",  href: "#" },
  { icon: "notifications-outline",label: "Notifications",    href: "#" },
  { icon: "settings-outline",     label: "Settings",         href: "#" },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const name     = user?.name  || "Guest";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Avatar + stats */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-4 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-md overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              : initials
            }
          </div>
          <h1 className="text-xl font-bold text-slate-900">{name}</h1>
          {user?.email && <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>}
          {user?.bio && <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">{user.bio}</p>}
          <p className="text-xs text-slate-300 mt-1">Member since Jan 2025</p>

          <div className="flex items-center justify-center gap-6 mt-5 pt-5 border-t border-slate-50">
            {[
              { value: "4.8", label: "Rating",    icon: "star" },
              { value: "12",  label: "Trips",     icon: "map-outline" },
              { value: "3",   label: "As driver", icon: "car-outline" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-6">
                {i > 0 && <div className="w-px h-8 bg-slate-100 -ml-6" />}
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900 flex items-center justify-center gap-1">
                    {stat.value}
                    {stat.icon === "star" && <Icon name="star" style={{ fontSize: "14px", color: "#FBBF24" }} />}
                  </p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="flex flex-col gap-2">
          {MENU.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4 hover:border-blue-200 transition-colors"
            >
              <Icon name={item.icon} style={{ fontSize: "22px", color: "#2563EB", width: "28px" }} />
              <span className="text-sm font-semibold text-slate-700 flex-1">{item.label}</span>
              <Icon name="chevron-forward-outline" style={{ fontSize: "16px", color: "#CBD5E1" }} />
            </Link>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-6 text-sm text-red-400 font-semibold py-4 hover:text-red-600 transition-colors flex items-center justify-center gap-1.5"
        >
          <Icon name="log-out-outline" style={{ fontSize: "16px" }} />
          Sign out
        </button>
      </div>
    </div>
  );
}
