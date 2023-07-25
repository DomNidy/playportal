"use client";
import Image from "next/image";
import { SPOTIFY_CLIENT_ID, loginSpotify } from "../auth/SpotifyAuthFlow";
import {
  SpotifyUserProfile,
  StorageKeys,
} from "../interfaces/SpotifyInterfaces";
import { useEffect, useState } from "react";
import { Auth, getAuth } from "firebase/auth";
import { GetBaseUrl } from "../utility/GetBaseUrl";
import { useRouter } from "next/navigation";

export default function SignInWithSpotify() {
  // Get router
  const router = useRouter();

  // The user profile returned from spotify api
  // Should be initialzed as the localStorage profile or empty json object
  // This allows us to hide the wait time of fetching the profile
  const [spotifyUserProfile, setSpotifyUserProfile] = useState<
    SpotifyUserProfile | undefined | null
  >(undefined);

  // Gets auth instance (firebase)
  const [auth, setAuth] = useState<Auth>(getAuth());

  useEffect(() => {
    // Try to get userprofile from storage
    const userProfile = localStorage.getItem("userProfile");
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
      if (!auth.currentUser?.uid) {
        console.log("Current user undefined, not fetching profile");
        return;
      }
      fetch(`${GetBaseUrl()}api/user/spotify?uid=${auth.currentUser?.uid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (profileResponse) => {
        if (profileResponse.ok) {
          // Parse profile
          const newProfile = await profileResponse.json();
          // Set cache expiration time of 10 minutes
          newProfile.expires = Date.now() + 600000;
          // Set our spotify profile state
          setSpotifyUserProfile(newProfile);
          // Store profile in localStorage
          localStorage.setItem("userProfile", JSON.stringify(newProfile));
        }
        // If the request 404'd this means that the UID has no spotify access token in the database (or the UID is invalid somehow)
        // In this case we should remove the spotify user profile from local cache and set that state of spotify profile to undefined
        else if (profileResponse.status == 404) {
          setSpotifyUserProfile(null);
          // Remove cached spotify profile
          localStorage.removeItem("userProfile");
        }
      });
    }

    // Try to get cached profile
    let cachedProfile = localStorage.getItem("userProfile");

    // If we have a cached profile
    if (cachedProfile) {
      // Parse cached profile if it exists, and cast it to SpotifyUserProfile
      let cachedSpotifyProfile = JSON.parse(
        cachedProfile
      ) as SpotifyUserProfile;

      // If our profile is not expired
      if (
        !cachedSpotifyProfile.expires ||
        cachedSpotifyProfile.expires < Date.now()
      ) {
        // Set this to spotify profile state
        setSpotifyUserProfile(cachedSpotifyProfile);
      }

      // If our profile is expired or expires property is not defined
      // Fetch the spotify profile
      if (
        !cachedSpotifyProfile.expires ||
        cachedSpotifyProfile.expires < Date.now()
      ) {
        // Fetch and set the spotify profile state
        fetchAndSetSpotifyProfile();
      }
    } else {
      // If we do not have a cached profile, fetch and set profile state
      fetchAndSetSpotifyProfile();
    }
  }, [auth?.currentUser?.uid]);

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
