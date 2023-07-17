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
    // The state param is the state value we exchanged with spotify api
    let stateParam: any = undefined;

    if (urlParams.searchParams.state) {
      stateParam = urlParams.searchParams.state;
    }

    // If we have a state param in our url, we should
    // request the api to replace the name of the document that has the name of {state} to the firebase UID of current user
    if (
      stateParam &&
      stateParam == localStorage.getItem("state") &&
      firebaseUser
    ) {
      console.log("state param found!");
      fetch(
        `http://localhost:3000/api/user/spotify-token/make-owner?state=${stateParam}&uid=${firebaseUser.uid}`,
        {
          method: "POST",
        }
      ).then((response) => {
        document.location = `http://localhost:3000`;
      });
    }

    // Add auth state listener
    auth?.onAuthStateChanged((user) => {
      if (user) {
        setFirebaseUser(user);
      }
      console.log("Auth state changed", user);
    });
  }, [auth, firebaseUser, urlParams]);

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
