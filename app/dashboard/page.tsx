"use client";
import { getAuth, Auth, User } from "firebase/auth";
import { FirebaseApp, initializeApp } from "firebase/app";
import { useEffect, useState } from "react";
import SignedInWithGoogleCard from "../components/SignedInWithGoogleCard";
import SignedInWithSpotifyCard from "../components/SignedInWithSpotifyCard";
import { UserPlaylists } from "../interfaces/SpotifyInterfaces";
import { getCurrentUsersPlaylists } from "../fetching/spotify/Playlists";
import { SimplifiedPlaylist } from "../components/SimplifiedPlaylist";
import { firebase_options } from "../auth/GoogleAuthFlow";
import { useRouter } from "next/navigation";

export default function Home() {
  const [app, setApp] = useState<FirebaseApp>(initializeApp(firebase_options));

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
  // Next router
  const router = useRouter();

  useEffect(() => {
    // Add auth state listener
    auth?.onAuthStateChanged((user) => {
      if (user) {
        setFirebaseUser(user);
      } else {
        router.push("/login");
      }
    });
  }, [auth, firebaseUser, router]);

  return (
    <div className="min-h-screen w-full bg-gray-200 ">
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
        <div className="flex justify-center">
          <div className="grid lg:grid-cols-3 xl:grid-cols-4 sm:grid-cols-2 gap-6 grid-flow-row-dense w-10/12 ">
            {playlists.items.map((playlist, idx) => (
              <SimplifiedPlaylist playlist={playlist} key={idx} />
            ))}
          </div>
        </div>
      ) : (
        "No playlists found"
      )}
    </div>
  );
}
