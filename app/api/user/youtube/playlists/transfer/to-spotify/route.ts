import { IdTokenIsValid } from "@/lib/auth/Authorization";
import { getSpotifyToken } from "@/lib/auth/SpotifyTokens";
import { getYoutubeToken } from "@/lib/auth/YoutubeTokens";
import {
  ExternalTrack,
  MigrationsPlaylistTransferRequestBody,
} from "@/definitions/MigrationService";
import { NextRequest, NextResponse } from "next/server";
import { YoutubeAccessToken } from "@/definitions/YoutubeInterfaces";
import { google, youtube_v3 } from "googleapis";
import { track } from "@vercel/analytics/react";
import { Platforms } from "@/definitions/Enums";

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

  // TODO: Implement this
  // Create external tracks from youtube songs
  const playlistExternalTracks: ExternalTrack[] | undefined =
    await getExternalTracksFromYoutubePlaylist(
      payload.playlistID,
      youtubeToken as YoutubeAccessToken
    );

  console.log(JSON.stringify(playlistExternalTracks), "returned");

  if (playlistExternalTracks) {
    console.log("Sending request to migrations service!");

    const migrationsPayload: MigrationsPlaylistTransferRequestBody = {
      origin: {
        platform: Platforms.YOUTUBE,
        playlist_id: payload.playlistID,
        playlist_title: payload.playlistTitle,
      },
      destination: {
        platform: Platforms.SPOTIFY,
        playlist_id: payload.destinationPlaylistID,
        playlist_title: payload.destinationPlaylistTitle,
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
          await getSpotifyToken(payload.uid, true)
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

/**
 * Creates external track objects from a youtube playlist
 * @param {any} playlistID :string
 * @param {any} accessToken `YoutubeAccessToken`
 * @returns {any} `ExternalTrack[]`
 */

async function getExternalTracksFromYoutubePlaylist(
  playlistID: string,
  accessToken: YoutubeAccessToken
): Promise<ExternalTrack[] | undefined> {
  try {
    // Create youtube api client
    const youtube = google.youtube("v3");

    // This is an array of all our playlist requests, as youtube has a maxresults of 50 per request
    // Each request is stored in this array.
    const allRequestPages: youtube_v3.Schema$PlaylistItemListResponse[] = [];

    // Request the playlist items

    const initialPlaylistRequest = await youtube.playlistItems.list({
      part: ["snippet"],
      access_token: accessToken.access_token,
      playlistId: playlistID,
      maxResults: 3,
    });

    let nextPageToken = initialPlaylistRequest.data.nextPageToken;

    // Add the initial request to request pages array
    allRequestPages.push(initialPlaylistRequest.data);

    // Check if we have more data to fetch (if a nextPageToken exists)
    while (nextPageToken) {
      console.log(
        "We have a next page token, sending out another request",
        nextPageToken
      );
      const playlistRequest = await youtube.playlistItems.list({
        part: ["snippet"],
        access_token: accessToken.access_token,
        playlistId: playlistID,
        pageToken: nextPageToken,
        maxResults: 3,
      });

      allRequestPages.push(playlistRequest.data);

      nextPageToken = playlistRequest.data.nextPageToken;
    }

    console.log(`All request pages ${JSON.stringify(allRequestPages)} array.`);

    // try to convert tracks into `SpotifyPlaylistExternalIDS` object
    //const tracks = JSON.parse(response);

    let playlistExternalTracks: ExternalTrack[] | undefined = [];

    for (let i = 0; i < allRequestPages.length; i++) {
      allRequestPages[i].items?.forEach((item) => {
        playlistExternalTracks?.push({
          // We are only reading the artist info from the first item in the array
          // There could be multiple artists, however this seems fine
          artist: {
            id: item.snippet?.channelId!,
            name: item.snippet?.channelTitle!,
          },
          title: item.snippet?.title!,
          platform_of_origin: "youtube",
          platform_id: item.id!,
          // As of right now, we have no way of getting external ids from youtube tracks, so we just pass an empty object
          external_ids: {},
          description: item.snippet?.description!,
          publishedAt: item.snippet?.publishedAt!,
        });
      });
    }

    playlistExternalTracks?.forEach((track, idx) =>
      console.log(`Track ${idx}: ${JSON.stringify(track)}\n\n`)
    );

    return playlistExternalTracks;
  } catch (err) {
    console.log(
      `An error occured while creating external tracks from youtube playlist: ${JSON.stringify(
        err
      )}`
    );
  }
}
