"use client";
import { FirebaseApp, initializeApp } from "firebase/app";
import { firebase_options } from "../auth/GoogleAuthFlow";
import { useRouter, useSearchParams } from "next/navigation";
import { Auth, getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { StorageKeys } from "../interfaces/SpotifyInterfaces";
import { GetBaseUrl } from "../utility/GetBaseUrl";
import { URLParamNames } from "../utility/Enums";

export default function DashboardRedirectHandler() {
  const [app, setApp] = useState<FirebaseApp>(initializeApp(firebase_options));

  // Read search params
  const searchParams = useSearchParams();
  const router = useRouter();

  // Gets auth instance (firebase)
  const [auth, setAuth] = useState<Auth>(getAuth());

  useEffect(() => {
    // The state param is the state value we exchanged with spotify api
    let stateParam: any = searchParams.get(
      URLParamNames.SPOTIFY_TEMP_KEY_PARAM
    );

    // When auth state changes
    onAuthStateChanged(auth, (user) => {
      // If user is signed in
      if (user) {
        // If our urls contain state param  (we should commit these to our database)
        if (stateParam && stateParam == localStorage.getItem("state")) {
          // Make current UID own the spotify token in database
          fetch(
            `${GetBaseUrl()}api/user/spotify/token/make-owner?${
              URLParamNames.SPOTIFY_TEMP_KEY_PARAM
            }=${stateParam}&uid=${user.uid}`,
            {
              method: "POST",
            }
          ).then(() => {
            // Redirect to dashboard
            router.push(`${GetBaseUrl()}/dashboard`);
          });
        }
      }
    });
  });
  return <></>;
}
