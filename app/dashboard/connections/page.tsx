"use client";
import { requestYoutubeAuthorizationURL } from "@/app/auth/GoogleAuthFlow";
import SoundcloudConnection from "@/app/components/connected-accounts/SoundcloudConnection";
import SpotifyConnection from "@/app/components/connected-accounts/SpotifyConnection";
import YoutubeConnection from "@/app/components/connected-accounts/YoutubeConnection";
import { AuthContext } from "@/app/contexts/AuthContext";
import { GetBaseUrl } from "@/app/utility/GetBaseUrl";
import { youtube_v3 } from "googleapis";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();

  const auth = useContext(AuthContext);
  const [idtoken, setIdToken] = useState(undefined);
  const [spotifyAccountConnection, setSpotifyAccountConnection] = useState<
    undefined | string
  >();
  const [youtubeAccountConnection, setYoutubeAccountConnection] = useState<
    undefined | string
  >();

  // On page load, try to fetch the users accounts
  useEffect(() => {
    if (auth?.currentUser) {
      console.log("Fetching youtube");

      auth.currentUser.getIdToken().then((idtoken) => {
        fetch(`${GetBaseUrl()}api/user/youtube?uid=${auth.currentUser?.uid}`, {
          method: "POST",
          headers: {
            idtoken: idtoken,
          },
        }).then(async (res) => {
          const channelList = (await res.json())
            .data as youtube_v3.Schema$ChannelListResponse;
          const channelName = channelList.items?.at(0)?.snippet?.title;

          setYoutubeAccountConnection(channelName || undefined);
        });
      });
    }
  }, [auth?.currentUser]);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="pl-1 h-16 w-full bg-neutral-200 dark:bg-dm-800  text-4xl text-gray-200 font-semibold flex items-center pointer-events-none">
        Connections
      </div>
      <div
        className="grid grid-cols-1 p-4 gap-y-5 
                      md:grid-cols-2 lg:p-12 lg:gap-y-6 lg:gap-x-0
                      xl:grid-cols-3 xl:p-12 xl:gap-y-6 xl:gap-x-1
                      2xl:grid-cols-4 2xl:p-12 2xl:gap-y-6 2xl:gap-x-1 justify-items-center"
      >
        <button
          className="bg-black p-2 rounded-md"
          onClick={async () => {
            const youtubeAuthorizationURL =
              await requestYoutubeAuthorizationURL();

            if (youtubeAuthorizationURL) {
              router.push(youtubeAuthorizationURL);
            } else {
              alert(
                "Could not get youtube authorization URL, please try again."
              );
            }
          }}
        >
          Request youtube perms
        </button>
        <SpotifyConnection connectedAccountData={undefined} />
        <YoutubeConnection
          connectedAccountData={{ email: youtubeAccountConnection }}
        />
        <SoundcloudConnection connectedAccountData={undefined} />
      </div>
    </div>
  );
}
