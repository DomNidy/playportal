"use client";
import { useEffect, useRef, useState } from "react";
import { BsArrowBarRight, BsArrowBarLeft, BsPeople } from "react-icons/bs";
import { BiTransfer } from "react-icons/bi";
import { MdOutlineMusicVideo } from "react-icons/md";
import SidebarButton from "./SidebarButton";
import { GetBaseUrl } from "../utility/GetBaseUrl";

export default function Sidebar({
  onSidebarMinimize,
}: {
  onSidebarMinimize: (minimized: boolean) => void;
}) {
  // The widths of the sidebar when it is not minimized
  const defaultWidths =
    "max-w-[6.7rem] sm:max-w-[7.4rem] md:max-w-[9.5rem] lg:max-w-[11.9rem]";

  // The widths of the sidebar when it is minimized
  const minimizedWidths =
    "max-w-[2.2rem] sm:max-w-[2.7rem] md:max-w-[3.1rem] lg:max-w-[3.9rem]";

  // Set widths of the sidebar, below is the default width state
  const [width, setWidth] = useState(defaultWidths);

  // Whether or not the sidebar is minimized
  const [minimized, setMinimized] = useState<boolean>(false);

  // Function to handle the button press and update the width
  const handleClickMinimizeButton = () => {
    const newWidth = width === defaultWidths ? minimizedWidths : defaultWidths;
    // Toggle between the default widths and minimized widths
    setWidth(newWidth);
    setMinimized(!minimized);

    // Run callback function to provide the parent with the
    // Current state of the sidebar
    onSidebarMinimize(!minimized);
  };
  return (
    <div
      className={`fixed top-0 left-0 min-h-screen w-full shadow-lg  
                bg-neutral-800 z-10 flex flex-col transition-all
                 ${minimized ? "cursor-pointer" : "cursor-default"}
                 ${width}`}
    >
      <ul
        className={`flex flex-col items-center
          ${minimized ? "" : "flex-grow "}
       `}
      >
        <li
          className="text-md sm:text-lg md:text-2xl lg:text-3xl font-bold whitespace-nowrap text-clip overflow-hidden 
        border border-t-0 border-r-0 border-l-0 p-1 sm:p-0.5 border-neutral-600"
        >
          {minimized ? "Prt" : "Port Playlist"}
        </li>
        <li className="w-full p-1 ">
          <SidebarButton
            icon={BiTransfer}
            label="Transfer Music"
            minimized={minimized}
            page_url={`${GetBaseUrl()}/dashboard/transfer`}
          />
        </li>
        <li className="w-full p-1 ">
          <SidebarButton
            icon={MdOutlineMusicVideo}
            label="Playlists"
            minimized={minimized}
            page_url={`${GetBaseUrl()}/dashboard/playlists`}
          />
        </li>
        <li className="w-full p-1">
          <SidebarButton
            icon={BsPeople}
            label={"Connections"}
            page_url={`${GetBaseUrl()}/dashboard/connections`}
            minimized={minimized}
          ></SidebarButton>
        </li>
      </ul>
      <div
        className="flex flex-col flex-grow justify-end transition-none" // If the sidebar is minimized and we click anywhere on it, maximize the sidebar
        onClick={minimized ? handleClickMinimizeButton : () => null}
      >
        <button
          className={`${
            minimized ? "self-center pb-1" : "pr-2 pb-1"
          } self-end text-neutral-300 hover:text-white`}
          onClick={handleClickMinimizeButton}
        >
          {minimized ? (
            <BsArrowBarRight className="w-7 h-7" />
          ) : (
            <BsArrowBarLeft className="w-7 h-7" />
          )}
        </button>
      </div>
    </div>
  );
}