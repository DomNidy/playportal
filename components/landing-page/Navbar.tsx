import NavbarDropdownMenu from "./NavbarDropdownMenu";
import ThemeSwitcher from "./ThemeSwitcher";
import Link from "next/link";

export default function Navbar() {

  return (
    <div className="bg-primary  dark:bg-background dark:text-gray-400 fixed flex h-14   p-2 w-full shadow-sm text-gray-800 font-semibold justify-center items-center z-20  drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.2)]">
      <div className="flex  w-full min-w-[640px]:bg-red-400  sm:w-[500px] md:w-[700px] lg:w-[950px] xl:w-[1100px]">
        <h1 className="text-xl md:text-2xl lg:text-3xl tracking-tighter pr-2 md:pr-4 w-full text-primary-foreground dark:text-foreground">
          Playportal
        </h1>
        <div className="flex w-[80%] justify-end items-center gap-4">
          <ThemeSwitcher />
          <Link
            href={"/login"}
            className="bg-primary-foreground font-semibold text-primary rounded-lg pt-1.5 pb-1.5 px-1 text-lg md:text-xl lg:text-xl hidden md:block cursor-pointer dark:text-foreground"
          >
            Dashboard
          </Link>
          <NavbarDropdownMenu />
        </div>
      </div>
    </div>
  );
}
