"use client";
import LoadingCard from "@/app/components/connected-accounts/LoadingCard";
import SoundcloudConnection from "@/app/components/connected-accounts/SoundcloudConnection";
import SpotifyConnection from "@/app/components/connected-accounts/SpotifyConnection";
import YoutubeConnection from "@/app/components/connected-accounts/YoutubeConnection";
import { LocalYoutubeChannel } from "@/app/interfaces/YoutubeInterfaces";
import { Suspense, useState } from "react";

export default function Page() {
  const [youtubeAccountConnection, setYoutubeAccountConnection] = useState<
    undefined | LocalYoutubeChannel
  >();

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="pl-1 h-16 w-full bg-primary-foreground  text-4xl  font-semibold flex items-center pointer-events-none">
        Connections
      </div>
      <div
        className="flex flex-col items-center p-4 gap-y-5 
                      lg:p-12 lg:gap-y-6 lg:gap-x-0
                      xl:p-12 xl:gap-y-6 xl:gap-x-1
                      2xl:p-12 2xl:gap-y-6 2xl:gap-x-1"
      >
        {/* TODO: REFACTOR THESE CONNECTION COMPONENTS TO FETCH DATA INTERNALLY, THIS WILL ALLOW ME TO USE SUSPENSE BOUNDARIES */}
        <Suspense fallback={<LoadingCard />}>
          <SpotifyConnection />
        </Suspense>
        <Suspense fallback={<LoadingCard />}>
          <YoutubeConnection />
        </Suspense>

        <SoundcloudConnection connectedAccountData={undefined} />
      </div>
    </div>
  );
}
