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
      redirect_uri: `${GetBaseUrl()}api/user/spotify/token/callback`,
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
    // The spotify accesss token expires_in parameter is written in seconds
    // Here we are converting it to miliseconds, then we are adding the current time in ms to it
    // With this we can simply check if(accessToken.expires_in < Date.now()) to see if our token is expired
    accessToken.expires_in = accessToken?.expires_in * 1000 + Date.now();

    // Write access token to database using the state provided by the user as a temporary key
    await writeSpotifyToken(state, accessToken, true);



    const params = new URLSearchParams();
    params.append("ts", state);
    params.append("at", JSON.stringify(accessToken));

    return NextResponse.redirect(`${GetBaseUrl()}/dashboard?` + params, {
      status: 307,
    });
  }
}
