"use client";

import {
  PlaylistProps,
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
import { BsArrowRight } from "@react-icons/all-files/bs/BsArrowRight";
import PlaylistSelectionCard from "./PlaylistSelectionCard";
import {
  fetchSpotifyPlaylists,
  fetchYoutubePlaylists,
  transferPlaylist,
} from "@/lib/fetching/FetchPlaylists";
import { forms } from "googleapis/build/src/apis/forms";
import { TransferFormSchema } from "@/definitions/Schemas";
import TransferPreview from "../TransferPreview";
import ActiveTransferStatusDisplay from "../ActiveTransferStatusDisplay";

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

  // Stores issues with transfer form settings (if there are any)
  const [transferFormIssues, setTransferFormIssues] = useState<string[]>();

  // Stores all playlists fetched from the user
  const [allPlaylists, setAllPlaylists] =
    useState<Record<Platforms, PlaylistProps[] | undefined>>();

  // The operation id of the ongoing playlist transfer form (if there is one)
  const [operationID, setoperationID] = useState<string>();

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

    // If we are selecting the origin playlist and authed
    if (
      formState === TransferFormStates.SELECTING_ORIGIN_PLAYLIST &&
      auth.auth
    ) {
      // Fetch all playlists on the origin platform
      switch (formSettings.origin?.playlistPlatform) {
        case Platforms.SPOTIFY:
          fetchAndSetSpotifyPlaylists();
        case Platforms.YOUTUBE:
          fetchAndSetYoutubePlaylists();
      }
    }

    // If we are selecting the destination playlist and authed
    if (
      formState === TransferFormStates.SELECTING_DESTINATION_PLAYLIST &&
      auth.auth
    ) {
      // Fetch all playlists on the origin platform
      switch (formSettings.destination?.playlistPlatform) {
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
    // Revalidate formSettings whenever the state changes
    validateFormSettings();
  }, [formState, formSettings]);

  function validateFormSettings() {
    // Parse using zod schema
    const parseAttempt = TransferFormSchema.safeParse(formSettings);
    console.log(parseAttempt);

    // If validation failed
    if (!parseAttempt.success) {
      setTransferFormIssues(
        parseAttempt.error.issues.map((issue) => issue.message)
      );
    } else {
      setTransferFormIssues([]);
    }
  }

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
                selectionType="origin"
                platformIconSVG={spotifyIcon}
                platformName={Platforms.SPOTIFY}
                isPlatformConnected={!!connections.spotify}
                setTransferFormSettings={setFormSettings}
                setTransferFormState={setFormState}
              />
              <PlatformSelectionCard
                selectionType="origin"
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
              {formSettings.origin?.playlistPlatform === Platforms.SPOTIFY &&
                allPlaylists?.spotify &&
                allPlaylists.spotify.map((playlist, idx) => {
                  if (playlist.playlistID && playlist.playlistTitle) {
                    return (
                      <PlaylistSelectionCard
                        setFormState={setFormState}
                        setFormSettings={setFormSettings}
                        props={{
                          cardType: "origin",
                          playlistID: playlist.playlistID,
                          platformIcon: spotifyIcon,
                          playlistPlatform: Platforms.SPOTIFY,
                          playlistTitle: playlist.playlistTitle,
                          playlistTrackCount: playlist.playlistTrackCount || 0,
                          playlistImageURL: playlist.playlistImageURL,
                          playlistURL: playlist.playlistURL,
                        }}
                        key={idx}
                      />
                    );
                  } else {
                    return <></>;
                  }
                })}

              {formSettings.origin?.playlistPlatform === Platforms.YOUTUBE &&
                allPlaylists?.youtube &&
                allPlaylists.youtube.map((playlist, idx) => {
                  if (playlist.playlistID && playlist.playlistTitle) {
                    return (
                      <PlaylistSelectionCard
                        setFormState={setFormState}
                        setFormSettings={setFormSettings}
                        props={{
                          cardType: "origin",
                          playlistID: playlist.playlistID,
                          platformIcon: youtubeIcon,
                          playlistPlatform: Platforms.YOUTUBE,
                          playlistTitle: playlist.playlistTitle,
                          playlistTrackCount: playlist.playlistTrackCount || 0,
                          playlistImageURL: playlist.playlistImageURL,
                          playlistURL: playlist.playlistURL,
                        }}
                        key={idx}
                      />
                    );
                  } else {
                    return <></>;
                  }
                })}
            </div>
          </ScrollArea>
        </section>
      )}
      {formState === TransferFormStates.SELECTING_DESTINATION_PLATFORM && (
        <section className="w-[90%] h-full p-4">
          <ScrollArea>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 justify-items-center row-span-2 gap-6 md:gap-8  ">
              {formSettings.origin?.playlistPlatform !== Platforms.SPOTIFY && (
                <PlatformSelectionCard
                  selectionType="destination"
                  platformIconSVG={spotifyIcon}
                  platformName={Platforms.SPOTIFY}
                  isPlatformConnected={!!connections.spotify}
                  setTransferFormSettings={setFormSettings}
                  setTransferFormState={setFormState}
                />
              )}
              {formSettings.origin?.playlistPlatform !== Platforms.YOUTUBE && (
                <PlatformSelectionCard
                  selectionType="destination"
                  platformIconSVG={youtubeIcon}
                  platformName={Platforms.YOUTUBE}
                  isPlatformConnected={!!connections.youtube}
                  setTransferFormSettings={setFormSettings}
                  setTransferFormState={setFormState}
                />
              )}
            </div>
          </ScrollArea>
        </section>
      )}
      {formState === TransferFormStates.SELECTING_DESTINATION_PLAYLIST && (
        <section className="w-[90%] p-0 sm:p-4">
          <ScrollArea className="sm:p-2">
            <div className="max-h-[500px] gap-1.5 grid grid-cols-1 ">
              {/**If our the origin platform selected is spotify, and our allPlaylists object has spotify playlists in it, map them out into selection cards */}
              {formSettings.destination?.playlistPlatform ===
                Platforms.SPOTIFY &&
                allPlaylists?.spotify &&
                allPlaylists.spotify.map((playlist, idx) => {
                  if (playlist.playlistID && playlist.playlistTitle) {
                    return (
                      <PlaylistSelectionCard
                        setFormState={setFormState}
                        setFormSettings={setFormSettings}
                        props={{
                          cardType: "destination",
                          playlistID: playlist.playlistID,
                          platformIcon: spotifyIcon,
                          playlistPlatform: Platforms.SPOTIFY,
                          playlistTitle: playlist.playlistTitle,
                          playlistTrackCount: playlist.playlistTrackCount || 0,
                          playlistImageURL: playlist.playlistImageURL,
                          playlistURL: playlist.playlistURL,
                        }}
                        key={idx}
                      />
                    );
                  } else {
                    return <></>;
                  }
                })}

              {formSettings.destination?.playlistPlatform ===
                Platforms.YOUTUBE &&
                allPlaylists?.youtube &&
                allPlaylists.youtube.map((playlist, idx) => {
                  if (playlist.playlistID && playlist.playlistTitle) {
                    return (
                      <PlaylistSelectionCard
                        setFormState={setFormState}
                        setFormSettings={setFormSettings}
                        props={{
                          cardType: "destination",
                          playlistID: playlist.playlistID,
                          platformIcon: youtubeIcon,
                          playlistPlatform: Platforms.YOUTUBE,
                          playlistTitle: playlist.playlistTitle,
                          playlistTrackCount: playlist.playlistTrackCount || 0,
                          playlistImageURL: playlist.playlistImageURL,
                          playlistURL: playlist.playlistURL,
                        }}
                        key={idx}
                      />
                    );
                  } else {
                    return <></>;
                  }
                })}
            </div>
          </ScrollArea>
        </section>
      )}
      {formState === TransferFormStates.REVIEWING_TRANSFER && (
        <section className="p-0 sm:p-4 w-[90%] space-y-4">
          <div className="flex flex-col  justify-between items-center space-y-12 md:space-y-0  md:flex-row ">
            <PlaylistSelectionCard
              setFormState={setFormState}
              setFormSettings={setFormSettings}
              props={{
                cardType: "review",
                playlistID: formSettings.origin?.playlistID!,
                platformIcon:
                  formSettings.origin?.playlistPlatform === "spotify"
                    ? spotifyIcon
                    : youtubeIcon,
                playlistPlatform: formSettings.origin?.playlistPlatform!,
                playlistTitle: formSettings.origin?.playlistTitle!,
                playlistTrackCount:
                  formSettings.origin?.playlistTrackCount || 0,
                playlistURL: formSettings.origin?.playlistURL,
                playlistImageURL: formSettings.origin?.playlistImageURL,
              }}
              key={1}
            />

            <PlaylistSelectionCard
              setFormState={setFormState}
              setFormSettings={setFormSettings}
              props={{
                cardType: "review",
                playlistID: formSettings.destination?.playlistID!,
                platformIcon:
                  formSettings.destination?.playlistPlatform === "spotify"
                    ? spotifyIcon
                    : youtubeIcon,
                playlistPlatform: formSettings.destination?.playlistPlatform!,
                playlistTitle: formSettings.destination?.playlistTitle!,
                playlistTrackCount:
                  formSettings.destination?.playlistTrackCount || 0,
                playlistURL: formSettings.destination?.playlistURL,
                playlistImageURL: formSettings.destination?.playlistImageURL,
              }}
              key={2}
            />
          </div>
          <div className="bg-background p-2 rounded-lg gap-4 text-center">
            <h2 className="font-semibold text-[#3C3838]">
              Playlist Name{" "}
              <span>
                <BsArrowRight className="inline-block" />
              </span>{" "}
              Playlist Name 2
            </h2>
            <p className="text-sm text-[#363636]">
              {formSettings.origin?.playlistTrackCount} Songs from your playlist
              {' "'}
              <span className="font-semibold">
                {formSettings.origin?.playlistTitle}
              </span>
              {'" '}
              on {formSettings.origin?.playlistPlatform} will be transferred
              into the playlist{' "'}
              <span className="font-semibold">
                {formSettings.destination?.playlistTitle}
              </span>
              {'" '}
              on {formSettings.destination?.playlistPlatform}.
            </p>

            {transferFormIssues && (
              <div className="flex flex-col ">
                {transferFormIssues.map((issue, idx) => (
                  <p
                    className="text-sm font-semibold text-destructive"
                    key={idx}
                  >
                    {issue}
                  </p>
                ))}
              </div>
            )}
            <Button
              className={`w-52 ${
                transferFormIssues?.length == 0
                  ? ""
                  : "bg-neutral-500 cursor-default hover:bg-neutral-500"
              } rounded-3xl px-5 mt-3`}
              onClick={async () => {
                // Parse using zod schema
                const parseAttempt = TransferFormSchema.safeParse(formSettings);
                console.log(parseAttempt);

                // If validation failed
                if (!parseAttempt.success) {
                  parseAttempt.error.issues.forEach((issue) => {
                    console.log(issue);
                  });
                  return;
                }

                // If validation succeeded, and we are authenticated, send the transfer request!
                if (parseAttempt.success && auth.auth) {
                  console.log("Sending the transfer request");

                  const transferRequest = await transferPlaylist(
                    formSettings.origin?.playlistPlatform!,
                    formSettings.origin?.playlistTitle!,
                    formSettings.origin?.playlistID!,
                    formSettings.destination?.playlistPlatform!,
                    formSettings.destination?.playlistID!,
                    formSettings.destination?.playlistTitle!,
                    auth.auth
                  );

                  // If the response succeeded
                  if (!!transferRequest) {
                    const responseJSON = await transferRequest.json();

                    setoperationID(
                      responseJSON.migrationsResponse.operationID
                    );

                    setFormState(TransferFormStates.VIEWING_TRANSFER_STATUS);
                  }
                  console.log(transferRequest);
                }
              }}
            >
              Transfer now
            </Button>
          </div>
        </section>
      )}
      {formState === TransferFormStates.VIEWING_TRANSFER_STATUS && (
        <section className="p-0 sm:p-4 w-[90%]">
          <ActiveTransferStatusDisplay
            operationID={operationID}
            auth={auth.auth}
          />
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
