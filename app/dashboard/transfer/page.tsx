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

async function fetchAndSetData(
  offset: number,
  limit: number,
  setData: Dispatch<any>,
  authContext: Auth,
  setLastUpdated: Dispatch<SetStateAction<number | undefined>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) {
  if (authContext?.currentUser) {
    // Fetch operations
    const data = fetchOperationTransfers(
      authContext?.currentUser?.uid,
      limit,
      offset,
      authContext
    ).then((operationData) => {
      setData(operationData);
      setLastUpdated(Date.now() / 1000);
      setIsLoading(false);
    });
  }
}

// Stores the playlists we've fetched
type PlaylistsPlatformMap = {
  youtube: PlaylistSelectItem[];
  spotify: PlaylistSelectItem[];
};

// Used for drop down select items
type PlaylistSelectItem = {
  name: string;
  playlistID: string;
  image_url: string;
  platform: Platforms;
  playlist_url: string | undefined;
};

export default function Page() {
  const authContext = useContext(AuthContext);
  const [data, setData] = useState<any>();
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
        const data = fetchOperationTransfers(
          authContext?.currentUser?.uid,
          10,
          0,
          authContext
        ).then((operationData) => {
          setData(operationData);
          setLastUpdated(Date.now() / 1000);
          setIsLoading(false);
        });
      }
    }

    async function fetchPlaylists() {
      if (authContext?.currentUser) {
        // Fetch playlists
        const spotifyPlaylists = await fetchSpotifyPlaylists(
          authContext,
          undefined,
          undefined
        );

        const youtubePlaylists = await fetchYoutubePlaylists(authContext);

        if (spotifyPlaylists) {
          spotifyPlaylists.items.map((item) =>
            setAllPlaylists((prior) => {
              return {
                spotify: [
                  ...(prior?.spotify ?? []),
                  {
                    image_url: item.images[0].url,
                    name: item.name,
                    playlistID: item.id,
                    platform: Platforms.SPOTIFY,
                    playlist_url: item.external_urls.spotify,
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
  }, [authContext]);

  // Whenever the current page index changes, fetch data
  useEffect(() => {
    if (authContext?.currentUser) {
      fetchAndSetData(
        currentPageIndex * itemsPerPage,
        itemsPerPage,
        setData,
        authContext,
        setLastUpdated,
        setIsLoading
      );
    }
  }, [authContext, currentPageIndex, itemsPerPage]);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div
        className="grid grid-cols-1 w-full px-4 lg:px-20 xl:px-40 pt-32 transfer-grid "
        style={{
          placeItems: "stretch center",
        }}
      >
        <div>
          <h2 className="text-left text-secondary-foreground tracking-tighter text-3xl font-semibold pb-1 gap-2 flex w-[13.74rem]">
            From{" "}
            <SelectDestinationCombobox
              // TODO: Dynamically change the platforms we are allowed to select from
              updateSelectedPlaylist={setFromPlaylist}
              playlists={allPlaylists.spotify}
            />
          </h2>
          <div className="w-80 h-80 bg-secondary-foreground rounded-md shadow-sm">
            <AspectRatio ratio={1 / 1}>
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
            </AspectRatio>
          </div>
        </div>
        <div className="transfer-item-2">
          <h2 className="text-left sm:text-right text-secondary-foreground tracking-tighter flex text-3xl font-semibold pb-1 gap-2 w-[13.74rem]">
            To
            <SelectDestinationCombobox
              updateSelectedPlaylist={setToPlaylist}
              playlists={allPlaylists.youtube}
            />
          </h2>
          <div className="w-80 h-80 bg-secondary-foreground rounded-md shadow-sm">
            <AspectRatio ratio={1 / 1}>
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
            </AspectRatio>
          </div>
        </div>

        <Button
          className="pt-1"
          onClick={() => {
            if (
              fromPlaylist?.platform &&
              toPlaylist?.platform &&
              authContext?.currentUser
            ) {
              transferPlaylist(
                fromPlaylist?.platform,
                fromPlaylist?.name,
                fromPlaylist?.playlistID,
                toPlaylist?.platform,
                toPlaylist?.playlistID,
                toPlaylist?.name,
                authContext
              );
            }
          }}
        >
          Send
        </Button>
      </div>

      <div className="p-4 lg:p-28 xl:p-48">
        <Button
          className="w-fit"
          onClick={() => {
            setIsLoading(true);
            if (authContext?.currentUser) {
              // Fetch operations
              const data = fetchOperationTransfers(
                authContext?.currentUser?.uid,
                10,
                0,
                authContext
              ).then((operationData) => {
                if (operationData) {
                  setData(operationData);
                }
                setLastUpdated(Date.now() / 1000);
                setIsLoading(false);
              });
            }
          }}
        >
          Refresh
        </Button>

        <section className="flex text-center">
          <div className="flex gap-2 justify-between items-center text-center flex-1 pb-3">
            <h2 className="text-lg md:text-3xl font-semibold tracking-tight ">
              Your Transfers
            </h2>
            <p className="text-muted-foreground sm:text-sm md:text-base">
              Last Updated:{" "}
              {lastUpdated ? formatRelativeDateFromEpoch(lastUpdated) : ""}
            </p>
          </div>{" "}
          {isLoading ? (
            <svg
              aria-hidden="true"
              className="w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-400"
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
        </section>

        {data && <DataTable columns={columns} data={data} />}
        <div className="flex w-full justify-between pt-4">
          <Button
            className=" px-4"
            onClick={() =>
              // If decrimenting the current page index by 1 would cause it to be negative, set it to 0
              setCurrentPageIndex(
                currentPageIndex - 1 >= 0 ? currentPageIndex - 1 : 0
              )
            }
          >
            Prev
          </Button>
          <h1 className="text-lg text-muted-foreground">{currentPageIndex}</h1>
          <Button
            className=" px-4"
            onClick={() => {
              // If we have less items on the current table than our limit, we should not increment (as we have fetched all items)
              if (data.length < itemsPerPage) {
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
  );
}
