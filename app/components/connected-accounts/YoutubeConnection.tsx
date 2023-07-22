"use client";
import { ImageProps } from "next/image";
import youtubeIcon from "@/public/youtube-icon.svg";
import BaseCard from "./BaseCard";

export default function YoutubeConnection({
  connectedAccountData,
}: {
  connectedAccountData?: {
    email?: string;
    profilePicImageProps?: ImageProps;
  };
}) {
  return (
    <BaseCard
      serviceName="YouTube"
      serviceLogoImageProps={{
        src: youtubeIcon,
        width: 150,
        height: 120,
        alt: "Youtube logo",
      }}
      isConnected={!!connectedAccountData}
      connectedAccountName={connectedAccountData?.email}
    ></BaseCard>
  );
}
