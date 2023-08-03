"use client";
import Image from "next/image";
import { SPOTIFY_CLIENT_ID, loginSpotify } from "../auth/SpotifyAuthFlow";
import { SpotifyUserProfile } from "../definitions/SpotifyInterfaces";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../contexts/AuthContext";
import { fetchSpotifyProfile } from "../fetching/FetchConnections";
import { StorageKeys } from "../definitions/Enums";
import { PROFILE_CACHE_EXPIRY_DURATION_MS } from "../config";

export default function SignInWithSpotify() {
  const authContext = useContext(AuthContext);

  // Get router
  const router = useRouter();

  // The user profile returned from spotify api
  // Should be initialzed as the localStorage profile or empty json object
  // This allows us to hide the wait time of fetching the profile
  const [spotifyUserProfile, setSpotifyUserProfile] = useState<
    SpotifyUserProfile | undefined | null
  >(undefined);

  useEffect(() => {
    // Try to get userprofile from storage
    const userProfile = localStorage.getItem(StorageKeys.SPOTIFY_USER_PROFILE);

    // If our user profile is in storage
    if (userProfile) {
      const parsedProfile = JSON.parse(userProfile) as SpotifyUserProfile;
      setSpotifyUserProfile(parsedProfile);
    }
  }, []);

  useEffect(() => {
    // Function that fetches the spotify profile
    async function fetchAndSetSpotifyProfile() {
      // If current user uid is undefined, dont fetch
      if (authContext?.currentUser?.uid == undefined) {
        console.log("Current user undefined, not fetching profile");
        return;
      }

      // If we have an auth instance, fetch the profile
      if (authContext) {
        fetchSpotifyProfile(authContext).then(async (newProfile) => {
          if (newProfile) {
            // Set cache expiration time of 10 minutes
            newProfile.cache_expiry = Date.now() + PROFILE_CACHE_EXPIRY_DURATION_MS;
            // Set our spotify profile state
            setSpotifyUserProfile(newProfile);
            // Store profile in localStorage
            localStorage.setItem(
              StorageKeys.SPOTIFY_USER_PROFILE,
              JSON.stringify(newProfile)
            );
          }
          // If the request 404'd this means that the UID has no spotify access token in the database (or the UID is invalid somehow)
          // In this case we should remove the spotify user profile from local cache and set that state of spotify profile to undefined
          else {
            setSpotifyUserProfile(null);
            // Remove cached spotify profile
            localStorage.removeItem(StorageKeys.SPOTIFY_USER_PROFILE);
          }
        });
      }
    }
    // Try to get cached profile
    let cachedProfile = localStorage.getItem(StorageKeys.SPOTIFY_USER_PROFILE);

    // If we have a cached profile
    if (cachedProfile) {
      // Parse cached profile if it exists, and cast it to SpotifyUserProfile
      let cachedSpotifyProfile = JSON.parse(
        cachedProfile
      ) as SpotifyUserProfile;

      // If our profile is not expired
      if (
        !cachedSpotifyProfile.cache_expiry ||
        cachedSpotifyProfile.cache_expiry < Date.now()
      ) {
        // Set this to spotify profile state
        setSpotifyUserProfile(cachedSpotifyProfile);
      }

      // If our profile is expired or expires property is not defined
      // Fetch the spotify profile
      if (
        !cachedSpotifyProfile.cache_expiry ||
        cachedSpotifyProfile.cache_expiry < Date.now()
      ) {
        // Fetch and set the spotify profile state
        fetchAndSetSpotifyProfile();
      }
    } else {
      // If we do not have a cached profile, fetch and set profile state
      fetchAndSetSpotifyProfile();
    }
  }, [authContext, authContext?.currentUser?.uid]);

  return (
    <div
      className={` flex bg-neutral-900 rounded-3xl p-2 items-center gap-2 w-fit text-neutral-300 cursor-pointer hover:bg-neutral-950  transition-all duration-75 drop-shadow-lg`}
      onClick={() => {
        loginSpotify(SPOTIFY_CLIENT_ID!, router);
      }}
    >
      <Image
        src={
          spotifyUserProfile && spotifyUserProfile?.images?.at(1)
            ? `${spotifyUserProfile.images[1].url}`
            : "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
        }
        alt={"Spotify icon"}
        width={128}
        height={128}
        loading="eager"
        className="rounded-full h-[48px] w-[48px]"
      />

      <h2 className="font-bold pointer-events-none min-w-[64px]">
        {spotifyUserProfile && spotifyUserProfile.display_name
          ? `${spotifyUserProfile.display_name}`
          : `Sign In`}
      </h2>
    </div>
  );
}
