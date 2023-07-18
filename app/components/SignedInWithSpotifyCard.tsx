"use client";
import Image from "next/image";
import { CLIENT_ID, fetchProfile, loginSpotify } from "../auth/SpotifyAuthFlow";
import {
  SpotifyUserProfile,
  StorageKeys,
} from "../interfaces/SpotifyInterfaces";
import { SetStateAction, Suspense, useEffect, useState } from "react";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
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

  // Whether auth flow is done
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Check if we have access token in url params
    let atParam: any = searchParams.get("at");
    // The state param is the state value we exchanged with spotify api
    let stateParam: any = searchParams.get("tempstate");

    // TODO: For some reason we are not detecting the params in the url it seems.
    // TODO: We are not sending the api request to the /api/user/spotify-token/make-owner endpoint
    // TODO: Figure this out :)
    // If we have a tempstate param in our url, we should
    // request the api to replace the name of the document that has the name of {state} to the firebase UID of current user
    console.log(
      `State param: ${stateParam}\nLocal state:${localStorage.getItem(
        "state"
      )}\nAccess token param:${atParam}`
    );

    console.log("Auth curr user", auth.currentUser);
    if (
      stateParam &&
      stateParam == localStorage.getItem("state") &&
      atParam &&
      auth.currentUser
    ) {
      console.log("state param found!");
      fetch(
        `${GetBaseUrl()}api/user/spotify-token/make-owner?state=${stateParam}&uid=${
          auth.currentUser.uid
        }`,
        {
          method: "POST",
        }
      ).then((response) => {
        // Set access token in local storage
        localStorage.setItem(StorageKeys.ACCESS_TOKEN, atParam);
        setLoaded(true);
        console.log("Criteria met for redirect");
        router.push(GetBaseUrl()!);
      });
    }

    // Check if we need to fetch spotify user profile
    if (localStorage.getItem("accessToken")) {
      const accessToken = JSON.parse(
        localStorage.getItem("accessToken")!
      ).access_token;
      fetchProfile(accessToken, router).then((userProfile) => {
        setSpotifyUserProfile(userProfile);
        localStorage.setItem("userProfile", JSON.stringify(userProfile));
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
