"use client";
import Image from "next/image";
import { CLIENT_ID, fetchProfile, loginSpotify } from "../auth/SpotifyAuthFlow";
import {
  SpotifyUserProfile,
  StorageKeys,
} from "../interfaces/SpotifyInterfaces";
import { SetStateAction, Suspense, useEffect, useState } from "react";
import { Auth, getAuth } from "firebase/auth";
import { GetBaseUrl } from "../utility/GetBaseUrl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function SignedInWithSpotifyCard({
  profile,
}: {
  profile: SpotifyUserProfile | false | undefined;
}) {
  // Read search params
  const searchParams = useSearchParams();

  // Get router
  const router = useRouter();

  // The user profile returned from spotify api
  const [spotifyUserProfile, setSpotifyUserProfile] = useState<
    SpotifyUserProfile | false
  >(false);

  // Gets auth instance (firebase)
  const [auth, setAuth] = useState<Auth>(getAuth());

  useEffect(() => {
    // If we are authenticated, fetch our spotify profile
    // TODO: Implement system to cause this to run less, maybe just put the profile
    // TODO: In local storage and apply a rate limit to this ? Not sure yet.
    if (auth.currentUser) {
      const spotifyProfile = fetch(
        `${GetBaseUrl()}api/user/spotify?uid=${auth.currentUser.uid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then(async (profile) => {
        const newProfile = await profile.json();
        setSpotifyUserProfile(newProfile as SpotifyUserProfile);
      });
    }
  }, [auth.currentUser, router, searchParams]);

  return (
    <div
      className="flex bg-neutral-900 rounded-3xl p-2 items-center gap-2 w-fit text-neutral-300 cursor-pointer hover:bg-neutral-950  transition-all duration-75 drop-shadow-lg"
      onClick={() => {
        loginSpotify(CLIENT_ID!, router);
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
      <h2 className="font-bold pointer-events-none">
        {spotifyUserProfile ? `${spotifyUserProfile.display_name}` : `Sign In`}
      </h2>
    </div>
  );
}
