import ErrorMessageDisplay from "@/app/components/ErrorMessageDisplay";
import { Suspense } from "react";

export default function ErrorPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-neutral-200">
      <h1 className="text-3xl font-semibold">
        Sorry, an while processing your request. Please try again.
      </h1>
      <Suspense fallback={<p>Loading error message...</p>}>
        <ErrorMessageDisplay />
      </Suspense>
    </div>
  );
}
