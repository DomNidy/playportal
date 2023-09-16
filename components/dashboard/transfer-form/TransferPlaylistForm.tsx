"use client";

import {
  TransferFormStateProperties,
  TransferFormStates,
  TransferFormTitleState,
} from "@/definitions/UserInterfaces";
import { getTransferFormTitleState } from "@/lib/utility/TransferFormUtils";
import { useEffect, useState } from "react";
import { z } from "zod";
import { TransferFormSchema } from "@/definitions/Schemas";
import { ScrollArea } from "../../ui/scroll-area";
import spotifyIcon from "@/public/spotify-icon.svg";
import youtubeIcon from "@/public/youtube-icon.svg";
import PlatformSelectionCard from "./PlatformSelectionCard";

export default function TransferPlaylistForm() {
  const [formState, setFormState] = useState<TransferFormStates>(
    TransferFormStates.SELECTING_ORIGIN_PLATFORM
  );

  // The title and description of the forms based on its current state
  const [titleState, setTitleState] = useState<TransferFormTitleState>(
    getTransferFormTitleState(formState, {})
  );

  // The settings of the transfer form
  const [formSettings, setFormSettings] = useState<TransferFormStateProperties>(
    {}
  );

  // Whenever the transfer form state (or transfer form settings change), update the title
  useEffect(() => {
    setTitleState(getTransferFormTitleState(formState, formSettings));
  }, [formState, formSettings]);

  return (
    <div className="flex flex-col items-center bg-[#D8D6DC] w-[90%] sm:w-[580px] md:w-[740px]  lg:w-[960px]  xl:w-[1080px] h-[660px] rounded-lg p-2">
      <h1 className="text-4xl font-semibold tracking-tighter pt-3">
        {titleState.title}
      </h1>
      <p className="text-muted-foreground text-[#363636] mb-4">
        {titleState.description}
      </p>
      {/** TODO: We are going to need to find a way to disallow users from selecting a platform which they dont have connected with.
       * We could request all their connections and use the returned values as props to the PlatformSelectionCard components
       * This may require designing a new endpoint specifically for this
       *
       */}
      {formState && TransferFormStates.SELECTING_ORIGIN_PLATFORM && (
        <ScrollArea className=" w-[90%] p-4 ">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 justify-items-center row-span-2 gap-6 md:gap-8  ">
            <PlatformSelectionCard
              platformIconSVG={youtubeIcon}
              platformName="YouTube"
            />
            <PlatformSelectionCard
              platformIconSVG={spotifyIcon}
              platformName="Spotify"
            />
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
