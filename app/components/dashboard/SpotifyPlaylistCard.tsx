import { SimplifiedPlaylistObject } from "../../interfaces/SpotifyInterfaces";
import Image from "next/image";
import {
  FormEvent,
  Suspense,
  SyntheticEvent,
  useContext,
  useRef,
  useState,
} from "react";

import ModifySpotifyPlaylistPopover from "./ModifySpotifyPlaylistPopover";
import { AspectRatio } from "../ui/aspect-ratio";

export function SpotifyPlaylistCard({
  playlist,
}: {
  playlist: SimplifiedPlaylistObject;
}) {
  const [cardTitleState, setCardTitleState] = useState<string>(playlist.name);

  const openPlaylistInNewTab = () => {
    window.open(playlist.external_urls.spotify, "_blank");
  };

  console.log(playlist.images[0].url);

  return (
    <div className="hover:drop-shadow-[0_2.2px_5.12px_rgba(0,0,0,0.9)] dark:hover:drop-shadow-[0_1.5px_3.1px_rgba(155,155,155,0.45)] transition-all">
      <AspectRatio ratio={1 / 1}>
        <Image
          src={`${playlist.images[0].url}`}
          width={640}
          height={640}
          className="z-0  relative"
          alt="Playlist image"
        />{" "}
        <div className="absolute top-0  w-full justify-evenly h-full ">
          <h1
            className="z-10 text-3xl xl:text-4xl 2xl:text-5xl text font-bold px-10 p-4 
                       w-full h-fit bottom-12 drop-shadow-[0_2.2px_1.5px_rgba(0,0,0,0.9)] pointer-events-none text-gray-100 tracking-tight"
          >
            {cardTitleState}
          </h1>

          <Image
            className="absolute -top-2 -left-2"
            src={
              "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
            }
            width={44}
            height={44}
            alt={"Spotify Playlist"}
          />
        </div>
        <div className="absolute bottom-0">
          <ModifySpotifyPlaylistPopover
            updateCardTitleState={setCardTitleState}
            playlistDescription={playlist.description}
            playlistID={playlist.id}
            playlistTitle={playlist.name}
          />
        </div>
      </AspectRatio>
    </div>
  );
}
