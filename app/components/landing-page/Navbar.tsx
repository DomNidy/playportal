"use client";
import { FirebaseApp, initializeApp } from "firebase/app";
import { firebase_options } from "@/app/auth/GoogleAuthFlow";
import { Auth, User, getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BiMenu } from "react-icons/bi";

export default function Navbar() {
  const app = initializeApp(firebase_options);
  const [auth, setAuth] = useState<Auth>(getAuth());
  const router = useRouter();
  // Reference to firebase user object
  const [firebaseUser, setFirebaseUser] = useState<User | undefined>();

  useEffect(() => {
    onAuthStateChanged(auth, (newAuthState) => {
      if (newAuthState) {
        setFirebaseUser(newAuthState);
      } else {
        setFirebaseUser(undefined);
      }
    });
  });

  return (
    <div className="fixed flex h-14 p-2 w-full bg-white shadow-sm text-gray-800 font-semibold items-center z-20  drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.2)]">
      <h1 className="text-3xl pr-2 md:pr-4">Playport</h1>

      <div
        className="flex flex-1 flex-grow-0 justify-evenly
                  basis-0 md:max-w-none max-w-0
                  md:basis-96 scale-0 md:scale-100"
      >
        <h1 className="text-xl max-w-0 md:max-w-none">Features</h1>
        <h1 className="text-xl max-w-0 md:max-w-none">Platforms</h1>
        <h1 className="text-xl max-w-0 md:max-w-none">Support</h1>
      </div>
      <div className="max-w-none md:max-w-0 flex flex-1 flex-row-reverse">
        <BiMenu className="scale-100 text-3xl md:scale-0 cursor-pointer" />
      </div>
      <div className="max-w-0 md:max-w-none flex flex-1 flex-row-reverse">
        {firebaseUser ? (
          <h1
            className="scale-0 md:scale-100 pr-8 cursor-pointer"
            onClick={() => {
              router.push("/dashboard");
            }}
          >
            Dashboard
          </h1>
        ) : (
          <h1
            className="scale-0 md:scale-100 pr-8 cursor-pointer"
            onClick={() => {
              router.push("/login");
            }}
          >
            Login
          </h1>
        )}
      </div>
    </div>
  );
}
