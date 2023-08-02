import { youtube_v3 } from "googleapis";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AspectRatio } from "../ui/aspect-ratio";

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
    <div className="hover:drop-shadow-[0_2.2px_5.12px_rgba(0,0,0,0.9)] dark:hover:drop-shadow-[0_1.5px_3.1px_rgba(155,155,155,0.45)] transition-all">
      <AspectRatio ratio={1 / 1}>
        {highestQualityAvaialbleThumbnail?.url ? (
          <Image
            src={highestQualityAvaialbleThumbnail.url}
            width={1000}
            height={1000}
            className="z-0  relative h-full w-full object-cover"
            alt="Playlist image"
          />
        ) : (
          <div className="bg-gradient-to-b from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800 w-full h-full z-0 relative" />
        )}

        <div className="absolute top-0  w-full justify-evenly h-full ">
          <h1 className="z-10 text-3xl xl:text-4xl 2xl:text-5xl text font-bold px-10 p-4  
                       w-full h-fit bottom-12 drop-shadow-[0_2.31px_1.15px_rgba(0,0,0,1)] pointer-events-none text-gray-100 tracking-tight">
            {playlist.snippet?.title}
          </h1>
          <Image
            className="absolute -top-2 -left-2"
            src={
              "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
            }
            width={44}
            height={44}
            alt={"Youtube Playlist"}
          />
        </div>
      </AspectRatio>
    </div>
  );
}
