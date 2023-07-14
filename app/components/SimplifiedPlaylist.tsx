import { SimplifiedPlaylistObject } from "../interfaces/SpotifyInterfaces";
import Image from "next/image";

export function SimplifiedPlaylist({
  playlist,
  key,
}: {
  playlist: SimplifiedPlaylistObject;
  key: number;
}) {
  return (
    <div className="flex flex-col   bg-neutral-600 p-2 rounded-lg">
      <Image
        src={`${playlist.images[0].url}`}
        width={playlist.images[0].width}
        height={playlist.images[0].height}
        alt="Playlist image"
      />
      <p>Name: {playlist.name}</p>
      <p>Desc: {playlist.description}</p>
    </div>
  );
}
