// This endpoint gets the universal song ids (isrc , etc..) from items in a spoitfy playlist

import { IdTokenIsValid } from "@/app/auth/Authorization";
import { getSpotifyToken } from "@/app/auth/SpotifyTokens";
import { SpotifyTrackExternalIDS } from "@/app/definitions/SpotifyInterfaces";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  const id_token = req.headers.get("idtoken") as string;
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  const playlistID = searchParams.get("playlistID");

  const limit = searchParams.get("limit") ? searchParams.get("limit") : 20;
  const offset = searchParams.get("offset") ? searchParams.get("offset") : 0;

  if (!uid) {
    return new NextResponse("Request needs a UID", {
      status: 400,
    });
  }

  const tokenValidity = await IdTokenIsValid(id_token, uid);

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

  const result = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistID}/tracks?fields=items%28track%28external_ids%2C+name%29%29`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    }
  );

  const response = await result.json();

  console.log("Initial: ", JSON.stringify(response));

  // try to convert tracks into `SpotifyPlaylistExternalIDS` object
  //const tracks = JSON.parse(response);

  const playlistUniversalIDS: SpotifyTrackExternalIDS[] = response.items.map(
    (data: any) => {
      const trackData = data.track as SpotifyTrackExternalIDS;
      return trackData;
    }
  );

  console.log(
    "Playlist universal ids",
    playlistUniversalIDS[0].external_ids.isrc
  );

  return new NextResponse(JSON.stringify(playlistUniversalIDS), {
    headers: {
      "Content-Type": "applcation/json",
    },
    status: 200,
  });
}
