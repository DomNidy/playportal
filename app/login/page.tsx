"use client";
import { User } from "firebase/auth";
import SignedInWithGoogleCard from "../components/SignedInWithGoogleCard";
import { initializeApp } from "firebase/app";
import { firebase_options } from "../auth/GoogleAuthFlow";

export default function LoginPage() {
  initializeApp(firebase_options);
  return (
    <div className="bg-gray-200 flex min-h-screen w-screen justify-center gap-2 items-center">
      <div className="flex flex-col items-center">
        <h1 className="text-6xl text-neutral-800 font-bold pointer-events-none">
          Multi Migrate
        </h1>
        <p className="text-neutral-600 text-center pointer-events-none">
          Please sign in to access the site.
        </p>
        <SignedInWithGoogleCard
          photoURL={undefined}
          displayName={undefined}
          email={undefined}
          updateUser={function (newUser: User): void {
            throw new Error("Function not implemented.");
          }}
        />
      </div>
    </div>
  );
}
