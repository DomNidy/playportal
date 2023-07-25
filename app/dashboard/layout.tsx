"use client";

import { Inter } from "next/font/google";
import { Noto_Sans } from "next/font/google";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

const noto_sans = Noto_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [minimized, setMinimized] = useState<boolean>(false);

  const handleSidebarMinimize = (minimized: boolean) => {
    setMinimized(minimized);
  };

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
