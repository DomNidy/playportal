import ErrorMessageDisplay from "@/app/components/ErrorMessageDisplay";
import { Suspense } from "react";

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-neutral-200 w-full flex flex-col">
      <h1 className="text-3xl font-semibold text-black">
        Sorry, an while processing your request. Please try again.
      </h1>
      <Suspense fallback={<p>Loading error message...</p>}>
        <ErrorMessageDisplay />
      </Suspense>
    </div>
  );
}
