"use client";
import Image from "next/image";
import { CLIENT_ID, loginSpotify } from "../auth/SpotifyAuthFlow";
import { SpotifyUserProfile } from "../interfaces/SpotifyInterfaces";

export default function SignedInWithSpotifyCard({
  spotifyUserProfile,
}: {
  spotifyUserProfile: SpotifyUserProfile | false;
}) {
  return (
    <div
      className="flex bg-neutral-900 rounded-3xl p-2 items-center gap-2 w-fit text-neutral-300 cursor-pointer hover:bg-neutral-950  transition-all duration-75 drop-shadow-lg"
      onClick={() => {
        loginSpotify(CLIENT_ID!);
      }}
    >
      <Image
        src={
          "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
        }
        alt={"Spotify icon"}
        width={48}
        height={48}
      />
      <h2 className="font-bold pointer-events-none">
        {spotifyUserProfile ? `${spotifyUserProfile.display_name}` : `Sign In`}
      </h2>
    </div>
  );
}
