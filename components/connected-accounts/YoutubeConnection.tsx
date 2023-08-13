"use client";
import youtubeIcon from "@/public/youtube-icon.svg";
import BaseCard from "./BaseCard";
import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/lib/contexts/AuthContext";
import { StorageKeys } from "@/definitions/Enums";
import { requestYoutubeAuthorizationURL } from "@/lib/auth/GoogleAuthFlow";
import { useRouter } from "next/navigation";
import { fetchYoutubeProfile } from "@/lib/fetching/FetchConnections";
import LoadingCard from "./LoadingCard";

export default function YoutubeConnection() {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  // The data of our connected youtube account
  const [connectedAccountData, setConnectedAccountData] =
    useState<ConnectedAccountData>({});

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Add event listener
    const unsubscribe = authContext?.onAuthStateChanged(async (newstate) => {
      // Do not fetch data if user is not authed
      if (!authContext?.currentUser) return;

      // Fetch connected account data
      fetchYoutubeProfile(authContext).then((youtubeProfile) => {
        // If we fetched a profile, update the state
        if (youtubeProfile) {
          setConnectedAccountData({
            email: youtubeProfile?.snippet?.title || undefined,
            profilePicURL:
              youtubeProfile?.snippet?.thumbnails?.high?.url || undefined,
            profileURL: `https://www.youtube.com/channel/${youtubeProfile?.id}`,
          });
        }
        setLoading(false);
      });
    });

    // Remove event listener
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext]);

  if (loading) return <LoadingCard />;

  return (
    <BaseCard
      unlinkAccountFunction={async () => {
        // If we are currently logged in, send a request to delete youtube connection from account
        if (authContext?.currentUser) {
          // Delete the cached profile
          localStorage.removeItem(StorageKeys.YOUTUBE_USER_PROFILE);

          await fetch(
            `${GetBaseUrl()}api/user/youtube?uid=${
              authContext.currentUser.uid
            }`,
            {
              method: "DELETE",
              headers: {
                idtoken: await authContext.currentUser.getIdToken(),
              },
            }
          );
        }
      }}
      linkAccountFunction={async () => {
        const youtubeAuthorizationURL = await requestYoutubeAuthorizationURL();

        if (youtubeAuthorizationURL) {
          router.push(youtubeAuthorizationURL);
        } else {
          alert("Could not get youtube authorization URL, please try again.");
        }
      }}
      profilePicURL={connectedAccountData?.profilePicURL}
      profileURL={connectedAccountData?.profileURL}
      serviceName="YouTube"
      serviceLogoImageProps={{
        src: youtubeIcon,
        width: 170,
        height: 160,
        alt: "Youtube logo",
      }}
      connectedAccountName={connectedAccountData?.email}
    ></BaseCard>
  );
}
