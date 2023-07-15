"use client";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  Auth,
  User,
} from "firebase/auth";
import { signIn } from "./auth/GoogleAuthFlow";
import { FirebaseApp, initializeApp } from "firebase/app";
import { useEffect, useState } from "react";
import SignedInCard from "./components/SignedInWithGoogleCard";

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
  const [user, setUser] = useState<User>();

  // This function is passed to the signincard to give it access to our user state
  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  useEffect(() => {
    auth?.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      }
      console.log("Auth state changed", user);
    });
  });

  return (
    <div className="min-h-screen w-full bg-gray-900">
      <SignedInCard
        displayName={user?.displayName}
        email={user?.email}
        photoURL={user?.photoURL}
        updateUser={updateUser}
      />
    </div>
  );
}
