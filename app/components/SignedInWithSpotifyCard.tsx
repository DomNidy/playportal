"use client";
import Image from "next/image";
import { CLIENT_ID, fetchProfile, loginSpotify } from "../auth/SpotifyAuthFlow";
import { SpotifyUserProfile } from "../interfaces/SpotifyInterfaces";
import { SetStateAction, Suspense, useEffect, useState } from "react";

export default function SignedInWithSpotifyCard() {
  // The user profile returned from spotify api
  const [spotifyUserProfile, setSpotifyUserProfile] = useState<
    SpotifyUserProfile | false
  >(false);

  useEffect(() => {
    console.log("RAN EF2");
    // Check if we need to fetch spotify user profile
    if (localStorage.getItem("accessToken")) {
      const accessToken = JSON.parse(
        localStorage.getItem("accessToken")!
      ).access_token;
      fetchProfile(accessToken).then((userProfile) => {
        setSpotifyUserProfile(userProfile);
        localStorage.setItem("userProfile", JSON.stringify(userProfile));
      });
    }
  }, []);

  return (
    <div
      className="flex bg-neutral-900 rounded-3xl p-2 items-center gap-2 w-fit text-neutral-300 cursor-pointer hover:bg-neutral-950  transition-all duration-75 drop-shadow-lg"
      onClick={() => {
        loginSpotify(CLIENT_ID!);
      }}
    >
      <Image
        src={
          "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
        }
        alt={"Spotify icon"}
        width={48}
        height={48}
      />
      <h2 className="font-bold pointer-events-none">
        {spotifyUserProfile ? `${spotifyUserProfile.display_name}` : `Sign In`}
      </h2>
    </div>
  );
}
