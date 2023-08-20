"use client";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/lib/contexts/AuthContext";
import { fetchOperationTransfers } from "@/lib/fetching/FetchOperations";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { formatRelativeDateFromEpoch } from "@/lib/utility/FormatDate";
import { SelectDestinationCombobox } from "@/components/playlist-cards/SelectDestinationCombobox";
import {
  fetchSpotifyPlaylists,
  fetchYoutubePlaylists,
  transferPlaylist,
} from "@/lib/fetching/FetchPlaylists";

import { Platforms } from "@/definitions/Enums";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Auth } from "firebase/auth";
import { OperationTransferSimple } from "@/definitions/MigrationService";
import ActiveTransferStatusDisplay from "@/components/dashboard/ActiveTransferStatusDisplay";
import getPlatformSVG from "@/lib/utility/GetPlatformSVG";
import {
  IndexablePlaylistsPlatformMap,
  PlaylistsPlatformMap,
  PlaylistSelectItem,
} from "@/definitions/PlaylistDefinitions";
import TransferPreview from "@/components/dashboard/TransferPreview";
import { TransferFormSchema } from "@/definitions/Schemas";
import { ZodError, z } from "zod";

async function fetchAndSetData(
  setData: Dispatch<any>,
  authContext: Auth,
  setLastUpdated: Dispatch<SetStateAction<number | undefined>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) {
  if (authContext?.currentUser) {
    setIsLoading(true);

    // Fetch operations
    fetchOperationTransfers(authContext).then((operationData) => {
      console.log(`New data: ${operationData?.length}`);
      if (operationData) {
        setData((prior: OperationTransferSimple[] | undefined) => {
          // Create a copy of existing data
          const newData = [...(prior || [])];

          console.log(newData);
          operationData.forEach((newObj) => {
            // Make sure operationID is not undefined
            if (newObj.info && newObj.info.operationID !== undefined) {
              // Find index of a duplicate item (if it exists)
              const duplicateItemIndex = newData.findIndex(
                (oldObj) => oldObj.info.operationID === newObj.info.operationID
              );

              // If the item is not a duplicate, add it to newData
              if (duplicateItemIndex === -1) {
                newData.push(newObj);
              } else {
                console.log(
                  "Found duplicate item!",
                  `The new item: ${JSON.stringify(newObj.info.operationID)}`
                );
              }
            } else {
              console.log("Skipping item with undefined operationID");
            }
          });
          return newData;
        });
      }
      setLastUpdated(Date.now() / 1000);
      setIsLoading(false);
    });
  }
}

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
  // The operation transfer data we receieved from api
  const [data, setData] = useState<OperationTransferSimple[]>();

  // The time (in seconds, when the operations data was last updated)
  const [lastUpdated, setLastUpdated] = useState<number>();
  // State used to cause re-renders when interval effect runs
  const [rerenderCount, setRerenderCount] = useState<number>(0);
  // If we are loading operation data
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [allPlaylists, setAllPlaylists] = useState<PlaylistsPlatformMap>({
    spotify: [],
    youtube: [],
  });

  // The playlist we want to transfer from
  const [fromPlaylist, setFromPlaylist] = useState<PlaylistSelectItem>();

  // The playlist we want to transfer into
  const [toPlaylist, setToPlaylist] = useState<PlaylistSelectItem>();

  // Current page of transfers history we are on
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // The amount of items per transfers page
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // If there is another page in the data table
  const [isNextPage, setIsNextPage] = useState<boolean>(true);

  // If there is a previous page in the data table
  const [isPreviousPage, setIsPreviousPage] = useState<boolean>(false);

  // ID of the ongoing transfer operation (if there is one)
  const [activeOperationID, setActiveOperationID] = useState<string>();

  // Issues with the transsfer form input
  const [transferFormIssues, setTransferFormIssues] = useState<string[]>();

  // Re-render the page every 62 seconds (to update the lastUpdated timer)
  useEffect(() => {
    const interval = setInterval(() => {
      setRerenderCount((past) => past + 1);
    }, 62000);
    return () => clearInterval(interval);
  }, [rerenderCount]);

  useEffect(() => {
    async function fetchOps() {
      if (authContext?.currentUser) {
        // Fetch operations
        fetchAndSetData(setData, authContext, setLastUpdated, setIsLoading);
      }
    }

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
                    image_url: item.images[0].url,
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
        fetchOps();
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

  useEffect(() => {
    if (data && data.length < (currentPageIndex + 1) * itemsPerPage) {
      setIsNextPage(false);
    } else {
      setIsNextPage(true);
    }

    // If we are on page zero, disable the previous page button
    if (currentPageIndex === 0) {
      setIsPreviousPage(false);
    } else {
      setIsPreviousPage(true);
    }
  }, [currentPageIndex, data, itemsPerPage]);

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
          <div className="w-80 h-80 bg-secondary-foreground rounded-md shadow-sm">
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
          <div className="w-80 h-80 bg-secondary-foreground rounded-md shadow-sm">
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
                    ? `bg-muted-foreground cursor-default`
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
      <div className="pt-4 lg:pt-28 xl:pt-48">
        <div className="xs:w-[400px] sm:w-[560px] md:w-[760px] lg:w-[900px] xl:w-[1050px]  p-8 text-center m-auto ">
          <section className="flex justify-between items-center m-auto">
            <h2 className="text-lg md:text-3xl font-semibold tracking-tight ">
              Your Transfers
            </h2>
            <Button
              className="w-fit"
              onClick={() => {
                if (authContext?.currentUser) {
                  fetchAndSetData(
                    setData,
                    authContext,
                    setLastUpdated,
                    setIsLoading
                  );
                }
              }}
            >
              Refresh
            </Button>
            <div className="flex gap-2">
              <p className="text-muted-foreground sm:text-sm md:text-base">
                Last Updated:{" "}
                {lastUpdated ? formatRelativeDateFromEpoch(lastUpdated) : ""}
              </p>
              {isLoading ? (
                <svg
                  aria-hidden="true"
                  className="w-6 h-6  text-gray-200 animate-spin dark:text-gray-600 fill-blue-400"
                  viewBox="0 0 100 101"
                  fill="none"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              ) : (
                ""
              )}
            </div>
          </section>
          <DataTable
            isLoading={isLoading}
            columns={columns}
            data={
              data?.slice(
                currentPageIndex * itemsPerPage,
                currentPageIndex * itemsPerPage + itemsPerPage
              ) || []
            }
          />
          <div className="flex w-full flex-none justify-between pt-2 flex-col">
            <div
              className={
                "flex w-1/2 justify-evenly items-center self-center pt-2"
              }
            >
              <Button
                className={`px-4 ${
                  isPreviousPage
                    ? ""
                    : "bg-muted-foreground hover:bg-muted-foreground cursor-default"
                }`}
                onClick={() => {
                  if (!isPreviousPage) {
                    return;
                  }

                  // If decrimenting the current page index by 1 would cause it to be negative, set it to 0
                  setCurrentPageIndex(
                    currentPageIndex - 1 >= 0 ? currentPageIndex - 1 : 0
                  );
                }}
              >
                Prev
              </Button>
              <h1 className="text-lg text-muted-foreground">
                {currentPageIndex}
              </h1>
              <Button
                className={`px-4 ${
                  isNextPage
                    ? ""
                    : "bg-muted-foreground hover:bg-muted-foreground cursor-default"
                }`}
                onClick={() => {
                  // If we have less items on the current table than our limit, we should not increment (as we have fetched all items)
                  if (!isNextPage) {
                    return;
                  }

                  setCurrentPageIndex(currentPageIndex + 1);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
