"use client";
import BaseCard from "./BaseCard";
import { Suspense, use, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "@/app/contexts/AuthContext";
import { StorageKeys } from "@/app/interfaces/Enums";
import { GetBaseUrl } from "@/app/utility/GetBaseUrl";
import { SPOTIFY_CLIENT_ID, loginSpotify } from "@/app/auth/SpotifyAuthFlow";
import { useRouter } from "next/navigation";
import { fetchSpotifyProfile } from "@/app/fetching/FetchConnections";
import LoadingCard from "./LoadingCard";

export default function SpotifyConnection() {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  // The data of our connected spotify account
  const [connectedAccountData, setConnectedAccountData] =
    useState<ConnectedAccountData>({});

  // Whether the intial fetch has finished and we are ready to render our profile
  const [readyToRender, setReadyToRender] = useState<boolean>(false);

  // Fetches the user profile
  const initialProfile = use(
    fetchSpotifyProfile(authContext!).then((spotifyProfile) => {
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
      setConnectedAccountData(initialProfile);
    }

    // Add event listener
    const unsubscribe = authContext?.onAuthStateChanged(async (newstate) => {
      // Do not fetch data if user is not authed
      if (!authContext?.currentUser) return;

      // Fetch connected account data
      fetchSpotifyProfile(authContext).then((spotifyProfile) => {
        setConnectedAccountData({
          email: spotifyProfile?.email,
          profilePicURL: spotifyProfile?.images.pop()?.url,
          profileURL: spotifyProfile?.external_urls.spotify,
        });
      });
    });

    // As effects only run when mounted, and we can only mount once our data fetching (in use() ) finishes, we are ready to render
    setReadyToRender(true);

    // Remove event listener
    return unsubscribe;

  }, [authContext]);

  // TODO: currently we are rendering the loadingcard in the page.tsx of connected accounts and in here
  // TODO: Refactor code to only render this loading card in one place (this may require refactoring of the base component implementation)
  if (!readyToRender) {
    return <LoadingCard />;
  }

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
