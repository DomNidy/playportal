import { useTheme } from "next-themes";
import { CgDarkMode } from "@react-icons/all-files/cg/CgDarkMode";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="cursor-pointer inline-flex w-auto whitespace-nowrap text-ellipsis  font-semibold tracking-tighter
                   dark:text-foreground text-primary-foreground   "
    >
      <CgDarkMode
        className="text-2xl "
        onClick={() => {
          if (theme === "light") {
            setTheme("dark");
          } else {
            setTheme("light");
          }
        }}
      ></CgDarkMode>
    </div>
  );
}
