import NavbarDropdownMenu from "./NavbarDropdownMenu";
import ThemeSwitcher from "./ThemeSwitcher";
import Link from "next/link";

export default function Navbar() {
  // Reference to firebase user object

  return (
    <div className="bg-background dark:text-gray-400 fixed flex h-10 p-2 w-full shadow-sm text-gray-800 font-semibold items-center z-20  drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.2)]">
      <h1 className="text-2xl pr-2 md:pr-4 w-full ">Playportal</h1>
      <div className="flex w-screen justify-end items-center gap-4">
        <ThemeSwitcher />
        <Link href={"/login"} className="hidden md:block cursor-pointer">
          Login
        </Link>
        <NavbarDropdownMenu />
      </div>
    </div>
  );
}
