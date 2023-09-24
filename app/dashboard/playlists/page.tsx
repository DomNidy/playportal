"use client";
import { useContext, useEffect, useState } from "react";
import { UserSpotifyPlaylists } from "@/definitions/SpotifyInterfaces";
import { SpotifyPlaylistCard } from "@/components/playlist-cards/SpotifyPlaylistCard";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/lib/contexts/AuthContext";
import { youtube_v3 } from "googleapis";
import { YoutubePlaylistCard } from "@/components/playlist-cards/YoutubePlaylistCard";
import {
  fetchSpotifyPlaylists,
  fetchYoutubePlaylists,
} from "@/lib/fetching/FetchPlaylists";
import { Button } from "@/components/ui/button";
import LoadingPlaylistCard from "@/components/dashboard/LoadingPlaylistCard";
import ActiveTransferStatusDisplay from "@/components/dashboard/ActiveTransferStatusDisplay";

export default function Home() {
  const authContext = useContext(AuthContext);

  // If we are loading spotify playlists
  const [loadingSpotifyPlaylists, setLoadingSpotifyPlaylists] =
    useState<boolean>(false);
  const [loadingYoutubePlaylists, setLoadingYoutubePlaylists] =
    useState<boolean>(false);

  // Playlists returned from spotify api
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<
    UserSpotifyPlaylists[] | undefined
  >();
  // Playlists returned from youtube api
  const [youtubePlaylists, setYoutubePlaylists] = useState<
    youtube_v3.Schema$PlaylistListResponse[] | undefined
  >();

  // Next router
  const router = useRouter();

  useEffect(() => {
    // This function will fetch playlists, then as soon as we get playlists
    // It will render them out (it does not wait until all fetch requests are done to render)
    async function fetchAllPlaylists() {
      // Set loading state to true
      setLoadingSpotifyPlaylists(true);
      setLoadingYoutubePlaylists(true);

      // If we are logged in, fetch playlists
      if (authContext?.auth?.currentUser) {
        // Fetch spotify playlists
        fetchSpotifyPlaylists(authContext.auth).then((playlists) => {
          setLoadingSpotifyPlaylists(false);
          setSpotifyPlaylists(playlists);
          return playlists;
        });
        // Fetch youtube playlists
        fetchYoutubePlaylists(authContext.auth).then((playlists) => {
          setLoadingYoutubePlaylists(false);
          setYoutubePlaylists(playlists);
          return playlists;
        });
      }
    }

    // Add an event listener to auth
    const unsubscribe = authContext.auth?.onAuthStateChanged((user) => {
      // When auth state changes, fetch the playlists
      // For some reason this effect doesnt actually re-run when authContext?.auth?.currentUser changes
      // Because of this i am adding the listener to the authstate instead of directly using an effect
      if (user) {
        console.log("Fetching!");
        // TODO: Uncomment this: fetchAllPlaylists();
      }
    });

    return unsubscribe;
  }, [authContext]);

  useEffect(() => {
    // Add auth state listener
    const unsubscribe = authContext.auth?.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
      }
    });

    return unsubscribe;
  }, [authContext, router]);

  return (
    <div className="min-h-screen w-full">
      <div className="p-5 flex flex-col gap-2">
        <Button
          className=" w-fit h-fit"
          onClick={async () => {
            // TODO: Put the loading UI here use setPlaylists to mock playlists
            setLoadingSpotifyPlaylists(true);
            setLoadingYoutubePlaylists(true);
            if (authContext.auth) {
              // Set playlists
              setYoutubePlaylists(
                await fetchYoutubePlaylists(authContext.auth)
              );
              setSpotifyPlaylists(
                await fetchSpotifyPlaylists(authContext.auth)
              );
              // Update loading state
              setLoadingSpotifyPlaylists(false);
              setLoadingYoutubePlaylists(false);
            }
          }}
        >
          Get playlists
        </Button>
      </div>
      <ActiveTransferStatusDisplay
        auth={authContext.auth}
        operationID="YjliNjk2ZTYtOWQxYi00Y2FhLWEzZjQtYmZmNDk2MmNkODE0"
        operationIsLive={false}
      />

      <div className="flex justify-center mt-24 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 sm:grid-cols-2 gap-4 grid-flow-row-dense w-9/12 justify-center ">
          {!loadingSpotifyPlaylists &&
            spotifyPlaylists &&
            spotifyPlaylists.map((playlistResponse) => (
              <>
                {playlistResponse.items.map((playlist) => (
                  <SpotifyPlaylistCard playlist={playlist} key={playlist.id} />
                ))}
              </>
            ))}

          {!loadingYoutubePlaylists &&
            youtubePlaylists &&
            youtubePlaylists.map((playlistResponse) => (
              <>
                {playlistResponse.items &&
                  playlistResponse.items.map((playlist) => (
                    <YoutubePlaylistCard
                      playlist={playlist}
                      key={playlist.id}
                    />
                  ))}
              </>
            ))}
          {loadingYoutubePlaylists || loadingSpotifyPlaylists ? (
            <>
              <LoadingPlaylistCard />
              <LoadingPlaylistCard />
              <LoadingPlaylistCard />
              <LoadingPlaylistCard />
              <LoadingPlaylistCard />
              <LoadingPlaylistCard />
              <LoadingPlaylistCard />
              <LoadingPlaylistCard />
              <LoadingPlaylistCard />
              <LoadingPlaylistCard />
              <LoadingPlaylistCard />
              <LoadingPlaylistCard />
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
