import ErrorMessageDisplay from "@/app/components/dashboard/ErrorMessageDisplay";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error",
};

export default function ErrorPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-neutral-200">
      <h1 className="text-3xl font-semibold">
        Sorry, an while processing your request. Please try again.
      </h1>
      <ErrorMessageDisplay />
    </div>
  );
}
