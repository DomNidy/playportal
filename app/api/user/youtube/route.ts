import { IdTokenIsValid } from "@/app/auth/Authorization";
import { getYoutubeToken } from "@/app/auth/YoutubeTokens";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

// TODO: Finish implementing this
export async function POST(req: NextRequest, res: NextResponse) {
  const id_token = req.headers.get("idtoken") as string;
  const uid = req.nextUrl.searchParams.get("uid");

  // If we were not provided with a UID in the request
  if (!uid) {
    return new NextResponse(
      JSON.stringify({
        error:
          "No UID was provided in api request, cannot fetch profile without it!",
      }),
      { status: 400 }
    );
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
  const youtubeAccessToken = await getYoutubeToken(uid);

  console.log("Got youtube access token", youtubeAccessToken);

  // Get instance of youtube api
  const youtube = await google.youtube("v3").channels.list({
    access_token: youtubeAccessToken?.access_token,
    part: ["status", "id", "snippet"],
    mine: true,
  });

  return new NextResponse(JSON.stringify(youtube), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
