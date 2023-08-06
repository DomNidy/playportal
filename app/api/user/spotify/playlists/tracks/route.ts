// This endpoint gets the universal song ids (isrc , etc..) from items in a spoitfy playlist

import { IdTokenIsValid } from "@/app/auth/Authorization";
import { getSpotifyToken } from "@/app/auth/SpotifyTokens";
import { ExternalTrack } from "@/app/definitions/MigrationService";
import { getExternalTracksFromSpotifyPlaylist } from "@/app/fetching/FetchPlaylists";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  const idToken = req.headers.get("idtoken") as string;
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  const playlistID = searchParams.get("playlistID");

  if (!uid) {
    return new NextResponse("Request needs a UID", {
      status: 400,
    });
  }

  if (!playlistID) {
    return new NextResponse("Request needs a playlist UID", {
      status: 400,
    });
  }

  const tokenValidity = await IdTokenIsValid(idToken, uid);

  if (tokenValidity !== true) {
    return new NextResponse(
      JSON.stringify({
        error:
          tokenValidity === false
            ? "An error occured, please try again or log in again."
            : tokenValidity.errorMessage,
      }),
      {
        status: 400,
      }
    );
  }

  const token = await getSpotifyToken(uid);

  // If we could not retreive a token, return
  if (!token) {
    return new NextResponse(
      JSON.stringify({
        error:
          "Please authenticate your spotify account, your UID does not have a spotify access token!",
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  console.log(playlistID, uid);

  const playlistExternalTracks = getExternalTracksFromSpotifyPlaylist(
    playlistID,
    token
  );

  // TODO: Figure out way to fetch all items of playlist, limit for max amount at once seems to be 100 (but its listed at 50 on spotify api)
  // TODO: We would need to get the length of the playlist then send multiple requests using the offset

  // TODO: https://developer.spotify.com/documentation/web-api/reference/get-playlists-tracks
  return new NextResponse(JSON.stringify(playlistExternalTracks), {
    headers: {
      "Content-Type": "applcation/json",
    },
    status: 200,
  });
}
