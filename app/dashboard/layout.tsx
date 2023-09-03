"use client";
import { Noto_Sans } from "next/font/google";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useEffect, useState } from "react";
import { getFirebaseApp } from "@/lib/utility/GetFirebaseApp";
import { AuthContext } from "@/lib/contexts/AuthContext";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";
import DashboardRedirectHandler from "@/components/dashboard/DashboardRedirectHandler";

const noto_sans = Noto_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  getFirebaseApp();
  const router = useRouter();
  const [minimized, setMinimized] = useState<boolean>(false);

  useEffect(() => {
    // Add an even listener when user enters the dashboard route
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (!user) {
        console.log("User is not logged in redirecting to login page.");
        router.replace(`${GetBaseUrl()}login`);
      }
    });

    return unsubscribe;
  });

  return (
    <AuthContext.Provider value={getAuth()}>
      <div className={noto_sans.className}>
        <header className="backdrop-blur bg-background/95  supports-backdrop-blur:bg-background/60  sticky top-0 z-50 w-full">
          <DashboardNavbar />
        </header>
        <DashboardRedirectHandler />
        {children}
      </div>
    </AuthContext.Provider>
  );
}
