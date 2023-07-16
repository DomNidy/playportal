"use client";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  Auth,
  User,
} from "firebase/auth";

import { FirebaseApp, initializeApp } from "firebase/app";
import { Suspense, useEffect, useState } from "react";
import SignedInWithGoogleCard from "./components/SignedInWithGoogleCard";
import SignedInWithSpotifyCard from "./components/SignedInWithSpotifyCard";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { SpotifyUserProfile } from "./interfaces/SpotifyInterfaces";
import { fetchProfile } from "./auth/SpotifyAuthFlow";

export default function Home(urlParams: Params) {
  const [app, setApp] = useState<FirebaseApp>(
    initializeApp({
      apiKey: "AIzaSyAPczHoT5cJ1fxv4fk_fQjnRHaL8WXPX-o",
      authDomain: "multi-migrate.firebaseapp.com",
      projectId: "multi-migrate",
      storageBucket: "multi-migrate.appspot.com",
      messagingSenderId: "296730327999",
      appId: "1:296730327999:web:74c09b878bd58e8a28ff0a",
      measurementId: "G-V87LXV2M29",
    })
  );
  // Gets auth instance
  const [auth, setAuth] = useState<Auth>(getAuth());

  // Reference to firebase user object
  const [firebaseUser, setFirebaseUser] = useState<User>();

  // This function is passed to the signincard to give it access to our user state
  const updateUserFirebase = (newUser: User) => {
    setFirebaseUser(newUser);
  };

  useEffect(() => {
    let params: any = undefined;
    if (urlParams.searchParams.data) {
      params = JSON.parse(urlParams.searchParams.data);
    }
    console.log(`Params: ${JSON.stringify(params)}`);

    // Add auth state listener
    auth?.onAuthStateChanged((user) => {
      if (user) {
        setFirebaseUser(user);
      }
      console.log("Auth state changed", user);
    });

    // Check if url has 'data' param
    if (params) {
      localStorage.setItem("accessToken", JSON.stringify(params));
      document.location = "http://localhost:3000";
    }
  }, [auth, urlParams]);

  return (
    <div className="min-h-screen w-full bg-gray-200">
      <SignedInWithGoogleCard
        displayName={firebaseUser?.displayName}
        email={firebaseUser?.email}
        photoURL={firebaseUser?.photoURL}
        updateUser={updateUserFirebase}
      />
      <SignedInWithSpotifyCard />
    </div>
  );
}
