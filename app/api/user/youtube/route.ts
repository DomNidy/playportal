import { getYoutubeToken } from "@/app/firebase/YoutubeTokens";
import { GoogleApis, google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

// TODO: Finish implementing this
export async function GET(req: NextRequest, res: NextResponse) {
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

  const youtubeAccessToken = await getYoutubeToken(uid);

  console.log("Got youtube access token", youtubeAccessToken);

  // Get instance of youtube api
  const youtube = await google.youtube("v3").channels.list({
    access_token: youtubeAccessToken?.access_token,
    part: ["status", "id"],
    mine: true,
  });

  // TODO: We also need to figure out a more secure way of making api requests, technically a user could make requests on behalf of another user simply with their UID
  // TODO: We should probably generate a session token, then verify if it is valid before we make any requests
  // TODO: Figure out how to read this response, we need to get a channel name and profile picture for a channel, then return that to the user
  return new NextResponse(JSON.stringify(youtube), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
