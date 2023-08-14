import { IdTokenIsValid } from "@/lib/auth/Authorization";
import { getSpotifyToken } from "@/lib/auth/SpotifyTokens";
import { getYoutubeToken } from "@/lib/auth/YoutubeTokens";
import { Platforms } from "@/definitions/Enums";
import {
  ExternalTrack,
  MigrationsPlaylistTransferRequestBody,
} from "@/definitions/MigrationService";
import { SpotifyAccessToken } from "@/definitions/SpotifyInterfaces";
import { getExternalTracksFromSpotifyPlaylist } from "@/lib/fetching/FetchPlaylists";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

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
  if (!spotifyToken) {
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
  const playlistExternalTracks: ExternalTrack[] =
    await getExternalTracksFromSpotifyPlaylist(
      payload.playlistID,
      spotifyToken as SpotifyAccessToken
    );

  // If we were able to create the external tracks, send request off to migrations service
  if (playlistExternalTracks) {
    console.log("Sending request to migrations service!");

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