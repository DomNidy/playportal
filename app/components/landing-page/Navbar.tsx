"use client";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavbarDropdownMenu from "./NavbarDropdownMenu";
import ThemeSwitcher from "./ThemeSwitcher";
import { getFirebaseApp } from "@/app/utility/GetFirebaseApp";

export default function Navbar() {
  getFirebaseApp();
  const router = useRouter();
  // Reference to firebase user object
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // Width of the browser window
  const [windowWidth, setWindowWidth] = useState<number | undefined>(9999);

  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const listener = onAuthStateChanged(getAuth(), (newAuthState) => {
      if (newAuthState) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => {
      listener();
    };
  }, []);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  });

  return (
    <div className="dark:bg-dark dark:text-gray-400 fixed flex h-14 p-2 w-full bg-white shadow-sm text-gray-800 font-semibold items-center z-20  drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.2)]">
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
        {windowWidth && windowWidth < 768 ? (
          <div className="flex flex-row ">
            <ThemeSwitcher />
            <NavbarDropdownMenu isLoggedIn={isLoggedIn} />
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="max-w-0 md:max-w-none flex flex-1 flex-row-reverse">
        {isLoggedIn ? (
          <div className="flex flex-row items-center">
            <h1
              className="scale-0 md:scale-100 pr-4 cursor-pointer"
              onClick={() => {
                router.push("/dashboard");
              }}
            >
              Dashboard
            </h1>
            {windowWidth && windowWidth >= 768 ? <ThemeSwitcher /> : <></>}
          </div>
        ) : (
          <div className="flex flex-row items-center">
            <h1
              className="scale-0 md:scale-100 pr-4 cursor-pointer"
              onClick={() => {
                router.push("/login");
              }}
            >
              Login
            </h1>
            {windowWidth && windowWidth >= 768 ? <ThemeSwitcher /> : <></>}
          </div>
        )}
      </div>
    </div>
  );
}
