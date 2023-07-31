"use client";
import youtubeIcon from "@/public/youtube-icon.svg";
import BaseCard from "./BaseCard";
import { GetBaseUrl } from "@/app/utility/GetBaseUrl";
import { useContext, useState } from "react";
import { AuthContext } from "@/app/contexts/AuthContext";
import { StorageKeys } from "@/app/interfaces/Enums";

export default function YoutubeConnection({
  connectedAccountData,
}: {
  connectedAccountData?: {
    email?: string;
    profilePicURL?: string;
    profileURL?: string;
  };
}) {
  const authContext = useContext(AuthContext);

  return (
    <BaseCard
      unlinkAccountFunction={async () => {
        console.log("Function ran");
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
                idToken: await authContext.currentUser.getIdToken(),
              },
            }
          );
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
