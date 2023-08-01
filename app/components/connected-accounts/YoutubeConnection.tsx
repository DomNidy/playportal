"use client";
import youtubeIcon from "@/public/youtube-icon.svg";
import BaseCard from "./BaseCard";
import { GetBaseUrl } from "@/app/utility/GetBaseUrl";
import { use, useContext, useEffect, useState } from "react";
import { AuthContext } from "@/app/contexts/AuthContext";
import { StorageKeys } from "@/app/interfaces/Enums";
import { requestYoutubeAuthorizationURL } from "@/app/auth/GoogleAuthFlow";
import { useRouter } from "next/navigation";
import {
  fetchSpotifyProfile,
  fetchYoutubeProfile,
} from "@/app/fetching/FetchConnections";
import LoadingCard from "./LoadingCard";

export default function YoutubeConnection() {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  // The data of our connected spotify account
  const [connectedAccountData, setConnectedAccountData] =
    useState<ConnectedAccountData>({});

  // Whether the intial fetch has finished and we are ready to render our profile
  const [readyToRender, setReadyToRender] = useState<boolean>(false);

  // Fetches the user profile
  const initialProfile = use(
    fetchYoutubeProfile(authContext!).then((spotifyProfile) => {
      // If we were able to fetch a profile successfully, return the profile
      if (spotifyProfile) {
        return spotifyProfile;
      }
      // * If profile fetch result was undefined, we should return FALSE
      return false;
    })
  );

  useEffect(() => {
    if (initialProfile !== false) {
      setConnectedAccountData({
        email: initialProfile?.snippet?.title || undefined,
        profilePicURL:
          initialProfile?.snippet?.thumbnails?.high?.url || undefined,
        profileURL: `https://www.youtube.com/channel/${initialProfile?.id}`,
      });
    }

    // Add event listener
    const unsubscribe = authContext?.onAuthStateChanged(async (newstate) => {
      // Do not fetch data if user is not authed
      if (!authContext?.currentUser) return;

      // Fetch connected account data
      fetchYoutubeProfile(authContext).then((youtubeProfile) => {
        setConnectedAccountData({
          email: youtubeProfile?.snippet?.title || undefined,
          profilePicURL:
            youtubeProfile?.snippet?.thumbnails?.high?.url || undefined,
          profileURL: `https://www.youtube.com/channel/${youtubeProfile?.id}`,
        });
      });
    });

    // As effects only run when mounted, and we can only mount once our data fetching (in use() ) finishes, we are ready to render
    setReadyToRender(true);

    // Remove event listener
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext]);

  // TODO: currently we are rendering the loadingcard in the page.tsx of connected accounts and in here
  // TODO: Refactor code to only render this loading card in one place (this may require refactoring of the base component implementation)
  if (!readyToRender) {
    return <LoadingCard />;
  }

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
