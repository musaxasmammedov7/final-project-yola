"use client";
import Icon from "@/components/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/",        icon: "home-outline",        iconActive: "home",        label: "Home"    },
  { href: "/results", icon: "search-outline",       iconActive: "search",      label: "Search"  },
  { href: "/trips",   icon: "map-outline",          iconActive: "map",         label: "Trips"   },
  { href: "/profile", icon: "person-outline",       iconActive: "person",      label: "Profile" },
];

export default function BottomNav() {
  const path = usePathname();
  const isAuth = path === "/login" || path === "/register";
  if (isAuth) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 safe-area-pb md:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {TABS.map(tab => {
          const active = tab.href === "/" ? path === "/" : path.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? "text-blue-600" : "text-slate-400"
              }`}
            >
              <Icon
                name={active ? tab.iconActive : tab.icon}
                style={{ fontSize: "22px" }}
              />
              <span className={`text-[10px] font-semibold ${active ? "text-blue-600" : "text-slate-400"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
