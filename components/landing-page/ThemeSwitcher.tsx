"use client";
import { useTheme } from "next-themes";
import { CgDarkMode } from "@react-icons/all-files/cg/CgDarkMode";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <CgDarkMode
        className="text-2xl cursor-pointer inline-flex w-auto whitespace-nowrap text-ellipsis  font-semibold tracking-tighter
      dark:text-muted-foreground text-muted  "
        onClick={() => {
          if (theme === "light") {
            setTheme("dark");
          } else {
            setTheme("light");
          }
        }}
      ></CgDarkMode>
    </>
  );
}
