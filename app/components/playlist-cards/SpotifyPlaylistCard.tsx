import { SpotifySimplifiedPlaylistObject } from "../../definitions/SpotifyInterfaces";
import Image from "next/image";
import {
  FormEvent,
  Suspense,
  SyntheticEvent,
  useContext,
  useRef,
  useState,
} from "react";

import ModifySpotifyPlaylistPopover from "./ModifyPlaylistDialog";
import { AspectRatio } from "../ui/aspect-ratio";
import { Platforms } from "@/app/definitions/Enums";
import PlaylistCard from "./BasePlaylistCard";

export function SpotifyPlaylistCard({
  playlist,
}: {
  playlist: SpotifySimplifiedPlaylistObject;
}) {
  const openPlaylistInNewTab = () => {
    window.open(playlist.external_urls.spotify, "_blank");
  };

  return (
    <PlaylistCard
      playlist={{
        playlist_url: playlist.external_urls.spotify,
        id: playlist.id,
        platform: Platforms.SPOTIFY,
        title: playlist.name,
        description: playlist.description!,
        icon_url: playlist.images[0].url,
      }}
      platform_icon_url="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
    />
  );
}
