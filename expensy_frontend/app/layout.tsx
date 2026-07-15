import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Yola",
  description: "Intercity ride sharing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js" async></script>
      </head>
      <body className="min-h-full pb-16 md:pb-0">
        <AuthProvider>
          {children}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
