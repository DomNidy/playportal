import { useState } from "react";
import { AspectRatio } from "../ui/aspect-ratio";
import Image from "next/image";
import { Platforms } from "@/definitions/Enums";
import ModifyPlaylistDialog from "./ModifyPlaylistDialog";

type PlaylistCardProps = {
  platform: Platforms;
  playlist_url: string;
  title: string;
  description?: string;
  icon_url?: string;
  id: string;
};

export default function PlaylistCard({
  platform_icon_url,
  playlist,
}: {
  platform_icon_url?: string;
  playlist: PlaylistCardProps;
}) {
  // We update this state on the client side after we receieve a response from the server that the modification was successful
  const [titleState, setTitleState] = useState<string>(playlist.title);
  return (
    <div className="hover:drop-shadow-[0_2.2px_5.12px_rgba(0,0,0,0.9)]  dark:hover:drop-shadow-[0_1.5px_3.1px_rgba(155,155,155,0.45)] transition-all ">
      <AspectRatio ratio={1 / 1}>
        {playlist.icon_url ? (
          <Image
            src={playlist.icon_url}
            width={1000}
            height={1000}
            className="z-0  relative h-full w-full object-cover"
            alt="Playlist image"
          />
        ) : (
          <div className="bg-gradient-to-b from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800 w-full h-full z-0 relative" />
        )}

        <div className="absolute top-0  w-full justify-evenly h-full ">
          <h1
            className="z-10 text-3xl  truncate sm:text-2xl xl:text-3xl 2xl:text-4xl text font-bold px-10 p-4  
            w-full h-fit bottom-12 drop-shadow-[0_2.31px_1.15px_rgba(0,0,0,1)] pointer-events-none text-gray-100 tracking-tight "
          >
            {titleState}
          </h1>

          {platform_icon_url ? (
            <Image
              onClick={() => window.open(playlist.playlist_url)}
              className="absolute -top-2 -left-2 hover:saturate-200 cursor-pointer transition"
              src={platform_icon_url}
              width={44}
              height={44}
              alt={`${playlist.platform} playlist`}
            />
          ) : (
            <div className="w-[44px] h-[44px] flex items-center justify-center">
              <h2>?</h2>
            </div>
          )}
        </div>

        <div className="absolute bottom-0">
          <ModifyPlaylistDialog
            playlist={{
              playlistID: playlist.id,
              playlistPlatform: playlist.platform,
              playlistTitle: titleState,
              playlistDescription: playlist.description,
              updateCardTitleState: setTitleState,
            }}
          />
        </div>
      </AspectRatio>
    </div>
  );
}
