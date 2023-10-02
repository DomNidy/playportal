import { Platforms } from "@/definitions/Enums";
import { TransferLog } from "@/definitions/MigrationService";
import { SpotifyAccessToken } from "@/definitions/SpotifyInterfaces";
import { YoutubeAccessToken } from "@/definitions/YoutubeInterfaces";
import { IdTokenIsValid } from "@/lib/auth/Authorization";
import { getSpotifyToken } from "@/lib/auth/SpotifyTokens";
import { getYoutubeToken } from "@/lib/auth/YoutubeTokens";
import {
  getExternalTracksFromSpotifyTrackIDS,
  getExternalTracksFromYoutubeTracks,
} from "@/lib/fetching/CreateExternalTracks";
import { NextRequest, NextResponse } from "next/server";

// Get metadata when provided with a realtime track log object in the body
export async function POST(req: NextRequest, res: NextResponse) {
  const id_token = req.headers.get("id_token");
  const uid = req.headers.get("uid");
  // The request body should be an object with a platform and platform id
  const payload: {
    platform: Platforms;
    platformIDS: string[];
    operationID: string;
  } = await req.json();

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

  console.log(payload.platform == Platforms.YOUTUBE, "yt");

  switch (payload.platform) {
    case Platforms.SPOTIFY:
      // Platform ids from spotify use the spotify uri, here we are removing the prefix for spotify uris so we simply have the id
      const parsedPlatformIDS = payload.platformIDS.map((platformID) =>
        platformID.replace("spotify:track:", "")
      );

      const spotifyToken = await getSpotifyToken(uid);

      // If we could not retreive a token, return
      if (!spotifyToken) {
        return new NextResponse(
          JSON.stringify({
            error:
              "UID Was invalid or your UID does not have an assosciated spotify account connected.",
          }),
          { headers: { "Content-Type": "application/json" }, status: 404 }
        );
      }
      const externalTrackMetadataFromSpotifyIDS =
        await getExternalTracksFromSpotifyTrackIDS(
          parsedPlatformIDS,
          spotifyToken as SpotifyAccessToken
        );

      // If we were able to create external track objects
      // update the metadata in firestore
      if (!externalTrackMetadataFromSpotifyIDS) {
        return new NextResponse("Could not fetch external track data", {
          status: 400,
        });
      }

      return NextResponse.json({ ...externalTrackMetadataFromSpotifyIDS });
    case Platforms.YOUTUBE:
      // Fetch metadata of youtube videos from an array of video ids
      const youtubeToken = await getYoutubeToken(uid, false);

      if (!youtubeToken) {
        return NextResponse.json(
          JSON.stringify("Could not retreive youtube access token"),
          { status: 400 }
        );
      }

      const externalTrackMetadataFromYoutubeIDS =
        await getExternalTracksFromYoutubeTracks(
          payload.platformIDS,
          youtubeToken as YoutubeAccessToken,
          payload.operationID
        );

      return NextResponse.json(JSON.stringify("Success"), {
        status: 200,
      });

    default:
      return new NextResponse(
        JSON.stringify("Invalid platform provided in request payload"),
        {
          status: 400,
        }
      );
  }
}
