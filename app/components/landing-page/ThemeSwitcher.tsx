import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { MdOutlineDarkMode, MdDarkMode } from "react-icons/md";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="z-10 cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis">
      <Select onValueChange={(theme) => setTheme(theme)}>
        <SelectTrigger className="max-w-[9rem] w-full bg-neutral-100 dark:bg-dm-50 shadow-sm ">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup >
            <SelectLabel className="pointer-events-none ">Themes</SelectLabel>
            <SelectItem value="light" className="cursor-pointer">
              Light
            </SelectItem>
            <SelectItem value="dark" className="cursor-pointer">
              Dark
            </SelectItem>
            <SelectItem
              value="system"
              className="cursor-pointer "
            >
              System
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
