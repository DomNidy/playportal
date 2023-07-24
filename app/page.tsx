import { Suspense } from "react";
import HeroText from "./components/landing-page/HeroText";
import Navbar from "./components/landing-page/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      {/* This is our main div (it has top padding in it, this accounts for the navbar) */}
      <main className="w-full min-h-screen bg-gray-100 pt-14 pb-1 ">
        <div className="w-full min-h-[20rem] flex items-center justify-center hero cursor-default drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.4)]">
          <HeroText />
        </div>
        <div className="h-[200px] text-slate-700"></div>
      </main>
    </div>
  );
}
