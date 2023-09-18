"use client";

import {
  TransferFormStateProperties,
  TransferFormStates,
  TransferFormTitleState,
} from "@/definitions/UserInterfaces";
import {
  getPreviousTransferFormState,
  getTransferFormTitleState,
} from "@/lib/utility/TransferFormUtils";
import { useContext, useEffect, useState } from "react";
import { ScrollArea } from "../../ui/scroll-area";
import spotifyIcon from "@/public/spotify-icon.svg";
import youtubeIcon from "@/public/youtube-icon.svg";
import PlatformSelectionCard from "./PlatformSelectionCard";
import { fetchAllConnections } from "@/lib/fetching/FetchConnections";
import { AuthContext } from "@/lib/contexts/AuthContext";
import { Auth } from "firebase/auth";
import { Platforms } from "@/definitions/Enums";
import {
  ConnectionsContext,
  ConnectionsProvider,
} from "@/lib/contexts/ConnectionsContext";
import { Button } from "@/components/ui/button";
import { YoutubeIcon } from "lucide-react";

export default function TransferPlaylistForm() {
  const auth = useContext(AuthContext);
  const connections = useContext(ConnectionsContext);

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

  // The platforms which the user has connected and are elligible for transfers
  const [connectedPlatforms, setConnectedPlatforms] =
    useState<Record<Platforms, any>>();

  useEffect(() => {
    console.log("eff");
    if (connections.fetchConnections) {
      connections.fetchConnections();
    }
  }, [auth]);

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

      <section className="w-[90%] h-full p-4">
        {" "}
        {formState === TransferFormStates.SELECTING_ORIGIN_PLATFORM && (
          <ScrollArea>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 justify-items-center row-span-2 gap-6 md:gap-8  ">
              <PlatformSelectionCard
                platformIconSVG={spotifyIcon}
                platformName={Platforms.SPOTIFY}
                isPlatformConnected={!!connections.spotify}
                setTransferFormSettings={setFormSettings}
                setTransferFormState={setFormState}
              />
              <PlatformSelectionCard
                platformIconSVG={youtubeIcon}
                platformName={Platforms.YOUTUBE}
                isPlatformConnected={!!connections.youtube}
                setTransferFormSettings={setFormSettings}
                setTransferFormState={setFormState}
              />
            </div>
          </ScrollArea>
        )}
        {formState === TransferFormStates.SELECTING_ORIGIN_PLAYLIST && (
          <div className="grid grid-cols-1 gap-1.5 ">
            <div className="w-full h-12 rounded-xl p-2 bg-background flex shadow-md gap-2">
              <div className="aspect-square bg-gradient-to-b min-w-[32px] min-h-[32px] from-purple-400 to-blue-300 rounded-md" />
              <div className="basis-32 flex flex-col gap-0 h-11">
                <h2 className="text-[#3D3A3A] text-sm">Playlist Title</h2>
                <p className="text-[#595353] font-semibold text-xs">Spotify</p>
              </div>
              <div className="flex basis-full flex-row-reverse items-center">
                <Button className="px-6  rounded-3xl h-8">Select</Button>
              </div>
            </div>

            <div className="w-full h-12 rounded-xl p-2 bg-background flex shadow-md gap-2">
              <div className="aspect-square bg-gradient-to-b min-w-[32px] min-h-[32px] from-purple-400 to-blue-300 rounded-md" />
              <div className="basis-32 flex flex-col gap-0 h-11">
                <h2 className="text-[#3D3A3A] text-sm">Playlist Title 2</h2>
                <p className="text-[#595353] font-semibold text-xs">Spotify</p>
              </div>
              <div className="flex basis-full flex-row-reverse items-center">
                <Button className="px-6  rounded-3xl h-8">Select</Button>
              </div>
            </div>

            <div className="w-full h-12 rounded-xl p-2 bg-background flex shadow-md gap-2">
              <div className="aspect-square bg-gradient-to-b min-w-[32px] min-h-[32px] from-purple-400 to-blue-300 rounded-md" />
              <div className="basis-32 flex flex-col gap-0 h-11">
                <h2 className="text-[#3D3A3A] text-sm">Playlist Title 3</h2>
                <p className="text-[#595353] font-semibold text-xs">Spotify</p>
              </div>
              <div className="flex basis-full flex-row-reverse items-center">
                <Button className="px-6  rounded-3xl h-8">Select</Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/** Figure out how to implement a back button
       * <Button onClick={() => setFormState()}>Go back</Button>
       */}
      <div className="flex w-full p-4">
        {" "}
        {!!getPreviousTransferFormState(formState) && (
          <Button
            className="px-6 py-0.5 rounded-3xl "
            onClick={() =>
              setFormState(getPreviousTransferFormState(formState)!)
            }
          >
            Go back
          </Button>
        )}
      </div>
    </div>
  );
}
