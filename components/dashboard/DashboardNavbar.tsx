"use client";
import { getAuth } from "firebase/auth";
import { BiTransfer } from "@react-icons/all-files/bi/BiTransfer";
import { FaSignOutAlt } from "@react-icons/all-files/fa/FaSignOutAlt";
import { MdLibraryMusic } from "@react-icons/all-files/md/MdLibraryMusic";
import { IoMdPeople } from "@react-icons/all-files/io/IoMdPeople";
import { MdDashboard } from "@react-icons/all-files/md/MdDashboard";
import { FaScroll } from "@react-icons/all-files/fa/FaScroll";

import NavbarButton from "./NavbarButton";
import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";
import ThemeSwitcher from "../landing-page/ThemeSwitcher";
import { useEffect, useState } from "react";
import NotificationBox from "./NotificationBox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export default function DashboardNavbar() {
  const [activeButton, setActiveButton] = useState<string | null>(null);

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
              icon={MdLibraryMusic}
              label="Playlist Gallery"
              page_url={`${GetBaseUrl()}dashboard/playlists`}
              active={activeButton === "/dashboard/playlists"}
              onClickCallback={() => setActiveButton("/dashboard/playlists")}
            />
            <NavbarButton
              icon={IoMdPeople}
              label={"Connected Accounts"}
              page_url={`${GetBaseUrl()}/dashboard/connections`}
              active={activeButton === "/dashboard/connections"}
              onClickCallback={() => setActiveButton("/dashboard/connections")}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="p-3.5 group  w-fit bg-opacity-0 whitespace-nowrap overflow-hidden tracking-tight transition-all
      font-semibold  hover:text-input hover:bg-input
       hover:bg-opacity-20  bg-primary-foreground/15 rounded-lg dark:text-foreground/80  text-primary-foreground/80 saturate-50 "
                >
                  <div className="group w-fit px-2 pt-1 pb-1 justify-start flex items-center  gap-2   transition-all">
                    <FaSignOutAlt
                      className="text-xl transition-colors  
                      group-hover:text-foreground/80"
                    />
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you wish to log out? You will not be able to
                    access the dashboard until you log in again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => getAuth().signOut()}>
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </nav>
      </section>

      <div className="md:w-auto w-full flex flex-1 justify-end  space-x-6 items-center">
        <ThemeSwitcher></ThemeSwitcher>
        <NotificationBox />
      </div>
    </div>
  );
}
