"use client";
import { initializeApp } from "firebase/app";
import { firebase_options } from "../auth/GoogleAuthFlow";
import SignedInWithGoogleCard from "../components/SignedInWithGoogleCard";
import { Auth, User, getAuth } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GetBaseUrl } from "../utility/GetBaseUrl";

export default function LoginPage() {
  // Gets auth instance
  const [auth, setAuth] = useState<Auth>(getAuth());

  // Next router
  const router = useRouter();
  initializeApp(firebase_options);
  return (
    <div className="bg-neutral-950 flex min-h-screen w-screen justify-center gap-2 items-center">
      <div className="bg-neutral-800 h-1/3 w-1/3 fixed top-0 flex flex-col rounded-lg items-center">
        <h1 className="text-gray-200 font-bold text-5xl">Playportal</h1>
        <h1 className="text-gray-200 italic text-xl">
          Please Login to Access the Website
        </h1>
        <SignedInWithGoogleCard
          photoURL={undefined}
          displayName={undefined}
          email={undefined}
          updateUser={function (newUser: User): void {
            if (newUser) {
              auth.updateCurrentUser(newUser);
              router.push(`${GetBaseUrl()}/dashboard`);
            }
          }}
        />
      </div>
    </div>
  );
}
