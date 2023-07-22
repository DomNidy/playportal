"use client";
import { ImageProps } from "next/image";
import BaseCard from "./BaseCard";
import soundcloudIcon from "@/public/soundcloud-icon.svg";

export default function SoundcloudConnection({
  connectedAccountData,
}: {
  connectedAccountData?: {
    email?: string;
    profilePicImageProps?: ImageProps;
  };
}) {
  return (
    <BaseCard
      serviceName="Soundcloud"
      serviceLogoImageProps={{
        src: soundcloudIcon,
        width: 150,
        height: 120,
        alt: "Soundcloud logo",
      }}
      isConnected={!!connectedAccountData}
      connectedAccountName={connectedAccountData?.email}
    ></BaseCard>
  );
}
