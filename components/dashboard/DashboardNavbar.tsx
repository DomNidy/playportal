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
import { useState } from "react";

export default function DashboardNavbar() {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  return (
    <div
      className={` h-14    shadow-lg dark:bg-background  pl-8 pr-8 md:pl-12 md:pr-12 lg:pl-24 lg:pr-24 flex items-center m-auto
                 border-[1px] border-border border-l-0 border-t-0 border-b-1 z-10 rounded-bl-sm rounded-br-sm
               `}
    >
      <section className="mr-4  lg:flex">
        <nav className="flex items-center space-x-6 text-sm font-medium ">
          <h3 className="text-xl  font-semibold tracking-tighter text-primary/80 pointer-events-none ">
            Playportal{" "}
          </h3>
          <div className="hidden sm:flex space-x-6">
            <NavbarButton
              onClickCallback={() => setActiveButton("Dashboard")}
              icon={MdDashboard}
              label={"Dashboard"}
              page_url={`${GetBaseUrl()}/dashboard`}
              active={activeButton === "Dashboard"}
            />
            <NavbarButton
              icon={BiTransfer}
              label="Transfer Music"
              page_url={`${GetBaseUrl()}/dashboard/transfer`}
              active={activeButton === "Transfer Music"}
              onClickCallback={() => setActiveButton("Transfer Music")}
            />{" "}
            <NavbarButton
              icon={MdMusicVideo}
              label="Playlists"
              page_url={`${GetBaseUrl()}/dashboard/playlists`}
              active={activeButton === "Playlists"}
              onClickCallback={() => setActiveButton("Playlists")}
            />
            <NavbarButton
              icon={BsPeople}
              label={"Connections"}
              page_url={`${GetBaseUrl()}/dashboard/connections`}
              active={activeButton === "Connections"}
              onClickCallback={() => setActiveButton("Connections")}
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
                className="text-xl text-foreground   hover:bg-opacity-20 space-x-2 cursor-pointer 
      rounded-lg transition-colors "
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
              <a className="text-lg text-muted-foreground tracking-tight cursor-pointer hover:text-foreground/80 transition-all">
                Dashboard
              </a>
              <a className="text-lg text-muted-foreground tracking-tight cursor-pointer hover:text-foreground/80 transition-all">
                Playlists
              </a>
              <a className="text-lg text-muted-foreground tracking-tight cursor-pointer hover:text-foreground/80 transition-all">
                Connections
              </a>
              <a className="text-lg text-muted-foreground tracking-tight cursor-pointer hover:text-foreground/80 transition-all">
                Transfer Music
              </a>
            </div>{" "}
            <a className="text-lg text-muted-foreground tracking-tight cursor-pointer hover:text-foreground/80 transition-all self-end fixed bottom-4">
              Logout
            </a>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
