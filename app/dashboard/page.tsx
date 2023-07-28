"use client";
import { initializeApp } from "firebase/app";
import DashboardRedirectHandler from "../components/DashboardRedirectHandler";
import { Suspense, useState } from "react";
import { getAuth } from "firebase/auth";
import { firebase_options } from "../auth/GoogleAuthFlow";

export default function Dashboard() {
  const [app, setApp] = useState(initializeApp(firebase_options));
  const [auth, setAuth] = useState(getAuth());

  return (
    <div className="min-h-screen w-full bg-neutral-200 dark:bg-dm-500">
      <Suspense>
        <DashboardRedirectHandler />
      </Suspense>
      <h1 className="text-3xl text-gray-800 dark:text-gray-300 font-bold">
        Dashboard
      </h1>

      <button
        className="rounded-lg bg-black p-3 hover:bg-neutral-900"
        onClick={async () => {
          console.log(await auth.currentUser?.getIdTokenResult());
        }}
      >
        Get perms
      </button>
    </div>
  );
}
