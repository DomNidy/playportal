"use client";
import { useRouter } from "next/navigation";
import { IconType } from "@react-icons/all-files/lib/esm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";

interface NavbarButtonProps {
  label: string;
  page_url?: string;
  icon: IconType;
  active: boolean;
  onClickCallback?: () => void;
}

const NavbarButton: React.FC<NavbarButtonProps> = ({
  label,
  page_url,
  icon: IconComponent,
  active,
  onClickCallback,
}) => {
  const router = useRouter();

  return (
    <TooltipProvider>
      <Tooltip delayDuration={225}>
        <TooltipTrigger asChild>
          <Button
            className={`p-3.5 group  w-fit bg-opacity-0 whitespace-nowrap overflow-hidden tracking-tight 
      font-semibold  hover:text-input hover:bg-input
       hover:bg-opacity-20  bg-primary-foreground/15 rounded-lg 
       ${
         active
           ? "dark:text-foreground text-primary-foreground"
           : "dark:text-foreground/80  text-primary-foreground/80"
       }
      }`}
            onClick={() => {
              // If we were provided with a callback function, invoke it
              if (onClickCallback) {
                onClickCallback();
              }

              // If we were provided with a page url, push it to the router
              if (page_url) {
                router.push(page_url);
              }
            }}
          >
            <div className="group w-fit px-2 pt-1 pb-1 justify-start flex items-center  gap-2   transition-all">
              <IconComponent
                className={`text-xl transition-colors  
                      group-hover:text-foreground/80`}
              />

              <p
                className={`truncate  hidden  w-fit text-base transition-colors  
                      group-hover:text-foreground/80`}
              >
                {label}
              </p>
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={3} side="bottom" className="relative -left-4">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NavbarButton;
