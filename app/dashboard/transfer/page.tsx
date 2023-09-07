"use client";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/lib/contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import { SelectDestinationCombobox } from "@/components/playlist-cards/SelectDestinationCombobox";
import {
  fetchSpotifyPlaylists,
  fetchYoutubePlaylists,
  transferPlaylist,
} from "@/lib/fetching/FetchPlaylists";

import { Platforms } from "@/definitions/Enums";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import ActiveTransferStatusDisplay from "@/components/dashboard/ActiveTransferStatusDisplay";
import getPlatformSVG from "@/lib/utility/GetPlatformSVG";
import {
  IndexablePlaylistsPlatformMap,
  PlaylistsPlatformMap,
  PlaylistSelectItem,
} from "@/definitions/PlaylistDefinitions";
import { BsQuestionCircle } from "@react-icons/all-files/bs/BsQuestionCircle";
import TransferPreview from "@/components/dashboard/TransferPreview";
import { TransferFormSchema } from "@/definitions/Schemas";
import { z } from "zod";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Returns a list of playlist items, while excluding playlists from `platformToExclude`
 */
function excludeFromAllPlaylists(
  playlists: IndexablePlaylistsPlatformMap,
  platformToExclude: keyof PlaylistsPlatformMap | "none"
) {
  const playlistsCopy: PlaylistSelectItem[] = [];

  for (const platform in playlists) {
    // If we were passed a platform to excluded and the current platform is NOT the platform we want to exclude
    if (!!platformToExclude && platform !== platformToExclude) {
      playlistsCopy.push(...playlists[platform]);
      continue;
    }

    // If we were not passed a platform to exclude
    if (!platformToExclude) {
      playlistsCopy.push(...playlists[platform]);
    }
  }
  return playlistsCopy;
}

export default function Page() {
  const authContext = useContext(AuthContext);
  const [allPlaylists, setAllPlaylists] = useState<PlaylistsPlatformMap>({
    spotify: [],
    youtube: [],
  });

  // The playlist we want to transfer from
  const [fromPlaylist, setFromPlaylist] = useState<PlaylistSelectItem>();

  // The playlist we want to transfer into
  const [toPlaylist, setToPlaylist] = useState<PlaylistSelectItem>();

  // ID of the ongoing transfer operation (if there is one)
  const [activeOperationID, setActiveOperationID] = useState<string>();

  // Issues with the transsfer form input
  const [transferFormIssues, setTransferFormIssues] = useState<string[]>();

  useEffect(() => {
    async function fetchPlaylists() {
      if (authContext?.currentUser) {
        // Fetch playlists
        const spotifyPlaylists = await fetchSpotifyPlaylists(authContext);

        const youtubePlaylists = await fetchYoutubePlaylists(authContext);

        if (spotifyPlaylists) {
          spotifyPlaylists.items.map((item) =>
            setAllPlaylists((prior) => {
              if (
                prior.spotify.find(
                  (priorItem) => priorItem.playlistID == item.id
                )
              ) {
                console.log("Ignored duplicate");

                return prior;
              }

              return {
                spotify: [
                  ...(prior?.spotify ?? []),
                  {
                    image_url: item?.images[0]?.url || "",
                    name: item.name,
                    playlistID: item.id,
                    platform: Platforms.SPOTIFY,
                    playlist_url: item.external_urls.spotify,
                    track_count: item.tracks.total,
                  },
                ],
                youtube: prior?.youtube,
              };
            })
          );
        }

        if (youtubePlaylists?.items) {
          youtubePlaylists.items.map((item) => {
            setAllPlaylists((prior) => {
              if (
                prior.youtube.find(
                  (priorItem) => priorItem.playlistID == item.id
                )
              ) {
                console.log("Ignored duplicate");
                return prior;
              }

              return {
                spotify: prior.spotify,
                youtube: [
                  ...(prior.youtube ?? []),

                  {
                    image_url: item.snippet?.thumbnails?.maxres?.url || "",
                    name: item.snippet?.title || "",
                    playlistID: item.id || "",
                    platform: Platforms.YOUTUBE,
                    playlist_url: item.id
                      ? `https://www.youtube.com/playlist?list=${item.id}`
                      : undefined,
                    track_count: item.contentDetails?.itemCount || 0,
                  },
                ],
              };
            });
          });
        }
      }
    }

    // Add an event listener to auth
    const unsubscribe = authContext?.onAuthStateChanged((user) => {
      // When auth state changes, fetch the playlists
      // For some reason this effect doesnt actually re-run when authContext?.currentUser changes
      // Because of this i am adding the listener to the authstate instead of directly using an effect
      if (user) {
        console.log("Fetching!");
        fetchPlaylists();
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext]);

  // Whenever the fromPlaylist or toPlaylist changes, validate them
  useEffect(() => {
    if (!fromPlaylist || !toPlaylist) {
      return;
    }

    // We will use the object to validate transfer data is correct
    const validationObject: z.infer<typeof TransferFormSchema> = {
      fromPlaylist: {
        platform: fromPlaylist?.platform,
        playlistName: fromPlaylist?.name,
        trackCount: fromPlaylist?.track_count,
      },
      toPlaylist: {
        platform: toPlaylist?.platform,
        playlistName: toPlaylist?.name,
        trackCount: toPlaylist?.track_count,
      },
    };

    // Parse using zod schema
    const parseAttempt = TransferFormSchema.safeParse(validationObject);

    // If validation failed
    // Add errors to the issues array
    if (!parseAttempt.success) {
      parseAttempt.error.errors.forEach((issue) =>
        setTransferFormIssues((past) => {
          // If our past array is defined, and the issue we are trying to add to it is not present
          if (past && past.find((v) => v == issue.message) == undefined) {
            return [...past, issue.message];
          } else {
            return [issue.message];
          }
        })
      );
      return;
    } // If validation succeded, clear the issues array
    else {
      setTransferFormIssues([]);
    }
  }, [fromPlaylist, toPlaylist]);

  return (
    <div className="min-h-screen ">
      <div
        className="grid grid-cols-1 w-full px-4  pt-32 transfer-grid "
        style={{
          placeItems: "stretch center",
        }}
      >
        <div>
          <h2 className="text-left text-secondary-foreground tracking-tighter text-3xl font-semibold pb-1 gap-2 flex w-80">
            From{" "}
            <SelectDestinationCombobox
              updateSelectedPlaylist={setFromPlaylist}
              playlists={excludeFromAllPlaylists(allPlaylists, "none")}
            />
            {fromPlaylist?.platform && (
              <Image
                src={getPlatformSVG(fromPlaylist.platform)}
                width={32}
                height={32}
                alt=""
              />
            )}
          </h2>
          <div className="w-80 h-80 bg-secondary-foreground rounded-md shadow-sm flex flex-col">
            <AspectRatio ratio={1 / 1}>
              {fromPlaylist?.image_url && (
                <Image
                  onClick={() => {
                    if (!fromPlaylist?.playlist_url) {
                      return;
                    }

                    window.open(fromPlaylist?.playlist_url, "_blank");
                  }}
                  src={fromPlaylist?.image_url!}
                  width={1000}
                  className="z-0 relative h-full w-full object-cover cursor-pointer"
                  height={1000}
                  alt="From playlist"
                ></Image>
              )}
            </AspectRatio>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-row items-center gap-2 text-muted-foreground">
                    <BsQuestionCircle />
                    <p className="text-muted-foreground text-sm underline cursor-pointer">
                      What is this?
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent align="center" className="relative top-36">
                  <div className="max-w-[300px] leading-5">
                    The playlist you select here should contain the songs that
                    you want to transfer to another platform. All of the songs
                    inside the playlist selected here will be inserted into the{" "}
                    <span className="font-semibold">{'"to"'}</span> playlist.
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="transfer-item-2">
          <h2 className="text-left sm:text-right text-secondary-foreground tracking-tighter flex text-3xl font-semibold pb-1 gap-2 w-80">
            To
            <SelectDestinationCombobox
              updateSelectedPlaylist={setToPlaylist}
              playlists={
                fromPlaylist?.platform
                  ? excludeFromAllPlaylists(
                      allPlaylists,
                      fromPlaylist?.platform!
                    )
                  : []
              }
            />
            {toPlaylist?.platform && (
              <Image
                src={getPlatformSVG(toPlaylist.platform)}
                width={32}
                height={32}
                alt=""
              />
            )}
          </h2>
          <div className="w-80 h-80 bg-secondary-foreground rounded-md shadow-sm flex flex-col">
            <AspectRatio ratio={1 / 1}>
              {toPlaylist?.image_url && (
                <Image
                  src={toPlaylist?.image_url!}
                  width={1000}
                  height={1000}
                  className="z-0 relative h-full w-full object-cover cursor-pointer"
                  alt="To playlist"
                  onClick={() => {
                    if (!toPlaylist?.playlist_url) {
                      return;
                    }

                    window.open(toPlaylist?.playlist_url, "_blank");
                  }}
                ></Image>
              )}
            </AspectRatio>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-row items-center gap-2 text-muted-foreground">
                    <BsQuestionCircle />
                    <p className="text-muted-foreground text-sm underline cursor-pointer">
                      What is this?
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent align="center" className="relative top-32">
                  <div className="max-w-[300px] leading-5">
                    The playlist you select here is where the songs will be
                    transferred into. All of the songs of the
                    <span className="font-semibold">{' "from"'}</span> playlist
                    will be inserted into the playlist selected here.
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="pt-4 p-8 flex flex-col items-center">
        {!!fromPlaylist || !!toPlaylist ? (
          <TransferPreview
            fromPlaylist={fromPlaylist}
            toPlaylist={toPlaylist}
            transferFormIssues={transferFormIssues}
            sendButton={
              <Button
                className={`m-auto ${
                  !fromPlaylist ||
                  !toPlaylist ||
                  fromPlaylist.platform == toPlaylist.platform
                    ? `bg-muted-foreground cursor-default hover:bg-muted-foreground`
                    : ``
                }`}
                onClick={async () => {
                  // If either are undefined, return
                  if (!fromPlaylist || !toPlaylist) {
                    return;
                  }

                  // We will use the object to validate transfer data is correct
                  const validationObject: z.infer<typeof TransferFormSchema> = {
                    fromPlaylist: {
                      platform: fromPlaylist?.platform,
                      playlistName: fromPlaylist?.name,
                      trackCount: fromPlaylist?.track_count,
                    },
                    toPlaylist: {
                      platform: toPlaylist?.platform,
                      playlistName: toPlaylist?.name,
                      trackCount: toPlaylist?.track_count,
                    },
                  };

                  // Parse using zod schema
                  const parseAttempt =
                    TransferFormSchema.safeParse(validationObject);

                  // If validation failed
                  // Add errors to the issues array
                  if (!parseAttempt.success) {
                    parseAttempt.error.errors.forEach((issue) =>
                      setTransferFormIssues((past) => {
                        // If our past array is defined, and the issue we are trying to add to it is not present
                        if (
                          past &&
                          past.find((v) => v == issue.message) == undefined
                        ) {
                          return [...past, issue.message];
                        } else {
                          return [issue.message];
                        }
                      })
                    );
                    return;
                  }

                  if (authContext?.currentUser) {
                    const transferRequest = await transferPlaylist(
                      fromPlaylist?.platform,
                      fromPlaylist?.name,
                      fromPlaylist?.playlistID,
                      toPlaylist?.platform,
                      toPlaylist?.playlistID,
                      toPlaylist?.name,
                      authContext
                    );

                    if (transferRequest && transferRequest.ok) {
                      const responseJSON = await transferRequest.json();
                      alert(responseJSON.migrationsResponse.operationID);
                      setActiveOperationID(
                        responseJSON.migrationsResponse.operationID
                      );
                    }
                  }
                }}
              >
                Send
              </Button>
            }
          />
        ) : (
          <></>
        )}

        {activeOperationID && (
          <ActiveTransferStatusDisplay
            auth={authContext}
            activeOperationID={activeOperationID}
          />
        )}
      </div>
    </div>
  );
}
