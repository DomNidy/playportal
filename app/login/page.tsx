"use client";
import { initializeApp } from "firebase/app";
import { firebase_options } from "../auth/GoogleAuthFlow";
import SignInWithGoogle from "../components/SignInWithGoogle";
import { Auth, User, getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GetBaseUrl } from "../utility/GetBaseUrl";
import SignInWithEmail from "../components/SignInWithEmail";

export default function LoginPage() {
  // Gets auth instance
  const [auth, setAuth] = useState<Auth>(getAuth());

  // Next router
  const router = useRouter();

  // Add authstate changed callback
  useEffect(() => {
    auth.onAuthStateChanged((authState) => {
      // If the user is authenticated, redirect to the dashboard
      if (authState) {
        router.push("/dashboard");
      }
    });
  });

  initializeApp(firebase_options);
  return (
    <div className="bg-gray-100 dark:bg-dark  flex min-h-screen w-screen justify-center gap-2 select-none">
      <div className=" dark:bg-dark-container bg-gray-200 p-2 shadow-md h-fit w-fit relative flex flex-col rounded-lg items-center sm:top-32">
        <h1 className="text-gray-600 font-bold text-4xl md:text-5xl">
          Playportal
        </h1>

        <h1 className="text-gray-600 text-md md:text-xl pb-4">
          Sign up now with any of the methods below!
        </h1>
        <div className="flex flex-col gap-4 items-center">
          <SignInWithGoogle
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
          <h1 className="text-gray-500 italic text-lg border-t-2  border-t-gray-300 w-full text-center">
            or
          </h1>

          <div className="items-center justify-center">
            <SignInWithEmail />
          </div>
        </div>
      </div>
    </div>
  );
}
