import { youtube_v3 } from "googleapis";
import Image from "next/image";

export function YoutubePlaylistCard({
  playlist,
}: {
  playlist: youtube_v3.Schema$Playlist;
}) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col bg-neutral-600 p-2 items-center justify-center rounded-lg hover:cursor-pointer w-60 sm:w-auto sm:h-auto"
      style={{
        position: "relative",
        paddingTop: "100%",
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-full z-10 opacity-0 hover:opacity-100 duration-75"
        style={{
          backgroundColor: "rgba(37, 53, 205)",
          background:
            "linear-gradient(355deg, rgba(61,72,177,0.45) 0%, rgba(33,53,57,0.25) 100%)",
          filter:
            "progid:DXImageTransform.Microsoft.gradient(startColorstr='#2535cd',endColorstr='#5a0880',GradientType=1)",
        }}
      />
      <Image
        src={`https://i.ytimg.com/img/no_thumbnail.jpg`}
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
      <Image
        className="z-10 absolute -top-3 -left-3"
        src={
          "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
        }
        width={44}
        height={44}
        alt={"Youtube Playlist"}
      />
      <h1 className="z-10 text-4xl text  font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.9)] pointer-events-none text-gray-100">
        {playlist.snippet?.title}
      </h1>
    </a>
  );
}
