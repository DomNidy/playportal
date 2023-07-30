"use client";
import youtubeIcon from "@/public/youtube-icon.svg";
import BaseCard from "./BaseCard";

export default function YoutubeConnection({
  connectedAccountData,
}: {
  connectedAccountData?: {
    email?: string;
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
      isConnected={!!connectedAccountData?.email}
      connectedAccountName={connectedAccountData?.email}
    ></BaseCard>
  );
}
