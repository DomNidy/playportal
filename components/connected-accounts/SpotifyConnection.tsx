"use client";
import BaseCard from "./BaseCard";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/lib/contexts/AuthContext";
import { StorageKeys } from "@/definitions/Enums";
import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";
import { SPOTIFY_CLIENT_ID, loginSpotify } from "@/lib/auth/SpotifyAuthFlow";
import { useRouter } from "next/navigation";
import { fetchSpotifyProfile } from "@/lib/fetching/FetchConnections";
import LoadingCard from "./LoadingCard";

export default function SpotifyConnection() {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  // The data of our connected spotify account
  const [connectedAccountData, setConnectedAccountData] =
    useState<ConnectedAccountData>({});

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Add event listener
    const unsubscribe = authContext?.onAuthStateChanged(async (newstate) => {
      // Do not fetch data if user is not authed
      if (!authContext?.currentUser) return;

      // Fetch connected account data
      fetchSpotifyProfile(authContext).then((spotifyProfile) => {
        // If we fetched a spotify profile, update the state
        if (spotifyProfile) {
          setConnectedAccountData({
            email: spotifyProfile?.email,
            profilePicURL: spotifyProfile?.images.pop()?.url,
            profileURL: spotifyProfile?.external_urls.spotify,
          });
        }
        setLoading(false);
      });
    });

    // As effects only run when mounted, and we can only mount once our data fetching (in use() ) finishes, we are ready to render

    // Remove event listener
    return unsubscribe;
  }, [authContext]);

  if (loading) return <LoadingCard />;

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
        width: 120,
        height: 120,
        alt: "Spotify logo",
      }}
      connectedAccountName={connectedAccountData?.email}
    ></BaseCard>
  );
}
