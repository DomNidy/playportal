"use client";
import axios from "axios";
import cookies from "js-cookie";
import {
  redirectToAuthCodeFlow,
  fetchProfile,
  getAccessToken,
  clearLocalStorageSpotifyData,
  validateAccessToken,
  loginSpotify,
} from "./auth/SpotifyAuthFlow";
import { SimplifiedPlaylist } from "./components/SimplifiedPlaylist";
import { getCurrentUsersPlaylists } from "./spotify/Playlists";
import {
  UserProfile,
  UserPlaylists,
  StorageKeys,
} from "./interfaces/SpotifyInterfaces";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home(params: Params) {
  // The user profile returned from spotify api
  const [userProfile, setUserProfile] = useState<UserProfile | false>(false);

  // Playlists returned from spotify api
  const [playlists, setPlaylists] = useState<UserPlaylists | undefined>();

  // This value will be watched in our hook that fetches data from the server
  // It should be set to false after auth completes
  const [needsNewAuth, setNeedsNewAuth] = useState<boolean>(false);

  // This is set to true when the oAuth flow is finished
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    console.log("Running effect");

    // Client id of spotify application
    const clientId = "7729d99a51604e58b7d7daca1fd4cb24";
    // Code returned from spotify redirect (part of oAuthFlow)
    // Check localstorage for a code and params for a code (they are both the same code)
    const code = localStorage.getItem(StorageKeys.CODE)
      ? localStorage.getItem(StorageKeys.CODE)
      : params.searchParams.code;
  }, [params.searchParams.code, needsNewAuth]);

  return (
    <div className="flex min-h-screen flex-col items-center sm:p-4 md:p-16 gap-2 bg-neutral-900 min-w-full">
      <button
        className="bg-white text-black"
        onClick={() => loginSpotify("7729d99a51604e58b7d7daca1fd4cb24")}
      >
        Login with Spotify
      </button>
      {loaded && userProfile && userProfile.images
        ? userProfile.images.map((img, idx) => (
            <Image
              key={idx}
              src={`${img.url}`}
              alt="User profile picture"
              width={img.width}
              height={img.height}
            />
          ))
        : ""}
      {loaded &&
      userProfile &&
      userProfile?.followers?.total &&
      userProfile?.product ? (
        <div className="w-1/2 md:w-auto">
          <ul className="sm:text-base md:text-lg text-gray-300 font-semibold overflow-hidden break-words">
            <li>
              Name:{" "}
              <span className="font-normal">{userProfile.display_name}</span>
            </li>

            <li>
              Profile Link:{" "}
              <span className="font-normal">
                <a
                  className=" text-blue-300 hover:text-blue-400"
                  href={userProfile.external_urls?.spotify}
                >
                  {userProfile.external_urls?.spotify}
                </a>
              </span>
            </li>
            <li>
              User ID: <span className="font-normal">{userProfile.id}</span>
            </li>
            <li>
              Followers:{" "}
              <span className="font-normal">
                {userProfile?.followers.total}
              </span>
            </li>
            <li>
              Tier: <span className="font-normal">{userProfile.product}</span>
            </li>
            <button
              className="bg-gray-200 rounded-md text-gray-700"
              onClick={() => {
                // Will cause effect that authenticates user to re-run
                setNeedsNewAuth(!needsNewAuth);
                // Deletes all of the spotify data in our local storage
                clearLocalStorageSpotifyData();
              }}
            >
              Not You?
            </button>
            <button
              className="bg-gray-200 rounded-md text-gray-700"
              onClick={async () => {
                // Request current users playlists again
                const _playlists = await getCurrentUsersPlaylists(20, 0);
                setPlaylists(_playlists);
              }}
            >
              Refresh playlists
            </button>
          </ul>
          {playlists ? (
            <div className="grid lg:grid-cols-3 xl:grid-cols-4 sm:grid-cols-2 gap-6 grid-flow-row-dense justify-center">
              {playlists.items.map((playlist, idx) => (
                <SimplifiedPlaylist playlist={playlist} key={idx} />
              ))}
            </div>
          ) : (
            "No playlists found"
          )}
        </div>
      ) : (
        // If we are not loaded, display the "..."
        // If we are loaded (and we do not have a userprofile, request the profile)
        <div>
          {!loaded ? (
            <p>...</p>
          ) : (
            <button
              onClick={() => {
                clearLocalStorageSpotifyData();
                setNeedsNewAuth(!needsNewAuth);
              }}
            >
              Reload
            </button>
          )}
        </div>
      )}

      {loaded && !userProfile ? (
        <div>
          <p>Could not load user profile...</p>
          <button
            className="bg-gray-200 rounded-md text-gray-700"
            onClick={() => {
              setNeedsNewAuth(!needsNewAuth);
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
