import { youtube_v3 } from "googleapis";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AspectRatio } from "../ui/aspect-ratio";
import PlaylistCard from "./BasePlaylistCard";
import { Platforms } from "@/app/definitions/Enums";

const NO_THUMBNAIL_URL = "https://i.ytimg.com/img/no_thumbnail.jpg";

export function YoutubePlaylistCard({
  playlist,
}: {
  playlist: youtube_v3.Schema$Playlist;
}) {
  const [
    highestQualityAvaialbleThumbnail,
    setHighestQualityAvailableThumbnail,
  ] = useState<youtube_v3.Schema$Thumbnail | undefined>();

  // Try to find the highest quality thumbnail in playlist object
  // Note: A valid thumbnail will from youtube cannot be the no_thumbnail url
  useEffect(() => {
    function getHighestQuality(): youtube_v3.Schema$Thumbnail | undefined {
      if (
        playlist.snippet?.thumbnails?.maxres?.url &&
        playlist.snippet?.thumbnails?.maxres?.url != NO_THUMBNAIL_URL
      ) {
        console.log(`${playlist.snippet.title} has max quality`);
        return playlist.snippet.thumbnails.maxres;
      }

      if (
        playlist.snippet?.thumbnails?.standard &&
        playlist.snippet?.thumbnails?.standard.url != NO_THUMBNAIL_URL
      ) {
        console.log(`${playlist.snippet.title} has 2nd best quality`);
        return playlist.snippet.thumbnails.standard;
      }

      if (
        playlist.snippet?.thumbnails?.high &&
        playlist.snippet?.thumbnails?.high.url != NO_THUMBNAIL_URL
      ) {
        console.log(
          `${playlist.snippet.title}, ${JSON.stringify(
            playlist.snippet.thumbnails
          )} has 3rd best quality`
        );
        return playlist.snippet.thumbnails.high;
      }

      if (
        playlist.snippet?.thumbnails?.medium &&
        playlist.snippet?.thumbnails?.medium.url != NO_THUMBNAIL_URL
      ) {
        console.log(`${playlist.snippet.title} has 4th best quality`);
        return playlist.snippet.thumbnails.medium;
      }

      return undefined;
    }

    setHighestQualityAvailableThumbnail(getHighestQuality());
  }, [
    playlist.snippet?.thumbnails?.default,
    playlist.snippet?.thumbnails?.high,
    playlist.snippet?.thumbnails?.maxres,
    playlist.snippet?.thumbnails?.medium,
    playlist.snippet?.thumbnails?.standard,
    playlist.snippet?.thumbnails,
    playlist.snippet?.title,
  ]);

  const openPlaylistInNewTab = () => {
    window.open(
      `https://www.youtube.com/playlist?list=${playlist.id}`,
      "_blank"
    );
  };
  return (
    <PlaylistCard
      playlist={{
        id: playlist.id!,
        platform: Platforms.YOUTUBE,
        title: playlist.snippet?.title!,
        description: playlist.snippet?.description || "",
        icon_url: highestQualityAvaialbleThumbnail?.url || undefined,
      }}
      platform_icon_url="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
    />
  );
}
