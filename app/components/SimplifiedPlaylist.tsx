import { SimplifiedPlaylistObject } from "../interfaces/SpotifyInterfaces";
import Image from "next/image";

export function SimplifiedPlaylist({
  playlist,
  key,
}: {
  playlist: SimplifiedPlaylistObject;
  key: number;
}) {
  const openPlaylistInNewTab = () => {
    window.open(playlist.external_urls.spotify, "_blank");
  };

  return (
    <a
      href={playlist.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col bg-neutral-600 p-2  items-center justify-center rounded-lg hover:cursor-pointer"
      style={{
        position: "relative",
        paddingTop: "100%",
      }}
      onClick={openPlaylistInNewTab}
    >
      <div
        className="absolute top-0 left-0 w-full h-full z-10 hover:opacity-0 duration-75"
        style={{
          backgroundColor: "rgba(37, 53, 205)",
          background:
            "linear-gradient(355deg, rgba(61,72,177,0.45) 0%, rgba(33,53,57,0.25) 100%)",
          filter:
            "progid:DXImageTransform.Microsoft.gradient(startColorstr='#2535cd',endColorstr='#5a0880',GradientType=1)",
        }}
      />
      <Image
        src={`${playlist.images[0].url}`}
        width={640}
        height={640}
        className="z-0"
        alt="Playlist image"
        style={{
          position: "absolute",
          padding: 0,
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <h1 className="z-10 text-4xl text  font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.9)] pointer-events-none">
        {playlist.name}
      </h1>
      <h1>Desc: {playlist.description}</h1>
    </a>
  );
}
