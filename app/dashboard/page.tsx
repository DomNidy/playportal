"use client";
import DashboardRedirectHandler from "../components/DashboardRedirectHandler";
import { getAuth } from "firebase/auth";


export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-neutral-200 dark:bg-dm-500">
      <DashboardRedirectHandler />

      <h1 className="text-3xl text-gray-800 dark:text-gray-300 font-bold">
        Dashboard
      </h1>

      <button
        className="rounded-lg bg-black p-3 hover:bg-neutral-900"
        onClick={async () => {
          console.log(await getAuth().currentUser?.getIdTokenResult());
        }}
      >
        Get perms
      </button>
    </div>
  );
}
