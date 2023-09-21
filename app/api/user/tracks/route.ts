import { Platforms } from "@/definitions/Enums";
import { SpotifyAccessToken } from "@/definitions/SpotifyInterfaces";
import { IdTokenIsValid } from "@/lib/auth/Authorization";
import { getSpotifyToken } from "@/lib/auth/SpotifyTokens";
import { getExternalTrackFromSpotifyTrack } from "@/lib/fetching/CreateExternalTracks";
import { NextRequest, NextResponse } from "next/server";

// Get metadata when provided with a realtime track log object in the body
export async function POST(req: NextRequest, res: NextResponse) {
  const id_token = req.headers.get("id_token");
  const uid = req.headers.get("uid");
  // The request body should be an object with a platform and platform id
  const payload: { platform: Platforms; platformID: string } = await req.json();

  if (!uid) {
    return new NextResponse("Request needs a UID", {
      status: 400,
    });
  }

  if (!id_token) {
    return new NextResponse("Request needs an id token", {
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
          "UID Was invalid or your UID does not have an assosciated spotify account connected.",
      }),
      { headers: { "Content-Type": "application/json" }, status: 404 }
    );
  }

  if (payload.platform === Platforms.SPOTIFY) {
    // Platform ids from spotify use the spotify uri, here we are removing the prefix for spotify uris so we simply have the id
    const parsedPlatformID = payload.platformID.replace("spotify:track:", "");
    const externalTrack = await getExternalTrackFromSpotifyTrack(
      parsedPlatformID,
      token as SpotifyAccessToken
    );

    console.log(externalTrack, "External");
    return NextResponse.json({ ...externalTrack });
  }
}
