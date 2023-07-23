"use client";
import { FirebaseApp, initializeApp } from "firebase/app";
import { firebase_options } from "../auth/GoogleAuthFlow";
import { useRouter, useSearchParams } from "next/navigation";
import { Auth, getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { StorageKeys } from "../interfaces/SpotifyInterfaces";
import { GetBaseUrl } from "../utility/GetBaseUrl";

export default function DashboardRedirectHandler() {
  const [app, setApp] = useState<FirebaseApp>(initializeApp(firebase_options));

  // Read search params
  const searchParams = useSearchParams();
  const router = useRouter();

  // Gets auth instance (firebase)
  const [auth, setAuth] = useState<Auth>(getAuth());

  useEffect(() => {
    // Check if we have access token in url params
    let accessTokenParam: any = searchParams.get("at");
    // The state param is the state value we exchanged with spotify api
    let stateParam: any = searchParams.get("ts");
    console.log(
      accessTokenParam,
      stateParam,
      localStorage.getItem("state") && accessTokenParam,
      auth.currentUser,
      auth
    );

    // When auth state changes
    onAuthStateChanged(auth, (user) => {
      // If user is signed in
      if (user) {
        // If our urls contain state param and access token (we should commit these to our database)
        if (
          stateParam &&
          stateParam == localStorage.getItem("state") &&
          accessTokenParam
        ) {
          // Make current UID own the spotify token in database
          fetch(
            `${GetBaseUrl()}api/user/spotify/token/make-owner?state=${stateParam}&uid=${
              user.uid
            }`,
            {
              method: "POST",
            }
          ).then(() => {
            // Set access token in local storage
            localStorage.setItem(StorageKeys.ACCESS_TOKEN, accessTokenParam);
            // Redirect to dashboard
            router.push(`${GetBaseUrl()}/dashboard`);
          });
        }
      }
    });
  });
  return <></>;
}
