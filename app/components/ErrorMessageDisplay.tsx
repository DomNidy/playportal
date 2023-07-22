"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function ErrorMessageDisplay() {
  // Read search params
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error-message");

  return (
    <div className="bg-neutral-400 w-fit text-neutral-900 rounded-lg p-1">
      <h2 className="text-2xl font-mono font-semibold">
        Error: <span className="text-base font-mono">{errorMessage}</span>
      </h2>
    </div>
  );
}
