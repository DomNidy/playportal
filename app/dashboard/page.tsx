import { Metadata } from "next";
import connectAccountSVG from "@/public/dashboard-connect-account.svg";
import Image from "next/image";
import Link from "next/link";
import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "The playportal dashboard.",
};

export default function Dashboard() {
  return (
    <div
      className="min-h-screen flex-1 w-full bg-background text-center flex flex-col mt-14 py-20
     md:px-20 lg:px-36 xl:px-[11rem] 2xl:px-64 px-8"
    >
      <h1 className="text-[2.35rem] font-semibold tracking-tighter w-[370px] text-[#1C0B39] dark:text-foreground text-start self-start">
        Dashboard
      </h1>
      <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 justify-items-center gap-12  sm:gap-y-6 mt-12 w-full ">
        <Link
          href={`${GetBaseUrl()}dashboard/account`}
          className="dashboard-nav-card  px-4 py-8 hover:scale-110 transition-transform duration-100 lg:justify-self-start"
        >
          <h3 className="dashboard-nav-card-text ">
            Connect a streaming service
          </h3>
        </Link>{" "}
        <Link
          href={`${GetBaseUrl()}dashboard/transfer`}
          className="dashboard-nav-card px-4 py-8 hover:scale-110 transition-transform duration-100 lg:justify-self-center"
        >
          <h3 className="dashboard-nav-card-text ">Transfer a playlist</h3>
        </Link>{" "}
        <Link
          href={`${GetBaseUrl()}dashboard/playlists`}
          className="dashboard-nav-card dashboard- px-4 py-8 hover:scale-110 transition-transform duration-100 lg:justify-self-end"
        >
          <h3 className="dashboard-nav-card-text">
            View your playlist gallery
          </h3>
        </Link>{" "}
        <Link
          href={`${GetBaseUrl()}dashboard/history`}
          className="dashboard-nav-card px-4 py-8 hover:scale-110 transition-transform duration-100 lg:justify-self-start"
        >
          <h3 className="dashboard-nav-card-text">
            View past playlist transfers
          </h3>
        </Link>{" "}
        <a
          href={`${GetBaseUrl()}dashboard/account#connections`}
          className="dashboard-nav-card px-4 py-8 hover:scale-110 transition-transform duration-100 lg:justify-self-center"
        >
          <h3 className="dashboard-nav-card-text">Manage account settings</h3>
        </a>
      </div>
    </div>
  );
}
