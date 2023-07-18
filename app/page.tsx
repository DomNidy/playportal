"use client";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  Auth,
  User,
} from "firebase/auth";
import crypto from "crypto";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Suspense, useEffect, useState } from "react";
import SignedInWithGoogleCard from "./components/SignedInWithGoogleCard";
import SignedInWithSpotifyCard from "./components/SignedInWithSpotifyCard";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import {
  SpotifyUserProfile,
  UserPlaylists,
} from "./interfaces/SpotifyInterfaces";
import { fetchProfile } from "./auth/SpotifyAuthFlow";
import { getCurrentUsersPlaylists } from "./spotify/Playlists";
import { SimplifiedPlaylist } from "./components/SimplifiedPlaylist";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function Home() {
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

  // Playlists returned from spotify api
  const [playlists, setPlaylists] = useState<UserPlaylists | undefined>();

  useEffect(() => {
    // Add auth state listener
    auth?.onAuthStateChanged((user) => {
      if (user) {
        setFirebaseUser(user);
      }
    });
  }, [auth, firebaseUser]);

  return (
    <div className="min-h-screen w-full bg-gray-200">
      <SignedInWithGoogleCard
        displayName={firebaseUser?.displayName}
        email={firebaseUser?.email}
        photoURL={firebaseUser?.photoURL}
        updateUser={updateUserFirebase}
      />
      <SignedInWithSpotifyCard profile={undefined} />
      <button
        className="bg-gray-200 rounded-md text-gray-700"
        onClick={async () => {
          // Request current users playlists again
          const _playlists = await getCurrentUsersPlaylists(20, 0);
          setPlaylists(_playlists);
        }}
      >
        Refresh playlists
      </button>

      {playlists ? (
        <div className="grid lg:grid-cols-3 xl:grid-cols-4 sm:grid-cols-2 gap-6 grid-flow-row-dense justify-center">
          {playlists.items.map((playlist, idx) => (
            <SimplifiedPlaylist playlist={playlist} key={idx} />
          ))}
        </div>
      ) : (
        "No playlists found"
      )}
    </div>
  );
}
