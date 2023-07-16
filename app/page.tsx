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

    // TODO: THIS METHOD IS POTENTIALLY DANGEROUS, USERS COULD IN THEORY "STEAL" A TEMP KEY IF THEY ARE ABLE TO GUESS THE RANDOMLY GENERATED UUID
    // TODO: IF THIS IS PERFORMED, A USER WOULD HAVE THEIR UUID BE ASSOSCIATED WITH ANOTHER USERS SPOTIFY ACCESS TOKEN, BASICALLY ALLOWING THEM ACCESS
    // TODO: TO PERFORM ANY AUTHORIZED ACTIONS ON THEIR ACCOUNT
    // TODO: IMPLEMENT STRONGER MORE SECURE HASHING ALGORITHM ON THIS PARAM, ALSO EXPIRE THE TOKENS THAT HAVE TEMP KEYS PERIODICALLY
    // If we have a tempKey param in our url, we should request the api to change the name of the document with the tempKey as it's name to our name in firestore
    if (urlParams.searchParams.tempKey) {

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
