"use client";

import { getAuth } from "firebase/auth";

import { BiTransfer } from "@react-icons/all-files/bi/BiTransfer";
import { FaSignOutAlt } from "@react-icons/all-files/fa/FaSignOutAlt";
import { BsPeople } from "@react-icons/all-files/bs/BsPeople";
import { MdMusicVideo } from "@react-icons/all-files/md/MdMusicVideo";
import { BiMenu } from "@react-icons/all-files/bi/BiMenu";
import { MdDashboard } from "@react-icons/all-files/md/MdDashboard";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavbarButton from "./NavbarButton";
import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";

import ThemeSwitcher from "../landing-page/ThemeSwitcher";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function DashboardNavbar({ params }: { params: any }) {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  useEffect(() => {
    setActiveButton(window.location.pathname);
  }, []);

  return (
    <div
      className={` h-14 bg-accent-foreground   shadow-lg dark:bg-background  pl-8 pr-8 md:pl-12 md:pr-12 lg:pl-24 lg:pr-24 flex items-center m-auto
                 border-[1px] border-border border-l-0 border-t-0 border-b-1 z-50 rounded-bl-sm rounded-br-sm 
               `}
    >
      <section className="mr-4  lg:flex">
        <nav className="flex items-center space-x-6 text-sm font-medium ">
          <h3
            className="text-xl  font-semibold tracking-tighter pointer-events-none 
                      text-primary-foreground dark:text-foreground"
          >
            Playportal{" "}
          </h3>
          <div className="hidden sm:flex space-x-6">
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
              icon={MdMusicVideo}
              label="Playlists"
              page_url={`${GetBaseUrl()}dashboard/playlists`}
              active={activeButton === "/dashboard/playlists"}
              onClickCallback={() => setActiveButton("/dashboard/playlists")}
            />
            <NavbarButton
              icon={BsPeople}
              label={"Connections"}
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
        <Sheet>
          <SheetTrigger asChild className="mr-4 ">
            <div
              className="inline-flex hover:bg-primary/30 items-center justify-center rounded-md font-medium focus-visible:ring-0 
                            focus-visible:ring-offset-0 sm:hidden p-1 transition-all cursor-pointer"
            >
              <BiMenu
                className="text-xl  hover:bg-opacity-20 space-x-2 cursor-pointer 
                           rounded-lg transition-colors dark:text-foreground text-primary-foreground
                           "
              ></BiMenu>
            </div>
          </SheetTrigger>
          <SheetContent side={"left"}>
            <SheetHeader>
              <SheetTitle>
                <h2 className="text-3xl font-semibold pointer-events-none text-left pb-4 ">
                  Playportal
                </h2>
              </SheetTitle>
            </SheetHeader>
            <div className=" flex flex-col space-y-2 ">
              <h4 className="font-medium text-xl tracking-tight pointer-events-none">
                Links
              </h4>
              <a
                href={`${GetBaseUrl()}dashboard`}
                onClick={() => setActiveButton("Dashboard")}
                className="text-lg text-muted-foreground tracking-tight cursor-pointer hover:text-foreground/80 transition-all"
              >
                Dashboard
              </a>
              <a
                href={"/dashboard/playlists"}
                onClick={() => setActiveButton("Playlists")}
                className="text-lg text-muted-foreground tracking-tight cursor-pointer hover:text-foreground/80 transition-all"
              >
                Playlists
              </a>
              <a
                href={"/dashboard/connections"}
                onClick={() => setActiveButton("Connections")}
                className="text-lg text-muted-foreground tracking-tight cursor-pointer hover:text-foreground/80 transition-all"
              >
                Connections
              </a>
              <a
                href={"/dashboard/transfer"}
                onClick={() => setActiveButton("Transfer Music")}
                className="text-lg text-muted-foreground tracking-tight cursor-pointer hover:text-foreground/80 transition-all"
              >
                Transfer Music
              </a>
            </div>{" "}
            <a
              onClick={() => getAuth().signOut()}
              className="text-lg text-muted-foreground tracking-tight cursor-pointer hover:text-foreground/80 transition-all self-end fixed bottom-4"
            >
              Logout
            </a>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
