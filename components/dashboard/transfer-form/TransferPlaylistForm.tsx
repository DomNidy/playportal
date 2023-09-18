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
import { AuthContext } from "@/lib/contexts/AuthContext";
import { Platforms } from "@/definitions/Enums";
import { ConnectionsContext } from "@/lib/contexts/ConnectionsContext";
import { Button } from "@/components/ui/button";
import { YoutubeIcon } from "lucide-react";
import PlaylistSelectionCard from "./PlaylistSelectionCard";
import {
  fetchSpotifyPlaylists,
  fetchYoutubePlaylists,
} from "@/lib/fetching/FetchPlaylists";

type PlaylistProps = {
  playlistID: string;
  playlistPlatform: Platforms;
  playlistTitle: string;
  playlistTrackCount: number;
  playlistURL: string;
  playlistImageURL?: string;
};

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

  // Stores all playlists fetched from the user
  const [allPlaylists, setAllPlaylists] =
    useState<Record<Platforms, PlaylistProps[] | undefined>>();

  // If we are authed, fetch connected accounts from user
  useEffect(() => {
    if (connections.fetchConnections) {
      connections.fetchConnections();
    }
  }, [auth]);

  // Whenever the form state changes, fetch data specific to the state it changed to
  // Ex: When we switch to the "select origin playlist page, fetch all playlists from the origin platform"
  useEffect(() => {
    // Defined here so we are able to use async await in the effect
    async function fetchAndSetSpotifyPlaylists() {
      if (auth.auth) {
        const playlistResponse = await fetchSpotifyPlaylists(auth.auth).then(
          (res) =>
            res?.flatMap((spotifyResponse) =>
              spotifyResponse.items.map((item) => {
                return {
                  playlistID: item.id,
                  playlistPlatform: Platforms.SPOTIFY,
                  playlistTitle: item.name,
                  playlistTrackCount: item.tracks.total,
                  playlistURL: item.external_urls.spotify,
                  playlistImageURL: item.images[0].url,
                } as PlaylistProps;
              })
            )
        );
        setAllPlaylists({
          spotify: playlistResponse || [],
          youtube: allPlaylists?.youtube || [],
        });
      }
    }

    async function fetchAndSetYoutubePlaylists() {
      if (auth.auth) {
        const playlistResponse = await fetchYoutubePlaylists(auth.auth).then(
          (res) => {
            // If the response is defined, map over the items
            if (res) {
              return res.flatMap((youtubeResponse) =>
                youtubeResponse.items?.map((item) => {
                  return {
                    playlistID: item.id,
                    playlistPlatform: Platforms.YOUTUBE,
                    playlistTitle: item.snippet?.title,
                    playlistTrackCount: item.contentDetails?.itemCount,
                    playlistURL: `https://www.youtube.com/playlist?list=${item.id}`,
                    playlistImageURL:
                      item.snippet?.thumbnails?.high?.url ||
                      item.snippet?.thumbnails?.medium?.url,
                  } as PlaylistProps;
                })
              );
            } else {
              return [];
            }
          }
        );
        console.log(playlistResponse);
        setAllPlaylists({
          spotify: allPlaylists?.spotify || [],
          youtube: (playlistResponse as PlaylistProps[]) || [],
        });
      }
    }

    if (
      formState === TransferFormStates.SELECTING_ORIGIN_PLAYLIST &&
      auth.auth
    ) {
      // Fetch all playlists on the origin platform
      switch (formSettings.origin?.platform) {
        case Platforms.SPOTIFY:
          fetchAndSetSpotifyPlaylists();
        case Platforms.YOUTUBE:
          fetchAndSetYoutubePlaylists();
      }
    }
  }, [formState]);

  // Whenever the transfer form state (or transfer form settings change), update the title
  useEffect(() => {
    setTitleState(getTransferFormTitleState(formState, formSettings));
  }, [formState, formSettings]);

  return (
    <div className="flex flex-col items-center bg-[#D8D6DC] w-[90%] sm:w-[580px] md:w-[740px]  lg:w-[960px]  xl:w-[1080px] max-h-[720px] rounded-lg p-2">
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
       */}{" "}
      {formState === TransferFormStates.SELECTING_ORIGIN_PLATFORM && (
        <section className="w-[90%] h-full p-4">
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
        </section>
      )}
      {formState === TransferFormStates.SELECTING_ORIGIN_PLAYLIST && (
        <section className="w-[90%] p-0 sm:p-4">
          <ScrollArea className="sm:p-2">
            <div className="max-h-[500px] gap-1.5 grid grid-cols-1 ">
              {/**If our the origin platform selected is spotify, and our allPlaylists object has spotify playlists in it, map them out into selection cards */}
              {formSettings.origin?.platform === Platforms.SPOTIFY &&
                allPlaylists?.spotify &&
                allPlaylists.spotify.map((playlist, idx) => (
                  <PlaylistSelectionCard
                    setFormSettings={setFormSettings}
                    props={{
                      cardType: "origin",
                      playlistID: playlist.playlistID,
                      platformIcon: spotifyIcon,
                      playlistPlatform: Platforms.SPOTIFY,
                      playlistTitle: playlist.playlistTitle,
                      playlistTrackCount: playlist.playlistTrackCount,
                      playlistImageURL: playlist.playlistImageURL,
                      playlistURL: playlist.playlistURL,
                    }}
                    key={idx}
                  />
                ))}

              {/**If our the origin platform selected is spotify, and our allPlaylists object has spotify playlists in it, map them out into selection cards */}
              {formSettings.origin?.platform === Platforms.YOUTUBE &&
                allPlaylists?.youtube &&
                allPlaylists.youtube.map((playlist, idx) => (
                  <PlaylistSelectionCard
                    setFormSettings={setFormSettings}
                    props={{
                      cardType: "origin",
                      playlistID: playlist.playlistID,
                      platformIcon: youtubeIcon,
                      playlistPlatform: Platforms.YOUTUBE,
                      playlistTitle: playlist.playlistTitle,
                      playlistTrackCount: playlist.playlistTrackCount,
                      playlistImageURL: playlist.playlistImageURL,
                      playlistURL: playlist.playlistURL,
                    }}
                    key={idx}
                  />
                ))}
            </div>
          </ScrollArea>
        </section>
      )}
      <div className="flex w-full p-2">
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
