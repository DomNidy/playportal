"use client";

import { Inter } from "next/font/google";
import { Noto_Sans } from "next/font/google";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { GetBaseUrl } from "../utility/GetBaseUrl";

const noto_sans = Noto_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [minimized, setMinimized] = useState<boolean>(false);

  const [auth, setAuth] = useState(getAuth());

  const handleSidebarMinimize = (minimized: boolean) => {
    setMinimized(minimized);
  };

  useEffect(() => {
    auth.onAuthStateChanged((newState) => {
      if (!newState) {
        router.push(`${GetBaseUrl()}/login`);
      }
    });
  }, [auth, router]);

  if (!auth.currentUser) {
    return (
      <div className="flex flex-col items-center min-w-screen">
        <h1 className="font-semibold text-3xl">
          You are not logged in, redirecting to login page...
        </h1>
        <h1
          className="text-neutral-700  hover:text-blue-400 cursor-pointer"
          onClick={() => router.push(`${GetBaseUrl()}/login`)}
        >
          Click here if you are not automatically redirected
        </h1>
      </div>
    );
  }

  return (
    <div className={noto_sans.className}>
      <Sidebar onSidebarMinimize={handleSidebarMinimize} />
      <div
        className={
          minimized
            ? "pl-[2.2rem] sm:pl-[2.7rem] md:pl-[3.1rem] lg:pl-[3.9rem] transition-all"
            : "pl-[6.7rem] sm:pl-[7.4rem] md:pl-[9.5rem] lg:pl-[11.9rem] transition-all"
        }
      >
        {" "}
        {children}
      </div>
    </div>
  );
}
