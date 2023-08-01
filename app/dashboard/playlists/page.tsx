"use client";
import { useContext, useEffect, useState } from "react";
import SignInWithSpotify from "@/app/components/SignInWithSpotify";
import { UserPlaylists } from "@/app/interfaces/SpotifyInterfaces";
import { SpotifyPlaylistCard } from "@/app/components/dashboard/SpotifyPlaylistCard";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/contexts/AuthContext";
import { youtube_v3 } from "googleapis";
import { YoutubePlaylistCard } from "@/app/components/dashboard/YoutubePlaylistCard";
import {
  fetchSpotifyPlaylists,
  fetchYoutubePlaylists,
} from "@/app/fetching/FetchPlaylists";
import { Button } from "@/app/components/ui/button";

export default function Home() {
  const authContext = useContext(AuthContext);

  // TODO: FIGURE OUT WHY <h1>Signed in as {authContext?.currentUser?.displayName}</h1> does not display the displayName until a state causes a re-render

  const [loadedContext, setLoadedContext] = useState(false);
  // TODO: THIS USE EFFECT FORCES A RERENDER BY CHANGING A DUMMY STATE, MAKE THE LOGIC WORK WITHOUT A HACK!
  useEffect(() => {
    setTimeout(() => {
      console.log("Loadin");
      setLoadedContext(true);
    }, 245);
  }, [authContext]);

  // If we are loading playlists
  const [loading, setLoading] = useState<boolean>(false);

  // Playlists returned from spotify api
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<
    UserPlaylists | undefined
  >();
  // Playlists returned from youtube api
  const [youtubePlaylists, setYoutubePlaylists] = useState<
    youtube_v3.Schema$PlaylistListResponse | undefined
  >();

  // Next router
  const router = useRouter();

  useEffect(() => {
    // Add auth state listener
    const unsubscribe = authContext?.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
      }
    });

    return unsubscribe;
  }, [authContext, router]);

  return (
    <div className="min-h-screen w-full ">
      <div className="pl-1 h-16 w-full  dark:bg-secondary/20 bg-secondary  text-4xl  text-primary  font-semibold flex items-center pointer-events-none p-0">
        Playlists
      </div>
      <div className="p-5 flex flex-col gap-2">
        <Button
          className=" w-fit h-fit"
          onClick={async () => {
            // TODO: Put the loading UI here use setPlaylists to mock playlists
            setLoading(true);
            if (authContext) {
              setYoutubePlaylists(await fetchYoutubePlaylists(authContext));
              setSpotifyPlaylists(await fetchSpotifyPlaylists(authContext));
              setLoading(false);
            }
          }}
        >
          Get playlists
        </Button>
      </div>

      <div className="flex justify-center mt-4">
        <div className="grid lg:grid-cols-3 xl:grid-cols-4 sm:grid-cols-2 gap-6 grid-flow-row-dense w-10/12 justify-center">
          {loading ? (
            <p className="text-primary text-4xl pointer-events-none">Loading playlists...</p>
          ) : (
            <></>
          )}

          {!loading &&
            spotifyPlaylists &&
            spotifyPlaylists.items.map((playlist, idx) => (
              <SpotifyPlaylistCard playlist={playlist} key={idx} />
            ))}

          {!loading &&
            youtubePlaylists?.items?.map((playlist, idx) => (
              <YoutubePlaylistCard playlist={playlist} key={idx} />
            ))}
        </div>
      </div>
    </div>
  );
}
