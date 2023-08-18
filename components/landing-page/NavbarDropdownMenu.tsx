"use client";
import { useState } from "react";
import { BiMenu } from "@react-icons/all-files/bi/BiMenu";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import Link from "next/link";

export default function NavbarDropdownMenu() {
  // If the dropdown menu is displayed
  const [isActive, setIsActive] = useState<boolean>(false);
  return (
    <div>
      {!isActive && (
        <BiMenu
          className="scale-100 text-3xl md:hidden cursor-pointer "
          onClick={() => setIsActive(!isActive)}
        />
      )}

      {isActive && (
        <>
          <div
            className={
              "fixed flex flex-row-reverse  top-0 right-0 screen h-0 transition-all "
            }
          >
            <AiOutlineClose
              className={
                "text-3xl mt-[0.66rem] mr-[0.47rem] z-10  duration-100 cursor-pointer hover:text-primary transition-colors"
              }
              onClick={() => setIsActive(!isActive)}
            />

            <section className="w-full h-fit py-12 flex flex-col p-3 fixed  items-center dark:bg-dark gap-4 bg-white tracking-tight font-semibold">
              <div
                className={`bg-white dark:bg-dark hover:bg-primary hover:text-background text-center p-1 w-2/3 cursor-pointer transition-colors rounded-lg shadow-inner `}
              >
                <h2 className="text-center">Features</h2>
              </div>
              <div
                className={`bg-white dark:bg-dark hover:bg-primary hover:text-background text-center p-1 w-2/3 cursor-pointer transition-colors rounded-lg shadow-inner `}
              >
                <h2 className="text-center">Platforms</h2>
              </div>
              <div
                className={`bg-white dark:bg-dark hover:bg-primary hover:text-background text-center p-1 w-2/3 cursor-pointer transition-colors rounded-lg shadow-inner `}
              >
                <h2 className="text-center">Support</h2>
              </div>
              <div
                className={`bg-white dark:bg-dark hover:bg-primary hover:text-background text-center p-1 w-2/3 cursor-pointer transition-colors rounded-lg shadow-inner `}
              >
                <Link href={"/login"} className="text-center">
                  Login
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
