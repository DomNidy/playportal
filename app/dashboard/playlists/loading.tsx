"use client";
import { ScaleLoader } from "react-spinners";
import { useTheme } from "next-themes";

export default function Loading() {
  const theme = useTheme();
  return (
    <ScaleLoader
      color={`${theme.resolvedTheme == "dark" ? "white" : "#4A179B"}`}
      className="fixed w-screen min-h-screen translate-x-[47%] translate-y-1/3 sm:translate-y-[40%] "
    />
  );
}
