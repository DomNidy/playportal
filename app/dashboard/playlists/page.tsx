"use client";
import { useContext, useEffect, useState } from "react";
import SignInWithSpotify from "@/app/components/SignInWithSpotify";
import { UserPlaylists } from "@/app/interfaces/SpotifyInterfaces";
import { SpotifyPlaylistCard } from "@/app/components/dashboard/SpotifyPlaylistCard";
import { useRouter } from "next/navigation";
import { GetBaseUrl } from "@/app/utility/GetBaseUrl";
import { AuthContext } from "@/app/contexts/AuthContext";
import { youtube_v3 } from "googleapis";
import { YoutubePlaylistCard } from "@/app/components/dashboard/YoutubePlaylistCard";
import {
  fetchSpotifyPlaylists,
  fetchYoutubePlaylists,
} from "@/app/fetching/FetchPlaylists";

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
    const listener = authContext?.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
      }
    });

    return () => {
      if (listener) {
        listener();
      }
    };
  });

  return (
    <div className="min-h-screen w-full ">
      <div className="pl-1 h-16 w-full bg-neutral-200 dark:bg-dm-800  text-4xl text-gray-200 font-semibold flex items-center pointer-events-none p-0">
        Playlists
      </div>
      <div className="p-5 flex flex-col gap-2">
        <h1>Signed in as {authContext?.currentUser?.displayName}</h1>
        <SignInWithSpotify />
        <button
          className="bg-neutral-900 hover:bg-neutral-950 text-neutral-300 w-fit h-fit p-2 rounded-lg"
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
        </button>
      </div>

      <button
        className="bg-neutral-900 rounded-lg text-white p-2"
        onClick={() => {
          console.log(youtubePlaylists?.items);
        }}
      >
        Print youtube playlists array to console
      </button>

      <div className="flex justify-center mt-4">
        <div className="grid lg:grid-cols-3 xl:grid-cols-4 sm:grid-cols-2 gap-6 grid-flow-row-dense w-10/12 justify-center">
          {loading ? (
            <p className="text-black text-4xl">Loading playlists...</p>
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
