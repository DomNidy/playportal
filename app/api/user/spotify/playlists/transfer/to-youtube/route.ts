import { IdTokenIsValid } from "@/lib/auth/Authorization";
import { getSpotifyToken } from "@/lib/auth/SpotifyTokens";
import { getYoutubeToken } from "@/lib/auth/YoutubeTokens";
import { Platforms } from "@/definitions/Enums";
import {
  ExternalTrack,
  MigrationsPlaylistTransferRequestBody,
} from "@/definitions/MigrationService";
import { SpotifyAccessToken } from "@/definitions/SpotifyInterfaces";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { getExternalTracksFromSpotifyPlaylist } from "@/lib/fetching/CreateExternalTracks";
import { createNotificationForUUID } from "@/lib/CreateNotification";
import { randomUUID } from "crypto";

type PlaylistTransferRequestBody = {
  uid: string;
  playlistTitle: string;
  playlistID: string;
  destinationPlatform: string;
  destinationPlaylistID: string;
  destinationPlaylistTitle: string;
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
  const spotifyToken = await getSpotifyToken(payload.uid);

  // If we could not retreive a token, return
  if (!spotifyToken) {
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

  // Get youtube access token
  const youtubeToken = await getYoutubeToken(payload.uid);

  // If we could not retreive a token, return
  if (!youtubeToken) {
    return new NextResponse(
      JSON.stringify({
        error:
          "Please authenticate your youtube account, your UID does not have a youtube access token!",
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Create external tracks from spotify songs
  const playlistExternalTracks: ExternalTrack[] | undefined =
    await getExternalTracksFromSpotifyPlaylist(
      payload.playlistID,
      spotifyToken as SpotifyAccessToken
    );

  // Generate operation ID
  const operationID = Buffer.from(randomUUID()).toString("base64url");

  // If we were able to create the external tracks, send request off to migrations service
  if (playlistExternalTracks) {
    // Create the migrations payload, this specifies where we should transfer tracks to, and what tracks we should transfer
    const migrationsPayload: MigrationsPlaylistTransferRequestBody = {
      origin: {
        platform: Platforms.SPOTIFY,
        playlist_title: payload.playlistTitle,
        playlist_id: payload.playlistID,
      },
      destination: {
        platform: payload.destinationPlatform as Platforms,
        playlist_title: payload.destinationPlaylistTitle,
        playlist_id: payload.destinationPlaylistID,
      },
      tracks: playlistExternalTracks,
      operationID: operationID,
    };

    // Create auth instance
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.FIREBASE_SERVICE_ACCOUNT_TYPE!,
        token_url: process.env.FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
        quota_project_id: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID!,
        private_key: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY!,
        client_email: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
        universe_domain: process.env.FIREBASE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN,
      },
    });

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
        destinationPlatformAccessToken: JSON.stringify(
          await getYoutubeToken(payload.uid, true)
        ),
        uid: payload.uid,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(migrationsPayload),
    });

    console.log("Migrations request was sent");

    // Create notification that the transfer started
    createNotificationForUUID(payload.uid, {
      createdAtMS: Date.now(),
      id: randomUUID(),
      title: "Starting playlist transfer to youtube!",
      message: `We are now transfering your playlist "${payload.playlistTitle}" to YouTube. Sit tight!`,
      recipientUUID: payload.uid,
      seen: false,
      type: "success",
      shouldPopup: true,
    });

    return new NextResponse(
      JSON.stringify({
        status: "Sent request to transfer playlist to migrations service",
        operationID: operationID,
      }),
      { status: 200 }
    );
  }
}
