"use client";
import { getAuth } from "firebase/auth";
import { BiTransfer } from "@react-icons/all-files/bi/BiTransfer";
import { FaSignOutAlt } from "@react-icons/all-files/fa/FaSignOutAlt";
import { BsPeople } from "@react-icons/all-files/bs/BsPeople";
import { MdMusicVideo } from "@react-icons/all-files/md/MdMusicVideo";
import { BiMenu } from "@react-icons/all-files/bi/BiMenu";
import { MdDashboard } from "@react-icons/all-files/md/MdDashboard";
import { FaScroll } from "@react-icons/all-files/fa/FaScroll";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavbarButton from "./NavbarButton";
import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";
import ThemeSwitcher from "../landing-page/ThemeSwitcher";
import { useEffect, useState } from "react";

export default function DashboardNavbar() {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  useEffect(() => {
    setActiveButton(window.location.pathname);
  }, []);

  return (
    <div
      className={` h-14 bg-accent-foreground   shadow-lg dark:bg-background  pl-[5%] pr-[5%] flex items-center m-auto
                 border-[1px] border-border border-l-0 border-t-0 border-b-1 z-50 rounded-bl-sm rounded-br-sm 
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
            className={`flex sm:relative absolute bg-accent-foreground dark:bg-background items-center justify-evenly m-0 z-50 rounded-bl-sm rounded-br-sm w-full left-0 top-10 sm:top-0`}
          >
            <NavbarButton
              icon={MdDashboard}
              label={"Dashboard"}
              page_url={`${GetBaseUrl()}/dashboard`}
              active={activeButton === "/dashboard"}
              onClickCallback={() => setActiveButton("/dashboard")}
            />
            <NavbarButton
              icon={BiTransfer}
              label="Transfer Music"
              page_url={`${GetBaseUrl()}/dashboard/transfer`}
              active={activeButton === "/dashboard/transfer"}
              onClickCallback={() => setActiveButton("/dashboard/transfer")}
            />{" "}
            <NavbarButton
              icon={FaScroll}
              label={"Transfer History"}
              page_url={`${GetBaseUrl()}/dashboard/history`}
              active={activeButton === "/dashboard/history"}
              onClickCallback={() => setActiveButton("/dashboard/history")}
            />
            <NavbarButton
              icon={MdMusicVideo}
              label="Playlist Gallery"
              page_url={`${GetBaseUrl()}dashboard/playlists`}
              active={activeButton === "/dashboard/playlists"}
              onClickCallback={() => setActiveButton("/dashboard/playlists")}
            />
            <NavbarButton
              icon={BsPeople}
              label={"Connected Accounts"}
              page_url={`${GetBaseUrl()}/dashboard/connections`}
              active={activeButton === "/dashboard/connections"}
              onClickCallback={() => setActiveButton("/dashboard/connections")}
            />
            <NavbarButton
              onClickCallback={() => getAuth().signOut()}
              icon={FaSignOutAlt}
              label={"Logout"}
              page_url={`${GetBaseUrl()}/login`}
              active={activeButton === "Logout"}
            />
          </div>
        </nav>
      </section>

      <div className="md:w-auto w-full flex flex-1 justify-end  space-x-6 items-center">
        <ThemeSwitcher></ThemeSwitcher>
      </div>
    </div>
  );
}
