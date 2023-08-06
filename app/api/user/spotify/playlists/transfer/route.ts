import { IdTokenIsValid } from "@/app/auth/Authorization";
import { getSpotifyToken } from "@/app/auth/SpotifyTokens";
import { Platforms } from "@/app/definitions/Enums";

import {
  ExternalTrack,
  MigrationsPlaylistTransferRequestBody,
} from "@/app/definitions/MigrationService";
import { getExternalTracksFromSpotifyPlaylist } from "@/app/fetching/FetchPlaylists";
import { auth } from "firebase-admin";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

type PlaylistTransferRequestBody = {
  uid: string;
  playlistID: string;
  destinationPlatform: string;
};

export async function POST(req: NextRequest, res: NextResponse) {
  // Read id token from headers
  const idToken = req.headers.get("idtoken") as string;
  // Read body of the request
  const payload: PlaylistTransferRequestBody = await req.json();

  // Authorize request

  if (!payload.uid) {
    return new NextResponse("Request needs a UID", {
      status: 400,
    });
  }

  if (!payload.playlistID) {
    return new NextResponse("Request needs a playlist UID", {
      status: 400,
    });
  }

  const tokenValidity = await IdTokenIsValid(idToken, payload.uid);

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

  // Get spotify access token
  const token = await getSpotifyToken(payload.uid);

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

  // Create external tracks
  const playlistExternalTracks: ExternalTrack[] =
    await getExternalTracksFromSpotifyPlaylist(payload.playlistID, token);

  // If we were able to create the external tracks, send request off to migrations service
  if (playlistExternalTracks) {
    console.log("Sending request to migrations service!");

    // Create the migrations payload, this specifies where we should transfer tracks to, and what tracks we should transfer
    const migrationsPayload: MigrationsPlaylistTransferRequestBody = {
      destination: {
        platform: payload.destinationPlatform as Platforms,
        playlist_id: "PUT_A_DESTINATION_PLAYLIST_ID_HERE",
      },
      tracks: playlistExternalTracks,
    };

    // Create auth instance
    const auth = new google.auth.GoogleAuth();

    // Create a client with an ID token issued to the target audience
    const client = await auth.getIdTokenClient(
      process.env.MIGRATIONS_TARGET_AUDIENCE!
    );

    // Use client to send request to migrations service
    const migrationsRequest = await client.request({
      url: `${process.env.MIGRATIONS_BASE_URL}api/transfer/to-${payload.destinationPlatform}`,

      method: "POST",
      headers: {
        idtoken: idToken,
        destinationPlatformAccessToken:
          "PUTANACCESSTOKENHEREFORTHEDESTINATIONPLATFORM",
        uid: payload.uid,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(migrationsPayload),
    });

    const migrationsResponse = await migrationsRequest.data;

    if (migrationsRequest) {
      console.log("Migrations request was successful");
      console.log("Operation ID of transfer: ", migrationsResponse);

      return new NextResponse(
        JSON.stringify({
          status: "Successfully started transfer",
          migrationsResponse,
        }),
        { status: 200 }
      );
    }
  }
}
