"use client";
import youtubeIcon from "@/public/youtube-icon.svg";
import BaseCard from "./BaseCard";

export default function YoutubeConnection({
  connectedAccountData,
}: {
  connectedAccountData?: {
    email?: string;
    profilePicURL?: string;
    profileURL?: string;
  };
}) {
  return (
    <BaseCard
      profilePicURL={connectedAccountData?.profilePicURL}
      profileURL={connectedAccountData?.profileURL}
      serviceName="YouTube"
      serviceLogoImageProps={{
        src: youtubeIcon,
        width: 170,
        height: 160,
        alt: "Youtube logo",
      }}
      isConnected={!!connectedAccountData?.email}
      connectedAccountName={connectedAccountData?.email}
    ></BaseCard>
  );
}
