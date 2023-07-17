import { NextRequest, NextResponse } from "next/server";
import { writeSpotifyToken } from "@/app/firebase/SpotifyTokens";
import { Buffer } from "node:buffer";
import { GetBaseUrl } from "@/app/utility/GetBaseUrl";

export async function GET(req: NextRequest, res: NextResponse) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const buffer = Buffer.from(
    `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
  ).toString("base64");

  // Request access token
  const authOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + buffer,
    },
    body: new URLSearchParams({
      code: code!,
      redirect_uri: `${GetBaseUrl()}/api/callback`,
      grant_type: "authorization_code",
    }),
  };

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    authOptions
  );

  if (response.ok && state) {
    // Our access token
    const accessToken = await response.json();

    console.log(state);
    // FLOW FOR COMMITING SPOTIFY ACCESS TOKEN TO DATABASE

    // Write access token to database using the state provided by the user as a temporary key
    writeSpotifyToken(state, accessToken);

    console.log(`Got access token for a user ${JSON.stringify(accessToken)}`);

    const params = new URLSearchParams();
    params.append("tempstate", state);
    params.append("at", JSON.stringify(accessToken));

    return NextResponse.redirect(`${GetBaseUrl()}?` + params, {
      status: 307,
    });
  }
}
