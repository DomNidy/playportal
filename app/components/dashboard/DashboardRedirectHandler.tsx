"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { GetBaseUrl } from "../../utility/GetBaseUrl";
import { URLParamNames } from "../../interfaces/Enums";

export default function DashboardRedirectHandler() {
  // Read search params
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // This param is the state value we exchanged with spotify api
    let spotifyTempKeyParam: any = searchParams.get(
      URLParamNames.SPOTIFY_TEMP_KEY_PARAM
    );

    // Temp key of access token document in db
    let youtubeTempKeyParam: any = searchParams.get(
      URLParamNames.YOUTUBE_TEMP_KEY_PARAM
    );

    // When auth state changes
    const listener = onAuthStateChanged(getAuth(), (user) => {
      // If user is signed in
      if (user) {
        // If our urls contain state param  (we should commit these to our database)
        if (
          spotifyTempKeyParam &&
          spotifyTempKeyParam == localStorage.getItem("state")
        ) {
          // Make current UID own the spotify token in database
          fetch(
            `${GetBaseUrl()}api/user/spotify/token/make-owner?${
              URLParamNames.SPOTIFY_TEMP_KEY_PARAM
            }=${spotifyTempKeyParam}&uid=${user.uid}`,
            {
              method: "POST",
            }
          ).then(() => {
            // Redirect to dashboard
            router.push(`${GetBaseUrl()}dashboard`);
          });
        }

        // If we have the youtube temp key param in our url
        if (youtubeTempKeyParam) {
          // Make current UID own the youtube token in database
          fetch(
            `${GetBaseUrl()}api/user/youtube/token/make-owner?${
              URLParamNames.YOUTUBE_TEMP_KEY_PARAM
            }=${youtubeTempKeyParam}&uid=${user.uid}`,
            {
              method: "POST",
            }
          ).then(() => {
            // TODO: We could add a screen that lets the user know they have successfully authenticated at some point
            // Redirect to dashboard
            router.push(`${GetBaseUrl()}dashboard`);
          });
        }
      }
    });

    return () => {
      listener();
    };
  });
  return <></>;
}
