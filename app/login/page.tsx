"use client";
import SignInWithGoogle from "../components/SignInWithGoogle";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SignInWithEmail from "../components/SignInWithEmail";
import ThemeSwitcher from "../components/landing-page/ThemeSwitcher";

export default function LoginPage() {

  // Next router
  const router = useRouter();

  // Add authstate changed callback
  useEffect(() => {
    const listener = onAuthStateChanged(getAuth(), (authState) => {
      // If the user is authenticated, redirect to the dashboard
      if (authState) {
        router.push("/dashboard");
      }
    });

    return () => {
      listener();
    };
  });

  return (
    <div className="dark:bg-dark items-center flex flex-col min-h-screen w-screen justify-center gap-2 select-none">
      <div className="absolute w-full flex justify-end top-0 items-start z-20 p-2 ">
        <ThemeSwitcher></ThemeSwitcher>
      </div>
      <div className=" dark:bg-dark-container h-fit w-fit lg:min-w-[350px] p-5 flex flex-col rounded-lg items-center sm:gap-4 md:gap-6 relative top-7 md:top-0">
        <h1 className="text-gray-600 dark:text-slate-300 font-bold text-4xl md:text-5xl pb-3">
          Playportal
        </h1>
        <div className="items-center justify-center">
          <SignInWithEmail />
        </div>
        <h1 className="text-gray-500 italic text-lg border-t-2  border-t-gray-300 w-full text-center mt-8 mb-3">
          or
        </h1>
        <div className="flex flex-col gap-4 items-center">
          <SignInWithGoogle
            photoURL={undefined}
            displayName={undefined}
            email={undefined}
          />
        </div>
      </div>
    </div>
  );
}
