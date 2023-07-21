import { useRouter } from "next/navigation";
import React, { MutableRefObject, ReactElement, useEffect } from "react";
import { IconBaseProps, IconType } from "react-icons";

interface SidebarButtonProps {
  label: string;
  page_url: string;
  minimized: boolean;
  window_width?: number | undefined;
  icon: IconType;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  label,
  page_url,
  minimized,
  window_width: undefined,
  icon: IconComponent,
}) => {
  const router = useRouter();

  return (
    <button
      className={`group flex justify-center w-full bg-opacity-0 whitespace-nowrap overflow-hidden ${
        minimized ? "hover:bg-opacity-20 bg-neutral-100 rounded-lg" : ""
      }`}
      onClick={() => {
        router.push(page_url);
      }}
    >
      {minimized ? (
        <div>
          <IconComponent className="text-3xl text-neutral-300 group-hover:text-white"></IconComponent>
        </div>
      ) : (
        <div className="w-full  justify-start flex text-auto  pt-1 pl-3 gap-2 md:gap-4 md:p-1.5 text-neutral-300 hover:text-white bg-opacity-0 hover:bg-opacity-20 bg-neutral-100 rounded-lg">
          <IconComponent className="text-2xl text-neutral-300 group-hover:text-white flex-shrink-0" />
          <p className="truncate">{label}</p>
        </div>
      )}
    </button>
  );
};

export default SidebarButton;
