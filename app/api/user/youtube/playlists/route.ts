import { IdTokenIsValid } from "@/app/auth/Authorization";
import { getYoutubeToken } from "@/app/auth/YoutubeTokens";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest, res: NextResponse) {
  const id_token = req.headers.get("idtoken") as string;
  const uid = req.nextUrl.searchParams.get("uid");

  const limit = req.nextUrl.searchParams.get("limit")
    ? req.nextUrl.searchParams.get("limit")
    : 20;

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

  const token = await getYoutubeToken(uid);

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

  const youtube = google.youtube("v3");
  const playlists = await youtube.playlists.list({
    mine: true,
    access_token: token?.access_token,
    maxResults: Number(limit),
    part: ["contentDetails", "id", "player", "snippet", "status"],
  });

  console.log(JSON.stringify(playlists), " got playlists");
  return new NextResponse(JSON.stringify(playlists), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
