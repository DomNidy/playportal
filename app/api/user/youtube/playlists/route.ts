import { IdTokenIsValid } from "@/lib/auth/Authorization";
import { getYoutubeToken } from "@/lib/auth/YoutubeTokens";
import { YoutubeAccessToken } from "@/definitions/YoutubeInterfaces";
import { google, youtube_v3 } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const id_token = req.headers.get("idtoken") as string;
  const uid = req.nextUrl.searchParams.get("uid");

  const limit = req.nextUrl.searchParams.get("limit")
    ? req.nextUrl.searchParams.get("limit")
    : 50;

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

  const token = (await getYoutubeToken(uid)) as YoutubeAccessToken;

  // If we could not retreive a token, return an error response
  if (!token) {
    return new NextResponse(
      JSON.stringify({
        error: "Please connect your youtube account",
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Create youtube api client
  const youtube = google.youtube("v3");

  // Store all the playlist responses from youtube (incase we need to fetch multiple times)
  const allPlaylistResponses: youtube_v3.Schema$PlaylistListResponse[] = [];

  const initialResponse = await youtube.playlists.list({
    mine: true,
    access_token: token?.access_token,
    maxResults: 15,
    part: ["contentDetails", "id", "player", "snippet", "status"],
  });

  // If the intial response has items in it, add it to allPlaylistResponses array
  if (initialResponse.data.items) {
    allPlaylistResponses.push(initialResponse.data);
  }

  // While the most recent request in our allPlaylistResponses array has a next page token, fetch the next page
  while (allPlaylistResponses && !!allPlaylistResponses.at(-1)?.nextPageToken) {
    // Request the next page token

    const response = await youtube.playlists.list({
      mine: true,
      access_token: token.access_token,
      maxResults: 15,
      pageToken: allPlaylistResponses.at(-1)?.nextPageToken!,
      part: ["contentDetails", "id", "player", "snippet", "status"],
    });

    // If the response has items, add it to the array
    if (response.data.items) {
      allPlaylistResponses.push(response.data);
    }
    // If there are no items in the array, break out of the loop
    else {
      break;
    }
  }

  return new NextResponse(JSON.stringify(allPlaylistResponses), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
