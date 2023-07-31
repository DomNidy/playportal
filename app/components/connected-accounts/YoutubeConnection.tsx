"use client";
import youtubeIcon from "@/public/youtube-icon.svg";
import BaseCard from "./BaseCard";
import { GetBaseUrl } from "@/app/utility/GetBaseUrl";
import { useContext, useState } from "react";
import { AuthContext } from "@/app/contexts/AuthContext";
import { StorageKeys } from "@/app/interfaces/Enums";
import { requestYoutubeAuthorizationURL } from "@/app/auth/GoogleAuthFlow";
import { useRouter } from "next/navigation";

export default function YoutubeConnection({
  connectedAccountData,
}: {
  connectedAccountData?: {
    email?: string;
    profilePicURL?: string;
    profileURL?: string;
  };
}) {
  const router = useRouter();
  const authContext = useContext(AuthContext);

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
