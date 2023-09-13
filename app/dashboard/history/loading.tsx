"use client";
import { ScaleLoader } from "react-spinners";
import { useTheme } from "next-themes";

export default function Loading() {
  const theme = useTheme();
  return (
    <ScaleLoader
      color={`${theme.resolvedTheme == "dark" ? "white" : "#4A179B"}`}
      className="fixed inset-0 flex items-center justify-center  translate-x-1/2 translate-y-1/2 "
    />
  );
}
