import { IdTokenIsValid } from "@/lib/auth/Authorization";
import { getYoutubeToken } from "@/lib/auth/YoutubeTokens";
import { YoutubeAccessToken } from "@/definitions/YoutubeInterfaces";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  const id_token = req.headers.get("idtoken") as string;
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  const playlistID = searchParams.get("playlistID");

  if (!uid) {
    return new NextResponse("Request needs a UID", {
      status: 400,
    });
  }

  if (!playlistID) {
    return new NextResponse("Request needs a playlist ID", {
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

  // TODO: Request all items in the playlist instead of just the first 50
  // TODO: https://developers.google.com/youtube/v3/docs/playlistItems/list
  const itemsRequest = youtube.playlistItems.list({
    part: ["snippet", "contentDetails"],
    playlistId: playlistID,
    maxResults: 50,
    access_token: token.access_token,
  });

  const playlistItems = (await itemsRequest).data;
  console.log(playlistItems);

  const videoRequest = youtube.videos.list({
    part: ["snippet", "contentDetails"],
    id: ["627cAumD6x0"],
  });

  return new NextResponse(JSON.stringify(playlistItems), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
