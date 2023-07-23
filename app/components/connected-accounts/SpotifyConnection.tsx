"use client";
import { ImageProps } from "next/image";
import BaseCard from "./BaseCard";

export default function SpotifyConnection({
  connectedAccountData,
}: {
  connectedAccountData?: {
    email?: string;
    profilePicImageProps?: ImageProps;
  };
}) {
  return (
    <BaseCard
      serviceName="Spotify"
      serviceLogoImageProps={{
        src: "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg",
        width: 150,
        height: 120,
        alt: "Spotify logo",
      }}
      isConnected={!!connectedAccountData}
      connectedAccountName={connectedAccountData?.email}
    ></BaseCard>
  );
}
