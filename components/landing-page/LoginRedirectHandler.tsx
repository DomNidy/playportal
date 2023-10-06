// This component will be lazy loaded on the landing page, it will replace the text of the login button with "Dashboard" if the user is already authed
"use client";

import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";
import { getFirebaseApp } from "@/lib/utility/GetFirebaseApp";
import { Auth, User, getAuth } from "firebase/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LoginRedirectHandler() {
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    // Initializes firebase app so we can use the sdk
    getFirebaseApp();

    // Create an event listener to listen to changes in the users auth state
    // If the user is authed, update the user state
    const listener = getAuth().onAuthStateChanged((newState) => {
      if (newState) {
        setUser(newState);
        console.log("Updated user state");
      }
    });

    // Return function to remove the event listener
    return listener;
  }, []);

  if (user) {
    return (
      <Link
        href={`${GetBaseUrl()}dashboard`}
        className="shadow-md font-bold -tracking-[0.55px] 
 px-[19px] py-[2px] w-fit h-fit bg-[#C10080] hover:bg-[#ae3686] rounded-[30px] cursor-pointer"
      >
        Dashboard
      </Link>
    );
  }
  return (
    <Link
      href={`${GetBaseUrl()}login`}
      className="shadow-md font-bold -tracking-[0.55px] 
px-[19px] py-[2px] w-fit h-fit bg-[#C10080] hover:bg-[#ae3686] rounded-[30px] cursor-pointer"
    >
      Login
    </Link>
  );
}
