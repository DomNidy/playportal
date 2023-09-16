"use client";
import { BiTransfer } from "@react-icons/all-files/bi/BiTransfer";
import { MdLibraryMusic } from "@react-icons/all-files/md/MdLibraryMusic";
import { MdDashboard } from "@react-icons/all-files/md/MdDashboard";
import { FaUserCircle } from "@react-icons/all-files/fa/FaUserCircle";
import NavbarButton from "./NavbarButton";

import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";
import ThemeSwitcher from "../landing-page/ThemeSwitcher";
import { useEffect, useState } from "react";
import NotificationBox from "./NotificationBox";
import { useRouter } from "next/navigation";

export default function DashboardNavbar() {
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setActiveButton(window.location.pathname);
  }, []);

  return (
    <div
      className={` h-14 bg-accent-foreground shadow-lg dark:bg-background pl-[5%] pr-[5%] flex items-center m-auto
                 border-[2px] border-border border-l-0 border-t-0 border-b-1 z-50 rounded-bl-sm rounded-br-sm 
               `}
    >
      <section className="mr-4  md:flex ">
        <nav className="flex items-center sm:space-x-6 text-sm font-medium  ">
          <h3
            className="text-xl font-semibold tracking-tighter pointer-events-none 
                      text-primary-foreground dark:text-foreground"
          >
            Playportal{" "}
          </h3>
          <div
            className={`flex pt-4 sm:pt-0 sm:relative sm:border-0 border-b-[2px] absolute bg-accent-foreground dark:bg-background  items-center justify-evenly m-0 z-50 rounded-bl-sm rounded-br-sm w-full left-0 top-10 sm:top-0`}
          >
            <NavbarButton
              icon={MdDashboard}
              label={"Dashboard"}
              page_url={`${GetBaseUrl()}/dashboard`}
              active={activeButton === "/dashboard"}
              onClickCallback={() => setActiveButton("/dashboard")}
              showSelectedHighlight={true}
            />
            <NavbarButton
              icon={BiTransfer}
              label="Transfer Music"
              page_url={`${GetBaseUrl()}/dashboard/transfer`}
              active={activeButton === "/dashboard/transfer"}
              onClickCallback={() => setActiveButton("/dashboard/transfer")}
              showSelectedHighlight={true}
            />{" "}
            <NavbarButton
              icon={MdLibraryMusic}
              label="Playlist Gallery"
              page_url={`${GetBaseUrl()}dashboard/playlists`}
              active={activeButton === "/dashboard/playlists"}
              onClickCallback={() => setActiveButton("/dashboard/playlists")}
              showSelectedHighlight={true}
            />
            <FaUserCircle
              onClick={() => router.push(`${GetBaseUrl()}dashboard/account`)}
              className="sm:hidden block text-xl transition-colors  
          group-hover:text-foreground/80 dark:text-foreground/80  text-primary-foreground/80 saturate-50 cursor-pointer"
            ></FaUserCircle>
          </div>
        </nav>
      </section>

      <div className="md:w-auto w-full flex flex-1 justify-end  space-x-6 items-center">
        <ThemeSwitcher></ThemeSwitcher>
        <FaUserCircle
          onClick={() => router.push(`${GetBaseUrl()}dashboard/account`)}
          className="sm:block hidden text-xl transition-colors  
          group-hover:text-foreground/80 dark:text-foreground/80  text-primary-foreground/80 saturate-50 cursor-pointer"
        ></FaUserCircle>
        <NotificationBox />
      </div>
    </div>
  );
}
