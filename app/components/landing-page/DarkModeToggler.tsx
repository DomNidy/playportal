import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { MdOutlineDarkMode, MdDarkMode } from "react-icons/md";

export default function DarkModeToggler() {
  const router = useRouter();

  function setDarkMode() {
    const theme = Cookies.get("theme");

    if (theme && theme == "dark") {
      Cookies.set("theme", "light");
    } else {
      Cookies.set("theme", "dark");
    }

    router.refresh();
  }

  return (
    <div
      onClick={() => {
        setDarkMode();
      }}
      className="px-2 z-10 cursor-pointer"
    >
      <MdOutlineDarkMode className="text-3xl "></MdOutlineDarkMode>
    </div>
  );
}
