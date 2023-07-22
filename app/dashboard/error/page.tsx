"use client";
import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  // Read search params
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error-message");

  return (
    <div className="min-h-screen bg-neutral-200 w-full flex flex-col">
      <h1 className="text-3xl font-semibold text-black">
        Sorry, an while processing your request. Please try again.
      </h1>
      <div className="bg-neutral-400 w-fit text-neutral-900 rounded-lg p-1">
        <h2 className="text-2xl font-mono font-semibold">
          Error: <span className="text-base font-mono">{errorMessage}</span>
        </h2>
      </div>
    </div>
  );
}
