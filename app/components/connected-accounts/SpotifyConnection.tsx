"use client";
import { ImageProps } from "next/image";
import BaseCard from "./BaseCard";
import { useContext } from "react";
import { AuthContext } from "@/app/contexts/AuthContext";
import { StorageKeys } from "@/app/interfaces/Enums";
import { GetBaseUrl } from "@/app/utility/GetBaseUrl";
import { SPOTIFY_CLIENT_ID, loginSpotify } from "@/app/auth/SpotifyAuthFlow";
import { useRouter } from "next/navigation";

export default function SpotifyConnection({
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
      linkAccountFunction={async () => {
        // If we are logged in, start spotify authentication process
        if (authContext?.currentUser) {
          loginSpotify(SPOTIFY_CLIENT_ID, router);
        }
      }}
      unlinkAccountFunction={async () => {
        console.log("Delete spotify token function ran");
        // If we are currently logged in, send a request to delete spotify connection from account

        if (authContext?.currentUser) {
          // Delete the cached profile
          localStorage.removeItem(StorageKeys.SPOTIFY_USER_PROFILE);

          await fetch(
            `${GetBaseUrl()}api/user/spotify?uid=${
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
      profilePicURL={connectedAccountData?.profilePicURL}
      profileURL={connectedAccountData?.profileURL}
      serviceName="Spotify"
      serviceLogoImageProps={{
        src: "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg",
        width: 150,
        height: 120,
        alt: "Spotify logo",
      }}
      connectedAccountName={connectedAccountData?.email}
    ></BaseCard>
  );
}
