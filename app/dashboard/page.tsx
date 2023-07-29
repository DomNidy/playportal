"use client";
import { useContext } from "react";
import DashboardRedirectHandler from "../components/dashboard/DashboardRedirectHandler";
import { AuthContext } from "../contexts/AuthContext";

export default function Dashboard() {
  const authContext = useContext(AuthContext);
  return (
    <div className="min-h-screen w-full bg-neutral-200 dark:bg-dm-800 ">
      <DashboardRedirectHandler />

      <h1 className="text-3xl text-gray-800 dark:text-gray-300 font-bold">
        Dashboard
      </h1>


      <button
        className="rounded-lg bg-black p-3 hover:bg-neutral-900"
        onClick={async () => {
          console.log(await authContext?.currentUser?.getIdTokenResult());
        }}
      >
        Get perms
      </button>
    </div>
  );
}
