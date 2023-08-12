"use client";
import { Noto_Sans } from "next/font/google";
import Sidebar from "@/components/dashboard/Sidebar";
import { useEffect, useState } from "react";
import { getFirebaseApp } from "@/lib/utility/GetFirebaseApp";
import { AuthContext } from "@/lib/contexts/AuthContext";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";

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

  const handleSidebarMinimize = (minimized: boolean) => {
    setMinimized(minimized);
  };

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
        <Sidebar onSidebarMinimize={handleSidebarMinimize} />

        <div
          className={
            minimized
              ? "pl-[2.2rem] sm:pl-[2.7rem] md:pl-[3.1rem] lg:pl-[3.9rem]  transition-all"
              : "pl-[6.7rem] sm:pl-[7.4rem] md:pl-[9.5rem] lg:pl-[11.9rem]  transition-all"
          }
        >
          {children}
        </div>
      </div>
    </AuthContext.Provider>
  );
}
