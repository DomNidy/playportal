import SpotifyConnection from "@/components/connected-accounts/SpotifyConnection";
import YoutubeConnection from "@/components/connected-accounts/YoutubeConnection";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Connections",
  description: "Connect your streaming accounts.",
};

export default function Page() {
  return (
    <div className="min-h-screen w-full flex flex-col  bg-background">
      <DashboardPageHeader headerText="Connections" />
      <div
        className="flex flex-col items-center p-4 gap-y-5 
                      lg:p-12 lg:gap-y-6 lg:gap-x-0
                      xl:p-12 xl:gap-y-6 xl:gap-x-1
                      2xl:p-12 2xl:gap-y-6 2xl:gap-x-1"
      >
        {/* TODO: REFACTOR THESE CONNECTION COMPONENTS TO FETCH DATA INTERNALLY, THIS WILL ALLOW ME TO USE SUSPENSE BOUNDARIES */}
        <Suspense>
          <SpotifyConnection />
        </Suspense>

        <Suspense>
          <YoutubeConnection />
        </Suspense>

        {/* Soundcloud not implemented yet }
        <SoundcloudConnection connectedAccountData={undefined} />
  */}
      </div>
    </div>
  );
}
